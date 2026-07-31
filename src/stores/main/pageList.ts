import {defineStore} from "pinia";
import {Add, Del, Update, getPageList, getOperator} from "@/api/main/system/api.ts";
import {task, reqRun} from "@/api/main/task/api.ts";

const pageList = defineStore("pageList", {
    state: () => ({
        tableSearchData: {}
    })
})