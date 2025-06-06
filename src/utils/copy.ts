import { ElMessage } from 'element-plus'
export async function copy(text:string) {
    {
        try {
            await navigator.clipboard.writeText(text)
            ElMessage({
                message: '复制成功',
                type: 'success'
            })
        } catch (err) {
            ElMessage('复制失败，请手动复制')
        }
    }
}