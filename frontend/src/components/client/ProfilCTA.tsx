import Card from '../ui/Card.tsx'
import Icon from '../ui/Icon.tsx'
import Button from '../ui/Button.tsx'

interface ProfilCTAProps {
  onNavigate: () => void
}

export default function ProfilCTA({ onNavigate }: ProfilCTAProps) {
  return (
    <div className="max-w-md mx-auto mb-8">
      <Card className="text-center">
        <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 ring-1 ring-primary-700/10">
          <Icon name="badge-check" size={28} className="text-primary-700" />
        </div>
        <h2 className="text-lg font-bold text-primary-700 mb-2">Commencez par votre profil</h2>
        <p className="text-sm text-grey-400 mb-6 leading-relaxed max-w-xs mx-auto">
          Quelques questions rapides pour personnaliser votre diagnostic et débloquer la roue.
        </p>
        <Button onClick={onNavigate} size="lg">
          Compléter mon profil
        </Button>
      </Card>
    </div>
  )
}
