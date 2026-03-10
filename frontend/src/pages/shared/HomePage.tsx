import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.tsx'
import Icon from '../../components/ui/Icon.tsx'
import NeedsWheel from '../../components/landing/NeedsWheel.tsx'

/* ───────────────────────────────────────────
   Intersection-observer hook for scroll reveals
   ─────────────────────────────────────────── */
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

/* ───────────────────────────────────────────
   Data
   ─────────────────────────────────────────── */
const steps = [
  { num: '01', icon: 'users' as const, title: 'Complétez votre profil', desc: 'Renseignez votre situation familiale, vos biens et vos projets de vie en quelques minutes.' },
  { num: '02', icon: 'chart-pie' as const, title: 'Diagnostic automatique', desc: 'Notre algorithme analyse vos réponses et identifie vos besoins réels dans chaque univers.' },
  { num: '03', icon: 'shield-check' as const, title: 'Recommandations ciblées', desc: 'Recevez un plan d\'action priorisé et un rapport PDF détaillé, prêt pour votre conseiller.' },
]

const universes = [
  { key: 'personnes', label: 'Protection des personnes', product: 'Bsafe', icon: 'shield-check' as const, color: '#0014aa', accent: 'rgba(0, 20, 170, 0.08)', desc: 'Hospitalisation, incapacité de travail, décès : sécurisez votre famille.' },
  { key: 'biens', label: 'Protection des biens', product: 'Home', icon: 'home' as const, color: '#293485', accent: 'rgba(41, 52, 133, 0.08)', desc: 'Habitation, contenu, responsabilité civile : protégez votre patrimoine immobilier.' },
  { key: 'futur', label: 'Protection du futur', product: 'Pension Plan', icon: 'gift' as const, color: '#3d4691', accent: 'rgba(61, 70, 145, 0.08)', desc: 'Épargne, retraite, prévoyance fiscale : préparez l\'avenir sereinement.' },
  { key: 'projets', label: 'Protection des projets', product: 'Drive', icon: 'car' as const, color: '#656ea8', accent: 'rgba(101, 110, 168, 0.08)', desc: 'Véhicule, mobilité, assistance : roulez l\'esprit tranquille.' },
]

const advantages = [
  { icon: 'badge-check' as const, title: 'Personnalisé', desc: 'Un diagnostic basé sur votre situation réelle, pas un questionnaire générique.' },
  { icon: 'chart-pie' as const, title: 'Rapide', desc: 'Moins de 10 minutes pour un panorama complet de vos besoins d\'assurance.' },
  { icon: 'lock' as const, title: 'Confidentiel', desc: 'Vos données sont chiffrées et protégées. Aucun partage sans votre accord.' },
  { icon: 'document' as const, title: 'Actionnable', desc: 'Un rapport PDF avec des recommandations concrètes et hiérarchisées.' },
]

/* ───────────────────────────────────────────
   Component
   ─────────────────────────────────────────── */
