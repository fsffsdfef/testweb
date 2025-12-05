<script setup lang="ts">
import CommonPage from "@/common/module/CommonPage.vue";
import addConfig from "@/views/main/task/suit/configs/operation-config.ts";
import suitConfig from "@/views/main/task/suit/configs/table-config.ts";

const pageConfig = {
  tableConfig: suitConfig,
  operationConfig: addConfig
}
</script>

<template>
  <CommonPage :config="pageConfig"></CommonPage>

</template>

<style scoped>

</style>