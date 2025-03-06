import Request from './request'
import {localCache} from "@/utils/localcache.ts";
import type{ AxiosResponse } from 'axios'
import type { RequestConfig } from './request/type.ts'

export interface ResponseData<T> {
    statusCode: number
    desc: string
    data: T
}

// 重写返回类型
interface BaseRequestConfig<T, R> extends RequestConfig<ResponseData<R>> {
    data?: T
}

const request = new Request({
    // baseURL: import.meta.env.BASE_URL,
    baseURL: "http://127.0.0.1:8000/api/",
    timeout: 1000 * 60 * 5,
    interceptors: {
        // 请求拦截器
        requestInterceptors: config => {
            const token = localCache.getCache('token')
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config

        },
        // 响应拦截器
        responseInterceptors: (result: AxiosResponse) => {
            return result
        },
    },
})

/**
 * @description: 函数的描述
 * @generic D 请求参数
 * @generic T 响应结构
 * @param {YWZRequestConfig} config 不管是GET还是POST请求都使用data
 * @returns {Promise}
 */
const BaseRequest = <D = any, T = any>(config: BaseRequestConfig<D, T>) => {
    const { method = 'GET' } = config
    if (method === 'get' || method === 'GET') {
        config.params = config.data
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