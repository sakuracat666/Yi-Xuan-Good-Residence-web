<template>
  <el-dialog
    v-model="visible"
    title="指派报修"
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
      <el-form-item label="处理人" prop="handlerId">
        <el-select
          v-model="form.handlerId"
          placeholder="请选择处理人"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="item in handlerList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="预约时间" prop="appointmentTime">
        <el-date-picker
          v-model="form.appointmentTime"
          type="datetime"
          placeholder="请选择预约上门时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="优先级" prop="priority">
        <el-select
          v-model="form.priority"
          placeholder="请选择优先级"
          style="width: 100%"
        >
          <el-option
            v-for="item in priorityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
      
      <el-form-item label="进度描述" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="3"
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
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { assignRepair } from '@/api/repair'
import { RepairAssignInterface, RepairPriorityEnum } from '@/api/repair/types'
import { RepairPriority, RepairPriorityMap } from '@/enums/constEnums'

interface Props {
  visible: boolean
  repairId: number | string
  repairData?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'refresh'): void
}

// 模拟处理人列表数据，实际项目中应该从API获取
const handlerList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗可见性
const visible = ref(false)
// 表单引用
const formRef = ref<FormInstance>()
// 加载状态
const loading = ref(false)

// 表单数据
const form = reactive<RepairAssignInterface>({
  handlerId: 1,
  appointmentTime: '',
  priority: RepairPriority.MEDIUM,
  remark: '',
  content: '管理员指派报修'
})

// 优先级选项
const priorityOptions = RepairPriorityMap

// 表单验证规则
const rules: FormRules = {
  handlerId: [
    { required: true, message: '请选择处理人', trigger: 'change' }
  ],
  appointmentTime: [
    { required: false, message: '请选择预约时间', trigger: 'change' }
  ],
  priority: [
    { required: false, message: '请选择优先级', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入进度描述', trigger: 'blur' }
  ]
}

// 监听父组件传递的visible属性
watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 如果有传入的报修数据，则设置默认值
      if (props.repairData) {
        const { priority, handlerId } = props.repairData
        form.priority = priority ? String(priority) : RepairPriority.MEDIUM
        form.handlerId = handlerId ?? 1
      }
    } else {
      // 重置表单
      resetForm()
    }
  },
  { immediate: true }
)

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.handlerId = 1
  form.appointmentTime = ''
  form.priority = RepairPriority.MEDIUM
  form.remark = ''
  form.content = '管理员指派报修'
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await assignRepair(props.repairId, form)
    ElMessage.success('指派成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('指派失败:', error)
    ElMessage.error('指派失败')
  } finally {
    loading.value = false
  }
}
</script>