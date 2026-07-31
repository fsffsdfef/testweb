<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import type { addProps } from '@/common/types/main/type.ts'
import { localCache } from '@/utils/localcache.ts'
import CommonExpresses from '@/common/module/operate/CommonExpresses.vue'
import CommonSuitCase from '@/common/module/operate/CommonSuitCase.vue'
import {
  cascaderOptions,
  markOnlyLeafSelectable,
  loadSelectOptions,
  processEmptyString,
  parseArgsToSuitIds,
  buildArgsFromSuitIds,
  ensureSuitOptionsInList,
} from '@/utils/formUtil.ts'
import {
  buildCronFromRunCycle,
  applyRunCycleToForm,
} from '@/utils/scheduleUtil.ts'
import { CaretLeft, CaretRight } from '@element-plus/icons-vue'
import { getPageList } from '@/api/main/system/api.ts'

const optionsMap = reactive<Record<string, any>>({})
const props = defineProps<addProps>()
const rule = reactive<FormRules>(props.config.rules ?? {})
const ruleFormRef = ref<FormInstance>()
const editMode = ref<'create' | 'edit'>('create')
const moduleShow = ref(false)
const initialForm: any = {}
const formItem = reactive(initialForm)
const departRefreshKey = ref(0)
const suitCaseRenderKey = ref(0)

const localConfig = computed(() => ({
  ...props.config,
  formItem:
      editMode.value === 'create'
          ? props.config.formItem.filter(item => !item.isIndex)
          : [...props.config.formItem.filter(item => !item.pass)],
}))

const cascaderOptionsMap = computed(() => {
  departRefreshKey.value
  const depart = localCache.getCache('depart')
  return cascaderOptions(depart?.list ?? [], props)
})

const suitCaseOptionsMap = computed(() => {
  return markOnlyLeafSelectable(cascaderOptionsMap.value)
})

onMounted(async () => {
  const depart = localCache.getCache('depart')
  if (!depart?.list?.length) {
    try {
      const res = await getPageList('depart', { size: 100, page: 1 })
      localCache.setCache('depart', res.data)
      departRefreshKey.value++
    } catch (error) {
      console.error('加载部门级联数据失败:', error)
    }
  }
})

function shouldShowField(item: any) {
  if (!item.showWhen) return true
  return Object.entries(item.showWhen).every(
      ([key, val]) => formItem[key] === val
  )
}

function normalizePathIds(path: (string | number)[]) {
  return Array.isArray(path) ? path.map(id => String(id)) : []
}

function globalMapToItems(globalMap: Record<string, string> | null | undefined) {
  if (!globalMap || typeof globalMap !== 'object') return []
  return Object.entries(globalMap).map(([key, value]) => ({
    key,
    value: value ?? '',
  }))
}

const emit = defineEmits(['sumbitAction'])

function findSelectPath(selectList: any[][], caseId: string | number) {
  if (!Array.isArray(selectList)) return []
  return (
      selectList.find(
          (path) => Array.isArray(path) && String(path[3]) === String(caseId)
      ) ?? []
  )
}

function buildLabelFromPath(path: (string | number)[], options: any[]): string {
  if (!Array.isArray(path) || path.length === 0 || !options?.length) return ''
  const names: string[] = []
  let nodes = options
  for (const id of path) {
    const node = nodes.find((o: any) => String(o.id) === String(id))
    if (!node) break
    names.push(node.name)
    nodes = node.children ?? []
  }
  return names.join(' / ')
}

function normalizeSuitCaseInfo(
    caseInfo: any[],
    selectList: any[][],
    options: any[]
) {
  if (!Array.isArray(caseInfo)) return []
  return caseInfo.map((item, index) => {
    const caseId = item.case?.caseId ?? item.caseId
    let path = findSelectPath(selectList, caseId)
    if (!path.length && Array.isArray(selectList?.[index])) {
      path = selectList[index]
    }
    path = normalizePathIds(path)
    const label =
        buildLabelFromPath(path, options) ||
        item.case?.caseName ||
        String(caseId ?? '')
    return {
      id: String(caseId ?? ''),
      caseId: String(caseId ?? ''),
      label,
      selectList: path,
      execution_order: item.execution_order ?? 0,
      globalMap: item.globalMap ?? {},
      items: item.items?.length ? item.items : globalMapToItems(item.globalMap),
      is_first: item.is_first ?? false,
      is_last: item.is_last ?? false,
      is_stream: item.is_stream ?? false,
      changeSid: item.changeSid ?? false,
      changeSidKey: item.changeSidKey ?? '',
      streamKey: item.streamKey ?? '',
      case: item.case,
    }
  })
}

