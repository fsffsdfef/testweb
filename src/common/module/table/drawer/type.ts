interface expressType {
    oper: string,
    expressId: number,
    assert: boolean
}
interface assertType {
    groupID: number,
    final: boolean,
    expressInfo: expressType[]
}
interface dataType {
    req: {
        data: string | null,
        header: string | null,
        method: string,
        timeout: number,
        url: string,
        caseId: number,
        caseName: string
    },
    res: any,
    assert: {
        finalAssert: boolean,
        assertInfo: assertType[]
    }
}

export interface reqActionProps {
    data: dataType
}