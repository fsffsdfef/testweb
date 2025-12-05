// utils/routeUtils.ts
import type {RouteRecordRaw} from 'vue-router'

// 菜单数据类型定义
export interface MenuItem {
    menuId: number
    menuName: string
    icon: string
    path: string
    sequence: number
    children?: MenuItem[]
}

// 组件映射表（根据path映射到对应的组件）
const componentMap: Record<string, () => Promise<any>> = {
    '/': () => import('@/views/index.vue'),
    '/home': () => import('@/views/main/home/Home.vue'),
    '/system': () => import('@/views/index.vue'),
    '/system/user': () => import('@/views/main/system/user/index.vue'),
    '/system/depart': () => import('@/views/main/system/depart/index.vue'),
    '/system/apply': () => import('@/views/main/system/apply/index.vue'),
    '/system/port': () => import('@/views/main/system/port/index.vue'),
    '/system/menu': () => import('@/views/main/system/menu/index.vue'),
    '/case': () => import('@/views/index.vue'),
    '/case/http': () => import('@/views/main/cases/Interface/httpcase/index.vue'),
    '/task': () => import('@/views/index.vue'),
    '/task/suit': () => import('@/views/main/task/suit/index.vue'),
    '/task/performance': () => import('@/views/main/task/performance/index.vue'),
    '/task/ui': () => import('@/views/main/task/ui/index.vue'),
    '/task/port': () => import('@/views/main/task/port/index.vue'),
}

// 根据菜单数据生成路由配置
export function generateRoutes(menuList: MenuItem[]): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []

    // 按sequence排序
    const sortedMenus = menuList.sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

    sortedMenus.forEach(menu => {
        const route = generateRouteFromMenu(menu)
        if (route) {
            routes.push(route)
        }
    })

    return routes
}

// 将单个菜单项转换为路由配置
function generateRouteFromMenu(menu: MenuItem): RouteRecordRaw | null {
    const { path, menuName, children } = menu

    // 获取对应的组件
    const component = componentMap[path]
    if (!component) {
        console.warn(`未找到路径 ${path} 对应的组件`)
        return null
    }

    const route: RouteRecordRaw = {
        path,
        name: path.replace(/\//g, '_').substring(1) || 'root',
        meta: { title: menuName },
        component
    }

    // 如果有子菜单，递归生成子路由
    if (children && children.length > 0) {
        const childRoutes = children
            .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
            .map(child => generateRouteFromMenu(child))
            .filter(Boolean) as RouteRecordRaw[]

        if (childRoutes.length > 0) {
            route.children = childRoutes
        }
    }

    return route
}

// 添加动态路由到路由器
export function addDynamicRoutes(routes: RouteRecordRaw[]) {
    routes.forEach(route => {
        router.addRoute(route)
    })
}

// 重置动态路由
export function resetDynamicRoutes() {
    // 获取所有路由名称
    const routeNames = router.getRoutes()
        .filter(route => !constantRoutes.some(constantRoute => constantRoute.name === route.name))
        .map(route => route.name)

    // 移除动态路由
    routeNames.forEach(name => {
        if (name) {
            router.removeRoute(name)
        }
    })
}