<template>
  <div class="json-tree">
    <div class="json-node" v-for="(item, index) in formattedData" :key="index">
      <JsonNode 
        :key-name="item.key" 
        :data="item.value" 
        :type="item.type"
        :level="0"
        :show-comma="item.showComma"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JsonNode from './JsonNode.vue'

interface Props {
  data: any
}

const props = defineProps<Props>()

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
  background-color:	#F5FFFA;
  border-radius: 4px;
}
</style>

