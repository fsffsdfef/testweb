import {Upload, CirclePlus, List, Download, Search} from "@element-plus/icons-vue";

const MenuConfig = {
    pageName: "menu",
    key: "menuId",
    table: {
        props: [
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
                prop: "menuId",
                label: "ID"
            },
            {
                type: "text",
                prop: "menuName",
                label: "名称"
            },
            {
                type: "text",
                prop: "previousMenu",
                label: "上级菜单"
            },
            {
                type: "text",
                prop: "icon",
                label: "图标"
            },
            {
                type: "path",
                prop: "path",
                label: "地址"
            }
            ,
            {
                type: "number",
                prop: "sequence",
                label: "排序"
            }
        ]
    },
    search: {
        props: [
            {
                type: "input",
                label: "上级菜单",
                placeholder: "请输入菜单名称",
                prop: "menuName"
            }
        ]
    },
    tools: {
        header: {
            title: "菜单列表",
            icon: List
        },
        btnList: [
            {
                type: "primary",
                btnName: "新增菜单",
                icon: CirclePlus,
                funcType: 'add'
            }
        ]
    }
}


export default MenuConfig