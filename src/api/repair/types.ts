import { ReqPage } from '@/api/types'
import { RepairStatus, RepairPriority } from '@/enums/constEnums'

// 报修列表查询参数
export interface RepairListQueryInterface extends ReqPage {
  // 报修标题
  title?: string
  // 租客手机号
  userPhone?: string
  // 公寓名称
  apartmentName?: string
  // 报修状态 1-待处理 2-处理中 3-已完成 4-已取消
  status?: string
  // 报修优先级 1-低 2-中 3-高
  priority?: string
  // 处理人ID
  handlerId?: string
  // 创建开始时间
  createTimeBegin?: string
  // 创建结束时间
  createTimeEnd?: string
}

// 报修列表项
export interface RepairItemInterface {
  // 报修单ID
  id: number
  // 报修标题
  title: string
  // 租客姓名
  userName: string
  // 租客手机号
  userPhone: string
  // 房间号
  roomNumber: string
  // 公寓名称
  apartmentName: string
  // 优先级 1-低 2-中 3-高
  priority: string
  // 状态 1-待处理 2-处理中 3-已完成 4-已取消
  status: string
  // 预约时间
  appointmentTime: string
  // 提交时间
  createTime: string
  // 处理人姓名
  handlerName: string
  // 最新进度描述
  latestProgress: string
}

// 报修详情
export interface RepairDetailInterface {
  // 报修单ID
  id: number
  // 租客姓名
  userName: string
  // 租客手机号
  userPhone: string
  // 公寓名称
  apartmentName: string
  // 房间号
  roomNumber: string
  // 报修标题
  title: string
  // 报修描述
  description: string
  // 报修优先级 1-低 2-中 3-高
  priority: string
  // 报修状态 1-待处理 2-处理中 3-已完成 4-已取消
  status: string
  // 预约上门时间
  appointmentTime: string
  // 联系电话
  contactPhone: string
  // 处理人姓名
  handlerName: string
  // 完结时间
  finishTime: string
  // 备注信息
  remark: string
  // 创建时间
  createTime: string
  // 报修附件信息
  attachments: RepairAttachmentInterface[]
  // 报修进度信息
  progresses: RepairProgressInterface[]
}

// 报修附件信息
export interface RepairAttachmentInterface {
  // 附件地址
  url: string
  // 附件类型
  type: string
}

// 报修进度信息
export interface RepairProgressInterface {
  // 进度状态 1-待处理 2-处理中 3-已完成 4-已取消
  status: string
  // 进度描述
  content: string
  // 操作人角色
  operatorRole: string
  // 操作人姓名
  operatorName: string
  // 创建时间
  createTime: string
}

// 报修指派参数
export interface RepairAssignInterface {
  // 指派的处理人ID
  handlerId: number
  // 预约上门时间
  appointmentTime?: string
  // 调整后的优先级 1-低 2-中 3-高
  priority?: string
  // 备注信息
  remark?: string
  // 进度描述
  content?: string
}

// 报修进度提交参数
export interface RepairProgressSubmitInterface {
  // 报修状态 1-待处理 2-处理中 3-已完成 4-已取消
  status: string
  // 进度描述
  content: string
}

// 报修状态枚举
export { RepairStatus } from '@/enums/constEnums'

// 报修优先级枚举
export { RepairPriority } from '@/enums/constEnums'