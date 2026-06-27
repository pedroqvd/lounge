'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  memberId: string
  currentPhotoUrl?: string | null
  onUploadSuccess: (url: string) => void
}

export function AvatarUpload({ memberId, currentPhotoUrl, onUploadSuccess }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.')
      return
    }

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${memberId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('video publico')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('video publico').getPublicUrl(filePath)
      
      onUploadSuccess(data.publicUrl)
      toast.success('Foto atualizada com sucesso!')
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao fazer upload da foto. Verifique se o bucket permite uploads públicos.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative group cursor-pointer inline-block rounded-full overflow-hidden w-32 h-32 border-4 border-background shadow-lg bg-muted">
      {currentPhotoUrl ? (
        <img src={currentPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground font-bold bg-muted">
          ?
        </div>
      )}

      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        {isUploading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <>
            <Camera className="w-8 h-8 mb-1" />
            <span className="text-xs font-medium">Trocar Foto</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  )
}
