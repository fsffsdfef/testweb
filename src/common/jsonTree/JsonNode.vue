<script setup lang="ts">
import { ref, computed } from 'vue'
interface Props {
  keyName?: string | number
  data: any
  type?: string
  level: number
  showComma?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showComma: false
})

const isExpanded = ref(true)
const key = computed(() => props.keyName ?? '')
const type = computed(() => props.type ?? getType(props.data))
const value = computed(() => props.data)
const isExpandable = computed(() => {
  return type.value === 'object' || type.value === 'array'
})

const showKey = computed(() => {
  return key.value !== '' && key.value !== undefined
})

const children = computed(() => {
  if (type.value === 'array') {
    return Array.isArray(value.value)
        ? value.value.map((item: any, index: number) => ({
          key: index,
          value: item,
          type: getType(item)
        }))
        : []
  } else if (type.value === 'object') {
    return value.value && typeof value.value === 'object'
        ? Object.keys(value.value).map(key => ({
          key,
          value: value.value[key],
          type: getType(value.value[key])
        }))
        : []
  }
  return []
})

// 固定缩进距离
const INDENT_SIZE = 20

function getType(val: any): string {
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

// function formatValue(val: any, valType: string): string {
//   if (valType === 'string') {
//     const str = String(val)
//
//     // 如果是JSON字符串，可以尝试美化
//     if (str.length > 80 && (str.startsWith('{') || str.startsWith('['))) {
//       try {
//         // 尝试格式化JSON字符串
//         const parsed = JSON.parse(str)
//         return `${JSON.stringify(parsed, null, 2)}` // 添加缩进
//       } catch {
//         // 不是有效JSON，保持原样
//         return `"${str}"`
//       }
//     }
//
//     return `"${str}"`
//   }
//   if (valType === 'null') {
//     return 'null'
//   }
//   if (valType === 'undefined') {
//     return 'undefined'
//   }
//   return String(val)
// }
function formatValue(val: any, valType: string): string {
  if (valType === 'string') {
    // 始终按 JSON 字符串字面量展示，带外层引号，不自动 parse
    return JSON.stringify(String(val))
  }
  if (valType === 'null') {
    return 'null'
  }
  if (valType === 'undefined') {
    return 'undefined'
  }
  return String(val)
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="json-node-wrapper">
    <div class="json-node-line">
      <!-- 展开/收起按钮 -->
      <span
          v-if="isExpandable"
          class="expand-icon"
          @click="toggleExpand"
      >
        {{ isExpanded ? '▼' : '▶' }}
      </span>
      <span v-else class="expand-placeholder"></span>

      <!-- 键名 -->
      <span v-if="showKey" class="json-key">"{{ key }}":</span>

      <!-- 值显示 -->
      <span v-if="!isExpandable || isExpanded" class="json-value-wrapper">
        <!-- 对象开始 -->
        <span v-if="type === 'object'" class="json-bracket">{</span>
        <span v-if="type === 'array'" class="json-bracket">[</span>

        <!-- 非展开的值 -->
        <span v-if="!isExpandable" class="json-value" :class="`json-${type}`">
          {{ formatValue(value, type) }}
        </span>

        <!-- 对象结束（非展开时） -->
        <span v-if="!isExpandable && type === 'object'" class="json-bracket">}</span>
        <span v-if="!isExpandable && type === 'array'" class="json-bracket">]</span>
        <!-- 逗号（除了最后一个） -->
        <span v-if="showComma" class="json-comma">,</span>
      </span>

      <!-- 收起时显示省略号 -->
      <span v-if="isExpandable && !isExpanded" class="json-collapsed">
        {{ type === 'object' ? '{...}' : '[...]' }}
      </span>
    </div>

    <!-- 展开的内容区域 - 子节点在这里，相对于父节点key缩进 -->
    <div v-if="isExpandable && isExpanded" class="json-children-container">
      <JsonNode
          v-for="(child, index) in children"
          :key="index"
          :key-name="child.key"
          :data="child.value"
          :type="child.type"
          :level="level + 1"
          :show-comma="index < children.length - 1"
      />
      <!-- 对象结束 -->
      <div class="json-close-bracket">
        <span v-if="type === 'object'" class="json-bracket">}</span>
        <span v-if="type === 'array'" class="json-bracket">]</span>
        <span v-if="showComma" class="json-comma">,</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.json-node-wrapper {
  margin: 0;
  line-height: 1.5;
  display: block;
  width: 100%;
  box-sizing: border-box; // 确保宽度计算正确
}

.json-node-line {
  display: flex;
  align-items: flex-start;
  min-height: 20px;
  line-height: 1.5;
  width: 100%;
  flex-wrap: nowrap;
  box-sizing: border-box;
}

.json-children-container {
  padding-left: 20px; // 固定缩进距离，相对于父节点key的结束位置
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.json-close-bracket {
  padding-left: 20px; // 与子节点对齐
  line-height: 1.5;
  display: block;
  min-height: 20px;
  box-sizing: border-box;
}

.expand-icon {
  cursor: pointer;
  user-select: none;
  color: #000000;
  font-size: 10px;
  width: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
  flex-shrink: 0;
  line-height: 1;
  font-weight: bold;
}

.expand-placeholder {
  width: 12px;
  display: inline-block;
  margin-right: 4px;
  flex-shrink: 0;
}

.json-key {
  color: #000000;
  font-weight: 500;
  margin-right: 6px;
  flex-shrink: 0;
  white-space: nowrap; // 防止key换行
}

.json-value-wrapper {
  display: block; // 改回 block，避免 flex 布局问题
  flex: 1;
  min-width: 0; // 允许缩小
  word-break: break-all;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  white-space: pre-wrap;
  box-sizing: border-box;
}

.json-bracket {
  color: #000;
  font-weight: bold;
  margin: 0 2px;
  white-space: nowrap; // 防止括号换行
  display: inline-block; // 确保是内联块
}

.json-children {
  display: block;
  width: 100%; // 确保占满宽度
  box-sizing: border-box;
}

.json-value {
  display: inline;
  word-break: break-all;
  word-wrap: break-word;
  overflow-wrap: break-word;

  &.json-string {
    color: #A52A2A;
  }

  &.json-number {
    color: #A52A2A;
  }

  &.json-boolean {
    color: #A52A2A;
  }

  &.json-null {
    color: #A52A2A;
    font-style: italic;
  }
}

.json-collapsed {
  color: #666;
  font-style: italic;
  cursor: pointer;
  display: inline-block; // 改为 inline-block
  white-space: nowrap; // 防止省略号换行
  flex-shrink: 0; // 省略号不缩小
  &:hover {
    color: #409eff;
  }
}

.json-comma {
  color: #000000;
  margin-left: 0;
  display: inline-block; // 改为 inline-block
  white-space: nowrap; // 防止逗号换行
  flex-shrink: 0; // 逗号不缩小
}

.json-value.json-string {
  color: #A52A2A;
  word-break: break-all;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
  display: inline-block; // 确保可以换行
}
</style>