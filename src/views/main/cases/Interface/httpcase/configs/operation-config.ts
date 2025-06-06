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
                            matchValueType: ""
                        }
                    ]
                }
            ],
            isIndex: false
        },
        {
            type: "number",
            label: "超时时间",
            prop: "timeOut",
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
            label: "是否为核心用例",
            prop: "isCore",
            initialValue: false,
            isIndex: false
        },
        {
            type: "select",
            label: "所属接口",
            placeholder: "请选择接口",
            prop: "port",
            key: "portId",
            value: "portName",
            initialValue: null,
            isIndex: false
        }
    ],
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