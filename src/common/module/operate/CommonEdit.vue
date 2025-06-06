<script setup lang="ts">
import { ref, reactive, computed, watch, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { FormItemConfig } from '@/common/types/main/type.ts'

interface Props {
  config: {
    formItem: (FormItemConfig & { isIndex?: boolean })[]
  }
}

interface Emits {
  (e: 'submit-action', edit: boolean, data: Record<string, any>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框状态
const moduleShow = ref(false)
const isEditMode = ref(false)

// 响应式表单数据（使用明确类型）
const formModel = reactive<Record<string, any>>({})

// 过滤后的表单项（避免直接修改props）
const filteredFormItems = computed(() =>
    props.config.formItem.filter(item =>
        isEditMode.value ? true : !item.isIndex
    )
)

// 表单重置逻辑
const resetForm = () => {
  filteredFormItems.value.forEach(item => {
    formModel[item.prop] = item.initialValue ?? null
  })
}

// 对话框关闭确认
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭吗？未保存的内容将会丢失')
      .then(done)
      .catch(() => { /* 取消操作 */ })
}

// 提交处理
const handleSubmit = () => {
  const submitData = toRaw(formModel)
  emit('submit-action', isEditMode.value, submitData)
  moduleShow.value = false
  resetForm()
}

// 暴露给父组件的方法
const openDialog = (edit: boolean, rowData?: Record<string, any>) => {
  isEditMode.value = edit
  resetForm()

  if (edit && rowData) {
    filteredFormItems.value.forEach(item => {
      formModel[item.prop] = rowData[item.prop] ?? item.initialValue
    })
  }

  moduleShow.value = true
}

defineExpose({ openDialog })

// 自动处理空值
watch(formModel, (newVal) => {
  if (newVal.departId === '') {
    formModel.departId = null
  }
}, { deep: true })
</script>

<template>
  <el-dialog
      v-model="moduleShow"
      :title="isEditMode ? '编辑部门' : '新增部门'"
      width="500"
      :before-close="handleClose"
  >
    <el-form :model="formModel" label-width="100px">
      <template v-for="item in filteredFormItems" :key="item.prop">
        <el-form-item
            :label="item.label"
            :prop="item.prop"
            :rules="item.rules"
        >
          <el-input
              v-model="formModel[item.prop]"
              :placeholder="item.placeholder"
              clearable
          />
        </el-form-item>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="moduleShow = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>