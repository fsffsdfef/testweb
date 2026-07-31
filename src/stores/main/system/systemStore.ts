import { defineStore } from 'pinia'
import { Add, Del, Update, getPageList, getOperator } from '@/api/main/system/api.ts'
import { getPeriodicTaskRunHistory, type PeriodicRunRecord } from '@/api/main/task/api.ts'
import { taskAsync } from '@/api/main/task/api.ts'
import { useWsStore } from '@/stores/ws/wsStore'
import type { WSMessage } from '@/composables/useWebSocket'
import { ElMessage } from 'element-plus'
import { normalizeRunData, isSuitRunData } from '@/utils/suitRunUtil.ts'

type TaskStatus = 'running' | 'success' | 'error'

interface TaskState {
    status: TaskStatus
    data?: Record<string, any>
    msg?: string
}

const systemStore = defineStore('system', {
    state: () => ({
        TableList: [],
        pageCount: 0,
        taskResultMap: {} as Record<string, TaskState>,
        showData: {} as Record<string, any>,
        taskRunning: false,
        taskProgress: null as { current: number; total: number } | null,
        operatorMap: {},
        historyMode: false,
        periodicTaskHistoryList: [] as PeriodicRunRecord[],
    }),
    actions: {
        async viewPeriodicTaskHistory(data: any): Promise<boolean> {
            const id = data?.id
            if (!id) {
                ElMessage.warning('缺少任务ID')
                return false
            }
            try {
                const res = await getPeriodicTaskRunHistory(id)
                const raw = res.data
                const list = Array.isArray(raw) ? raw : (raw?.list ?? [])
                if (!list.length) {
                    ElMessage.warning('暂无运行记录')
                    return false
                }

                this.periodicTaskHistoryList = list.map((item: PeriodicRunRecord) => ({
                    ...item,
                    data: item.data ? normalizeRunData(item.data) : item.data,
                }))
                this.historyMode = true

                const first =
                    this.periodicTaskHistoryList.find((item) => item.data) ??
                    this.periodicTaskHistoryList[0]
                this.showData = normalizeRunData(first?.data ?? {})
                return true
            } catch (e: any) {
                ElMessage.error(e?.message ?? '查询运行记录失败')
                return false
            }
        },

        resetPeriodicTaskHistory() {
            this.historyMode = false
            this.periodicTaskHistoryList = []
            this.showData = {}
        },

        async getTableListAction(pageName: string, data?: any) {
            try {
                const res = await getPageList(pageName, data)
                this.TableList = res?.data?.list ?? []
                this.pageCount = res?.data?.count ?? 0
                return this.TableList
            } catch (e: any) {
                this.TableList = []
                this.pageCount = 0
                ElMessage.error(e?.message ?? '列表加载失败')
                return []
            }
        },

        async addAction(pageName: string, data: any) {
            await Add(pageName, data)
            this.getTableListAction(pageName)
        },

        async delAction(pageName: string, data: any) {
            await Del(pageName, data)
            this.getTableListAction(pageName)
        },

        async updateAction(pageName: string, data: any) {
            await Update(pageName, data)
            this.getTableListAction(pageName)
        },

        _getTaskKey(data: any) {
            return String(data.suitId ?? data.caseId ?? '')
        },

        _listenTask(taskId: string, taskKey: string, options?: { showLoading?: boolean }) {
            const wsStore = useWsStore()
            const showLoading = options?.showLoading ?? false

            if (showLoading) {
                this.taskRunning = true
                this.taskProgress = null
                this.showData = {}
            }

            this.taskResultMap[taskKey] = { status: 'running' }

            return new Promise<Record<string, any>>((resolve, reject) => {
                const handler = (msg: WSMessage) => {
                    if (showLoading && msg.type === 'progress' && msg.progress) {
                        this.taskProgress = msg.progress
                    }

                    if (msg.type === 'success' && msg.data) {
                        const normalized = normalizeRunData(msg.data as Record<string, any>)
                        this.historyMode = false
                        this.taskResultMap[taskKey] = { status: 'success', data: normalized }
                        this.showData = normalized

                        if (showLoading) {
                            this.taskRunning = false
                        }
                        wsStore.unsubscribeTask(taskId, handler)
                        resolve(normalized)
                    }

                    if (msg.type === 'error') {
                        this.taskResultMap[taskKey] = {
                            status: 'error',
                            msg: msg.msg ?? '执行失败',
                        }
                        if (showLoading) {
                            this.taskRunning = false
                        }
                        wsStore.unsubscribeTask(taskId, handler)
                        ElMessage.error(msg.msg ?? '执行失败')
                        reject(new Error(msg.msg ?? '执行失败'))
                    }
                }

                wsStore.subscribeTask(taskId, handler)
            })
        },

        async taskAction(data: any) {
            const taskKey = this._getTaskKey(data)
            const res = await taskAsync(data)
            return this._listenTask(res.data.taskId, taskKey, { showLoading: true })
        },

        async submitTaskAction(data: any) {
            const taskKey = this._getTaskKey(data)
            if (!taskKey) {
                ElMessage.warning('缺少套件ID')
                return
            }
            if (this.taskResultMap[taskKey]?.status === 'running') {
                ElMessage.warning('任务执行中，请稍后查看')
                return
            }

            try {
                const res = await taskAsync(data)
                ElMessage.success('任务已提交')
                this._listenTask(res.data.taskId, taskKey, { showLoading: false })
                    .then(() => {
                        ElMessage.success('套件执行完成，可点击详情查看')
                    })
                    .catch(() => {})
            } catch (e: any) {
                this.taskResultMap[taskKey] = {
                    status: 'error',
                    msg: e?.message ?? '任务提交失败',
                }
                ElMessage.error(e?.message ?? '任务提交失败')
            }
        },

        viewTaskDetail(data: any): boolean {
            const taskKey = this._getTaskKey(data)
            const state = this.taskResultMap[taskKey]

            if (!state) {
                ElMessage.warning('暂无运行结果，请先运行套件')
                return false
            }
            if (state.status === 'running') {
                ElMessage.warning('任务执行中，请稍后查看')
                return false
            }
            if (state.status === 'error') {
                ElMessage.error(state.msg ?? '执行失败')
                return false
            }
            if (state.status === 'success' && state.data) {
                const normalized = normalizeRunData(state.data)
                if (!isSuitRunData(normalized)) {
                    ElMessage.warning('运行结果格式异常，无法展示套件详情')
                    console.warn('viewTaskDetail invalid data:', normalized)
                    return false
                }

                this.historyMode = false
                this.showData = normalized
                return true
            }

            ElMessage.warning('暂无运行结果，请先运行套件')
            return false
        },

        async getOperatorAction() {
            const result = await getOperator()
            this.operatorMap = result.data
            return result.data
        },
    },
})

export default systemStore