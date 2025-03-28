export interface departProps {
    config: {
        pageName: string,
        table: {
            props: any[]
        },
        search: {
            props: any[]
        },
        tools: {
            header: {
                title: string,
                icon: any
            },
            btnList: any[]
        }
    }
}