import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { DiagnosticResult, Universe } from '../../shared/scoring/types.ts'

const UNIVERSE_LABELS: Record<string, string> = {
  auto: 'Auto / Mobilit\u00e9',
  habitation: 'Habitation / Propri\u00e9taire',
  prevoyance: 'Pr\u00e9voyance',
  objets_valeur: 'Objets de valeur',
}

const NEED_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#f97316',
  high: '#ef4444',
  critical: '#ef4444',
}

const TYPE_LABELS: Record<string, string> = {
  immediate: 'Imm\u00e9diate',
  deferred: 'Diff\u00e9r\u00e9e',
  event: '\u00c9v\u00e9nementielle',
}

const styles = StyleSheet.create({
  page: { padding: 35, fontFamily: 'Helvetica', fontSize: 9, color: '#1f2937' },
  header: { marginBottom: 20, borderBottom: '2 solid #1e3a5f', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  subtitle: { fontSize: 10, color: '#6b7280' },
  badge: { backgroundColor: '#7c3aed', color: '#ffffff', padding: '3 8', borderRadius: 4, fontSize: 8 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e3a5f', marginBottom: 8, borderBottom: '1 solid #e5e7eb', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, fontSize: 9, color: '#6b7280' },
  value: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  table: { marginTop: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: '4 8', borderRadius: 3, marginBottom: 3 },
  tableRow: { flexDirection: 'row', padding: '4 8', borderBottom: '0.5 solid #e5e7eb' },
  tableCell: { fontSize: 8 },
  wheelImage: { width: 240, height: 240, alignSelf: 'center', marginVertical: 10 },
  scoreBar: { height: 6, borderRadius: 3, marginTop: 2 },
  scoreBarBg: { height: 6, borderRadius: 3, backgroundColor: '#e5e7eb', width: '100%' },
  universeCard: { padding: 10, marginBottom: 8, backgroundColor: '#f9fafb', borderRadius: 6, borderLeft: '3 solid #3b82f6' },
  actionItem: { padding: 8, marginBottom: 5, borderRadius: 4, borderLeft: '3 solid #ef4444', backgroundColor: '#fff' },
  footer: { position: 'absolute', bottom: 20, left: 35, right: 35, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#9ca3af', borderTop: '0.5 solid #e5e7eb', paddingTop: 6 },
})

interface PdfAdvisorReportProps {
  diagnostic: DiagnosticResult
  clientName?: string
  clientEmail?: string
  answers?: Record<string, unknown>
  wheelImageUri?: string
}

export default function PdfAdvisorReport({ diagnostic, clientName, clientEmail, answers, wheelImageUri }: PdfAdvisorReportProps) {
  const activeUniverses = Object.entries(diagnostic.universeScores).filter(([, s]) => s.active)
  const pageCount = diagnostic.actions.length > 0 ? 3 : 2

  return (
    <Document>
      {/* Page 1: Header + Global + Wheel */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rapport Diagnostic Assurance</Text>
            <Text style={styles.subtitle}>{clientName}{clientEmail ? ` \u2014 ${clientEmail}` : ''}</Text>
            <Text style={{ fontSize: 8, color: '#9ca3af', marginTop: 3 }}>
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <Text style={styles.badge}>CONSEILLER</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synth\u00e8se globale</Text>
          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 10 }}>
            <View style={{ flex: 1, padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: diagnostic.globalScore <= 25 ? '#22c55e' : diagnostic.globalScore <= 50 ? '#f97316' : '#ef4444' }}>
                {diagnostic.globalScore}
              </Text>
              <Text style={{ fontSize: 8, color: '#6b7280' }}>Score global /100</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: '#3b82f6' }}>{activeUniverses.length}</Text>
              <Text style={{ fontSize: 8, color: '#6b7280' }}>Univers actifs /4</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: '#ef4444' }}>
                {diagnostic.actions.filter(a => a.type === 'immediate').length}
              </Text>
              <Text style={{ fontSize: 8, color: '#6b7280' }}>Actions imm\u00e9diates</Text>
            </View>
          </View>
        </View>

        {wheelImageUri && (
          <View style={styles.section}>
            <Image src={wheelImageUri} style={styles.wheelImage} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pond\u00e9rations appliqu\u00e9es</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableCell, width: '50%', fontFamily: 'Helvetica-Bold' }}>Univers</Text>
              <Text style={{ ...styles.tableCell, width: '25%', fontFamily: 'Helvetica-Bold' }}>Pond\u00e9ration</Text>
              <Text style={{ ...styles.tableCell, width: '25%', fontFamily: 'Helvetica-Bold' }}>Score besoin</Text>
            </View>
            {Object.entries(diagnostic.universeScores).map(([key, score]) => (
              <View key={key} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, width: '50%' }}>{UNIVERSE_LABELS[key]}{!score.active ? ' (d\u00e9sactiv\u00e9)' : ''}</Text>
                <Text style={{ ...styles.tableCell, width: '25%' }}>{diagnostic.weightings[key as Universe]}%</Text>
                <Text style={{ ...styles.tableCell, width: '25%', color: NEED_COLORS[score.needLevel] }}>{score.active ? `${score.needScore}/100` : '\u2014'}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Roue des Besoins \u2014 Rapport conseiller confidentiel</Text>
          <Text>Page 1/{pageCount}</Text>
        </View>
      </Page>

      {/* Page 2: Detailed universe analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse d\u00e9taill\u00e9e par univers</Text>
          {activeUniverses.map(([key, score]) => (
            <View key={key} style={{ ...styles.universeCard, borderLeftColor: NEED_COLORS[score.needLevel] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>{UNIVERSE_LABELS[key]}</Text>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: NEED_COLORS[score.needLevel] }}>
                  {score.needScore}/100
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Exposition au risque</Text>
                <Text style={styles.value}>{Math.round(score.exposure)}%</Text>
              </View>
              <View style={styles.scoreBarBg}>
                <View style={{ ...styles.scoreBar, width: `${score.exposure}%`, backgroundColor: '#f97316' }} />
              </View>

              <View style={{ ...styles.row, marginTop: 6 }}>
                <Text style={styles.label}>Niveau de couverture</Text>
                <Text style={styles.value}>{Math.round(score.coverage)}%</Text>
              </View>
              <View style={styles.scoreBarBg}>
                <View style={{ ...styles.scoreBar, width: `${score.coverage}%`, backgroundColor: '#3b82f6' }} />
              </View>

              <View style={{ ...styles.row, marginTop: 6 }}>
                <Text style={styles.label}>Niveau de besoin</Text>
                <Text style={{ ...styles.value, color: NEED_COLORS[score.needLevel] }}>
                  {score.needLevel === 'low' ? 'Faible' : score.needLevel === 'moderate' ? 'Mod\u00e9r\u00e9' : score.needLevel === 'high' ? '\u00c9lev\u00e9' : 'Critique'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {answers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donn\u00e9es collect\u00e9es</Text>
            <View style={styles.table}>
              {Object.entries(answers).map(([key, val]) => (
                <View key={key} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, width: '40%', color: '#6b7280' }}>{key}</Text>
                  <Text style={{ ...styles.tableCell, width: '60%' }}>{String(val)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Roue des Besoins \u2014 Rapport conseiller confidentiel</Text>
          <Text>Page 2/{pageCount}</Text>
        </View>
      </Page>

      {/* Page 3: Action plan */}
      {diagnostic.actions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan d'actions</Text>

            {['immediate', 'deferred', 'event'].map(type => {
              const typeActions = diagnostic.actions.filter(a => a.type === type)
              if (typeActions.length === 0) return null
              return (
                <View key={type} style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#4b5563', marginBottom: 6 }}>
                    {TYPE_LABELS[type]} ({typeActions.length})
                  </Text>
                  {typeActions.map((action, i) => (
                    <View key={i} style={styles.actionItem}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{action.title}</Text>
                        <Text style={{ fontSize: 8, color: '#6b7280' }}>{UNIVERSE_LABELS[action.universe]}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>{action.description}</Text>
                      <Text style={{ fontSize: 7, color: '#ef4444', marginTop: 2 }}>
                        Priorit\u00e9 : {'\u2605'.repeat(action.priority)}{'\u2606'.repeat(5 - action.priority)}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            })}
          </View>

          <View style={{ marginTop: 15, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#166534', marginBottom: 4 }}>Opportunit\u00e9s commerciales</Text>
            <Text style={{ fontSize: 8, color: '#15803d' }}>
              {activeUniverses.filter(([, s]) => s.needLevel === 'critical' || s.needLevel === 'high').length} univers avec besoin \u00e9lev\u00e9/critique identifi\u00e9.{'\n'}
              {diagnostic.actions.filter(a => a.type === 'immediate').length} actions imm\u00e9diates \u00e0 proposer au client.{'\n'}
              Potentiel de cross-selling : {activeUniverses.length > 2 ? '\u00c9lev\u00e9' : 'Mod\u00e9r\u00e9'}.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text>Roue des Besoins \u2014 Rapport conseiller confidentiel</Text>
            <Text>Page 3/{pageCount}</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
