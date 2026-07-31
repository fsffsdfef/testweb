<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick  } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, View, Check, Right } from '@element-plus/icons-vue'

interface CascaderOption {
  id: string | number
  name: string
  children?: CascaderOption[]
}

interface KVItem {
  key: string
  value: string
}

interface SelectedItem {
  id: string | number
  label: string
  caseId: string | number
  execution_order: number
  globalMap: object
  is_first: boolean
  is_last: boolean
  is_stream: boolean
  changeSid: boolean
  changeSidKey: string
  streamKey: string
  selectList: (string | number)[]
  items: KVItem[]
  case?: { caseId?: number; caseName?: string }
}

const props = defineProps<{
  suitCase: SelectedItem[]
  optionMap: CascaderOption[]
  cascaderConfig?: Record<string, any>
}>()

const emit = defineEmits<{
  submit: [data: any]
}>()

const cascaderProps = reactive({
  multiple: true,
  emitPath: true,
  checkStrictly: true,
  checkOnClickNode: false,
  expandTrigger: 'click' as const,
  value: 'id',
  label: 'name',
  children: 'children',
})

const cascaderValue = ref<(string | number)[]>([])
const isSyncingFromCascader = ref(false)
const selectedItems = ref<SelectedItem[]>([])


function normalizePath(path: (string | number)[]) {
  return path.map(id => String(id))
}
function buildLabelFromPath(path: (string | number)[], options: CascaderOption[]): string {
  if (!path?.length) return ''
  const names: string[] = []
  let nodes = options
  for (const id of path) {
    const node = nodes.find(o => String(o.id) === String(id))
    if (!node) break
    names.push(node.name)
    nodes = node.children ?? []
  }
  return names.join(' / ')
}

function findPathByCaseId(
    caseId: string | number,
    options: CascaderOption[],
    path: (string | number)[] = []
): (string | number)[] {
  for (const option of options) {
    const newPath = [...path, option.id]
    if (!option.children?.length) {
      if (String(option.id) === String(caseId)) return newPath
    } else {
      const found = findPathByCaseId(caseId, option.children, newPath)
      if (found.length) return found
    }
  }
  return []
}

function findLabelByLastValue(
    lastValue: string | number,
    options: CascaderOption[]
): string {
  for (const option of options) {
    if (String(option.id) === String(lastValue)) {
      return option.name
    }
    if (option.children?.length) {
      const label = findLabelByLastValue(lastValue, option.children)
      if (label) return option.name + ' / ' + label
    }
  }
  return ''
}

function syncCascaderFromSuitCase() {
  if (!props.optionMap?.length) {
    cascaderValue.value = []
    return
  }
  cascaderValue.value = (props.suitCase ?? [])
      .map(item => {
        if (Array.isArray(item.selectList) && item.selectList.length >= 4) {
          return normalizePath(item.selectList)
        }
        const path = findPathByCaseId(
            item.caseId ?? item.case?.caseId,
            props.optionMap
        )
        return path.length ? normalizePath(path) : null
      })
      .filter(Boolean) as string[][]
}

// 编辑回显：optionMap 加载完成时同步一次
watch(
    () => props.optionMap?.length,
    () => {
      if (props.optionMap?.length && props.suitCase?.length) {
        syncCascaderFromSuitCase()
      }
    },
    { immediate: true }
)
// 外部赋值（编辑弹窗打开）时同步，勾选过程中跳过
watch(
    () => props.suitCase,
    () => {
      if (isSyncingFromCascader.value) return
      if (props.optionMap?.length) {
        syncCascaderFromSuitCase()
      }
    },
    { deep: true }
)
/** 必须是 4 层且最后一层是叶子（用例） */
function isCaseLeafPath(path: (string | number)[], options: CascaderOption[]): boolean {
  if (path.length !== 4) return false
  let nodes = options
  for (let i = 0; i < path.length; i++) {
    const node = nodes.find(n => String(n.id) === String(path[i]))
    if (!node) return false
    if (i === path.length - 1) {
      return !node.children || node.children.length === 0
    }
    nodes = node.children ?? []
  }
  return false
}
const handleCascaderChange = (value: string[][] | null) => {
  isSyncingFromCascader.value = true
  const allPaths = value || []
  const paths = allPaths.filter(path => isCaseLeafPath(path, props.optionMap))
  // 非法勾选（父级路径）直接剔除
  if (paths.length !== allPaths.length) {
    cascaderValue.value = paths
  }
  const currentCaseIds = paths.map(path => String(path[path.length - 1]))
  const existingCaseIds = props.suitCase.map(item =>
      String(item.caseId ?? item.case?.caseId)
  )
  paths.forEach(path => {
    const caseId = path[path.length - 1]
    if (!existingCaseIds.includes(String(caseId))) {
      addItem(caseId, path, false)
    }
  })
  for (let i = props.suitCase.length - 1; i >= 0; i--) {
    const item = props.suitCase[i]
    const id = String(item.caseId ?? item.case?.caseId)
    if (!currentCaseIds.includes(id)) {
      props.suitCase.splice(i, 1)
    }
  }
  nextTick(() => {
    isSyncingFromCascader.value = false
  })
}

