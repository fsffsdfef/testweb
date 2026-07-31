import { ref } from 'vue'

export interface WSMessage {
    type: 'connected' | 'start' | 'progress' | 'success' | 'error' | 'notify'
    taskId?: string
    suitId?: string | number
    caseId?: string | number
    userId?: string
    data?: Record<string, unknown>
    msg?: string
    progress?: { current: number; total: number }
    [key: string]: unknown
}

export interface UseWebSocketOptions {
    url: string
    token?: string
    reconnect?: boolean
    reconnectInterval?: number
    heartbeatInterval?: number
    autoConnect?: boolean
    onMessage?: (data: WSMessage) => void
    onOpen?: () => void
    onClose?: () => void
    onError?: (e: Event) => void
}

export function useWebSocket(options: UseWebSocketOptions) {
    const {
        url,
        token,
        reconnect = true,
        reconnectInterval = 3000,
        heartbeatInterval = 30000,
        autoConnect = false,
        onMessage,
        onOpen,
        onClose,
        onError,
    } = options

    const connected = ref(false)
    let ws: WebSocket | null = null
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let manualClose = false

    const buildUrl = () => {
        const sep = url.includes('?') ? '&' : '?'
        return token ? `${url}${sep}token=${encodeURIComponent(token)}` : url
    }

    const clearTimers = () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer)
        if (reconnectTimer) clearTimeout(reconnectTimer)
        heartbeatTimer = null
        reconnectTimer = null
    }

    const startHeartbeat = () => {
        heartbeatTimer = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
                ws.send('ping')
            }
        }, heartbeatInterval)
    }

    const connect = () => {
        manualClose = false
        clearTimers()
        ws = new WebSocket(buildUrl())

        ws.onopen = () => {
            connected.value = true
            startHeartbeat()
            onOpen?.()
        }

        ws.onmessage = (event) => {
            if (event.data === 'pong') return
            try {
                const data = JSON.parse(event.data) as WSMessage
                onMessage?.(data)
            } catch {
                console.warn('非 JSON 消息:', event.data)
            }
        }

        ws.onerror = (e) => onError?.(e)

        ws.onclose = () => {
            connected.value = false
            clearTimers()
            onClose?.()
            if (reconnect && !manualClose) {
                reconnectTimer = setTimeout(connect, reconnectInterval)
            }
        }
    }

    const send = (data: string | object) => {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(typeof data === 'string' ? data : JSON.stringify(data))
        }
    }

    const close = () => {
        manualClose = true
        clearTimers()
        ws?.close()
        ws = null
        connected.value = false
    }

    if (autoConnect) {
        connect()
    }

    return { connected, send, close, reconnect: connect, connect }
}