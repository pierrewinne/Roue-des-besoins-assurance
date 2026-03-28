import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { DiagnosticResult, Quadrant, QuadrantScore, Recommendation } from '../../shared/scoring/types.ts'
import { QUADRANT_LABELS, QUADRANT_PRODUCTS, NEED_COLORS, NEED_LABELS, PRODUCT_LABELS } from '../../lib/constants.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'
import { QUESTIONS, SECTION_LABELS, type QuestionQuadrant, type QuestionnaireAnswers } from '../../shared/questionnaire/schema.ts'
import { BALOISE, ACTION_STYLES, PRIORITY_DOTS } from './pdf-tokens.ts'

const TYPE_LABELS: Record<Recommendation['type'], string> = {
  immediate: 'Immédiate',
  deferred: 'Différée',
  event: 'Événementielle',
  optimization: 'Optimisation',
}

const styles = StyleSheet.create({
  page: { padding: 35, fontFamily: 'Helvetica', fontSize: 9, color: BALOISE.navy },
  header: { marginBottom: 20, borderBottom: `2 solid ${BALOISE.navy}`, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: BALOISE.navy },
  subtitle: { fontSize: 10, color: BALOISE.grey400 },
  badge: { backgroundColor: BALOISE.navy, color: BALOISE.white, padding: '3 8', borderRadius: 4, fontSize: 8 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BALOISE.navy, marginBottom: 8, borderBottom: `1 solid ${BALOISE.grey200}`, paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, fontSize: 9, color: BALOISE.grey400 },
  value: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  table: { marginTop: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: BALOISE.grey100, padding: '4 8', borderRadius: 3, marginBottom: 3 },
  tableRow: { flexDirection: 'row', padding: '4 8', borderBottom: `0.5 solid ${BALOISE.grey200}` },
  tableCell: { fontSize: 8 },
  wheelImage: { width: 240, height: 240, alignSelf: 'center', marginVertical: 10 },
  scoreBar: { height: 6, borderRadius: 3, marginTop: 2 },
  scoreBarBg: { height: 6, borderRadius: 3, backgroundColor: BALOISE.grey200, width: '100%' },
  universeCard: { padding: 10, marginBottom: 8, backgroundColor: BALOISE.grey50, borderRadius: 6, borderLeft: `3 solid ${BALOISE.navy}` },
  actionItem: { padding: 8, marginBottom: 5, borderRadius: 6, borderLeft: '3 solid', backgroundColor: BALOISE.white },
  priorityBar: { width: 3, height: 12, borderRadius: 1.5 },
  priorityRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  footer: { position: 'absolute', bottom: 20, left: 35, right: 35, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: BALOISE.grey300, borderTop: `0.5 solid ${BALOISE.grey200}`, paddingTop: 6 },
})

interface PdfAdvisorReportProps {
  diagnostic: DiagnosticResult
  clientName?: string
  clientEmail?: string
  answers?: QuestionnaireAnswers
  wheelImageUri?: string
}

