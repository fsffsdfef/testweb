

const addConfig = {
    pageName: "depart",
    title: "部门",
    formItem: [
        {
            type: "input",
            label: "部门ID",
            placeholder: "请输入ID",
            prop: "departId",
            initialValue: null,
            disabled: true,
            isIndex: true
        },
        {
            type: "input",
            label: "部门名",
            placeholder: "请输入部门名",
            prop: "departName",
            initialValue: "",
            isIndex: false
        }
    ]
}

export default addConfig