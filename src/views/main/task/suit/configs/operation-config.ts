import systemStore from "@/stores/main/system/systemStore.ts";
interface caseType{
    caseId: number,
    execution_order: number,
    is_first: boolean,
    is_last: boolean
}

const system = systemStore()

const addConfig = {
    pageName: "suit",
    title: "套件",
    formItem: [
        {
            type: "input",
            label: "套件ID",
            prop: "suitId",
            initialValue: null,
            disabled: true,
            isIndex: true
        },
        {
            type: "input",
            label: "套件名",
            placeholder: "请输入套件名",
            prop: "suitName",
            initialValue: null,
            isIndex: false
        },
        {
            type: "suitCase",
            label: "用例",
            cascader: {
                value: 'id',
                label: 'name',
                children: 'children',
                showPrefix: false,
                checkOnClickNode: true,
                multiple: true, // 多选
                emitPath: false, // 是否返回完整路径
                checkStrictly: false // 是否严格的遵守父子不互相关联
            },
            placeholder: "请选择用例",
            prop: "caseInfo",
            submitProp: "casesList",
            initialValue: [],
            isIndex: false,
            mapKey: true
        }
    ],
    search: {
        cascade: {
            depart: true,
            apply: true,
            port: true,
            httpcase: true
        }
    },
    rules: {
        applyName: [
            {required: true, message: '应用名必填', trigger: 'blur'}
        ],
        baseURL: [
            {required: true, message: '应用名必填'}
        ]
    }
}

export default addConfig