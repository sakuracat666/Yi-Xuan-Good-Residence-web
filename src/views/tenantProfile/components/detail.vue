<template>
  <el-drawer
    v-model="visible"
    title="租户画像监控详情"
    direction="rtl"
    size="50%"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="tenant-profile-detail">
      <el-empty v-if="!profileData && !loading" description="暂无数据" />

      <div v-if="profileData" class="detail-content">
        <!-- 基础信息 -->
        <el-card class="detail-card" header="基础信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">
              {{ profileData.userId }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ profileData.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ profileData.nickname }}
            </el-descriptions-item>
            <el-descriptions-item label="合同ID">
              {{ profileData.agreementId }}
            </el-descriptions-item>
            <el-descriptions-item label="公寓ID">
              {{ profileData.apartmentId }}
            </el-descriptions-item>
            <el-descriptions-item label="房间ID">
              {{ profileData.roomId }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 租期与费用 -->
        <el-card class="detail-card" header="租期与费用">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="租期开始">
              {{ profileData.leaseStartDate }}
            </el-descriptions-item>
            <el-descriptions-item label="租期结束">
              {{ profileData.leaseEndDate }}
            </el-descriptions-item>
            <el-descriptions-item label="租期(月)">
              {{ profileData.leaseTermMonths }}
            </el-descriptions-item>
            <el-descriptions-item label="付款方式ID">
              {{ profileData.paymentTypeId }}
            </el-descriptions-item>
            <el-descriptions-item label="月租金">
              ¥{{ profileData.rentAmount.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="押金">
              ¥{{ profileData.depositAmount.toFixed(2) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 行为指标 -->
        <el-card class="detail-card" header="行为指标">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="近30天浏览次数">
              {{ profileData.browseCnt30d }}
            </el-descriptions-item>
            <el-descriptions-item label="最近浏览时间">
              {{ formatDateTime(profileData.lastBrowseTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="近30天预约次数">
              {{ profileData.appointmentCnt30d }}
            </el-descriptions-item>
            <el-descriptions-item label="最近预约时间">
              {{ formatDateTime(profileData.lastAppointmentTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 标签信息 -->
        <el-card class="detail-card" header="标签信息">
          <div class="tag-container">
            <div class="tag-item">
              <span class="tag-label">活跃度标签：</span>
              <el-tag
                :type="getTagType(profileData.activityLevelTag, 'activity')"
              >
                {{ profileData.activityLevelTag }}
              </el-tag>
            </div>
            <div class="tag-item">
              <span class="tag-label">意向标签：</span>
              <el-tag :type="getTagType(profileData.intentionTag, 'intention')">
                {{ profileData.intentionTag }}
              </el-tag>
            </div>
            <div class="tag-item">
              <span class="tag-label">价值标签：</span>
              <el-tag :type="getTagType(profileData.valueLevelTag, 'value')">
                {{ profileData.valueLevelTag }}
              </el-tag>
            </div>
            <div class="tag-item">
              <span class="tag-label">付款行为标签：</span>
              <el-tag
                :type="getTagType(profileData.paymentBehaviorTag, 'payment')"
              >
                {{ profileData.paymentBehaviorTag }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 数据信息 -->
        <el-card class="detail-card" header="数据信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="数据日期">
              {{ profileData.dataDate }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(profileData.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDateTime(profileData.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getTenantProfileDetail } from '@/api/tenantProfile'
import { TenantProfileDetail } from '@/api/tenantProfile/types'

// 定义组件属性
interface Props {
  modelValue: boolean
  userId: number
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 控制抽屉显示
const visible = ref(false)
const loading = ref(false)
const profileData = ref<TenantProfileDetail | null>(null)

// 监听显示状态变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal && props.userId) {
      fetchProfileDetail()
    }
  },
  { immediate: true },
)

// 监听userId变化
watch(
  () => props.userId,
  (newUserId) => {
    if (newUserId && visible.value) {
      fetchProfileDetail()
    }
  },
)

// 获取租户画像监控详情
const fetchProfileDetail = async () => {
  if (!props.userId) return

  loading.value = true
  try {
    const res = await getTenantProfileDetail(props.userId)
    profileData.value = res.data
  } catch (error) {
    console.error('获取租户画像监控详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  emit('update:modelValue', false)
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString()
}

// 获取标签类型
const getTagType = (tag: string, type: string) => {
  switch (type) {
    case 'activity':
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
    case 'intention':
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
    case 'value':
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
    case 'payment':
      switch (tag) {
        case '准时支付':
          return 'success'
        default:
          return ''
      }
    default:
      return ''
  }
}
</script>

<style scoped>
.tenant-profile-detail {
  padding: 0 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  margin-bottom: 16px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-label {
  font-weight: bold;
  min-width: 100px;
}
</style>