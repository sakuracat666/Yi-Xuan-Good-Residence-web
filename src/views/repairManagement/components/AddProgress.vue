<template>
  <el-dialog
    v-model="visible"
    title="新增进度"
    width="50%"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="目标状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择目标状态"
          style="width: 100%"
        >
          <el-option 
            v-for="item in statusOptions" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value" 
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="进度描述" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请输入进度描述"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { addRepairProgress } from '@/api/repair'
import type { RepairProgressSubmitInterface } from '@/api/repair/types'
import { RepairStatus, RepairStatusMap } from '@/enums/constEnums'

interface Props {
  visible: boolean
  repairId: number | string
  repairData?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗可见性
const visible = ref(false)
// 表单引用
const formRef = ref<FormInstance>()
// 加载状态
const loading = ref(false)

// 表单数据
const form = reactive<RepairProgressSubmitInterface>({
  status: '',
  content: ''
})

// 状态选项，根据当前状态动态生成
const statusOptions = computed(() => {
  const currentStatus = props.repairData?.status || ''
  
  // 根据当前状态过滤选项
  if (currentStatus === RepairStatus.PENDING) {
    // 待处理状态可以转为处理中、已取消
    return RepairStatusMap.filter(item => 
      item.value === RepairStatus.PROCESSING || 
      item.value === RepairStatus.CANCELLED
    )
  } else if (currentStatus === RepairStatus.PROCESSING) {
    // 处理中状态可以转为已完成、已取消
    return RepairStatusMap.filter(item => 
      item.value === RepairStatus.COMPLETED || 
      item.value === RepairStatus.CANCELLED
    )
  }
  
  // 默认返回所有状态
  return RepairStatusMap
})

// 表单验证规则
const rules: FormRules = {
  status: [
    { required: true, message: '请选择目标状态', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入进度描述', trigger: 'blur' }
  ]
}

/**
 * @description 重置新增进度表单
 */
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.status = ''
  form.content = ''
}

// 监听父组件传递的visible属性
watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      resetForm()
    }
  },
  { immediate: true }
)

// 监听状态变化，如果是完成或取消状态，添加确认提示
watch(
  () => form.status,
  (newStatus) => {
    if (newStatus === RepairStatus.COMPLETED || newStatus === RepairStatus.CANCELLED) {
      const statusText = newStatus === RepairStatus.COMPLETED ? '完成' : '取消'
      ElMessageBox.confirm(
        `确认将状态更改为"${statusText}"吗？此操作不可撤销。`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(() => {
        form.status = ''
      })
    }
  }
)

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 如果是完成或取消状态，再次确认
    if (form.status === RepairStatus.COMPLETED || form.status === RepairStatus.CANCELLED) {
      const statusText = form.status === RepairStatus.COMPLETED ? '完成' : '取消'
      try {
        await ElMessageBox.confirm(
          `确认将状态更改为"${statusText}"吗？此操作不可撤销。`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch {
        return // 用户取消操作
      }
    }
    
    loading.value = true
    
    await addRepairProgress(props.repairId, form)
    ElMessage.success('新增进度成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('新增进度失败:', error)
    ElMessage.error('新增进度失败')
  } finally {
    loading.value = false
  }
}
</script>