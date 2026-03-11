import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.tsx'
import Icon from '../../components/ui/Icon.tsx'

const features = [
  { icon: 'users' as const, title: 'Portefeuille clients', desc: 'Vue d\'ensemble de vos clients et de leur couverture d\'assurance.' },
  { icon: 'chart-pie' as const, title: 'Diagnostics détaillés', desc: 'Analyse approfondie des besoins par univers avec scores et pondération.' },
  { icon: 'document' as const, title: 'Rapports PDF', desc: 'Générez des rapports personnalisés pour accompagner vos entretiens.' },
]

export default function AdvisorHomePage() {
  return (
    <div className="min-h-screen bg-white text-primary-700 overflow-x-hidden">
      {/* Hero section */}
      <section className="relative min-h-screen flex flex-col bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 overflow-hidden">
        <div className="hero-grid absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(148, 227, 212, 0.03) 0%, transparent 70%)' }} />

        {/* Nav bar */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-bold text-xs">RB</span>
            </div>
            <span className="text-white/70 font-bold text-sm tracking-tight">Roue des Besoins</span>
            <span className="text-xs bg-white/10 text-white/60 ring-1 ring-white/10 px-2 py-0.5 rounded-full font-bold">Conseiller</span>
          </div>
          <Link to="/conseiller/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors duration-300">
            Connexion
          </Link>
        </nav>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-4xl mx-auto px-6 md:px-12 py-16 text-center">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal hero-pulse-dot" />
              <span className="text-xs font-bold text-white/60 tracking-wide">Espace professionnel</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Accompagnez vos clients
              <br />
              <span className="hero-accent-text">avec precision</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base text-primary-200 max-w-lg mx-auto leading-relaxed mb-10">
              Visualisez les besoins d'assurance de chaque client, suivez leur score de couverture et préparez vos entretiens avec des données concrètes.
            </p>

            {/* CTA */}
            <Link to="/conseiller/login">
              <Button size="lg" className="hero-cta-btn px-8 py-3.5 text-base">
                Accéder à mon espace
                <Icon name="chevron-right" size={18} strokeWidth={2} className="ml-2" />
              </Button>
            </Link>

            {/* Trust line */}
            <p className="mt-8 text-xs text-white/25 flex items-center justify-center gap-1.5">
              <Icon name="lock" size={12} strokeWidth={1.5} />
              Accès réservé aux conseillers habilités
            </p>

            {/* Feature cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-16">
              {features.map(f => (
                <div key={f.title} className="bg-white/[0.05] backdrop-blur-sm rounded-xl ring-1 ring-white/[0.08] p-6 text-left">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center mb-4">
                    <Icon name={f.icon} size={20} strokeWidth={1.5} className="text-white/60" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
    </div>
  )
}
