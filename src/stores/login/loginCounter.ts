import {defineStore} from 'pinia'
import APIBase from "@/axios/apibase";
import {localCache} from "@/utils/cache";
import {getMenusRouters} from "@/utils/getMenusRouter";
import router from "@/router";

const login = new APIBase('http://127.0.0.1:8000/api/login')
const useToken = defineStore('counter', {
    state: () => ({
        token: "",
        userInfo: {},
        menusMap: []
    }),
    getters: {

    },
    actions: {
        async loginAccount(account: {email: string, password: string}){

            const loginResult = await login.post(account)
            this.token = loginResult.data.token
            localCache.setCache('token', this.token)
            router.push("/automation/interface")
        },
        loadLocalCacheAction(){
            const token = localCache.getCache("token")
            const userInfo = localCache.getCache("userInfo")
            const menusMap = localCache.getCache("menusMap")
            if (token && userInfo && menusMap){
                this.token = token
                this.userInfo = userInfo
                this.menusMap = menusMap
                const routers = getMenusRouters(menusMap)
                routers.forEach((route)=>router.addRoute("main", route))

            }
        }
    }
})

export default useToken