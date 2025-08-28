<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="岗位ID" prop="positionId">
        <el-input v-model="queryParams.positionId" placeholder="请输入岗位ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="最小年龄" prop="ageMin">
        <el-input v-model="queryParams.ageMin" placeholder="请输入最小年龄" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="最大年龄" prop="ageMax">
        <el-input v-model="queryParams.ageMax" placeholder="请输入最大年龄" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="性别要求：MALE男,FEMALE女,UNLIMITED不限" prop="genderRequirement">
        <el-input v-model="queryParams.genderRequirement" placeholder="请输入性别要求：MALE男,FEMALE女,UNLIMITED不限" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="出差要求：NONE无,OCCASIONAL偶尔,FREQUENT频繁,EXTENSIVE大量" prop="travelRequirement">
        <el-input v-model="queryParams.travelRequirement"
          placeholder="请输入出差要求：NONE无,OCCASIONAL偶尔,FREQUENT频繁,EXTENSIVE大量" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="是否接受加班：1是,0否" prop="overtimeAcceptable">
        <el-input v-model="queryParams.overtimeAcceptable" placeholder="请输入是否接受加班：1是,0否" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['position:requirement:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['position:requirement:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['position:requirement:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['position:requirement:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="requirementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="要求ID" align="center" prop="id" />
      <el-table-column label="岗位ID" align="center" prop="positionId" />
      <el-table-column label="最小年龄" align="center" prop="ageMin" />
      <el-table-column label="最大年龄" align="center" prop="ageMax" />
      <el-table-column label="性别要求：MALE男,FEMALE女,UNLIMITED不限" align="center" prop="genderRequirement" />
      <el-table-column label="语言要求" align="center" prop="languageRequirements" />
      <el-table-column label="证书要求" align="center" prop="certificateRequirements" />
      <el-table-column label="出差要求：NONE无,OCCASIONAL偶尔,FREQUENT频繁,EXTENSIVE大量" align="center" prop="travelRequirement" />
      <el-table-column label="是否接受加班：1是,0否" align="center" prop="overtimeAcceptable" />
      <el-table-column label="优先经验" align="center" prop="preferredExperience" />
      <el-table-column label="优先技能" align="center" prop="preferredSkills" />
      <el-table-column label="优先背景" align="center" prop="preferredBackground" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['position:requirement:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['position:requirement:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改岗位要求详情对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="requirementRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="岗位ID" prop="positionId">
          <el-input v-model="form.positionId" placeholder="请输入岗位ID" />
        </el-form-item>
        <el-form-item label="最小年龄" prop="ageMin">
          <el-input v-model="form.ageMin" placeholder="请输入最小年龄" />
        </el-form-item>
        <el-form-item label="最大年龄" prop="ageMax">
          <el-input v-model="form.ageMax" placeholder="请输入最大年龄" />
        </el-form-item>
        <el-form-item label="性别要求：MALE男,FEMALE女,UNLIMITED不限" prop="genderRequirement">
          <el-input v-model="form.genderRequirement" placeholder="请输入性别要求：MALE男,FEMALE女,UNLIMITED不限" />
        </el-form-item>
        <el-form-item label="出差要求：NONE无,OCCASIONAL偶尔,FREQUENT频繁,EXTENSIVE大量" prop="travelRequirement">
          <el-input v-model="form.travelRequirement" placeholder="请输入出差要求：NONE无,OCCASIONAL偶尔,FREQUENT频繁,EXTENSIVE大量" />
        </el-form-item>
        <el-form-item label="是否接受加班：1是,0否" prop="overtimeAcceptable">
          <el-input v-model="form.overtimeAcceptable" placeholder="请输入是否接受加班：1是,0否" />
        </el-form-item>
        <el-form-item label="优先经验" prop="preferredExperience">
          <el-input v-model="form.preferredExperience" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="优先技能" prop="preferredSkills">
          <el-input v-model="form.preferredSkills" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="优先背景" prop="preferredBackground">
          <el-input v-model="form.preferredBackground" type="textarea" placeholder="请输入内容" />
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

<script setup name="Requirement">
import { listRequirement, getRequirement, delRequirement, addRequirement, updateRequirement } from "@/api/position/requirement"

const { proxy } = getCurrentInstance()

const requirementList = ref([])
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
    positionId: null,
    ageMin: null,
    ageMax: null,
    genderRequirement: null,
    languageRequirements: null,
    certificateRequirements: null,
    travelRequirement: null,
    overtimeAcceptable: null,
    preferredExperience: null,
    preferredSkills: null,
    preferredBackground: null,
  },
  rules: {
    positionId: [
      { required: true, message: "岗位ID不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询岗位要求详情列表 */
function getList() {
  loading.value = true
  listRequirement(queryParams.value).then(response => {
    requirementList.value = response.rows
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
    positionId: null,
    ageMin: null,
    ageMax: null,
    genderRequirement: null,
    languageRequirements: null,
    certificateRequirements: null,
    travelRequirement: null,
    overtimeAcceptable: null,
    preferredExperience: null,
    preferredSkills: null,
    preferredBackground: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("requirementRef")
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
  title.value = "添加岗位要求详情"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getRequirement(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改岗位要求详情"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["requirementRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRequirement(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRequirement(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除岗位要求详情编号为"' + _ids + '"的数据项？').then(function () {
    return delRequirement(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('position/requirement/export', {
    ...queryParams.value
  }, `requirement_${new Date().getTime()}.xlsx`)
}

getList()
</script>
