import { PaymentStatus, PayMethodCombination, RefundStatus } from '@/enums/constEnums'
import { ReqPage } from '@/api/types'

export interface PaymentOrderQuery extends ReqPage {
  orderNo?: string
  tenantName?: string
  tenantPhone?: string
  status?: PaymentStatus
  beginTime?: string
  endTime?: string
}

export interface PaymentOrderItem {
  id: number
  orderNo: string
  leaseAgreementId: number
  tenantName: string
  tenantPhone: string
  subject: string
  amountTotal: number
  balanceAmount?: number
  wechatAmount?: number
  payMethod?: PayMethodCombination
  status: PaymentStatus
  refundStatus?: RefundStatus
  payChannel: string
  successTime?: string
  createTime: string
}

export interface PaymentOrderDetail extends PaymentOrderItem {
  h5Url: string
  codeUrl: string
  refundedAmount?: number
  leaseStatus: number
  rent: number
  deposit: number
  apartmentName: string
  roomNumber: string
}
