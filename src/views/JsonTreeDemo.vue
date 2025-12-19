<script setup lang="ts">
import { ref } from 'vue'
import JsonTree from '@/common/jsonTree/JsonTree.vue'

// 示例JSON数据
const jsonData = ref({
  name: '张三',
  age: 25,
  isActive: true,
  address: {
    city: '北京',
    district: '朝阳区',
    street: '建国路88号'
  },
  hobbies: ['读书', '游泳', '编程'],
  contact: {
    email: 'zhangsan@example.com',
    phone: '13800138000'
  },
  metadata: null
})

// 复杂嵌套示例
const complexData = ref({
  status: 'success',
  data: {
    users: [
      {
        id: 1,
        name: '用户1',
        profile: {
          avatar: 'avatar1.jpg',
          bio: '这是用户1的个人简介',
          settings: {
            theme: 'dark',
            notifications: true
          }
        }
      },
      {
        id: 2,
        name: '用户2',
        profile: {
          avatar: 'avatar2.jpg',
          bio: '这是用户2的个人简介',
          settings: {
            theme: 'light',
            notifications: false
          }
        }
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  },
  message: '获取成功',
  timestamp: 1699123456789
})
</script>
<template>
  <div class="json-demo">
    <h2>JSON 树形展示组件示例</h2>
    
    <div class="demo-section">
      <h3>示例数据：</h3>
      <JsonTree :data="jsonData" />
    </div>

    <div class="demo-section">
      <h3>复杂嵌套示例：</h3>
      <JsonTree :data="complexData" />
    </div>
  </div>
</template>
<style scoped lang="scss">
.json-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    color: #333;
    margin-bottom: 30px;
  }

  .demo-section {
    margin-bottom: 40px;

    h3 {
      color: #666;
      margin-bottom: 15px;
      font-size: 16px;
    }
  }
}
</style>


