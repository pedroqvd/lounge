"use client"

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, CheckCircle2, Heart, Users, Target, Zap, Globe, Leaf, BookOpen, Link, Star, Home, CloudLightning, HandHeart, Sparkles } from 'lucide-react'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function AnimatedSection({ children, className = '', delay = 0, id }: any) {
  const { ref, inView } = useInView()
  return (
    <section id={id} ref={ref as any} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </section>
  )
}

function TimelineItem({ year, title, text, align = 'left', delay = 0, color }: any) {
  const { ref, inView } = useInView(0.5)
  const isLeft = align === 'left'
  return (
    <div ref={ref as any} className={`flex flex-col md:flex-row items-center justify-between w-full mb-16 md:mb-24 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${delay}s` }}>
      <div className={`order-2 md:order-1 w-full md:w-5/12 ${isLeft ? 'md:text-right md:pr-12' : 'md:hidden'}`}>
        {isLeft && (
          <div className="bg-card border border-border/50 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }} />
            <h3 className="text-3xl font-black mb-2" style={{ color }}>{year}</h3>
            <h4 className="text-xl font-bold mb-3">{title}</h4>
            <p className="text-muted-foreground leading-relaxed">{text}</p>
          </div>
        )}
      </div>
      
      <div className="order-1 md:order-2 w-12 h-12 rounded-full border-4 border-background shrink-0 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.1)] mb-6 md:mb-0 relative z-10" style={{ backgroundColor: color }}>
        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
      </div>
      
      <div className={`order-3 w-full md:w-5/12 ${!isLeft ? 'md:text-left md:pl-12' : 'md:hidden'}`}>
        {!isLeft && (
          <div className="bg-card border border-border/50 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }} />
            <h3 className="text-3xl font-black mb-2" style={{ color }}>{year}</h3>
            <h4 className="text-xl font-bold mb-3">{title}</h4>
            <p className="text-muted-foreground leading-relaxed">{text}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SobreClient({ globalSettings, settings }: any) {
  const primaryColor = globalSettings?.primaryColor || '#6366f1'
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* NAVBAR */}
      <header className="fixed top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Voltar para o Início
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
           <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: primaryColor }} />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20" style={{ backgroundColor: primaryColor }} />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center pt-20">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ color: primaryColor, borderColor: primaryColor + '40', backgroundColor: primaryColor + '10' }}>
            Nossa História e Essência
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            A Igreja do Futuro.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Conectar com Deus, despertar potenciais e transformar realidades. 
            Uma igreja urbana, contextualizada em sua cultura e conectada com a nossa geração.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Breve Histórico</h2>
            <p className="text-xl text-muted-foreground">Como tudo começou</p>
          </div>

          <div className="relative">
            {/* Linha central */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-border/50 -translate-x-1/2 rounded-full" />
            
            <TimelineItem 
              year="2015" 
              title="O Sonho Inicial" 
              text="O ponto principal das conversas girava em torno da seguinte questão: Como as transformações sociais em curso no século XXI, principalmente a transformação digital e as novas tecnologias, iriam afetar a vida cristã nos próximos anos?" 
              align="left" 
              color="#3b82f6" 
            />
            <TimelineItem 
              year="Setembro de 2016" 
              title="A Decisão" 
              text="O casal de pastores, Osvaldo e Fernanda, tomou a decisão de tornar o sonho realidade. Formaram um grupo base que começou a se encontrar buscando desenvolver uma igreja relevante para o século XXI, distinguindo doutrina (bíblica) de práticas (modernas e contextualizadas)." 
              align="right" 
              color="#8b5cf6" 
            />
            <TimelineItem 
              year="15 de Abril de 2017" 
              title="A Fundação" 
              text="A primeira reunião pública aconteceu no dia 1º de janeiro. Mas foi em 15 de abril que a Millenium foi organizada oficialmente por 40 membros fundadores. Nasceu o desejo de ser uma igreja 'fora das quatro paredes'." 
              align="left" 
              color="#ec4899" 
            />
            <TimelineItem 
              year="Hoje e o Futuro" 
              title="Expansão Global e Nacional" 
              text="Adotamos projetos em Guiné Bissau (África) construindo uma escola para 250 crianças, na Índia apoiando viúvas, e na Turquia com refugiados. No Brasil, plantamos campus em Bom Jesus (PI) e no Gama (DF). O sonho é impactar cada continente do globo." 
              align="right" 
              color={primaryColor} 
            />
          </div>
        </div>
      </section>

      {/* GERAÇÃO MILLENIUM */}
      <AnimatedSection className="py-24 bg-secondary/10 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">A Geração Millenium</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Decidimos chamar a igreja de Millenium porque a Geração Y (1980 - 2000) representará 75% da força de trabalho. Queremos ser a resposta de Deus e a igreja preferida dessa geração.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'Vida Social', desc: 'Aprecia acessar redes sociais; escutar música; é um cidadão do mundo que faz do smartphone a extensão do seu corpo.' },
              { icon: Heart, title: 'Vida Familiar', desc: 'Deseja uma estrutura familiar menor, prática e funcional. O propósito é compartilhar problemas, despesas e viver momentos de qualidade.' },
              { icon: Zap, title: 'Vida Profissional', desc: 'Quer manter a vida profissional e pessoal balanceada. Deseja flexibilidade e busca "mudar o mundo" e impactar realidades.' },
              { icon: Target, title: 'Vida Financeira', desc: 'Seus maiores sonhos são: conhecer o mundo; ter uma boa formação; e ajudar o próximo, ganhando o suficiente para viver de forma confortável.' },
              { icon: Link, title: 'Vida Religiosa', desc: 'É um grande desafio, pois figuras tradicionais nem sempre são vistas com bondade. Querem fé conectada com ações reais.' },
              { icon: Leaf, title: 'Vida Socioambiental', desc: 'Tem uma ética social muito forte e uma sensibilidade ecológica profunda. Pensa no futuro do planeta e quer fazer a diferença agora.' },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: primaryColor + '15', color: primaryColor }}>
                  <item.icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* MISSÃO, VISÃO, PROPÓSITO */}
      <AnimatedSection className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-20">Nossa Cultura Organizacional</h2>
          
          <div className="space-y-12">
            <div className="bg-gradient-to-br from-card to-secondary/30 p-10 md:p-14 rounded-[3rem] border border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: primaryColor }} />
              <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-widest mb-4">O Propósito</h3>
              <p className="text-3xl md:text-4xl font-extrabold leading-tight">
                Honrar a Deus e fazer discípulos de todas as nações.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-card to-secondary/30 p-10 md:p-14 rounded-[3rem] border border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: primaryColor }} />
              <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-widest mb-4">A Missão</h3>
              <p className="text-3xl md:text-4xl font-extrabold leading-tight">
                Conectar com Deus, despertar potenciais e transformar realidades.
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-secondary/30 p-10 md:p-14 rounded-[3rem] border border-border shadow-xl relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-full h-2" style={{ backgroundColor: primaryColor }} />
               <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-widest mb-4">A Visão 2050</h3>
               <p className="text-3xl md:text-4xl font-extrabold leading-tight mb-8">
                 Ser reconhecida como uma das Igrejas mais relevantes da cidade, que atende com qualidade todas as gerações, mas é a Igreja preferida da geração Millenium.
               </p>
               <div className="text-left bg-background/50 backdrop-blur-md p-8 rounded-3xl border border-border/50 italic text-muted-foreground">
                 "A Millenium que eu vejo é viva, cheia do Espírito Santo, atuante, influenciadora, santa, bonita e contextualizada no tempo e na cultura. É uma embaixada do Reino de Deus no mundo."
               </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* VALORES */}
      <AnimatedSection className="py-24 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Nossos Valores</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">Valores inegociáveis que norteiam a nossa essência e quem somos no dia a dia.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: BookOpen, title: 'Vida no Secreto', desc: 'Intimidade com Deus. Oração, jejum e leitura da Palavra. Nada é mais importante do que estar na Presença.' },
              { icon: Users, title: 'Vida Comunitária', desc: 'No templo e nas casas. A Igreja é o Corpo. Esperamos relacionamento verdadeiro no dia a dia e comunhão nos Happy Hours (HHs).' },
              { icon: CloudLightning, title: 'Vida de Testemunho', desc: 'Não abrimos mão de uma vida sobrenatural em AMOR e PODER. O sobrenatural deve ser o nosso natural.' },
              { icon: HandHeart, title: 'Vida de Generosidade', desc: 'Amamos e por isso doamos. Sustentamos a igreja, a obra missionária e os mais necessitados com o nosso melhor.' },
            ].map((v, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-background/5 border border-white/10 hover:bg-background/10 transition-colors group">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <v.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
                <p className="opacity-70 leading-relaxed text-lg">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <div className="w-20 h-20 bg-card border border-border shadow-xl rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Sparkles className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">Você é a resposta.</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            A Millenium foi chamada por Deus para ser uma resposta para esta geração. Você também faz parte deste projeto.
          </p>
          <a href="/" className="inline-flex items-center justify-center px-10 py-5 text-white font-black rounded-full shadow-2xl transition-all hover:scale-105 text-xl" style={{ backgroundColor: primaryColor }}>
            Fazer parte da Família
          </a>
        </div>
      </section>
      
    </div>
  )
}