function findFullPathByLastValue(
    lastValue: string | number,
    options: any[],
    currentPath: (string | number)[] = [],
    valueKey: string = 'id'
): (string | number)[] | null {
  for (const option of options) {
    const newPath = [...currentPath, option[valueKey]]
    if (
        String(option[valueKey]) === String(lastValue) &&
        (!option.children || option.children.length === 0)
    ) {
      return newPath
    }
    if (option.children?.length > 0) {
      const found = findFullPathByLastValue(lastValue, option.children, newPath, valueKey)
      if (found) return found
    }
  }
  return null
}

function processCascaderValue(item: any, value: any): any {
  if (item.type === 'Cascader' && item.cascader) {
    if (item.cascader.emitPath === false && value !== null && value !== undefined) {
      if (
          !Array.isArray(value) ||
          (Array.isArray(value) && value.length > 0 && !Array.isArray(value[0]))
      ) {
        const valueKey = item.cascader.value || 'id'
        const fullPath = findFullPathByLastValue(
            value,
            cascaderOptionsMap.value,
            [],
            valueKey
        )
        if (fullPath) return fullPath
      }
    }
  }
  return value
}

function formatDateTime(val: any) {
  if (!val) return null

  if (typeof val === 'string') {
    const text = val.trim()
    if (!text) return null
    // "YYYY-MM-DD HH:mm:ss" → ISO
    if (text.includes(' ') && !text.includes('T')) {
      return text.replace(' ', 'T')
    }
    return text
  }

  const d = val instanceof Date ? val : new Date(val)
  if (Number.isNaN(d.getTime())) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function changeDialog(edit: 'create' | 'edit', data?: any) {
  editMode.value = edit
  Object.keys(formItem).forEach(key => delete formItem[key])

  await loadSelectOptions(props.config.formItem, optionsMap)

  props.config.formItem.forEach(item => {
    const rawValue = edit === 'create' ? item.initialValue : data?.[item.prop]

    if (item.type === 'suitCase') {
      formItem[item.prop] =
          edit === 'create'
              ? (rawValue ?? [])
              : normalizeSuitCaseInfo(
                  data?.caseInfo ?? rawValue ?? [],
                  data?.selectList ?? [],
                  suitCaseOptionsMap.value
              )
    } else if (item.type === 'suitArgs') {
      const suitIds =
          edit === 'create'
              ? (item.initialValue ?? [])
              : parseArgsToSuitIds(data?.args)

      formItem[item.prop] = suitIds

      if (edit === 'edit' && suitIds.length && optionsMap[item.prop]?.data?.list) {
        optionsMap[item.prop].data.list = ensureSuitOptionsInList(
            suitIds,
            optionsMap[item.prop].data.list,
            item.key,
            item.value
        )
      }
    } else if (
        !['runCycleType', 'runTime', 'runWeekDay', 'runMonthDay', 'cronExpression'].includes(item.prop)
    ) {
      formItem[item.prop] = processCascaderValue(item, rawValue)
    }
  })

  if (edit === 'edit') {
    applyRunCycleToForm(formItem, data ?? {})
  } else {
    applyRunCycleToForm(formItem, {
      runCycleType: 'daily',
      runTime: '09:00:00',
      runWeekDay: '1',
      runMonthDay: '1',
      cronExpression: '0 9 * * *',
    })
  }

  formItem['updateUser'] = localCache.getCache('email') || '未知'
  suitCaseRenderKey.value++
  moduleShow.value = !moduleShow.value
}

function sumbitAction() {
  ruleFormRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error('数据错误')
      return
    }

    const submitData = { ...formItem }
    const runCycleType = formItem.runCycleType || 'daily'

    if (runCycleType === 'weekly' && !formItem.runWeekDay) {
      ElMessage.error('请选择运行日')
      return
    }
    if (runCycleType === 'monthly' && !formItem.runMonthDay) {
      ElMessage.error('请选择运行日期')
      return
    }
    if (runCycleType !== 'custom' && !formItem.runTime) {
      ElMessage.error('请选择运行时间')
      return
    }
    if (runCycleType === 'custom' && !String(formItem.cronExpression || '').trim()) {
      ElMessage.error('请输入 Cron 表达式')
      return
    }

    try {
      const cronParts = buildCronFromRunCycle(formItem)
      submitData.cronMinute = cronParts.cronMinute
      submitData.cronHour = cronParts.cronHour
      submitData.cronDayOfWeek = cronParts.cronDayOfWeek
      submitData.cronDayOfMonth = cronParts.cronDayOfMonth
      submitData.cronMonthOfYear = cronParts.cronMonthOfYear
    } catch (e: any) {
      ElMessage.error(e?.message ?? '运行周期配置错误')
      return
    }

    for (const item of props.config.formItem) {
      if (item.type === 'suitArgs' && item.submitProp) {
        const taskCode = formItem.task
        const suitIds = formItem[item.prop]

        if (!suitIds?.length) {
          ElMessage.error('请至少选择一个套件')
          return
        }
        if (taskCode === 'celerys.tasks.SuitRequest' && suitIds.length > 1) {
          ElMessage.error('「接口套件执行」只能选择一个套件')
          return
        }

        submitData[item.submitProp] = JSON.stringify(
            buildArgsFromSuitIds(taskCode, suitIds)
        )
        delete submitData[item.prop]
      }

      if (
          (item.type === 'Cascader' || item.type === 'suitCase') &&
          item.submitProp &&
          item.mapKey
      ) {
        if (item.type === 'suitCase') {
          submitData[item.submitProp] = (formItem[item.prop] || []).map((row: any) => {
            const globalMap: Record<string, string> = {}
            ;(row.items || []).forEach((kv: { key?: string; value?: string }) => {
              const key = String(kv.key ?? '').trim()
              if (key) {
                globalMap[key] = kv.value ?? ''
              }
            })
            return {
              caseId: Number(row.caseId ?? row.case?.caseId),
              execution_order: row.execution_order ?? 0,
              is_first: row.is_first ?? false,
              is_last: row.is_last ?? false,
              is_stream: row.is_stream ?? false,
              changeSid: row.changeSid ?? false,
              changeSidKey: row.changeSidKey ?? '',
              streamKey: row.streamKey ?? '',
              globalMap,
            }
          })
        } else {
          submitData[item.submitProp] = formItem[item.prop]
        }
        delete submitData[item.prop]
      }
    }

    submitData.start_time = formatDateTime(submitData.start_time)
    submitData.expires = formatDateTime(submitData.expires)

    if (typeof submitData.kwargs === 'object' && submitData.kwargs !== null) {
      submitData.kwargs = JSON.stringify(submitData.kwargs)
    }
    if (typeof submitData.headers === 'object' && submitData.headers !== null) {
      submitData.headers = JSON.stringify(submitData.headers)
    }

    // 仅对普通文本去空格，不要动时间 / cron / JSON
    const skipSpaceStrip = new Set([
      'start_time',
      'expires',
      'cronExpression',
      'args',
      'kwargs',
      'headers',
    ])

    Object.keys(submitData).forEach(key => {
      if (typeof submitData[key] === 'string' && !skipSpaceStrip.has(key)) {
        submitData[key] = submitData[key].replace(/\s/g, '')
      }
    })

    moduleShow.value = !moduleShow.value
    emit('sumbitAction', editMode, processEmptyString(submitData))
  })
}

