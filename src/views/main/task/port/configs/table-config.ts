import {Upload, CirclePlus, List, Download, Search} from "@element-plus/icons-vue";

const portTaskConfig = {
    pageName: "task",
    key: "id",
    search: {
        props: [
            {
                type: "input",
                label: "任务ID",
                placeholder: "ID",
                prop: "id"
            },
            {
                type: "input",
                label: "任务名",
                placeholder: "请输入任务名",
                prop: "name"
            }
        ]
    },
    tools: {
        header: {
            title: "任务列表",
            icon: List
        },
        btnList: [
            {
                type: "add",
                name: "任务",
                icon: "CirclePlus"
            }
        ]
    },
    table: {
        props: [
            {
                type: "selection"
            },
            {
                type: "text",
                prop: "id",
                label: "ID"
            },
            {
                type: "text",
                prop: "name",
                label: "任务名"
            },
            {
                type: "text",
                prop: "task",
                label: "job"
            },
            {
                type: "switch",
                prop: "enabled",
                label: "是否启用"
            },
            {
                type: "scheduleDesc",
                prop: "schedule",
                label: "运行策略"
            },
            {
                type: "text",
                prop: "total_run_count",
                label: "运行总数"
            },
            {
                type: "time",
                prop: "last_run_at",
                label: "最新执行时间"
            },
            {
                type: "time",
                prop: "updatedDate",
                label: "更新时间"
            }
        ],
        btn: [
            {
                action: "viewPeriodicTaskHistory",
                name: "详情"
            }
        ]
    },
}

export default portTaskConfig