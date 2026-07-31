import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWebSocket, type WSMessage } from '@/composables/useWebSocket'
import { localCache } from '@/utils/localcache'
import { APP_CONFIG } from '@/config/app.config'
import { ElNotification } from 'element-plus'

type MessageHandler = (msg: WSMessage) => void

export const useWsStore = defineStore('ws', () => {
    const connected = ref(false)
    const currentUserId = ref<string | null>(null)
    const handlers = new Map<string, Set<MessageHandler>>()

    let wsInstance: ReturnType<typeof useWebSocket> | null = null

    const dispatch = (taskId: string, msg: WSMessage) => {
        handlers.get(taskId)?.forEach((fn) => fn(msg))
        handlers.get('global')?.forEach((fn) => fn(msg))
    }

    const connectUserChannel = (userId: string) => {
        disconnect()
        currentUserId.value = userId
        const token = localCache.getCache('token') as string

        wsInstance = useWebSocket({
            url: `${APP_CONFIG.WS_BASE}/ws/user/${userId}/`,
            token,
            reconnect: true,
            autoConnect: true,
            onOpen: () => {
                connected.value = true
            },
            onClose: () => {
                connected.value = false
            },
            onMessage: (msg) => {
                const taskId = msg.taskId ?? 'global'
                dispatch(taskId, msg)

                if (msg.type === 'notify' || (msg.type === 'success' && !handlers.has(msg.taskId ?? ''))) {
                    ElNotification({
                        title: msg.type === 'error' ? '任务失败' : '任务通知',
                        message: msg.msg ?? '请查看详情',
                        type: msg.type === 'error' ? 'error' : 'success',
                    })
                }
            },
        })
    }

    const subscribeTask = (taskId: string, handler: MessageHandler) => {
        if (!handlers.has(taskId)) handlers.set(taskId, new Set())
        handlers.get(taskId)!.add(handler)
    }

    const unsubscribeTask = (taskId: string, handler?: MessageHandler) => {
        if (!handler) {
            handlers.delete(taskId)
            return
        }
        handlers.get(taskId)?.delete(handler)
    }

    const disconnect = () => {
        wsInstance?.close()
        wsInstance = null
        connected.value = false
        currentUserId.value = null
        handlers.clear()
    }

    return {
        connected,
        currentUserId,
        connectUserChannel,
        subscribeTask,
        unsubscribeTask,
        disconnect,
    }
})