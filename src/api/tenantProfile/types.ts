// 租户画像监控查询参数
export interface TenantProfileQueryParams {
  current: number
  size: number
  phone?: string
  nickname?: string
  activityLevelTag?: string
  intentionTag?: string
  valueLevelTag?: string
  paymentBehaviorTag?: string
  dataDateStart?: string
  dataDateEnd?: string
}

// 租户画像监控列表项
export interface TenantProfileItem {
  userId: number
  phone: string
  nickname: string
  activityLevelTag: string
  intentionTag: string
  valueLevelTag: string
  paymentBehaviorTag?: string
  browseCnt30d: number
  appointmentCnt30d: number
  rentAmount?: number
  dataDate: string
}

// 租户画像监控详情
export interface TenantProfileDetail {
  userId: number
  phone: string
  nickname: string
  agreementId: number
  apartmentId: number
  roomId: number
  leaseStartDate: string
  leaseEndDate: string
  leaseTermMonths: number
  rentAmount: number
  depositAmount: number
  paymentTypeId: number
  browseCnt30d: number
  lastBrowseTime: string
  appointmentCnt30d: number
  lastAppointmentTime: string
  activityLevelTag: string
  intentionTag: string
  valueLevelTag: string
  paymentBehaviorTag: string
  dataDate: string
  createdAt: string
  updatedAt: string
}