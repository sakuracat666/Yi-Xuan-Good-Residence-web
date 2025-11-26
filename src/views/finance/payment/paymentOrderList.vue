<template>
  <el-card class="payment-order-page">
    <PaymentOrderFilterForm
      :model-value="filterModel"
      @update="handleFilterUpdate"
    />

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="tenantName" label="租客姓名" width="120" />
      <el-table-column prop="tenantPhone" label="租客手机" width="140" />
      <el-table-column prop="subject" label="订单标题" min-width="200" />
      <el-table-column label="支付金额" width="120">
        <template #default="{ row }">
          ￥{{ formatAmount(row.amountTotal) }}
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.payMethod != null" type="info" size="small">
            {{ getLabelByValue(PayMethodCombinationMap, row.payMethod) || '-' }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="余额/微信" width="140">
        <template #default="{ row }">
          <div v-if="row.balanceAmount || row.wechatAmount">
            <span v-if="row.balanceAmount">
              余额: ￥{{ formatAmount(row.balanceAmount) }}
            </span>
            <span v-if="row.balanceAmount && row.wechatAmount">/</span>
            <span v-if="row.wechatAmount">
              微信: ￥{{ formatAmount(row.wechatAmount) }}
            </span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">
            {{ getLabelByValue(PaymentStatusMap, row.status) || '未知状态' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="退款状态" width="100">
        <template #default="{ row }">
          <el-tag
            v-if="row.refundStatus != null"
            :type="refundStatusTagType(row.refundStatus)"
            size="small"
          >
            {{ getLabelByValue(RefundStatusMap, row.refundStatus) || '-' }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="payChannel" label="支付渠道" width="100" />
      <el-table-column prop="successTime" label="支付成功时间" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDetail(row)">
            查看详情
          </el-button>
          <el-button
            type="success"
            link
            :disabled="row.status !== PaymentStatus.WAITING"
            @click="markOrderPaid(row)"
          >
            标记支付成功
          </el-button>
          <el-button
            type="danger"
            link
            :disabled="row.status !== PaymentStatus.WAITING"
            @click="closeOrder(row)"
          >
            关闭订单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :current-page="pagination.pageNum"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <PaymentOrderDetail v-model="detailVisible" :order-id="currentOrderId" />
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PaymentOrderFilterForm from './components/PaymentOrderFilterForm.vue'
import PaymentOrderDetail from './PaymentOrderDetail.vue'
import {
  getPaymentOrderPage,
  closePaymentOrder,
  markPaymentOrderPaid,
} from '@/api/payment'
import type { PaymentOrderItem } from '@/api/payment/types'
import { useHandleData } from '@/hooks/useHandleData'
import {
  PaymentStatus,
  PaymentStatusMap,
  PayMethodCombinationMap,
  RefundStatusMap,
  getLabelByValue,
} from '@/enums/constEnums'

interface FilterModel {
  orderNo?: string
  tenantName?: string
  tenantPhone?: string
  status?: PaymentStatus
  beginTime?: string
  endTime?: string
}

const filterModel = ref<FilterModel>({})

const tableData = ref<PaymentOrderItem[]>([])
const loading = ref(false)
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const detailVisible = ref(false)
const currentOrderId = ref<number>()

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.00'
  const value = Number(amount)
  return Number.isNaN(value) ? '0.00' : value.toFixed(2)
}

const statusTagType = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return 'success'
    case PaymentStatus.CLOSED:
      return 'info'
    case PaymentStatus.REFUNDED:
      return 'warning'
    default:
      return 'primary'
  }
}

const refundStatusTagType = (status: number) => {
  switch (status) {
    case 0: // NONE - 无退款
      return 'info'
    case 1: // PROCESSING - 退款中
      return 'warning'
    case 2: // SUCCESS - 已退款
      return 'success'
    case 3: // FAILED - 退款失败
      return 'danger'
    default:
      return 'info'
  }
}

const fetchOrderList = async () => {
  try {
    loading.value = true
    const { data } = await getPaymentOrderPage({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...filterModel.value,
    })
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    ElMessage.error('获取支付订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilterUpdate = (model: FilterModel) => {
  filterModel.value = model
  pagination.pageNum = 1
  fetchOrderList()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchOrderList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchOrderList()
}

const openDetail = (row: PaymentOrderItem) => {
  currentOrderId.value = row.id
  detailVisible.value = true
}

const markOrderPaid = async (row: PaymentOrderItem) => {
  if (row.status !== PaymentStatus.WAITING) {
    ElMessage.warning('仅待支付状态可标记为已支付')
    return
  }
  const success = await useHandleData(
    markPaymentOrderPaid,
    row.id,
    '标记订单为已支付',
  )
  if (success) {
    fetchOrderList()
  }
}

const closeOrder = async (row: PaymentOrderItem) => {
  if (row.status !== PaymentStatus.WAITING) {
    ElMessage.warning('仅待支付状态可关闭订单')
    return
  }
  const success = await useHandleData(closePaymentOrder, row.id, '关闭支付订单')
  if (success) {
    fetchOrderList()
  }
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped lang="scss">
.payment-order-page {
  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
