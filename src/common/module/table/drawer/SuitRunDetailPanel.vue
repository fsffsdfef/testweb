<script setup lang="ts">
import { ref } from 'vue'
import JsonTree from '@/common/jsonTree/JsonTree.vue'
import { copy } from '@/utils/copy.ts'
import { DocumentRemove } from '@element-plus/icons-vue'

defineProps<{
  showData: Record<string, any>
}>()

const activeNames = ref<number[]>([])

function formatGlobalValue(val: unknown): string {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'string') {
    return JSON.stringify(val)
  }
  if (typeof val === 'object') {
    return JSON.stringify(JSON.stringify(val))
  }
  return JSON.stringify(val)
}

function formatGlobalMap(global: Record<string, any>) {
  const lines = Object.entries(global ?? {}).map(([key, val]) => {
    return `  ${JSON.stringify(key)}: ${formatGlobalValue(val)}`
  })
  return `{\n${lines.join(',\n')}\n}`
}

function copyGlobal(global: Record<string, any>) {
  copy(formatGlobalMap(global))
}
</script>

<template>
  <template v-if="showData && showData.info">
    <div class="suit-detail-root">
      <div class="suit-summary-wrap">
        <div class="suit-summary">
          <div class="suit-summary-item">
            <span class="suit-summary-label">套件ID</span>
            <span class="suit-summary-value">{{ showData.suitID }}</span>
          </div>
          <div class="suit-summary-item">
            <span class="suit-summary-label">套件名称</span>
            <span class="suit-summary-value">{{ showData.suitName }}</span>
          </div>
          <div class="suit-summary-item">
            <span class="suit-summary-label">通过率</span>
            <span class="suit-summary-value">{{ showData.pass }}%</span>
          </div>
          <div class="suit-summary-item suit-summary-item--block">
            <span class="suit-summary-label">全局变量</span>
            <div class="suit-summary-value suit-summary-json">
              <div class="suit-summary-json-toolbar">
                <el-icon size="16" @click="copyGlobal(showData.global)">
                  <DocumentRemove />
                </el-icon>
              </div>
              <pre class="global-json-text">{{ formatGlobalMap(showData.global) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-collapse">
        <el-collapse v-model="activeNames">
          <el-collapse-item
              v-for="(info, index) in showData.info"
              :key="index"
              :name="index"
          >
            <template #title="{ isActive }">
              <div :class="['title-wrapper', { 'is-active': isActive }]">
                {{ info.caseName }}
                <el-tag
                    :type="info.assert.finalAssert ? 'success' : 'danger'"
                    effect="dark"
                    round
                >
                  {{ info.assert.finalAssert ? 'passed' : 'failed' }}
                </el-tag>
              </div>
            </template>

            <div class="collapse-item-body">
              <div class="basic-info">
                <span>ID：{{ info.caseId }}</span>
                <span>请求方法: {{ info.req.method }}</span>
                <span>请求URL: {{ info.req.url }}</span>
                <span>请求断言结果: </span>
                <el-tag
                    size="small"
                    :type="info.assert.finalAssert ? 'success' : 'danger'"
                    effect="dark"
                    round
                >
                  {{ info.assert.finalAssert ? 'passed' : 'failed' }}
                </el-tag>
              </div>

              <div class="assert-info" v-if="info.assert">
                <div
                    v-for="assert in info.assert.assertInfo"
                    :key="assert.groupID"
                    class="assert-group"
                >
                  <div>
                    <div>
                      <H4>
                        规则组ID: {{ assert.groupID }} ||
                        <el-tag
                            size="small"
                            :type="assert.final ? 'success' : 'danger'"
                            effect="dark"
                            round
                        >
                          {{ assert.final ? 'passed' : 'failed' }}
                        </el-tag>
                      </H4>
                    </div>
                    <div
                        v-for="express in assert.expressInfo"
                        :key="express.expressId"
                        class="express-item"
                    >
                      <div class="express-row">
                        <span>规则ID: {{ express.expressId }}</span>
                        <span>规则：{{ express.oper }}</span>
                        <span>规则断言结果: </span>
                        <el-tag
                            size="small"
                            :type="express.assert ? 'success' : 'danger'"
                            effect="dark"
                            round
                        >
                          {{ express.assert ? 'passed' : 'failed' }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="json-container">
                <el-container class="full-height-container">
                  <el-aside width="50%">
                    <div class="json-section">
                      <h3 class="json-title">
                        请求数据 (Request)
                        <el-icon size="20" @click="copy(info.req.data)">
                          <DocumentRemove />
                        </el-icon>
                      </h3>
                      <div class="json-tree-wrapper">
                        <JsonTree :data="info.req" embedded />
                      </div>
                    </div>
                  </el-aside>
                  <el-main>
                    <div class="json-section">
                      <h3 class="json-title">
                        返回数据 (Response)
                        <el-icon size="20" @click="copy(JSON.stringify(info.res))">
                          <DocumentRemove />
                        </el-icon>
                      </h3>
                      <div class="json-tree-wrapper">
                        <JsonTree :data="info.res" embedded />
                      </div>
                    </div>
                  </el-main>
                </el-container>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </template>

  <el-empty v-else description="暂无运行详情" />
</template>

<style scoped>
.suit-detail-root {
  width: 100%;
}

.suit-summary-wrap {
  padding-bottom: 12px;
}

.demo-collapse {
  width: 100%;
}

.collapse-item-body {
  width: 100%;
}

.basic-info {
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.assert-info {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f0f9eb;
  border-radius: 4px;
}

.assert-group {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.express-item {
  margin-left: 20px;
  margin-top: 4px;
  color: #67c23a;
  font-size: 12px;
}

.express-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}

.json-container {
  height: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.full-height-container {
  flex: 1;
  height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  align-items: stretch;
}

:deep(.el-aside),
:deep(.el-main) {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.el-aside) {
  padding-right: 12px;
}

:deep(.el-main) {
  padding: 0;
}

.json-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: white;
  overflow: hidden;
}

.json-title {
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.json-tree-wrapper {
  flex: 1;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scroll-hide {
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.scroll-hide::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.suit-summary {
  max-width: 1500px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  text-align: left;
}

.suit-summary-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px dashed #ebeef5;
}

.suit-summary-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.suit-summary-item:first-child {
  padding-top: 0;
}

.suit-summary-label {
  flex-shrink: 0;
  width: 72px;
  font-size: 13px;
  color: #909399;
  line-height: 22px;
  text-align: left;
}

.suit-summary-value {
  flex: 1;
  font-size: 14px;
  color: #303133;
  line-height: 22px;
  word-break: break-all;
  text-align: left;
}

.suit-summary-json {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  text-align: left;
}

.suit-summary-json-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
  color: #909399;
  cursor: pointer;
}

.suit-summary-json-toolbar:hover {
  color: #409eff;
}

.global-json-text {
  margin: 0;
  padding: 0;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  color: #303133;
}

.suit-summary-item--block {
  align-items: flex-start;
}
</style>