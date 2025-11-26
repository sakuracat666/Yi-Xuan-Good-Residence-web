import { resultSuccess } from './_utils'
import { RepairDetailInterface } from '@/api/repair/types'

// 模拟报修详情数据
const mockRepairDetail: RepairDetailInterface = {
  id: 1,
  userName: '张三',
  userPhone: '13800138000',
  apartmentName: '阳光公寓',
  roomNumber: 'A栋101',
  title: '空调故障',
  description: '空调不制冷，需要维修',
  priority: '2',
  status: '1',
  appointmentTime: '2023-07-15 14:00',
  contactPhone: '13800138000',
  handlerName: '',
  finishTime: '',
  remark: '用户希望尽快处理',
  createTime: '2023-07-14 10:30',
  attachments: [
    {
      url: 'https://example.com/image1.jpg',
      type: 'image/jpeg'
    }
  ],
  progresses: [
    {
      id: 1,
      status: '1',
      content: '用户提交报修申请',
      operatorRole: '租客',
      operatorName: '张三',
      createTime: '2023-07-14 10:30'
    }
  ]
}

export default [
  // 获取报修详情
  {
    url: '/mock/admin/repair/1',
    method: 'get',
    response: () => {
      console.log('Mock API: 获取报修详情')
      return resultSuccess(mockRepairDetail)
    },
  },
]