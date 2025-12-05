    import {getPageList} from "@/api/main/system/api.ts";
    import type {formItemType} from "@/common/types/main/type.ts";
    import type {departType} from "@/api/main/system/type.ts";
    import {ElMessage} from "element-plus";
    import {computed, ref} from "vue";
    import type {FormInstance, FormRules} from 'element-plus'
    import httpCaseConfig from "@/views/main/cases/Interface/httpcase/configs/table-config.ts";
    const ruleFormRef = ref<FormInstance>()
    // 获取表单内select可选内容
    export async function loadSelectOptions(data: formItemType[], optionsMap: any) {
        const selectItems = data.filter(item => item.type === 'select')

        for (const item of selectItems) {
            if (!optionsMap[item.prop]) { // 避免重复请求
                try {
                    optionsMap[item.prop] = await getPageList(item.pageName)
                } catch (error) {
                    console.error(`获取${item.prop}选项失败:`, error)
                    optionsMap[item.prop] = { data: { list: [] } }
                }
            }
        }
    }
    // 将表单内空字符串转换为null
    export function processEmptyString(obj:any, action = 'null'){
        const result = { ...obj }

        Object.keys(result).forEach(key => {
            if (result[key] === '') {
                if (action === 'null') {
                    result[key] = null
                } else if (action === 'remove') {
                    delete result[key]
                }
            }
        })

        return result
    }
    // 表单提交操作
    export function sumbitAction(moduleShow: any, formItem: any, emit:any, editMode:any) {
        ruleFormRef.value?.validate((valid) => {
            if (valid) {
                moduleShow.value = !moduleShow.value

                const value = processEmptyString(formItem)
                console.log(valid)
                emit("sumbitAction", editMode, value)
            } else {
                ElMessage.error('数据错误')
            }
        })
    }
    // 级联选项
    export function cascaderOptions(search: departType[], props: any){
        return search.map(depart => ({
            id: depart.departId,
            name: depart.departName,
            children: (depart.apply || [])
                .filter(apply => props?.config?.search?.cascade?.apply === true)
                .map(apply => ({
                    id: apply.applyId,
                    name: apply.applyName,
                    children: (apply.port || [])
                        .filter(port => props?.config?.search?.cascade?.port === true)
                        .map(port => ({
                            id: port.portId,
                            name: port.portName,
                            children: (port.httpcase || [])
                                .filter(httpcase => props?.config?.search?.cascade?.httpcase === true)
                                .map(httpcase=>({
                                    id: httpcase.caseId,
                                    name: httpcase.caseName
                                }))
                        }))
                }))
        }))
    }
