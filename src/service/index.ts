import Request from './request'
import {localCache} from "@/utils/localcache.ts";
import type{ AxiosResponse } from 'axios'
import type { RequestConfig } from './request/type.ts'
import { ElMessage } from 'element-plus'
import router from "@/router";
import {jwtDecode} from "jwt-decode";

export interface ResponseData<T> {
    statusCode: number
    desc: string
    data: T
    msg: string
    success: boolean
}

// 重写返回类型
interface BaseRequestConfig<T, R> extends RequestConfig<ResponseData<R>> {
    data?: T
    showMessage?: boolean
    skipMessage?: boolean
}
declare module 'axios' {
    interface AxiosRequestConfig {
        skipMessage?: boolean;
        showMessage?: boolean;
    }
}
const request = new Request({
    // baseURL: import.meta.env.BASE_URL,
    baseURL: "http://127.0.0.1:8000/api/",
    timeout: 1000 * 60 * 5,
    interceptors: {
        // 请求拦截器
        requestInterceptors: config => {
            const token = localCache.getCache('token') ?? undefined
            if (token){
                const decode = jwtDecode(token)
                const exp = decode?.exp
                if (exp && exp < Date.now()/1000){
                    ElMessage.error("登录态过期，请重新登陆")
                    router.push('/login')
                }
                if (config.headers) {
                    config.headers.Authorization = `Bearer ${token}`
                }
            }
            if(!token && !router.currentRoute.value.path.includes('/login')){
                ElMessage.error("鉴权失败，请重新登陆鉴权")
                router.push('/login')
            }
            if (config.url?.includes('getPageList')) {
                config.skipMessage = true
            }
            return config

        },
        // 响应拦截器
        responseInterceptors: (result: AxiosResponse) => {
            const responseData = result.data as ResponseData<any>
            const config = result.config as BaseRequestConfig<any, any>

            const shouldSkip =
                config.skipMessage || // 显式配置跳过
                config.url?.includes('getPageList') || // 特定接口自动跳过
                config.showMessage === false // 显式禁用消息

            if (!shouldSkip) {
                if (!responseData.success) {
                    ElMessage.error(responseData.msg || "操作失败")
                } else {
                    ElMessage({
                        message: responseData.msg || "操作成功",
                        type: 'success',
                    })
                }
            }
            return result
        },
    },
})

/**
 * @description: 函数的描述
 * @generic D 请求参数
 * @generic T 响应结构
 * @param {BaseRequestConfig} config 不管是GET还是POST请求都使用data
 * @returns {Promise}
 */
const BaseRequest = <D = any, T = any>(config: BaseRequestConfig<D, T>) => {
    const { method = 'GET' } = config
    if (method === 'get' || method === 'GET') {
        config.params = config.data
    }
    if (config.showMessage === undefined) {
        config.showMessage = true
    }

    return request.request<ResponseData<T>>(config)
}
// // 取消请求
// export const cancelRequest = (url: string | string[]) => {
//   return request.cancelRequest(url)
// }
// // 取消全部请求
// export const cancelAllRequest = () => {
//   return request.cancelAllRequest()
// }

export default BaseRequest