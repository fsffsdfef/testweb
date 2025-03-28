import {defineStore} from "pinia";
import BaseRequest from "@/service";


const interfaceCaseStore = defineStore("interfaceCase", {
    state: () => ({
        caseDataList: []
    }),
    actions: {
        async getInterfaceCase(data:any){
            const caseData = await BaseRequest({
                url: "getCase",
                method: "POST",
                data: data
            })
            this.caseDataList = caseData.data.list
        }
    }
})

export default interfaceCaseStore