export interface httpcaseType{
    caseId: number,
    caseName: string
}

export interface portType{
    portId: number,
    portName: string,
    httpcase: httpcaseType[]
}

export interface applyType{
    applyId: number,
    applyName: string
    port: portType[]
}



export interface departType {
    departId: number,
    departName: string,
    apply: applyType[]
}