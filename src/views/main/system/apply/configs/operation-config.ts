import systemStore from "@/stores/main/system/systemStore.ts";

const system = systemStore()

const addConfig = {
    pageName: "apply",
    title: "应用",
    formItem: [
        {
            type: "input",
            label: "应用ID",
            prop: "applyId",
            initialValue: "",
            disabled: true,
            isIndex: true
        },
        {
            type: "input",
            label: "应用名",
            placeholder: "请输入应用名",
            prop: "applyName",
            initialValue: "",
            isIndex: false
        },
        {
            type: "input",
            label: "简介",
            placeholder: "简介",
            prop: "synopsis",
            initialValue: "",
            isIndex: false
        },
        {
            type: "input",
            label: "域名",
            placeholder: "请输入域名",
            prop: "baseUrl",
            initialValue: "",
            isIndex: false
        },
        {
            type: "input",
            label: "负责人",
            placeholder: "请选择负责人",
            prop: "owner",
            initialValue: "",
            isIndex: false
        },
        {
            type: "select",
            label: "所属部门",
            placeholder: "请选择部门",
            prop: "depart",
            key: "departId",
            value: "departName",
            initialValue: "",
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