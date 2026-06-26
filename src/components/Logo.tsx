'use client'

import Image from 'next/image'

export function Logo({ minimized = false }: { minimized?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${minimized ? 'w-10 h-10' : 'w-40 h-14'}`}>
      <Image src="/custom-logo-login.PNG" alt="Lounge For You" width={160} height={56} className={`object-contain ${minimized ? 'w-10 h-10' : 'w-full h-full'}`} priority />
    </div>
  )
}
