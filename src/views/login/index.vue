<template>
  <div class="login-container">
    <el-alert
      v-show="false"
      :title="getEnvByName('VITE_APP_TITLE')"
      type="success"
      :closable="false"
      style="position: fixed"
    ></el-alert>
    <el-row>
      <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="14">
        <div style="color: transparent">左侧区域占位符</div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="10">
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          status-icon
          :rules="rules"
          class="login-form"
          @keyup.enter="handleEnterKeyPress"
        >
          <div class="form-header">
            <div class="title-tips">易选好寓后台管理系统</div>
            <div class="title">当前时间：</div>
            <div class="title">{{ currentTime }}</div>
          </div>
          <el-form-item prop="username">
            <el-input
              v-model.trim="ruleForm.username"
              :prefix-icon="User"
              autocomplete="off"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="ruleForm.password"
              type="password"
              show-password
              :prefix-icon="Lock"
              autocomplete="off"
              placeholder="请输入密码"
            />
          </el-form-item>
          <el-form-item prop="captchaCode">
            <el-row>
              <el-col :span="15">
                <el-input
                  v-model.trim="ruleForm.captchaCode"
                  autocomplete="off"
                  placeholder="请输入验证码"
                />
              </el-col>
              <el-col :span="8" :offset="1">
                <el-image
                  fit="contain"
                  style="height: 100%; background: white"
                  class="pointer"
                  :src="captcha.image"
                  @click="getCaptcha"
                />
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item>
            <el-button
              class="login-btn"
              type="primary"
              size="large"
              :loading="loading"
              @click="submitForm(ruleFormRef)"
            >
              登陆
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import type { FormInstance } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { HOME_URL } from '@/config/config'
import { timeFix } from '@/utils/index'
import { getCode, getUserInfo, login } from '@/api/user'
import { getEnvByName } from '@/utils/getEnv'
const router = useRouter()
const route = useRoute()
const ruleFormRef = ref<FormInstance>()
const userStore = useUserStore()
const ruleForm = reactive({
  username: 'huhao',
  password: '123456',
  captchaKey: '',
  captchaCode: '',
})
const loading = ref(false)
const validateUsername = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('用户名不能为空'))
  } else if (value.length < 4) {
    callback(new Error('用户名长度不能小于4位'))
  } else {
    callback()
  }
}

const validatePassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('密码不能为空'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  } else {
    callback()
  }
}
const validateCaptchaCode = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('验证码不能为空'))
  } else {
    callback()
  }
}
const rules = reactive({
  username: [{ required: true, validator: validateUsername }],
  password: [{ required: true, validator: validatePassword }],
  captchaCode: [{ required: true, validator: validateCaptchaCode }],
})
// 验证码数据
const captcha = ref({
  image: '',
  key: '',
})
// 获取验证码
const getCaptcha = async () => {
  try {
    const { data } = await getCode()
    captcha.value = data
    ruleForm.captchaKey = data.key
  } catch (error) {
    console.log(error)
  }
}
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      const { data } = await login(ruleForm)
      userStore.setToken(data)
      router.replace((route.query.redirect as string) || HOME_URL)

      const userInfo = await getUserInfo()
      userStore.setUserInfo(userInfo.data)

      ElNotification({
        title: `hi,${timeFix()}!`,
        message: `欢迎回来`,
        type: 'success',
      })
    } finally {
      loading.value = false
    }
  })
}

/**
 * 处理回车键按下事件，触发登录功能
 * 确保在所有主流浏览器中都能正常工作
 */
const handleEnterKeyPress = () => {
  // 防止在加载状态下重复提交
  if (loading.value) return

  // 触发登录表单提交
  submitForm(ruleFormRef.value)
}

const currentTime = ref('')
let timer: NodeJS.Timeout | null = null

// 更新时间的函数
const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  getCaptcha()
  // 初始化时间并设置定时器每秒更新
  updateTime()
  timer = setInterval(updateTime, 1000)
})

// 组件卸载前清理定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped lang="scss">
@import './index';
</style>
