<script setup lang="ts">
import CommonTable from "@/common/table/CommonTable.vue";
import CommonTool from "@/common/table/CommonTool.vue";
import BaseRequest from "@/service";
import {reactive} from "vue";
import {onMounted} from "@vue/runtime-core";

const businessDate = reactive({
  tableDate: [],
  column: [
    {
      prop: "businessId",
      label: "业务线ID",
      update_user: "更新人",
      updated_date: "更新时间"
    },
    {
      prop: "businessName",
      label: "业务线",
      update_user: "更新人",
      updated_date: "更新时间"
    }
  ],
  indexKey: ""
})

onMounted(async () => {
  const data = await BaseRequest({
    url: "business",
    method: "GET"
  })
  businessDate.tableDate = data.data
})
</script>

<template>
  <CommonTable :date="businessDate"></CommonTable>
</template>

<style scoped>

</style>