const addItem = (
    caseId: string | number,
    path?: (string | number)[],
    showMessage = true
) => {
  const resolvedPath = path?.length
      ? normalizePath(path)
      : normalizePath(findPathByCaseId(caseId, props.optionMap))
  const label =
      buildLabelFromPath(resolvedPath, props.optionMap) ||
      findLabelByLastValue(caseId, props.optionMap) ||
      String(caseId)
  props.suitCase.push({
    id: String(caseId),
    label,
    caseId: String(caseId),
    selectList: resolvedPath,
    execution_order: 0,
    globalMap: {},
    is_first: false,
    is_last: false,
    is_stream: false,
    changeSid: false,
    streamKey: '',
    changeSidKey: '',
    items: [],
  })
  if (showMessage) {
    ElMessage.success(`已添加: ${label}`)
  }
}



const addkv = (item: SelectedItem) => {
  if (!item.items) item.items = []
  item.items.push({ key: '', value: '' })
  updateGlobalList(item)
}

const removekv = (item: SelectedItem, index: number) => {
  if (item.items) {
    item.items.splice(index, 1)
    updateGlobalList(item)
  }
}

const updateGlobalList = (item: SelectedItem) => {
  const obj: Record<string, string> = {}
  if (item.items) {
    item.items.forEach(kvItem => {
      const key = kvItem.key?.trim()
      if (key) {
        obj[key] = kvItem.value ?? ''
      }
    })
  }
  item.globalMap = obj
}

const removeItem = (id: string | number) => {
  const index = props.suitCase.findIndex(item => String(item.id) === String(id))
  if (index > -1) {
    const item = props.suitCase[index]
    ElMessage.success(`已移除: ${item.label}`)
    props.suitCase.splice(index, 1)
    syncCascaderFromSuitCase()  // 删除后手动同步
  }
}

const updateCascaderValue = () => {
  syncCascaderFromSuitCase()
}

const canSubmit = computed(() => props.suitCase.length > 0)

const previewDialogVisible = ref(false)
const previewTab = ref('json')

const formattedSubmitData = computed(() => {
  return JSON.stringify(buildSubmitData(), null, 2)
})

const buildSubmitData = () => {
  return {
    timestamp: new Date().toISOString(),
    total: selectedItems.value.length,
    items: selectedItems.value.map(item => ({
      label: item.label,
      caseId: item.caseId,
      execution_order: item.execution_order,
      is_first: item.is_first,
      is_last: item.is_last,
      globalMap: item.globalMap,
    })),
  }
}

