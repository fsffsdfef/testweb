<script setup lang="ts">

import Table from "@/views/main/system/user/table/Table.vue";
import search from "@/views/main/system/user/seach/search.vue"

</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header><search></search></el-header>
      <el-main>
        <Table></Table>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.el-header {
  height: 30%;
  border-bottom: 2px solid #DDDDDD;
}
.el-main {
  height: 70%;
}
</style>