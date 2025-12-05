<script setup lang="ts">
import {reactive, ref, computed } from "vue";
import {CirclePlusFilled, List, Refresh, Search} from "@element-plus/icons-vue";
import type {ElForm} from "element-plus";
import type {tableProps} from "@/common/types/main/type.ts";
import {localCache} from "@/utils/localcache.ts";
import {cascaderOptions} from "@/utils/formUtil.ts";

const props = defineProps<tableProps>()
const initialForm: any = reactive({})
props.config.search.props.forEach(item => {
  initialForm[item.prop] = item.initialValue ?? null
})
const formRef = ref<InstanceType<typeof ElForm>>()
const search = localCache.getCache("depart").list
const selectedValue = ref([])
// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  emitPath: false, // 是否返回完整路径
  checkStrictly: false // 是否严格的遵守父子不互相关联
}
const cascaderOptionsMap = cascaderOptions(search, props)
// 转换数据为级联选择器格式
// const cascaderOptions = computed(() => {
//   return search.map(depart => ({
//     id: depart.departId,
//     name: depart.departName,
//     children: depart.apply
//         .filter(apply => props?.config?.search?.cascade?.apply === true)
//         .map(apply => ({
//       id: apply.applyId,
//       name: apply.applyName,
//       children: apply.port
//           .filter(port => props?.config?.search?.cascade?.port === true)
//           .map(port => ({
//         id: port.portId,
//         name: port.portName,
//         // 可以添加更多属性用于显示
//         synopsis: port.synopsis,
//         portPath: port.portPath
//       }))
//     }))
//   }))
// })

// 处理选择变化
const handleChange = (value) => {
  console.log('选中的值:', value)
  console.log('选中的路径:', selectedValue.value)
}

const emit = defineEmits(['searchCase', 'resetClick'])
function searchCase() {
  emit('searchCase', initialForm)
}
function handleInputChange() {
  if (initialForm.departId === '') {
    initialForm.departId = null;
  }
}
// 重置操作
function handleRestClick() {
  formRef.value?.resetFields()
  for (const item of props.config.search.props) {
    initialForm[item.prop] = item.initialValue ?? ""
  }
  emit("resetClick")
}
</script>

<template>
  <div class="search">

    <el-form
      :model="initialForm"
      :inline="true"
    >
    <template class="itemcss">
      <template v-for="item in config.search.props">
        <template v-if="item.type==='Cascader'">
          <el-form-item :label="item.label">
            <el-cascader
                v-model="initialForm[item.prop]"
                :options="cascaderOptionsMap"
                :props="cascaderProps"
                :placeholder="item.placeholder"
                clearable
                filterable
                :show-all-levels=false
                @change="handleChange"
            />
          </el-form-item>
        </template>
        <template v-else-if="item.type==='input'">
          <el-form-item :label="item.label">
            <el-input
                v-model="initialForm[item.prop]"
                :placeholder="item.placeholder"
                @change="handleInputChange"></el-input>
          </el-form-item>
        </template>
      </template>
      <el-form-item>
        <el-button :icon=Refresh @click=handleRestClick round> 重置</el-button>
        <el-button type="primary" :icon=Search @click=searchCase round> 查询</el-button>
      </el-form-item>
    </template>
  </el-form>
  </div>
</template>

<style scoped>
.itemcss {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex-basis: calc(33.33% - 20px);
}
.search {
  border-bottom: 2px solid #e7edff;
  margin-bottom: 10px;
}
</style>