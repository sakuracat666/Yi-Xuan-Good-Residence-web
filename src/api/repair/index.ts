import http from '@/utils/http'
import { PageRes } from '@/api/types'
import {
  RepairListQueryInterface,
  RepairItemInterface,
  RepairDetailInterface,
  RepairAssignInterface,
  RepairProgressSubmitInterface,
} from './types'

/**
 * @description 分页查询报修列表
 * @param params 查询参数
 */
export function getRepairList(params: RepairListQueryInterface) {
  return http.get<PageRes<RepairItemInterface[]>>(`/admin/repair/page`, {
    current: params.pageNum,
    size: params.pageSize,
    title: params.title,
    userPhone: params.userPhone,
    apartmentName: params.apartmentName,
    status: params.status,
    priority: params.priority,
    handlerId: params.handlerId,
    createTimeBegin: params.createTimeBegin,
    createTimeEnd: params.createTimeEnd,
  })
}

/**
 * @description 查询报修详情
 * @param id 报修单ID
 */
export function getRepairDetail(id: number | string) {
  console.log('API调用: 获取报修详情，ID:', id)
  return http.get<RepairDetailInterface>(`/admin/repair/${id}`)
}

/**
 * @description 指派报修处理人
 * @param id 报修单ID
 * @param params 指派参数
 */
export function assignRepair(id: number | string, params: RepairAssignInterface) {
  return http.post(`/admin/repair/${id}/assign`, params)
}

/**
 * @description 新增报修进度记录
 * @param id 报修单ID
 * @param params 进度参数
 */
export function addRepairProgress(id: number | string, params: RepairProgressSubmitInterface) {
  return http.post(`/admin/repair/${id}/progress`, params)
}

/**
 * @description 更新报修状态
 * @param id 报修单ID
 * @param status 报修状态 1-待处理 2-处理中 3-已完成 4-已取消
 */
export function updateRepairStatus(id: number | string, status: string) {
  return http.post(`/admin/repair/${id}/status?status=${status}`)
}