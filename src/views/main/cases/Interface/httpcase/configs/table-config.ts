import {Upload, CirclePlus, List, Download, Search, CirclePlusFilled} from "@element-plus/icons-vue";

const httpCaseConfig = {
    pageName: "httpcase",
    key: "caseId",
    search: {
        cascade: {
            apply: true,
            port: true
        },
        props: [
            {
                type: "Cascader",
                label: "接口",
                placeholder: "请选择部门/应用/接口",
                prop: "portId"
            },
            {
                type: "input",
                label: "用例ID",
                placeholder: "请输入测试ID",
                prop: "caseId"
            },
            {
                type: "input",
                label: "用例名",
                placeholder: "请输入用例名",
                prop: "caseName"
            }
        ]
    },
    tools: {
        header: {
            title: "用例列表",
            icon: List
        },
        btnList: [
            {
                type: "add",
                name: "用例",
                icon: "CirclePlus"
            }
        ]
    },
    table: {
        props: [
            {
                type: "expand",
                key: "expressItem",
                props: [
                    {
                        type: "text",
                        prop: "expressItem",
                        label: "断言规则"
                    }
                ]
            },
            {
                type: "selection"
            },
            {
                type: "text",
                prop: "caseId",
                label: "用例ID"
            },
            {
                type: "text",
                prop: "caseName",
                label: "用例名"
            },
            {
                type: "obj",
                prop: "headers",
                label: "请求头"
            },
            {
                type: "obj",
                prop: "body",
                label: "请求体"
            },
            {
                type: "text",
                prop: "timeout",
                label: "超时时间"
            },
            {
                type: "text",
                prop: "retries",
                label: "重试次数"
            },
            {
                type: "tag",
                prop: "isCore",
                label: "核心用例"
            },
            {
                type: "time",
                prop: "updatedDate",
                label: "更新时间"
            }
        ],
        btn: [
            {
                action: "submitTask",
                name: "运行"
            }
        ]
    },
}

export default httpCaseConfig