<template>
  <el-dialog
    v-model="visible"
    title="报修详情"
    width="70%"
    :before-close="handleClose"
    destroy-on-close
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报修单ID">{{ repairDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="报修标题">{{ repairDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="租客姓名">{{ repairDetail.userName }}</el-descriptions-item>
        <el-descriptions-item label="租客手机号">{{ repairDetail.userPhone }}</el-descriptions-item>
        <el-descriptions-item label="公寓名称">{{ repairDetail.apartmentName }}</el-descriptions-item>
        <el-descriptions-item label="房间号">{{ repairDetail.roomNumber }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ repairDetail.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ repairDetail.handlerName || '未指派' }}</el-descriptions-item>
        <el-descriptions-item label="报修状态">
          <el-tag :type="getStatusType(repairDetail.status)">{{ getStatusText(repairDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(repairDetail.priority)">{{ getPriorityText(repairDetail.priority) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ repairDetail.appointmentTime || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="完结时间">{{ repairDetail.finishTime || '未完结' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ repairDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ repairDetail.remark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="报修描述" :span="2">{{ repairDetail.description }}</el-descriptions-item>
      </el-descriptions>

      <!-- 报修附件 -->
      <div class="section-title">报修附件</div>
      <div v-if="repairDetail.attachments && repairDetail.attachments.length > 0" class="attachment-list">
        <div v-for="(item, index) in repairDetail.attachments" :key="index" class="attachment-item">
          <el-link :href="item.url" target="_blank" type="primary">
            {{ `附件${index + 1} (${item.type})` }}
          </el-link>
        </div>
      </div>
      <div v-else class="no-data">暂无附件</div>

      <!-- 处理进度时间轴 -->
      <div class="section-title">处理进度</div>
      <el-timeline>
        <el-timeline-item
          v-for="(progress, index) in repairDetail.progresses"
          :key="index"
          :timestamp="progress.createTime"
          placement="top"
        >
          <el-card>
            <div class="progress-header">
              <el-tag :type="getStatusType(progress.status)">{{ getStatusText(progress.status) }}</el-tag>
              <span class="operator">{{ progress.operatorRole }} - {{ progress.operatorName }}</span>
            </div>
            <div class="progress-content">{{ progress.content }}</div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button 
          v-if="repairDetail.status !== '3' && repairDetail.status !== '4'"
          type="primary" 
          @click="handleAssign"
        >
          指派处理
        </el-button>
        <el-button 
          v-if="repairDetail.status !== '3' && repairDetail.status !== '4'"
          type="success" 
          @click="handleAddProgress"
        >
          新增进度
        </el-button>
        <el-button 
          v-if="repairDetail.status === '2'"
          type="warning" 
          @click="handleComplete"
        >
          完成报修
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 指派报修弹窗 -->
  <AssignRepair
    v-if="assignVisible"
    :visible="assignVisible"
    :repairId="repairId"
    @close="assignVisible = false"
    @refresh="handleRefresh"
  />

  <!-- 新增进度弹窗 -->
  <AddProgress
    v-if="progressVisible"
    :visible="progressVisible"
    :repairId="repairId"
    @close="progressVisible = false"
    @refresh="handleRefresh"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRepairDetail, updateRepairStatus } from '@/api/repair'
import type { RepairDetailInterface } from '@/api/repair/types'
import { RepairStatus, RepairStatusMap, RepairPriority, RepairPriorityMap } from '@/enums/constEnums'
import AssignRepair from './AssignRepair.vue'
import AddProgress from './AddProgress.vue'

interface Props {
  visible: boolean
  repairId: number | string
}

interface Emits {
  (e: 'close'): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗可见性
const visible = ref(false)
// 加载状态
const loading = ref(false)
// 报修详情数据
const repairDetail = ref<RepairDetailInterface>({
  id: 0,
  userName: '',
  userPhone: '',
  apartmentName: '',
  roomNumber: '',
  title: '',
  description: '',
  priority: '',
  status: '',
  appointmentTime: '',
  contactPhone: '',
  handlerName: '',
  finishTime: '',
  remark: '',
  createTime: '',
  attachments: [],
  progresses: []
})

// 子弹窗控制
const assignVisible = ref(false)
const progressVisible = ref(false)

/**
 * @description 根据报修单ID获取详情数据
 * @param id 报修单ID
 */
const getRepairDetailData = async (id: number | string) => {
  try {
    console.log('开始获取报修详情，ID:', id)
    loading.value = true
    const { data } = await getRepairDetail(id)
    console.log('获取报修详情成功:', data)
    repairDetail.value = data
  } catch (error) {
    console.error('获取报修详情失败:', error)
    ElMessage.error('获取报修详情失败')
  } finally {
    loading.value = false
  }
}

/**
 * @description 监听弹窗可见性变化，弹窗打开时触发详情请求
 */
watch(
  () => props.visible,
  (visibleProp) => {
    visible.value = visibleProp
    if (visibleProp && props.repairId) {
      getRepairDetailData(props.repairId)
    }
  },
  { immediate: true }
)

/**
 * @description 监听报修单ID变化，已打开弹窗时重新请求详情
 */
watch(
  () => props.repairId,
  (repairId) => {
    if (visible.value && repairId) {
      getRepairDetailData(repairId)
    }
  }
)

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap = {
    [RepairStatus.PENDING]: 'info',
    [RepairStatus.PROCESSING]: 'warning',
    [RepairStatus.COMPLETED]: 'success',
    [RepairStatus.CANCELLED]: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    [RepairStatus.PENDING]: '待处理',
    [RepairStatus.PROCESSING]: '处理中',
    [RepairStatus.COMPLETED]: '已完成',
    [RepairStatus.CANCELLED]: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取优先级类型
const getPriorityType = (priority: string) => {
  const priorityMap = {
    [RepairPriority.LOW]: 'info',
    [RepairPriority.MEDIUM]: 'warning',
    [RepairPriority.HIGH]: 'danger'
  }
  return priorityMap[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const priorityMap = {
    [RepairPriority.LOW]: '低',
    [RepairPriority.MEDIUM]: '中',
    [RepairPriority.HIGH]: '高'
  }
  return priorityMap[priority] || '未知'
}

/**
 * @description 处理弹窗关闭事件
 */
const handleClose = () => {
  emit('close')
}

/**
 * @description 刷新当前报修详情并通知父级刷新列表
 */
const handleRefresh = () => {
  if (props.repairId) {
    getRepairDetailData(props.repairId)
  }
  emit('refresh')
}

/**
 * @description 打开指派弹窗
 */
const handleAssign = () => {
  assignVisible.value = true
}

/**
 * @description 打开新增进度弹窗
 */
const handleAddProgress = () => {
  progressVisible.value = true
}

/**
 * @description 将报修单状态更新为已完成
 */
const handleComplete = () => {
  ElMessageBox.confirm('确认完成该报修单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateRepairStatus(props.repairId, RepairStatus.COMPLETED)
      ElMessage.success('操作成功')
      handleRefresh()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}
</script>

<style scoped>
.section-title {
  margin: 20px 0 10px;
  font-weight: bold;
  font-size: 16px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.attachment-item {
  margin-bottom: 5px;
}

.no-data {
  color: #909399;
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.operator {
  color: #909399;
  font-size: 14px;
}

.progress-content {
  margin-top: 5px;
}
</style>