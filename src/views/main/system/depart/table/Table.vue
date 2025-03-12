<script setup lang="ts">
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {reactive, ref} from "vue";
import CommonTable from "@/common/table/CommonTable.vue";
import {CirclePlusFilled, Delete, Download, Histogram, Upload} from "@element-plus/icons-vue";
import { ElMessage } from 'element-plus'
import CommonTool from "@/common/table/CommonTool.vue";

const departInfo = reactive({
  departName: "",
  create_user: "sw.fan",
  update_user: "sw.fan"
})
const departDate = reactive({
  tableDate: [],
  indexKey: "departId",
  column: [
    {
      prop: "departId",
      label: "部门ID"
    },
    {
      prop: "departName",
      label: "部门名"
    },
    {
      prop: "updated_date",
      label: "更新时间"
    },
    {
      prop: "update_user",
      label: "更新人"
    }
  ]
})
const toolDate = reactive([
  {
    icon: Delete,
    btnName: "新增部门"
  }
])
const addDialog = ref(false)
onMounted(async () => {
  const data = await BaseRequest({
    url: "depart",
    method: "GET"
  })
  departDate.tableDate = data.data
})

function switchDialog() {
  addDialog.value = !addDialog.value
  console.log(addDialog.value)
}


function editDepart(indexKey, data) {
  BaseRequest({
    url: 'depart/${indexKey.departId}/',
    method: 'PUT',
    data: data
  })
}

function delDepart(indexKey) {
  console.log(indexKey.departId)
  BaseRequest({
    url: `depart/${indexKey.departId}/`,
    method: "DELETE"
  })
}

async function addDepart(data) {
  addDialog.value = !addDialog.value
  await BaseRequest({
    url: 'depart/',
    method: 'POST',
    data: data
  }).then()

}
</script>

<template>
  <CommonTool :btnList="toolDate" :addDepart="switchDialog" :addDialog="addDialog"></CommonTool>
  <CommonTable :date="departDate" :editFunction="editDepart" :delFunction="delDepart"></CommonTable>
  <el-dialog
      v-model="addDialog"
      title="新增部门"
      width="500"
      :before-close="handleClose"
  >
    <el-form
        v-model="departInfo"
    >
      <el-form-item label="部门名">
        <el-input
            v-model="departInfo.departName"
            placeholder="请输入部门名称"
        ></el-input>
      </el-form-item>
      <el-form-item>
            <el-button @click="switchDialog">取消</el-button>
            <el-button type="primary" @click="addDepart(departInfo)">
              确认
            </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>

</style>