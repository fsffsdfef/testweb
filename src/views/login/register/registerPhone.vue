<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import useToken from '@/store/login/loginCounter'
const ruleForm = reactive({
  phone: '',
  verificationCode: ''
})
const rule  = reactive<FormRules<typeof ruleForm>>({
  phone: [
    {required: true, message: '账号不可为空！', trigger: 'blur'}
  ],
  verificationCode: [
    {required: true, message: '密码不可为空！', trigger: 'blur'},
    {pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}/, message: '密码应包含数子，字母和特殊符号', trigger: 'blur'}
  ]
})
const token = useToken()
function phoneLogin(){
  token.phone = ruleForm.phone
  token.verificationCode = ruleForm.verificationCode
  console.log(token.token, token.verificationCode, token.phone)
}
defineExpose({
  phoneLogin
})
</script>

<template>
  <div>
    <el-form
        :model="ruleForm"
        :rules="rule"
        style="max-width: 600px"
        label-width="auto"
        class="demo-ruleForm"
    >
      <el-form-item label="手机号" prop="phone">
        <el-input
            v-model="ruleForm.phone"
            placeholder="请输入手机号"
            type="text"
            autocomplete="off" />
      </el-form-item>
      <el-form-item label="验证码" prop="verificationCode">
        <el-input
            v-model="ruleForm.verificationCode"
            type="password"
            placeholder="请输入验证码"
            autocomplete="off"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>

</style>