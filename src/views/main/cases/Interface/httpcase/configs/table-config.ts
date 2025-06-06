import {Upload, CirclePlus, List, Download, Search, CirclePlusFilled} from "@element-plus/icons-vue";

const httpCaseConfig = {
    pageName: "httpcase",
    key: "caseId",
    search: {
        props: [
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
                type: "primary",
                btnName: "新增应用",
                icon: CirclePlus,
                funcType: 'add'
            },
            {
                type: "primary",
                btnName: "上传",
                icon: Upload,
                funcType: "upload"
            },
            {
                type: "primary",
                btnName: "下载",
                icon: Download,
                funcType: "download"
            },
            {
                type: "primary",
                btnName: "列设置",
                icon: Download,
                funcType: "set"
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
                prop: "timeOut",
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
        ]
    },
}

export default httpCaseConfig