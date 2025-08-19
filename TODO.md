# TalentFlow 开发任务清单

## 一、基础设施改造
### 1. 文件存储系统升级
- [ ] **集成腾讯云COS**
  - 替换 RuoYi 默认的本地文件存储方案
  - 实现简历文件上传接口（支持 PDF/DOCX）
  - 配置访问权限控制（部门隔离）
- [ ] **简历预览功能**
  - 前端集成 PDF.js 组件
  - 实现简历文件在线预览

### 2. 数据隔离方案
- [ ] **部门即租户改造**
  - 在 `sys_dept` 表添加 `tenant_flag` 字段（1=独立租户）
  - 修改 `DataScopeAspect` 切面类，自动注入部门过滤条件
- [ ] **实体类改造**
```java
// 在所有业务实体类继承的BaseEntity中增加
@TableField(exist = false)
private Long deptId; // 数据隔离字段
```

## 二、核心模块开发
### 1. 人才管理模块
- [ ] **数据库设计**
```sql
CREATE TABLE talent_candidate (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) COMMENT '加密存储',
    highest_edu ENUM('本科','硕士','博士'),
    expected_salary INT,
    industry VARCHAR(50) COMMENT '行业',
    skill_tags JSON COMMENT '["Java","Python"]',
    resume_url VARCHAR(255),
    dept_id BIGINT NOT NULL COMMENT '关联sys_dept'
);
```
- [ ] **后端接口**
- `POST /talent/candidate` 添加人才（含文件上传）
- `GET /talent/candidate/{id}` 获取人才详情
- `PUT /talent/candidate` 编辑人才信息
- [ ] **前端页面**
- 人才列表页（表格+卡片视图切换）
- 人才详情页（基础信息+简历预览）

### 2. 智能搜索与筛选
- [ ] **筛选条件组件**
- 技能标签多选组件（Element Plus Tag）
- 薪资范围滑块（支持自定义区间）
- 行业树形选择器（动态加载）
- [ ] **后端搜索接口**
```java
@GetMapping("/talent/search")
public TableDataInfo search(
    @RequestParam(required = false) String[] skills,
    @RequestParam Integer minSalary,
    @RequestParam Integer maxSalary,
    @RequestParam String industry) {
    // 动态构建MyBatis查询条件
    }
```
- [ ] **性能优化**
- 超过1万条数据时引入Elasticsearch
- 高频查询结果Redis缓存（5分钟）

### 3. 面试跟踪模块
- [ ] **数据库设计**
```sql
CREATE TABLE talent_interview (
    id BIGINT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    stage ENUM('初试','复试','Offer','入职') DEFAULT '初试',
    interview_time DATETIME,
    notes TEXT,
    interviewer_id BIGINT COMMENT '关联sys_user',
    dept_id BIGINT NOT NULL
);
```
- [ ] **状态机实现**
```java
public enum InterviewStage {
    INITIAL("初试"),
    RETEST("复试"),
    OFFER("Offer"),
    HIRED("入职");

    @JsonValue
    private final String value;
}
```
- [ ] **前端交互**
- 面试阶段可视化时间轴
- 拖拽式状态切换组件

## 三、协作与权限体系
### 1. 用户协作机制
- [ ] **部门数据隔离规则**
- 普通用户：仅查看本部门数据
- 部门管理员：管理本部门所有数据
- 超级管理员：跨部门访问（需特殊权限）
- [ ] **操作日志增强**
- 记录人才状态变更日志
- 增加简历下载审计

### 2. 标签管理系统
- [ ] **标签实体设计**
```sql
CREATE TABLE talent_tag (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) COMMENT '#FF0000',
    dept_id BIGINT NOT NULL
);
```
- [ ] **人才打标接口**
- `POST /talent/tagging` 批量打标
- `DELETE /talent/tagging` 移除标签

## 四、扩展功能预留
### 1. 数据统计看板
- [ ] **核心指标**
- 部门人才总数卡片
- 面试阶段漏斗图
- 技能分布雷达图
- [ ] 实现方案：集成 ECharts 组件

### 2. 安全增强（二期）
- [ ] 敏感字段加密存储（手机号）
- [ ] 操作二次确认（删除人才）
- [ ] 登录IP白名单控制

## 五、测试与部署
### 1. 关键测试用例
- [ ] **数据隔离验证**
- 不同部门用户访问同一人才ID
- 超级管理员跨部门查询
- [ ] **文件上传测试**
- 简历文件类型限制（PDF/DOCX）
- 单文件大小限制（10MB）

### 2. 部署方案
- [ ] **生产环境配置**
- Nginx 反向代理配置
- 腾讯云COS访问密钥管理
- [ ] **初始化脚本**
- 部门租户标记初始化
- 默认角色权限配置

## 优先级建议
1. **核心MVP**（2周）：人才管理 + 基础搜索 + 部门隔离
2. **协作增强**（1周）：面试跟踪 + 标签系统
3. **体验优化**（1周）：数据看板 + 高级搜索