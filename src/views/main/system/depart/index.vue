<script setup lang="ts">
import {reactive, ref} from "vue";
import CommonTable from "@/common/table/CommonTable.vue";
import CommonSearch from "@/common/table/CommonSearch.vue";
import CommonAdd from "@/common/operate/CommonAdd.vue";
import departConfig from "@/views/main/system/depart/configs/table-config.ts"

const caseSearch = reactive({
  departId: null,
  departName: null
})
const contentRef = ref<InstanceType<typeof CommonTable>>()
function search(data: any) {
  contentRef.value?.getTable(data)
  console.log("点击了查询，查询内容", data)
}
function reset(){
  contentRef.value?.getTable()
  console.log("点击了重置，查询内容")
}
</script>

<template>
  <!--    搜索栏-->
  <div>
    <CommonSearch
        :config="departConfig"
        @searchCase="search"
        @resetClick="reset"
    />
  </div>
  <!--    列表-->
  <div>

    <CommonTable
        ref="contentRef"
        :config="departConfig"
    />
  </div>
<!--  新增-->
  <div>
    <CommonAdd></CommonAdd>
  </div>
</template>

<style scoped>

</style>