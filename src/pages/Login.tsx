// src/pages/Login.tsx
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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
        navigate('/fichas')
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ZapPrice</h1>
          <p className="text-gray-500">Sistema de Fichas Técnicas</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <Label>Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={() => handleLogin('login')}
              disabled={loading}
            >
              Entrar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleLogin('signup')}
              disabled={loading}
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}