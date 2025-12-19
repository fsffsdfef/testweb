interface propsType {
    value: string
    label: string,
    children: string,
    showPrefix: boolean,
    checkOnClickNode: boolean,
    multiple: boolean, // 多选
    emitPath: boolean, // 是否返回完整路径
    checkStrictly: boolean
}
interface CascaderOption {
    id: string | number
    name: string
    children?: CascaderOption[]
}

interface SelectedItem {
    id: string | number // 内部ID，用于列表管理
    label: string // 显示标签
    caseId: string | number // 最后选中的值
    execution_order: number
    is_first: boolean
    is_last: boolean
}

export interface CascaderType {
    suitCase: SelectedItem[],
    optionMap: CascaderOption[],
    propData: propsType
}