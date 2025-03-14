<script setup lang="ts">
import Table from "@/views/main/cases/Interface/httpcase/table/table.vue"
import Search from "@/views/main/cases/Interface/httpcase/search/search.vue";
import {reactive, ref} from "vue";

const dataLoaded = ref(false)
const contentRef = ref<InstanceType<typeof Table>>()
function searchClick(data:any){
  contentRef.value?.getTable(data)
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <Search @searchCase="searchClick"></Search>
      </el-header>
      <el-main>
        <Table ref="contentRef"></Table>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.el-header {
  height: 20%;
  border-bottom: 2px solid #DDDDDD;
}
.el-main {
  height: 800%;
}
.itemcss {
  display: flex;
  align-items: center;
}
</style>