import PageHeader from '../../components/ui/PageHeader.tsx'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-grey-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <PageHeader
          title="Politique de confidentialit\u00e9"
          backLink={{ to: '/', label: 'Retour' }}
        />

        <div className="space-y-8 text-sm text-grey-500 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">1. Responsable du traitement</h2>
            <p>
              Baloise Assurances Luxembourg S.A., soci\u00e9t\u00e9 anonyme de droit luxembourgeois,
              dont le si\u00e8ge social est \u00e0 Bertrange, Luxembourg (ci-apr\u00e8s \u00ab\u00a0Baloise\u00a0\u00bb),
              est responsable du traitement de vos donn\u00e9es personnelles dans le cadre de l&apos;outil
              \u00ab\u00a0Roue des Besoins\u00a0\u00bb.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">2. Donn\u00e9es collect\u00e9es</h2>
            <p>Dans le cadre du diagnostic, nous collectons\u00a0:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Donn\u00e9es d&apos;identification\u00a0: adresse e-mail, nom et pr\u00e9nom (facultatif)</li>
              <li>Donn\u00e9es de profil\u00a0: \u00e2ge, situation familiale, statut professionnel, r\u00e9sidence</li>
              <li>R\u00e9ponses au questionnaire\u00a0: informations sur vos biens, personnes \u00e0 charge, projets et pr\u00e9voyance</li>
              <li>R\u00e9sultats du diagnostic\u00a0: scores, recommandations g\u00e9n\u00e9r\u00e9es</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">3. Finalit\u00e9s du traitement</h2>
            <p>Vos donn\u00e9es sont trait\u00e9es pour\u00a0:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>G\u00e9n\u00e9rer votre diagnostic personnalis\u00e9 de besoins en assurance</li>
              <li>Permettre \u00e0 votre conseiller d&apos;acc\u00e9der \u00e0 vos r\u00e9sultats (si vous y consentez)</li>
              <li>Am\u00e9liorer la qualit\u00e9 de l&apos;outil et de nos services</li>
            </ul>
            <p className="mt-2">
              Base l\u00e9gale\u00a0: consentement (art.\u00a06.1.a RGPD) et int\u00e9r\u00eat l\u00e9gitime (art.\u00a06.1.f RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">4. Dur\u00e9e de conservation</h2>
            <p>
              Vos donn\u00e9es sont conserv\u00e9es pendant une dur\u00e9e maximale de <strong>3\u00a0ans</strong> \u00e0
              compter de votre derni\u00e8re activit\u00e9. Pass\u00e9 ce d\u00e9lai, elles sont automatiquement supprim\u00e9es.
              Vous pouvez demander la suppression anticip\u00e9e \u00e0 tout moment via votre tableau de bord.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">5. Vos droits</h2>
            <p>Conform\u00e9ment au RGPD, vous disposez des droits suivants\u00a0:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Acc\u00e8s</strong>\u00a0: obtenir une copie de vos donn\u00e9es (export depuis le tableau de bord)</li>
              <li><strong>Rectification</strong>\u00a0: corriger vos donn\u00e9es inexactes</li>
              <li><strong>Effacement</strong>\u00a0: supprimer vos donn\u00e9es (\u00ab\u00a0droit \u00e0 l&apos;oubli\u00a0\u00bb)</li>
              <li><strong>Portabilit\u00e9</strong>\u00a0: recevoir vos donn\u00e9es dans un format structur\u00e9 (JSON)</li>
              <li><strong>Opposition</strong>\u00a0: vous opposer au traitement de vos donn\u00e9es</li>
              <li><strong>Limitation</strong>\u00a0: restreindre le traitement dans certains cas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">6. D\u00e9l\u00e9gu\u00e9 \u00e0 la protection des donn\u00e9es (DPO)</h2>
            <p>
              Pour exercer vos droits ou pour toute question relative \u00e0 la protection de vos donn\u00e9es,
              vous pouvez contacter notre DPO\u00a0:
            </p>
            <p className="mt-2 font-bold">dpo@baloise.lu</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">7. Autorit\u00e9 de contr\u00f4le</h2>
            <p>
              Vous disposez du droit d&apos;introduire une r\u00e9clamation aupr\u00e8s de la Commission Nationale
              pour la Protection des Donn\u00e9es (CNPD)\u00a0:
            </p>
            <p className="mt-2">
              CNPD \u2014 15, Boulevard du Jazz, L-4370 Belvaux<br />
              T\u00e9l.\u00a0: (+352)\u00a026\u00a010\u00a060-1
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-3">8. S\u00e9curit\u00e9</h2>
            <p>
              Vos donn\u00e9es sont h\u00e9berg\u00e9es sur des serveurs s\u00e9curis\u00e9s avec chiffrement en transit (TLS)
              et au repos. L&apos;acc\u00e8s est prot\u00e9g\u00e9 par authentification et contr\u00f4le d&apos;acc\u00e8s
              bas\u00e9 sur les r\u00f4les (Row Level Security).
            </p>
          </section>

          <p className="text-xs text-grey-300 pt-4 border-t border-grey-200">
            Derni\u00e8re mise \u00e0 jour\u00a0: mars 2026
          </p>
        </div>
      </div>
    </div>
  )
}
