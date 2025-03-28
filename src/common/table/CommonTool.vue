<script setup lang="ts">
import {List} from "@element-plus/icons-vue";

const props = defineProps({
  tools: {
    default: {
      btnList: [],
      header: {
        title: "列表",
        icon: List
      }
    }
  }
})
</script>

<template>
  <div class="main">
    <div>
      <el-text size="large" style="font-weight: bold">
        <el-icon size="20"><List/></el-icon>
        {{ tools.header.title}}
      </el-text>
    </div>
    <div class="tool">
      <div v-for="btn in tools.btnList">
        <el-button
            type="primary"
            :icon="btn.icon"
            style="margin-right: 5px"
            plain
        >
          {{ btn.btnName }}
        </el-button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.main {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
.tool {
  display: flex;
  align-content: center;
  justify-content: flex-end;
  margin-bottom: 10px;
}

</style>