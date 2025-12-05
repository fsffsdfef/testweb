<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, View, Check } from '@element-plus/icons-vue'

// 类型定义
interface CascaderOption {
  id: string | number
  name: string
  children?: CascaderOption[]
}

interface ItemConfig {
  caseId: string | number // 选择的value，不可更改
  execution_order: number // 数字类型
  is_first: boolean // bool类型，默认false
  is_last: boolean // bool类型，默认false
}

interface SelectedItem {
  id: string | number // 内部ID，用于列表管理
  label: string // 显示标签
  caseId: string | number // 最后选中的值
  execution_order: number
  is_first: boolean
  is_last: boolean
}
interface RuleGroup {
  casesList: ItemConfig[];
}
// Props
const props = defineProps<{suitCase: SelectedItem[]; optionMap: CascaderOption[]}>()
console.log("case", props.suitCase)
// Emits
const emit = defineEmits<{
  submit: [data: any]
}>()

// 级联选择器配置
const cascaderProps = reactive({
  multiple: true, // 支持多选
  emitPath: false, // 只返回最后一个节点值，不返回完整路径
  expandTrigger: 'hover' as const,
  value: 'id', // 使用 id 作为值字段
  label: 'name', // 使用 name 作为标签字段
  children: 'children' // children 字段名
})

// 级联选择器的值（一维数组，只存储最后一个值）
const cascaderValue = ref<(string | number)[]>([])

// 已选中的数据项列表
const selectedItems = ref<SelectedItem[]>([])

// ID 计数器
let idCounter = 0

// 处理级联选择器变化
const handleCascaderChange = (value: (string | number)[] | null) => {

  // value 现在是一维数组，每个元素是最后一个节点的值
  const currentLastValues = value || []

  // 找出新增的值（不在selectedItems中的）
  const existingCaseIds = props.suitCase.map(item => item.caseId)

  currentLastValues.forEach((caseId) => {
    if (!existingCaseIds.includes(caseId)) {
      // 新增的数据项
      addItem(caseId)
    }
    else {
      console.log("存在")
    }
  })

  // 找出需要删除的值（在selectedItems中但不在当前选中中的）
  // 注意：需要从后往前删除，避免索引问题
  for (let i = props.suitCase.length - 1; i >= 0; i--) {
    const item = props.suitCase[i]
    const isStillSelected = currentLastValues.includes(item.caseId)
    if (!isStillSelected) {
      props.suitCase.splice(i, 1)
    }
  }
}

const findLabelByLastValue = (
    lastValue: string | number,
    options: CascaderOption[]
): string => {
  for (const option of options) {
    // 如果当前选项的 id 匹配，且没有子节点，说明找到了
    if (option.id === lastValue) {
      return option.name
    }

    // 如果有子节点，递归查找
    if (option.children && option.children.length > 0) {
      const label = findLabelByLastValue(lastValue, option.children)
      if (label) {
        return option.name + ' / ' + label
      }
    }
  }
}

// 添加新项
const addItem = (caseId: string | number) => {
  // 根据 caseId 查找标签
  const label = findLabelByLastValue(caseId, props.optionMap)
  const newItem: SelectedItem = {
    id: caseId,
    label: label || String(caseId),
    caseId: caseId, // 选择的value，不可更改
    execution_order: 0, // 默认值
    is_first: false, // 默认false
    is_last: false // 默认false
  }

  props.suitCase.push(newItem)
  ElMessage.success(`已添加: ${newItem.label}`)
}

// 移除项
const removeItem = (id: string) => {
  const index = props.suitCase.findIndex(item => item.id === id)
  if (index > -1) {
    const item = props.suitCase[index]
    ElMessage.success(`已移除: ${item.label}`)
    selectedItems.value.splice(index, 1)

    // 同步更新级联选择器的值（只更新最后一个值）
    updateCascaderValue()
  }
}

// 更新级联选择器的值
const updateCascaderValue = () => {
  cascaderValue.value = props.suitCase.map(item => item.caseId)
}

// 格式化配置预览
const formatConfigPreview = (item: SelectedItem): string => {
  const config = {
    标签: item.label,
    case_id: item.caseId,
    execution_order: item.execution_order,
    is_first: item.is_first,
    is_last: item.is_last
  }

  return JSON.stringify(config, null, 2)
}

// 是否可以提交
const canSubmit = computed(() => {
  return props.suitCase.length > 0
})

