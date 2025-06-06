import BaseRequest from "@/service";

export function getPageList(pageName: string, queryInfo?: any){
    return BaseRequest({
        url: `${pageName}/getPageList`,
        method: "POST",
        data: queryInfo
    })
}
export function Add(pageName: string, queryInfo: any){
    return BaseRequest({
        url: `${pageName}/add`,
        method: "POST",
        data: queryInfo
    })
}
export function Del(pageName: string, queryInfo: any){
    return BaseRequest({
        url: `${pageName}/del`,
        method: "POST",
        data: queryInfo
    })
}

export function Update(pageName:string, queryInfo: any){
    return BaseRequest({
        url: `${pageName}/update`,
        method: "POST",
        data: queryInfo
    })
}