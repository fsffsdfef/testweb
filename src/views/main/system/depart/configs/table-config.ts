import {Upload, CirclePlus, List, Download, Search} from "@element-plus/icons-vue";
import systemStore from "@/stores/main/system/systemStore.ts";
const system = systemStore()

const departConfig = {
    pageName: "depart",
    key: "departId",
    table: {
        props: [
            {
                type: "selection"
            },
            {
                type: "expand",
                key: "apply",
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
                    }
                ]
            },
            {
                type: "text",
                prop: "departId",
                label: "部门ID"
            },
            {
                type: "text",
                prop: "departName",
                label: "部门名"
            }
        ]
    },
    search: {
        props: [
            {
                type: "input",
                label: "部门ID",
                placeholder: "请输入部门ID",
                prop: "departId"
            },
            {
                type: "input",
                label: "部门名",
                placeholder: "请输入部门名（支持模糊搜索）",
                prop: "departName"
            }
        ]
    },
    tools: {
        header: {
            title: "部门列表",
            icon: List
        },
        btnList: [
            {
                type: "add",
                name: "部门",
                icon: "CirclePlus"
            }
        ]
    }
}


export default departConfig