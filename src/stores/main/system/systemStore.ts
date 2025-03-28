import {defineStore} from "pinia";
import BaseRequest from "@/service";
import {departPageList, departAdd, departDel} from "@/api/main/system/api.ts";


const systemStore = defineStore("system", {
    state: () => ({
        userTableList: [],
        departTableList: [],
        dialogVisible: false
}),
    actions: {
        // 部门
        async getUserTableList(){
            const userTable = await BaseRequest({
                url: "user",
                method: "GET"
            })
            this.userTableList = userTable.data
        },
        async getDepartTableList(pageName: string, data:any){
            const departTable = await departPageList(pageName, data)
            this.departTableList = departTable.data.list
        },
        changeDialog(){
            this.dialogVisible = !this.dialogVisible
        }
    }
})

export default systemStore