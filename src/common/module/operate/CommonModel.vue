<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElForm, ElMessage, ElMessageBox} from 'element-plus'
import type {addProps} from "@/common/types/main/type.ts";
import {Upload, CirclePlus, List, Download, Search, CirclePlusFilled} from "@element-plus/icons-vue";
import {Add, Del, Update, getPageList} from "@/api/main/system/api.ts";
import BaseRequest from "@/service";
import {localCache} from "@/utils/localcache.ts";

const optionsMap = reactive({})
const cascaderOption = localCache.getCache('menuList')
onMounted(async () => {
  props.config.formItem.forEach(async item => {
    if (item.type === 'select') {
      optionsMap[item.prop] = await getPageList(item.prop)
    }
  })
  // const cascaderMap = await getCascaderOption()
  // cascaderOption.push(...cascaderMap)
})
async function getCascaderOption() {
  const option = await BaseRequest({
    'url': 'card',
    'method': 'GET'
  })
  return option.data
}
// 获取父组件传入数据
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
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭吗')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
}
const emit = defineEmits(['sumbitAction'])
const localConfig = computed(() => ({
  ...props.config,
  formItem: editMode.value === 'create'
      ? props.config.formItem.filter(item => !item.isIndex)
      : [...props.config.formItem]
}))

// 根据传入类型，初始化数据内容
function changeDialog(edit, data?) {
  editMode.value = edit
  // 清空默认数据
  Object.keys(formItem).forEach(key => delete formItem[key])
  // 新增2：初始化表单结构
  props.config.formItem.forEach(item => {
        formItem[item.prop] = edit === 'create'
            ? item.initialValue  // 创建模式用初始值
            : data?.[item.prop] // 编辑模式用传入数据
      }
  )
  moduleShow.value = !moduleShow.value
}
const cascaderProps = {
  value: 'menuId',
  label: 'menuName',
  checkStrictly: true,
  emitPath: false
}
function handleInputChange() {
  if (initialForm.departId === '') {
    initialForm.departId = null;
  }
}

function addChild() {
  formItem.expressItem[0].expressList.push({
    matchKey: "",
    matchValue: "",
    keyType: "",
    matchValueType: "",
    matchOper: ""
  });
}

const removeDomain = (item) => {
  const index = formItem.expressItem[0].expressList.indexOf(item)
  if (index !== -1) {
    formItem.expressItem[0].expressList.splice(index, 1)
  }
}
const matchMap = [
  {
    label: '等于',
    value: '=='
  },
  {
    label: '大于等于',
    value: '>='
  },
  {
    label: '小于等于',
    value: '<='
  },
  {
    label: '不等于',
    value: '!='
  },
  {
    label: '包含于',
    value: 'in'
  },
  {
    label: '包含于',
    value: '不包含于'
  },
  {
    label: '不为空',
    value: '!=null'
  }

]
const typeMap = [
  {
    label: "字符串",
    value: "str"
  },
  {
    label: "整数",
    value: "int"
  },
  {
    label: "数组",
    value: "list"
  }
]

// 校验传参，并将事件暴露给父组件
function sumbitAction() {
  ruleFormRef.value?.validate((valid) => {
    if (valid) {
      moduleShow.value = !moduleShow.value
      console.log('formItem', formItem)
      emit("sumbitAction", editMode.value, formItem)
    } else {
      ElMessage.error('数据错误')
    }
  })
}

function test() {
  ruleFormRef.value?.validate((valid) => {
    if (valid) {
      moduleShow.value = !moduleShow.value
    } else {
      ElMessage.error('数据错误')
    }
  })
}

defineExpose({changeDialog})
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
    >
      <template v-for="item in localConfig.formItem">
        <template v-if="item.type==='input'">
          <el-form-item v-bind="item">
            <el-input
                v-model="formItem[item.prop]"
                v-bind="item"
                @change="handleInputChange"></el-input>
          </el-form-item>
        </template>
        <template v-else-if="item.type==='select'">
          <el-form-item v-bind="item">
            <el-select
                v-model="formItem[item.prop]"
                :placeholder="item.placeholder"
                filterable
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
            <el-form
                v-for="(express, index) in formItem[item.prop][0].expressList"
                :key="index"
                label-position="left"
            >
              <el-form-item :label="'规则' + (index+1)" class="item">
                <el-input
                    v-model="express['matchKey']"
                    placeholder="需要校验的字段"
                    style="width: 15%;"
                />
                <el-input
                    v-model="express['keyType']"
                    placeholder="校验的字段类型"
                    style="width: 15%; padding-left: 5px"
                />
                <el-input
                    v-model="express['matchOper']"
                    placeholder="校验条件"
                    style="width: 15%; padding-left: 5px"
                />
                <el-input
                    v-model="express['matchValueType']"
                    style="width: 15%; padding-left: 5px"
                />
                <el-input
                    v-model="express['matchValue']"
                    placeholder="预期"
                    style="width: 15%; padding-left: 5px"
                />
                <div style="align-items: center; width: 15%">
                  <el-button type="primary" @click="addChild" :icon="CirclePlusFilled" circle></el-button>
                  <el-button
                      type="danger"
                      v-show="formItem[item.prop][0].expressList.length>1"
                      @click.prevent="removeDomain(express)"
                      icon="RemoveFilled" circle/>
                </div>
              </el-form-item>
            </el-form>
          </el-form-item>
        </template>
        <template v-else-if="item.type==='cascader'">
          <el-form-item v-bind="item">
            <el-cascader
                :v-model="formItem[item.prop]"
                :props="cascaderProps"
                :placholder="item.placeholder"
                :options="cascaderOption"
                separator=">"
                filterable
                clearable
            >
            </el-cascader>
          </el-form-item>
        </template>
      </template>
      <div class="dialog-footer">
        <el-form-item>
          <el-button @click="moduleShow = false">取消</el-button>
          <el-button type="primary" @click="sumbitAction">
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