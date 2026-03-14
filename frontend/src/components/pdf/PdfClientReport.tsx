import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { DiagnosticResult, QuadrantScore, Recommendation } from '../../shared/scoring/types.ts'
import { QUADRANT_LABELS, QUADRANT_PRODUCTS, NEED_COLORS, NEED_MESSAGES, NEED_LEGEND_MESSAGES, PRODUCT_LABELS } from '../../lib/constants.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'
import { BALOISE, ACTION_STYLES, PRIORITY_DOTS, type AdvisorInfo } from './pdf-tokens.ts'

const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingHorizontal: 40, paddingBottom: 50, fontFamily: 'Helvetica', fontSize: 10, color: BALOISE.navy },
  pageContinued: { paddingTop: 40, paddingHorizontal: 40, paddingBottom: 50, fontFamily: 'Helvetica', fontSize: 10, color: BALOISE.navy },
  header: { backgroundColor: BALOISE.navy, marginHorizontal: -40, paddingHorizontal: 40, paddingTop: 30, paddingBottom: 20, marginBottom: 30 },
  headerTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: BALOISE.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 11, color: '#b3b6d4' },
  headerDate: { fontSize: 8, color: '#656ea8', marginTop: 6 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 10, borderBottom: `1 solid ${BALOISE.grey200}`, paddingBottom: 6 },
  globalScoreContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 15, padding: 20, backgroundColor: BALOISE.grey50, borderRadius: 12 },
  globalScoreMessage: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 8 },
  globalScoreNumber: { fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  globalScoreLabel: { fontSize: 10, color: BALOISE.grey400, textAlign: 'center', marginTop: 4 },
  wheelImage: { width: 300, height: 300, alignSelf: 'center', marginVertical: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, padding: 8, backgroundColor: BALOISE.grey50, borderRadius: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  legendName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BALOISE.navy },
  legendMessage: { fontSize: 7.5, color: BALOISE.grey400, marginTop: 1 },
  universeCard: { marginBottom: 12, padding: 14, backgroundColor: BALOISE.white, borderRadius: 12, border: `0.5 solid ${BALOISE.grey200}`, borderLeft: '3 solid' },
  universeName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 4 },
  universeMessage: { fontSize: 9, color: BALOISE.grey400, lineHeight: 1.4 },
  actionItem: { marginBottom: 10, padding: 12, borderRadius: 8, borderLeft: '3 solid' },
  actionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 2 },
  actionDesc: { fontSize: 9, color: BALOISE.grey400 },
  actionProduct: { fontSize: 9, color: BALOISE.navy, marginTop: 4, fontFamily: 'Helvetica-Bold' },
  priorityBar: { width: 3, height: 12, borderRadius: 1.5 },
  priorityRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  advisorBox: { marginTop: 25, padding: 16, backgroundColor: BALOISE.navyLight, borderRadius: 12, borderLeft: `3 solid ${BALOISE.navy}` },
  advisorTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 6 },
  advisorInfo: { fontSize: 9, color: BALOISE.navy, marginBottom: 3 },
  advisorCta: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginTop: 10 },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5, color: BALOISE.grey300, borderTop: `0.5 solid ${BALOISE.grey200}`, paddingTop: 8 },
  introText: { fontSize: 9, color: BALOISE.grey400, marginBottom: 12 },
  nextStepsBox: { marginTop: 20, padding: 15, backgroundColor: BALOISE.navyLight, borderRadius: 8 },
  nextStepsTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: BALOISE.navyDark, marginBottom: 6 },
  nextStepsBody: { fontSize: 9, color: BALOISE.navy, lineHeight: 1.5 },
  disclaimerBox: { marginTop: 20, padding: 10, backgroundColor: BALOISE.grey100, borderRadius: 6 },
  disclaimerTitle: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: BALOISE.grey400, marginBottom: 3 },
  disclaimerBody: { fontSize: 7, color: BALOISE.grey300, lineHeight: 1.4 },
})

interface PdfClientReportProps {
  diagnostic: DiagnosticResult
  clientName?: string
  wheelImageUri?: string
  advisor?: AdvisorInfo
}

const SCORE_MESSAGES = [
  { max: 25, message: 'Votre protection est bien adaptée à votre situation' },
  { max: 50, message: 'Quelques points méritent votre attention' },
  { max: 75, message: 'Des lacunes significatives ont été identifiées' },
  { max: 100, message: 'Votre situation nécessite une action rapide' },
]

