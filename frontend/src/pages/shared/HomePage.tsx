import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.tsx'
import Icon from '../../components/ui/Icon.tsx'
import NeedsWheel, { WHEEL_SEGMENTS } from '../../components/landing/NeedsWheel.tsx'
import { QUADRANT_WHEEL_COLORS } from '../../lib/constants.ts'

/* ─────────────────────────────────────────
   Universe detail data
   ───────────────────────────────────────── */
const universeDetails = [
  {
    key: 'biens',
    label: 'Protection des biens',
    product: 'Home · Drive',
    icon: 'home' as const,
    color: QUADRANT_WHEEL_COLORS.biens.light,
    desc: 'Habitation, véhicules, objets de valeur : protégez votre patrimoine matériel au quotidien.',
    covers: ['Habitation & contenu', 'Auto & moto', 'Objets de valeur', 'Responsabilité civile'],
  },
  {
    key: 'personnes',
    label: 'Protection des personnes',
    product: 'Bsafe · Travel',
    icon: 'shield-check' as const,
    color: QUADRANT_WHEEL_COLORS.personnes.light,
    desc: 'Accidents, hospitalisation, voyages : sécurisez votre famille contre les aléas de la vie.',
    covers: ['Accidents de la vie', 'Hospitalisation & soins', 'Assistance voyage 24/7', 'Protection juridique'],
  },
  {
    key: 'futur',
    label: 'Protection du futur',
    product: 'Pension Plan',
    icon: 'gift' as const,
    color: QUADRANT_WHEEL_COLORS.futur.dark,
    desc: 'Épargne, retraite, prévoyance : préparez l\'avenir sereinement avec les solutions Baloise.',
    covers: ['Épargne-pension (art. 111bis)', 'Assurance vie', 'Capital retraite', 'Prévoyance fiscale'],
  },
  {
    key: 'projets',
    label: 'Protection des projets',
    product: 'GoodStart',
    icon: 'chart-pie' as const,
    color: QUADRANT_WHEEL_COLORS.projets.light,
    desc: 'Immobilier, investissements, nouveaux projets : accompagnez vos ambitions en toute sérénité.',
    covers: ['Acquisition immobilière', 'Solde restant dû', 'Projets d\'investissement', 'Épargne projet'],
  },
]

/* ─────────────────────────────────────────
   Steps data (condensed)
   ───────────────────────────────────────── */
const steps = [
  { num: '01', icon: 'users' as const, title: 'Complétez votre profil', desc: 'Situation familiale, biens et projets de vie.' },
  { num: '02', icon: 'chart-pie' as const, title: 'Diagnostic automatique', desc: 'Analyse de vos besoins dans 4 univers.' },
  { num: '03', icon: 'shield-check' as const, title: 'Recommandations ciblées', desc: 'Plan d\'action priorisé et rapport PDF.' },
]

/* ─────────────────────────────────────────
   Intersection observer hook
   ───────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      el.querySelectorAll('.reveal').forEach(c => c.classList.add('revealed'))
      return
    }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target) } }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    el.querySelectorAll('.reveal').forEach(c => io.observe(c))
    return () => io.disconnect()
  }, [])
  return ref
}

/* ─────────────────────────────────────────
   Component
   ───────────────────────────────────────── */
