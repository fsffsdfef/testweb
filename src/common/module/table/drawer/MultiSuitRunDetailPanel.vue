<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SuitRunDetailPanel from '@/common/module/table/drawer/SuitRunDetailPanel.vue'
import { parseSuitRunTabs } from '@/utils/suitRunUtil.ts'

const props = defineProps<{
  showData: Record<string, any>
}>()

const activeTab = ref('')

const suitTabs = computed(() => parseSuitRunTabs(props.showData))

const activeSuitData = computed(() => {
  const tab = suitTabs.value.find(item => item.key === activeTab.value)
  return tab?.data ?? suitTabs.value[0]?.data ?? null
})

watch(
    suitTabs,
    (tabs) => {
      if (!tabs.length) {
        activeTab.value = ''
        return
      }
      if (!tabs.some(tab => tab.key === activeTab.value)) {
        activeTab.value = tabs[0].key
      }
    },
    { immediate: true }
)
</script>

<template>
  <div class="multi-suit-detail">
    <template v-if="suitTabs.length > 1">
      <el-tabs v-model="activeTab" type="card" class="suit-tabs">
        <el-tab-pane
            v-for="tab in suitTabs"
            :key="tab.key"
            :name="tab.key"
        >
          <template #label>
            <span class="tab-label">
              {{ tab.label }}
              <el-tag
                  v-if="tab.pass != null"
                  size="small"
                  :type="Number(tab.pass) >= 100 ? 'success' : 'warning'"
                  effect="plain"
                  round
              >
                {{ tab.pass }}%
              </el-tag>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div v-if="activeSuitData" class="suit-tab-content">
        <SuitRunDetailPanel :key="activeTab" :show-data="activeSuitData" />
      </div>
    </template>

    <template v-else-if="suitTabs.length === 1">
      <div class="suit-tab-content">
        <SuitRunDetailPanel :show-data="suitTabs[0].data" />
      </div>
    </template>

    <el-empty v-else description="暂无运行详情" />
  </div>
</template>

<style scoped>
.multi-suit-detail {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.suit-tabs {
  flex-shrink: 0;
}

.suit-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.suit-tabs :deep(.el-tabs__content) {
  display: none;
}

.suit-tab-content {
  width: 100%;
}

.suit-tabs :deep(.el-tabs__nav-wrap) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.suit-tabs :deep(.el-tabs__nav-wrap)::-webkit-scrollbar {
  display: none;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>