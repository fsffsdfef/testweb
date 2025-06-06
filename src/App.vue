<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import type { Language } from 'element-plus/es/locale'
import initializeStore from "@/stores/login/loginCounter.ts";
import {computed} from "vue";
const store = initializeStore()
const locales = computed<Language>(() => {
  return store.locale === 'zh-cn'
      ? zhCn as unknown as Language  // 类型断言
      : en as unknown as Language
})

</script>

<template>
  <el-config-provider :locale="locales">
    <div id="app">
      <router-view></router-view>
    </div>
  </el-config-provider>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
