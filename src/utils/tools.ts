import systemStore from "@/stores/main/system/systemStore.ts";
import {task, reqRun} from "@/api/main/task/api.ts";
const sys = systemStore()
export async function taskAction(data: any) {
    sys.changeShow()
    const res = await task(data)
}

// export async function reqAction(data: any) {
//     await task.runAction(data)
// }