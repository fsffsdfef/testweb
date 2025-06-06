<script setup lang="ts">
import CommonTable from "@/common/module/table/CommonTable.vue";
import CommonTool from "@/common/module/table/CommonPaginator.vue";
import userTableConfig from "@/views/main/system/user/tableconfig.ts"
import systemStore from "@/stores/main/system/systemStore.ts";
import {reactive, ref} from "vue";
import {storeToRefs} from "pinia";
const system = systemStore()
system.getUserTableList()
const {userTableList} = storeToRefs(system)

</script>
<template>
  <div>
    <CommonTool :tools="userTableConfig.tool"></CommonTool>
  </div>
  <div>
    <div v-if="userTableList.length>0">
    <el-table
        :data="userTableList"
        border
        style="width: 100%"
    >
      <CommonTable :date="userTableConfig.table"></CommonTable>
    </el-table>
    </div>
    <div v-else>
      <el-empty description="description"/>
    </div>
  </div>

</template>

<style scoped>

</style>