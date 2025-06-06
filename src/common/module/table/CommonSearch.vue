<script setup lang="ts">
import {reactive, ref} from "vue";
import {CirclePlusFilled, List, Refresh, Search} from "@element-plus/icons-vue";
import type {ElForm} from "element-plus";
import type {tableProps} from "@/common/types/main/type.ts";

const props = defineProps<tableProps>()
const initialForm: any = reactive({})
props.config.search.props.forEach(item => {
  initialForm[item.prop] = item.initialValue ?? null
})
const formRef = ref<InstanceType<typeof ElForm>>()
const emit = defineEmits(['searchCase', 'resetClick'])
function searchCase() {
  emit('searchCase', initialForm)
}
// function handleInputChange() {
//   if (initialForm.departId === '') {
//     initialForm.departId = null;
//   }
// }
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