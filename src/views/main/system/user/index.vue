<script setup lang="ts">
import CommonPage from "@/common/module/CommonPage.vue";
import addConfig from "@/views/main/system/user/configs/operation-config.ts";
import userConfig from "@/views/main/system/user/configs/table-config.ts";

const pageConfig = {
  tableConfig: userConfig,
  operationConfig: addConfig
}
</script>

<template>
 <CommonPage :config="pageConfig"></CommonPage>
</template>

<style scoped>

</style>