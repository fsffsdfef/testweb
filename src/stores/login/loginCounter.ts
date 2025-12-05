import {defineStore} from 'pinia'
import BaseRequest from "@/service";
import router from "@/router";
import {localCache} from "@/utils/localcache.ts";


const initializeStore = defineStore('counter', {
    state: () => ({
        token: "",
        userInfo: {},
        menusMap: [],
        isCollapse: false,
        locale: "zh-cn",
        cascader: []
    }),
    getters: {

    },
    actions: {
        async loginAccount(account: {email: string, password: string}){
            const loginResult = await BaseRequest(
                {
                    url: 'login',
                    method: 'POST',
                    data: account,
                    skipMessage: true
                })
            const token = loginResult.data.token
            const email = loginResult.data.email
            localCache.setCache('token', token)
            localCache.setCache('email', email)
            const Menus = await BaseRequest({
                url: 'menu1',
                method: 'GET'
            })
            const User = await BaseRequest({
                url: 'user/getPageList',
                method: 'post',
                data: {email: localCache.getCache('email')}
            })
            const Depart = await BaseRequest({
                url: 'depart/getPageList',
                method: 'post',
            })
            localCache.setCache('menuList', Menus.data)
            localCache.setCache('depart', Depart.data)
            localCache.setCache('userInfo', User.data.list[0])
            router.push("/home")
        },
        loadLocalCacheAction(){
            const token = localCache.getCache("token")
            const userInfo = localCache.getCache("userInfo")
            const menusMap = localCache.getCache("menuList")
            if (token){
                this.token = token
                this.userInfo = userInfo
                this.menusMap = menusMap
                // const routers = getMenusRouters(menusMap)
                // routers.forEach((route)=>router.addRoute("main", route))

            }
        },
        changeCollapse(){
            this.isCollapse = !this.isCollapse
        },
        changeLocale(){
                this.locale = this.locale === 'zh-cn'? 'en': 'zh-cn'
        }
    }
})

export default initializeStore