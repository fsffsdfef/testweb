import type {FormRules} from "element-plus";

export interface tableProps {
    config: {
        pageName: string,
        key: string,
        table: {
            props: any[]
        },
        search: {
            props: any[]
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

interface formItemType {
    type: string
    label: string
    placeholder: string
    prop: string
    initialValue: string
    isIndex: boolean
    options ?: []
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