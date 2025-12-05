<script setup lang="ts">
import CommonPage from "@/common/module/CommonPage.vue";
import addConfig from "@/views/main/cases/Interface/httpcase/configs/operation-config.ts";
import httpCaseConfig from "@/views/main/cases/Interface/httpcase/configs/table-config.ts";

const pageConfig = {
  tableConfig: httpCaseConfig,
  operationConfig: addConfig
}
</script>

<template>
  <CommonPage :config="pageConfig"></CommonPage>
</template>

<style scoped>

</style>