export default function PdfClientReport({ diagnostic, clientName, wheelImageUri, advisor }: PdfClientReportProps) {
  const globalColor = NEED_COLORS[getNeedLevel(diagnostic.globalScore)]
  const qualitativeMessage = SCORE_MESSAGES.find(m => diagnostic.globalScore <= m.max)?.message ?? SCORE_MESSAGES[3].message

  const activeUniverses = Object.entries(diagnostic.quadrantScores).filter(([, s]) => s.active) as [string, QuadrantScore][]
  const priorityActions = diagnostic.recommendations.filter((a: Recommendation) => a.type === 'immediate' || a.type === 'event')
  const pageCount = priorityActions.length > 0 ? 2 : 1

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Roue des Besoins Assurance</Text>
          <Text style={styles.headerSubtitle}>{'Votre diagnostic personnalisé'}{clientName ? ` — ${clientName}` : ''}</Text>
          <Text style={styles.headerDate}>{'Généré le '}{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre niveau de protection</Text>
          <View style={styles.globalScoreContainer}>
            <Text style={{ ...styles.globalScoreMessage, color: globalColor }}>{qualitativeMessage}</Text>
            <Text style={{ ...styles.globalScoreNumber, color: globalColor }}>{diagnostic.globalScore}/100</Text>
            <Text style={styles.globalScoreLabel}>Score de besoin</Text>
          </View>
        </View>

        {wheelImageUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre Roue des Besoins</Text>
            <Image src={wheelImageUri} style={styles.wheelImage} />
            {activeUniverses.map(([key, score]) => (
              <View key={key} style={styles.legendItem}>
                <View style={{ ...styles.legendDot, backgroundColor: NEED_COLORS[score.needLevel] }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendName}>{QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS]}</Text>
                  <Text style={{ fontSize: 7.5, color: BALOISE.navy, marginTop: 1 }}>{QUADRANT_PRODUCTS[key as keyof typeof QUADRANT_PRODUCTS]}</Text>
                  <Text style={styles.legendMessage}>{NEED_LEGEND_MESSAGES[score.needLevel]}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse par univers</Text>
          {activeUniverses.map(([key, score]) => (
            <View key={key} style={{ ...styles.universeCard, borderLeftColor: NEED_COLORS[score.needLevel] }}>
              <Text style={styles.universeName}>{QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS]}</Text>
              <Text style={styles.universeMessage}>{NEED_MESSAGES[score.needLevel]}</Text>
            </View>
          ))}
        </View>

        {advisor && (
          <View style={styles.advisorBox}>
            <Text style={styles.advisorTitle}>Votre conseiller Baloise</Text>
            <Text style={styles.advisorInfo}>{advisor.name}</Text>
            {advisor.phone && <Text style={styles.advisorInfo}>{`Tél : ${advisor.phone}`}</Text>}
            {advisor.email && <Text style={styles.advisorInfo}>{`Email : ${advisor.email}`}</Text>}
            <Text style={styles.advisorCta}>Prenez rendez-vous pour échanger sur vos résultats</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>{'Roue des Besoins Assurance — Document confidentiel'}</Text>
          <Text>Page 1/{pageCount}</Text>
        </View>
      </Page>

      {priorityActions.length > 0 && (
        <Page size="A4" style={styles.pageContinued}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions recommandées</Text>
            <Text style={styles.introText}>
              Voici les actions prioritaires identifiées lors de votre diagnostic.
            </Text>
            {priorityActions.map((action: Recommendation, i: number) => {
              const aStyle = ACTION_STYLES[action.type]
              return (
                <View key={i} style={{ ...styles.actionItem, backgroundColor: aStyle.bg, borderLeftColor: aStyle.border }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.message}</Text>
                  <Text style={styles.actionProduct}>{'Solution : '}{PRODUCT_LABELS[action.product] ?? action.product}</Text>
                  <View style={styles.priorityRow}>
                    {PRIORITY_DOTS.map(j => (
                      <View key={j} style={{ ...styles.priorityBar, backgroundColor: j < action.priority ? aStyle.border : BALOISE.grey200 }} />
                    ))}
                  </View>
                </View>
              )
            })}
          </View>

          <View style={styles.nextStepsBox}>
            <Text style={styles.nextStepsTitle}>Prochaines étapes</Text>
            <Text style={styles.nextStepsBody}>
              {advisor
                ? `1. Contactez votre conseiller ${advisor.name}${advisor.phone ? ` au ${advisor.phone}` : ''}\n2. Échangez sur les recommandations et demandez des devis personnalisés\n3. Planifiez un bilan de suivi dans 6 mois`
                : `1. Prenez contact avec votre conseiller pour discuter des recommandations\n2. Demandez des devis pour les couvertures identifiées comme prioritaires\n3. Planifiez un bilan de suivi dans 6 mois`
              }
            </Text>
          </View>

          {/* IDD Disclaimer (CRIT-3) */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>Information importante</Text>
            <Text style={styles.disclaimerBody}>
              {'Ce diagnostic est un outil d\'aide à la réflexion et ne constitue en aucun cas un conseil en assurance au sens de la Directive sur la Distribution d\'Assurance (IDD — Directive (UE) 2016/97). Les résultats présentés sont basés uniquement sur les informations que vous avez fournies et ne remplacent pas l\'analyse personnalisée d\'un conseiller en assurance qualifié. Veuillez consulter votre conseiller Baloise pour obtenir des recommandations adaptées à votre situation personnelle.'}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text>{'Roue des Besoins Assurance — Document confidentiel'}</Text>
            <Text>Page 2/{pageCount}</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
