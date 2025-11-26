<template>
  <div class="home container">
    <el-card shadow="hover">
      <div class="page-header">
        <el-avatar :size="60" :src="userInfo.avatarUrl || logoPng" />
        <div class="page-header-tip">
          <p class="page-header-tip-title">
            {{ timeFix() }}{{ userInfo?.name }}，{{ welcome() }}
          </p>
          <p class="page-header-tip-desc">
            {{ getEnvByName('VITE_APP_TITLE') }}
          </p>
        </div>
      </div>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="data-statistics">
      <el-col :span="6">
        <el-card class="statistic-card">
          <div class="statistic-item">
            <div class="statistic-title">公寓总数</div>
            <div class="statistic-value">{{ statistics.apartmentCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="statistic-card">
          <div class="statistic-item">
            <div class="statistic-title">房间总数</div>
            <div class="statistic-value">{{ statistics.roomCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="statistic-card">
          <div class="statistic-item">
            <div class="statistic-title">预约总数</div>
            <div class="statistic-value">{{ statistics.appointmentCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="statistic-card">
          <div class="statistic-item">
            <div class="statistic-title">租约总数</div>
            <div class="statistic-value">{{ statistics.agreementCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-container">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>公寓分布统计</span>
            </div>
          </template>
          <v-chart class="chart" :option="apartmentChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>房间状态统计</span>
            </div>
          </template>
          <v-chart class="chart" :option="roomChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-container">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>预约趋势分析</span>
            </div>
          </template>
          <v-chart class="chart" :option="appointmentChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>租约状态统计</span>
            </div>
          </template>
          <v-chart class="chart" :option="agreementChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { timeFix, welcome } from '@/utils/index'
import { getEnvByName } from '@/utils/getEnv'
import logoPng from '@/assets/images/logo.png'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getApartmentList, getRoomList } from '@/api/apartmentManagement'
import {
  getAppointmentInfoList,
  getAgreementInfoList,
} from '@/api/rentManagement'

// 注册 echarts 组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const userStore = useUserStore()
const userInfo = userStore.userInfo

// 数据统计
const statistics = ref({
  apartmentCount: 0,
  roomCount: 0,
  appointmentCount: 0,
  agreementCount: 0,
})

// 公寓分布图表配置
const apartmentChartOption = ref({
  title: {
    text: '',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  legend: {
    show: false,
  },
  series: [
    {
      name: '公寓数量',
      type: 'pie',
      radius: '50%',
      data: [] as { value: number; name: string }[],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}: {d}%',
        overflow: 'break',
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10,
      },
    },
  ],
})

// 房间状态图表配置
const roomChartOption = ref({
  title: {
    text: '房间状态统计',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      name: '房间数量',
      type: 'pie',
      radius: '50%',
      data: [] as { value: number; name: string }[],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
})

// 预约趋势图表配置
const appointmentChartOption = ref({
  title: {
    text: '预约趋势分析',
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: [] as string[],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '预约数量',
      type: 'line',
      data: [] as number[],
      smooth: true,
    },
  ],
})

// 租约状态图表配置
const agreementChartOption = ref({
  title: {
    text: '租约状态统计',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      name: '租约数量',
      type: 'pie',
      radius: '50%',
      data: [] as { value: number; name: string }[],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
})

// 获取统计数据
const fetchStatisticsData = async () => {
  try {
    // 获取公寓数据
    const apartmentRes = await getApartmentList({ pageNum: 1, pageSize: 1000 })
    statistics.value.apartmentCount = apartmentRes.data.total

    // 获取房间数据
    const roomRes = await getRoomList({ pageNum: 1, pageSize: 1000 })
    statistics.value.roomCount = roomRes.data.total

    // 获取预约数据
    const appointmentRes = await getAppointmentInfoList({
      pageNum: 1,
      pageSize: 1000,
    })
    statistics.value.appointmentCount = appointmentRes.data.total

    // 获取租约数据
    const agreementRes = await getAgreementInfoList({
      pageNum: 1,
      pageSize: 1000,
    })
    statistics.value.agreementCount = agreementRes.data.total

    // 处理图表数据
    processApartmentData(apartmentRes.data.records)
    processRoomData(roomRes.data.records)
    processAppointmentData(appointmentRes.data.records)
    processAgreementData(agreementRes.data.records)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 处理公寓分布数据（按省份统计）
const processApartmentData = (apartments: any[]) => {
  const provinceCount: Record<string, number> = {}

  apartments.forEach((apartment) => {
    const province = apartment.provinceName
    provinceCount[province] = (provinceCount[province] || 0) + 1
  })

  apartmentChartOption.value.series[0].data = Object.keys(provinceCount).map(
    (province) => ({
      value: provinceCount[province],
      name: province,
    }),
  )
}

// 处理房间状态数据
const processRoomData = (rooms: any[]) => {
  const statusCount: Record<string, number> = {
    已发布: 0,
    未发布: 0,
  }

  rooms.forEach((room) => {
    if (room.isRelease === 1) {
      statusCount['已发布']++
    } else {
      statusCount['未发布']++
    }
  })

  roomChartOption.value.series[0].data = Object.keys(statusCount).map(
    (status) => ({
      value: statusCount[status],
      name: status,
    }),
  )
}

// 处理预约趋势数据
const processAppointmentData = (appointments: any[]) => {
  // 简化处理：按日期统计近7天的预约数量
  const dateCount: Record<string, number> = {}
  const today = new Date()

  // 初始化近7天的数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getMonth() + 1}-${date.getDate()}`
    dateCount[dateStr] = 0
  }

  appointments.forEach((appointment) => {
    const appointmentDate = new Date(appointment.appointmentTime)
    const dateStr = `${
      appointmentDate.getMonth() + 1
    }-${appointmentDate.getDate()}`
    if (dateCount.hasOwnProperty(dateStr)) {
      dateCount[dateStr]++
    }
  })

  appointmentChartOption.value.xAxis.data = Object.keys(dateCount)
  appointmentChartOption.value.series[0].data = Object.values(dateCount)
}

// 处理租约状态数据
const processAgreementData = (agreements: any[]) => {
  // 根据后端API返回的数据，租约状态包含以下7种类型：
  // 1-签约待确认，2-已签约，3-已取消，4-已到期，5-退租待确认，6-已退租，7-续约待确认
  const statusCount: Record<string, number> = {
    签约待确认: 0,
    已签约: 0,
    已取消: 0,
    已到期: 0,
    退租待确认: 0,
    已退租: 0,
    续约待确认: 0,
  }

  agreements.forEach((agreement) => {
    // 根据后端API返回的状态值进行分类统计
    switch (agreement.status) {
      case 1:
        statusCount['签约待确认']++
        break
      case 2:
        statusCount['已签约']++
        break
      case 3:
        statusCount['已取消']++
        break
      case 4:
        statusCount['已到期']++
        break
      case 5:
        statusCount['退租待确认']++
        break
      case 6:
        statusCount['已退租']++
        break
      case 7:
        statusCount['续约待确认']++
        break
      default:
        // 对于未知状态，默认归类为已取消
        statusCount['已取消']++
        break
    }
  })

  agreementChartOption.value.series[0].data = Object.keys(statusCount).map(
    (status) => ({
      value: statusCount[status],
      name: status,
    }),
  )
}

onMounted(() => {
  fetchStatisticsData()
})
</script>

<style scoped lang="scss">
.home {
  height: 100%;
  padding: 20px;

  .page-header {
    display: flex;
    align-items: center;

    .page-header-tip {
      flex: 1;
      margin-left: 20px;
    }

    .page-header-tip-title {
      margin-bottom: 12px;
      font-size: 20px;
      font-weight: 700;
      color: #333; // 深色文字
    }

    .page-header-tip-desc {
      min-height: 20px;
      font-size: 14px;
      color: $base-menu-color;
    }
  }

  .data-statistics {
    margin-top: 20px;

    .statistic-card {
      height: 120px;

      .statistic-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;

        .statistic-title {
          font-size: 16px;
          color: #333; // 深色文字
          margin-bottom: 10px;
        }

        .statistic-value {
          font-size: 24px;
          font-weight: bold;
          color: #409eff; // 蓝色
        }
      }
    }
  }

  .chart-container {
    margin-top: 20px;

    .chart-card {
      height: 400px;

      .card-header {
        font-weight: bold;
        font-size: 16px;
      }

      .chart {
        height: 300px;
      }
    }
  }

  // 修改卡片样式以适应白色背景
  :deep(.el-card) {
    background-color: $base-color-white !important;
    border-color: #e8e8e8 !important;
    color: #333 !important;
  }

  // 修改头像样式
  :deep(.el-avatar) {
    border: 2px solid $base-color-default !important;
  }
}
</style>