// stores/routeStore.ts
import { defineStore } from 'pinia'
import { generateRoutes, addDynamicRoutes, resetDynamicRoutes, type MenuItem } from '@/utils/routeUtils'
import { localCache } from '@/utils/localcache'

export const useRouteStore = defineStore('route', {
    state: () => ({
        menuList: [] as MenuItem[],
        routesGenerated: false
    }),

    actions: {
        // 设置菜单数据
        setMenuList(menuList: MenuItem[]) {
            this.menuList = menuList
            localCache.setCache('menuList', menuList)
        },

        // 生成并添加动态路由
        generateDynamicRoutes() {
            if (this.routesGenerated) {
                return
            }

            try {
                // 重置之前的动态路由
                resetDynamicRoutes()

                // 生成新的路由配置
                const dynamicRoutes = generateRoutes(this.menuList)

                // 添加动态路由
                addDynamicRoutes(dynamicRoutes)

                this.routesGenerated = true
                console.log('动态路由生成成功:', dynamicRoutes)
            } catch (error) {
                console.error('生成动态路由失败:', error)
            }
        },

        // 从缓存恢复菜单数据
        restoreMenuList() {
            const cachedMenuList = localCache.getCache('menuList')
            if (cachedMenuList) {
                this.menuList = cachedMenuList
            }
        },

        // 重置路由状态
        resetRoutes() {
            resetDynamicRoutes()
            this.routesGenerated = false
            this.menuList = []
            localCache.removeCache('menuList')
        }
    }
})