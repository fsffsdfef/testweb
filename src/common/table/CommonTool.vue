<script setup lang="ts">

const props = defineProps({
  btnList: {
    default: []
  },
  switchFun: {
    type: Function
  },
  addDialog: {
    default: false
  }
})
</script>

<template>
  <div class="main">
    <div>
      <span>域名：</span>
    </div>
    <div class="tool">
      <div v-for="btn in btnList">
        <el-button
            :icon="btn.icon"
            style="margin-right: 5px"
            @click=btn.func
            round
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