'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Logo({ minimized = false }: { minimized?: boolean }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Cores exatas do branding
  const violeta = '#9B7FFF'
  const profundo = '#1A1030'
  const nevoa = '#F0EDFF'
  const noite = '#0D0D14'

  // Determinar a cor principal da letra baseada no tema
  // Claro: Letras são Profundo
  // Escuro: Letras são Névoa
  const textColor = mounted && resolvedTheme === 'dark' ? nevoa : profundo

  return (
    <div className={`group flex items-center font-bold select-none cursor-pointer hover:opacity-90 transition-opacity ${minimized ? 'justify-center' : ''}`}>
      {!minimized && (
        <span 
          className="text-3xl tracking-widest uppercase transition-colors" 
          style={{ color: textColor, fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}
        >
          LO
        </span>
      )}
      
      {/* O "U" Estilizado */}
      <div className={`flex relative items-end mx-1 transition-transform group-hover:scale-105 duration-300 ${minimized ? 'scale-125' : ''}`} style={{ height: '28px' }}>
        {/* Perna Esquerda + Base do U (Violeta) */}
        <div 
          style={{ backgroundColor: violeta }}
          className="w-5 h-full rounded-bl-lg rounded-tl-sm relative"
        >
          <div 
            style={{ backgroundColor: violeta }} 
            className="absolute bottom-0 left-0 w-8 h-2.5 rounded-br-sm" 
          />
        </div>
        
        {/* Perna Direita do U (Cor dinâmica do Texto) */}
        <div 
          style={{ backgroundColor: textColor }}
          className="w-2.5 h-full rounded-tr-lg rounded-br-lg ml-3 transition-colors"
        />
      </div>

      {!minimized && (
        <span 
          className="text-3xl tracking-widest uppercase transition-colors" 
          style={{ color: textColor, fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}
        >
          NGE
        </span>
      )}

      {/* Texto Lateral (FOR YOU) - Oculto quando minimizado */}
      {!minimized && (
        <div 
          className="flex flex-col justify-center ml-2 leading-none transition-colors"
          style={{ color: textColor, fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          <span className="text-[10px] tracking-widest">FOR</span>
          <span className="text-[10px] tracking-widest">YOU</span>
        </div>
      )}
    </div>
  )
}