const previewSubmitData = () => {
  previewDialogVisible.value = true
  previewTab.value = 'json'
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedSubmitData.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要提交 ${selectedItems.value.length} 项数据吗？`,
        '确认提交',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )
    emit('submit', buildSubmitData())
    ElMessage.success('提交成功！')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="cascader-multi-select-config">
    <div class="cascader-section leaf-only-cascader">
      <el-cascader
          v-model="cascaderValue"
          :options="optionMap"
          :props="cascaderProps"
          clearable
          filterable
          placeholder="请选择用例（仅可选用例层）"
          @change="handleCascaderChange"
          style="width: 100%"
      />
    </div>

    <div v-if="suitCase.length > 0" class="selected-items-section">
      <el-divider content-position="left">
        <span>已选数据及配置 ({{ suitCase.length }})</span>
      </el-divider>

      <div class="items-list">
        <el-card
            v-for="item in suitCase"
            :key="item.id"
            class="item-card"
            shadow="hover"
        >
          <template #header>
            <div class="item-header">
              <div class="item-title">
                <span class="item-label">{{ item.label || item.case?.caseName }}</span>
              </div>
              <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="removeItem(item.id)"
                  circle
              />
            </div>
          </template>

          <el-form :model="item" label-width="140px" class="config-form">
            <el-form-item label="用例ID">
              <el-text>{{ item.caseId || item.case?.caseId }}</el-text>
            </el-form-item>

            <el-form-item label="执行顺序" prop="execution_order">
              <el-input-number
                  v-model="item.execution_order"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  placeholder="请输入执行顺序"
              />
            </el-form-item>

            <el-form-item label="全局变量" prop="globalMap">
              <div class="kv-wrapper">
                <div
                    v-for="(kvItem, kvIndex) in (item.items || [])"
                    :key="kvIndex"
                    class="kv-row"
                >
                  <div class="kv-key-col">
                    <el-input
                        v-model="kvItem.key"
                        placeholder="输入 key"
                        @input="updateGlobalList(item)"
                    />
                  </div>
                  <el-icon class="kv-arrow"><Right /></el-icon>
                  <div class="kv-value-col">
                    <el-input
                        v-model="kvItem.value"
                        placeholder="输入 value"
                        @input="updateGlobalList(item)"
                    />
                  </div>
                  <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      circle
                      @click="removekv(item, kvIndex)"
                  />
                </div>
                <!-- 始终贴在 key 列下方 -->
                <div class="kv-add-col">
                  <el-button type="primary" link @click="addkv(item)">添加</el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="更新会话ID">
              <el-switch v-model="item.changeSid" />
            </el-form-item>

            <el-form-item v-show="item.changeSid" label="会话key" prop="changeSidKey">
              <el-input v-model="item.changeSidKey" placeholder="请输入" />
            </el-form-item>

            <el-form-item label="前置">
              <el-switch v-model="item.is_first" />
            </el-form-item>

            <el-form-item label="后置">
              <el-switch v-model="item.is_last" />
            </el-form-item>

            <el-form-item label="是否循环调用">
              <el-switch v-model="item.is_stream" />
            </el-form-item>

            <el-form-item v-show="item.is_stream" label="流式Key" prop="streamKey">
              <el-input v-model="item.streamKey" placeholder="请输入" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>

    <div v-if="selectedItems.length > 0" class="submit-section">
      <el-divider />
      <div class="submit-actions">
        <el-button type="info" :icon="View" @click="previewSubmitData">
          预览提交数据
        </el-button>
        <el-button
            type="primary"
            :icon="Check"
            @click="handleSubmit"
            :disabled="!canSubmit"
        >
          提交数据
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cascader-multi-select-config .cascader-section {
  margin-bottom: 20px;
}
.cascader-multi-select-config .selected-items-section {
  margin-top: 20px;
}
.cascader-multi-select-config .items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cascader-multi-select-config .item-card .item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cascader-multi-select-config .item-card .item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 50px;
}
.cascader-multi-select-config .item-card .item-title .item-label {
  font-weight: 500;
  color: #303133;
}
.cascader-multi-select-config .item-card .config-form {
  margin-top: 10px;
}
.cascader-multi-select-config .submit-section {
  margin-top: 20px;
}
.cascader-multi-select-config .submit-section .submit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.kv-wrapper {
  width: 100%;
}

.kv-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.kv-key-col {
  width: 180px;      /* 与下面 kv-add-col 同宽，保证对齐 */
  flex-shrink: 0;
}

.kv-value-col {
  flex: 1;
  min-width: 0;
}

.kv-arrow {
  flex-shrink: 0;
  color: #909399;
}

/* 添加按钮始终在 key 列正下方 */
.kv-add-col {
  width: 180px;
  margin-top: 4px;
  display: flex;
  justify-content: flex-start;  /* 左对齐 */
  align-items: center;
}
/* 去掉 link 按钮默认左内边距，贴齐 key 输入框 */
.kv-add-col :deep(.el-button) {
  margin-left: 0;
  padding-left: 0;
}
/* 非叶子节点隐藏复选框，父级只能展开 */
.leaf-only-cascader :deep(.el-cascader-panel .el-cascader-node:not(.is-leaf) .el-checkbox) {
  display: none !important;
  pointer-events: none !important;
}
</style>