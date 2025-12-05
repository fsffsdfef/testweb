<script setup lang="ts">
import CommonPage from "@/common/module/CommonPage.vue";
import departConfig from "@/views/main/system/depart/configs/table-config.ts"
import addConfig from "@/views/main/system/depart/configs/operation-config.ts";

const pageConfig = {
  tableConfig: departConfig,
  operationConfig: addConfig
}

</script>

<template>
  <CommonPage :config="pageConfig" />
</template>

<style scoped>

</style>