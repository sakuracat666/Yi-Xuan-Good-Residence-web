import http from '@/utils/http'
import type {
  PaymentOrderDetail,
  PaymentOrderItem,
  PaymentOrderQuery,
} from '@/api/payment/types'
import type { PageRes } from '@/api/types'

/**
 * @description 查询支付订单分页数据
 */
export function getPaymentOrderPage(params: PaymentOrderQuery) {
  return http.get<PageRes<PaymentOrderItem[]>>(`/admin/payment/order/page`, {
    current: params.pageNum,
    size: params.pageSize,
    orderNo: params.orderNo,
    tenantName: params.tenantName,
    tenantPhone: params.tenantPhone,
    status: params.status,
    beginTime: params.beginTime,
    endTime: params.endTime,
  })
}

/**
 * @description 查询支付订单详情
 */
export function getPaymentOrderDetail(id: number) {
  return http.get<PaymentOrderDetail>(`/admin/payment/order/${id}`)
}

/**
 * @description 关闭支付订单
 */
export function closePaymentOrder(id: number) {
  return http.post(`/admin/payment/order/${id}/close`)
}

/**
 * @description 标记支付订单为已支付
 */
export function markPaymentOrderPaid(id: number) {
  return http.post(`/admin/payment/order/${id}/mark-paid`)
}
