/*
 * @Author: 朽木白
 * @Date: 2023-02-06 11:02:58
 * @LastEditors: 1547702880@@qq.com
 * @LastEditTime: 2023-03-10 15:22:05
 * @Description: 用户store
 */
import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/user'
import type { UserState } from './model/userModel'
import type { UserInfo } from '@/api/user/types'
import { RESEETSTORE } from '@/utils/reset'
import { SystemUserType } from '@/enums/constEnums'

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    token: '',
    userInfo: {} as UserInfo,
  }),
  getters: {
    /**
     * 判断当前登录用户是否为管理员
     *
     * @returns true 表示管理员，false 表示普通用户
     */
    isAdmin: (state): boolean => state.userInfo.type === SystemUserType.ADMIN,
  },
  actions: {
    // setToken
    setToken(token: string) {
      this.token = token
    },
    // setUserInfo
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
    /**
     * 拉取登录用户的最新信息
     *
     * @returns Promise<void>
     */
    async fetchUserInfo() {
      const { data } = await getUserInfo()
      this.setUserInfo(data)
    },
    async Logout() {
      // await logout()
      RESEETSTORE()
    },
  },
  // 设置为true，缓存state
  persist: true,
})
