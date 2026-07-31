<script setup lang="ts">
import systemStore from '@/stores/main/system/systemStore.ts'
import { storeToRefs } from 'pinia'
import type { reqActionProps } from '@/common/module/table/drawer/type.ts'
import { ref, computed } from 'vue'
import JsonTree from '@/common/jsonTree/JsonTree.vue'
import { copy } from '@/utils/copy.ts'
import { DocumentRemove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { PeriodicRunRecord } from '@/api/main/task/api.ts'
import MultiSuitRunDetailPanel from '@/common/module/table/drawer/MultiSuitRunDetailPanel.vue'
import {
  formatRunPass,
  normalizeRunData,
  isSuitRunData,
  isCaseRunData,
} from '@/utils/suitRunUtil.ts'

const props = defineProps<reqActionProps>()
const system = systemStore()
const { showData, taskRunning, taskProgress, historyMode, periodicTaskHistoryList } = storeToRefs(system)
const moduleShow = ref(false)
const loading = ref(false)
const selectedHistoryKey = ref('')

const normalizedShowData = computed(() => normalizeRunData(showData.value))
const isSuitDetail = computed(() => !historyMode.value && isSuitRunData(normalizedShowData.value))
const isCaseDetail = computed(() => !historyMode.value && isCaseRunData(normalizedShowData.value))

const detailRenderKey = computed(() => {
  const d = normalizedShowData.value
  const suitCount = Array.isArray(d.suits) ? d.suits.length : 0
  const infoCount = Array.isArray(d.info) ? d.info.length : 0
  return `${d.suitID ?? d.suitId ?? ''}_${suitCount}_${infoCount}_${selectedHistoryKey.value}`
})

const traceUrl = computed(() =>
    normalizedShowData.value?.trace
        ? `https://bat.fws.qa.nt.ctripcorp.com/trace/${normalizedShowData.value.trace}`
        : ''
)

function getHistoryRowKey(row: PeriodicRunRecord) {
  return `${row.taskId}_${row.runAt}`
}

function handleHistoryDrawerClose(done?: () => void) {
  moduleShow.value = false
  selectedHistoryKey.value = ''
  system.resetPeriodicTaskHistory()
  done?.()
}

function handleSuitDrawerClose(done?: () => void) {
  moduleShow.value = false
  done?.()
}

function handleCaseDrawerClose(done?: () => void) {
  moduleShow.value = false
  done?.()
}

function selectHistoryRow(row: PeriodicRunRecord) {
  selectedHistoryKey.value = getHistoryRowKey(row)
  if (row.status === 'failure') {
    ElMessage.error(row.msg || '执行失败')
    system.showData = {}
    return
  }
  if (row.data) {
    system.showData = normalizeRunData(row.data)
  } else {
    ElMessage.warning('该次运行无详情数据')
    system.showData = {}
  }
}

function selectDefaultHistoryRow() {
  const first =
      periodicTaskHistoryList.value.find(item => item.data) ??
      periodicTaskHistoryList.value[0]
  if (first) {
    selectHistoryRow(first)
  }
}

async function handleAction(data: any, action: string) {
  if (action === 'submitTaskSilent') {
    await system.submitTaskAction(data)
    return
  }

  if (action === 'viewTaskDetail') {
    if (system.viewTaskDetail(data)) {
      moduleShow.value = true
    }
    return
  }

  if (action === 'viewPeriodicTaskHistory') {
    loading.value = true
    try {
      const ok = await system.viewPeriodicTaskHistory(data)
      if (ok) {
        moduleShow.value = true
        selectDefaultHistoryRow()
      }
    } finally {
      loading.value = false
    }
    return
  }

  loading.value = true
  moduleShow.value = true
  try {
    await system.taskAction(data)
  } catch (e: any) {
    ElMessage.error(e?.message ?? '执行失败')
    moduleShow.value = false
  } finally {
    loading.value = false
  }
}

export interface ReqDataModelExpose {
  handleAction: (data: any, action: string) => void
}

defineExpose({
  handleAction,
})
</script>

<template>
  <div v-loading="loading">
    <!-- 定时任务历史 -->
    <div v-if="historyMode">
      <el-drawer
          v-model="moduleShow"
          title="定时任务运行详情"
          direction="btt"
          size="90%"
          class="detail-drawer"
          :before-close="handleHistoryDrawerClose"
      >
        <div class="history-layout">
          <div class="history-list">
            <div class="history-block-header">
              <span class="history-block-title">运行记录</span>
              <span class="history-block-badge">{{ periodicTaskHistoryList.length }} 条</span>
            </div>
            <div class="history-block-body history-block-body--list scroll-hide">
              <el-table
                  :data="periodicTaskHistoryList"
                  highlight-current-row
                  :row-key="getHistoryRowKey"
                  :current-row-key="selectedHistoryKey"
                  @row-click="selectHistoryRow"
                  style="width: 100%"
              >
                <el-table-column prop="runAt" label="执行时间" width="180" />
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag
                        :type="row.status === 'success' ? 'success' : 'danger'"
                        effect="dark"
                        round
                    >
                      {{ row.status === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="通过率" width="100">
                  <template #default="{ row }">
                    {{ formatRunPass(row.data) }}
                  </template>
                </el-table-column>
                <el-table-column prop="msg" label="备注" show-overflow-tooltip />
              </el-table>
            </div>
          </div>

          <div class="history-detail">
            <div class="history-block-header">
              <span class="history-block-title">运行详情</span>
            </div>
            <div class="history-block-body history-block-body--detail scroll-hide">
              <MultiSuitRunDetailPanel
                  :key="detailRenderKey"
                  :show-data="normalizedShowData"
              />
            </div>
          </div>
        </div>
      </el-drawer>
    </div>

    <!-- 进度条 -->
    <div v-if="taskRunning && taskProgress" style="padding: 12px">
      <el-progress
          :percentage="Math.round((taskProgress.current / taskProgress.total) * 100)"
          :stroke-width="16"
          striped
          striped-flow
      />
      <p>执行进度：{{ taskProgress.current }} / {{ taskProgress.total }}</p>
    </div>

    <!-- 套件页：运行详情 -->
    <el-drawer
        v-if="isSuitDetail"
        v-model="moduleShow"
        title="套件运行详情"
        direction="btt"
        size="90%"
        class="detail-drawer"
        :before-close="handleSuitDrawerClose"
    >
      <div class="case-detail-body scroll-hide">
        <MultiSuitRunDetailPanel
            :key="detailRenderKey"
            :show-data="normalizedShowData"
        />
      </div>
    </el-drawer>

    <!-- 用例页：运行详情 -->
    <el-drawer
        v-if="isCaseDetail"
        v-model="moduleShow"
        :title="normalizedShowData.caseName || '用例运行详情'"
        direction="btt"
        size="90%"
        class="detail-drawer"
        :before-close="handleCaseDrawerClose"
    >
      <div class="case-detail-body scroll-hide">
        <div class="basic-info">
          <span>ID：{{ normalizedShowData.caseId }}</span>
          <span>请求方法: {{ normalizedShowData.req?.method ?? '-' }}</span>
          <span>请求URL: {{ normalizedShowData.req?.url ?? '-' }}</span>
          <span>请求断言结果: </span>
          <el-tag
              size="small"
              :type="normalizedShowData.assert?.finalAssert ? 'success' : 'danger'"
              effect="dark"
              round
          >
            {{ normalizedShowData.assert?.finalAssert ? 'passed' : 'failed' }}
          </el-tag>
          <span>全局变量： {{ normalizedShowData.global }}</span>
          <span>
            日志：
            <el-link
                v-if="normalizedShowData.trace"
                type="primary"
                :href="traceUrl"
                target="_blank"
                underline
            >
              {{ normalizedShowData.trace }}
            </el-link>
            <span v-else>-</span>
          </span>
        </div>

        <div class="assert-info" v-if="normalizedShowData.assert?.assertInfo?.length">
          <div
              v-for="assert in normalizedShowData.assert.assertInfo"
              :key="assert.groupID"
              class="assert-group"
          >
            <div>
              <div>
                <H4>
                  规则组ID: {{ assert.groupID }} ||
                  <el-tag
                      size="small"
                      :type="assert.final ? 'success' : 'danger'"
                      effect="dark"
                      round
                  >
                    {{ assert.final ? 'passed' : 'failed' }}
                  </el-tag>
                </H4>
              </div>
              <div
                  v-for="express in assert.expressInfo"
                  :key="express.expressId"
                  class="express-item"
              >
                <div class="express-row">
                  <span>规则ID: {{ express.expressId }}</span>
                  <span>规则：{{ express.oper }}</span>
                  <span>规则断言结果: </span>
                  <el-tag
                      size="small"
                      :type="express.assert ? 'success' : 'danger'"
                      effect="dark"
                      round
                  >
                    {{ express.assert ? 'passed' : 'failed' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="json-container" v-if="normalizedShowData.req || normalizedShowData.res">
          <el-container class="full-height-container">
            <el-aside width="50%">
              <div class="json-section">
                <h3 class="json-title">
                  请求数据 (Request)
                  <el-icon size="20" @click="copy(normalizedShowData.req?.data)">
                    <DocumentRemove />
                  </el-icon>
                </h3>
                <div class="json-tree-wrapper">
                  <JsonTree :data="normalizedShowData.req" embedded />
                </div>
              </div>
            </el-aside>
            <el-main>
              <div class="json-section">
                <h3 class="json-title">
                  返回数据 (Response)
                  <el-icon size="20" @click="copy(JSON.stringify(normalizedShowData.res))">
                    <DocumentRemove />
                  </el-icon>
                </h3>
                <div class="json-tree-wrapper">
                  <JsonTree :data="normalizedShowData.res" embedded />
                </div>
              </div>
            </el-main>
          </el-container>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.history-layout {
  display: flex;
  gap: 16px;
  height: 100%;
  min-height: 0;
  padding: 4px;
  box-sizing: border-box;
}

.history-list {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.history-detail {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.history-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #f5f7fa 100%);
  border-bottom: 1px solid #e4e7ed;
  border-radius: 10px 10px 0 0;
  flex-shrink: 0;
}

.history-block-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 10px;
}

.history-block-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: #409eff;
  border-radius: 2px;
}

.history-block-badge {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  padding: 2px 10px;
  border-radius: 12px;
}

.history-block-body {
  flex: 1;
  min-height: 0;
  padding: 12px 16px 16px;
  box-sizing: border-box;
}

.history-block-body--detail {
  display: flex;
  flex-direction: column;
}

.history-list :deep(.el-table) {
  --el-table-border-color: #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.history-list :deep(.el-table__inner-wrapper::before) {
  display: none;
}

:deep(.detail-drawer .el-drawer__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}

.case-detail-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.basic-info {
  flex-shrink: 0;
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.assert-info {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f0f9eb;
  border-radius: 4px;
}

.assert-group {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.express-item {
  margin-left: 20px;
  margin-top: 4px;
  color: #67c23a;
  font-size: 12px;
}

.express-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}

.json-container {
  height: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.full-height-container {
  flex: 1;
  height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  align-items: stretch;
}

:deep(.el-aside),
:deep(.el-main) {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.el-aside) {
  padding-right: 12px;
}

:deep(.el-main) {
  padding: 0;
}

.json-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: white;
  overflow: hidden;
}

.json-title {
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.json-tree-wrapper {
  flex: 1;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scroll-hide {
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.scroll-hide::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>