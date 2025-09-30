import { FormEvent, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services/auth'

// Import the Herbalife logo
const herbalifeLogo = '/Herbalife-Brandmark-Distributor-GardenGreen-Turkish-Turkey-Vertical-RGB-1.png';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    distributorId: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // Set page title
  useEffect(() => {
    document.title = 'Kayıt Ol - Herbalife Etkinlik Davet Yönetim Paneli'
    return () => {
      document.title = 'Herbalife Etkinlik Davet Yönetim Paneli'
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    // Validate distributor ID format (alphanumeric, 6-10 characters)
    if (!/^[a-zA-Z0-9]{6,10}$/.test(formData.distributorId)) {
      setError('Geçersiz distribütör ID formatı. 6-10 karakter arasında harf ve rakam içermelidir.')
      return
    }

    setIsSubmitting(true)
    
    try {
      await authService.register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        distributor_id: formData.distributorId,
        password: formData.password,
        is_active: false // New users need admin approval
      })
      
      // Redirect to login with success message
      navigate('/login', { state: { message: 'Kayıt başarılı! Hesabınız yönetici onayından sonra aktif edilecektir.' } })
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Kayıt sırasında bir hata oluştu')
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
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-herbalife-green/70 to-herbalife-green/50" />
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
            <div className="mb-6 sm:mb-8 md:mb-10 bg-black/30 p-4 sm:p-6 md:p-8 rounded-xl border border-white/20 shadow-2xl backdrop-blur-sm">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  HERBALIFE
                </h1>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  Etkinlik Davet Yönetim Paneli
                </h2>
                <div className="h-1 sm:h-1.5 w-32 sm:w-40 lg:w-48 my-4 sm:my-6 mx-auto rounded-full shadow-lg"></div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">
                  Yeni Kullanıcı Kaydı
                </p>
              </div>
            </div>
            
            {/* Subtitle */}
            <div className="mb-8 sm:mb-10 lg:mb-12 text-center space-y-4">
              <div className="bg-black/40 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl inline-block shadow-xl backdrop-blur-sm">
                <p className="text-xl text-white font-semibold leading-relaxed">
                  Herbalife etkinliklerinize katılım sağlamak için hesabınızı oluşturun.
                </p>
              </div>
              <div className="bg-white/25 border border-white/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full inline-block shadow-lg backdrop-blur-sm">
                <p className="text-base text-white font-medium">
                  Hesabınız yönetici onayından sonra aktif olacaktır.
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
                <div key={index} className="flex items-start bg-herbalife-green/10 p-3 sm:p-4 rounded-xl border border-herbalife-green/30 shadow-lg backdrop-blur-sm hover:bg-herbalife-green/20 transition-colors">
                  <div className="bg-herbalife-green p-1.5 rounded-full mr-3 flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-700 font-semibold text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side with registration form - takes up 2/5 of the screen */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-herbalife-green mb-2">Hesap Oluştur</h1>
            <p className="text-gray-600">Yeni bir hesap oluşturmak için bilgilerinizi girin</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Adınız <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Soyadınız <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-transparent"
                />
              </div>
            </div>
            
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
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon Numarası <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="5__ ___ __ __"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="distributorId" className="block text-sm font-medium text-gray-700 mb-1">
                Herbalife Distribütör ID <span className="text-red-500">*</span>
              </label>
              <input
                id="distributorId"
                name="distributorId"
                type="text"
                required
                minLength={6}
                maxLength={10}
                pattern="[A-Za-z0-9]+"
                value={formData.distributorId}
                onChange={handleChange}
                placeholder="Örn: AB12345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-transparent uppercase"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="mt-1 text-xs text-gray-500">6-10 karakter arasında harf ve rakam içermelidir</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">En az 8 karakter olmalıdır</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre Tekrar <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-transparent"
                />
              </div>
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
                    İşleniyor...
                  </>
                ) : 'Hesap Oluştur'}
              </button>
            </div>
            
            <div className="text-sm">
              <p className="text-gray-600">
                Hesap oluşturarak, Herbalife'nin <a href="#" className="text-herbalife-green hover:underline">Kullanım Koşulları</a>'nı ve 
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="font-semibold text-herbalife-green hover:text-herbalife-green/80 hover:underline transition-colors">
                  Giriş yapın
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
