const fs = require('fs');

const envContent = `DATABASE_URL="postgresql://user:password@localhost:5432/db"
DIRECT_URL="postgresql://user:password@localhost:5432/db"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
`;
fs.writeFileSync('.env.example', envContent);

const themeInjectorContent = `'use client';

export default function ThemeInjector({ primaryColor }: { primaryColor: string }) {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--primary', primaryColor, 'important');
    document.documentElement.style.setProperty('--sidebar-primary', primaryColor, 'important');
    document.documentElement.style.setProperty('--ring', primaryColor, 'important');
    document.documentElement.style.setProperty('--sidebar-ring', primaryColor, 'important');
  }
  return null;
}
`;
fs.writeFileSync('src/components/ThemeInjector.tsx', themeInjectorContent);

let layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf8');
layoutContent = layoutContent.replace(
  `import { ThemeProvider } from '@/components/ThemeProvider'`,
  `import { ThemeProvider } from '@/components/ThemeProvider'\nimport ThemeInjector from '@/components/ThemeInjector'\nimport { Toaster } from '@/components/ui/sonner'`
);

const headRegex = /<head>[\s\S]*?<\/head>/;
layoutContent = layoutContent.replace(headRegex, '');

const bodyRegex = /<body className=\{montserrat\.className\}>/;
layoutContent = layoutContent.replace(
  bodyRegex,
  `<body className={montserrat.className}>\n        <ThemeInjector primaryColor={primaryColor} />`
);

const childrenRegex = /\{children\}\n\s*<\/ThemeProvider>/;
layoutContent = layoutContent.replace(
  childrenRegex,
  `{children}\n          <Toaster />\n        </ThemeProvider>`
);
fs.writeFileSync('src/app/layout.tsx', layoutContent);

const loginContent = `'use client'

import { useState } from 'react'
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
        ? \`\\n\\nDetalhe Técnico: O build atual da Vercel está usando a URL: "\${buildUrl}".\` 
        : ''
      
      toast.error('Falha ao entrar', {
        description: \`\${error.message}\${extraInfo}\`
      })
      setLoading(false)
    } else {
      toast.success('Login efetuado com sucesso!')
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8 flex flex-col items-center">
            <img src="/custom-logo-login.PNG" alt="Lounge For You" className="h-24 object-contain mb-4" />
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
                      <Input type="password" placeholder="••••••••" {...field} />
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
`;
fs.writeFileSync('src/app/login/page.tsx', loginContent);

let buttonContent = fs.readFileSync('src/components/ui/button.tsx', 'utf8');
buttonContent = buttonContent.replace('import { Slot } from "@radix-ui/react-slot"', 'import { Slot } from "@radix-ui/react-slot"\nimport { Loader2 } from "lucide-react"');

buttonContent = buttonContent.replace(
  'export interface ButtonProps\n  extends React.ButtonHTMLAttributes<HTMLButtonElement>,\n    VariantProps<typeof buttonVariants> {\n  asChild?: boolean\n}',
  'export interface ButtonProps\n  extends React.ButtonHTMLAttributes<HTMLButtonElement>,\n    VariantProps<typeof buttonVariants> {\n  asChild?: boolean\n  isLoading?: boolean\n}'
);

buttonContent = buttonContent.replace(
  `({ className, variant, size, asChild = false, ...props }, ref) => {`,
  `({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {`
);

const renderRegex = /return \([\s\S]*?<Comp[\s\S]*?className=\{cn\(buttonVariants\(\{ variant, size, className \}\)\)\}[\s\S]*?ref=\{ref\}[\s\S]*?\{\.\.\.props\}[\s\S]*?\/>[\s\S]*?\)/;

buttonContent = buttonContent.replace(renderRegex, `return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )`);
fs.writeFileSync('src/components/ui/button.tsx', buttonContent);

console.log("Arquivos atualizados com sucesso!");
