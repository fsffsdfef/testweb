import BaseRequest from '@/service'

export interface PeriodicRunRecord {
    runAt: string
    status: 'success' | 'failure'
    taskId: string
    msg?: string
    data?: {
        pass?: number
        global?: Record<string, any>
        info?: Record<string, any>[]
        suits?: Record<string, any>[]
        errors?: string[]
        suitID?: number | string
        suitName?: string
        [key: string]: any
    }
}

export function task(queryInfo?: any) {
    return BaseRequest({
        url: 'test',
        method: 'POST',
        data: queryInfo,
        showMessage: false,
    })
}

export function taskAsync(queryInfo?: any) {
    return BaseRequest<{ taskId: string; suitId?: string; suitIds?: number[]; caseId?: string }>({
        url: 'test/async',
        method: 'POST',
        data: queryInfo,
        showMessage: false,
    })
}

export function getPeriodicTaskRunHistory(id: number | string) {
    return BaseRequest<{ list: PeriodicRunRecord[] }>({
        url: 'task/runHistory',
        method: 'POST',
        data: { id },
        showMessage: false,
    })
}

export function reqRun(queryInfo: any) {
    return BaseRequest({
        url: 'reqRun',
        method: 'POST',
        data: queryInfo,
    })
}