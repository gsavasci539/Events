import { http } from './http'

type LoginResponse = { 
  access_token: string; 
  token_type: string;
  user?: {
    id: number;
    email: string;
    full_name: string | null;
    role: 'distributor' | 'superadmin';
  };
}

export interface RegisterData {
  first_name: string
  last_name: string
  email: string
  phone: string
  distributor_id: string
  password: string
  is_active?: boolean
}

export const authService = {
  async login(email: string, password: string) {
    const body = new URLSearchParams()
    body.append('username', email)
    body.append('password', password)
    
    try {
      const { data } = await http.post<LoginResponse>('/auth/login', body, { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
      })
      
      // If the backend returns the user object directly, use it
      if (data.user) {
        console.log('User data from backend:', data.user)
        return {
          access_token: data.access_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name || null,
            role: data.user.role
          }
        }
      }

      // Fallback to decoding the token if user object is not in the response
      const payload = JSON.parse(atob(data.access_token.split('.')[1]))
      console.log('JWT Payload (fallback):', payload)
      
      const user = { 
        id: Number(payload.sub), 
        email: payload.email || email,
        full_name: payload.full_name || null,
        role: (payload.role as 'distributor' | 'superadmin') || 'distributor'
      }
      
      console.log('User object created from token (fallback):', user)
      return { ...data, user }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },
  
  async register(userData: RegisterData) {
    const { data } = await http.post('/auth/register', {
      ...userData,
      is_active: false // New users are inactive by default
    })
    return data
  },
}
