'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Lock, ArrowRight, Sparkles, User, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Enhanced Fields
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/') // Redirect to home/dashboard
      } else {
        // --- REGISTER FLOW ---
        // 1. Validation
        if (password !== confirmPassword) {
            throw new Error("Las contraseñas no coinciden.")
        }
        if (password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres.")
        }
        if (!nickname.trim()) {
            throw new Error("Por favor elige un Nickname.")
        }

        // 2. Sign Up with Metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: {
                username: nickname, // This will be caught by the Trigger
                // avatar_url: ... (optional if we added an avatar picker)
            }
          },
        })
        if (error) throw error
        setMessage('Cuenta creada con éxito. Revisa tu email para confirmar.')
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background selection:bg-primary/20">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
             <Sparkles className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'Ingresa para gestionar tu hogar' : 'Únete y organiza tu vida'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden transition-all duration-300">
          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Nickname Field (Register Only) */}
            <AnimatePresence>
                {!isLogin && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2"
                    >
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Nickname</label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Ej: MaxPower"
                              className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                              value={nickname}
                              onChange={(e) => setNickname(e.target.value)}
                              required={!isLogin}
                            />
                          </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="hola@ejemplo.com"
                  className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password Field (Register Only) */}
            <AnimatePresence>
                {!isLogin && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2"
                    >
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Confirmar Contraseña</label>
                          <div className="relative">
                            <CheckCircle2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Repite tu contraseña"
                              className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required={!isLogin}
                              minLength={6}
                            />
                          </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md font-medium"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-md font-medium"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full h-11 text-base shadow-sm active:scale-[0.98] transition-transform" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                  setMessage(null)
              }}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
