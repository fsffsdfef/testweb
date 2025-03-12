<script setup lang="ts">

import Table from "@/views/main/system/business/table/Table.vue";
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>Select</el-header>
      <el-main>
        <Table></Table>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.el-header {
  height: 20%;
}
.el-main {
  height: 80%;
}
</style>