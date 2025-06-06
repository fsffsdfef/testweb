import {createRouter, createWebHistory,} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'
import {localCache} from "@/utils/localcache.ts";
import {jwtDecode} from "jwt-decode";
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: '/',
    meta: {title: "主页"},
    component: ()=>import("@/views/index.vue"),
    children: [
      {
        path: "home",
        name: "home",
        meta: {title: "看板"},
        component: ()=>import("@/views/main/home/Home.vue"),
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    meta: {title: "登录"},
    component: () => import('@/views/login/loginView.vue'),
  },
  {
    path: '/test',
    name: 'test',
    meta: {title: "测试"},
    component: () => import('@/views/test.vue'),
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/index.vue'),
  },
  {
    path: "/system",
    name: "System",
    meta: {title: "配置管理"},
    component: ()=>import("@/views/index.vue"),
    children: [
      {
        path: "user",
        name: "User",
        meta: {title: "用户管理"},
        component: ()=>import("@/views/main/system/user/index.vue"),
      },
      {
        path: "depart",
        name: "depart",
        meta: {title: "部门管理"},
        component: ()=>import("@/views/main/system/depart/index.vue"),
      },
      {
        path: "apply",
        name: "apply",
        meta: {title: "应用管理"},
        component: ()=>import("@/views/main/system/apply/index.vue"),
      },
      {
        path: "port",
        name: "port",
        meta: {title: "接口管理"},
        component: ()=>import("@/views/main/system/port/index.vue"),
      },
      {
        path: "menu",
        name: "menu",
        meta: {title: "菜单管理"},
        component: ()=>import("@/views/main/system/menu/index.vue"),
      }
    ]
  },
  {
    path: "/case",
    name: "case",
    meta: {title: "用例管理"},
    component: ()=>import("@/views/index.vue"),
    children: [
      {
        path: "http",
        name: "http",
        meta: {title: "http接口用例"},
        component: ()=>import("@/views/main/cases/Interface/httpcase/index.vue"),
      }
    ]
  },
  {
    path: "/case",
    name: "case",
    meta: {title: "用例管理"},
    component: ()=>import("@/views/index.vue"),
    children: [
      {
        path: "http",
        name: "http",
        meta: {title: "http接口用例"},
        component: ()=>import("@/views/main/cases/Interface/httpcase/index.vue"),
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localCache.getCache('token')
  if (token){
    const decode = jwtDecode(token)
    const exp = decode?.exp
    if (exp && exp < Date.now()/1000){
      localCache.clearCache()
      router.push('/login')
    }}
  if (!token && to.path !== '/login'){
      return '/login'
  }
})
export default router
