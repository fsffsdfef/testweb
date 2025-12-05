import {defineStore} from "pinia";
import {Add, Del, Update, getPageList} from "@/api/main/system/api.ts";
import {task, reqRun} from "@/api/main/task/api.ts";
import { ElMessage } from 'element-plus'
import {ref} from "vue";


const systemStore = defineStore("system", {
    state: () => ({
        TableList: [],
        pageCount: 0,
        showData: {}
}),
    actions: {
        async getTableListAction(pageName: string, data?:any){
            const TableList = await getPageList(pageName, data)
            this.TableList = TableList.data.list
            this.pageCount = TableList.data.count
            return TableList.data.list
        },
        async addAction(pageName: string, data:any){
            const result = await Add(pageName, data)
            this.getTableListAction(pageName)
        },
        async delAction(pageName: string, data:any){
            const result = await Del(pageName, data)
            this.getTableListAction(pageName)
        },
        async updateAction(pageName: string, data:any){
            const result = await Update(pageName, data)
            this.getTableListAction(pageName)
        },
        async taskAction(data: any) {
            const result = await task(data)
            this.showData = result.data
            return result.data
        }
    }
})

export default systemStore