<template>
  <el-form :model="filter" inline label-width="90px" class="filter-form">
    <el-form-item label="订单编号">
      <el-input
        v-model.trim="filter.orderNo"
        placeholder="请输入订单编号"
        clearable
        style="width: 220px"
      />
    </el-form-item>
    <el-form-item label="租客姓名">
      <el-input
        v-model.trim="filter.tenantName"
        placeholder="请输入租客姓名"
        clearable
        style="width: 180px"
      />
    </el-form-item>
    <el-form-item label="租客手机">
      <el-input
        v-model.trim="filter.tenantPhone"
        placeholder="请输入租客手机号"
        clearable
        style="width: 180px"
      />
    </el-form-item>
    <el-form-item label="支付状态">
      <el-select
        v-model="filter.status"
        placeholder="请选择支付状态"
        clearable
        style="width: 180px"
      >
        <el-option
          v-for="item in PaymentStatusMap"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="创建时间">
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD HH:mm:ss"
        :shortcuts="rangeShortcuts"
        style="width: 360px"
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">查询</el-button>
      <el-button @click="onReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PaymentStatusMap, PaymentStatus } from '@/enums/constEnums'

interface FilterModel {
  orderNo?: string
  tenantName?: string
  tenantPhone?: string
  status?: PaymentStatus | ''
  beginTime?: string
  endTime?: string
}

interface Emits {
  (e: 'update', value: FilterModel): void
}

const props = defineProps<{ modelValue: FilterModel }>()
const emit = defineEmits<Emits>()

const filter = ref<FilterModel>({ ...props.modelValue })
const dateRange = ref<[string, string] | undefined>(
  props.modelValue.beginTime && props.modelValue.endTime
    ? [props.modelValue.beginTime, props.modelValue.endTime]
    : undefined,
)

const rangeShortcuts = [
  {
    text: '今日',
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return [start, end]
    },
  },
  {
    text: '近7日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return [start, end]
    },
  },
]

watch(
  () => props.modelValue,
  newVal => {
    filter.value = { ...newVal }
    dateRange.value =
      newVal.beginTime && newVal.endTime
        ? [newVal.beginTime, newVal.endTime]
        : undefined
  },
)

const parsedFilter = computed(() => {
  const { beginTime, endTime, ...rest } = filter.value
  return {
    ...rest,
    beginTime: dateRange.value?.[0],
    endTime: dateRange.value?.[1],
  }
})

const onSubmit = () => {
  emit('update', parsedFilter.value)
}

const onReset = () => {
  filter.value = {}
  dateRange.value = undefined
  emit('update', {})
}
</script>

<style scoped lang="scss">
.filter-form {
  margin-bottom: 12px;
  .el-form-item {
    margin-right: 24px;
    margin-bottom: 12px;
  }
}
</style>
