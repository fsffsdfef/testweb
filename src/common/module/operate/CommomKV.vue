<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {CirclePlusFilled, RemoveFilled, Top} from "@element-plus/icons-vue";


interface KVItem {
  key: string
  value: string
}

interface SelectedItem {
  id: string | number // 内部ID，用于列表管理
  label: string // 显示标签
  caseId: string | number // 最后选中的值
  execution_order: number
  globalList: object
  is_first: boolean
  is_last: boolean
  is_stream: boolean
  streamKey: string
  items: KVItem[] // 每个case独立的键值对数组
}

const props = defineProps<{globalMap: {}}>()
const items = reactive<KVItem[]>([])

// 为特定case添加键值对
const addkv = (item: SelectedItem) => {
  // if (!item.items) {
  //   item.items = []
  // }
  // item.items.push({ key: '', value: '' })
  items.push({ key: '', value: '' })
  // 更新globalList
  updateGlobalList(item)
}

// 为特定case删除键值对
const removekv = (item: SelectedItem, index: number) => {
  if (item.items) {
    item.items.splice(index, 1)
    // 更新globalList
    updateGlobalList(item)
  }
}
// 更新特定case的globalList
const updateGlobalList = (items) => {
  const demo = aa.value
  if (items) {

    items.forEach(kvItem => {
      if (kvItem.key && kvItem.key.trim()) {
        demo[kvItem.key.trim()] = kvItem.value || ''
      }
    })
  }
  aa.value = demo
}
const aa = ref({})
</script>
<template>
  {{aa}}
  <div v-for="(kvItem, kvIndex) in (items || [])" :key="kvIndex">
    <div class="kv">
      <el-input
          v-model="kvItem.key"
          placeholder="输入 key"
          @input="updateGlobalList(items)"
      />
      <el-icon style="padding-left: 10px"><Right /></el-icon>
      <el-input
          style="padding-left: 10px"
          v-model="kvItem.value"
          placeholder="输入 value"
          @input="updateGlobalList(items)"
      />
      <el-button
          type="danger"
          @click="removekv(kvItem, kvIndex)"
          :icon="RemoveFilled"
          circle
      />
    </div>
  </div>
  <el-button type="primary" @click="addkv(kvItem)" link>添加</el-button>
</template>
<style>
  .kv {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
</style>