export default function HomePage() {
  const root = useReveal()
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const handleSegmentClick = useCallback((index: number) => {
    setActiveSegment(prev => prev === index ? null : index)
  }, [])

  /* Scroll detail into view on mobile when segment activates */
  useEffect(() => {
    if (activeSegment !== null && detailRef.current && window.innerWidth < 1024) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeSegment])

  const detail = activeSegment !== null ? universeDetails[activeSegment] : null

  return (
    <div ref={root} className="min-h-screen bg-white text-primary-700 overflow-x-hidden">

      {/* ════════════════════════════════════
          SCREEN 1: HERO WITH INTERACTIVE WHEEL
         ════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 overflow-hidden">
        {/* Background effects */}
        <div className="hero-grid absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 65% 50%, rgba(148, 227, 212, 0.03) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 40% 40% at 60% 50%, rgba(184, 178, 255, 0.025) 0%, transparent 60%)' }} />

        {/* Nav bar */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-bold text-xs">RB</span>
            </div>
            <span className="text-white/70 font-bold text-sm tracking-tight">Roue des Besoins</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/conseiller" className="text-sm text-white/30 hover:text-white/60 transition-colors duration-300">
              Espace conseiller
            </Link>
            <Link to="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)]">
              Connexion
            </Link>
          </div>
        </nav>

        {/* Main hero content: split layout */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 lg:py-0">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">

              {/* LEFT: Text content */}
              <div className="text-center lg:text-left">
                {/* Tag */}
                <div className="reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-teal hero-pulse-dot" />
                  <span className="text-xs font-bold text-white/60 tracking-wide">Baloise Luxembourg</span>
                </div>

                {/* Title */}
                <h1 className="reveal hero-title text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                  Votre couverture{' '}
                  <span className="hero-accent-text">analysée en profondeur</span>
                </h1>

                {/* Subtitle */}
                <p className="reveal text-base text-primary-200 max-w-md mx-auto lg:mx-0 leading-relaxed mb-8" style={{ transitionDelay: '120ms' }}>
                  Cliquez sur un univers de la roue pour découvrir ce qu'il couvre. Un diagnostic intelligent qui cartographie vos besoins et vous guide vers les bonnes décisions.
                </p>

                {/* CTA */}
                <div className="reveal flex flex-col sm:flex-row items-center lg:items-start gap-4" style={{ transitionDelay: '240ms' }}>
                  <Link to="/login">
                    <Button size="lg" className="hero-cta-btn px-8 py-3.5 text-base">
                      Démarrer mon diagnostic
                      <Icon name="chevron-right" size={18} strokeWidth={2} className="ml-2" />
                    </Button>
                  </Link>
                  <a href="#method" className="text-sm font-bold text-white/50 hover:text-white/80 transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] flex items-center gap-1.5">
                    En savoir plus
                    <Icon name="chevron-right" size={14} strokeWidth={2} />
                  </a>
                </div>

                {/* Trust line */}
                <p className="reveal mt-8 text-xs text-white/25 flex items-center justify-center lg:justify-start gap-1.5" style={{ transitionDelay: '360ms' }}>
                  <Icon name="lock" size={12} strokeWidth={1.5} />
                  Gratuit, confidentiel, sans engagement
                </p>
              </div>

              {/* RIGHT: Wheel + Detail panel */}
              <div className="reveal flex flex-col items-center" style={{ transitionDelay: '200ms' }}>
                {/* Wheel container */}
                <div className="relative w-full max-w-[480px] mx-auto px-6 sm:px-0">
                  {/* Ambient glow behind wheel - reacts to active segment */}
                  <div
                    className="absolute inset-0 scale-[1.3] rounded-full pointer-events-none wheel-ambient-glow"
                    style={{
                      background: activeSegment !== null
                        ? `radial-gradient(circle, ${WHEEL_SEGMENTS[activeSegment].glowColor} 0%, rgba(148, 227, 212, 0.04) 40%, transparent 70%)`
                        : 'radial-gradient(circle, rgba(148, 227, 212, 0.06) 0%, rgba(184, 178, 255, 0.03) 40%, transparent 70%)',
                      transition: 'background 500ms cubic-bezier(0.25, 0.8, 0.5, 1)',
                    }}
                  />
                  <NeedsWheel
                    className="relative z-10 w-full hero-wheel-float"
                    activeSegment={activeSegment}
                    onSegmentClick={handleSegmentClick}
                  />
                </div>

                {/* Hint text when no segment is selected */}
                {activeSegment === null && (
                  <p className="mt-4 text-xs text-white/30 text-center wheel-hint-text">
                    Cliquez sur un segment pour explorer
                  </p>
                )}

                {/* Detail panel */}
                <div
                  ref={detailRef}
                  className={`w-full max-w-[480px] mt-4 wheel-detail-panel ${activeSegment !== null ? 'wheel-detail-open' : 'wheel-detail-closed'}`}
                >
                  {detail && (
                    <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl ring-1 ring-white/[0.08] p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: `${detail.color}25` }}
                          >
                            <Icon name={detail.icon} size={20} strokeWidth={1.5} style={{ color: detail.color }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{detail.label}</h3>
                            <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: `${detail.color}cc` }}>
                              {detail.product}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSegment(null)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)]"
                          aria-label="Fermer le panneau"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-white/70 leading-relaxed mb-4">{detail.desc}</p>

                      {/* Covers list */}
                      <div className="grid grid-cols-2 gap-2">
                        {detail.covers.map(item => (
                          <div key={item} className="flex items-center gap-2 text-xs text-white/55">
                            <Icon name="check" size={13} strokeWidth={2.5} className="text-accent-teal shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          SCREEN 2: METHOD + STATS + CTA + FOOTER
         ════════════════════════════════════ */}
      <section id="method" className="bg-white">
        {/* Steps row */}
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 lg:py-20">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-bold text-primary-400 tracking-widest uppercase mb-3">Méthode</p>
            <h2 className="reveal text-2xl lg:text-3xl font-bold text-primary-700 tracking-tight">
              Trois étapes, zéro complexité
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-2 md:gap-6 lg:gap-10">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="reveal group relative"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Connector (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+36px)] right-[calc(-50%+36px)] h-px bg-gradient-to-r from-primary-100 to-transparent" />
                )}
                <div className="text-center px-4 py-3 md:py-6">
                  <span className="text-xs font-bold text-primary-200 tracking-widest mb-3 block">{step.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] group-hover:bg-primary-100">
                    <Icon name={step.icon} size={20} strokeWidth={1.5} className="text-primary-700" />
                  </div>
                  <h3 className="text-sm font-bold text-primary-700 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-grey-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-grey-100">
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
            <div className="reveal flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              {[
                { value: '4', label: 'Univers analysés' },
                { value: '<10', label: 'Minutes' },
                { value: '100%', label: 'Gratuit' },
                { value: 'PDF', label: 'Rapport détaillé' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xl lg:text-2xl font-bold text-primary-700 tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-grey-300 font-bold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA band */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 relative overflow-hidden">
          <div className="hero-grid absolute inset-0 pointer-events-none opacity-40" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-14 lg:py-16 text-center">
            <h2 className="reveal text-2xl lg:text-3xl font-bold text-white tracking-tight mb-4">
              Prêt à évaluer votre couverture ?
            </h2>
            <p className="reveal text-sm text-primary-200 max-w-md mx-auto leading-relaxed mb-8" style={{ transitionDelay: '80ms' }}>
              En quelques minutes, obtenez un diagnostic clair et des recommandations personnalisées.
            </p>
            <div className="reveal" style={{ transitionDelay: '160ms' }}>
              <Link
                to="/login"
                className="hero-cta-btn inline-flex items-center justify-center font-bold rounded px-8 py-3.5 text-base bg-white text-primary-700 hover:bg-grey-50 active:bg-grey-100 shadow-elevated transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
              >
                Démarrer mon diagnostic
                <Icon name="chevron-right" size={18} strokeWidth={2} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-primary-950 py-6 px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                <span className="text-white font-bold text-[10px]">RB</span>
              </div>
              <span className="text-white/40 font-bold text-sm tracking-tight">Roue des Besoins</span>
            </div>
            <p className="text-[11px] text-white/20">
              &copy; {new Date().getFullYear()} Baloise Luxembourg. Tous droits réservés.
            </p>
          </div>
        </footer>
      </section>
    </div>
  )
}
