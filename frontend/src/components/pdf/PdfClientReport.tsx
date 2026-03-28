import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'
import type { DiagnosticResult, QuadrantScore, Recommendation } from '../../shared/scoring/types.ts'
import { QUADRANT_LABELS, QUADRANT_PRODUCTS, NEED_COLORS, NEED_LABELS, NEED_MESSAGES, NEED_LEGEND_MESSAGES, PRODUCT_LABELS, IDD_DISCLAIMER_TEXT, getGlobalScoreMessage, getPriorityLabel } from '../../lib/constants.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'
import { BALOISE, ACTION_STYLES, type AdvisorInfo } from './pdf-tokens.ts'
import { BALOISE_LOGO_PATH } from '../../shared/brand/logo-path.ts'

/* ─── Baloise Logo (SVG for @react-pdf/renderer) ─── */
function BaloisePdfLogo() {
  return (
    <Svg viewBox="0 0 419 85" style={{ height: 16, width: 79 }}>
      <Path d={BALOISE_LOGO_PATH} fill="#ffffff" />
    </Svg>
  )
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingHorizontal: 40, paddingBottom: 50, fontFamily: 'Helvetica', fontSize: 9, color: BALOISE.navy },
  pageContinued: { paddingTop: 40, paddingHorizontal: 40, paddingBottom: 50, fontFamily: 'Helvetica', fontSize: 9, color: BALOISE.navy },
  header: { backgroundColor: BALOISE.navy, marginHorizontal: -40, paddingHorizontal: 40, paddingTop: 24, paddingBottom: 18, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: BALOISE.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 10, color: '#b3b6d4' },
  headerDate: { fontSize: 8, color: '#b3b6d4', marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 8, borderBottom: `1.5 solid ${BALOISE.navy}`, paddingBottom: 5 },
  globalScoreContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 12, padding: 18, backgroundColor: '#e5e7f0', borderRadius: 8 },
  globalScoreMessage: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  wheelImage: { width: 250, height: 250, alignSelf: 'center', marginVertical: 8 },
  /* Merged legend + analysis card */
  diagCard: { marginBottom: 8, padding: 10, backgroundColor: BALOISE.grey50, borderRadius: 8, borderLeft: '3 solid', flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  diagDot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  diagName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.navy },
  diagProducts: { fontSize: 8, color: BALOISE.navy, fontFamily: 'Helvetica-Bold', marginTop: 1 },
  diagLevel: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 1 },
  diagMessage: { fontSize: 8, color: BALOISE.navy, marginTop: 2, lineHeight: 1.4 },
  /* CTA box */
  ctaBox: { marginTop: 16, padding: 14, backgroundColor: '#e5e7f0', borderRadius: 8, borderLeft: `3 solid ${BALOISE.navy}` },
  ctaTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 4 },
  ctaText: { fontSize: 9, color: BALOISE.navy },
  ctaCta: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginTop: 8 },
  /* Actions */
  actionItem: { marginBottom: 8, padding: 10, borderRadius: 8, borderLeft: '3 solid' },
  actionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 2 },
  actionDesc: { fontSize: 9, color: BALOISE.navy },
  actionProduct: { fontSize: 9, color: BALOISE.navy, marginTop: 3 },
  actionPriority: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 3 },
  /* Next steps */
  nextStepsBox: { marginTop: 14, padding: 14, backgroundColor: '#e5e7f0', borderRadius: 8 },
  nextStepsTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 4 },
  nextStepsBody: { fontSize: 9, color: BALOISE.navy, lineHeight: 1.5 },
  /* Disclaimer */
  disclaimerBox: { marginTop: 16, padding: 10, backgroundColor: BALOISE.grey100, borderRadius: 6 },
  disclaimerTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#4a4a4a', marginBottom: 3 },
  disclaimerBody: { fontSize: 8, color: '#4a4a4a', lineHeight: 1.4 },
  /* Layout helpers */
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end', paddingTop: 4 },
  flexOne: { flex: 1 },
  diagCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  /* Footer */
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, borderTop: `1 solid ${BALOISE.navy}`, paddingTop: 6 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5, color: BALOISE.grey400 },
  footerRef: { fontSize: 7, color: BALOISE.grey300 },
  introText: { fontSize: 9, color: BALOISE.navy, marginBottom: 10 },
  mentionPistes: { fontSize: 8, color: BALOISE.grey400, marginTop: 10, fontStyle: 'italic' },
})

interface PdfClientReportProps {
  diagnostic: DiagnosticResult
  clientName?: string
  wheelImageUri?: string
  advisor?: AdvisorInfo
}

