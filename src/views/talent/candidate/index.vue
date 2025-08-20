<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="候选人" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入候选人姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="queryParams.email" placeholder="请输入用户邮箱" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="学历" prop="highestEdu">
        <el-select v-model="queryParams.highestEdu" placeholder="请选择学历" clearable style="width: 120px">
          <el-option v-for="dict in education" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="期望年薪" prop="expectedSalary">
        <el-input v-model="queryParams.expectedSalary" placeholder="请输入期望年薪" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:candidate:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:candidate:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:candidate:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:candidate:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="candidateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="100" align="center" />
      <el-table-column label="id" type="index" align="center" />
      <el-table-column label="候选人姓名" align="center" prop="name" />
      <el-table-column label="手机号码" align="center" prop="phoneNumber" />
      <el-table-column label="用户邮箱" align="center" prop="email" />
      <el-table-column label="学历" align="center" prop="highestEdu">
        <template #default="scope">
          <dict-tag :options="education" :value="scope.row.highestEdu" />
        </template>
      </el-table-column>
      <el-table-column label="期望年薪" align="center" prop="expectedSalary" />
      industry: [],
      <el-table-column label="职位" align="center" prop="post" />
      <el-table-column label="专业技能" align="center" prop="skillTags" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:candidate:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:candidate:remove']">删除</el-button>
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
          <el-input-number v-model="form.expectedSalary" :min="0" :precision="0" /> 万元
        </el-form-item>
        <el-form-item label="行业" prop="industry">
          <el-row :gutter="10" align="middle">
            <el-col :span="18">
              <el-input-tag v-model="form.industry" :tag-props="{ type: 'primary' }" placeholder="请输入内容" />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="openIndustryDialog" :icon="Search" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="职位" prop="post">
          <el-row :gutter="10" align="middle">
            <el-col :span="18">
              <el-input-tag v-model="form.post" :tag-props="{ type: 'primary' }" placeholder="请输入内容" />
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
    <!-- 职位选择弹窗组件 -->
    <PostSelect ref="postDialog" :max-selection="3" :post-data="postData" @confirm="handlePostConfirm" />
    <!-- 使用行业选择组件 -->
    <IndustrySelect ref="industryDialog" :max-selection="3" :industry-data="industryData"
      @confirm="handleIndustryConfirm" />
  </div>
</template>

<script setup name="Candidate">
import { Search } from '@element-plus/icons-vue'
import { listCandidate, getCandidate, delCandidate, addCandidate, updateCandidate } from "@/api/system/candidate"
import { getAllPosts } from "@/api/system/talentPost"

const { proxy } = getCurrentInstance()
const { education } = proxy.useDict('education')

