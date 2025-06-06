<script setup lang="ts">
import {reactive, ref} from "vue";
import CommonTable from "@/common/module/table/CommonTable.vue";
import CommonSearch from "@/common/module/table/CommonSearch.vue";
import CommonModel from "@/common/module/operate/CommonModel.vue";
import CommonPaginator from "@/common/module/table/CommonPaginator.vue";
import departConfig from "@/views/main/system/depart/configs/table-config.ts"
import addConfig from "@/views/main/system/depart/configs/operation-config.ts";

const contentRef = ref<InstanceType<typeof CommonTable>>()
const modelRef = ref<InstanceType<typeof CommonModel>>()
function search(data: any) {
  contentRef.value?.getTable(data)
}
function reset(){
  contentRef.value?.getTable()
}

function changeSize(data: any){
  contentRef.value?.getTable(data)
}
function changePage(data: any){
  contentRef.value?.getTable(data)
}

function updateEditModel(edit: string, data?: any){
  modelRef.value?.changeDialog(edit, data)
}

function modelSumbit(edit, data) {
  console.log(edit)
  if (edit=='edit') {
    contentRef.value?.updateTable(data)
  }
  else {
    contentRef.value?.addTable(data)
  }
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
        @editAction="updateEditModel"
        @addAction="updateEditModel"
    />
  </div>
<!--  分页-->
  <div>
    <CommonPaginator
      @changeSize="changeSize"
      @changePage="changePage"
    ></CommonPaginator>
  </div>
<!--  新增-->
  <div>
    <CommonModel
        ref="modelRef"
        :config="addConfig"
        @sumbitAction="modelSumbit"
    />
  </div>
</template>

<style scoped>

</style>