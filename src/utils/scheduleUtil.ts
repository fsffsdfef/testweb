/** 运行周期选项 */
export const RUN_CYCLE_OPTIONS = [
    { label: '每天', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' },
    { label: '自定义', value: 'custom' },
]

/** 周一=1 ... 周日=0（与 celery crontab 一致） */
export const WEEK_DAY_OPTIONS = [
    { label: '周一', value: '1' },
    { label: '周二', value: '2' },
    { label: '周三', value: '3' },
    { label: '周四', value: '4' },
    { label: '周五', value: '5' },
    { label: '周六', value: '6' },
    { label: '周日', value: '0' },
]

/** 每月 1-31 日 */
export const MONTH_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1}日`,
    value: String(i + 1),
}))

export interface CronParts {
    cronMinute: string
    cronHour: string
    cronDayOfWeek: string
    cronDayOfMonth: string
    cronMonthOfYear: string
}

/** 解析运行时间 → hour/minute */
export function parseRunTime(runTime: unknown): { hour: string; minute: string } {
    if (!runTime) return { hour: '9', minute: '0' }

    if (typeof runTime === 'string') {
        const text = runTime.trim()
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) {
            const [h, m] = text.split(':')
            return { hour: String(Number(h)), minute: String(Number(m)) }
        }
        const d = new Date(text)
        if (!Number.isNaN(d.getTime())) {
            return { hour: String(d.getHours()), minute: String(d.getMinutes()) }
        }
    }

    if (runTime instanceof Date && !Number.isNaN(runTime.getTime())) {
        return { hour: String(runTime.getHours()), minute: String(runTime.getMinutes()) }
    }

    return { hour: '9', minute: '0' }
}

/** 表单 → cron 五段 */
export function buildCronFromRunCycle(form: Record<string, any>): CronParts {
    const runCycleType = form.runCycleType || 'daily'

    if (runCycleType === 'custom') {
        const expr = String(form.cronExpression || '').trim()
        const parts = expr.split(/\s+/).filter(Boolean)
        if (parts.length !== 5) {
            throw new Error('Cron 表达式必须是 5 段，例如：0 9 * * *')
        }
        const [minute, hour, dayOfMonth, monthOfYear, dayOfWeek] = parts
        return {
            cronMinute: minute,
            cronHour: hour,
            cronDayOfMonth: dayOfMonth,
            cronMonthOfYear: monthOfYear,
            cronDayOfWeek: dayOfWeek,
        }
    }

    const { hour, minute } = parseRunTime(form.runTime)

    if (runCycleType === 'weekly') {
        return {
            cronMinute: minute,
            cronHour: hour,
            cronDayOfWeek: String(form.runWeekDay ?? '1'),
            cronDayOfMonth: '*',
            cronMonthOfYear: '*',
        }
    }

    if (runCycleType === 'monthly') {
        return {
            cronMinute: minute,
            cronHour: hour,
            cronDayOfWeek: '*',
            cronDayOfMonth: String(form.runMonthDay ?? '1'),
            cronMonthOfYear: '*',
        }
    }

    // daily
    return {
        cronMinute: minute,
        cronHour: hour,
        cronDayOfWeek: '*',
        cronDayOfMonth: '*',
        cronMonthOfYear: '*',
    }
}

function formatRunTime(hour: string, minute: string): string {
    const h = Number(hour)
    const m = Number(minute)
    if (Number.isNaN(h) || Number.isNaN(m)) return '09:00:00'
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function isSimpleNumber(value: string): boolean {
    return /^\d+$/.test(String(value))
}

/** crontab → 表单回显 */
export function parseCrontabToRunCycle(data: Record<string, any>) {
    const minute = String(data.cronMinute ?? data.crontab?.minute ?? '0')
    const hour = String(data.cronHour ?? data.crontab?.hour ?? '9')
    const dayOfWeek = String(data.cronDayOfWeek ?? data.crontab?.day_of_week ?? '*')
    const dayOfMonth = String(data.cronDayOfMonth ?? data.crontab?.day_of_month ?? '*')
    const monthOfYear = String(data.cronMonthOfYear ?? data.crontab?.month_of_year ?? '*')

    const runTime = data.runTime || formatRunTime(hour, minute)

    // 后端已解析好 runCycleType 时直接用
    if (data.runCycleType) {
        return {
            runCycleType: data.runCycleType,
            runTime: data.runTime || runTime,
            runWeekDay: data.runWeekDay ?? dayOfWeek,
            runMonthDay: data.runMonthDay ?? dayOfMonth,
            cronExpression:
                data.cronExpression ||
                `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek}`,
        }
    }

    const hasComplex = [minute, hour, dayOfWeek, dayOfMonth, monthOfYear].some(
        (v) => !isSimpleNumber(v) && v !== '*'
    )

    if (hasComplex) {
        return {
            runCycleType: 'custom',
            runTime,
            runWeekDay: '1',
            runMonthDay: '1',
            cronExpression: `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek}`,
        }
    }

    if (dayOfWeek !== '*' && dayOfMonth === '*' && monthOfYear === '*') {
        return {
            runCycleType: 'weekly',
            runTime,
            runWeekDay: dayOfWeek,
            runMonthDay: '1',
            cronExpression: `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek}`,
        }
    }

    if (dayOfMonth !== '*' && dayOfWeek === '*' && monthOfYear === '*') {
        return {
            runCycleType: 'monthly',
            runTime,
            runWeekDay: '1',
            runMonthDay: dayOfMonth,
            cronExpression: `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek}`,
        }
    }

    if (dayOfWeek === '*' && dayOfMonth === '*' && monthOfYear === '*') {
        return {
            runCycleType: 'daily',
            runTime,
            runWeekDay: '1',
            runMonthDay: '1',
            cronExpression: `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek}`,
        }
    }

    return {
        runCycleType: 'custom',
        runTime,
        runWeekDay: '1',
        runMonthDay: '1',
        cronExpression: `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek}`,
    }
}

/** 写入 formItem */
export function applyRunCycleToForm(formItem: Record<string, any>, data: Record<string, any>) {
    const parsed = parseCrontabToRunCycle(data)
    formItem.runCycleType = parsed.runCycleType
    formItem.runTime = parsed.runTime
    formItem.runWeekDay = parsed.runWeekDay
    formItem.runMonthDay = parsed.runMonthDay
    formItem.cronExpression = parsed.cronExpression
}

const WEEK_DAY_LABEL_MAP: Record<string, string> = {
    '0': '周日',
    '1': '周一',
    '2': '周二',
    '3': '周三',
    '4': '周四',
    '5': '周五',
    '6': '周六',
}

const RUN_CYCLE_LABEL_MAP: Record<string, string> = {
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    custom: '自定义',
}

function formatRunTimeShort(runTime?: string | null): string {
    if (!runTime) return '09:00'
    const text = String(runTime)
    return /^\d{1,2}:\d{2}/.test(text) ? text.slice(0, 5) : text
}

function formatIntervalSchedule(row: Record<string, any>): string | null {
    const schedule = row.schedule ? String(row.schedule) : ''
    const intervalDesc = row.intervalDesc ? String(row.intervalDesc) : ''
    const hasInterval = row.interval != null && row.interval !== '' && !row.crontab
    const isIntervalSchedule =
        hasInterval ||
        row.runCycleType === 'interval' ||
        /every\s+(day|hour|minute|second)/i.test(schedule) ||
        schedule.startsWith('固定间隔')

    if (!isIntervalSchedule) return null

    if (schedule.startsWith('固定间隔')) return schedule
    if (schedule) return `固定间隔 ${schedule}`
    if (intervalDesc) return `固定间隔 ${intervalDesc}`
    return '固定间隔'
}

/** 列表「运行策略」展示文案 */
export function formatScheduleDesc(row: Record<string, any>): string {
    if (!row || typeof row !== 'object') return '-'

    // interval 调度：直接展示，不推断 9:00
    const intervalText = formatIntervalSchedule(row)
    if (intervalText) return intervalText

    // 后端 crontab 已是中文可读文案
    if (
        row.schedule &&
        /^(每天|每周|每月|自定义)\s/.test(String(row.schedule))
    ) {
        return String(row.schedule)
    }

    // 没有 crontab 字段时不应推断「每天 9:00」
    if (!row.crontab && !row.cronMinute && !row.cronHour) {
        return row.schedule ? String(row.schedule) : '-'
    }

    const cycleType = row.runCycleType || parseCrontabToRunCycle(row).runCycleType
    const parsed = parseCrontabToRunCycle(row)
    const runTime = formatRunTimeShort(row.runTime || parsed.runTime)

    if (cycleType === 'daily') {
        return `每天 ${runTime}`
    }
    if (cycleType === 'weekly') {
        const weekVal = String(row.runWeekDay ?? parsed.runWeekDay ?? '1')
        const weekLabel = WEEK_DAY_LABEL_MAP[weekVal] ?? `周${weekVal}`
        return `每周 ${weekLabel} ${runTime}`
    }
    if (cycleType === 'monthly') {
        const day = row.runMonthDay ?? parsed.runMonthDay ?? '1'
        return `每月 ${day}日 ${runTime}`
    }

    const cronExpression = row.cronExpression ?? parsed.cronExpression ?? row.schedule ?? '-'
    return `自定义 ${cronExpression}`
}