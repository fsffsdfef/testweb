<script setup lang="ts">
import CommonTable from "@/common/table/commonTable.vue";
import {onMounted} from "@vue/runtime-core";
import BaseRequest from "@/service";
import {reactive, ref} from "vue";
import type { CheckboxValueType } from 'element-plus'
import {CirclePlusFilled, Download, Upload, Histogram} from "@element-plus/icons-vue";
import CommonTool from "@/common/table/CommonTool.vue";

const httpCaseDate = reactive({
  column: [
    {
      prop: "caseId",
      label: "用例ID"
    },
    {
      prop: "caseName",
      label: "用例名"
    },
    {
      prop: "update_user",
      label: "更新人"
    },
    {
      prop: "updated_date",
      label: "更新时间"
    }
  ],
  tableDate: [],
  batchSetting: true,
  pullShow: true
})
const toolDate = reactive([
  {
    icon: CirclePlusFilled,
    btnName: "新增用例"
  },
  {
    icon: Download,
    btnName: "下载用例"
  },
  {
    icon: Upload,
    btnName: "上传用例"
  },
  {
    icon: Histogram,
    btnName: "列设置"
  }
])
const visible = ref(false)
const checkAll = ref(false)
const isIndeterminate = ref(true)
const showType = [
  {
    prop: "caseId",
    label: "用例ID"
  },
  {
    prop: "caseName",
    label: "用例名"
  },
  {
    prop: "update_user",
    label: "更新人"
  },
  {
    prop: "updated_date",
    label: "更新时间"
  },
  {
    prop: "headers",
    label: "请求头"
  },
  {
    prop: "body",
    label: "请求体"
  },
  {
    prop: "timeOut",
    label: "超时时间"
  },
  {
    prop: "retries",
    label: "重试次数"
  },
  {
    prop: "isCore",
    label: "是否为核心用例"
  },
]
onMounted(async () => {
  const httpCaseData = await BaseRequest({
    url: 'httpcase',
    method: 'GET'
  })
  httpCaseDate.tableDate = httpCaseData.data
})
const handleCheckAllChange = (val: CheckboxValueType) => {
  httpCaseDate.column = val ? showType : []
  isIndeterminate.value = false
}

const handleCheckedCitiesChange = (value: CheckboxValueType[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === showType.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < showType.length
}
</script>
<template>
<!--  <div>-->
<!--    <div>-->

<!--    </div>-->
<!--&lt;!&ndash;    <el-button>新增用例</el-button>&ndash;&gt;-->
<!--&lt;!&ndash;    <el-button @click="visible=true">列设置</el-button>&ndash;&gt;-->
<!--    <el-popover :visible="visible" :width="160">-->
<!--      <el-checkbox-->
<!--          v-model="checkAll"-->
<!--          :indeterminate="isIndeterminate"-->
<!--          @change="handleCheckAllChange"-->
<!--      >-->
<!--        全展示-->
<!--      </el-checkbox>-->
<!--      <el-checkbox-group-->
<!--          v-model="httpCaseDate.column"-->
<!--          @change="handleCheckedCitiesChange"-->
<!--      >-->
<!--        <el-checkbox v-for="show in showType"  :label="show.label" :value="show">-->
<!--          {{ show.label }}-->
<!--        </el-checkbox>-->
<!--      </el-checkbox-group>-->
<!--    </el-popover>-->
<!--  </div>-->
    <CommonTool :btnList="toolDate"></CommonTool>
    <CommonTable :date="httpCaseDate"/>
</template>

<style scoped>

</style>