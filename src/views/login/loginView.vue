<script setup lang="ts">
import AccountView from "@/views/login/AccountView.vue";
import ShowView from "@/views/login/ShowView.vue";
</script>

<template>
  <el-container style="height: 100%">
    <el-aside>
      <ShowView></ShowView>
    </el-aside>
    <el-main>
      <AccountView></AccountView>
    </el-main>
  </el-container>
</template>

<style scoped>
.el-aside{
  background-color: lightskyblue;
  opacity: 0.9;
  width: 50%;
}
.el-main{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>