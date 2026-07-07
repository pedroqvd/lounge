import React from 'react'
import { AudioWaveform, UserCheck, BookOpen, Aperture, Flame, Users, Mic2, Compass, Calendar } from 'lucide-react'

const MINISTRY_ICONS: Record<string, any> = {
  music: AudioWaveform, 'door-open': UserCheck, baby: BookOpen, camera: Aperture, heart: Flame, users: Users, mic: Mic2, sparkles: Compass
}

export default function PrintableSchedule({ 
  selectedMinistry, 
  ministryEvents 
}: { 
  selectedMinistry: any, 
  ministryEvents: any[] 
}) {
  const IconComp = MINISTRY_ICONS[selectedMinistry?.icon] || Users

  return (
    <div className="bg-background/80 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] border border-border/30 shadow-2xl relative overflow-hidden" id="printable-schedule-container">
      
      {/* Marca d'água no fundo da escala */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
        <Users className="w-[120%] h-[120%]" />
      </div>

      {/* Cabeçalho exclusivo para o Print */}
      <div className="print:flex print:flex-col flex-col items-center justify-center mb-10 relative z-10" id="print-header">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: selectedMinistry?.color + '20', color: selectedMinistry?.color }}>
          <IconComp className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter" style={{ color: selectedMinistry?.color }}>Escala: {selectedMinistry?.name}</h2>
        <p className="text-muted-foreground font-semibold mt-2 text-lg">Gerado pela plataforma Lounge</p>
        <div className="w-24 h-1 rounded-full mt-6" style={{ backgroundColor: selectedMinistry?.color }} />
      </div>

      {ministryEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
          <div className="w-24 h-24 bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-6 border border-border">
            <Calendar className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Nenhuma escala programada</h3>
          <p className="text-muted-foreground text-lg max-w-md">Não há eventos futuros com voluntários escalados para este mês.</p>
        </div>
      ) : (
        <div className="relative z-10 overflow-x-auto rounded-xl border-2 border-[#1e3a8a] bg-white max-w-[1200px] mx-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th colSpan={ministryEvents.length + 1} className="bg-[#1e3a8a] text-white py-3 text-xl sm:text-2xl font-bold uppercase tracking-widest border-b-2 border-white">
                  Escala {selectedMinistry?.name} - {new Date(ministryEvents[0].date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </th>
              </tr>
              <tr className="bg-[#1e3a8a] text-white">
                <th className="py-3 px-4 font-bold border-r-2 border-white w-1/5 text-sm sm:text-lg">Data</th>
                {ministryEvents.map((event) => {
                  const d = new Date(event.date)
                  return (
                    <th key={event.id} className="py-3 px-4 font-bold border-r-2 border-white last:border-r-0 text-sm sm:text-lg">
                      {String(d.getDate()).padStart(2, '0')}/{d.toLocaleDateString('pt-BR', { month: 'short' })}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="text-black bg-white">
              {(() => {
                const LOUVOR_MAPPING: Record<string, string> = {
                  'Ministro(a) de Louvor': 'Vocal',
                  'Vocalista': 'Vocal',
                  'Back-vocal': 'Vocal',
                  'Vocal': 'Vocal',
                  'Tecladista': 'Teclado',
                  'Teclado': 'Teclado',
                  'Teclado 1': 'Teclado',
                  'Teclado 2': 'Teclado',
                  'Violinista': 'Violão',
                  'Violonista': 'Violão',
                  'Violão': 'Violão',
                  'Guitarrista': 'Guitarra',
                  'Guitarra': 'Guitarra',
                  'Guitarra 1': 'Guitarra',
                  'Guitarra 2': 'Guitarra',
                  'Baixista': 'Baixo',
                  'Baixo': 'Baixo',
                  'Baterista': 'Bateria',
                  'Bateria': 'Bateria'
                }
                const STANDARD_ORDER = ['Vocal', 'Teclado', 'Violão', 'Guitarra', 'Baixo', 'Bateria']

                // Extract all unique categories from the members of this ministry
                const allCategories = new Set<string>()
                selectedMinistry?.members?.forEach((mm: any) => {
                  if (mm.position) {
                    mm.position.split(',').forEach((p: string) => {
                      const trimP = p.trim()
                      allCategories.add(LOUVOR_MAPPING[trimP] || trimP)
                    })
                  }
                })
                
                let categoriesArray = Array.from(allCategories).filter(Boolean)
                if (categoriesArray.length === 0) categoriesArray = ['Equipe'] // Fallback if no positions

                // Order categories based on standard Louvor order if applicable
                categoriesArray.sort((a, b) => {
                  const idxA = STANDARD_ORDER.indexOf(a)
                  const idxB = STANDARD_ORDER.indexOf(b)
                  if (idxA !== -1 && idxB !== -1) return idxA - idxB
                  if (idxA !== -1) return -1
                  if (idxB !== -1) return 1
                  return a.localeCompare(b)
                })

                return categoriesArray.map((category, idx) => {
                  // Find the max number of people scheduled for this category across all events
                  const scheduledPerEvent = ministryEvents.map(event => {
                    const slots = event.scheduleSlots.filter((s: any) => s.ministryId === selectedMinistry.id)
                    
                    // Sort slots within the same category so that 'Ministro(a) de Louvor' appears first
                    const matchingSlots = slots.filter((slot: any) => {
                      if (categoriesArray.length === 1 && categoriesArray[0] === 'Equipe') return true
                      
                      // Use explicit slot position if available
                      if (slot.position) return (LOUVOR_MAPPING[slot.position] || slot.position) === category
                      
                      // Fallback for old data
                      const minMember = selectedMinistry?.members?.find((mm: any) => mm.memberId === slot.member.id)
                      if (!minMember || !minMember.position) return false
                      const memberCategories = minMember.position.split(',').map((p: string) => LOUVOR_MAPPING[p.trim()] || p.trim())
                      return memberCategories.includes(category)
                    })

                    matchingSlots.sort((a: any, b: any) => {
                      const aPos = a.position || selectedMinistry?.members?.find((mm: any) => mm.memberId === a.member.id)?.position || ''
                      const bPos = b.position || selectedMinistry?.members?.find((mm: any) => mm.memberId === b.member.id)?.position || ''
                      const aIsMin = aPos.includes('Ministro')
                      const bIsMin = bPos.includes('Ministro')
                      if (aIsMin && !bIsMin) return -1
                      if (!aIsMin && bIsMin) return 1
                      return 0
                    })

                    return matchingSlots
                  })
                  const maxRows = Math.max(1, ...scheduledPerEvent.map(arr => arr.length))

                  // We need to render `maxRows` number of <tr> elements
                  return Array.from({ length: maxRows }).map((_, rowIndex) => (
                    <tr key={`${category}-${rowIndex}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {rowIndex === 0 && (
                        <td rowSpan={maxRows} className="py-2 px-2 sm:px-4 border-2 border-[#1e3a8a] bg-[#1e3a8a] text-white font-bold text-sm sm:text-lg align-middle whitespace-nowrap">
                          {category}
                        </td>
                      )}
                      {ministryEvents.map((event, eventIdx) => {
                        const membersForThisEvent = scheduledPerEvent[eventIdx]
                        const memberSlot = membersForThisEvent[rowIndex]
                        
                        let isMinister = false
                        if (memberSlot) {
                          const pos = memberSlot.position || selectedMinistry?.members?.find((mm: any) => mm.memberId === memberSlot.member.id)?.position || ''
                          isMinister = pos.includes('Ministro')
                        }

                        return (
                          <td key={`${event.id}-${rowIndex}`} className={`py-2 px-1 sm:px-2 border-2 border-[#1e3a8a] text-xs sm:text-base align-middle h-10 sm:h-12 whitespace-nowrap ${isMinister ? 'font-black' : 'font-semibold'}`}>
                            {memberSlot ? (
                              `${memberSlot.member.name.split(' ')[0]} ${memberSlot.member.name.split(' ').length > 1 ? memberSlot.member.name.split(' ').pop()?.charAt(0) + '.' : ''}`
                            ) : (
                              <span className="text-gray-400 font-bold">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                })
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
