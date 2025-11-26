<template>
  <el-card>
    <ProTable
      ref="proTable"
      :dataCallback="dataCallback"
      :columns="columns"
      :requestApi="getRepairList"
      :initParam="initParam"
      :stripe="true"
    >
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button 
          type="primary" 
          icon="View" 
          size="small"
          @click="viewDetail(scope.row)"
        >
          查看详情
        </el-button>
        <el-button 
          type="success" 
          icon="User" 
          size="small"
          @click="assignRepair(scope.row)"
          :disabled="scope.row.status === '3' || scope.row.status === '4'"
        >
          指派处理
        </el-button>
        <el-button 
          type="warning" 
          icon="Plus" 
          size="small"
          @click="addProgress(scope.row)"
          :disabled="scope.row.status === '3' || scope.row.status === '4'"
        >
          新增进度
        </el-button>
        <el-button 
          type="danger" 
          icon="Close" 
          size="small"
          @click="cancelRepair(scope.row)"
          :disabled="scope.row.status === '3' || scope.row.status === '4'"
        >
          取消报修
        </el-button>
      </template>
    </ProTable>

    <!-- 报修详情弹窗 -->
    <RepairDetail
      v-if="detailVisible"
      :visible="detailVisible"
      :repairId="currentRepairId"
      @close="detailVisible = false"
      @refresh="refreshTable"
    />

    <!-- 指派报修弹窗 -->
    <AssignRepair
      v-if="assignVisible"
      :visible="assignVisible"
      :repairId="currentRepairId"
      :repairData="currentRepairData"
      @close="assignVisible = false"
      @refresh="refreshTable"
    />

    <!-- 新增进度弹窗 -->
    <AddProgress
      v-if="progressVisible"
      :visible="progressVisible"
      :repairId="currentRepairId"
      :repairData="currentRepairData"
      @close="progressVisible = false"
      @refresh="refreshTable"
    />
  </el-card>
</template>

<script setup lang="tsx">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ColumnProps } from '@/components/ProTable/src/types'
import { ProTable } from '@/components/ProTable'
import { getRepairList, updateRepairStatus } from '@/api/repair'
import { RepairItemInterface } from '@/api/repair/types'
import { RepairStatus, RepairStatusMap, RepairPriority, RepairPriorityMap } from '@/enums/constEnums'
import RepairDetail from './components/RepairDetail.vue'
import AssignRepair from './components/AssignRepair.vue'
import AddProgress from './components/AddProgress.vue'

// *获取 ProTable 元素，调用其获取刷新数据方法
const proTable = ref<InstanceType<typeof ProTable>>()

// 初始化参数
const initParam = reactive({})

// 表格配置项
const columns: ColumnProps[] = [
  { 
    prop: 'title', 
    label: '报修标题',
    search: {
      el: 'input',
      props: {
        placeholder: '请输入报修标题'
      }
    }
  },
  { 
    prop: 'userPhone', 
    label: '租客手机号',
    search: {
      el: 'input',
      props: {
        placeholder: '请输入租客手机号'
      }
    }
  },
  { 
    prop: 'apartmentName', 
    label: '公寓名称',
    search: {
      el: 'input',
      props: {
        placeholder: '请输入公寓名称'
      }
    }
  },
  { prop: 'userName', label: '租客姓名' },
  { prop: 'roomNumber', label: '房间号' },
  {
    prop: 'status',
    label: '状态',
    enum: RepairStatusMap,
    search: {
      el: 'select',
      props: {
        placeholder: '请选择状态'
      }
    },
    render: ({ row }: { row: RepairItemInterface }) => {
      const statusMap = {
        [RepairStatus.PENDING]: { type: 'info', text: '待处理' },
        [RepairStatus.PROCESSING]: { type: 'warning', text: '处理中' },
        [RepairStatus.COMPLETED]: { type: 'success', text: '已完成' },
        [RepairStatus.CANCELLED]: { type: 'danger', text: '已取消' }
      }
      const status = statusMap[row.status] || { type: 'info', text: '未知' }
      return <el-tag type={status.type}>{status.text}</el-tag>
    }
  },
  {
    prop: 'priority',
    label: '优先级',
    enum: RepairPriorityMap,
    search: {
      el: 'select',
      props: {
        placeholder: '请选择优先级'
      }
    },
    render: ({ row }: { row: RepairItemInterface }) => {
      const priorityMap = {
        [RepairPriority.LOW]: { type: 'info', text: '低' },
        [RepairPriority.MEDIUM]: { type: 'warning', text: '中' },
        [RepairPriority.HIGH]: { type: 'danger', text: '高' }
      }
      const priority = priorityMap[row.priority] || { type: 'info', text: '未知' }
      return <el-tag type={priority.type}>{priority.text}</el-tag>
    }
  },
  { prop: 'appointmentTime', label: '预约时间' },
  { prop: 'createTime', label: '提交时间' },
  { prop: 'handlerName', label: '处理人' },
  { prop: 'latestProgress', label: '最新进度' },
  { prop: 'operation', label: '操作', fixed: 'right', width: 320 }
]

// 数据回调，处理分页参数
const dataCallback = (res: any) => {
  return {
    list: res.records,
    total: res.total,
    pageNum: res.current,
    pageSize: res.size
  }
}

// 弹窗控制
const detailVisible = ref(false)
const assignVisible = ref(false)
const progressVisible = ref(false)
const currentRepairId = ref<number | string>('')
const currentRepairData = ref<RepairItemInterface | null>(null)

// 查看详情
const viewDetail = (row: RepairItemInterface) => {
  currentRepairId.value = row.id
  detailVisible.value = true
}

// 指派处理
const assignRepair = (row: RepairItemInterface) => {
  currentRepairId.value = row.id
  currentRepairData.value = row
  assignVisible.value = true
}

// 新增进度
const addProgress = (row: RepairItemInterface) => {
  currentRepairId.value = row.id
  currentRepairData.value = row
  progressVisible.value = true
}

// 取消报修
const cancelRepair = (row: RepairItemInterface) => {
  ElMessageBox.confirm('确认取消该报修单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateRepairStatus(row.id, RepairStatus.CANCELLED)
      ElMessage.success('取消成功')
      proTable.value?.getTableList()
    } catch (error) {
      ElMessage.error('取消失败')
    }
  })
}

// 刷新表格
const refreshTable = () => {
  proTable.value?.getTableList()
}
</script>

<style scoped lang="scss">
/* 操作按钮样式优化 */
:deep(.el-table .el-table__cell .el-button) {
  margin-right: 8px;
  padding: 5px 8px;
}

:deep(.el-table .el-table__cell .el-button:last-child) {
  margin-right: 0;
}
</style>