<template>
  <div class="json-tree" :class="{ 'json-tree--embedded': embedded }">
    <span v-if="showBraces && isObject" class="brace">{</span>
    <span v-else-if="showBraces && isArray" class="brace">[</span>
    <div class="json-node" v-for="(item, index) in formattedData" :key="index">
      <JsonNode
          :key-name="item.key"
          :data="item.value"
          :type="item.type"
          :level="0"
          :show-comma="item.showComma"
      />
    </div>
    <span v-if="showBraces && isObject" class="brace">}</span>
    <span v-else-if="showBraces && isArray" class="brace">]</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JsonNode from './JsonNode.vue'

interface Props {
  data: any
  showBraces?: boolean
  embedded?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showBraces: true,
  embedded: false,
})

const isObject = computed(() =>
    typeof props.data === 'object' &&
    props.data !== null &&
    !Array.isArray(props.data)
)
const isArray = computed(() => Array.isArray(props.data))
const formattedData = computed(() => {
  if (Array.isArray(props.data)) {
    const items = props.data.map((item, index) => ({
      key: index,
      value: item,
      type: getType(item)
    }))
    return items.map((item, index) => ({
      ...item,
      showComma: index < items.length - 1
    }))
  } else if (typeof props.data === 'object' && props.data !== null) {
    const keys = Object.keys(props.data)
    return keys.map((key, index) => ({
      key,
      value: props.data[key],
      type: getType(props.data[key]),
      showComma: index < keys.length - 1
    }))
  } else {
    return [{
      key: 'root',
      value: props.data,
      type: getType(props.data),
      showComma: false
    }]
  }
})

function getType(value: any): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}
</script>

<style scoped lang="scss">
.json-tree {
  border: 1px solid #000;
  text-align: left;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 10px;
  background-color: #F5FFFA;
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.json-tree::-webkit-scrollbar {
  display: none;
}

/* 详情页：在 json-tree 层内部滚动 */
.json-tree--embedded {
  flex: 1;
  min-height: 0;
  height: 100%;
  max-height: none;
  box-sizing: border-box;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.json-tree--embedded::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>