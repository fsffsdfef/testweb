import BaseRequest from "@/service";

export function departPageList(pageName: string, queryInfo: any){
    return BaseRequest({
        url: `${pageName}/getPageList`,
        method: "POST",
        data: queryInfo
    })
}
export function departAdd(pageName: string, queryInfo: any){
    return BaseRequest({
        url: `${pageName}/add`,
        method: "POST",
        data: queryInfo
    })
}
export function departDel(pageName: string, queryInfo: any){
    return BaseRequest({
        url: `${pageName}/del`,
        method: "POST",
        data: queryInfo
    })
}