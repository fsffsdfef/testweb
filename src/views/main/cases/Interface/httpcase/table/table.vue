<script setup lang="ts">
import {reactive, ref} from "vue";
import {CirclePlusFilled, Download, Upload, Histogram} from "@element-plus/icons-vue";
import type {CheckboxValueType} from 'element-plus'
import CommonTool from "@/common/table/CommonTool.vue";
import CommonTable from "@/common/table/CommonTable.vue";
import interfaceCaseStore from "@/stores/main/case/interfaceCase";
import {storeToRefs} from "pinia";

const searchData = reactive({
  "portId": "",
  "caseName": null,
  "isCore": "all",
  "update_user": "更新人"
})
// 新增用例所需参数
const httpCase = reactive({
      caseName: '',
      headers: '',
      body: '',
      timeOut: 1,
      retries: 1,
      core: false,
      port: '',
      expressItem: [
        {
          expressList: [
            {
              matchKey: "",
              matchValue: "",
              keyType: "",
              matchValueType: "",
              matchOper: ""
            }
          ]
        }]
    })
const typeMap = [
  {
    label: "字符串",
    value: "str"
  },
  {
    label: "整数",
    value: "int"
  },
  {
    label: "数组",
    value: "list"
  }
]
const matchMap = [
  {
    label: '等于',
    value: '=='
  },
  {
    label: '大于等于',
    value: '>='
  },
  {
    label: '小于等于',
    value: '<='
  },
  {
    label: '不等于',
    value: '!='
  },
  {
    label: '包含于',
    value: 'in'
  },
  {
    label: '包含于',
    value: '不包含于'
  },
  {
    label: '不为空',
    value: '!=null'
  }

]
// 操作栏数据
const toolDate = reactive([
  {
    icon: CirclePlusFilled,
    btnName: "新增用例",
    func:  switchDrawer
  },
  {
    icon: Download,
    btnName: "下载用例",
    func:  switchDrawer
  },
  {
    icon: Upload,
    btnName: "上传用例",
    func:  switchDrawer
  },
  {
    icon: Histogram,
    btnName: "列设置",
    func: showVisible
  }
])
const visible = ref(false)
const showDrawer = ref(false)
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
const tableStore = interfaceCaseStore()
tableStore.getInterfaceCase(searchData)
const {caseDataList} = storeToRefs(tableStore)
function getTable(data:any){
  console.log("天霸洞霸tua")
  tableStore.getInterfaceCase(data)
}

