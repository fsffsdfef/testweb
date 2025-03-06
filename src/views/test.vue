<script setup lang="ts">
import ywzRequest from "@/service";
import CommonTable from "@/common/table/commonTable.vue";
async function getMenu() {
  const data = await ywzRequest({
    url: 'user/',
    method: 'GET'
  })
  console.log('data:',data)
}
</script>

<template>
<el-button @click="getMenu">点击</el-button>
  <common-table></common-table>
</template>

<style scoped>

</style>