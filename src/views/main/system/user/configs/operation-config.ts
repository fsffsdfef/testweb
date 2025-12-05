import systemStore from "@/stores/main/system/systemStore.ts";

const system = systemStore()

const addConfig = {
    pageName: "user",
    title: "用户",
    formItem: [
        {
            type: "input",
            label: "ID",
            prop: "userId",
            initialValue: null,
            disabled: true,
            isIndex: true
        },
        {
            type: "input",
            label: "用户名",
            placeholder: "用户名",
            prop: "userName",
            initialValue: null,
            isIndex: false
        },
        {
            type: "input",
            label: "邮箱",
            placeholder: "邮箱",
            prop: "email",
            initialValue: null,
            isIndex: false
        },
        {
            type: "input",
            label: "手机号",
            placeholder: "手机号",
            prop: "phone",
            initialValue: null,
            isIndex: false
        },
        {
            type: "input",
            label: "密码",
            placeholder: "密码",
            prop: "password",
            initialValue: "",
            isIndex: false,
            pass: true
        },
        {
            type: "select",
            label: "角色",
            multiple: true,
            placeholder: "角色",
            prop: "roles",
            pageName: "roles",
            initialValue: [],
            isIndex: false,
            key: 'roleId',
            value: 'roleName'
        },
        {
            type: "select",
            label: "分组",
            multiple: true,
            placeholder: "分组",
            prop: "groups",
            pageName: "groups",
            initialValue: [],
            isIndex: false,
            key: 'groupId',
            value: 'groupName'
        },
        {
            type: "select",
            label: "部门",
            placeholder: "部门",
            prop: "depart",
            pageName: "depart",
            initialValue: null,
            key: "departId",
            value: "departName",
            isIndex: false
        }
    ],
    rules: {
        email: [
            {required: true, message: 'email必填', trigger: 'blur'}
        ],
        userName: [
            {required: true, message: '用户名必填'}
        ]
    }
}

export default addConfig