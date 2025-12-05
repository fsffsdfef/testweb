import {defineStore} from "pinia";
import {task, reqRun} from "@/api/main/task/api.ts";


const taskStore = defineStore("task", {
    state: () => ({
        taskInfo: [],
        resInfo: {}
    }),
    actions: {
        async submitTask(queryInfo: any) {
            console.log("212", queryInfo)
            // const queryInfo = {"suitId": data.suitId}

            const info = await task(queryInfo)
            this.taskInfo = info.data
        },
        async runAction(data: any){
            const res = await reqRun(data)
            this.resInfo = res.data
        }
    }
})

export default taskStore