import {defineStore} from 'pinia'
import request from "@/service";
import router from "@/router";
import {localCache} from "@/utils/localcache.ts";


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

            const loginResult = await request(
                {
                    url: 'login',
                    method: 'POST',
                    data: account
                })
            const token = loginResult.data.token
            localCache.setCache('token', token)
            const Menus = await request({
                url: 'menu',
                method: 'GET'
            })
            localCache.setCache('menuList', Menus.data)
            router.push("/about")
        },
        // loadLocalCacheAction(){
        //     const token = localCache.getCache("token")
        //     const userInfo = localCache.getCache("userInfo")
        //     const menusMap = localCache.getCache("menusMap")
        //     if (token){
        //         this.token = token
        //         this.userInfo = userInfo
        //         this.menusMap = menusMap
        //         const routers = getMenusRouters(menusMap)
        //         routers.forEach((route)=>router.addRoute("main", route))
        //
        //     }
        // }
    }
})

export default useToken