export interface CommonModelExpose {
  changeDialog: (edit: 'create' | 'edit', data?: any) => void
}


defineExpose({
  changeDialog,
})
</script>

<template>
  <el-dialog
      v-model="moduleShow"
      :title="editMode === 'create' ? `新增${config.title}` : `编辑${config.title}`"
      :width="'50%'"
      :before-close="handleClose"
  >
    <el-form
        ref="ruleFormRef"
        :model="formItem"
        :rules="rule"
        label-position="right"
        @submit.prevent="sumbitAction"
    >
      <template v-for="item in localConfig.formItem" :key="`${item.prop}_${item.label}`">
        <template v-if="shouldShowField(item)">
          <template v-if="item.type === 'input'">
            <el-form-item v-bind="item">
              <el-input v-model="formItem[item.prop]" v-bind="item" />
            </el-form-item>
          </template>
          <template v-else-if="item.type === 'radio'">
            <el-form-item v-bind="item" :prop="item.prop">
              <el-radio-group
                  v-model="formItem[item.prop]"
                  :class="item.prop === 'runMonthDay' ? 'month-day-radio-group' : 'inline-radio-group'"
              >
                <template v-if="item.prop === 'runMonthDay'">
                  <el-radio-button
                      v-for="op in item.options"
                      :key="op[item.key]"
                      :value="op[item.key]"
                  >
                    {{ op[item.value] }}
                  </el-radio-button>
                </template>
                <template v-else>
                  <el-radio
                      v-for="op in item.options"
                      :key="op[item.key]"
                      :value="op[item.key]"
                  >
                    {{ op[item.value] }}
                  </el-radio>
                </template>
              </el-radio-group>
            </el-form-item>
          </template>
          <template v-else-if="item.type === 'select' && item.options">
            <el-form-item v-bind="item" :prop="item.prop">
              <el-select
                  v-model="formItem[item.prop]"
                  :placeholder="item.placeholder"
                  style="width: 100%"
              >
                <el-option
                    v-for="op in item.options"
                    :key="op[item.key]"
                    :label="op[item.value]"
                    :value="op[item.key]"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'select'">
            <el-form-item v-bind="item">
              <el-select
                  v-model="formItem[item.prop]"
                  :placeholder="item.placeholder"
                  filterable
                  :multiple="item.multiple"
                  style="width: 100%"
              >
                <el-option
                    v-for="op in optionsMap[item.prop]?.data?.list ?? []"
                    :key="op[item.key]"
                    :label="op[item.value]"
                    :value="op[item.key]"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'suitArgs'">
            <el-form-item v-bind="item" :prop="item.prop">
              <el-select
                  v-model="formItem[item.prop]"
                  :placeholder="item.placeholder"
                  filterable
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  style="width: 100%"
              >
                <el-option
                    v-for="op in optionsMap[item.prop]?.data?.list ?? []"
                    :key="op[item.key]"
                    :label="op[item.value]"
                    :value="op[item.key]"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'timeOnly'">
            <el-form-item v-bind="item" :prop="item.prop">
              <el-time-picker
                  v-model="formItem[item.prop]"
                  format="HH:mm"
                  value-format="HH:mm:ss"
                  :placeholder="item.placeholder"
                  style="width: 100%"
              />
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'switch'">
            <el-form-item v-bind="item">
              <el-switch v-model="formItem[item.prop]" />
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'number'">
            <el-form-item v-bind="item">
              <el-input-number
                  v-model="formItem[item.prop]"
                  :controls="false"
                  controls-position="right"
              />
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'single'">
            <el-form-item v-bind="item">
              <el-radio-group v-model="formItem[item.prop]">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'obj'">
            <el-form-item v-bind="item">
              <el-input
                  v-model="formItem[item.prop]"
                  :rows="5"
                  type="textarea"
                  placeholder="Please input"
              />
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'express'">
            <el-form-item v-bind="item">
              <CommonExpresses :express-item="formItem[item.prop]" />
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'suitCase'">
            <el-form-item v-bind="item">
              <CommonSuitCase
                  :key="suitCaseRenderKey"
                  :suit-case="formItem[item.prop]"
                  :option-map="suitCaseOptionsMap"
                  :cascader-config="item.cascader"
              />
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'Cascader'">
            <el-form-item :label="item.label">
              <el-cascader
                  v-model="formItem[item.prop]"
                  :options="cascaderOptionsMap"
                  :props="item.cascader"
                  :placeholder="item.placeholder"
                  clearable
                  filterable
                  :show-all-levels="false"
              />
            </el-form-item>
          </template>

          <template v-else-if="item.type === 'time'">
            <el-form-item v-bind="item">
              <el-date-picker
                  v-model="formItem[item.prop]"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  style="width: 100%"
              />
            </el-form-item>
          </template>
        </template>
      </template>

      <div class="dialog-footer">
        <el-form-item>
          <el-button @click="moduleShow = false">取消</el-button>
          <el-button type="primary" native-type="submit">确认</el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.item {
  flex-direction: row;
  justify-content: space-between;
}
</style>