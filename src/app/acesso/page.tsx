'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      const buildUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'vazia'
      const isFetchError = error.message.includes('Failed to fetch')
      const extraInfo = isFetchError 
        ? `\n\nDetalhe Técnico: O build atual da Vercel está usando a URL: "${buildUrl}".` 
        : ''
      
      toast.error('Falha ao entrar', {
        description: `${error.message}${extraInfo}`
      })
      setLoading(false)
    } else {
      toast.success('Login efetuado com sucesso!')
      router.push('/painel')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8 flex flex-col items-center">
            <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
              <Image src="/custom-logo-login-trimmed.PNG" alt="Lounge For You" width={200} height={100} className="w-48 h-auto object-contain mb-4 dark:brightness-200" priority />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Faça login para acessar o sistema.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="nome@lounge.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" isLoading={loading}>
                Entrar
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
