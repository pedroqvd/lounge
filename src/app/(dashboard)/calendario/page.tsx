export default function CalendarioPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-4">
        <span className="text-2xl font-bold">31</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Agenda & Eventos</h1>
      <p className="text-muted-foreground max-w-md">
        Em breve! Este módulo permitirá gerenciar células, cultos, reuniões de liderança e organizar todo o calendário do ministério.
      </p>
    </div>
  )
}
