<template>
    <div>
        <!-- 触发按钮 -->
        <el-button type="primary" @click="openDialog">选择行业</el-button>

        <!-- 行业选择弹窗 -->
        <el-dialog v-model="dialogVisible" title="请选择行业" :width="800" :before-close="handleClose"
            custom-class="industry-select-dialog">
            <!-- 顶部控制区 -->
            <div class="dialog-header">
                <el-input v-model="searchText" placeholder="请输入行业关键词" clearable class="search-input" />
                <el-link type="primary" :underline="false" class="feedback-link">意见反馈</el-link>
                <el-icon class="close-icon" @click="dialogVisible = false">
                    <Close />
                </el-icon>
            </div>

            <!-- 主体内容区 -->
            <div class="main-content">
                <!-- 左侧分类导航 -->
                <div class="category-nav">
                    <div v-for="category in filteredCategories" :key="category.id"
                        :class="['category-item', { active: activeCategory === category.id }]"
                        @click="selectCategory(category)">
                        {{ category.name }}
                        <span v-if="getCategorySelectedCount(category.id) > 0" class="selected-count">
                            {{ getCategorySelectedCount(category.id) }}
                        </span>
                    </div>
                </div>

                <!-- 右侧行业标签 -->
                <div class="industry-content">
                    <div class="industry-tags">
                        <div v-for="industry in currentIndustries" :key="industry.id"
                            :class="['industry-tag', { selected: isIndustrySelected(industry.id) }]"
                            @click="toggleIndustrySelection(industry)">
                            {{ industry.name }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部操作区 -->
            <div class="dialog-footer">
                <div class="selected-info">
                    已选(<span class="selected-count-text">{{ selectedIndustries.length }}</span>/{{ maxSelection }})
                </div>
                <div class="selected-tags">
                    <el-tag v-for="industry in selectedIndustryNames" :key="industry.id" type="info" closable
                        @close="removeIndustry(industry.id)">
                        {{ industry.name }}
                    </el-tag>
                </div>
                <el-button type="primary" @click="confirmSelection">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 组件属性
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    maxSelection: {
        type: Number,
        default: 3
    }
})

// 组件事件
const emit = defineEmits(['update:modelValue', 'confirm'])

// 控制对话框显示
const dialogVisible = ref(false)

// 搜索文本
const searchText = ref('')

// 当前选中的分类ID
const activeCategory = ref(1) // 默认选中"金融"

// 已选的行业ID列表
const selectedIndustries = ref([])

// 行业分类数据（两层结构）
const industryData = ref([
    {
        id: 1,
        name: '全部行业',
        industries: [
            { id: 101, name: '互联网' },
            { id: 102, name: '电子商务' },
            { id: 103, name: '金融科技' },
            { id: 104, name: '人工智能' },
            { id: 105, name: '新能源' },
            { id: 106, name: '医疗健康' },
            { id: 107, name: '教育培训' }
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
])

// 打开对话框
const openDialog = () => {
    selectedIndustries.value = [...props.modelValue]
    dialogVisible.value = true
}

// 关闭对话框
const closeDialog = () => {
    dialogVisible.value = false
}

// 处理关闭事件
const handleClose = (done) => {
    done()
}

// 分类列表
const categories = computed(() => {
    return industryData.value.map(category => ({
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
    const category = industryData.value.find(c => c.id === activeCategory.value)
    return category ? category.industries : []
})

// 获取分类的已选数量
const getCategorySelectedCount = (categoryId) => {
    const category = industryData.value.find(c => c.id === categoryId)
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

// 移除已选行业
const removeIndustry = (industryId) => {
    const index = selectedIndustries.value.indexOf(industryId)
    if (index !== -1) {
        selectedIndustries.value.splice(index, 1)
    }
}

// 检查行业是否被选中
const isIndustrySelected = (industryId) => {
    return selectedIndustries.value.includes(industryId)
}

// 确认选择
const confirmSelection = () => {
    emit('update:modelValue', [...selectedIndustries.value])
    emit('confirm', [...selectedIndustries.value])
    closeDialog()
}

// 获取已选行业名称
const selectedIndustryNames = computed(() => {
    return selectedIndustries.value.map(id => {
        for (const category of industryData.value) {
            const industry = category.industries.find(i => i.id === id)
            if (industry) return { id: industry.id, name: industry.name }
        }
        return null
    }).filter(Boolean)
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
    selectedIndustries.value = [...newVal]
})
</script>

<style lang="scss" scoped>
.industry-select-dialog {
    .dialog-header {
        display: flex;
        align-items: center;
        padding: 16px 24px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #ebeef5;

        .search-input {
            flex: 1;
            margin-right: 16px;
        }

        .feedback-link {
            margin-right: 16px;
            color: #409eff;
            cursor: pointer;
        }

        .close-icon {
            cursor: pointer;
            font-size: 18px;
            color: #909399;

            &:hover {
                color: #409eff;
            }
        }
    }

    .main-content {
        display: flex;
        height: 400px;

        .category-nav {
            width: 200px;
            border-right: 1px solid #ebeef5;
            overflow-y: auto;
            padding: 10px 0;

            .category-item {
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                font-size: 14px;
                color: #606266;

                &.active {
                    background-color: #f5f7fa;
                    color: #e6a23c;
                    font-weight: 500;
                    border-right: 3px solid #e6a23c;
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

            .industry-tags {
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
                    font-size: 14px;

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

    .dialog-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-top: 1px solid #ebeef5;

        .selected-info {
            font-size: 14px;
            color: #606266;

            .selected-count-text {
                color: #f56c6c;
                font-weight: 500;
            }
        }

        .selected-tags {
            flex: 1;
            margin: 0 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .el-tag {
                background-color: #f0f2f5;
                border-color: #dcdfe6;
                color: #606266;
            }
        }
    }
}
</style>