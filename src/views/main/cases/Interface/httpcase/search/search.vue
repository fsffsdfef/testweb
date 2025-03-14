<script setup lang="ts">
import {reactive, ref} from "vue";
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {Search} from "@element-plus/icons-vue";
import interfaceCaseStore from "@/stores/main/case/interfaceCase";
const tableCase = interfaceCaseStore()
const emit = defineEmits(['searchCase'])
const caseSearch = reactive({
  caseName: "",
  portId: "",
  isCore: "all",
  update_user: ""
})
onMounted(async () => {
  const portGroupData = await BaseRequest({
    url: "portGroup",
    method: "GET"
  })
  options.value = portGroupData.data
})
const cascaderProps = {
  value: "id",
  label: "name",
  children: "list",
  emitPath: false
}
const options = ref([])
const core = [
  {
    label: "核心",
    value: true
  },
  {
    label: "非核心",
    value: false
  },
  {
    label: "全部",
    value: "all"
  }
]

function searchCase(){
  emit('searchCase', caseSearch)
}
</script>

<template>
  <el-form
      :inline="true"
      v-model="caseSearch"
  >
    <div class="itemcss">
      <el-form-item label="接口">
        <el-cascader
            v-model="caseSearch.portId"
            :options="options"
            :props="cascaderProps"
            :show-all-levels="false"
            placeholder="请选择接口"
            clearable/>
      </el-form-item>
      <el-form-item label="用例名">
        <el-input
            v-model="caseSearch.caseName"
            placeholder="请输入用例名搜索"
            clearable
        >
        </el-input>
      </el-form-item>
      <el-form-item label="是否为核心">
        <el-select
            v-model="caseSearch.isCore"
            style="width: 300px"
        >
          <el-option
              v-for="option in core"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="searchCase">查询</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<style scoped>
.itemcss {
  display: flex;
  align-items: center;
}
</style>