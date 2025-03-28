import {Remove, Search} from "@element-plus/icons-vue";

const userSearchConfig = {
    props: [
        {
            type: "input",
            label: "用户名",
            placeholder: "请输入用户名",
            model: "userName"
        },
        {
            type: "input",
            label: "邮 箱",
            placeholder: "请输入邮箱",
            model: "email"
        },
        {
            type: "input",
            label: "手机号",
            placeholder: "请输入手机号",
            model: "phone"
        },
        {
            type: "input",
            label: "手机号",
            placeholder: "请输入手机号",
            model: "phone"
        },
        {
            type: "input",
            label: "手机号",
            placeholder: "请输入手机号",
            model: "phone"
        },
        {
            type: "input",
            label: "手机号",
            placeholder: "请输入手机号",
            model: "phone"
        },
        {
            type: "btn",
            label: "重置",
            icon: Remove
        },
        {
            type: "btn",
            label: "搜索",
            icon: Search
        }

    ]
}

export default userSearchConfig