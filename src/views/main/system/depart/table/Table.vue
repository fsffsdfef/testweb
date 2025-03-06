<script setup lang="ts">
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {reactive} from "vue";
import CommonTable from "@/common/table/commonTable.vue";
import {CirclePlusFilled, Delete, Download, Histogram, Upload} from "@element-plus/icons-vue";
import CommonTool from "@/common/table/CommonTool.vue";

const departDate = reactive({
  tableDate: [],
  indexKey: "departId",
  column: [
    {
      prop: "departId",
      label: "部门ID"
    },
    {
      prop: "departName",
      label: "部门名"
    },
    {
      prop: "updated_date",
      label: "更新时间"
    },
    {
      prop: "update_user",
      label: "更新人"
    }
  ]
})
const toolDate = reactive([
  {
    icon: Delete,
    btnName: "新增部门"
  }
])
onMounted(async ()=>{
  const data = await BaseRequest({
    url: "depart",
    method: "GET"
  })
  departDate.tableDate = data.data
})

function editDepart(indexKey){
  console.log("子组件点击了编辑按钮")
}

function delDepart(indexKey){
  console.log(`子组件点击了${indexKey.departId}的删除按钮`)
}
</script>

<template>
  <CommonTool :btnList="toolDate"></CommonTool>
<CommonTable :date="departDate" :editFunction="editDepart" :delFunction="delDepart"></CommonTable>
</template>

<style scoped>

</style>