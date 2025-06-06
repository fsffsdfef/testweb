<script setup lang="ts">
import {localCache} from "@/utils/localcache.ts";
import type{menuListType} from "@/views/sidebar/menuTypes.ts";
const menus = localCache.getCache('menuList')
import initializeStore from "@/stores/login/loginCounter.ts";
const initialize = initializeStore()
</script>

<template>
  <el-scrollbar>
  <div class="logo">
    <img src="../../assets/logo.svg" alt="Logo" class="img">
    <span v-show="!initialize.isCollapse" style="color: #181818; padding-right: 10px">一体化测试平台</span>
  </div>
      <el-menu
          active-text-color="deepskyblue"
          class="el-menu-vertical-demo"
          default-active="2"
          text-color="black"
          router="true"
          :collapse="initialize.isCollapse"
          unique-opened="true"
      >
        <template v-for="menu in menus" :key="menu.menuId">
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.menuId">
            <template #title>
              <el-icon>
                <component class="icons" :is="menu.icon"/>
              </el-icon>
              <span>{{menu.menuName}}</span>
            </template>
            <template v-for="item in menu.children" :key="item.menuId">
              <el-menu-item :index="item.path">
                <el-icon>
                  <component class="icons" :is="item.icon"></component>
                </el-icon>
                <span>
                {{ item.menuName }}
              </span>
              </el-menu-item>
            </template>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.menuId">
            <el-icon>
              <component class="icons" :is="menu.icon"></component>
            </el-icon>
            <span>{{ menu.menuName }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
</template>

<style scoped>
.logo{
  background: #ffffff linear-gradient(-180deg, #e7edff 0%, rgba(255, 255, 255, 0.5) 100%);
  height: 58px;
  border-right: 1px solid #e5e5e5;
  line-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF;
}
.logo img{
  width: 20px;
  height: 40px;
  margin-right: 8px;
  margin-left: 8px;
}
.logo span{
  font-weight: 600;
  line-height: 50px;
  font-size: 16px;
  font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
  vertical-align: middle;
}
</style>