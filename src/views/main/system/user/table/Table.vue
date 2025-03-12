<script setup lang="ts">
import CommonTable from "@/common/table/CommonTable.vue";
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {reactive} from "vue";
const userDate = reactive({
  tableDate: [],
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
  ]
})
onMounted(async ()=> {
  const data = await BaseRequest({
    url: 'user',
    method: 'GET'
  })
  userDate.tableDate = data.data
  console.log(userDate)
})

</script>
<template>
  <div>
    <CommonTable :date="userDate"></CommonTable>
  </div>

</template>

<style scoped>

</style>