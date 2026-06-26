'use client'

export function Logo({ minimized = false }: { minimized?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${minimized ? 'w-10 h-10' : 'h-12'}`}>
      <img 
        src="/custom-logo-login.PNG" 
        alt="Lounge For You" 
        className={`object-contain ${minimized ? 'w-10 h-10' : 'h-12'}`} 
      />
    </div>
  )
}
