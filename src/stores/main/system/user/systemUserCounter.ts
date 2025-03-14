import {defineStore} from "pinia";
import BaseRequest from "@/service";


const systemUserCounter = defineStore("user", {
    state: () => ({
        userTableList: []
}),
    actions: {
        async getUserTableList(data: any){
            const userTable = await BaseRequest({
                url: "user",
                method: "POST",
                data: data
            })
            this.userTableList = userTable.data
        }
    }
})