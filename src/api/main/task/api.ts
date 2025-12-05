import BaseRequest from "@/service";

// 套件运行
export function task(queryInfo?: any){
    return BaseRequest({
        url: `test`,
        method: "POST",
        data: queryInfo
    })
}

// 单个requests运行
export function reqRun(queryInfo: any){
    return BaseRequest({
        url: "reqRun",
        method: "POST",
        data: queryInfo
    })
}