import {Upload, CirclePlus, List, Download, Search} from "@element-plus/icons-vue";

const userConfig = {
    pageName: "user",
    key: "userId",
    search: {
        props: [
            {
                type: "input",
                label: "用户名",
                placeholder: "请输入用户名",
                prop: "userName"
            },
            {
                type: "input",
                label: "邮箱",
                placeholder: "邮箱",
                prop: "email"
            },
            {
                type: "input",
                label: "手机号",
                placeholder: "手机号",
                prop: "phone"
            }
        ]
    },
    tools: {
        header: {
            title: "用户列表",
            icon: List
        },
        btnList: [
            {
                type: "add",
                name: "用户",
                icon: "CirclePlus"
            }
        ]
    },
    table: {
        props: [
            {
                type: "text",
                prop: "userId",
                label: "ID"
            },
            {
                type: "text",
                prop: "userName",
                label: "用户名"
            },
            {
                type: "copy",
                prop: "email",
                label: "邮箱"
            },
            {
              type: "copy",
              prop: "phone",
              label: "手机号"
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

export default userConfig