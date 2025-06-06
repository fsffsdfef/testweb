<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import initializeStore from "@/stores/login/loginCounter.ts";
const initialize = initializeStore()
const route = useRoute()
const router = useRouter()

// 生成面包屑项的计算属性
const breadcrumbItems = computed(() => {
  return route.matched
      .filter(record => record.meta?.breadcrumb !== false)
      .map(record => ({
        path: resolvePath(record),
        meta: record.meta,
        name: record.name
      }))
})
// 路径解析方法
const resolvePath = (record) => {
  // 处理动态路径参数
  if (record.path.includes(':') && route.params) {
    return Object.entries(route.params).reduce((path, [key, value]) => {
      return path.replace(`:${key}`, value)
    }, record.path)
  }

  // 使用路由解析器处理嵌套路径
  try {
    const resolved = router.resolve(record)
    return resolved.href
  } catch {
    return record.path
  }
}
function test(){
  initialize.changeCollapse()
  console.log('点击了icon')
}
</script>

<template>
  <div class="crumbs">
    <div>
      <el-icon size="20" @click="test"><Expand /></el-icon>
    </div>
    <div style="padding-left: 10px">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item
            v-for="(item, index) in breadcrumbItems"
            :key="item.path"
            :to="index < breadcrumbItems.length - 1 ? item.path : undefined"
            :class="{ 'last-item': index === breadcrumbItems.length - 1 }"
        >
          <!-- 带图标的显示 -->
          <el-icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <!-- 动态标题处理 -->
          <span v-if="typeof item.meta?.title === 'function'">
        {{ item.meta.title(route) }}
      </span>
          <span v-else>
        {{ item.meta?.title || item.path }}
      </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>

</template>

<style scoped>
.crumbs {
  width: 70%;
  border-bottom-color: #2c3e50;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

</style>