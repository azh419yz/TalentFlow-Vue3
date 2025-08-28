<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="面试标题" prop="interviewTitle">
        <el-input v-model="queryParams.interviewTitle" placeholder="请输入面试标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="面试方式" prop="interviewMode">
        <el-input v-model="queryParams.interviewMode" placeholder="请输入面试方式" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="当前阶段" prop="currentStage">
        <el-input v-model="queryParams.currentStage" placeholder="请输入当前阶段" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="整体结果" prop="overallResult">
        <el-input v-model="queryParams.overallResult" placeholder="请输入整体结果" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="最终决策" prop="finalDecision">
        <el-input v-model="queryParams.finalDecision" placeholder="请输入最终决策" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['interview:record:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['interview:record:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['interview:record:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['interview:record:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" />
      <el-table-column label="候选人" align="center" prop="candidateId" />
      <el-table-column label="岗位" align="center" prop="positionId" />
      <el-table-column label="申请记录ID" align="center" prop="applicationId" />
      <el-table-column label="面试标题" align="center" prop="interviewTitle" />
      <el-table-column label="计划开始时间" align="center" prop="scheduledStartTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.scheduledStartTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划结束时间" align="center" prop="scheduledEndTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.scheduledEndTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际开始时间" align="center" prop="actualStartTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actualStartTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际结束时间" align="center" prop="actualEndTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actualEndTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="面试方式" align="center" prop="interviewMode" />
      <el-table-column label="当前阶段" align="center" prop="currentStage" />
      <el-table-column label="整体状态" align="center" prop="overallStatus" />
      <el-table-column label="整体结果" align="center" prop="overallResult" />
      <el-table-column label="最终决策" align="center" prop="finalDecision" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['interview:record:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['interview:record:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改面试记录主对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="recordRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="候选人ID" prop="candidateId">
          <el-input v-model="form.candidateId" placeholder="请输入候选人ID" />
        </el-form-item>
        <el-form-item label="岗位ID" prop="positionId">
          <el-input v-model="form.positionId" placeholder="请输入岗位ID" />
        </el-form-item>
        <el-form-item label="申请记录ID" prop="applicationId">
          <el-input v-model="form.applicationId" placeholder="请输入申请记录ID" />
        </el-form-item>
        <el-form-item label="面试编号" prop="interviewCode">
          <el-input v-model="form.interviewCode" placeholder="请输入面试编号" />
        </el-form-item>
        <el-form-item label="面试标题" prop="interviewTitle">
          <el-input v-model="form.interviewTitle" placeholder="请输入面试标题" />
        </el-form-item>
        <el-form-item label="计划开始时间" prop="scheduledStartTime">
          <el-date-picker clearable v-model="form.scheduledStartTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择计划开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划结束时间" prop="scheduledEndTime">
          <el-date-picker clearable v-model="form.scheduledEndTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择计划结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际开始时间" prop="actualStartTime">
          <el-date-picker clearable v-model="form.actualStartTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择实际开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际结束时间" prop="actualEndTime">
          <el-date-picker clearable v-model="form.actualEndTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择实际结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="面试方式：ONSITE现场,ONLINE线上,PHONE电话" prop="interviewMode">
          <el-input v-model="form.interviewMode" placeholder="请输入面试方式：ONSITE现场,ONLINE线上,PHONE电话" />
        </el-form-item>
        <el-form-item label="面试地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入面试地点" />
        </el-form-item>
        <el-form-item label="在线会议链接" prop="onlineMeetingUrl">
          <el-input v-model="form.onlineMeetingUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="当前阶段" prop="currentStage">
          <el-input v-model="form.currentStage" placeholder="请输入当前阶段" />
        </el-form-item>
        <el-form-item label="整体结果：PASS通过,FAIL未通过,PENDING待定,CANCELLED取消" prop="overallResult">
          <el-input v-model="form.overallResult" placeholder="请输入整体结果：PASS通过,FAIL未通过,PENDING待定,CANCELLED取消" />
        </el-form-item>
        <el-form-item label="最终决策：HIRE录用,REJECT拒绝,HOLD保留" prop="finalDecision">
          <el-input v-model="form.finalDecision" placeholder="请输入最终决策：HIRE录用,REJECT拒绝,HOLD保留" />
        </el-form-item>
        <el-form-item label="决策理由" prop="decisionReason">
          <el-input v-model="form.decisionReason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="创建部门" prop="createDept">
          <el-input v-model="form.createDept" placeholder="请输入创建部门" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">面试节点详情信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddSysInterviewNodeDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteSysInterviewNodeDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="sysInterviewNodeDetailList" :row-class-name="rowSysInterviewNodeDetailIndex"
          @selection-change="handleSysInterviewNodeDetailSelectionChange" ref="sysInterviewNodeDetail">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="节点顺序" prop="nodeOrder" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.nodeOrder" placeholder="请输入节点顺序" />
            </template>
          </el-table-column>
          <el-table-column label="节点名称" prop="nodeName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.nodeName" placeholder="请输入节点名称" />
            </template>
          </el-table-column>
          <el-table-column label="节点类型：PHONE电话沟通,TECHNICAL技术面试,HR人事面试,MANAGER管理面试,FINAL终面" prop="nodeType" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.nodeType"
                placeholder="请选择节点类型：PHONE电话沟通,TECHNICAL技术面试,HR人事面试,MANAGER管理面试,FINAL终面">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="面试官ID" prop="interviewerId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.interviewerId" placeholder="请输入面试官ID" />
            </template>
          </el-table-column>
          <el-table-column label="面试官姓名" prop="interviewerName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.interviewerName" placeholder="请输入面试官姓名" />
            </template>
          </el-table-column>
          <el-table-column label="计划时长" prop="scheduledDuration" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.scheduledDuration" placeholder="请输入计划时长" />
            </template>
          </el-table-column>
          <el-table-column label="实际时长" prop="actualDuration" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.actualDuration" placeholder="请输入实际时长" />
            </template>
          </el-table-column>
          <el-table-column label="开始时间" prop="startTime" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.startTime" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择开始时间">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="结束时间" prop="endTime" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.endTime" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择结束时间">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="节点状态：PENDING待进行,IN_PROGRESS进行中,COMPLETED已完成,CANCELLED已取消" prop="nodeStatus"
            width="150">
            <template #default="scope">
              <el-select v-model="scope.row.nodeStatus"
                placeholder="请选择节点状态：PENDING待进行,IN_PROGRESS进行中,COMPLETED已完成,CANCELLED已取消">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="节点结果：PASS通过,FAIL未通过,PENDING待定" prop="nodeResult" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.nodeResult" placeholder="请输入节点结果：PASS通过,FAIL未通过,PENDING待定" />
            </template>
          </el-table-column>
          <el-table-column label="综合评分(1-5)" prop="overallScore" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.overallScore" placeholder="请输入综合评分(1-5)" />
            </template>
          </el-table-column>
          <el-table-column label="推荐结果：HIRE推荐,NO_HIRE不推荐,PENDING待定" prop="recommendation" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.recommendation" placeholder="请输入推荐结果：HIRE推荐,NO_HIRE不推荐,PENDING待定" />
            </template>
          </el-table-column>
          <el-table-column label="反馈提交时间" prop="feedbackSubmittedTime" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.feedbackSubmittedTime" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择反馈提交时间">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="创建部门" prop="createDept" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.createDept" placeholder="请输入创建部门" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="Record">
import { listRecord, getRecord, delRecord, addRecord, updateRecord } from "@/api/interview/record"

const { proxy } = getCurrentInstance()

const recordList = ref([])
const sysInterviewNodeDetailList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedSysInterviewNodeDetail = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    candidateId: null,
    positionId: null,
    applicationId: null,
    interviewCode: null,
    interviewTitle: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    actualStartTime: null,
    actualEndTime: null,
    interviewMode: null,
    location: null,
    onlineMeetingUrl: null,
    currentStage: null,
    overallStatus: null,
    overallResult: null,
    finalDecision: null,
    decisionReason: null,
    createDept: null,
  },
  rules: {
    candidateId: [
      { required: true, message: "候选人ID不能为空", trigger: "blur" }
    ],
    positionId: [
      { required: true, message: "岗位ID不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询面试记录主列表 */
function getList() {
  loading.value = true
  listRecord(queryParams.value).then(response => {
    recordList.value = response.rows
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
    candidateId: null,
    positionId: null,
    applicationId: null,
    interviewCode: null,
    interviewTitle: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    actualStartTime: null,
    actualEndTime: null,
    interviewMode: null,
    location: null,
    onlineMeetingUrl: null,
    currentStage: null,
    overallStatus: null,
    overallResult: null,
    finalDecision: null,
    decisionReason: null,
    createDept: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  sysInterviewNodeDetailList.value = []
  proxy.resetForm("recordRef")
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
  title.value = "添加面试记录主"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getRecord(_id).then(response => {
    form.value = response.data
    sysInterviewNodeDetailList.value = response.data.sysInterviewNodeDetailList
    open.value = true
    title.value = "修改面试记录主"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordRef"].validate(valid => {
    if (valid) {
      form.value.sysInterviewNodeDetailList = sysInterviewNodeDetailList.value
      if (form.value.id != null) {
        updateRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRecord(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除面试记录主编号为"' + _ids + '"的数据项？').then(function () {
    return delRecord(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 面试节点详情序号 */
function rowSysInterviewNodeDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

/** 面试节点详情添加按钮操作 */
function handleAddSysInterviewNodeDetail() {
  let obj = {}
  obj.nodeOrder = ""
  obj.nodeName = ""
  obj.nodeType = ""
  obj.nodeDescription = ""
  obj.interviewerId = ""
  obj.interviewerName = ""
  obj.scheduledDuration = ""
  obj.actualDuration = ""
  obj.startTime = ""
  obj.endTime = ""
  obj.nodeStatus = ""
  obj.nodeResult = ""
  obj.overallScore = ""
  obj.feedback = ""
  obj.strengths = ""
  obj.weaknesses = ""
  obj.recommendation = ""
  obj.feedbackSubmittedTime = ""
  obj.createDept = ""
  obj.remark = ""
  sysInterviewNodeDetailList.value.push(obj)
}

/** 面试节点详情删除按钮操作 */
function handleDeleteSysInterviewNodeDetail() {
  if (checkedSysInterviewNodeDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的面试节点详情数据")
  } else {
    const sysInterviewNodeDetails = sysInterviewNodeDetailList.value
    const checkedSysInterviewNodeDetails = checkedSysInterviewNodeDetail.value
    sysInterviewNodeDetailList.value = sysInterviewNodeDetails.filter(function (item) {
      return checkedSysInterviewNodeDetails.indexOf(item.index) == -1
    })
  }
}

/** 复选框选中数据 */
function handleSysInterviewNodeDetailSelectionChange(selection) {
  checkedSysInterviewNodeDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('interview/record/export', {
    ...queryParams.value
  }, `record_${new Date().getTime()}.xlsx`)
}

getList()
</script>
