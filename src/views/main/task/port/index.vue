<script setup lang="ts">
import CommonPage from "@/common/module/CommonPage.vue";
import addConfig from "@/views/main/task/port/configs/operation-config.ts";
import portTaskConfig from "@/views/main/task/port/configs/table-config.ts";

const pageConfig = {
  tableConfig: portTaskConfig,
  operationConfig: addConfig
}
</script>

<template>
  <CommonPage :config="pageConfig"></CommonPage>

</template>

<style scoped>

</style>