export default function HomePage() {
  const root = useReveal()

  return (
    <div ref={root} className="min-h-screen bg-white text-primary-700 overflow-x-hidden">

      {/* ════════════════════════════════════
          HERO
         ════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 overflow-hidden">
        {/* Background effects */}
        <div className="hero-grid absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(148, 227, 212, 0.04) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(184, 178, 255, 0.03) 0%, transparent 60%)' }} />

        {/* Nav bar */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-bold text-xs">RB</span>
            </div>
            <span className="text-white/70 font-bold text-sm tracking-tight">Roue des Besoins</span>
          </div>
          <Link to="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)]">
            Connexion
          </Link>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Tag */}
          <div className="reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal hero-pulse-dot" />
            <span className="text-xs font-bold text-white/60 tracking-wide">Baloise Luxembourg</span>
          </div>

          {/* Title */}
          <h1 className="reveal hero-title text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Votre couverture d'assurance,{' '}
            <span className="hero-accent-text">analysée en profondeur</span>
          </h1>

          {/* Subtitle */}
          <p className="reveal text-base sm:text-lg text-primary-200 max-w-xl mx-auto leading-relaxed mb-10" style={{ transitionDelay: '120ms' }}>
            Un diagnostic intelligent qui cartographie vos besoins dans 4 univers de protection et vous guide vers les bonnes décisions.
          </p>

          {/* CTA */}
          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" style={{ transitionDelay: '240ms' }}>
            <Link to="/login">
              <Button size="lg" className="hero-cta-btn px-8 py-3.5 text-base">
                Démarrer mon diagnostic
                <Icon name="chevron-right" size={18} strokeWidth={2} className="ml-2" />
              </Button>
            </Link>
            <a href="#how" className="text-sm font-bold text-white/50 hover:text-white/80 transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] flex items-center gap-1.5">
              Comment ça marche
              <Icon name="chevron-right" size={14} strokeWidth={2} />
            </a>
          </div>

          {/* Wheel */}
          <div className="reveal relative mx-auto w-64 sm:w-72 lg:w-80" style={{ transitionDelay: '360ms' }}>
            {/* Glow behind wheel */}
            <div className="absolute inset-0 scale-125 hero-wheel-glow rounded-full" />
            <NeedsWheel className="relative z-10 w-full hero-wheel-float" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hero-scroll-hint">
          <span className="text-[10px] font-bold text-white/25 tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full bg-white/40 hero-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
         ════════════════════════════════════ */}
      <section id="how" className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="reveal text-xs font-bold text-primary-400 tracking-widest uppercase mb-3">Méthode</p>
            <h2 className="reveal text-3xl lg:text-4xl font-bold text-primary-700 tracking-tight mb-4">
              Trois étapes, zéro complexité
            </h2>
            <p className="reveal text-grey-400 max-w-md mx-auto leading-relaxed" style={{ transitionDelay: '80ms' }}>
              Un parcours fluide conçu pour vous donner des réponses claires en quelques minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="reveal group relative"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Connector line (hidden on last card and mobile) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px bg-gradient-to-r from-primary-100 to-transparent" />
                )}
                <div className="relative bg-white rounded-xl p-8 shadow-card transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] hover:shadow-card-hover hover:-translate-y-0.5">
                  {/* Step number */}
                  <span className="text-xs font-bold text-primary-200 tracking-widest mb-4 block">{step.num}</span>
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-5 transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] group-hover:bg-primary-100">
                    <Icon name={step.icon} size={22} strokeWidth={1.5} className="text-primary-700" />
                  </div>
                  <h3 className="text-base font-bold text-primary-700 mb-2">{step.title}</h3>
                  <p className="text-sm text-grey-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          UNIVERSES
         ════════════════════════════════════ */}
      <section id="universes" className="py-24 lg:py-32 px-6 bg-grey-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="reveal text-xs font-bold text-primary-400 tracking-widest uppercase mb-3">Couverture</p>
            <h2 className="reveal text-3xl lg:text-4xl font-bold text-primary-700 tracking-tight mb-4">
              Quatre univers de protection
            </h2>
            <p className="reveal text-grey-400 max-w-lg mx-auto leading-relaxed" style={{ transitionDelay: '80ms' }}>
              Chaque univers couvre un pan essentiel de votre vie. Le diagnostic les analyse tous pour une vision à 360 degrés.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {universes.map((u, i) => (
              <div
                key={u.key}
                className="reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="group relative bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] hover:shadow-card-hover hover:-translate-y-0.5">
                  {/* Accent top bar */}
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${u.color}, ${u.color}88)` }} />
                  <div className="p-7">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] group-hover:scale-105"
                        style={{ background: u.accent }}
                      >
                        <Icon name={u.icon} size={22} strokeWidth={1.5} style={{ color: u.color }} />
                      </div>
                      <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: `${u.color}99` }}>
                        {u.product}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-primary-700 mb-2">{u.label}</h3>
                    <p className="text-sm text-grey-400 leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHY / ADVANTAGES
         ════════════════════════════════════ */}
      <section id="why" className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="reveal text-xs font-bold text-primary-400 tracking-widest uppercase mb-3">Avantages</p>
            <h2 className="reveal text-3xl lg:text-4xl font-bold text-primary-700 tracking-tight mb-4">
              Pourquoi utiliser la Roue des Besoins
            </h2>
            <p className="reveal text-grey-400 max-w-md mx-auto leading-relaxed" style={{ transitionDelay: '80ms' }}>
              Un outil conçu par et pour les conseillers Baloise, accessible à tous les clients.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, i) => (
              <div
                key={adv.title}
                className="reveal text-center px-4 py-8"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                  <Icon name={adv.icon} size={24} strokeWidth={1.5} className="text-primary-700" />
                </div>
                <h3 className="text-base font-bold text-primary-700 mb-2">{adv.title}</h3>
                <p className="text-sm text-grey-400 leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="reveal mt-16 flex flex-wrap items-center justify-center gap-8 lg:gap-16 py-8 border-t border-grey-100" style={{ transitionDelay: '200ms' }}>
            {[
              { value: '4', label: 'Univers analysés' },
              { value: '<10', label: 'Minutes' },
              { value: '100%', label: 'Gratuit' },
              { value: 'PDF', label: 'Rapport détaillé' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-primary-700 tracking-tight">{s.value}</p>
                <p className="text-xs text-grey-300 font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FINAL CTA
         ════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 px-6 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 overflow-hidden">
        {/* Grid bg */}
        <div className="hero-grid absolute inset-0 pointer-events-none opacity-50" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(148, 227, 212, 0.03) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="reveal text-3xl lg:text-4xl font-bold text-white tracking-tight mb-5">
            Prêt à évaluer votre couverture ?
          </h2>
          <p className="reveal text-primary-200 max-w-md mx-auto leading-relaxed mb-10" style={{ transitionDelay: '80ms' }}>
            En quelques minutes, obtenez un diagnostic clair de vos besoins d'assurance et des recommandations personnalisées.
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
          <p className="reveal mt-6 text-xs text-white/30 flex items-center justify-center gap-1.5" style={{ transitionDelay: '240ms' }}>
            <Icon name="lock" size={12} strokeWidth={1.5} />
            Gratuit, confidentiel, sans engagement
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
         ════════════════════════════════════ */}
      <footer className="bg-primary-950 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
    </div>
  )
}