export default function PdfAdvisorReport({ diagnostic, clientName, clientEmail, answers, wheelImageUri }: PdfAdvisorReportProps) {
  const activeUniverses = Object.entries(diagnostic.quadrantScores).filter(([, s]) => s.active) as [string, QuadrantScore][]
  const pageCount = diagnostic.recommendations.length > 0 ? 3 : 2

  return (
    <Document>
      {/* Page 1: Header + Global + Wheel */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rapport Diagnostic Assurance</Text>
            <Text style={styles.subtitle}>{clientName}{clientEmail ? ` — ${clientEmail}` : ''}</Text>
            <Text style={{ fontSize: 8, color: BALOISE.grey300, marginTop: 3 }}>
              {diagnostic.createdAt
                ? new Date(diagnostic.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.badge}>CONSEILLER</Text>
            {diagnostic.id && (
              <Text style={{ fontSize: 6.5, color: BALOISE.grey300, marginTop: 4 }}>
                {'Réf : '}{diagnostic.id.slice(0, 8).toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synthèse globale</Text>
          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 10 }}>
            <View style={{ flex: 1, padding: 12, backgroundColor: BALOISE.grey50, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: NEED_COLORS[getNeedLevel(diagnostic.globalScore)] }}>
                {diagnostic.globalScore}
              </Text>
              <Text style={{ fontSize: 8, color: BALOISE.grey400 }}>Score global /100</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: BALOISE.grey50, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: BALOISE.navy }}>{activeUniverses.length}</Text>
              <Text style={{ fontSize: 8, color: BALOISE.grey400 }}>Univers actifs /4</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: BALOISE.grey50, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: NEED_COLORS.high }}>
                {diagnostic.recommendations.filter((a: Recommendation) => a.type === 'immediate').length}
              </Text>
              <Text style={{ fontSize: 8, color: BALOISE.grey400 }}>Actions immédiates</Text>
            </View>
          </View>
        </View>

        {wheelImageUri && (
          <View style={styles.section}>
            <Image src={wheelImageUri} style={styles.wheelImage} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pondérations appliquées</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableCell, width: '50%', fontFamily: 'Helvetica-Bold' }}>Univers</Text>
              <Text style={{ ...styles.tableCell, width: '25%', fontFamily: 'Helvetica-Bold' }}>Pondération</Text>
              <Text style={{ ...styles.tableCell, width: '25%', fontFamily: 'Helvetica-Bold' }}>Score besoin</Text>
            </View>
            {Object.entries(diagnostic.quadrantScores).map(([key, score]) => (
              <View key={key} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, width: '50%' }}>{QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS]}{!score.active ? ' (désactivé)' : ''}</Text>
                <Text style={{ ...styles.tableCell, width: '25%' }}>{diagnostic.weightings[key as Quadrant]}%</Text>
                <Text style={{ ...styles.tableCell, width: '25%', color: NEED_COLORS[score.needLevel] }}>{score.active ? `${score.needScore}/100` : '—'}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>{'Roue des Besoins — Rapport conseiller confidentiel'}{diagnostic.scoringVersion ? ` — Scoring ${diagnostic.scoringVersion}` : ''}</Text>
          <Text>Page 1/{pageCount}</Text>
        </View>
      </Page>

      {/* Page 2: Detailed universe analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse détaillée par univers</Text>
          {activeUniverses.map(([key, score]) => (
            <View key={key} style={{ ...styles.universeCard, borderLeftColor: NEED_COLORS[score.needLevel] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>{QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS]}</Text>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: NEED_COLORS[score.needLevel] }}>
                  {score.needScore}/100
                </Text>
              </View>
              <Text style={{ fontSize: 8, color: BALOISE.grey400, marginBottom: 6 }}>{QUADRANT_PRODUCTS[key as keyof typeof QUADRANT_PRODUCTS]}</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Exposition au risque</Text>
                <Text style={styles.value}>{Math.round(score.exposure)}%</Text>
              </View>
              <View style={styles.scoreBarBg}>
                <View style={{ ...styles.scoreBar, width: `${score.exposure}%`, backgroundColor: NEED_COLORS.moderate }} />
              </View>

              <View style={{ ...styles.row, marginTop: 6 }}>
                <Text style={styles.label}>Niveau de couverture</Text>
                <Text style={styles.value}>{Math.round(score.coverage)}%</Text>
              </View>
              <View style={styles.scoreBarBg}>
                <View style={{ ...styles.scoreBar, width: `${score.coverage}%`, backgroundColor: BALOISE.navy }} />
              </View>

              <View style={{ ...styles.row, marginTop: 6 }}>
                <Text style={styles.label}>Niveau de besoin</Text>
                <Text style={{ ...styles.value, color: NEED_COLORS[score.needLevel] }}>
                  {NEED_LABELS[score.needLevel]}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {answers && (() => {
          const sections: { section: QuestionQuadrant; label: string; items: { label: string; value: string }[] }[] = []
          const sectionOrder: QuestionQuadrant[] = ['profil_express', 'biens', 'personnes', 'projets', 'futur']

          for (const sec of sectionOrder) {
            const items: { label: string; value: string }[] = []
            for (const q of QUESTIONS.filter(q => q.quadrant === sec)) {
              const raw = answers[q.id]
              if (raw === undefined || raw === null) continue

              let display: string
              if (Array.isArray(raw)) {
                display = raw.map(v => q.options?.find(o => o.value === v)?.label ?? String(v)).join(', ')
              } else if (q.options) {
                display = q.options.find(o => o.value === raw)?.label ?? String(raw)
              } else {
                display = String(raw)
              }
              items.push({ label: q.label, value: display })
            }
            if (items.length > 0) sections.push({ section: sec, label: SECTION_LABELS[sec], items })
          }

          return sections.map(sec => (
            <View key={sec.section} style={styles.section}>
              <Text style={styles.sectionTitle}>{sec.label}</Text>
              <View style={styles.table}>
                {sec.items.map((item, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={{ ...styles.tableCell, width: '45%', color: BALOISE.grey400 }}>{item.label}</Text>
                    <Text style={{ ...styles.tableCell, width: '55%' }}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        })()}

        <View style={styles.footer}>
          <Text>{'Roue des Besoins — Rapport conseiller confidentiel'}{diagnostic.scoringVersion ? ` — Scoring ${diagnostic.scoringVersion}` : ''}</Text>
          <Text>Page 2/{pageCount}</Text>
        </View>
      </Page>

      {/* Page 3: Action plan */}
      {diagnostic.recommendations.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan d'actions</Text>

            {(['immediate', 'deferred', 'event', 'optimization'] as const).map(type => {
              const typeActions = diagnostic.recommendations.filter((a: Recommendation) => a.type === type)
              if (typeActions.length === 0) return null
              const aStyle = ACTION_STYLES[type] ?? ACTION_STYLES.immediate
              return (
                <View key={type} style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: BALOISE.grey400, marginBottom: 6 }}>
                    {TYPE_LABELS[type]} ({typeActions.length})
                  </Text>
                  {typeActions.map((action: Recommendation, i: number) => (
                    <View key={i} style={{ ...styles.actionItem, backgroundColor: aStyle.bg, borderLeftColor: aStyle.border }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: BALOISE.navy }}>{action.title}</Text>
                        <Text style={{ fontSize: 8, color: BALOISE.grey400 }}>{PRODUCT_LABELS[action.product] ?? action.product}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: BALOISE.grey400, marginTop: 2 }}>{action.message}</Text>
                      {action.advisorNote && (
                        <Text style={{ fontSize: 7.5, color: BALOISE.navy, marginTop: 3, fontStyle: 'italic' }}>{'Note conseiller : '}{action.advisorNote}</Text>
                      )}
                      <View style={styles.priorityRow}>
                        {PRIORITY_DOTS.map(j => (
                          <View key={j} style={{ ...styles.priorityBar, backgroundColor: j < action.priority ? aStyle.border : BALOISE.grey200 }} />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )
            })}
          </View>

          <View style={{ marginTop: 15, padding: 12, backgroundColor: '#e9fbf7', borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1b5951', marginBottom: 4 }}>Synth&egrave;se des besoins identifi&eacute;s</Text>
            <Text style={{ fontSize: 8, color: '#00b28f' }}>
              {activeUniverses.filter(([, s]) => s.needLevel === 'critical' || s.needLevel === 'high').length}{' univers avec besoin &eacute;lev&eacute;/critique identifi&eacute;.\n'}
              {diagnostic.recommendations.filter((a: Recommendation) => a.type === 'immediate').length}{' points d\u2019attention prioritaires.\n'}
              {'Couverture multi-univers : '}{activeUniverses.length > 2 ? 'Large' : 'Cibl&eacute;e'}.
            </Text>
          </View>

          {/* IDD Disclaimer (CRIT-3) */}
          <View style={{ marginTop: 15, padding: 10, backgroundColor: BALOISE.grey100, borderRadius: 6 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: BALOISE.grey400, marginBottom: 3 }}>Mention réglementaire IDD</Text>
            <Text style={{ fontSize: 7, color: BALOISE.grey300, lineHeight: 1.4 }}>
              {'Ce rapport est un outil d\'aide à l\'entretien de découverte et ne constitue pas un conseil en assurance au sens de la Directive (UE) 2016/97. Le devoir de conseil reste de la responsabilité du conseiller. Les scores et recommandations doivent être validés lors de l\'entretien personnalisé avant toute proposition commerciale.'}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text>{'Roue des Besoins — Rapport conseiller confidentiel'}{diagnostic.scoringVersion ? ` — Scoring ${diagnostic.scoringVersion}` : ''}</Text>
            <Text>Page 3/{pageCount}</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
