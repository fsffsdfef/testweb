<script setup lang="ts">
import CommonTable from "@/common/table/commonTable.vue";
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {reactive, ref} from "vue";
const userDate = reactive({
  column: [
    {
      prop: "userId",
      label: "用户ID"
    },
    {
      prop: "userName",
      label: "用户名"
    },
    {
      prop: "email",
      label: "邮箱"
    },
    {
      prop: "phone",
      label: "手机号"
    }
  ],
  tableData: []
})

onMounted(async ()=> {
  const userData = await BaseRequest({
    url: 'user',
    method: 'GET'
  })
  userDate.tableData = userData.data
})

</script>
<template>
  <div>
    <common-table :date="userDate"/>
  </div>

</template>

<style scoped>

</style>