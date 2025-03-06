<script setup lang="ts">
import CommonTable from "@/common/table/commonTable.vue";
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {ref} from "vue";
const tableData = ref([])
const batchSetting = ref(false)
const  column = [
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

onMounted(async ()=> {
  const userData = await BaseRequest({
    url: 'user',
    method: 'GET'
  })
  tableData.value = userData.data
})

</script>
<template>
  <div>
    <common-table
        :tableData="tableData"
        :column="column"
        :batchSetting="batchSetting"
    />
  </div>

</template>

<style scoped>

</style>