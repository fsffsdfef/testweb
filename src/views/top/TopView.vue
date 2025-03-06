<script setup lang="ts">

</script>

<template>
  <div class="crumbs">
    <div>
      <el-icon size="25"><Expand /></el-icon>
    </div>
    面包屑
  </div>
  <div class="tool">
    <el-icon size="25"><UserFilled /></el-icon>
  </div>
</template>

<style scoped>
.crumbs {
  width: 70%;
  border-bottom-color: #2c3e50;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.tool {
  width: 30%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>