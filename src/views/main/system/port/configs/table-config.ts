import {Upload, CirclePlus, List, Download, Search} from "@element-plus/icons-vue";

const portConfig = {
    pageName: "port",
    key: "portId",
    search: {
        props: [
            {
                type: "input",
                label: "接口ID",
                placeholder: "请输入接口ID",
                prop: "portId"
            },
            {
                type: "input",
                label: "接口名名",
                placeholder: "接口名",
                prop: "portName"
            }
        ]
    },
    tools: {
        header: {
            title: "接口列表",
            icon: List
        },
        btnList: [
            {
                type: "primary",
                btnName: "新增接口",
                icon: CirclePlus,
                funcType: 'add'
            }
        ]
    },
    table: {
        props: [
            {
                type: "text",
                prop: "portId",
                label: "ID"
            },
            {
                type: "text",
                prop: "portPath",
                label: "接口名"
            },
            {
                type: "text",
                prop: "synopsis",
                label: "简介"
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
        ]
    },
}

export default portConfig