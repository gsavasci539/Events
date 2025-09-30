import { FormEvent, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { authService } from '@/services/auth'
import { useAuth } from '@/store/auth'

// Import the Herbalife logo
const herbalifeLogo = '/Herbalife-Brandmark-Distributor-GardenGreen-Turkish-Turkey-Vertical-RGB-1.png';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Set page title
  useEffect(() => {
    document.title = 'Giriş Yap - Herbalife Etkinlik Davet Yönetim Paneli'
    return () => {
      document.title = 'Herbalife Etkinlik Davet Yönetim Paneli'
    }
  }, [])

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message)
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      console.log('Attempting login with:', { email })
      const response = await authService.login(email, password)
      console.log('Login response:', response)
      
      if (response.access_token && response.user) {
        console.log('Login successful, user data:', response.user)
        login(response.access_token, response.user)
        navigate('/')
      } else {
        console.error('Invalid login response:', response)
        setError('Geçersiz yanıt alındı. Lütfen tekrar deneyin.')
      }
    } catch (e: any) {
      console.error('Login error:', e)
      setError(e?.response?.data?.detail || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edip tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branded background with image */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={herbalifeLogo} 
              alt="Herbalife Background" 
              className="w-full h-full object-cover object-center scale-110"
              style={{
                filter: 'brightness(0.5) contrast(1.1) saturate(1.1)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/70 to-primary-400/50" />
        </div>
        
        {/* Content */}
        <div className="relative flex flex-col items-center justify-center w-full p-4 sm:p-6 md:p-8 lg:p-12 text-white">
          <div className="max-w-2xl w-full text-center px-4">
            {/* Herbalife Logo */}
            <div className="mb-6 sm:mb-8 md:mb-10 transform transition-transform duration-300 hover:scale-105">
              <img 
                src={herbalifeLogo} 
                alt="Herbalife Logo" 
                className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto mx-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              />
            </div>
            
            {/* Main Heading */}
            <div className="mb-6 sm:mb-8 md:mb-10 bg-black/30 p-8 rounded-xl border border-white/20 shadow-2xl backdrop-blur-sm">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  HERBALIFE
                </h1>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  Etkinlik Davet Yönetim Paneli
                </h2>
                <div className="h-1 sm:h-1.5 w-32 sm:w-40 lg:w-48 my-4 sm:my-6 mx-auto rounded-full shadow-lg"></div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">
                  Hoş Geldiniz
                </p>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mt-8 sm:mt-12 lg:mt-16">
              {[
                'Kolay Davet Yönetimi',
                'Anlık Katılım Takibi',
                'Detaylı Raporlama',
                'Güvenli Erişim'
              ].map((feature, index) => (
                <div key={index} className="flex items-start bg-white/10 p-3 sm:p-4 rounded-xl border border-white/20 shadow-lg backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <div className="bg-white p-1.5 rounded-full mr-3 flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side with login form - takes up 2/5 of the screen */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 bg-white">
        <div className="w-full max-w-md px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">Giriş Yap</h1>
            <p className="text-gray-600">Hesabınıza erişmek için giriş yapın</p>
          </div>
          
          {error && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${error.includes('başarılı') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta Adresi <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="ornek@email.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Şifremi Unuttum?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3.5 px-6 border border-transparent rounded-lg text-base font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/80 transition-colors ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Giriş Yapılıyor...
                  </>
                ) : 'Giriş Yap'}
              </button>
            </div>
            
            <div className="text-center mt-4 text-sm">
              <p className="text-gray-600">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Kayıt Olun
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
