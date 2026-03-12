import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { DiagnosticResult, Quadrant, QuadrantScore, Recommendation } from '../../shared/scoring/types.ts'
import { QUADRANT_LABELS, NEED_COLORS, PRODUCT_LABELS } from '../../lib/constants.ts'

const TYPE_LABELS: Record<string, string> = {
  immediate: 'Immédiate',
  deferred: 'Différée',
  event: 'Événementielle',
  optimization: 'Optimisation',
}

const styles = StyleSheet.create({
  page: { padding: 35, fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b' },
  header: { marginBottom: 20, borderBottom: '2 solid #1e293b', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e293b' },
  subtitle: { fontSize: 10, color: '#64748b' },
  badge: { backgroundColor: '#000d6e', color: '#ffffff', padding: '3 8', borderRadius: 4, fontSize: 8 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 8, borderBottom: '1 solid #e2e8f0', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, fontSize: 9, color: '#64748b' },
  value: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  table: { marginTop: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: '4 8', borderRadius: 3, marginBottom: 3 },
  tableRow: { flexDirection: 'row', padding: '4 8', borderBottom: '0.5 solid #e2e8f0' },
  tableCell: { fontSize: 8 },
  wheelImage: { width: 240, height: 240, alignSelf: 'center', marginVertical: 10 },
  scoreBar: { height: 6, borderRadius: 3, marginTop: 2 },
  scoreBarBg: { height: 6, borderRadius: 3, backgroundColor: '#e2e8f0', width: '100%' },
  universeCard: { padding: 10, marginBottom: 8, backgroundColor: '#f8fafc', borderRadius: 6, borderLeft: '3 solid #000d6e' },
  actionItem: { padding: 8, marginBottom: 5, borderRadius: 4, borderLeft: '3 solid #d9304c', backgroundColor: '#fff' },
  footer: { position: 'absolute', bottom: 20, left: 35, right: 35, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#94a3b8', borderTop: '0.5 solid #e2e8f0', paddingTop: 6 },
})

interface PdfAdvisorReportProps {
  diagnostic: DiagnosticResult
  clientName?: string
  clientEmail?: string
  answers?: Record<string, unknown>
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
            <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 3 }}>
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <Text style={styles.badge}>CONSEILLER</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synthèse globale</Text>
          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 10 }}>
            <View style={{ flex: 1, padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: diagnostic.globalScore <= 25 ? '#168741' : diagnostic.globalScore <= 50 ? '#c97612' : '#d9304c' }}>
                {diagnostic.globalScore}
              </Text>
              <Text style={{ fontSize: 8, color: '#64748b' }}>Score global /100</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: '#000d6e' }}>{activeUniverses.length}</Text>
              <Text style={{ fontSize: 8, color: '#64748b' }}>Univers actifs /4</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: '#d9304c' }}>
                {diagnostic.recommendations.filter((a: Recommendation) => a.type === 'immediate').length}
              </Text>
              <Text style={{ fontSize: 8, color: '#64748b' }}>Actions immédiates</Text>
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
          <Text>Roue des Besoins — Rapport conseiller confidentiel</Text>
          <Text>Page 1/{pageCount}</Text>
        </View>
      </Page>

      {/* Page 2: Detailed universe analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse détaillée par univers</Text>
          {activeUniverses.map(([key, score]) => (
            <View key={key} style={{ ...styles.universeCard, borderLeftColor: NEED_COLORS[score.needLevel] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>{QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS]}</Text>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: NEED_COLORS[score.needLevel] }}>
                  {score.needScore}/100
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Exposition au risque</Text>
                <Text style={styles.value}>{Math.round(score.exposure)}%</Text>
              </View>
              <View style={styles.scoreBarBg}>
                <View style={{ ...styles.scoreBar, width: `${score.exposure}%`, backgroundColor: '#c97612' }} />
              </View>

              <View style={{ ...styles.row, marginTop: 6 }}>
                <Text style={styles.label}>Niveau de couverture</Text>
                <Text style={styles.value}>{Math.round(score.coverage)}%</Text>
              </View>
              <View style={styles.scoreBarBg}>
                <View style={{ ...styles.scoreBar, width: `${score.coverage}%`, backgroundColor: '#000d6e' }} />
              </View>

              <View style={{ ...styles.row, marginTop: 6 }}>
                <Text style={styles.label}>Niveau de besoin</Text>
                <Text style={{ ...styles.value, color: NEED_COLORS[score.needLevel] }}>
                  {score.needLevel === 'low' ? 'Faible' : score.needLevel === 'moderate' ? 'Modéré' : score.needLevel === 'high' ? 'Élevé' : 'Critique'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {answers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Données collectées</Text>
            <View style={styles.table}>
              {Object.entries(answers).map(([key, val]) => (
                <View key={key} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, width: '40%', color: '#64748b' }}>{key}</Text>
                  <Text style={{ ...styles.tableCell, width: '60%' }}>{String(val)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Roue des Besoins — Rapport conseiller confidentiel</Text>
          <Text>Page 2/{pageCount}</Text>
        </View>
      </Page>

      {/* Page 3: Action plan */}
      {diagnostic.recommendations.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan d'actions</Text>

            {['immediate', 'deferred', 'event', 'optimization'].map(type => {
              const typeActions = diagnostic.recommendations.filter((a: Recommendation) => a.type === type)
              if (typeActions.length === 0) return null
              return (
                <View key={type} style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#475569', marginBottom: 6 }}>
                    {TYPE_LABELS[type]} ({typeActions.length})
                  </Text>
                  {typeActions.map((action: Recommendation, i: number) => (
                    <View key={i} style={styles.actionItem}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{action.title}</Text>
                        <Text style={{ fontSize: 8, color: '#64748b' }}>{PRODUCT_LABELS[action.product] ?? action.product}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: '#475569', marginTop: 2 }}>{action.message}</Text>
                      <Text style={{ fontSize: 7, color: '#d9304c', marginTop: 2 }}>
                        {'Priorité : '}{'★'.repeat(action.priority)}{'☆'.repeat(5 - action.priority)}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            })}
          </View>

          <View style={{ marginTop: 15, padding: 12, backgroundColor: '#ecfdf5', borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#065f46', marginBottom: 4 }}>Opportunités commerciales</Text>
            <Text style={{ fontSize: 8, color: '#047857' }}>
              {activeUniverses.filter(([, s]) => s.needLevel === 'critical' || s.needLevel === 'high').length}{' univers avec besoin élevé/critique identifié.\n'}
              {diagnostic.recommendations.filter((a: Recommendation) => a.type === 'immediate').length}{' actions immédiates à proposer au client.\n'}
              {'Potentiel de cross-selling : '}{activeUniverses.length > 2 ? 'Élevé' : 'Modéré'}.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text>Roue des Besoins — Rapport conseiller confidentiel</Text>
            <Text>Page 3/{pageCount}</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