const candidateList = ref([])
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
    name: null,
    phoneNumber: null,
    email: null,
    highestEdu: null,
    expectedSalary: null,
    post: null,
    skillTags: null,
    resumeUrl: null,
  },
  rules: {
    name: [
      { required: true, message: "候选人姓名不能为空", trigger: "blur" }
    ],
    phoneNumber: [
      { required: true, message: "手机号码不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

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
    expectedSalary: null,
    post: null,
    skillTags: null,
    resumeUrl: null,
    deptId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("candidateRef")
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
  title.value = "添加人才库"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getCandidate(_id).then(response => {
    form.value = response.data.data
    open.value = true
    title.value = "修改人才库"
  })
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

import PostSelect from '@/components/PostSelect'

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
const openPostDialog = () => {
  if (postData.value.length === 0) {
    getAllPosts().then(response => {
      postData.value = response.data
    })
  }
  postDialog.value.open(selectedPosts.value)
}

// 处理职位选择确认事件
const handlePostConfirm = (selectedIds) => {
  selectedPosts.value = selectedIds
  // 这里可以添加其他逻辑，如保存到后端等
  // 遍历selectedPostNames，提取name作为数组
  form.value.post = selectedPostNames.value.map(post => post.name)
}

import IndustrySelect from '@/components/IndustrySelect'

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
const openIndustryDialog = () => {
  if (industryData.value.length === 0) {
    // getAllPosts().then(response => {
    //   industryData.value = response.data
    // })
    industryData.value = [
      {
        id: 1,
        name: '全部行业',
        industries: [
          { id: 101, name: '全部行业' }
        ]
      },
      {
        id: 2,
        name: 'IT/互联网/游戏',
        industries: [
          { id: 201, name: '互联网' },
          { id: 202, name: '计算机软件' },
          { id: 203, name: '在线教育' },
          { id: 204, name: '网络/信息安全' },
          { id: 205, name: 'IT服务' },
          { id: 206, name: '游戏' },
          { id: 207, name: '电子商务' },
          { id: 208, name: '云计算/大数据' },
          { id: 209, name: '在线社交/媒体' }
        ]
      },
      {
        id: 3,
        name: '电子/通信/半导体',
        industries: [
          { id: 301, name: '电子技术' },
          { id: 302, name: '半导体' },
          { id: 303, name: '集成电路' },
          { id: 304, name: '通信设备' },
          { id: 305, name: '5G技术' }
        ]
      },
      {
        id: 4,
        name: '房地产/建筑',
        industries: [
          { id: 401, name: '房地产开发' },
          { id: 402, name: '建筑设计' },
          { id: 403, name: '建筑施工' },
          { id: 404, name: '物业管理' },
          { id: 405, name: '装修装饰' }
        ]
      },
      {
        id: 5,
        name: '金融',
        industries: [
          { id: 501, name: '银行' },
          { id: 502, name: '保险' },
          { id: 503, name: '基金/证券/期货' },
          { id: 504, name: '投资管理' },
          { id: 505, name: '金融科技' },
          { id: 506, name: '信托' },
          { id: 507, name: '融资租赁' }
        ]
      },
      {
        id: 6,
        name: '消费品',
        industries: [
          { id: 601, name: '食品饮料' },
          { id: 602, name: '服装纺织' },
          { id: 603, name: '家居用品' },
          { id: 604, name: '美妆个护' },
          { id: 605, name: '珠宝首饰' }
        ]
      },
      {
        id: 7,
        name: '医疗健康',
        industries: [
          { id: 701, name: '医药制造' },
          { id: 702, name: '医疗器械' },
          { id: 703, name: '医疗服务' },
          { id: 704, name: '健康管理' },
          { id: 705, name: '生物技术' }
        ]
      },
      {
        id: 8,
        name: '汽车',
        industries: [
          { id: 801, name: '汽车制造' },
          { id: 802, name: '新能源汽车' },
          { id: 803, name: '汽车零部件' },
          { id: 804, name: '汽车销售' },
          { id: 805, name: '汽车服务' }
        ]
      },
      {
        id: 9,
        name: '机械/制造',
        industries: [
          { id: 901, name: '机械制造' },
          { id: 902, name: '工业自动化' },
          { id: 903, name: '智能制造' },
          { id: 904, name: '仪器仪表' },
          { id: 905, name: '金属加工' }
        ]
      },
      {
        id: 10,
        name: '教育培训/科研',
        industries: [
          { id: 1001, name: 'K12教育' },
          { id: 1002, name: '高等教育' },
          { id: 1003, name: '职业教育' },
          { id: 1004, name: '语言培训' },
          { id: 1005, name: '科研机构' }
        ]
      },
      {
        id: 11,
        name: '专业服务',
        industries: [
          { id: 1101, name: '法律咨询' },
          { id: 1102, name: '会计审计' },
          { id: 1103, name: '管理咨询' },
          { id: 1104, name: '人力资源' },
          { id: 1105, name: '广告营销' }
        ]
      }
    ]
  }
  industryDialog.value.open(selectedIndustries.value)
}

// 处理行业选择确认事件
const handleIndustryConfirm = (selectedIds) => {
  console.log(selectedIds);
  
  selectedIndustries.value = selectedIds
  // 这里可以添加其他逻辑，如保存到后端等
  // 遍历selectedIndustryNames，提取name作为数组
  console.log(selectedIndustryNames.value);
  
  form.value.industry = selectedIndustryNames.value.map(industry => industry.name)
}
</script>
<style scoped></style>