import systemStore from "@/stores/main/system/systemStore.ts";
import {localCache} from "@/utils/localcache.ts";
const system = systemStore()

const addConfig = {
    pageName: "port",
    title: "接口",
    formItem: [
        {
            type: "input",
            label: "ID",
            prop: "portId",
            initialValue: "",
            disabled: true,
            isIndex: true
        },
        {
            type: "input",
            label: "接口名",
            placeholder: "请输入接口名",
            prop: "portName",
            initialValue: "",
            isIndex: false
        },
        {
            type: "input",
            label: "简介",
            placeholder: "简介",
            prop: "synopsis",
            initialValue: "",
            isIndex: false
        },
        {
            type: "input",
            label: "地址",
            placeholder: "请输入地址",
            prop: "portPath",
            initialValue: "",
            isIndex: false
        },
        // {
        //     type: "input",
        //     label: "修改人",
        //     placeholder: "请选择修改人",
        //     prop: "updateUser",
        //     initialValue: localCache.getCache("email") || "未知",
        //     isIndex: false
        // },
        {
            type: "select",
            label: "所属应用",
            placeholder: "请选择应用",
            prop: "apply",
            pageName: "apply",
            initialValue: "",
            key: "applyId",
            value: "applyName",
            isIndex: false
        }
    ],
    rules: {
        portName: [
            {required: true, message: '接口名必填', trigger: 'blur'}
        ],
        portPath: [
            {required: true, message: '接口地址必填'}
        ]
    }
}

export default addConfig