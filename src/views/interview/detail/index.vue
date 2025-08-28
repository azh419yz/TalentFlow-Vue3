<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="面试记录ID" prop="interviewId">
        <el-input v-model="queryParams.interviewId" placeholder="请输入面试记录ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="节点顺序" prop="nodeOrder">
        <el-input v-model="queryParams.nodeOrder" placeholder="请输入节点顺序" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="节点名称" prop="nodeName">
        <el-input v-model="queryParams.nodeName" placeholder="请输入节点名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="面试官ID" prop="interviewerId">
        <el-input v-model="queryParams.interviewerId" placeholder="请输入面试官ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="面试官姓名" prop="interviewerName">
        <el-input v-model="queryParams.interviewerName" placeholder="请输入面试官姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="计划时长" prop="scheduledDuration">
        <el-input v-model="queryParams.scheduledDuration" placeholder="请输入计划时长" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="实际时长" prop="actualDuration">
        <el-input v-model="queryParams.actualDuration" placeholder="请输入实际时长" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker clearable v-model="queryParams.startTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker clearable v-model="queryParams.endTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="节点结果：PASS通过,FAIL未通过,PENDING待定" prop="nodeResult">
        <el-input v-model="queryParams.nodeResult" placeholder="请输入节点结果：PASS通过,FAIL未通过,PENDING待定" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="综合评分(1-5)" prop="overallScore">
        <el-input v-model="queryParams.overallScore" placeholder="请输入综合评分(1-5)" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="推荐结果：HIRE推荐,NO_HIRE不推荐,PENDING待定" prop="recommendation">
        <el-input v-model="queryParams.recommendation" placeholder="请输入推荐结果：HIRE推荐,NO_HIRE不推荐,PENDING待定" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="反馈提交时间" prop="feedbackSubmittedTime">
        <el-date-picker clearable v-model="queryParams.feedbackSubmittedTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择反馈提交时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="创建部门" prop="createDept">
        <el-input v-model="queryParams.createDept" placeholder="请输入创建部门" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['interview:detail:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['interview:detail:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['interview:detail:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['interview:detail:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="节点详情ID" align="center" prop="id" />
      <el-table-column label="面试记录ID" align="center" prop="interviewId" />
      <el-table-column label="节点顺序" align="center" prop="nodeOrder" />
      <el-table-column label="节点名称" align="center" prop="nodeName" />
      <el-table-column label="节点类型：PHONE电话沟通,TECHNICAL技术面试,HR人事面试,MANAGER管理面试,FINAL终面" align="center" prop="nodeType" />
      <el-table-column label="节点描述" align="center" prop="nodeDescription" />
      <el-table-column label="面试官ID" align="center" prop="interviewerId" />
      <el-table-column label="面试官姓名" align="center" prop="interviewerName" />
      <el-table-column label="计划时长" align="center" prop="scheduledDuration" />
      <el-table-column label="实际时长" align="center" prop="actualDuration" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="节点状态：PENDING待进行,IN_PROGRESS进行中,COMPLETED已完成,CANCELLED已取消" align="center"
        prop="nodeStatus" />
      <el-table-column label="节点结果：PASS通过,FAIL未通过,PENDING待定" align="center" prop="nodeResult" />
      <el-table-column label="综合评分(1-5)" align="center" prop="overallScore" />
      <el-table-column label="面试反馈和评价" align="center" prop="feedback" />
      <el-table-column label="优点总结" align="center" prop="strengths" />
      <el-table-column label="不足之处" align="center" prop="weaknesses" />
      <el-table-column label="推荐结果：HIRE推荐,NO_HIRE不推荐,PENDING待定" align="center" prop="recommendation" />
      <el-table-column label="反馈提交时间" align="center" prop="feedbackSubmittedTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.feedbackSubmittedTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建部门" align="center" prop="createDept" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['interview:detail:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['interview:detail:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改面试节点详情对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="detailRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="面试记录ID" prop="interviewId">
          <el-input v-model="form.interviewId" placeholder="请输入面试记录ID" />
        </el-form-item>
        <el-form-item label="节点顺序" prop="nodeOrder">
          <el-input v-model="form.nodeOrder" placeholder="请输入节点顺序" />
        </el-form-item>
        <el-form-item label="节点名称" prop="nodeName">
          <el-input v-model="form.nodeName" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="节点描述" prop="nodeDescription">
          <el-input v-model="form.nodeDescription" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="面试官ID" prop="interviewerId">
          <el-input v-model="form.interviewerId" placeholder="请输入面试官ID" />
        </el-form-item>
        <el-form-item label="面试官姓名" prop="interviewerName">
          <el-input v-model="form.interviewerName" placeholder="请输入面试官姓名" />
        </el-form-item>
        <el-form-item label="计划时长" prop="scheduledDuration">
          <el-input v-model="form.scheduledDuration" placeholder="请输入计划时长" />
        </el-form-item>
        <el-form-item label="实际时长" prop="actualDuration">
          <el-input v-model="form.actualDuration" placeholder="请输入实际时长" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable v-model="form.startTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable v-model="form.endTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="节点结果：PASS通过,FAIL未通过,PENDING待定" prop="nodeResult">
          <el-input v-model="form.nodeResult" placeholder="请输入节点结果：PASS通过,FAIL未通过,PENDING待定" />
        </el-form-item>
        <el-form-item label="综合评分(1-5)" prop="overallScore">
          <el-input v-model="form.overallScore" placeholder="请输入综合评分(1-5)" />
        </el-form-item>
        <el-form-item label="面试反馈和评价" prop="feedback">
          <el-input v-model="form.feedback" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="优点总结" prop="strengths">
          <el-input v-model="form.strengths" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="不足之处" prop="weaknesses">
          <el-input v-model="form.weaknesses" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="推荐结果：HIRE推荐,NO_HIRE不推荐,PENDING待定" prop="recommendation">
          <el-input v-model="form.recommendation" placeholder="请输入推荐结果：HIRE推荐,NO_HIRE不推荐,PENDING待定" />
        </el-form-item>
        <el-form-item label="反馈提交时间" prop="feedbackSubmittedTime">
          <el-date-picker clearable v-model="form.feedbackSubmittedTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择反馈提交时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="创建部门" prop="createDept">
          <el-input v-model="form.createDept" placeholder="请输入创建部门" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Detail">
import { listDetail, getDetail, delDetail, addDetail, updateDetail } from "@/api/interview/detail"

const { proxy } = getCurrentInstance()

const detailList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    interviewId: null,
    nodeOrder: null,
    nodeName: null,
    nodeType: null,
    nodeDescription: null,
    interviewerId: null,
    interviewerName: null,
    scheduledDuration: null,
    actualDuration: null,
    startTime: null,
    endTime: null,
    nodeStatus: null,
    nodeResult: null,
    overallScore: null,
    feedback: null,
    strengths: null,
    weaknesses: null,
    recommendation: null,
    feedbackSubmittedTime: null,
    createDept: null,
  },
  rules: {
    interviewId: [
      { required: true, message: "面试记录ID不能为空", trigger: "blur" }
    ],
    nodeOrder: [
      { required: true, message: "节点顺序不能为空", trigger: "blur" }
    ],
    nodeName: [
      { required: true, message: "节点名称不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询面试节点详情列表 */
function getList() {
  loading.value = true
  listDetail(queryParams.value).then(response => {
    detailList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    interviewId: null,
    nodeOrder: null,
    nodeName: null,
    nodeType: null,
    nodeDescription: null,
    interviewerId: null,
    interviewerName: null,
    scheduledDuration: null,
    actualDuration: null,
    startTime: null,
    endTime: null,
    nodeStatus: null,
    nodeResult: null,
    overallScore: null,
    feedback: null,
    strengths: null,
    weaknesses: null,
    recommendation: null,
    feedbackSubmittedTime: null,
    createDept: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("detailRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加面试节点详情"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getDetail(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改面试节点详情"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["detailRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除面试节点详情编号为"' + _ids + '"的数据项？').then(function () {
    return delDetail(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('interview/detail/export', {
    ...queryParams.value
  }, `detail_${new Date().getTime()}.xlsx`)
}

getList()
</script>
