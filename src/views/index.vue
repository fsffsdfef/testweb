<script setup lang="ts">
import MenusView from "@/views/sidebar/MenusView.vue";
import TopView from "@/views/top/TopView.vue";
</script>

<template>
  <el-container class="layout">
    <el-aside class="aside" width="auto">
      <MenusView></MenusView>
    </el-aside>
    <el-container>
      <el-header class="header">
        <TopView></TopView>
      </el-header>
      <el-main class="main">
        <el-scrollbar>
          <router-view></router-view>
        </el-scrollbar>
        </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100%;
}

.aside {

}

.header {
  background: #ffffff linear-gradient(-180deg, #e7edff 0%, rgba(255, 255, 255, 0.5) 100%);
  display: flex;
}

.main {

}
</style>