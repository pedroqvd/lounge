import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeInjector from '@/components/ThemeInjector'
import { Toaster } from '@/components/ui/sonner'
import { prisma } from '@/lib/prisma'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Lounge | Conectando Vidas',
    template: '%s | Lounge'
  },
  description: '�rea de Membros e Gest�o Ministerial da Igreja Millenium. Conecte-se com seu prop�sito.',
  keywords: ['Igreja', 'Minist�rio', 'Jovens', 'Lounge', 'Membros', 'Gest�o', 'C�lula'],
  authors: [{ name: 'Lounge For You' }],
  creator: 'Lounge Team',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://loungeforyou.com',
    title: 'Lounge | Conectando Vidas',
    description: '�rea de Membros e Gest�o Ministerial da Igreja Millenium.',
    siteName: 'Lounge',
    images: [
      {
        url: 'https://unltgnznpvjfwiqioomh.supabase.co/storage/v1/object/public/video%20publico/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lounge For You',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lounge | Conectando Vidas',
    description: '�rea de Membros e Gest�o Ministerial da Igreja Millenium.',
    images: ['https://unltgnznpvjfwiqioomh.supabase.co/storage/v1/object/public/video%20publico/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
      
      <body className={montserrat.className}>
        <ThemeInjector primaryColor={primaryColor} />
        <ThemeProvider attribute="class" defaultTheme={themeMode} enableSystem={themeMode === 'system'} forcedTheme={themeMode !== 'system' ? themeMode : undefined} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
