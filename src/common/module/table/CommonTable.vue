<script setup lang="ts">
import {Delete, Edit, DocumentRemove, DocumentCopy, List, Promotion} from '@element-plus/icons-vue'
import systemStore from "@/stores/main/system/systemStore.ts";
import {reactive, ref, computed} from "vue";
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
const multipleSelection = ref([])
// 暴露新增与编辑方法给父组件监控
const emit = defineEmits(['editAction', 'addAction', 'operation'])
function addAction(edit="create") {
  emit('addAction', edit)
}
function editAction(edit, data) {
  emit('editAction', edit, data)
}
function operation(data, show=true) {
  emit('operation', data, show)
}
// 列表数据增删改查
function addTable(data) {
  system.addAction(props.config.pageName, data)
}
function delTable(data) {
  if (Array.isArray(data)){
    queryInfo["ids"] = data
  }
  else{
    queryInfo[props.config.key] = data
  }
  system.delAction(props.config.pageName, queryInfo)
}
function updateTable(data) {
  system.updateAction(props.config.pageName, data)
}
function getTable(queryInfo?) {
  system.getTableListAction(props.config.pageName, queryInfo)
}
function handleSelectionChange(val){
  const data = val.map(item => item[props.config.key])
  multipleSelection.value = data
}

// 使用计算属性
const actionHandlers = computed(() => ({
  submitTask: operation,
  add: addAction,
  edit: editAction,
}))

async function handleClick(actionType, data?:any) {
   await actionHandlers.value[actionType]?.(data)
}
export interface CommonTableExpose {
  getTable: (data?: any) => void;
  updateTable: (data: any) => void;
  addTable: (data: any) => void;
}
const expose: CommonTableExpose = {
  getTable,
  updateTable,
  addTable
};
// 外露getTable, updateTable, addTable方法给父组件调用
defineExpose(expose)

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
      <div v-show="multipleSelection.length>0" style="padding-right: 15px;">
        <el-button type="danger" :icon="Delete" @click="delTable(multipleSelection)">批量删除</el-button>
      </div>
      <div v-for="btn in config.tools.btnList" style="padding-right: 15px;">
        <el-button type="primary" :icon="btn.icon" @click="handleClick(btn.type)">新增{{btn.name}}</el-button>
      </div>
    </div>
  </div>
  <!--  tableList-->
  <div>
    <el-table
        :data="TableList"
        border
        stripe
        header-cell-class-name="headerCellClassName"
        @selection-change="handleSelectionChange"
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
                  <span style="padding-left: 10px">{{ item.keyType }}[{{ item.matchKey }}]</span>
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
                      <template v-if="children.type === 'tag'">
                        <el-table-column
                            v-bind="children"
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
                      <template v-else>
                        <el-table-column v-bind="children" align="center"/>
                      </template>
                    </template>
                    <el-table-column label="操作" align="center">
                      <template #default="data">
                        <el-button type="primary" :icon="Edit" @click="editAction('edit', data.row)" text>编辑</el-button>
                        <el-button type="danger" :icon="Delete" @click="delTable(data.row[config.key])" text>删除</el-button>
                      </template>
                    </el-table-column>
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
            </template>
          </el-table-column>
        </template>
        <template v-else-if="col.type == 'copy'">
          <el-table-column
            v-bind="col"
            align="center"
          >
            <template #default="scope">
              <el-icon size="13" @click="copy(JSON.stringify(scope.row[col.prop]))">
                <DocumentRemove/>
              </el-icon>
              <el-text type="primary" class="mx-1">{{ scope.row[col.prop] }}</el-text>
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
          <template v-for="btn in config.table.btn">
            <el-button type="primary" :icon="Promotion" @click="handleClick(btn.action, scope.row)" text>
              {{ btn.name }}
            </el-button>
          </template>
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

，headerCellClassName {
  background-color: #2c3e50;
}
</style>