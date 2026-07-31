export interface SuitRunTabItem {
    key: string
    label: string
    pass?: number | string
    data: Record<string, any>
}

/** 统一运行结果结构（兼容 WS / Redis / 接口多层嵌套） */
export function normalizeRunData(data?: Record<string, any> | null): Record<string, any> {
    if (!data || typeof data !== 'object') return {}

    let current: any = data

    // 最多解包 2 层 { data: { suits/info } }
    for (let i = 0; i < 2; i++) {
        if (
            current?.data &&
            typeof current.data === 'object' &&
            !Array.isArray(current.data) &&
            (Array.isArray(current.data.suits) || Array.isArray(current.data.info))
        ) {
            current = current.data
        } else {
            break
        }
    }

    // suits 被序列化成字符串时解析
    if (typeof current.suits === 'string') {
        try {
            current = { ...current, suits: JSON.parse(current.suits) }
        } catch {
            // ignore
        }
    }

    if (typeof current.info === 'string') {
        try {
            current = { ...current, info: JSON.parse(current.info) }
        } catch {
            // ignore
        }
    }

    return current
}

/** 是否套件运行结果（单套件 / 多套件） */
export function isSuitRunData(data?: Record<string, any> | null): boolean {
    const d = normalizeRunData(data)
    return (
        (Array.isArray(d.suits) && d.suits.length > 0) ||
        Array.isArray(d.info)
    )
}

/** 是否单用例运行结果 */
export function isCaseRunData(data?: Record<string, any> | null): boolean {
    const d = normalizeRunData(data)
    return !!d.req
}

/** 将运行结果解析为 tab 列表 */
export function parseSuitRunTabs(data?: Record<string, any> | null): SuitRunTabItem[] {
    const d = normalizeRunData(data)
    if (!d || typeof d !== 'object') return []

    if (Array.isArray(d.suits) && d.suits.length > 0) {
        return d.suits.map((suit: Record<string, any>, index: number) => {
            const normalizedSuit = normalizeRunData(suit)
            const suitId = normalizedSuit.suitID ?? normalizedSuit.suitId ?? index
            return {
                // 同一 suitId 可能出现多次，必须带 index 保证 el-tabs name 唯一
                key: `${suitId}_${index}`,
                label: normalizedSuit.suitName ? String(normalizedSuit.suitName) : `套件 ${suitId}`,
                pass: normalizedSuit.pass,
                data: normalizedSuit,
            }
        })
    }

    if (Array.isArray(d.info)) {
        const suitId = d.suitID ?? d.suitId ?? '0'
        return [{
            key: String(suitId),
            label: d.suitName ? String(d.suitName) : `套件 ${suitId}`,
            pass: d.pass,
            data: d,
        }]
    }

    return []
}

/** 历史列表「通过率」展示 */
export function formatRunPass(data?: Record<string, any> | null): string {
    const d = normalizeRunData(data)
    if (!d || typeof d !== 'object') return '-'

    if (Array.isArray(d.suits) && d.suits.length > 0) {
        if (d.pass != null) return `${d.pass}%`
        const passes = d.suits
            .map((s: any) => s.pass)
            .filter((p: any) => p != null)
        if (!passes.length) return '-'
        const avg = Math.round(
            passes.reduce((sum: number, p: number) => sum + Number(p), 0) / passes.length
        )
        return `${avg}%`
    }

    return d.pass != null ? `${d.pass}%` : '-'
}