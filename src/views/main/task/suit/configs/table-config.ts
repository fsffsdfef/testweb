import {Upload, CirclePlus, List, Download, Search} from "@element-plus/icons-vue";

const suitConfig = {
    pageName: "suit",
    key: "suitId",
    expandKey: "caseId",
    search: {
        props: [
            {
                type: "input",
                label: "套件ID",
                placeholder: "ID",
                prop: "suitId"
            },
            {
                type: "input",
                label: "套件名",
                placeholder: "请输入套件名",
                prop: "suitName"
            }
        ]
    },
    tools: {
        header: {
            title: "套件列表",
            icon: List
        },
        btnList: [
            {
                type: "add",
                name: "套件",
                icon: "CirclePlus"
            }
        ]
    },
    table: {
        props: [
            {
                type: "expand",
                key: "caseInfo",
                props: [
                    {
                      type: "text",
                      prop: "execution_order",
                      label: "序列"
                    },
                    {
                        type: "text",
                        prop: "case.caseId",
                        label: "用例ID"
                    },
                    {
                        type: "text",
                        prop: "case.caseName",
                        label: "用例名"
                    },
                    {
                        type: "text",
                        prop: "case.url",
                        label: "url"
                    },
                    {
                        type: "tag",
                        prop: "is_first",
                        label: "是否是前置用例"
                    },
                    {
                        type: "tag",
                        prop: "is_last",
                        label: "是否是后置用例"
                    }
                ]
            },
            {
                type: "text",
                prop: "suitId",
                label: "ID"
            },
            {
                type: "text",
                prop: "suitName",
                label: "套件名"
            },
            {
                type: "text",
                prop: "caseSize",
                label: "用例总数"
            },
            {
                type: "text",
                prop: "updateUser",
                label: "更新人"
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
                name: "运行套件"
            }
        ]
    },
}

export default suitConfig