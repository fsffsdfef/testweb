<script setup lang="ts">
import systemStore from "@/stores/main/system/systemStore.ts";
import type {reqActionProps} from "@/common/module/table/drawer/type.ts";
import {reactive, ref} from "vue";
const props = defineProps<reqActionProps>()
const sys = systemStore()

const moduleShow = ref(false)
const resData = sys.showData
console.log("xxxx", resData)
function handleClose(){
  moduleShow.value = false
}
function changeShow(data:any, show:boolean){
  moduleShow.value = show
}

function getReqData(data:any) {
  sys.taskAction(data)
}
export interface ReqDataModelExpose {
  changeShow: (data: any, show: boolean) => void;
  getReqData: (data: any) => void
}
const expose: ReqDataModelExpose = {
  changeShow,
  getReqData
};
defineExpose(expose)
</script>

<template>
    <el-drawer
        v-model="moduleShow"
        :title="resData.caseName"
        direction="btt"
        size="80%"
        :before-close="handleClose"
    >
      <div>
        <label>ID：{{resData.caseId}}</label>
        <label>请求方法: {{resData.req.method}}</label>
        <label>请求方法: {{resData.req.url}}</label>
      </div>
      <div v-for="assert in resData.assert.assertInfo">
        <span>规则组ID: {{assert.groupID}}</span>
        <span>断言结果: {{assert.final}}</span>
        <div v-for="express in assert.expressInfo">
          <span>规则ID: {{express.expressId}}</span>
          <span>断言结果: {{express.assert}}</span>
          <span>规则：{{express.oper}}</span>
        </div>
      </div>
      <div class="layout">
        <el-container>
          <el-aside width=50% height=100%>{{ resData.req.data}}</el-aside>
          <el-main>{{ resData.res }}</el-main>
        </el-container>
      </div>
    </el-drawer>
</template>

<style scoped>

</style>


