import dayjs from "dayjs";
import utc from  "dayjs/plugin/utc"

export function dayJS(data: any){
    dayjs.extend(utc)
    return dayjs(data).format('YYYY-MM-DD HH:mm')
}