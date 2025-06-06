<script setup lang="ts">
import {Delete, Edit, DocumentRemove, List} from '@element-plus/icons-vue'
import systemStore from "@/stores/main/system/systemStore.ts";
import {reactive, ref} from "vue";
import {storeToRefs} from "pinia";
import type {tableProps} from "@/common/types/main/type.ts";
import {dayJS} from "@/utils/dataformat.ts";
import {copy} from "@/utils/copy.ts";
import router from "@/router";
const queryInfo = {}
const props = defineProps<tableProps>()
const system = systemStore()
getTable()
const {TableList} = storeToRefs(system)
// 暴露新增与编辑方法给父组件监控
const emit = defineEmits(['editAction', 'addAction'])
function addAction(edit) {
  emit('addAction', edit)
}
function editAction(edit, data) {
  emit('editAction', edit, data)
}
// 列表数据增删改查
function addTable(data) {
  system.addAction(props.config.pageName, data)
}
function delTable(data) {
  queryInfo[props.config.key] = data
  system.delAction(props.config.pageName, queryInfo)
}
function updateTable(data) {
  system.updateAction(props.config.pageName, data)
}
function getTable(queryInfo?) {
  system.getTableListAction(props.config.pageName, queryInfo)
}
// 外露getTable, updateTable, addTable方法给父组件调用
defineExpose({getTable, updateTable, addTable})

</script>

<template>
  <!--  header-->
  <div class="main">
    <div>
      <el-text size="large" style="font-weight: bold">
        <el-icon size="20">
          <List/>
        </el-icon>
        {{ config.tools.header.title }}
      </el-text>
    </div>
    <div class="tool">
      <div v-for="btn in config.tools.btnList" style="padding-right: 15px;">
        <template v-if="btn.funcType==='add'">
          <el-button
              v-bind="btn"
              style="margin-right: 5px"
              @click="addAction('create')"
              round
          >
            {{ btn.btnName }}
          </el-button>
        </template>
        <template v-else-if="btn.funcType==='upload'">
          <el-button
              v-bind="btn"
              style="margin-right: 5px"
              @click="addAction('create')"
              round
          >
            {{ btn.btnName }}
          </el-button>
        </template>
        <template v-else-if="btn.funcType==='download'">
          <el-button
              v-bind="btn"
              style="margin-right: 5px"
              @click="addAction('create')"
              round
          >
            {{ btn.btnName }}
          </el-button>
        </template>
        <template v-else-if="btn.funcType==='set'">
          <el-button
              v-bind="btn"
              style="margin-right: 5px"
              @click="addAction('create')"
              round
          >
            {{ btn.btnName }}
          </el-button>
        </template>
      </div>
    </div>
  </div>
  <!--  tableList-->
  <div>
    <el-table
        :data="TableList"
        border
        stripe
        style="width: 100%">
      <template v-for="col in config.table.props" :key="config.key">
        <template v-if="col.type === 'selection'">
          <el-table-column type="selection" width="55"/>
        </template>
        <template v-else-if="col.type === 'expand'">
          <el-table-column type="expand">
            <template #default="scope">
              <div v-if="col.key==='expressItem'">
                <div v-for="(item, index) in scope.row['expressItem'][0]['expressList']" :key="index">
                  <label>规则(ID{{ item.expressId }})</label>
                  <span style="padding-left: 10px">{{ item.keyType }}: {{ item.matchKey }}</span>
                  <span style="padding-left: 10px">{{ item.matchOper }}</span>
                  <span style="padding-left: 10px">{{ item.matchValue }}</span>
                </div>
              </div>
              <div v-else>
                <div style="margin: 20px 20px 20px 20px">
                  <el-table
                      :data="scope.row[col.key]"
                      stripe
                  >
                    <template v-for="children in col.props">
                      <el-table-column v-bind="children" align="center"/>
                    </template>
                  </el-table>
                </div>
              </div>
            </template>
          </el-table-column>
        </template>
        <template v-else-if="col.type === 'time'">
          <el-table-column v-bind="col" align="center">
            <template #default="scope">
              {{ dayJS(scope.row[col.prop]) }}
            </template>
          </el-table-column>
        </template>
        <template v-else-if="col.type === 'tag'">
          <el-table-column
              v-bind="col"
              align="center"
              show-overflow-tooltip>
            <template #default="scope">
              <el-tag
                  size="small"
                  :type="scope.row[col.prop]?'danger':'info'"
              >
                {{ scope.row[col.prop] ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
        </template>
        <template v-else-if="col.type === 'obj'">
          <el-table-column
              v-bind="col"
              align="center"
              show-overflow-tooltip>
            <template #default="scope">
              <template v-if="scope.row[col.prop]">
                <el-icon size="13" @click="copy(JSON.stringify(scope.row[col.prop]))">
                  <DocumentRemove/>
                </el-icon>
                <el-text class="mx-1">{{ JSON.stringify(scope.row[col.prop]) }}</el-text>
              </template>
              <template v-else>
                空
              </template>
            </template>
          </el-table-column>
        </template>
        <template v-else-if="col.type==='path'">
          <el-table-column v-bind="col" align="center">
            <template #default="scope">
              <el-text class="mx-1" type="primary" @click="router.push(scope.row[col.prop])">{{ scope.row[col.prop]}}</el-text>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column
              v-bind="col"
              align="center"
              show-overflow-tooltip
          />
        </template>
      </template>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" @click="editAction('edit', scope.row)" text>编辑</el-button>
          <el-button type="danger" :icon="Delete" @click="delTable(scope.row[config.key])" text>删除</el-button>
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