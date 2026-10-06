import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/api/auth.api'
import logoImage from '@/assets/logo.png' 
import bgImage from '@/assets/background.png' 

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const result = await authApi.login(data.username, data.password);
      
      // Simpan kredensial token dan profil
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);
      localStorage.setItem('user_role', result.user.role);
      localStorage.setItem('user_name', result.user.fullName);
      localStorage.setItem('user_id', String(result.user.id));

      if (result.user.role === 'MANAGEMENT') {
        navigate('/manajemen/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setAuthError(axiosErr.response?.data?.message || 'Login gagal. Periksa username dan password.');
      } else {
        setAuthError('Tidak dapat terhubung ke server backend.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Image (Full screen) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Gradient Overlay (Dilapisi gradasi biru dan putih) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DCEEFB]/80 via-white/65 to-white/60" />
      
      {/* Transparent Modal Wrapper */}
      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-auto p-6 flex flex-col items-center">
        
        {/* Logo and Titles */}
        <div className="flex flex-col items-center space-y-3 pb-6 w-full">
          <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* mix-blend-multiply removes the white square background of the logo */}
            <img src={logoImage} alt="HYDRO-MON Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-primary-600 tracking-tight">HYDRO-MON</h1>
            <p className="text-sm text-primary-600 font-medium">Digital Logbook & Monitoring</p>
            <p className="text-sm text-primary-600 font-medium">PLTMH Sampean Baru</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full px-2">
          {authError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-2">
            <Input 
              {...register('username')}
              type="text" 
              placeholder="Username" 
              icon={<User size={18} className="text-primary-600" />}
              className="border-primary-600 text-neutral-800 rounded-[8px] bg-white h-12"
              error={errors.username?.message}
            />
          </div>
          <div className="space-y-2">
            <Input 
              {...register('password')}
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              icon={<Lock size={18} className="text-primary-600" />}
              className="border-primary-600 text-neutral-800 rounded-[8px] bg-white h-12"
              suffix={
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-primary-500 transition-colors text-primary-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              error={errors.password?.message}
            />
          </div>
          
          <div className="flex items-center justify-between text-[13px] pt-1 px-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('rememberMe')}
                className="rounded border-neutral-400 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-neutral-900 font-medium">Ingat Saya</span>
            </label>
            
            <a href="#" className="text-neutral-900 font-medium hover:text-primary-600 transition-colors">
              Lupa Password?
            </a>
          </div>

          <div className="pt-3">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="text-base h-12 rounded-[8px] font-bold w-full disabled:opacity-60"
            >
              {isLoading ? 'MEMPROSES...' : 'LOGIN'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
