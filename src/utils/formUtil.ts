import { getPageList } from '@/api/main/system/api.ts'
import type { formItemType } from '@/common/types/main/type.ts'
import type { departType } from '@/api/main/system/type.ts'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const ruleFormRef = ref<FormInstance>()

export async function loadSelectOptions(data: formItemType[], optionsMap: any) {
    const selectItems = data.filter(
        item =>
            (item.type === 'select' || item.type === 'suitArgs') &&
            item.pageName &&
            !item.options   // 本地 options 的不请求接口
    )

    for (const item of selectItems) {
        if (!optionsMap[item.prop]) {
            try {
                const queryInfo =
                    item.pageName === 'suit'
                        ? { page: 1, size: 500 }
                        : undefined
                optionsMap[item.prop] = await getPageList(item.pageName, queryInfo)
            } catch (error) {
                console.error(`获取${item.prop}选项失败:`, error)
                optionsMap[item.prop] = { data: { list: [] } }
            }
        }
    }
}

export function processEmptyString(obj: any, action = 'null') {
    const result = { ...obj }

    Object.keys(result).forEach(key => {
        if (result[key] === '') {
            if (action === 'null') {
                result[key] = null
            } else if (action === 'remove') {
                delete result[key]
            }
        }
    })

    return result
}

export function sumbitAction(moduleShow: any, formItem: any, emit: any, editMode: any) {
    ruleFormRef.value?.validate((valid) => {
        if (valid) {
            moduleShow.value = !moduleShow.value
            const value = processEmptyString(formItem)
            emit('sumbitAction', editMode, value)
        } else {
            ElMessage.error('数据错误')
        }
    })
}

/** 仅套件选用例时：父级 disabled，只能选叶子（用例） */
export function markOnlyLeafSelectable(nodes: any[]): any[] {
    return nodes.map(node => {
        if (node.children?.length) {
            return {
                ...node,
                disabled: true,
                children: markOnlyLeafSelectable(node.children),
            }
        }
        return node
    })
}

/** 公共级联选项：不做 disabled，供选接口等场景使用 */
export function cascaderOptions(search: departType[], props: any) {
    return search.map(depart => ({
        id: String(depart.departId),
        name: depart.departName,
        children: (depart.apply || [])
            .filter(apply => props?.config?.search?.cascade?.apply === true)
            .map(apply => ({
                id: String(apply.applyId),
                name: apply.applyName,
                children: (apply.port || [])
                    .filter(port => props?.config?.search?.cascade?.port === true)
                    .map(port => ({
                        id: String(port.portId),
                        name: port.portName,
                        children: (port.httpcase || [])
                            .filter(httpcase => props?.config?.search?.cascade?.httpcase === true)
                            .map(httpcase => ({
                                id: String(httpcase.caseId),
                                name: httpcase.caseName,
                            })),
                    })),
            })),
    }))
}

/** 从 PeriodicTask.args 解析出套件 ID 列表 */
export function parseArgsToSuitIds(args: unknown): number[] {
    if (args == null || args === '') return []

    let parsed: any = args
    if (typeof args === 'string') {
        try {
            parsed = JSON.parse(args)
        } catch {
            return []
        }
    }
    if (!Array.isArray(parsed)) return []

    // 多套件：[[1001, 1002]]
    if (parsed.length === 1 && Array.isArray(parsed[0])) {
        return parsed[0].map((id) => Number(id)).filter((id) => !Number.isNaN(id))
    }

    // 单套件：[1001]
    return parsed.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
}

/** 根据任务类型把套件 ID 转成 args */
export function buildArgsFromSuitIds(taskCode: string, suitIds: unknown): number[] | number[][] {
    const ids = (Array.isArray(suitIds) ? suitIds : [])
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id))

    if (!ids.length) return []

    if (taskCode === 'celerys.tasks.MultiSuitRequest') {
        return [ids]
    }
    // SuitRequest 及其他：取第一个
    return [ids[0]]
}

/** 编辑时套件已删除，补一条占位选项以便回显 */
export function ensureSuitOptionsInList(
    selectedIds: (string | number)[],
    list: any[],
    key: string,
    labelField: string
) {
    const result = [...list]
    selectedIds.forEach((id) => {
        if (!result.some((row) => String(row[key]) === String(id))) {
            result.push({ [key]: id, [labelField]: `套件 ${id}` })
        }
    })
    return result
}