// 提交数据预览
const previewDialogVisible = ref(false)
const previewTab = ref('json')

// 格式化提交数据
const formattedSubmitData = computed(() => {
  return JSON.stringify(buildSubmitData(), null, 2)
})

// 构建提交数据
const buildSubmitData = () => {
  return {
    timestamp: new Date().toISOString(),
    total: selectedItems.value.length,
    items: selectedItems.value.map(item => ({
      label: item.label,
      caseId: item.caseId,
      execution_order: item.execution_order,
      is_first: item.is_first,
      is_last: item.is_last
    }))
  }
}

// 预览提交数据
const previewSubmitData = () => {
  previewDialogVisible.value = true
  previewTab.value = 'json'
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedSubmitData.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 提交数据
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要提交 ${selectedItems.value.length} 项数据吗？`,
        '确认提交',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const submitData = buildSubmitData()

    // 触发提交事件
    emit('submit', submitData)

    ElMessage.success('提交成功！')
    console.log('提交的数据:', submitData)
  } catch {
    // 用户取消
  }
}
</script>
<template>
  <div class="cascader-multi-select-config">
      <!-- 级联选择器 -->
      <div class="cascader-section">
        <el-cascader
            v-model="cascaderValue"
            :options="optionMap"
            :props="cascaderProps"
            clearable
            filterable
            placeholder="请选择数据（支持多选）"
            @change="handleCascaderChange"
            style="width: 100%"
        />
      </div>
      <!-- 已选数据列表及配置 -->
      <div v-if="suitCase.length > 0" class="selected-items-section">
        <el-divider content-position="left">
          <span>已选数据及配置 ({{ suitCase.length }})</span>
        </el-divider>

        <div class="items-list">
          <el-card
              v-for="(item, index) in suitCase"
              :key="item.id"
              class="item-card"
              shadow="hover"
          >
            <template #header>
              <div class="item-header">
                <div class="item-title">
                  <span class="item-label">{{ item.label }}</span>
                </div>
                <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    @click="removeItem(item.id)"
                >
                  删除
                </el-button>
              </div>
            </template>

            <!-- 配置表单 -->
            <el-form
                :model="item"
                label-width="140px"
                class="config-form"
            >
              <el-form-item label="用例ID">
                <el-text>{{item.caseId}}</el-text>
              </el-form-item>

              <el-form-item label="执行顺序" prop="execution_order">
                <el-input-number
                    v-model="item.execution_order"
                    :min="0"
                    :precision="0"
                    controls-position="right"
                    placeholder="请输入执行顺序"
                    style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="是否首个">
                <el-switch v-model="item.is_first" />
                <span style="margin-left: 8px; color: #909399; font-size: 12px">
                  {{ item.is_first ? 'true' : 'false' }}
                </span>
              </el-form-item>

              <el-form-item label="是否最后">
                <el-switch v-model="item.is_last" />
                <span style="margin-left: 8px; color: #909399; font-size: 12px">
                  {{ item.is_last ? 'true' : 'false' }}
                </span>
              </el-form-item>

              <!-- 配置预览 -->
<!--              <el-form-item label="配置预览">-->
<!--                <div class="config-preview">-->
<!--                  <pre>{{ formatConfigPreview(item) }}</pre>-->
<!--                </div>-->
<!--              </el-form-item>-->
            </el-form>
          </el-card>
        </div>
      </div>
      <!-- 提交区域 -->
      <div v-if="selectedItems.length > 0" class="submit-section">
        <el-divider />
        <div class="submit-actions">
          <el-button
              type="info"
              :icon="View"
              @click="previewSubmitData"
          >
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
    <!-- 提交数据预览对话框 -->
    <el-dialog
        v-model="previewDialogVisible"
        title="提交数据预览"
        width="900px"
    >
    </el-dialog>
  </div>
</template>
<style scoped>
.cascader-multi-select-config .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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
}

.cascader-multi-select-config .item-card .item-title .item-label {
  font-weight: 500;
  color: #303133;
}

.cascader-multi-select-config .item-card .config-form {
  margin-top: 10px;
}

.cascader-multi-select-config .item-card .config-preview {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.cascader-multi-select-config .item-card .config-preview pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.cascader-multi-select-config .submit-section {
  margin-top: 20px;
}

.cascader-multi-select-config .submit-section .submit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cascader-multi-select-config .preview-content .json-preview {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>