<template>
  <el-dialog v-model="dialogVisible" :title="title" :width="width" :before-close="handleClose" append-to-body
    class="post-select-dialog">
    <!-- 顶部控制区 -->
    <div class="dialog-header">
      <el-icon @click="handleClose" style="cursor: pointer;"/>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input v-model="searchText" class="search-input" placeholder="请输入职位名称搜索" clearable @clear="handleSearchClear"
        @input="handleSearchInput" />
      <el-link type="primary" underline="never" class="feedback-link">职位类别意见反馈</el-link>
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

      <!-- 右侧职位标签 -->
      <div class="post-content">
        <div v-for="group in currentGroups" :key="group.id" class="post-group">
          <div class="group-title">{{ group.name }}</div>
          <div class="post-tags">
            <div v-for="post in group.posts" :key="post.id"
              :class="['post-tag', { selected: isPostSelected(post.id) }]"
              @click="togglePostSelection(post)">
              {{ post.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="dialog-footer">
      <div class="selected-info">
        已选(<span class="selected-count-text">{{ selectedPosts.length }}</span>/{{ maxSelection }})
      </div>
      <!-- 显示已选职位 -->
      <div v-if="selectedPosts.length > 0" class="selected-posts">
        <div class="post-tags">
          <el-tag v-for="post in selectedPostNames" :key="post.id" type="primary" class="mr-2 mb-2">
            {{ post.name }}
          </el-tag>
        </div>
      </div>
      <el-button type="primary" @click="confirmSelection">确认</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // 对话框标题
  title: {
    type: String,
    default: '请选择职位'
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
  // 职位数据
  postData: {
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

// 已选的职位ID列表
const selectedPosts = ref([])

const selectedPostNames = computed(() => {
  return selectedPosts.value.map(id => {
    for (const category of props.postData) {
      for (const group of category.groups) {
        const post = group.posts.find(i => i.id === id)
        if (post) return post
      }
    }
    return null
  }).filter(Boolean)
})

// 打开对话框
const open = (initialSelections = []) => {
  selectedPosts.value = [...initialSelections]
  dialogVisible.value = true
  // 默认选中第一个分类
  if (props.postData.length > 0) {
    activeCategory.value = props.postData[0].id
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

// 分类列表（从props.postData提取）
const categories = computed(() => {
  return props.postData.map(category => ({
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

// 当前选中的分类对应的分组
const currentGroups = computed(() => {
  if (!activeCategory.value) return []
  const category = props.postData.find(c => c.id === activeCategory.value)
  return category ? category.groups : []
})

// 获取分类的已选数量
const getCategorySelectedCount = (categoryId) => {
  const category = props.postData.find(c => c.id === categoryId)
  if (!category) return 0

  let count = 0
  category.groups.forEach(group => {
    group.posts.forEach(post => {
      if (selectedPosts.value.includes(post.id)) {
        count++
      }
    })
  })
  return count
}

// 选择分类
const selectCategory = (category) => {
  activeCategory.value = category.id
}

// 切换职位选择
const togglePostSelection = (post) => {
  const index = selectedPosts.value.indexOf(post.id)

  if (index !== -1) {
    // 取消选择
    selectedPosts.value.splice(index, 1)
  } else {
    // 检查是否达到最大选择数量
    if (selectedPosts.value.length >= props.maxSelection) {
      ElMessage.warning(`最多只能选择${props.maxSelection}个职位`)
      return
    }
    // 添加选择
    selectedPosts.value.push(post.id)
  }
}

// 检查职位是否被选中
const isPostSelected = (postId) => {
  return selectedPosts.value.includes(postId)
}

// 确认选择
const confirmSelection = () => {
  emit('confirm', [...selectedPosts.value])
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

<style lang="scss" scoped>
.post-select-dialog {
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

    .post-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;

      .post-group {
        margin-bottom: 24px;

        .group-title {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
          margin-bottom: 12px;
        }

        .post-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;

          .post-tag {
            padding: 8px 16px;
            border-radius: 4px;
            background-color: #f5f7fa;
            color: #606266;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid transparent;

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