import http from '@/utils/http'
import {
  TenantProfileQueryParams,
  TenantProfileItem,
  TenantProfileDetail,
} from '@/api/tenantProfile/types'
import { PageRes } from '@/api/types'

/**
 * @description 分页查询租户画像监控
 * @param params
 */
export function getTenantProfilePage(params: TenantProfileQueryParams) {
  return http.get<PageRes<TenantProfileItem[]>>(`/admin/profile/tenant/page`, {
    current: params.current,
    size: params.size,
    phone: params.phone,
    nickname: params.nickname,
    activityLevelTag: params.activityLevelTag,
    intentionTag: params.intentionTag,
    valueLevelTag: params.valueLevelTag,
    paymentBehaviorTag: params.paymentBehaviorTag,
    dataDateStart: params.dataDateStart,
    dataDateEnd: params.dataDateEnd,
  }).then(res => {
    // 确保返回的数据结构符合前端期望
    if (res.data && res.data.records) {
      return {
        ...res,
        data: {
          ...res.data,
          list: res.data.records,
          total: res.data.total,
          current: res.data.current,
          size: res.data.size,
          pages: res.data.pages
        }
      };
    }
    return res;
  });
}

/**
 * @description 获取租户画像监控详情
 * @param userId
 */
export function getTenantProfileDetail(userId: number) {
  return http.get<TenantProfileDetail>(`/admin/profile/tenant/detail`, {
    userId,
  })
}