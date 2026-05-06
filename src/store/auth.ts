import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import api from '@/services/api'

const TOKEN_KEY = 'auth_token'
const USER_KEY  = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const currentUser = ref<User | null>(
    JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  )

  const isAuthenticated = computed(() => currentUser.value !== null && token.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  function persist(t: string, u: User) {
    token.value = t
    currentUser.value = u
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  async function login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      persist(data.token, data.user)
      return { success: true, message: data.message ?? 'Giriş başarılı.' }
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? 'E-posta veya şifre hatalı.'
      return { success: false, message }
    }
  }

  async function register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      persist(data.token, data.user)
      return { success: true, message: data.message ?? 'Kayıt başarılı.' }
    } catch (err: any) {
      const errors = err.response?.data?.errors
      const errorList = errors ? Object.values(errors).join(' ') : ''
      const message =
        err.response?.data?.message ||
        errorList ||
        'Kayıt sırasında bir hata oluştu.'
      return { success: false, message }
    }
  }

  function logout() {
    token.value = null
    currentUser.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, currentUser, isAuthenticated, isAdmin, login, register, logout }
})
