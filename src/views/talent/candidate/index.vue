<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item label="候选人" prop="name">
        <el-input v-model="queryParams.name" placeholder="输入候选人姓名" style="width: 120px" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号码" style="width: 130px" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="queryParams.email" placeholder="请输入用户邮箱" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="学历" prop="highestEdu">
        <el-select v-model="queryParams.highestEdu" placeholder="请选择学历" clearable style="width: 100px">
          <el-option v-for="dict in education" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="期望年薪" prop="expectedSalary">
        <el-input-number v-model="queryParams.params.expectedSalaryStart" :min="0" :precision="0" style="width: 100px"
          @change="handleSalaryStartChange" />
        <el-text class="mx-1" type="warning"> ～ </el-text>
        <el-input-number v-model="queryParams.params.expectedSalaryEnd" :min="0" :precision="0" style="width: 100px"
          @change="handleSalaryEndChange" />
        <el-text class="mx-1" type="warning">（万元 / 年）</el-text>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Upload" :disabled="single" @click="handleUpdate">简历解析</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="candidateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="候选人姓名" width="100" align="center" prop="name" />
      <el-table-column label="手机号码" align="center" prop="phoneNumber" />
      <!-- <el-table-column label="用户邮箱" align="center" prop="email" /> -->
      <el-table-column label="学历" align="center" prop="highestEdu">
        <template #default="scope">
          <el-tag><dict-tag :options="education" :value="scope.row.highestEdu" /></el-tag>
        </template>
      </el-table-column>
      <el-table-column label="期望年薪" align="center" prop="expectedSalary">
        <template #default="scope">
          <el-text class="mx-1" type="warning">{{ scope.row.expectedSalary }} 万元 </el-text>
        </template>
      </el-table-column>
      <el-table-column label="行业" align="center">
        <template #default="scope">
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            <el-tag v-for="(item, index) in scope.row.industryList" :key="index" type="primary">
              {{ item }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="职位" align="center">
        <template #default="scope">
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            <el-tag v-for="(item, index) in scope.row.postList" :key="index" type="primary">
              {{ item }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="专业技能" align="center" prop="skillTags" />
      <el-table-column label="更新时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Upload" @click="handleUpload(scope.row)">简历</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改人才库对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="candidateRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="候选人姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入候选人姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入用户邮箱" />
        </el-form-item>
        <el-form-item label="最高学历" prop="highestEdu">
          <el-select v-model="form.highestEdu" placeholder="请选择最高学历">
            <el-option v-for="dict in education" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="期望年薪" prop="expectedSalary">
          <el-input-number v-model="form.expectedSalary" :min="1" :max="9999" :precision="0" />
          <el-text class="mx-1" type="warning">（万元 / 年）</el-text>
        </el-form-item>
        <el-form-item label="行业" prop="industry">
          <el-row :gutter="10" align="middle">
            <el-col :span="18">
              <el-input-tag v-model="form.industryList" :tag-props="{ type: 'primary' }" placeholder="请输入内容" />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="openIndustryDialog" :icon="Search" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="职位" prop="post">
          <el-row :gutter="10" align="middle">
            <el-col :span="18">
              <el-input-tag v-model="form.postList" :tag-props="{ type: 'primary' }" placeholder="请输入内容" />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="openPostDialog" :icon="Search" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="专业技能" prop="skillTags">
          <el-input v-model="form.skillTags" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="简历" prop="resumeUrl">
          <el-input v-model="form.resumeUrl" placeholder="请输入简历文件地址" />
        </el-form-item>
        <el-form-item label="部门ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入部门ID" />
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
    <!-- 上传简历对话框 -->
    <el-dialog :title="title" v-model="resumeOpen" width="800px" :before-close="resumeDialogClose" append-to-body>
      <FileUpload ref="fileUpload" v-model="fileList" :limit="1" :data="{ storageType: fileStorage }"
        :isShowTip="true" />

      <!-- 文件预览区域 -->
      <div v-if="fileList.length > 0" class="file-preview-container">
        <el-divider content-position="left">文件预览</el-divider>
        <div class="file-preview-item">
          <div class="file-info">
            <el-icon class="file-icon">
              <Document />
            </el-icon>
            <div class="file-details">
              <div class="file-name">{{ getFileName(fileList[0].name) }}</div>
            </div>
          </div>
          <div class="file-actions">
            <el-button type="primary" link @click="handlePreviewFile(fileList[0])">
              <el-icon>
                <View />
              </el-icon>
              预览
            </el-button>
            <el-button type="primary" link @click="handleDownloadFile(fileList[0])">
              <el-icon>
                <Download />
              </el-icon>
              下载
            </el-button>
          </div>
        </div>

        <!-- iframe预览区域 -->
        <div v-if="previewUrl" class="iframe-preview-container">
          <el-divider content-position="left">在线预览</el-divider>
          <div class="iframe-wrapper">
            <iframe :src="previewUrl" width="100%" height="500px" frameborder="0" class="preview-iframe">
            </iframe>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="updateResume">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 职位选择弹窗组件 -->
    <PostSelect ref="postDialog" :max-selection="3" :post-data="postData" @confirm="handlePostConfirm" />
    <!-- 使用行业选择组件 -->
    <IndustrySelect ref="industryDialog" :max-selection="3" :industry-data="industryData"
      @confirm="handleIndustryConfirm" />

  </div>
</template>

<script setup name="Candidate">
import PostSelect from '@/components/PostSelect'
import IndustrySelect from '@/components/IndustrySelect'
import FileUpload from '@/components/FileUpload'

import { Search, Document, View, Download } from '@element-plus/icons-vue'
import { listCandidate, getCandidate, delCandidate, addCandidate, updateCandidate, updateCandidateResume } from "@/api/system/candidate"
import { getAllPosts } from "@/api/system/talentPost"
import { getAllIndustries } from "@/api/system/talentIndustry"
import { previewFile, signedUrl, deleteFile } from "@/api/tool/file"

const { proxy } = getCurrentInstance()
const { education } = proxy.useDict('education')

const fileStorage = ref(import.meta.env.VITE_APP_FILE_STORAGE)
const candidateList = ref([])
const open = ref(false)
const resumeOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const resumeId = ref("")
const fileList = ref([])
const previewUrl = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    phoneNumber: null,
    email: null,
    highestEdu: null,
    post: null,
    skillTags: null,
    resumeUrl: null,
    params: {
      expectedSalaryStart: 0,
      expectedSalaryEnd: 0
    }
  },
  rules: {
    name: [
      { required: true, message: "候选人姓名不能为空", trigger: "blur" },
      {
        pattern: /^[\u4e00-\u9fa5a-zA-Z]([\u4e00-\u9fa5a-zA-Z ]*[\u4e00-\u9fa5a-zA-Z])?$/,
        message: "姓名不符合规范 (不能出现特殊字符或者连续空格)",
        trigger: "blur"
      }
    ],
    phoneNumber: [
      { required: true, message: "手机号码不能为空", trigger: "blur" },
      { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的中国手机号码格式", trigger: "blur" }
    ],
    expectedSalary: [
      { required: true, message: "期望年薪不能为空", trigger: "blur" },
      { type: 'number', min: 1, message: '期望年薪必须大于1', trigger: 'blur' },
      { type: 'number', max: 10000, message: '期望年薪不能超过1亿', trigger: 'blur' }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

// 处理期望年薪起始值变化
const handleSalaryStartChange = (val) => {
  if (queryParams.value.params.expectedSalaryEnd !== null && val > queryParams.value.params.expectedSalaryEnd) {
    queryParams.value.params.expectedSalaryEnd = val
  }
}

// 处理期望年薪结束值变化
const handleSalaryEndChange = (val) => {
  if (queryParams.value.params.expectedSalaryStart !== null && val < queryParams.value.params.expectedSalaryStart) {
    queryParams.value.params.expectedSalaryStart = val
  }
}

/** 查询人才库列表 */
function getList() {
  loading.value = true
  listCandidate(queryParams.value).then(response => {
    candidateList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  resumeOpen.value = false
  resumeId.value = ""
  deleteUploadFile()
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    phoneNumber: null,
    email: null,
    highestEdu: null,
    expectedSalary: 0,
    industryList: null,
    postList: null,
    skillTags: null,
    resumeFilename: null,
    resumeUrl: null,
    deptId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("candidateRef")
  // 清空已选职位和行业
  selectedPosts.value = []
  selectedIndustries.value = []
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  // 显式重置期望年薪的值为0
  queryParams.value.params.expectedSalaryStart = 0
  queryParams.value.params.expectedSalaryEnd = 0
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
  title.value = "添加人才库"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getCandidate(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改人才库"
  })
}

/** 简历按钮操作 */
function handleUpload(row) {
  resumeId.value = row.id
  resumeOpen.value = true
  title.value = "候选人预览"
  // 从列表中获取数据，将resumeFilename和resumeUrl赋给fileList
  let candidate = candidateList.value.filter(item => item.id === resumeId.value)
  if (candidate && candidate.length > 0) {
    if (candidate[0].resumeFilename && candidate[0].resumeUrl) {
      fileList.value = [{ name: candidate[0].resumeFilename, url: candidate[0].resumeUrl }]
    }
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["candidateRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCandidate(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCandidate(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除人才库编号为"' + _ids + '"的数据项？').then(function () {
    return delCandidate(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/candidate/export', {
    ...queryParams.value
  }, `candidate_${new Date().getTime()}.xlsx`)
}

getList()

/** 职位选择器逻辑 */
const postDialog = ref(null)
// 职位数据（可以从后端API获取）
const postData = ref([])
// 已选职位ID列表
const selectedPosts = ref([])

// 已选职位名称列表（用于显示）
const selectedPostNames = computed(() => {
  return selectedPosts.value.map(id => {
    for (const category of postData.value) {
      for (const group of category.groups) {
        const post = group.posts.find(i => i.id === id)
        if (post) return post
      }
    }
    return null
  }).filter(Boolean)
})

// 打开职位选择对话框
function openPostDialog() {
  if (postData.value.length === 0) {
    getAllPosts().then(response => {
      postData.value = response.data
    })
  }
  postDialog.value.open(selectedPosts.value)
}

// 处理职位选择确认事件

function handlePostConfirm(selectedIds) {
  selectedPosts.value = selectedIds
  // 这里可以添加其他逻辑，如保存到后端等
  // 遍历selectedPostNames，提取name作为数组
  form.value.postList = selectedPostNames.value.map(post => post.name)
}

/** 行业选择器逻辑 */
const industryDialog = ref(null)
// 行业数据（可以从后端API获取）
const industryData = ref([])
// 已选行业ID列表
const selectedIndustries = ref([])

// 已选行业名称列表（用于显示）
const selectedIndustryNames = computed(() => {
  return selectedIndustries.value.map(id => {
    for (const category of industryData.value) {
      const industry = category.industries.find(i => i.id === id)
      if (industry) return industry
    }
    return null
  }).filter(Boolean)
})

// 打开职位选择对话框
function openIndustryDialog() {
  if (industryData.value.length === 0) {
    getAllIndustries().then(response => {
      industryData.value = response.data
    })
  }
  industryDialog.value.open(selectedIndustries.value)
}

// 处理行业选择确认事件
function handleIndustryConfirm(selectedIds) {
  selectedIndustries.value = selectedIds
  // 这里可以添加其他逻辑，如保存到后端等
  // 遍历selectedIndustryNames，提取name作为数组
  form.value.industryList = selectedIndustryNames.value.map(industry => industry.name)
}

/** 文件上传逻辑 */


// 获取文件名称
function getFileName(name) {
  if (!name) return ''
  // 如果是url那么取最后的名字 如果不是直接返回
  if (name.lastIndexOf("/") > -1) {
    return name.slice(name.lastIndexOf("/") + 1)
  } else {
    return name
  }
}

// 预览文件 - 使用后端接口
function handlePreviewFile(file) {
  if (!file.url) {
    proxy.$modal.msgError('文件URL不存在')
    return
  }

  proxy.$modal.loading('正在加载预览...')

  // 调用后端预览接口
  previewFile(file.url, fileStorage.value).then(response => {
    proxy.$modal.closeLoading()
    // 如果后端返回预览URL，在新窗口打开
    if (response.data) {
      window.open(response.data, '_blank')
    } else {
      // 如果没有预览URL，尝试直接打开文件
      window.open(file.url, '_blank')
    }
  }).catch(error => {
    proxy.$modal.closeLoading()
    console.error('预览失败:', error)
    proxy.$modal.msgError('文件预览失败，请稍后重试')
  })
}

// 下载文件
function handleDownloadFile(file) {
  // 调用后端下载接口
  signedUrl(file.url, fileStorage.value).then(response => {
    proxy.$modal.closeLoading()
    // 如果后端返回签名URL，在新窗口打开
    if (response.data) {
      window.open(response.data, '_blank')
    } else {
      // 如果没有签名URL，尝试直接打开文件
      window.open(file.url, '_blank')
    }
  }).catch(error => {
    proxy.$modal.closeLoading()
    console.error('下载失败:', error)
    proxy.$modal.msgError('文件失败失败，请稍后重试')
  })
}

// 更新简历
function updateResume() {
  let resumeFilename = null
  let resumeUrl = null
  if (fileList.value.length > 0) {
    resumeFilename = fileList.value[0].name
    resumeUrl = fileList.value[0].url
  }
  updateCandidateResume({
    id: resumeId.value,
    resumeFilename: resumeFilename,
    resumeUrl: resumeUrl
  }).then(res => {
    getList()
    proxy.$modal.msgSuccess('简历更新成功')
  }).catch(error => {
    console.error('更新失败:', error)
    proxy.$modal.msgError('更新失败，请稍后重试')
  })
  resumeOpen.value = false
  fileList.value = []
  resumeId.value = ""
}

function resumeDialogClose() {
  proxy.$modal.confirm('确认要关闭窗口吗？')
    .then(() => {
      deleteUploadFile()
      resumeOpen.value = false
      resumeId.value = ""
    }).catch(() => {
      // catch error
    })
}

function deleteUploadFile() {
  if (fileList.value && fileList.value.length > 0) {
    deleteFile(fileList.value[0].url, fileStorage.value)
    fileList.value = []
  }
}

</script>

<style lang="scss" scoped>
.file-preview-container {
  margin-top: 20px;

  .file-preview-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f1f3f4;
      border-color: #dee2e6;
    }

    .file-info {
      display: flex;
      align-items: center;
      flex: 1;

      .file-icon {
        font-size: 24px;
        color: #409eff;
        margin-right: 12px;
      }

      .file-details {
        flex: 1;

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          word-break: break-all;
        }
      }
    }

    .file-actions {
      display: flex;
      gap: 8px;

      .el-button {
        padding: 4px 8px;
        font-size: 12px;

        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-preview-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .file-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>