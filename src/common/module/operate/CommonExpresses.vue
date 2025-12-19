<script setup lang="ts">
import {reactive, ref, computed } from "vue";
import {CirclePlusFilled, RemoveFilled, Top} from "@element-plus/icons-vue";
import {ElForm, ElMessage, ElMessageBox} from 'element-plus'
import systemStore from "@/stores/main/system/systemStore.ts";
import {storeToRefs} from "pinia";

const system = systemStore()
getOperators()
const {operatorMap} = storeToRefs(system)
console.log("operatorMap", operatorMap.value)
const matchMap = computed(()=>{
  return Object.entries(operatorMap.value).map(([op, name]) => ({
    label: name,
    value: op
  }))
})
interface ExpressRule {
  matchKey: string;
  keyType: string;
  matchMethod: string | null;
  matchValue: string;
  matchValueType: string;
  matchOper: string;
}

interface RuleGroup {
  expressList: ExpressRule[];
}
const prop = defineProps<{expressItem: RuleGroup[];}>()
const formItem = reactive<RuleGroup[]>([
  {
    expressList: [
      {
        matchKey: "",
        keyType: "",
        matchMethod: null,
        matchValue: "",
        matchValueType: "",
        matchOper: ""
      }
    ]
  }
]);
const matchMethodMap = reactive([
  {label: '长度', value: 'len'},
  {label: '总和', value: 'sum'}
])
// const matchMap = reactive([
//   {label: '等于', value: '=='},
//   {label: '大于等于', value: '>='},
//   {label: '小于等于', value: '<='},
//   {label: '不等于', value: '!='},
//   {label: '包含于', value: 'in'},
//   {label: '不包含于', value: 'not in'},
//   {label: '不为空', value: '!=null'}
// ]);

const typeMap = reactive([
  {label: "字符串", value: "str"},
  {label: "整数", value: "int"},
  {label: "数组", value: "list"}
]);
function getOperators() {
  system.getOperatorAction()
}
function addRuleToGroup(groupIndex: number) {
  const group = prop.expressItem[groupIndex];
  if (group) {
    group.expressList.push({
      matchKey: "",
      keyType: "",
      matchMethod: null,
      matchValue: "",
      matchValueType: "",
      matchOper: ""
    });
  }
}

function addGroup() {
  prop.expressItem.push({
    expressList: [
      {
        matchKey: "",
        keyType: "",
        matchMethod: null,
        matchValue: "",
        matchValueType: "",
        matchOper: ""
      }
    ]
  });
}
const dialogVisible = ref(false)
function removeGroup(groupIndex: number) {
  if (prop.expressItem.length > 1) {
    prop.expressItem.splice(groupIndex, 1);
  }
}

function removeRule(groupIndex: number, ruleIndex: number) {
  const group = prop.expressItem[groupIndex];
  if (group && group.expressList.length > 1) {
    group.expressList.splice(ruleIndex, 1);
  }
}
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('Are you sure to close this dialog?')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
}
function changeDialogVisible(){
  dialogVisible.value = !dialogVisible.value
}
</script>

<template>
      <div class="form-container">
        <!-- 外层循环规则组 -->
        <div
            v-for="(group, groupIndex) in prop.expressItem"
            :key="groupIndex"
            class="rule-group"
        >
          <div class="group-header">
            <h3>规则组 {{ groupIndex + 1 }}</h3>
            <el-button
                type="danger"
                @click="removeGroup(groupIndex)"
                :disabled="prop.expressItem.length <= 1"
            >
              删除组
            </el-button>
          </div>

          <!-- 内层循环规则 -->
          <el-form-item
              v-for="(rule, ruleIndex) in group.expressList"
              :key="ruleIndex"
              label-position="top"
              :label="`规则 ${ruleIndex + 1}`"
              class="rule-item"
          >

            <div class="rule-fields">
              <el-input
                  v-model="rule.matchKey"
                  placeholder="需要校验的字段"
                  clearable
              />
              <el-select
                  v-model="rule.matchOper"
                  placeholder="校验条件"
                  clearable
              >
                <el-option
                    v-for="match in matchMap"
                    :key="match.value"
                    :label="match.label"
                    :value="match.value"
                />
              </el-select>
              <el-select
                  v-show="rule.matchOper != '!=null'"
                  v-model="rule.matchMethod"
                  placeholder="运算"
                  clearable
              >
                <el-option
                    v-for="type in matchMethodMap"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
              </el-select>
                <el-input
                    v-show="rule.matchOper != '!=null'"
                    v-model="rule.matchValue"
                    placeholder="预期值"
                    clearable
                />
                <el-select
                    v-show="rule.matchOper != '!=null'"
                    v-model="rule.keyType"
                    placeholder="字段类型"
                    clearable
                >
                  <el-option
                      v-for="type in typeMap"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                  />
                </el-select>

              <div class="rule-actions">
                <el-button
                    type="primary"
                    @click="addRuleToGroup(groupIndex)"
                    :icon="CirclePlusFilled"
                    circle
                />
                <el-button
                    type="danger"
                    @click="removeRule(groupIndex, ruleIndex)"
                    :icon="RemoveFilled"
                    circle
                    :disabled="group.expressList.length <= 1"
                />
              </div>
            </div>
          </el-form-item>
        </div>

        <div class="add-group-container">
          <el-button type="primary" @click="addGroup" :icon="CirclePlusFilled">
            添加规则组
          </el-button>
        </div>
      </div>
<!--    </el-form>-->
<!--  </el-dialog>-->
</template>

<style scoped>
.form-container {
  padding: 20px;
}

.rule-group {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.rule-item {
  margin-bottom: 16px;
}

.rule-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.rule-fields > * {
  flex: 1;
  min-width: 150px;
}

.rule-actions {
  display: flex;
  gap: 8px;
  min-width: 100px;
}

.add-group-container {
  margin-top: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rule-fields {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-fields > * {
    width: 100%;
    min-width: unset;
  }

  .rule-actions {
    justify-content: center;
    margin-top: 10px;
  }
}

</style>