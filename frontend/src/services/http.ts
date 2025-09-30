import axios from 'axios'
import { toast } from 'react-toastify'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,  // Include cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add these CORS settings
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withXSRFToken: true,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Ensure we're not overriding the Content-Type if it's set (e.g., for file uploads)
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.detail || 'Bir hata oluştu'
    
    if (status === 401) {
      // Don't show toast for login page to prevent multiple toasts
      if (!window.location.pathname.includes('/login')) {
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.')
      }
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (status === 400) {
      toast.error(message || 'Geçersiz istek')
    } else if (status === 403) {
      toast.error('Bu işlem için yetkiniz bulunmuyor')
    } else if (status === 404) {
      toast.error('İstenen kaynak bulunamadı')
    } else if (status >= 500) {
      toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.')
    } else if (error.message === 'Network Error') {
      toast.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.')
    }
    
    return Promise.reject(error)
  }
)
