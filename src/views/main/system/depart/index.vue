<script setup lang="ts">

import Table from "@/views/main/system/depart/table/table.vue";
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>Header</el-header>
      <el-main>
        <Table></Table>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.el-header {
  height: 20%;
  border: 1px solid black;
}
.el-main {
  height: 80%;
}
</style>