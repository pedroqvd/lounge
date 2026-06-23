import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { prisma } from '@/lib/prisma'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lounge For You',
  description: 'Um site do Ministério de Jovens da Igreja Millenium',
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.settings.findUnique({ where: { id: 'global' } })
  const primaryColor = settings?.primaryColor || '#4A3AFF'
  const themeMode = settings?.themeMode || 'system'

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --primary: ${primaryColor} !important;
            --sidebar-primary: ${primaryColor} !important;
            --ring: ${primaryColor} !important;
            --sidebar-ring: ${primaryColor} !important;
          }
          .dark {
            --primary: ${primaryColor} !important;
            --sidebar-primary: ${primaryColor} !important;
            --ring: ${primaryColor} !important;
            --sidebar-ring: ${primaryColor} !important;
          }
        `}} />
      </head>
      <body className={montserrat.className}>
        <ThemeProvider attribute="class" defaultTheme={themeMode} enableSystem={themeMode === 'system'} forcedTheme={themeMode !== 'system' ? themeMode : undefined} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