// 用例列表展示参数
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
  tableDate: caseDataList,
  batchSetting: true,
  pullShow: true
})
// onMounted(async () => {
//   const httpCaseList = await BaseRequest({
//     url: 'httpcase',
//     method: 'GET'
//   })
//   const portData = await BaseRequest({
//     url: "port",
//     method: "GET"
//   })
//   httpCaseDate.tableDate = httpCaseList.data
//   console.log("tableDate", httpCaseDate.tableDate)
//   httpCaseDate.port = portData.data.list
// })
//新增用例浮层是否展示
function switchDrawer() {
  showDrawer.value = !showDrawer.value
}
// 列表配置浮层是否展示
function showVisible() {
  visible.value = !visible.value
}
//切换列表展示数据范围
const handleCheckAllChange = (val: CheckboxValueType) => {
  httpCaseDate.column = val ? showType : []
  isIndeterminate.value = false
}
//列表数据全部展示
const handleCheckedCitiesChange = (value: CheckboxValueType[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === showType.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < showType.length
}

// 新增规则
function addChild() {
  httpCase.expressItem[0].expressList.push({
    matchKey: "",
    matchValue: "",
    keyType: "",
    matchValueType: "",
    matchOper: ""
  });
}
// 删除规则
const removeDomain = (item) => {
  const index = httpCase.expressItem[0].expressList.indexOf(item)
  if (index !== -1) {
    httpCase.expressItem[0].expressList.splice(index, 1)
  }
}
defineExpose({ getTable })
</script>
<template>
<!--  操作栏组件-->
  <CommonTool :btnList="toolDate" :switchFun="switchDrawer"></CommonTool>
<!--  列表组件-->
  <CommonTable :date="httpCaseDate"/>
<!--  新增用例浮层-->
  <el-drawer
      v-model="showDrawer"
      direction="btt"
      size="100%"
      with-header
  >
    <template #header style="width: 10%">
      <h1>新增用例</h1>
    </template>
    <div class="common-layout">
      <el-container>
        <el-aside width="49%">
          <div style="display: flex; justify-content: center; align-items: center;">
            <el-form
                :model="httpCase"
                class="form-flex"
                label-position="left"
                label-width="auto"
            >
              <el-form-item>
                <template #label>
                  <div class="label-wrapper">
                    <span>用例名称</span>
                  </div>
                </template>
                <el-input
                    v-model="httpCase.caseName"
                    placeholder="请输入用例名"
                    style="width: 500px"
                    maxlength="10"
                    show-word-limit
                    clearable/>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-wrapper">接口</div>
                </template>
                <el-select
                    v-model="httpCase.port"
                    placeholder="请选择接口"
                    style="width: 500px"
                    clearable
                >
                  <div v-for="portInfo in httpCaseDate.port">
                    <el-option :label=portInfo.portName :value=portInfo.portId></el-option>
                  </div>
                </el-select>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-wrapper">请求头</div>
                </template>
                <el-input
                    v-model="httpCase.headers"
                    style="width: 500px"
                    :rows="3"
                    type="textarea"
                    placeholder="请输入请求头"
                />
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-wrapper">请求体</div>
                </template>
                <el-input
                    v-model="httpCase.body"
                    style="width: 500px"
                    :rows="3"
                    type="textarea"
                    placeholder="请输入请求体"
                />
              </el-form-item>
              <el-form-item label="超时时间">
                <el-space>
                  <el-input-number v-model="httpCase.timeOut" :min="1" :max="20">
                    <template #suffix>
                      <span style="color: black">秒</span>
                    </template>
                  </el-input-number>
                </el-space>
              </el-form-item>
              <el-form-item label="重试次数">
                <el-space>
                  <el-input-number v-model="httpCase.retries" :min="1" :max="3">
                    <template #suffix>
                      <span style="color: black">次</span>
                    </template>
                  </el-input-number>
                </el-space>
              </el-form-item>
              <el-form-item label="规则组">
                <div class="assert">
                  <el-form v-for="(express, index) in httpCase.expressItem[0].expressList" :key="index"
                           label-position="top">
                    <el-form-item :label="'规则' + (index+1)" class="item">
                      <el-input
                          style="width: 20%;"
                          v-model="express.matchKey"
                          placeholder="请输入需断言字段路径"
                      />
                      <el-select
                          style="width: 20%; padding-left: 10px"
                          v-model="express.matchValueType"
                          placeholder="请选择预期结果类型">
                        <el-option
                            v-for="key in typeMap"
                            :label="key.label"
                            :value="key.value"
                        />
                      </el-select>
                      <el-select
                          style="width: 20%; padding-left: 10px"
                          v-model="express.matchOper"
                          placeholder="请选择对比方法">
                        <el-option
                            v-for="key in matchMap"
                            :label="key.label"
                            :value="key.value"
                        />
                      </el-select>
                      <el-input
                          style="width: 20%; padding-left: 10px"
                          v-model="express.matchValue"
                          placeholder="请输入预期结果"
                      />
                      <div style="align-items: center; width: 15%">
                        <el-button type="primary" @click="addChild" icon="CirclePlusFilled" circle></el-button>
                        <el-button
                            type="danger"
                            v-show="httpCase.expressItem[0].expressList.length>1"
                            @click.prevent="removeDomain(express)"
                            icon="RemoveFilled" circle/>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </el-form-item>
              <el-form-item label="是否为核心用例">
                <el-switch v-model="httpCase.core"/>
              </el-form-item>
              <el-form-item>
                <el-button type="primary">取消</el-button>
                <el-button type="primary">运行</el-button>
                <el-button type="primary">保存</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-aside>
        <el-main width="49%">
          <div>
            <span>URL</span>
            <div>
              <span>http://bbzutils.uat.qa.nt.ctripcorp.com/ubtChecking</span>
            </div>
          </div>
          <div>
            <span>headers</span>
          </div>
          <div>
            <span>Request</span>
          </div>
          <div>
            <span>Response</span>
          </div>
          <div>
            <span>Assert</span>
          </div>
        </el-main>
      </el-container>
    </div>
  </el-drawer>
<!--  列展示配置浮层-->
  <el-popover :visible="visible" :width="160">
    <el-checkbox
        v-model="checkAll"
        placement="bottom-end"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
    >
      全展示
    </el-checkbox>
    <el-checkbox-group
        v-model="httpCaseDate.column"
        @change="handleCheckedCitiesChange"
    >
      <el-checkbox v-for="show in showType"  :label="show.label" :value="show">
        {{ show.label }}
      </el-checkbox>
    </el-checkbox-group>
  </el-popover>
</template>

<style scoped>
.el-main {
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>