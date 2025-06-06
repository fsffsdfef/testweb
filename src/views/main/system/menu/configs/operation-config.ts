const addConfig = {
    pageName: "menu",
    title: "菜单",
    formItem: [
        {
            type: "input",
            label: "菜单ID",
            placeholder: "请输入ID",
            prop: "menuId",
            initialValue: "",
            disabled: true,
            isIndex: true
        },
        {
            type: "input",
            label: "菜单名",
            placeholder: "请输入菜单名",
            prop: "menuName",
            initialValue: null,
            isIndex: false
        },
        {
            type: "input",
            label: "权限",
            placeholder: "选择可见权限",
            prop: "per",
            initialValue: [],
            isIndex: false
        },
        {
            type: "input",
            label: "菜单ICON",
            placeholder: "请选择ICON",
            prop: "icon",
            initialValue: null,
            isIndex: false
        },
        {
            type: "input",
            label: "地址",
            placeholder: "请输入路由地址",
            prop: "path",
            initialValue: null,
            isIndex: false
        },
        {
            type: "number",
            label: "排序",
            placeholder: "排序",
            prop: "sequence",
            initialValue: 0,
            isIndex: false
        },
        {
            type: "cascader",
            label: "上级菜单",
            placeholder: "上级菜单",
            prop: "parent",
            initialValue: null,
            isIndex: false
        }
    ]
}

export default addConfig