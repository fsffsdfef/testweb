import systemStore from "@/stores/main/system/systemStore.ts";

const system = systemStore()

const addConfig = {
    pageName: "httpcase",
    title: "用例",
    formItem: [
        {
            type: "input",
            label: "用例ID",
            prop: "caseId",
            initialValue: null,
            disabled: true,
            isIndex: true
        },
        {
            type: "input",
            label: "用例名",
            placeholder: "请输入用例名",
            prop: "caseName",
            initialValue: null,
            isIndex: false
        },
        {
            type: "obj",
            label: "请求头",
            placeholder: "输入请求头",
            prop: "headers",
            initialValue: null,
            isIndex: false
        },
        {
            type: "obj",
            label: "请求体",
            placeholder: "输入请求体",
            prop: "body",
            initialValue: null,
            isIndex: false
        },
        {
            type: "express",
            label: "规则",
            placeholder: "输入请求体",
            prop: "expressItem",
            initialValue: [
                {
                    expressList: [
                        {
                            matchKey: "",
                            keyType: "",
                            matchValue: "",
                            matchOper: "",
                            matchValueType: "",
                            matchMethod: ""
                        }
                    ]
                }
            ],
            isIndex: false
        },
        {
            type: "number",
            label: "超时时间",
            prop: "timeout",
            initialValue: 3,
            isIndex: false
        },
        {
            type: "number",
            label: "重试次数",
            prop: "retries",
            initialValue: 3,
            isIndex: false
        },
        {
            type: "single",
            label: "核心用例",
            prop: "isCore",
            initialValue: false,
            isIndex: false
        },
        {
            type: "Cascader",
            label: "接口",
            cascader: {
                value: 'id',
                label: 'name',
                children: 'children',
                showPrefix: false,
                checkOnClickNode: true,
                multiple: false, // 多选
                emitPath: false, // 是否返回完整路径
                checkStrictly: false, // 是否严格的遵守父子不互相关联
                custom: false
            },
            placeholder: "请选择接口",
            prop: "port",
            initialValue: [],
            isIndex: false,
            mapKey: false
        }
    ],
    search: {
        cascade: {
            depart: true,
            apply: true,
            port: true,
            httpcase: false
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