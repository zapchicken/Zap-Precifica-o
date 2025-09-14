// src/pages/Login.tsx
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLogin = async (type: 'login' | 'signup') => {
    try {
      setLoading(true)
      let response

      if (type === 'signup') {
        response = await supabase.auth.signUp({ email, password })
      } else {
        response = await supabase.auth.signInWithPassword({ email, password })
      }

      const { error, data } = response

      if (error) throw error

      if (data.user) {
        toast({ title: 'Sucesso', description: 'Login realizado!' })
        navigate('/')
      } else if (data.session) {
        toast({ title: 'Verifique seu e-mail', description: 'Enviamos um link de confirmação.' })
      }
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) throw error
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: 'E-mail necessário',
        description: 'Digite seu e-mail para recuperar a senha.',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para redefinir a senha.'
      })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ZapPrice</h1>
          <p className="text-gray-500">Sistema de Fichas Técnicas</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              disabled={loading}
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleLogin('login')}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleLogin('signup')}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}