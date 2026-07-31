<script setup lang="ts">
import {Delete, Edit, DocumentRemove, DocumentCopy, List, Promotion} from '@element-plus/icons-vue'
import systemStore from "@/stores/main/system/systemStore.ts";
import {reactive, ref, computed} from "vue";
import {storeToRefs} from "pinia";
import type {tableProps} from "@/common/types/main/type.ts";
import {dayJS} from "@/utils/dataformat.ts";
import {copy} from "@/utils/copy.ts";
import router from "@/router";
import { formatScheduleDesc } from '@/utils/scheduleUtil.ts'

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
function operation(data, action = 'submitTask') {
  emit('operation', data, action)
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
function batch_del(data) {
  if (Array.isArray(data)){
    queryInfo["ids"] = data
  }
  else{
    console.log("你有问题")
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
function handleSelectionAll(val){
  const data = val.map(item => item[props.config.key])
  multipleSelection.value = data
}
// 使用计算属性
const actionHandlers = computed(() => ({
  submitTask: (data: any) => {
    const btn = props.config.table.btn?.find((b: any) => b.action === 'submitTask')
    operation(data, btn?.silent ? 'submitTaskSilent' : 'submitTask')
  },
  viewTaskDetail: (data: any) => operation(data, 'viewTaskDetail'),
  viewPeriodicTaskHistory: (data: any) => operation(data, 'viewPeriodicTaskHistory'),
  add: addAction,
  edit: editAction,
}))
function demo(data){
  console.log(data)
}
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
        <el-button type="danger" :icon="Delete" @click="batch_del(multipleSelection)">批量删除</el-button>
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
        @select-all="handleSelectionAll"
        style="width: 100%">
      <template v-for="col in config.table.props" :key="config.key">
        <template v-if="col.type === 'selection'">
          <el-table-column type="selection" width="55"/>
        </template>
        <template v-else-if="col.type === 'expand'">
          <el-table-column type="expand">
            <template #default="scope">
              <div v-if="col.key==='expressItem'">
                <div class="assertGroup">
                  <div v-for="(group, groupIndex) in scope.row['expressItem']" :key="groupIndex">
                    <el-card style="max-width: 100%; height: 100%">
                      <template #header>
                        <div class="card-header">
                          <span>规则组ID{{group.expressItemId}}</span>
                        </div>
                      </template>
                      <div class="assertItem">
                        <div v-for="(item, index) in group.expressList" :key="index">
                          <div>规则(ID{{ item.expressId }})</div>
                          <div>
                            <span>{{ item.keyType }}[{{ item.matchKey }}]</span>
                            <span style="padding-left: 10px">{{ item.matchOper }}</span>
                            <span style="padding-left: 10px">{{ item.matchValue }}</span>
                          </div>
                        </div>
                      </div>
                    </el-card>

                </div>
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
        <template v-else-if="col.type === 'scheduleDesc'">
          <el-table-column v-bind="col" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatScheduleDesc(row) }}
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
        <template v-else-if="col.type === 'switch'">
          <el-table-column v-bind="col" align="center">
            <template #default="scope">
              <el-switch
                  @change="updateTable(scope.row)"
                  v-model="scope.row[col.prop]"
              />
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

.assertGroup {
  display: flex;
  flex-direction: row;
  align-content: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  padding-left: 20px;
}
.assertItem {
  display: flex;
  flex-direction: column;
  align-content: flex-start;
}
</style>