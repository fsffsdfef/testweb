<script setup lang="ts">

</script>

<template>
  <div class="logo">
    <img src="../../../assets/logo.svg" alt="Logo" class="img">
    <span style="color: #181818">一体化测试平台</span>
<!--    <span v-show="!isCollapse" style="color: #181818; margin-right: 5px">测试平台</span>-->
  </div>
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