import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    }
  })

  const onSubmit = (data: LoginFormValues) => {
    console.log('Login submitted', data)
    // Here would be the Axios call to /api/v1/auth/login
    // Mock login success by navigating to dashboard
    navigate('/dashboard')
  }

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
            <Button type="submit" className="text-base h-12 rounded-[8px] font-bold">
              LOGIN
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
