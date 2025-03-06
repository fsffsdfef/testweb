import {createRouter, createWebHistory,} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: ()=>import("@/views/index.vue"),

  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/loginView.vue'),
  },
  {
    path: '/test',
    name: 'test',
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
    component: ()=>import("@/views/index.vue"),
    children: [
      {
        path: "user",
        name: "User",
        component: ()=>import("@/views/main/system/user/index.vue"),
      },
      {
        path: "depart",
        name: "depart",
        component: ()=>import("@/views/main/system/depart/index.vue"),
      }
    ]
  },
  {
    path: "/case",
    name: "case",
    component: ()=>import("@/views/index.vue"),
    children: [
      {
        path: "interface/httpcase",
        name: "httpcase",
        component: ()=>import("@/views/main/cases/Interface/httpcase/index.vue"),
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