export default function PdfClientReport({ diagnostic, clientName, wheelImageUri, advisor }: PdfClientReportProps) {
  const globalColor = NEED_COLORS[getNeedLevel(diagnostic.globalScore)]
  const qualitativeMessage = getGlobalScoreMessage(diagnostic.globalScore)

  const activeUniverses = Object.entries(diagnostic.quadrantScores).filter(([, s]) => s.active) as [string, QuadrantScore][]
  const priorityActions = diagnostic.recommendations.filter((a: Recommendation) => a.type === 'immediate' || a.type === 'event')

  const diagDate = diagnostic.createdAt
    ? new Date(diagnostic.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const diagRef = diagnostic.id ? diagnostic.id.slice(0, 8).toUpperCase() : ''

  return (
    <Document>
      {/* ─── PAGE 1: Score + Roue + Diagnostic + CTA + Disclaimer ─── */}
      <Page size="A4" style={styles.page}>
        {/* Header with logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Roue des Besoins</Text>
            <Text style={styles.headerSubtitle}>{'Votre synthèse personnalisée'}{clientName ? ` — ${clientName}` : ''}</Text>
            <Text style={styles.headerDate}>{diagDate}</Text>
          </View>
          <View style={styles.headerRight}>
            <BaloisePdfLogo />
          </View>
        </View>

        {/* Score global — qualitative only, no number (C4) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre niveau de protection</Text>
          <View style={styles.globalScoreContainer}>
            <Text style={{ ...styles.globalScoreMessage, color: globalColor }}>{qualitativeMessage}</Text>
          </View>
        </View>

        {/* Wheel */}
        {wheelImageUri && (
          <View style={styles.section}>
            <Image src={wheelImageUri} style={styles.wheelImage} />
          </View>
        )}

        {/* Merged diagnostic cards (M1): dot + name + products + level label + message */}
        {activeUniverses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre diagnostic par univers</Text>
            {activeUniverses.map(([key, score]) => (
              <View key={key} style={{ ...styles.diagCard, borderLeftColor: NEED_COLORS[score.needLevel] }}>
                <View style={{ ...styles.diagDot, backgroundColor: NEED_COLORS[score.needLevel] }} />
                <View style={styles.flexOne}>
                  <View style={styles.diagCardHeader}>
                    <Text style={styles.diagName}>{QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS]}</Text>
                    <Text style={{ ...styles.diagLevel, color: NEED_COLORS[score.needLevel] }}>
                      {NEED_LEGEND_MESSAGES[score.needLevel]} — {NEED_LABELS[score.needLevel]}
                    </Text>
                  </View>
                  <Text style={styles.diagProducts}>{QUADRANT_PRODUCTS[key as keyof typeof QUADRANT_PRODUCTS]}</Text>
                  <Text style={styles.diagMessage}>{NEED_MESSAGES[score.needLevel]}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CTA — always visible (C9) */}
        <View style={styles.ctaBox}>
          {advisor ? (
            <>
              <Text style={styles.ctaTitle}>Votre conseiller Baloise</Text>
              <Text style={styles.ctaText}>{advisor.name}</Text>
              {advisor.phone && <Text style={styles.ctaText}>{`Tél : ${advisor.phone}`}</Text>}
              {advisor.email && <Text style={styles.ctaText}>{`Email : ${advisor.email}`}</Text>}
              <Text style={styles.ctaCta}>{'Échangez avec votre conseiller pour approfondir cette synthèse'}</Text>
            </>
          ) : (
            <>
              <Text style={styles.ctaTitle}>Approfondir votre diagnostic</Text>
              <Text style={styles.ctaCta}>{'Échangez avec un conseiller Baloise pour approfondir cette synthèse'}</Text>
            </>
          )}
        </View>

        {/* IDD Disclaimer — always on page 1 (C1) */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>Information importante</Text>
          <Text style={styles.disclaimerBody}>{IDD_DISCLAIMER_TEXT}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text>{'Baloise Luxembourg — Document personnel'}</Text>
            <Text>Page 1{priorityActions.length > 0 ? '/2' : ''}</Text>
          </View>
          {diagRef ? <Text style={styles.footerRef}>{`Réf. ${diagRef}`}{diagnostic.scoringVersion ? ` — ${diagnostic.scoringVersion}` : ''}</Text> : null}
        </View>
      </Page>

      {/* ─── PAGE 2: Points d'attention + Prochaines étapes ─── */}
      {priorityActions.length > 0 && (
        <Page size="A4" style={styles.pageContinued}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Points d'attention identifiés</Text>
            <Text style={styles.introText}>
              {'Voici les points d\'attention qui ressortent de votre auto-évaluation.'}
            </Text>
            {priorityActions.map((action: Recommendation, i: number) => {
              const aStyle = ACTION_STYLES[action.type]
              return (
                <View key={i} style={{ ...styles.actionItem, backgroundColor: aStyle.bg, borderLeftColor: aStyle.border }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.message}</Text>
                  <Text style={styles.actionProduct}>{'Couverture concernée : '}{PRODUCT_LABELS[action.product] ?? action.product}</Text>
                  <Text style={{ ...styles.actionPriority, color: aStyle.border }}>{getPriorityLabel(action.priority)}</Text>
                </View>
              )
            })}
            {diagnostic.recommendations.length > priorityActions.length && (
              <Text style={styles.mentionPistes}>
                {'D\'autres pistes d\'amélioration sont consultables dans votre espace digital.'}
              </Text>
            )}
          </View>

          <View style={styles.nextStepsBox}>
            <Text style={styles.nextStepsTitle}>Prochaines étapes</Text>
            <Text style={styles.nextStepsBody}>
              {`1. Échangez avec ${advisor ? `votre conseiller ${advisor.name}` : 'un conseiller Baloise'} pour approfondir cette synthèse\n2. Identifiez ensemble les couvertures à ajuster\n3. Prévoyez un point de suivi dans 6 à 12 mois`}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text>{'Baloise Luxembourg — Document personnel'}</Text>
              <Text>Page 2/2</Text>
            </View>
            {diagRef ? <Text style={styles.footerRef}>{`Réf. ${diagRef}`}{diagnostic.scoringVersion ? ` — ${diagnostic.scoringVersion}` : ''}</Text> : null}
          </View>
        </Page>
      )}
    </Document>
  )
}
