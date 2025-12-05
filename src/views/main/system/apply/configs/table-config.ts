import {Upload, CirclePlus, List, Download, Search} from "@element-plus/icons-vue";

const applyConfig = {
    pageName: "apply",
    key: "applyId",
    search: {
        cascade: {
            apply: false
        },
        props: [
            {
                type: "select",
                label: "部门",
                placeholder: "请选择部门",
                prop: "depart"
            },
            {
                type: "input",
                label: "应用ID",
                placeholder: "请输入应用ID",
                prop: "applyId"
            },
            {
                type: "input",
                label: "应用名",
                placeholder: "请输入应用名",
                prop: "applyName"
            },
            {
                type: "input",
                label: "负责人",
                placeholder: "请输入用户名",
                prop: "owner"
            }
        ]
    },
    tools: {
        header: {
            title: "应用列表",
            icon: List
        },
        btnList: [
            {
                type: "add",
                name: "应用",
                icon: "CirclePlus"
            }
        ]
    },
    table: {
        props: [
            {
                type: "text",
                prop: "applyId",
                label: "应用ID"
            },
            {
                type: "text",
                prop: "applyName",
                label: "应用名"
            },
            {
                type: "text",
                prop: "baseUrl",
                label: "url"
            },
            {
                type: "text",
                prop: "synopsis",
                label: "简介"
            },
            {
                type: "text",
                prop: "owner",
                label: "负责人"
            },
            {
                type: "time",
                prop: "updatedDate",
                label: "更新时间"
            }
        ]
    },
}

export default applyConfig