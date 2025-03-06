<script setup lang="ts">

const props = defineProps({
  btnList: {
    default: []
  }
})
</script>

<template>
  <div class="tool">
    <div v-for="btn in btnList">
      <el-button type="primary" :icon="btn.icon" round>{{ btn.btnName }}</el-button>
    </div>
  </div>
</template>

<style scoped>
.tool {
  display: flex;
  align-content: center;
  justify-content: flex-start;
  margin-bottom: 10px;
}
</style>