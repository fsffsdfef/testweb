<script setup lang="ts">
import { ref,reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import systemStore from "@/stores/main/system/systemStore.ts";
import {storeToRefs} from "pinia";
import addConfig from "@/views/main/system/depart/configs/operation-config.ts";
const system = systemStore()
const {dialogVisible} = storeToRefs(system)
const initialForm: any = reactive({})
for (const item of addConfig.formItem) {
  initialForm[item.prop] = item.initialValue ?? ""
}
const handleClose = (done: () => void) => {
  // ElMessageBox.confirm('Are you sure to close this dialog?')
  //     .then(() => {
  //       done()
  //     })
  //     .catch(() => {
  //       // catch error
  //     })
  console.log("213")
}
</script>

<template>
  <el-button plain @click="dialogVisible = true">
    Click to open the Dialog
  </el-button>

  <el-dialog
      v-model="dialogVisible"
      title="Tips"
      width="500"
      :before-close="handleClose"
  >
    <span>This is a message</span>
    <template #footer>
      <template v-for="item in addConfig.formItem">

      </template>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>