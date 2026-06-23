'use client'

export function Logo({ minimized = false }: { minimized?: boolean }) {
  // ESPAÇOS RESERVADOS PARA SUAS LOGOS:
  // Coloque os arquivos de imagem na pasta "public" do projeto.

  if (minimized) {
    return (
      <img 
        src="/custom-logo-minimized.png" 
        alt="Logo Minimizada" 
        className="h-8 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
        title="Coloque sua logo minimizada na pasta 'public' com o nome 'custom-logo-minimized.png'"
      />
    )
  }

  return (
    <img 
      src="/custom-logo.png" 
      alt="Logo Principal" 
      className="h-8 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
      title="Coloque sua logo principal na pasta 'public' com o nome 'custom-logo.png'"
    />
  )
}
