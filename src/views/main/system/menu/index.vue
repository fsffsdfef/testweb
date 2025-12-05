<script setup lang="ts">
import CommonPage from "@/common/module/CommonPage.vue";
import MenuConfig from "@/views/main/system/menu/configs/table-config.ts"
import addConfig from "@/views/main/system/menu/configs/operation-config.ts";

const pageConfig = {
  tableConfig: MenuConfig,
  operationConfig: addConfig
}

</script>

<template>
  <CommonPage :config="pageConfig"></CommonPage>
</template>

<style scoped>

</style>