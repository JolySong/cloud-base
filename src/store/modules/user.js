import { defineStore } from 'pinia'
import { getUserInfo, login, logout } from '@/api/auth'
import { getToken, setToken, removeToken, getUser, setUser, del, setRedirectUrl, getRedirectUrl } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => {
    const token = getToken()
    const userInfo = getUser()
    const redirectUrl = getRedirectUrl()
    return {
      token: token || '',
      userInfo: userInfo ? JSON.parse(userInfo) : null,
      isLogin: !!token,
    }
  },

  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await login(loginForm)
        if (res.code !== 200) {
          throw new Error(res.message)
        }

        const { token, redirectUrl } = res.data
        this.token = token
        console.log('redirectUrl-->', res.data)
        setRedirectUrl(redirectUrl)
        setToken(this.token)     
        // 获取用户信息
        await this.getUserInfo()
        setUser(JSON.stringify(this.userInfo))  // 存储为 JSON 字符串
        // 设置登录状态
        this.isLogin = true
        return { success: true }
      } catch (error) {
        console.error('登录失败:', error)
        removeToken()
        return { error: error.message }
      } finally {
        del('loginForm')
      }
    },

    // 登出
    async logout() {
      try {
        await logout()
        this.token = ''
        this.userInfo = null
        this.isLogin = false
        this.redirectUrl = ''
      } catch (error) {
        throw error
      } finally {
        removeToken()
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await getUserInfo()
        const userInfo = {
          ...res.data        }
        this.userInfo = userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
  },

  getters: {
    // 是否已登录
    isAuthenticated: (state) => !!state.token,
    // 获取用户信息
    currentUser: (state) => state.userInfo,
  }
})
