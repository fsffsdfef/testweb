import {reactive} from "vue";
import {CirclePlusFilled, List, Upload, Histogram} from "@element-plus/icons-vue";
const userSearchConfig = {
    props: [
        {
            label: "用户名",
            placeholder: "请输入用户名",
            model: "userName"
        },
        {
            label: "邮箱",
            placeholder: "请输入邮箱",
            model: "email"
        },
        {
            label: "手机号",
            placeholder: "请输入手机号",
            model: "phone"
        },
    ]
}

const userTableConfig = {
    table: {
        props: [
            {
                type: "common",
                prop: "userId",
                label: "用户ID"
            },
            {
                type: "common",
                prop: "userName",
                label: "用户名"
            },
            {
                type: "custom",
                prop: "email",
                label: "邮箱",
                slotName: "email"
            },
            {
                type: "custom",
                prop: "phone",
                label: "手机号",
                slotName: "phone"
            }
        ]
    },
    tool: {
        btnList: [
            {
                btnName: "新增用户",
                icon: CirclePlusFilled,
                func: ""
            }
        ],
        header: {
            title: "用户列表",
            icon: List
        }
    }
}

export  default userTableConfig