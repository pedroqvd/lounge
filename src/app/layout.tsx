import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lounge For You',
  description: 'Um site do Ministério de Jovens da Igreja Millenium',
  icons: {
    // ESPAÇO RESERVADO PARA O FAVICON (Ícone da aba do navegador)
    // Coloque a imagem "custom-favicon.png" dentro da pasta "public" do projeto
    icon: '/custom-favicon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={montserrat.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
