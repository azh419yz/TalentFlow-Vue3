<template>
  <el-dialog v-model="dialogVisible" :title="title" :width="width" :before-close="handleClose" append-to-body
    class="industry-select-dialog">
    <!-- 顶部控制区 -->
    <div class="dialog-header">
      <el-icon @click="handleClose" style="cursor: pointer;" />
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input v-model="searchText" class="search-input" placeholder="请输入行业名称搜索" clearable @clear="handleSearchClear"
        @input="handleSearchInput" />
      <el-link type="primary" underline="never" class="feedback-link">行业类别意见反馈</el-link>
    </div>

    <!-- 主体内容区 -->
    <div class="category-container">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <div v-for="category in filteredCategories" :key="category.id"
          :class="['category-item', { active: activeCategory === category.id }]" @click="selectCategory(category)">
          {{ category.name }}
          <span v-if="getCategorySelectedCount(category.id) > 0" class="selected-count">
            {{ getCategorySelectedCount(category.id) }}
          </span>
        </div>
      </div>

      <!-- 右侧行业标签 -->
      <div class="industry-content">
        <div v-for="industry in currentIndustries" :key="industry.id"
          :class="['industry-tag', { selected: isIndustrySelected(industry.id) }]"
          @click="toggleIndustrySelection(industry)">
          {{ industry.name }}
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="dialog-footer">
      <div class="selected-info">
        已选(<span class="selected-count-text">{{ selectedIndustries.length }}</span>/{{ maxSelection }})
      </div>
      <!-- 显示已选行业 -->
      <div v-if="selectedIndustries.length > 0" class="selected-industries">
        <div class="industry-tags">
          <el-tag v-for="industry in selectedIndustryNames" :key="industry.id" type="primary" class="mr-2 mb-2">
            {{ industry.name }}
          </el-tag>
        </div>
      </div>
      <el-button type="primary" @click="confirmSelection">确认</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // 对话框标题
  title: {
    type: String,
    default: '请选择行业'
  },
  // 对话框宽度
  width: {
    type: String,
    default: '800px'
  },
  // 最大选择数量
  maxSelection: {
    type: Number,
    default: 3
  },
  // 行业数据
  industryData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['confirm', 'close'])

// 控制对话框显示
const dialogVisible = ref(false)

// 搜索文本
const searchText = ref('')

// 当前选中的分类ID
const activeCategory = ref(null)

// 已选的行业ID列表
const selectedIndustries = ref([])

const selectedIndustryNames = computed(() => {
  return selectedIndustries.value.map(id => {
    for (const category of props.industryData) {
      const industry = category.industries.find(i => i.id === id)
      if (industry) return industry
    }
    return null
  }).filter(Boolean)
})

// 打开对话框
const open = (initialSelections = []) => {
  selectedIndustries.value = [...initialSelections]
  dialogVisible.value = true
  // 默认选中第一个分类
  if (props.industryData.length > 0) {
    activeCategory.value = props.industryData[0].id
  }
}

// 关闭对话框
const close = () => {
  dialogVisible.value = false
  emit('close')
}

// 处理关闭事件
const handleClose = () => {
  close()
}

// 分类列表（从props.industryData提取）
const categories = computed(() => {
  return props.industryData.map(category => ({
    id: category.id,
    name: category.name
  }))
})

// 过滤后的分类（根据搜索文本）
const filteredCategories = computed(() => {
  if (!searchText.value) return categories.value
  return categories.value.filter(category =>
    category.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 当前选中的分类对应的行业
const currentIndustries = computed(() => {
  if (!activeCategory.value) return []
  const category = props.industryData.find(c => c.id === activeCategory.value)
  return category ? category.industries : []
})

// 获取分类的已选数量
const getCategorySelectedCount = (categoryId) => {
  const category = props.industryData.find(c => c.id === categoryId)
  if (!category) return 0

  let count = 0
  category.industries.forEach(industry => {
    if (selectedIndustries.value.includes(industry.id)) {
      count++
    }
  })
  return count
}

// 选择分类
const selectCategory = (category) => {
  activeCategory.value = category.id
}

// 切换行业选择
const toggleIndustrySelection = (industry) => {
  const index = selectedIndustries.value.indexOf(industry.id)

  if (index !== -1) {
    // 取消选择
    selectedIndustries.value.splice(index, 1)
  } else {
    // 检查是否达到最大选择数量
    if (selectedIndustries.value.length >= props.maxSelection) {
      ElMessage.warning(`最多只能选择${props.maxSelection}个行业`)
      return
    }
    // 添加选择
    selectedIndustries.value.push(industry.id)
  }
}

// 检查行业是否被选中
const isIndustrySelected = (industryId) => {
  return selectedIndustries.value.includes(industryId)
}

// 确认选择
const confirmSelection = () => {
  emit('confirm', [...selectedIndustries.value])
  close()
}

// 处理搜索输入
const handleSearchInput = () => {
  // 如果有搜索文本，则取消当前选中的分类
  if (searchText.value) {
    activeCategory.value = null
  } else if (categories.value.length > 0) {
    activeCategory.value = categories.value[0].id
  }
}

// 处理搜索清除
const handleSearchClear = () => {
  if (categories.value.length > 0) {
    activeCategory.value = categories.value[0].id
  }
}

// 暴露方法给父组件
defineExpose({
  open,
  close
})
</script>

<style scoped>
.industry-select-dialog {
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 12px;
    border-bottom: 1px solid #eee;

    .dialog-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .search-area {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    background-color: #f5f7fa;

    .search-input {
      flex: 1;
    }

    .feedback-link {
      color: #409eff;
      cursor: pointer;
    }
  }

  .category-container {
    display: flex;
    height: 400px;

    .category-nav {
      width: 200px;
      border-right: 1px solid #eee;
      overflow-y: auto;

      .category-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &.active {
          background-color: #f5f7fa;
          color: #e6a23c;
          font-weight: 500;
        }

        &:hover {
          background-color: #f0f2f5;
        }

        .selected-count {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background-color: #f56c6c;
          color: white;
          font-size: 12px;
          border-radius: 10px;
          padding: 0 6px;
          height: 18px;
          line-height: 18px;
        }
      }
    }

    .industry-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .industry-tag {
        padding: 8px 16px;
        border-radius: 4px;
        background-color: #f5f7fa;
        color: #606266;
        cursor: pointer;
        transition: all 0.3s;
        border: 1px solid transparent;
        height: 30px;
        display: flex;
        align-items: center;

        &.selected {
          background-color: #fff6f1;
          border-color: #e6a23c;
          color: #e6a23c;
        }

        &:hover {
          background-color: #ecf5ff;
          color: #409eff;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid #eee;

    .selected-info {
      font-size: 14px;
      color: #606266;

      .selected-count-text {
        color: #f56c6c;
        font-weight: 500;
      }
    }
  }
}
</style>