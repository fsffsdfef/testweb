<script setup lang="ts">
import CommonPage from "@/common/module/CommonPage.vue";
import applyConfig from "@/views/main/system/apply/configs/table-config.ts"
import addConfig from "@/views/main/system/apply/configs/operation-config.ts";

const pageConfig = {
  tableConfig: applyConfig,
  operationConfig: addConfig
}
</script>

<template>
 <CommonPage :config="pageConfig"></CommonPage>
</template>

<style scoped>

</style>