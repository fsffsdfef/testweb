<script setup lang="ts">
import {reactive, ref} from "vue";
import {CirclePlusFilled, List, Refresh, Search} from "@element-plus/icons-vue";
import type {ElForm} from "element-plus";
import type {departProps} from "@/views/main/system/depart/type.ts";

const props = defineProps<departProps>()
const initialForm: any = reactive({})
for (const item of props.config.search.props) {
  initialForm[item.prop] = item.initialValue ?? ""
}
const formRef = ref<InstanceType<typeof ElForm>>()
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
  <el-form
      :model="initialForm"
      :inline="true"
  >
    <template class="itemcss">
      <template v-for="item in config.search.props">
        <template v-if="item.type==='btn'">
          <el-form-item>
            <el-button type="primary" :icon="item.icon" @click="item.func" plain> {{ item.label }}</el-button>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :label="item.label">
            <el-input
                v-model="initialForm[item.prop]"
                :placeholder="item.placeholder"
                @change="handleInputChange"></el-input>
          </el-form-item>
        </template>
      </template>
      <el-form-item>
        <el-button :icon=Refresh @click=handleRestClick plain> 重置</el-button>
        <el-button type="primary" :icon=Search @click=searchCase plain> 查询</el-button>
      </el-form-item>
    </template>
  </el-form>
</template>

<style scoped>
.itemcss {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex-basis: calc(33.33% - 20px);
}
</style>