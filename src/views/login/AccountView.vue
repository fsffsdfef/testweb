<script setup lang="ts">
import {ref} from "vue"
import RegisterAccount from "@/views/login/register/registerAccount.vue";
import RegisterPhone from "@/views/login/register/registerPhone.vue";
const activeName = ref("user")
const checked = ref<boolean>(false)
const accountRef = ref<InstanceType<typeof RegisterAccount>>()
const phoneRef = ref<InstanceType<typeof RegisterPhone>>()
function registerBtn(){
  if (activeName.value === 'user'){
    accountRef.value?.loginAccount()
  }
  else {
    phoneRef.value?.phoneLogin()
  }
}
</script>

<template>
  <div class="register-login">
    <div>
      <h1>测试管理平台</h1>
    </div>
    <div class="table">
      <el-tabs
          v-model="activeName"
          type="border-card"
          class="demo-tabs"
          stretch
      >
        <el-tab-pane name="user">
          <template #label>
            <el-icon><User /></el-icon>
            <span class="text">密码登录</span>
          </template>
          <register-account ref="accountRef"></register-account>
        </el-tab-pane>
        <el-tab-pane name="phone">
          <template #label>
            <el-icon><Iphone /></el-icon>
            <span class="text">验证码登录</span>
          </template>
          <register-phone ref="phoneRef"></register-phone>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="register-check" v-if="activeName==='user'">
      <el-checkbox v-model="checked" label="记住密码" size="large" />
      <el-link type="primary">忘记密码</el-link>
    </div>
    <div>
      <el-button style="width: 100%;margin-top: 10px" type="primary" @click="registerBtn">登录</el-button>
    </div>
  </div>
</template>

<style scoped>
.register-login {
  width: 400px;
//border: 1px solid #000000;
  border: 1px solid #ccc;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 20px;
}
.register-check {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text {
  margin-left: 5px;
}
:deep(.el-input__inner) {
  box-shadow: 0 0 0 1000px #fff inset;
}
</style>