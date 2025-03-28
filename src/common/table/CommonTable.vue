<script setup lang="ts">
import {Delete, Edit, DocumentRemove, List} from '@element-plus/icons-vue'
import systemStore from "@/stores/main/system/systemStore.ts";
import {reactive, ref} from "vue";
import {storeToRefs} from "pinia";
import type {departProps} from "@/views/main/system/depart/type.ts";
import config from "@/views/main/system/depart/configs/table-config.ts";


const props = defineProps<departProps>()

const caseSearch = reactive({
  departId: null,
  departName: null
})
const system = systemStore()
const {departTableList, dialogVisible} = storeToRefs(system)
system.getDepartTableList(props.config.pageName, caseSearch)
function getTable(queryInfo){
  system.getDepartTableList(props.config.pageName, queryInfo)
}
console.log("dialog", dialogVisible)
defineExpose({getTable})
</script>

<template>

<!--      <div>-->
<!--        <el-table-column type="selection" align="center"/>-->
<!--      </div>-->
<!--      <div>-->
<!--        <el-table-column type="expand">-->
<!--          <template #default="props">-->
<!--            <el-table :data="props.tableData"-->
<!--                      style="width: 100%">-->
<!--              <template v-for="col in props.column">-->
<!--                <el-table-column-->
<!--                    :prop="col.prop"-->
<!--                    :label="col.label"-->
<!--                    align="center"-->
<!--                    show-overflow-tooltip-->
<!--                />-->
<!--              </template>-->
<!--            </el-table>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--      </div>-->
  <div class="main">
    <div>
      <el-text size="large" style="font-weight: bold">
        <el-icon size="20"><List/></el-icon>
        {{ config.tools.header.title}}
      </el-text>
    </div>
    <div class="tool">
      <div v-for="btn in config.tools.btnList">
        <el-button
            type="primary"
            :icon="btn.icon"
            style="margin-right: 5px"
            @click="btn.func"
            plain
        >
          {{ btn.btnName }}
        </el-button>
      </div>
    </div>
  </div>
  <div>
  <el-table
      :data="departTableList"
      border
      style="width: 100%">
      <template v-for="col in config.table.props">
        <template v-if="col.type === 'custom'">
          <el-table-column align="center" v-bind="col">
            <template #default="scope">
              <el-button type="primary" :icon="DocumentRemove" text>{{scope.row[col.prop]}}</el-button>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column
              :prop="col.prop"
              :label="col.label"
              align="center"
              show-overflow-tooltip
          />
        </template>

      </template>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" :icon="Edit"  text>编辑</el-button>
          <el-button type="danger" :icon="Delete"  text>删除</el-button>
        </template>
      </el-table-column>
  </el-table>
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