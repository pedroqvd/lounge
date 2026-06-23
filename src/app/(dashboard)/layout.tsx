'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  Menu,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Settings as SettingsIcon
} from 'lucide-react'
import { Logo } from '@/components/Logo'

import { getCurrentUser } from '@/app/actions/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    getCurrentUser().then(user => {
      if (user) setUserRole(user.role)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const sidebarWidth = sidebarMinimized ? 'w-20' : 'w-64'

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border shadow-xl lg:shadow-none transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static ${sidebarWidth} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex items-center h-20 border-b border-border transition-all duration-300 ${sidebarMinimized ? 'justify-center px-0' : 'justify-between px-6'}`}>
          <Link href="/" className="hover:scale-105 transition-transform" onClick={() => setSidebarOpen(false)}>
            <Logo minimized={sidebarMinimized} />
          </Link>
          {!sidebarMinimized && (
            <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-6 flex flex-col gap-8">
          
          {/* Categoria: Visão Geral */}
          <div className="px-4">
            {!sidebarMinimized && <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Visão Geral</p>}
            <div className="flex flex-col gap-1">
              <NavItem href="/" icon={LayoutDashboard} label="Painel" isActive={pathname === '/'} minimized={sidebarMinimized} onClick={() => setSidebarOpen(false)} />
            </div>
          </div>

          {/* Categoria: Membros */}
          <div className="px-4">
            {!sidebarMinimized && <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Pessoas</p>}
            <div className="flex flex-col gap-1">
              <NavItem href="/membros" icon={Users} label="Membros" isActive={pathname.startsWith('/membros')} minimized={sidebarMinimized} onClick={() => setSidebarOpen(false)} />
              <NavItem href="/templates" icon={MessageSquare} label="Templates" isActive={pathname.startsWith('/templates')} minimized={sidebarMinimized} onClick={() => setSidebarOpen(false)} />
            </div>
          </div>

          {/* Categoria: Calendário */}
          <div className="px-4">
            {!sidebarMinimized && <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Eventos</p>}
            <div className="flex flex-col gap-1">
              <NavItem href="/calendario" icon={Calendar} label="Agenda & Eventos" isActive={pathname.startsWith('/calendario')} minimized={sidebarMinimized} onClick={() => setSidebarOpen(false)} />
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          {/* Settings Link (Apenas para ADMIN) */}
          {userRole === 'ADMIN' && (
            <Link 
              href="/configuracoes"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground rounded-xl transition-all duration-200 ${pathname.startsWith('/configuracoes') ? 'bg-secondary text-secondary-foreground font-medium' : ''} ${sidebarMinimized ? 'justify-center' : 'w-full'}`}
              title="Configurações"
            >
              <SettingsIcon className="w-5 h-5" />
              {!sidebarMinimized && <span className="font-medium">Configurações</span>}
            </Link>
          )}
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground rounded-xl transition-all duration-200 ${sidebarMinimized ? 'justify-center' : 'w-full'}`}
            title="Alternar Tema"
          >
            {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />) : <Moon className="w-5 h-5" />}
            {!sidebarMinimized && <span className="font-medium">{mounted && resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>

          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-200 ${sidebarMinimized ? 'justify-center' : 'w-full'}`}
            title="Sair do Sistema"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarMinimized && <span className="font-medium">Sair</span>}
          </button>
        </div>

        {/* Botão de Minimizar Sidebar (Apenas Desktop) */}
        <button
          onClick={() => setSidebarMinimized(!sidebarMinimized)}
          className="hidden lg:flex absolute -right-3.5 top-24 w-7 h-7 bg-card border border-border rounded-full items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary hover:shadow-md transition-all z-50"
        >
          {sidebarMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Header Mobile */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-md lg:hidden z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <Logo minimized={true} />
          <div className="w-6" /> {/* Placeholder para equilibrar */}
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon: Icon, label, isActive, minimized, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={minimized ? label : ''}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
        isActive 
          ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20' 
          : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground hover:translate-x-1'
      } ${minimized ? 'justify-center' : ''}`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      {!minimized && <span>{label}</span>}
      
      {/* Tooltip para sidebar minimizada */}
      {minimized && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg border border-border">
          {label}
        </div>
      )}
    </Link>
  )
}
