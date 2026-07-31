<!-- ParentComponent.vue -->
<template>
  <div class="data-container">
    <!-- 1. 搜索组件 -->
    <SearchInput
        v-model="searchParams.keyword"
        :debounce-time="300"
        @search="handleSearch"
    />

    <!-- 2. 其他筛选条件 -->
    <div class="filters">
      <select v-model="searchParams.category">
        <option value="">所有分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <select v-model="searchParams.sortBy">
        <option value="createdAt">最新</option>
        <option value="price">价格</option>
      </select>
    </div>

    <!-- 3. 数据展示 -->
    <DataTable
        :data="currentPageData"
        :loading="loading"
    />

    <!-- 4. 分页组件 -->
    <Pagination
        :current-page="pagination.currentPage"
        :total-items="pagination.totalItems"
        :items-per-page="pagination.itemsPerPage"
        :total-pages="pagination.totalPages"
        @page-change="handlePageChange"
        @update:items-per-page="handlePageSizeChange"
    />

    <!-- 5. 页码跳转 -->
    <div class="page-jump">
      <span>跳转到：</span>
      <input
          type="number"
          :min="1"
          :max="pagination.totalPages"
          v-model="jumpPage"
          @keyup.enter="handleJumpPage"
      >
      <button @click="handleJumpPage">跳转</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import SearchInput from './SearchInput.vue'
import Pagination from './Pagination.vue'
import DataTable from './DataTable.vue'

// ============ 状态定义 ============
const loading = ref(false)

// 搜索参数（所有筛选条件）
const searchParams = reactive({
  keyword: '',
  category: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 分页参数
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 20,
  totalItems: 0,
  totalPages: 0
})

// 数据
const allData = ref([])
const jumpPage = ref(1)

// ============ 计算属性 ============
// 当前页数据
const currentPageData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.itemsPerPage
  const end = start + pagination.itemsPerPage
  return filteredData.value.slice(start, end)
})

// 过滤后的数据（包含搜索条件）
const filteredData = computed(() => {
  let data = allData.value

  // 1. 关键词搜索
  if (searchParams.keyword) {
    const keyword = searchParams.keyword.toLowerCase()
    data = data.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    )
  }

  // 2. 分类筛选
  if (searchParams.category) {
    data = data.filter(item => item.category === searchParams.category)
  }

  // 3. 状态筛选
  if (searchParams.status) {
    data = data.filter(item => item.status === searchParams.status)
  }

  // 4. 排序
  data = [...data].sort((a, b) => {
    const aVal = a[searchParams.sortBy]
    const bVal = b[searchParams.sortBy]

    if (searchParams.sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  // 更新分页总数
  pagination.totalItems = data.length
  pagination.totalPages = Math.ceil(data.length / pagination.itemsPerPage)

  // 如果当前页超出范围，重置到第一页
  if (pagination.currentPage > pagination.totalPages && pagination.totalPages > 0) {
    pagination.currentPage = 1
  }

  return data
})

// ============ 监听器 ============
// 监听搜索参数变化（重置分页）
watch(
    () => ({
      keyword: searchParams.keyword,
      category: searchParams.category,
      status: searchParams.status
    }),
    () => {
      // 搜索条件变化时，重置到第一页
      pagination.currentPage = 1
    },
    { deep: true }
)

// 监听每页数量变化
watch(
    () => pagination.itemsPerPage,
    () => {
      // 每页数量变化时，重置到第一页
      pagination.currentPage = 1
    }
)

// ============ 方法定义 ============
// 处理搜索
const handleSearch = (keyword) => {
  searchParams.keyword = keyword
  // 搜索时已经通过 watch 重置了页码，这里只需要获取数据
  fetchData()
}

// 处理分页变化
const handlePageChange = (page) => {
  pagination.currentPage = page
  // 不需要重新获取数据，因为数据已经在 filteredData 中
  // 只是改变了当前页的计算
  scrollToTop() // 可选：滚动到顶部
}

// 处理每页数量变化
const handlePageSizeChange = (size) => {
  pagination.itemsPerPage = size
}

// 处理页面跳转
const handleJumpPage = () => {
  const page = parseInt(jumpPage.value)
  if (page >= 1 && page <= pagination.totalPages) {
    handlePageChange(page)
  }
}

// 获取数据（从API）
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      ...searchParams
    }

    const response = await api.getData(params)
    allData.value = response.data.items
    pagination.totalItems = response.data.total
    pagination.totalPages = Math.ceil(response.data.total / pagination.itemsPerPage)
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置所有筛选条件
const resetFilters = () => {
  searchParams.keyword = ''
  searchParams.category = ''
  searchParams.status = ''
  searchParams.sortBy = 'createdAt'
  searchParams.sortOrder = 'desc'
  pagination.currentPage = 1
  pagination.itemsPerPage = 20
}

// ============ 生命周期 ============
onMounted(() => {
  fetchData()
})
</script>