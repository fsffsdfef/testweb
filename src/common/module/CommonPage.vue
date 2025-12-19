<script setup lang="ts">
import { ref } from "vue";
import CommonTable, {type CommonTableExpose} from "@/common/module/table/CommonTable.vue";
import CommonSearch from "@/common/module/table/CommonSearch.vue";
import CommonModel, {type CommonModelExpose}from "@/common/module/operate/CommonModel.vue";
import ReqActionDataModel, {type ReqDataModelExpose} from "@/common/module/table/drawer/ReqActionDataModel.vue";
import CommonPaginator from "@/common/module/table/CommonPaginator.vue";


interface PageConfig {
  tableConfig: any;
  operationConfig: any;
}
const props = defineProps<{
  config: PageConfig;
}>();

const contentRef = ref<CommonTableExpose>();
const modelRef = ref<CommonModelExpose>();
const reqDataRef = ref<ReqDataModelExpose>()

// 通用方法
function search(data: any) {
  contentRef.value?.getTable(data);
}

function reset() {
  contentRef.value?.getTable();
}

function changeSize(data: any) {
  contentRef.value?.getTable(data);
}

function changePage(data: any) {
  contentRef.value?.getTable(data);
}

function updateEditModel(edit: string, data?: any) {
  modelRef.value?.changeDialog(edit, data);
}

function updateReqModel(data, show) {
  reqDataRef.value?.getReqData(data, show)
}
function modelSubmit(edit: string, data: any) {
  if (edit.value === 'edit') {
    contentRef.value?.updateTable(data);
  } else {
    contentRef.value?.addTable(data);
  }
}

</script>

<template>
  <!--    搜索栏-->
  <div>
    <CommonSearch
        :config="config.tableConfig"
        @searchCase="search"
        @resetClick="reset"
    />
  </div>
  <!--    列表-->
  <div>

    <CommonTable
        ref="contentRef"
        :config="config.tableConfig"
        @editAction="updateEditModel"
        @addAction="updateEditModel"
        @operation="updateReqModel"
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
        :config="config.operationConfig"
        @sumbitAction="modelSubmit"
    />
  </div>
  <!-- 查看-->
  <div>
    <ReqActionDataModel
      ref="reqDataRef"
    />
  </div>
</template>

<style scoped>

</style>