<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {ElMessage} from "element-plus";
import initializaStore from "@/stores/login/loginCounter";
const use = initializaStore()
const ruleForm = reactive({
  email: '',
  password: ''
})
const rule  = reactive<FormRules<typeof ruleForm>>({
  email: [
    {required: true, message: '账号不可为空！', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '密码不可为空！', trigger: 'blur'},
    {pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}/, message: '密码应包含数子，字母和特殊符号', trigger: 'blur'}
  ]
})
const ruleFormRef = ref<FormInstance>()

function loginAccount(){
  ruleFormRef.value?.validate((valid) => {
    if (valid){
      use.loginAccount(ruleForm)
    }
    else {
      ElMessage.error('账号或密码错误！')
    }
  })
}
defineExpose({
  loginAccount
})

</script>

<template>
  <div>
    <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rule"
        class="demo-ruleForm"
        label-width="auto"
        style="max-width: 600px"
        status-icon
    >
      <el-form-item label="帐号" prop="email">
        <el-input
            v-model="ruleForm.email"
            placeholder="请输入帐号"
            type="text"
            autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
            v-model="ruleForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            autocomplete="off"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>

</style>