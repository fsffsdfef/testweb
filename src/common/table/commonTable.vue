<script setup lang="ts">
import {Delete, Edit,} from '@element-plus/icons-vue'

const props = defineProps({
  date: {
    default: {
      tableDate: [],
      column: [],
      indexKey: "",
      batchSetting: false,
      pullShow: false
    }
  },
  editFunction: {
    type: Function
  },
  delFunction: {
    type: Function
  }
})
const indexKey = props.date.indexKey
console.log(`index`,indexKey)
</script>

<template>
  <div v-if="date.tableDate.length>0">
    <el-table :data="date.tableDate"
              stripe
              border
              style="width: 100%">
      <div>
        <el-table-column type="selection" align="center"/>
      </div>
      <div>
        <el-table-column type="expand">
          <template #default="props">
            <el-table :data="props.tableData"
                      style="width: 100%">
              <template v-for="col in props.column">
                <el-table-column
                    :prop="col.prop"
                    :label="col.label"
                    align="center"
                    show-overflow-tooltip
                />
              </template>
            </el-table>
          </template>
        </el-table-column>
      </div>
      <template v-for="col in date.column">
        <el-table-column
            :prop="col.prop"
            :label="col.label"
            align="center"
            show-overflow-tooltip
        />
      </template>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button :icon="Edit" @click="editFunction" round>编辑</el-button>
          <el-button type="danger" :icon="Delete" @click="delFunction(scope.row)" round>删除</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
  <div v-else>
    <el-empty description="description"/>
  </div>

</template>

<style scoped>

</style>