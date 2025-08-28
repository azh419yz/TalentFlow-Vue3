<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="岗位名称" prop="positionTitle">
        <el-input v-model="queryParams.positionTitle" placeholder="请输入岗位标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="企业名称" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="薪资下限" prop="salaryMin">
        <el-input v-model="queryParams.salaryMin" placeholder="请输入薪资下限" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="薪资上限" prop="salaryMax">
        <el-input v-model="queryParams.salaryMax" placeholder="请输入薪资上限" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="工作地点" prop="workLocation">
        <el-input v-model="queryParams.workLocation" placeholder="请输入工作地点" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="学历要求" prop="educationRequired">
        <el-input v-model="queryParams.educationRequired" placeholder="请输入学历要求" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgencyLevel">
        <el-input v-model="queryParams.urgencyLevel" placeholder="请输入紧急程度" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['position:info:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['position:info:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['position:info:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['position:info:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" />
      <el-table-column label="岗位编码" align="center" prop="positionCode" />
      <el-table-column label="岗位名称" align="center" prop="positionTitle" />
      <el-table-column label="企业名称" align="center" prop="companyName" />
      <el-table-column label="岗位描述" align="center" prop="positionDescription" />
      <el-table-column label="工作职责" align="center" prop="responsibilities" />
      <el-table-column label="任职要求" align="center" prop="requirements" />
      <el-table-column label="工作地点" align="center" prop="workLocation" />
      <el-table-column label="工作类型" align="center" prop="workType" />
      <el-table-column label="学历要求" align="center" prop="educationRequired" />
      <el-table-column label="技能要求" align="center" prop="skillsRequired" />
      <el-table-column label="行业标签" align="center" prop="industryTags" />
      <el-table-column label="职位标签" align="center" prop="positionTags" />
      <el-table-column label="招聘人数" align="center" prop="recruitNum" />
      <el-table-column label="紧急程度" align="center" prop="urgencyLevel" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.publishTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="截止时间" align="center" prop="deadlineTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deadlineTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关闭原因" align="center" prop="closeReason" />
      <el-table-column label="浏览次数" align="center" prop="viewCount" />
      <el-table-column label="申请次数" align="center" prop="applyCount" />
      <el-table-column label="面试次数" align="center" prop="interviewCount" />
      <el-table-column label="录用次数" align="center" prop="hireCount" />
      <el-table-column label="联系人" align="center" prop="contactPerson" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" />
      <el-table-column label="联系邮箱" align="center" prop="contactEmail" />
      <el-table-column label="创建部门" align="center" prop="createDept" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['position:info:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['position:info:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改岗位基础信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="infoRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="positionCode">
          <el-input v-model="form.positionCode" placeholder="请输入岗位编码" />
        </el-form-item>
        <el-form-item label="岗位标题" prop="positionTitle">
          <el-input v-model="form.positionTitle" placeholder="请输入岗位标题" />
        </el-form-item>
        <el-form-item label="企业ID" prop="companyId">
          <el-input v-model="form.companyId" placeholder="请输入企业ID" />
        </el-form-item>
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="岗位描述" prop="positionDescription">
          <el-input v-model="form.positionDescription" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="工作职责" prop="responsibilities">
          <el-input v-model="form.responsibilities" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="任职要求" prop="requirements">
          <el-input v-model="form.requirements" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="薪资下限" prop="salaryMin">
          <el-input v-model="form.salaryMin" placeholder="请输入薪资下限" />
        </el-form-item>
        <el-form-item label="薪资上限" prop="salaryMax">
          <el-input v-model="form.salaryMax" placeholder="请输入薪资上限" />
        </el-form-item>
        <el-form-item label="薪资单位：MONTH月薪,YEAR年薪,DAY日薪" prop="salaryUnit">
          <el-input v-model="form.salaryUnit" placeholder="请输入薪资单位：MONTH月薪,YEAR年薪,DAY日薪" />
        </el-form-item>
        <el-form-item label="福利待遇" prop="benefits">
          <el-input v-model="form.benefits" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="工作地点" prop="workLocation">
          <el-input v-model="form.workLocation" placeholder="请输入工作地点" />
        </el-form-item>
        <el-form-item label="工作经验要求" prop="workExperience">
          <el-input v-model="form.workExperience" placeholder="请输入工作经验要求" />
        </el-form-item>
        <el-form-item label="学历要求" prop="educationRequired">
          <el-input v-model="form.educationRequired" placeholder="请输入学历要求" />
        </el-form-item>
        <el-form-item label="招聘人数" prop="recruitNum">
          <el-input v-model="form.recruitNum" placeholder="请输入招聘人数" />
        </el-form-item>
        <el-form-item label="紧急程度：URGENT紧急,HIGH高,NORMAL普通,LOW低" prop="urgencyLevel">
          <el-input v-model="form.urgencyLevel" placeholder="请输入紧急程度：URGENT紧急,HIGH高,NORMAL普通,LOW低" />
        </el-form-item>
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker clearable v-model="form.publishTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择发布时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadlineTime">
          <el-date-picker clearable v-model="form.deadlineTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择截止时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="关闭原因" prop="closeReason">
          <el-input v-model="form.closeReason" placeholder="请输入关闭原因" />
        </el-form-item>
        <el-form-item label="浏览次数" prop="viewCount">
          <el-input v-model="form.viewCount" placeholder="请输入浏览次数" />
        </el-form-item>
        <el-form-item label="申请次数" prop="applyCount">
          <el-input v-model="form.applyCount" placeholder="请输入申请次数" />
        </el-form-item>
        <el-form-item label="面试次数" prop="interviewCount">
          <el-input v-model="form.interviewCount" placeholder="请输入面试次数" />
        </el-form-item>
        <el-form-item label="录用次数" prop="hireCount">
          <el-input v-model="form.hireCount" placeholder="请输入录用次数" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="创建部门" prop="createDept">
          <el-input v-model="form.createDept" placeholder="请输入创建部门" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">岗位要求详情信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddSysPositionRequirement">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteSysPositionRequirement">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="sysPositionRequirementList" :row-class-name="rowSysPositionRequirementIndex"
          @selection-change="handleSysPositionRequirementSelectionChange" ref="sysPositionRequirement">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="最小年龄" prop="ageMin" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.ageMin" placeholder="请输入最小年龄" />
            </template>
          </el-table-column>
          <el-table-column label="最大年龄" prop="ageMax" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.ageMax" placeholder="请输入最大年龄" />
            </template>
          </el-table-column>
          <el-table-column label="性别要求：MALE男,FEMALE女,UNLIMITED不限" prop="genderRequirement" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.genderRequirement" placeholder="请输入性别要求：MALE男,FEMALE女,UNLIMITED不限" />
            </template>
          </el-table-column>
          <el-table-column label="出差要求：NONE无,OCCASIONAL偶尔,FREQUENT频繁,EXTENSIVE大量" prop="travelRequirement" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.travelRequirement"
                placeholder="请输入出差要求：NONE无,OCCASIONAL偶尔,FREQUENT频繁,EXTENSIVE大量" />
            </template>
          </el-table-column>
          <el-table-column label="是否接受加班：1是,0否" prop="overtimeAcceptable" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.overtimeAcceptable" placeholder="请输入是否接受加班：1是,0否" />
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

<script setup name="Info">
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/position/info"

const { proxy } = getCurrentInstance()

const infoList = ref([])
const sysPositionRequirementList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedSysPositionRequirement = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: null,
    positionCode: null,
    positionTitle: null,
    companyId: null,
    companyName: null,
    positionDescription: null,
    responsibilities: null,
    requirements: null,
    salaryMin: null,
    salaryMax: null,
    salaryUnit: null,
    benefits: null,
    workLocation: null,
    workType: null,
    workExperience: null,
    educationRequired: null,
    skillsRequired: null,
    industryTags: null,
    positionTags: null,
    recruitNum: null,
    urgencyLevel: null,
    status: null,
    publishTime: null,
    deadlineTime: null,
    closeReason: null,
    viewCount: null,
    applyCount: null,
    interviewCount: null,
    hireCount: null,
    contactPerson: null,
    contactPhone: null,
    contactEmail: null,
    createDept: null,
  },
  rules: {
    tenantId: [
      { required: true, message: "租户ID不能为空", trigger: "blur" }
    ],
    positionTitle: [
      { required: true, message: "岗位标题不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询岗位基础信息列表 */
function getList() {
  loading.value = true
  listInfo(queryParams.value).then(response => {
    infoList.value = response.rows
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
    tenantId: null,
    positionCode: null,
    positionTitle: null,
    companyId: null,
    companyName: null,
    positionDescription: null,
    responsibilities: null,
    requirements: null,
    salaryMin: null,
    salaryMax: null,
    salaryUnit: null,
    benefits: null,
    workLocation: null,
    workType: null,
    workExperience: null,
    educationRequired: null,
    skillsRequired: null,
    industryTags: null,
    positionTags: null,
    recruitNum: null,
    urgencyLevel: null,
    status: null,
    publishTime: null,
    deadlineTime: null,
    closeReason: null,
    viewCount: null,
    applyCount: null,
    interviewCount: null,
    hireCount: null,
    contactPerson: null,
    contactPhone: null,
    contactEmail: null,
    createDept: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  sysPositionRequirementList.value = []
  proxy.resetForm("infoRef")
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
  title.value = "添加岗位基础信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getInfo(_id).then(response => {
    form.value = response.data
    sysPositionRequirementList.value = response.data.sysPositionRequirementList
    open.value = true
    title.value = "修改岗位基础信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["infoRef"].validate(valid => {
    if (valid) {
      form.value.sysPositionRequirementList = sysPositionRequirementList.value
      if (form.value.id != null) {
        updateInfo(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addInfo(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除岗位基础信息编号为"' + _ids + '"的数据项？').then(function () {
    return delInfo(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 岗位要求详情序号 */
function rowSysPositionRequirementIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

/** 岗位要求详情添加按钮操作 */
function handleAddSysPositionRequirement() {
  let obj = {}
  obj.ageMin = ""
  obj.ageMax = ""
  obj.genderRequirement = ""
  obj.languageRequirements = ""
  obj.certificateRequirements = ""
  obj.travelRequirement = ""
  obj.overtimeAcceptable = ""
  obj.preferredExperience = ""
  obj.preferredSkills = ""
  obj.preferredBackground = ""
  sysPositionRequirementList.value.push(obj)
}

/** 岗位要求详情删除按钮操作 */
function handleDeleteSysPositionRequirement() {
  if (checkedSysPositionRequirement.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的岗位要求详情数据")
  } else {
    const sysPositionRequirements = sysPositionRequirementList.value
    const checkedSysPositionRequirements = checkedSysPositionRequirement.value
    sysPositionRequirementList.value = sysPositionRequirements.filter(function (item) {
      return checkedSysPositionRequirements.indexOf(item.index) == -1
    })
  }
}

/** 复选框选中数据 */
function handleSysPositionRequirementSelectionChange(selection) {
  checkedSysPositionRequirement.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('position/info/export', {
    ...queryParams.value
  }, `info_${new Date().getTime()}.xlsx`)
}

getList()
</script>
