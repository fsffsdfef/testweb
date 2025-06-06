<script setup lang="ts">
import {SwitchButton} from "@element-plus/icons-vue";
import {localCache} from "@/utils/localcache.ts";
import router from "@/router";
import initializeStore from "@/stores/login/loginCounter.ts";
const store = initializeStore()
const userName = localCache.getCache('userInfo')
function quit() {
  localCache.clearCache()
  router.push('/login')
}
function test(){
  store.changeLocale()
}
</script>

<template>
  <div class="tool">
    <el-icon size="25" @click="test" style="padding-right: 10px"><Refresh /></el-icon>
    <el-popover
        class="box-item"
    >
      <template #reference>
        <el-icon size="25"><UserFilled /></el-icon>
      </template>
      <div>
        <el-text class="mx-1" size='large' type="primary">{{ userName['userName'] }}</el-text>
      </div>
      <div @click="quit">
        <el-icon ><SwitchButton /></el-icon>
        <el-text size='large' style="padding-left: 5px">退出</el-text>
      </div>
    </el-popover>
  </div>

</template>

<style scoped>
.tool {
  width: 30%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.popover-base-box {
  width: 600px;
}

.popover-base-box .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popover-base-box .center {
  justify-content: center;
}

.popover-base-box .box-item {
  width: 110px;
  margin-top: 10px;
}
</style>