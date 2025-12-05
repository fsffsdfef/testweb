import type {FormRules} from "element-plus";
export interface tableProps {
    config: {
        pageName: string,
        key: string,
        table: {
            props: any[],
            btn: any[]
        },
        search: {
            props: any[]
            cascade: {
                apply: boolean,
                port: boolean
            }
        },
        tools: {
            header: {
                title: string,
                icon: any
            },
            btnList: any[]
        }
    }
}

export interface formItemType {
    type: string
    label: string
    placeholder: string
    prop: string
    initialValue: string
    isIndex: boolean
    multiple: boolean,
    key: string|number,
    value: string,
    pass: boolean,
    pageName: string,
    submitProp: string
    cascader: {},
    mapKey: boolean
}
export interface  addProps {
    config: {
        pageName: string
        title: string
        formItem: formItemType[]
        rules ?: FormRules[]
    }
}

export type EditMode = 'create' | 'edit'