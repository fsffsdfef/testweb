<script setup lang="ts">

</script>

<template>
  <el-container class="layout">
    <el-aside class="aside" width="200px">Aside</el-aside>
    <el-container>
      <el-header class="header">Header</el-header>
      <el-main class="main">Main</el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100%;
}

.aside {
  background-color: antiquewhite;
}

.header {
  background-color: aquamarine;
}

.main {
  background-color: azure;
}
</style>