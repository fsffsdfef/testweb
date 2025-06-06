import {defineStore} from "pinia";
import {Add, Del, Update, getPageList} from "@/api/main/system/api.ts";


const systemStore = defineStore("system", {
    state: () => ({
        TableList: [],
        pageCount: 0
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
        }
    }
})

export default systemStore