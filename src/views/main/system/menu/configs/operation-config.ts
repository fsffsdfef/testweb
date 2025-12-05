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
            label: "ICON",
            placeholder: "请配置ICON",
            prop: "icon",
            initialValue: null,
            isIndex: false
        },
        {
            type: "input",
            label: "路由",
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
            type: "select",
            label: "权限",
            placeholder: "选择可见权限",
            prop: "per",
            pageName: "per",
            key: "perId",
            value: "synopsis",
            multiple: true,
            initialValue: [],
            isIndex: false
        },
        {
            type: "select",
            label: "上级菜单",
            placeholder: "上级菜单",
            prop: "parent",
            pageName: "menu",
            key: "menuId",
            value: "menuName",
            initialValue: null,
            isIndex: false
        }
    ]
}

export default addConfig