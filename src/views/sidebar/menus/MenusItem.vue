<script setup lang="ts">
import {localCache} from "@/utils/localcache.ts";
import type{menuListType} from "@/views/sidebar/menuTypes.ts";

const menus = localCache.getCache('menuList')
</script>

<template>
  <el-col>
    <el-menu
        active-text-color="deepskyblue"
        class="el-menu-vertical-demo"
        default-active="2"
        text-color="black"
        router="true"
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
  </el-col>
</template>

<style scoped>

</style>