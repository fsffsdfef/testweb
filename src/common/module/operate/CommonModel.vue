<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElForm, ElMessage, ElMessageBox} from 'element-plus'
import type {addProps} from "@/common/types/main/type.ts";
import {localCache} from "@/utils/localcache.ts";
import CommonExpresses from "@/common/module/operate/CommonExpresses.vue";
import CommonSuitCase from "@/common/module/operate/CommonSuitCase.vue";
import {cascaderOptions, loadSelectOptions, processEmptyString} from "@/utils/formUtil.ts";

const optionsMap = reactive([])
const props = defineProps<addProps>()
// 获取配置文件中的校验配置
const rule = reactive<FormRules>(props.config.rules)
const ruleFormRef = ref<FormInstance>()
// 初始化组件类型
const editMode = ref<'create' | 'edit'>('create')
// 初始化组件状态
const moduleShow = ref(false)
const initialForm: any = {}
const formItem = reactive(initialForm)
// 获取组件展示元素
const localConfig = computed(() => ({
  ...props.config,
  formItem: editMode.value === 'create'
      ? props.config.formItem.filter(item => !item.isIndex)
      : [...props.config.formItem.filter((item => !item.pass))]
}))
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭吗')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
}
const cascaderOptionsMap = cascaderOptions(localCache.getCache("depart").list, props)

const emit = defineEmits(['sumbitAction'])
function findFullPathByLastValue(
    lastValue: string | number,
    options: any[],
    currentPath: (string | number)[] = [],
    valueKey: string = 'id'
): (string | number)[] | null {
  for (const option of options) {
    const newPath = [...currentPath, option[valueKey]]
    // 如果当前选项的值匹配，且没有子节点，说明找到了
    if (option[valueKey] === String(lastValue) && (!option.children || option.children.length === 0)) {
      return newPath
    }

    // 如果有子节点，递归查找
    if (option.children && option.children.length > 0) {
      const found = findFullPathByLastValue(lastValue, option.children, newPath, valueKey)
      if (found) {
        return found
      }
    }
  }
}

/**
 * 处理级联选择器的数据回显
 * 如果配置了 emitPath: false，需要将单一值转换为完整路径
 */
function processCascaderValue(item: any, value: any): any {
  // 如果是级联选择器类型
  if (item.type === 'Cascader' && item.cascader) {
    // 如果配置了 emitPath: false，且值是单一值（不是数组），需要转换为完整路径
    if (item.cascader.emitPath === false && value !== null && value !== undefined) {
      // 判断是否是数组（完整路径）
      if (!Array.isArray(value) || (Array.isArray(value) && value.length > 0 && !Array.isArray(value[0]))) {
        // 单一值，需要查找完整路径
        const valueKey = item.cascader.value || 'id'
        const fullPath = findFullPathByLastValue(value, cascaderOptionsMap, [], valueKey)
        if (fullPath) {
          return fullPath
        }
      }
    }
  }
  return value
}
// 根据传入类型，初始化数据内容
function changeDialog(edit, data?) {
  editMode.value = edit
  // 清空默认数据
  Object.keys(formItem).forEach(key => delete formItem[key])
  // 获取select可选内容
  loadSelectOptions(props.config.formItem, optionsMap)
  // 新增2：初始化表单结构
  props.config.formItem.forEach(item => {
        // formItem[item.prop] = edit === 'create'
        //     ? item.initialValue  // 创建模式用初始值
        //     : data?.[item.prop] // 编辑模式用传入数据
        const rawValue = edit === 'create'
        ? item.initialValue  // 创建模式用初始值
        : data?.[item.prop] // 编辑模式用传入数据

    // 处理级联选择器的数据回显
    formItem[item.prop] = processCascaderValue(item, rawValue)
    // console.log("options", formItem[item.prop])
  })
  formItem["updateUser"] = localCache.getCache("email") || "未知"
  moduleShow.value = !moduleShow.value
}
// 校验传参，并将事件暴露给父组件
function sumbitAction() {
  ruleFormRef.value?.validate((valid) => {
    if (valid) {
      moduleShow.value = !moduleShow.value
      // 处理级联组件的数据转换
      const submitData = { ...formItem }
      props.config.formItem.forEach(item => {
        if ((item.type === 'Cascader'|| item.type === 'suitCase') && item.submitProp && item.mapKey) {
          // 将显示字段的数据复制到提交字段
          submitData[item.submitProp] = formItem[item.prop]
          // 删除显示字段（可选，根据后端需求）
          delete submitData[item.prop]
        }
      })
      // 新增：处理字符串字段的 \n 和 \t
      Object.keys(submitData).forEach(key => {
        if (typeof submitData[key] === 'string') {
          submitData[key] = submitData[key].replace(/\s/g, '')
        }
      })
      const value = processEmptyString(submitData)
      emit("sumbitAction", editMode, value)
    } else {
      ElMessage.error('数据错误')
    }
  })
}
export interface CommonModelExpose {
  changeDialog: (edit: string, data?: any) => void;
}
const expose: CommonModelExpose = {
  changeDialog
};
defineExpose(expose)
</script>

