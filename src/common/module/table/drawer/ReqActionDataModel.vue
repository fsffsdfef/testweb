<script setup lang="ts">
import systemStore from "@/stores/main/system/systemStore.ts";
import {storeToRefs} from "pinia";
import type {reqActionProps} from "@/common/module/table/drawer/type.ts";
import {reactive, ref} from "vue";
import JsonTree from '@/common/jsonTree/JsonTree.vue'
const props = defineProps<reqActionProps>()
const system = systemStore()
const {showData} = storeToRefs(system)
const moduleShow = ref(false)
function handleClose(){
  moduleShow.value = false
}
async function getReqData(data:any, show:boolean) {
  await system.taskAction(data)
  moduleShow.value = show
}
export interface ReqDataModelExpose {
  getReqData: (data: any, show:boolean) => void
}
const expose: ReqDataModelExpose = {
  getReqData
};
defineExpose(expose)
</script>

<template>
    <el-drawer
        v-model="moduleShow"
        :title="showData.caseName"
        direction="btt"
        size="90%"
        :before-close="handleClose"
    >
      <!-- 标题和基本信息区域 -->
      <div class="basic-info">
        <span>ID：{{showData.caseId}}</span>
        <span>请求方法: {{showData.req.method}}</span>
        <span>请求URL: {{showData.req.url}}</span>
      </div>

      <!-- 断言信息区域 -->
      <div class="assert-info" v-if="showData.assert">
        <div v-for="assert in showData.assert.assertInfo" :key="assert.groupID" class="assert-group">
          <span>规则组ID: {{assert.groupID}}</span>
          <span>断言结果: {{assert.final}}</span>
          <div v-for="express in assert.expressInfo" :key="express.expressId" class="express-item">
            <span>规则ID: {{express.expressId}}</span>
            <span>断言结果: {{express.assert}}</span>
            <span>规则：{{express.oper}}</span>
          </div>
        </div>
      </div>
      <div class="json-container">
        <el-container class="full-height-container">
          <el-aside width=50% class="scrollable-aside">
            <div class="json-section">
              <h3>请求数据 (Request)</h3>
              <div class="json-tree-wrapper">
                <JsonTree :data="showData.req"/>
              </div>
            </div>
          </el-aside>
          <el-main class="scrollable-main">
            <div class="json-section">
              <h3>返回数据 (Response)</h3>
              <div class="json-tree-wrapper">
                <JsonTree :data="showData.res"/>
              </div>
            </div>
          </el-main>
        </el-container>
      </div>
    </el-drawer>
</template>

<style scoped>
/* 整个抽屉内容使用flex布局 */
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
/* 基础信息和断言信息区域 */
.basic-info {
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}
.basic-info label {
  margin-right: 20px;
  color: #606266;
}
.assert-info {
  margin-bottom: 12px;
  padding: 12px;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
}
.assert-group {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #dcdfe6;
}
.assert-group:last-child {
  border-bottom: none;
}
.express-item {
  margin-left: 20px;
  margin-top: 4px;
  color: #67c23a;
  font-size: 12px;
}
/* JSON容器区域 - 占据剩余空间 */
.json-container {
  flex: 1;
  min-height: 0; /* 关键：允许缩小 */
  display: flex;
  flex-direction: column;
}
.full-height-container {
  flex: 1;
  min-height: 0; /* 关键：允许缩小 */
  height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}
/* 左右两侧容器 */
.scrollable-aside,
.scrollable-main {
  height: 100%;
  overflow: hidden; /* 隐藏外部滚动条 */
  display: flex;
  flex-direction: column;
}
/* Element Plus的el-aside和el-main需要特殊处理 */
:deep(.el-aside) {
  height: 100%;
  overflow: hidden;
  padding-right: 12px; /* 右侧添加间距 */
}
:deep(.el-main) {
  height: 100%;
  overflow: hidden;
  padding: 0;
}
/* JSON区域标题 */
.json-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}
.json-section h3 {
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}
/* JSON树包装器 - 实现内部滚动 */
.json-tree-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto; /* 内部垂直滚动 */
  padding: 12px;
}
/* 自定义滚动条样式 */
.json-tree-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.json-tree-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.json-tree-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.json-tree-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* 针对JsonTree组件的调整 */
:deep(.json-tree) {
  height: 100%;
  min-height: 0;
  overflow: hidden; /* 防止JsonTree自己产生滚动条 */
  display: flex;
  flex-direction: column;
}
/* 确保JsonTree内部的容器也能正确处理高度 */
:deep(.json-tree > .json-node) {
  flex: 1;
  min-height: 0;
}
/* 响应式调整：在小屏幕上改变布局 */
@media (max-width: 768px) {
  .full-height-container {
    flex-direction: column;
  }

  :deep(.el-aside) {
    width: 100% !important;
    height: 50%;
    padding-right: 0;
    margin-bottom: 12px;
  }

  :deep(.el-main) {
    width: 100% !important;
    height: 50%;
    margin-left: 0;
  }
}

</style>


