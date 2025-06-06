<script setup lang="ts">
import ywzRequest from "@/service";
import CommonTable from "@/common/module/table/CommonTable.vue";
async function getMenu() {
  const data = await ywzRequest({
    url: 'user/',
    method: 'GET'
  })
  console.log('data:',data)
}
</script>

<template>
<el-button @click="getMenu">点击</el-button>
  <common-table></common-table>
  <!--      <div>-->
  <!--        <el-table-column type="selection" align="center"/>-->
  <!--      </div>-->
  <!--      <div>-->
  <!--        <el-table-column type="expand">-->
  <!--          <template #default="props">-->
  <!--            <el-table :data="props.tableData"-->
  <!--                      style="width: 100%">-->
  <!--              <template v-for="col in props.column">-->
  <!--                <el-table-column-->
  <!--                    :prop="col.prop"-->
  <!--                    :label="col.label"-->
  <!--                    align="center"-->
  <!--                    show-overflow-tooltip-->
  <!--                />-->
  <!--              </template>-->
  <!--            </el-table>-->
  <!--          </template>-->
  <!--        </el-table-column>-->
  <!--      </div>-->
</template>

<style scoped>

</style>