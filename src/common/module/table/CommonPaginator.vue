<script setup lang="ts">
import {ref} from "vue";
import type { ComponentSize } from 'element-plus'
import {storeToRefs} from "pinia";
import systemStore from "@/stores/main/system/systemStore.ts";
const system = systemStore()
const {pageCount, page, size} = storeToRefs(system)

const currentPage = ref(1)
const pageSize = ref(10)
const emit = defineEmits(['changeSize', 'changePage'])
function handleSizeChange(){
  const queryInfo = getPageInfo()
  emit('changeSize', queryInfo)
}
function handleCurrentChange(){
  const queryInfo = getPageInfo()
  emit(`changePage`, queryInfo)
}

function getPageInfo(){
  const size = pageSize.value
  const page = (currentPage.value)
  return {size, page}
}
</script>

<template>
  <div style="float: right; margin-top: 10px">
    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 15, 20]"
        layout="sizes, prev, pager, next, jumper, total"
        :total="pageCount"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
  </div>

</template>

<style scoped>
.main {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
.tool {
  display: flex;
  align-content: center;
  justify-content: flex-end;
  margin-bottom: 10px;
}

</style>