<template>
  <el-dialog
    v-model="innerVisible"
    title="支付订单详情"
    width="720px"
    destroy-on-close
    :before-close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">
          {{ detail.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="statusTagType">{{ statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="租客姓名">
          {{ detail.tenantName }}
        </el-descriptions-item>
        <el-descriptions-item label="租客手机">
          {{ detail.tenantPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="公寓名称">
          {{ detail.apartmentName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="房间号">
          {{ detail.roomNumber || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="订单标题" :span="2">
          {{ detail.subject }}
        </el-descriptions-item>
        <el-descriptions-item label="支付金额">
          ￥{{ detail.amountTotal?.toFixed?.(2) ?? detail.amountTotal }}
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <el-tag v-if="detail.payMethod != null" type="info" size="small">
            {{
              getLabelByValue(PayMethodCombinationMap, detail.payMethod) || '-'
            }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="余额支付">
          ￥{{ formatAmount(detail.balanceAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="微信支付">
          ￥{{ formatAmount(detail.wechatAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="退款状态">
          <el-tag
            v-if="detail.refundStatus != null"
            :type="refundStatusTagType"
            size="small"
          >
            {{ getLabelByValue(RefundStatusMap, detail.refundStatus) || '-' }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="已退款金额">
          ￥{{ formatAmount(detail.refundedAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="支付渠道">
          {{ detail.payChannel }}
        </el-descriptions-item>
        <el-descriptions-item label="租约状态">
          {{ leaseStatusText }}
        </el-descriptions-item>
        <el-descriptions-item label="租金">
          ￥{{ formatAmount(detail.rent) }}
        </el-descriptions-item>
        <el-descriptions-item label="押金">
          ￥{{ formatAmount(detail.deposit) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ detail.createTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="支付成功时间">
          {{ detail.successTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-row :gutter="16">
        <el-col :span="12">
          <el-card shadow="never" class="link-card">
            <template #header>H5 支付链接</template>
            <el-link
              v-if="detail.h5Url"
              :href="detail.h5Url"
              target="_blank"
              type="primary"
            >
              {{ detail.h5Url }}
            </el-link>
            <span v-else>暂无链接</span>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="link-card">
            <template #header>二维码展示</template>
            <div class="qrcode-wrapper" v-if="detail.codeUrl">
              <el-image
                :src="detail.codeUrl"
                fit="contain"
                :preview-src-list="[detail.codeUrl]"
              >
                <template #error>
                  <el-empty description="二维码加载失败" />
                </template>
              </el-image>
            </div>
            <span v-else>暂无二维码</span>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getPaymentOrderDetail } from '@/api/payment'
import type { PaymentOrderDetail } from '@/api/payment/types'
import {
  PaymentStatus,
  PaymentStatusMap,
  PayMethodCombinationMap,
  RefundStatusMap,
  getLabelByValue,
  AgreementStatusMap,
} from '@/enums/constEnums'

interface Props {
  modelValue: boolean
  orderId?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const innerVisible = ref(false)
const loading = ref(false)
const detail = ref<PaymentOrderDetail>({
  id: 0,
  orderNo: '',
  leaseAgreementId: 0,
  tenantName: '',
  tenantPhone: '',
  subject: '',
  amountTotal: 0,
  status: PaymentStatus.WAITING,
  payChannel: '',
  successTime: '',
  createTime: '',
  h5Url: '',
  codeUrl: '',
  leaseStatus: 0,
  rent: 0,
  deposit: 0,
  apartmentName: '',
  roomNumber: '',
})

/**
 * @description 金额格式化函数
 */
const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '-'
  const value = Number(amount)
  if (Number.isNaN(value)) return '-'
  return value.toFixed(2)
}

/**
 * @description 计算支付状态展示文本
 */
const statusText = computed(() => {
  return getLabelByValue(PaymentStatusMap, detail.value.status) || '未知状态'
})

/**
 * @description 计算状态标签类型
 */
const statusTagType = computed(() => {
  switch (detail.value.status) {
    case PaymentStatus.SUCCESS:
      return 'success'
    case PaymentStatus.CLOSED:
      return 'info'
    case PaymentStatus.REFUNDED:
      return 'warning'
    default:
      return 'primary'
  }
})

/**
 * @description 计算租约状态文本
 */
const leaseStatusText = computed(() => {
  return (
    getLabelByValue(AgreementStatusMap, detail.value.leaseStatus) || '未知状态'
  )
})

/**
 * @description 计算退款状态标签类型
 */
const refundStatusTagType = computed(() => {
  switch (detail.value.refundStatus) {
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
})

/**
 * @description 关闭弹窗
 */
const handleClose = () => {
  emit('update:modelValue', false)
}

/**
 * @description 根据订单ID查询详情
 */
const fetchDetail = async (id: number) => {
  try {
    loading.value = true
    const { data } = await getPaymentOrderDetail(id)
    detail.value = data
  } catch (error) {
    ElMessage.error('获取支付订单详情失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (visible) => {
    innerVisible.value = visible
    if (visible && props.orderId) {
      fetchDetail(props.orderId)
    }
  },
  { immediate: true },
)

watch(
  () => props.orderId,
  (orderId) => {
    if (innerVisible.value && orderId) {
      fetchDetail(orderId)
    }
  },
)
</script>

<style scoped lang="scss">
.link-card {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.qrcode-wrapper {
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.dialog-footer {
  display: inline-flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
