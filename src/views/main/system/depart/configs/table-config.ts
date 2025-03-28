import {reactive} from "vue";
import {CirclePlusFilled, List, Remove, Search} from "@element-plus/icons-vue";
import systemStore from "@/stores/main/system/systemStore.ts";
const system = systemStore()

const departConfig = {
    pageName: "depart",
    table: {
        props: [
            {
                type: "number",
                prop: "departId",
                label: "部门ID"
            },
            {
                type: "text",
                prop: "departName",
                label: "部门"
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
                btnName: "新增部门",
                icon: CirclePlusFilled,
                func: system.changeDialog
            }
        ]
    }
}


export default departConfig