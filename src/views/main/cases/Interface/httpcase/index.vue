<script setup lang="ts">
import Table from "@/views/main/cases/Interface/httpcase/table/table.vue"
import Search from "@/views/main/cases/Interface/httpcase/search/search.vue";
import searchCase from "@/views/main/cases/Interface/httpcase/search/search.vue";
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {reactive, ref} from "vue";
const dataLoaded = ref(false)
const dataInfo = reactive({
  tableDate: [],
  portList: [],
})
const searchInfo = reactive({
  caseSearch: {
    caseName: null,
    portId: "",
    isCore: "all",
    update_user: ""
  },
  searchModule: []
})
const searchCaseRef = ref<InstanceType<typeof searchCase>>()
onMounted(async () => {
  const httpCaseList = await BaseRequest({
    url: 'httpcase',
    method: 'GET'
  })
  const portData = await BaseRequest({
    url: "port",
    method: "GET"
  })
  dataInfo.tableDate = httpCaseList.data
  dataInfo.portList = portData.data.list
  dataLoaded.value = true
})
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <Search v-if="dataLoaded" :date="searchInfo" ref="searchCaseRef"></Search>
      </el-header>
      <el-main>
        <Table v-if="dataLoaded" :date="dataInfo"></Table>
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
</style>