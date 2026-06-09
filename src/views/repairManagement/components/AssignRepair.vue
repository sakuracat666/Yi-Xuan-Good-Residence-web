<template>
  <el-dialog
    v-model="visible"
    title="指派报修"
    width="50%"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="处理人" prop="handlerId">
        <el-select
          v-model="form.handlerId"
          placeholder="请选择处理人"
          style="width: 100%"
          clearable
          :loading="handlerLoading"
        >
          <el-option
            v-for="item in handlerList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="用户预约时间">
        <el-input
          v-model="form.appointmentTime"
          placeholder="用户未填写预约时间"
          disabled
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
import { getSysPostList, getSysUserList } from '@/api/system'

interface Props {
  visible: boolean
  repairId: number | string
  repairData?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'refresh'): void
}

const handlerList = ref<{ id: number; name: string }[]>([])
const handlerLoading = ref(false)

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
  handlerId: undefined,
  appointmentTime: '',
  priority: RepairPriority.MEDIUM,
  remark: '',
  content: '管理员指派报修',
})

// 优先级选项
const priorityOptions = RepairPriorityMap

// 表单验证规则
const rules: FormRules = {
  handlerId: [{ required: true, message: '请选择处理人', trigger: 'change' }],
  priority: [{ required: false, message: '请选择优先级', trigger: 'change' }],
  content: [{ required: true, message: '请输入进度描述', trigger: 'blur' }],
}

const fetchHandlerList = async () => {
  handlerLoading.value = true
  try {
    const { data: posts } = await getSysPostList()
    const employeePost =
      posts.find((p) => p.postCode === 'EMPLOYEE') ||
      posts.find((p) => p.name === '员工')
    if (!employeePost?.id) {
      handlerList.value = []
      form.handlerId = undefined
      ElMessage.warning(
        '未找到“员工”岗位，请先在岗位管理中创建岗位并命名为“员工”',
      )
      return
    }

    const { data: page } = await getSysUserList({
      pageNum: 1,
      pageSize: 1000,
      postId: employeePost.id,
    })

    const records = Array.isArray(page?.records) ? page.records : []
    handlerList.value = records
      .filter((item) => item.id && item.name)
      .map((item) => ({
        id: item.id as number,
        name: item.phone
          ? `${item.name}（${item.phone}）`
          : (item.name as string),
      }))

    const exists = handlerList.value.some(
      (item) => item.id === (form.handlerId as any),
    )
    if (!exists) {
      form.handlerId = handlerList.value.length
        ? handlerList.value[0].id
        : undefined
    }
  } catch (error) {
    console.error('加载处理人列表失败:', error)
    handlerList.value = []
    form.handlerId = undefined
    ElMessage.error('加载处理人列表失败')
  } finally {
    handlerLoading.value = false
  }
}

// 监听父组件传递的visible属性
watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      fetchHandlerList()
      // 如果有传入的报修数据，则设置默认值
      if (props.repairData) {
        const { priority, handlerId, appointmentTime } = props.repairData
        form.priority = priority ? String(priority) : RepairPriority.MEDIUM
        form.handlerId = handlerId ?? undefined
        form.appointmentTime = appointmentTime || ''
      }
    } else {
      // 重置表单
      resetForm()
    }
  },
  { immediate: true },
)

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.handlerId = undefined
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

    const submitData: any = { ...form }
    delete submitData.appointmentTime
    await assignRepair(props.repairId, submitData)
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