<template>
  <el-dialog
      v-model="moduleShow"
      :title="editMode === 'create'? `新增${config.title}`: `编辑${config.title}`"
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
      <template v-for="item in localConfig.formItem">
        <template v-if="item.type==='input'">
          <el-form-item v-bind="item">
            <el-input
                v-model="formItem[item.prop]"
                v-bind="item"
              ></el-input>
          </el-form-item>
        </template>
        <template v-else-if="item.type==='select'">
          <el-form-item v-bind="item">
            <el-select
                v-model="formItem[item.prop]"
                :placeholder="item.placeholder"
                filterable
                :multiple="item.multiple"
                style="width: 200px"
            >
              <el-option
                  v-for="op in optionsMap[item.prop]?.data.list"
                  :key="op[item.key]"
                  :label="op[item.value]"
                  :value="op[item.key]"
              />
            </el-select>
          </el-form-item>
        </template>
        <template v-else-if="item.type==='number'">
          <el-form-item v-bind="item">
            <el-input-number
                v-model="formItem[item.prop]"
                :controls="false"
                controls-position="right"/>
          </el-form-item>
        </template>
        <template v-else-if="item.type==='single'">
          <el-form-item v-bind="item">
            <el-radio-group v-model="formItem[item.prop]">
              <el-radio :value=true>是</el-radio>
              <el-radio :value=false>否</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
        <template v-else-if="item.type==='obj'">
          <el-form-item v-bind="item">
            <el-input
                v-model="formItem[item.prop]"
                :rows="5"
                type="textarea"
                placeholder="Please input"
            />
          </el-form-item>
        </template>
        <template v-else-if="item.type==='express'">
          <el-form-item v-bind="item">
            <CommonExpresses :express-item="formItem[item.prop]"></CommonExpresses>
          </el-form-item>
        </template>
        <template v-else-if="item.type==='suitCase'">
          <el-form-item v-bind="item">
            <CommonSuitCase :suit-case="formItem[item.prop]" :option-map="cascaderOptionsMap" :propData="item.cascader"></CommonSuitCase>
          </el-form-item>
        </template>
        <template v-if="item.type==='Cascader'">
          <el-form-item :label="item.label">
            <el-cascader
                v-model="formItem[item.prop]"
                :options="cascaderOptionsMap"
                :props="item.cascader"
                :placeholder="item.placeholder"
                clearable
                filterable
                :show-all-levels=false
            />
          </el-form-item>
        </template>
      </template>
      <div class="dialog-footer">
        <el-form-item>
          <el-button @click="moduleShow = false">取消</el-button>
          <el-button type="primary" native-type="submit">
            确认
          </el-button>
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