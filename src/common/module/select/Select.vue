<script setup lang="ts">
import { ref } from 'vue'

const value = ref('Option1')
const options = [
  {
    value: 'Option1',
    label: '选择1',
  },
  {
    value: 'Option2',
    label: '选择2',
  },
  {
    value: 'Option3',
    label: '选择3',
  }
]
</script>

<template>
  <el-select
      v-model="value"
      filterable
      placeholder="Select"
      style="width: 240px"
  >
    <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
    />
  </el-select>
</template>

<style scoped>

</style>