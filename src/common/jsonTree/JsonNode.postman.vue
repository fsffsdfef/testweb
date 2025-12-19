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

function getType(val: any): string {
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

function formatValue(val: any, valType: string): string {
  if (valType === 'string') {
    const str = String(val)

    // 如果是JSON字符串，可以尝试美化
    if (str.length > 80 && (str.startsWith('{') || str.startsWith('['))) {
      try {
        // 尝试格式化JSON字符串
        const parsed = JSON.parse(str)
        return `"${JSON.stringify(parsed, null, 2)}"` // 添加缩进
      } catch {
        // 不是有效JSON，保持原样
        return `"${str}"`
      }
    }

    return `"${str}"`
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
    <div class="json-node-content" :style="{ marginLeft: level > 0 ? `${level * 16}px` : '0' }">
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

        <!-- 展开的内容 -->
        <div v-if="isExpandable && isExpanded" class="json-children">
          <JsonNode
              v-for="(child, index) in children"
              :key="index"
              :key-name="child.key"
              :data="child.value"
              :type="child.type"
              :level="level + 1"
              :show-comma="index < children.length - 1"
          />
        </div>

        <!-- 非展开的值 -->
        <span v-if="!isExpandable" class="json-value" :class="`json-${type}`">
          {{ formatValue(value, type) }}
        </span>

        <!-- 对象结束 -->
        <span v-if="type === 'object'" class="json-bracket">}</span>
        <span v-if="type === 'array'" class="json-bracket">]</span>
        <!-- 逗号（除了最后一个） -->
        <span v-if="showComma" class="json-comma">,</span>
      </span>

      <!-- 收起时显示省略号 -->
      <span v-if="isExpandable && !isExpanded" class="json-collapsed">
        {{ type === 'object' ? '{...}' : '[...]' }}
      </span>

    </div>
  </div>
</template>

<style scoped lang="scss">
.json-node-wrapper {
  margin: 0;
  line-height: 1.5;
}
.json-node-content {
  display: flex;
  align-items: flex-start;
  min-height: 20px;
  line-height: 1.5;
  width: 100%;
  max-height: 100%;
}
.expand-icon {
  cursor: pointer;
  user-select: none;
  color: #666;
  font-size: 10px;
  width: 12px;
  display: inline-block;
  margin-right: 4px;
  flex-shrink: 0;
  line-height: 1;
}
.expand-placeholder {
  width: 12px;
  display: inline-block;
  margin-right: 4px;
  flex-shrink: 0;
}
.json-key {
  color: #8B0000;
  font-weight: 500;
  margin-right: 6px;
  flex-shrink: 0;
}
.json-value-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  word-break: break-all;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-height: 100%;
}
.json-bracket {
  color: #000;
  font-weight: bold;
  margin: 0 2px;
}
.json-children {
  display: block;
  height: 100%;
}
.json-value {
  height: 100%;
  display: inline;

  &.json-string {
    color: #1a1aa6;
  }

  &.json-number {
    color: #1c00cf;
  }

  &.json-boolean {
    color: 	#FF8C00;
  }

  &.json-null {
    color: #808080;
    font-style: italic;
  }
}
.json-collapsed {
  color: #666;
  font-style: italic;
  cursor: pointer;
  display: inline;
  &:hover {
    color: #409eff;
  }
}
.json-comma {
  color: #000000;
  margin-left: 0;
  display: inline;
}
.json-value.json-string {
  color: #1a1aa6;
  word-break: break-all;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
}
</style>

