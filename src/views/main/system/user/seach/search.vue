<script setup lang="ts">
import {reactive} from "vue";
import CommonSearch from "@/common/table/CommonSearch.vue";
import userSearchConfig from "@/views/main/system/user/searchconfig.ts";
const searchData = reactive({
  userName: "",
  email: "",
  phone: ""
})

function remove(){
  console.log("重置")
}
function search(){
  console.log("搜索")
}
</script>

<template>
  <el-form
    v-model="searchData"
    :inline="true"
  >
    <CommonSearch :search="userSearchConfig"></CommonSearch>
<!--   <el-form-item label="用户名">-->
<!--     <el-input v-model="searchData.userName" placeholder="请输入用户名"></el-input>-->
<!--   </el-form-item>-->
<!--    <el-form-item label="邮箱">-->
<!--      <el-input v-model="searchData.email" placeholder="请输入邮箱"></el-input>-->
<!--    </el-form-item>-->
<!--    <el-form-item label="用户名">-->
<!--      <el-input v-model="searchData.phone" placeholder="请输入手机号"></el-input>-->
<!--    </el-form-item>-->
  </el-form>
</template>

<style scoped>
.itemcss {
  display: flex;
  align-items: center;
}
</style>