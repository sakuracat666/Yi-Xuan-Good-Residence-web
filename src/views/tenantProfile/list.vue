<template>
  <el-card>
    <ProTable
      ref="proTable"
      :dataCallback="dataCallback"
      :columns="columns"
      :requestApi="getTenantProfilePage"
      :initParam="initParam"
      :stripe="true"
    ></ProTable>

    <!-- 租户画像监控详情抽屉 -->
    <TenantProfileDetail v-model="drawerVisible" :userId="currentUserId" />
  </el-card>
</template>

<script setup lang="tsx">
import { reactive, ref } from 'vue'
import { ColumnProps } from '@/components/ProTable/src/types'
import ProTable from '@/components/ProTable/src/ProTable.vue'
import { getTenantProfilePage } from '@/api/tenantProfile'
import { TenantProfileItem } from '@/api/tenantProfile/types'
import TenantProfileDetail from './components/detail.vue'

// *获取 ProTable 元素，调用其获取刷新数据方法
const proTable = ref<InstanceType<typeof ProTable>>()

// 抽屉控制
const drawerVisible = ref(false)
const currentUserId = ref<number>(0)

// *表格配置项
const columns: ColumnProps[] = [
  {
    prop: 'phone',
    label: '手机号',
    search: { el: 'input', props: { placeholder: '请输入手机号' } },
  },
  {
    prop: 'nickname',
    label: '昵称',
    search: { el: 'input', props: { placeholder: '请输入昵称' } },
  },
  {
    prop: 'activityLevelTag',
    label: '活跃度标签',
    enum: [
      { label: '高活跃', value: '高活跃' },
      { label: '中活跃', value: '中活跃' },
      { label: '低活跃', value: '低活跃' },
    ],
    search: {
      el: 'select',
      props: { placeholder: '请选择活跃度标签' },
    },
    render: ({ row }: { row: TenantProfileItem }) => {
      const getTagType = (tag: string) => {
        switch (tag) {
          case '高活跃':
            return 'success'
          case '中活跃':
            return 'warning'
          case '低活跃':
            return 'info'
          default:
            return ''
        }
      }
      return <el-tag type={getTagType(row.activityLevelTag)}>{row.activityLevelTag}</el-tag>
    },
  },
  {
    prop: 'intentionTag',
    label: '意向标签',
    enum: [
      { label: '高意向', value: '高意向' },
      { label: '中意向', value: '中意向' },
      { label: '低意向', value: '低意向' },
    ],
    search: {
      el: 'select',
      props: { placeholder: '请选择意向标签' },
    },
    render: ({ row }: { row: TenantProfileItem }) => {
      const getTagType = (tag: string) => {
        switch (tag) {
          case '高意向':
            return 'success'
          case '中意向':
            return 'warning'
          case '低意向':
            return 'info'
          default:
            return ''
        }
      }
      return <el-tag type={getTagType(row.intentionTag)}>{row.intentionTag}</el-tag>
    },
  },
  {
    prop: 'valueLevelTag',
    label: '价值标签',
    enum: [
      { label: '高价值', value: '高价值' },
      { label: '中价值', value: '中价值' },
      { label: '低价值', value: '低价值' },
    ],
    search: {
      el: 'select',
      props: { placeholder: '请选择价值标签' },
    },
    render: ({ row }: { row: TenantProfileItem }) => {
      const getTagType = (tag: string) => {
        switch (tag) {
          case '高价值':
            return 'success'
          case '中价值':
            return 'warning'
          case '低价值':
            return 'info'
          default:
            return ''
        }
      }
      return <el-tag type={getTagType(row.valueLevelTag)}>{row.valueLevelTag}</el-tag>
    },
  },
  {
    prop: 'paymentBehaviorTag',
    label: '付款行为标签',
    enum: [
      { label: '准时支付', value: '准时支付' },
    ],
    search: {
      el: 'select',
      props: { placeholder: '请选择付款行为标签' },
    },
    render: ({ row }: { row: TenantProfileItem }) => {
      const getTagType = (tag: string) => {
        switch (tag) {
          case '准时支付':
            return 'success'
          default:
            return ''
        }
      }
      return row.paymentBehaviorTag ? <el-tag type={getTagType(row.paymentBehaviorTag)}>{row.paymentBehaviorTag}</el-tag> : <span>-</span>
    },
  },
  {
    prop: 'browseCnt30d',
    label: '近30天浏览次数',
    sortable: true,
  },
  {
    prop: 'appointmentCnt30d',
    label: '近30天预约次数',
    sortable: true,
  },
  {
    prop: 'rentAmount',
    label: '月租金',
    render: ({ row }: { row: TenantProfileItem }) => {
      return row.rentAmount !== null && row.rentAmount !== undefined ? `¥${row.rentAmount.toFixed(2)}` : '-'
    },
  },
  {
    prop: 'dataDate',
    label: '数据日期',
    sortable: true,
  },
  {
    prop: 'operation',
    label: '操作',
    fixed: 'right',
    width: 150,
    render: ({ row }: { row: TenantProfileItem }) => {
      return (
        <el-button
          type="primary"
          link
          onClick={() => handleViewDetail(row.userId)}
        >
          查看详情
        </el-button>
      )
    },
  },
]

// *查询参数
const initParam = reactive({
  current: 1,
  size: 10,
})

// 处理返回的数据格式
const dataCallback = (data: any) => {
  console.log('原始数据:', data);
  const result = {
    list: data?.records || data?.list || [],
    total: data?.total || 0,
    pageNum: data?.current || data?.pageNum || 1,
    pageSize: data?.size || data?.pageSize || 10
  };
  console.log('处理后数据:', result);
  return result;
}

// 查看详情
const handleViewDetail = (userId: number) => {
  currentUserId.value = userId
  drawerVisible.value = true
}
</script>