import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { DiagnosticResult } from '../../shared/scoring/types.ts'
import { UNIVERSE_LABELS, NEED_COLORS, NEED_MESSAGES } from '../../lib/constants.ts'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b' },
  header: { marginBottom: 30, borderBottom: '2 solid #000d6e', paddingBottom: 15 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#64748b' },
  date: { fontSize: 9, color: '#94a3b8', marginTop: 6 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 10, borderBottom: '1 solid #e2e8f0', paddingBottom: 6 },
  globalScoreContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20, padding: 20, backgroundColor: '#f8fafc', borderRadius: 8 },
  globalScoreMessage: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 8 },
  globalScoreNumber: { fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  globalScoreLabel: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 4 },
  wheelImage: { width: 280, height: 280, alignSelf: 'center', marginVertical: 15 },
  universeRow: { flexDirection: 'row', marginBottom: 10, padding: 10, backgroundColor: '#f8fafc', borderRadius: 6 },
  universeIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10, marginTop: 2 },
  universeName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  universeMessage: { fontSize: 9, color: '#64748b' },
  actionItem: { flexDirection: 'row', marginBottom: 8, padding: 8, backgroundColor: '#fff1f2', borderRadius: 4, borderLeft: '3 solid #d9304c' },
  actionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  actionDesc: { fontSize: 9, color: '#475569' },
  actionPriority: { fontSize: 8, color: '#d9304c', marginTop: 2 },
  actionProduct: { fontSize: 8, color: '#000d6e', marginTop: 2, fontFamily: 'Helvetica-Bold' },
  advisorBox: { marginTop: 20, padding: 15, backgroundColor: '#e8eaf6', borderRadius: 6, borderLeft: '4 solid #000d6e' },
  advisorTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#000d6e', marginBottom: 6 },
  advisorInfo: { fontSize: 9, color: '#1e293b', marginBottom: 2 },
  advisorCta: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#000d6e', marginTop: 8 },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8', borderTop: '1 solid #e2e8f0', paddingTop: 8 },
})

interface AdvisorInfo {
  name: string
  email?: string
  phone?: string
}

interface PdfClientReportProps {
  diagnostic: DiagnosticResult
  clientName?: string
  wheelImageUri?: string
  advisor?: AdvisorInfo
}

const SCORE_MESSAGES = [
  { max: 25, message: 'Votre protection est bien adapt\u00e9e \u00e0 votre situation' },
  { max: 50, message: 'Quelques points m\u00e9ritent votre attention' },
  { max: 75, message: 'Des lacunes significatives ont \u00e9t\u00e9 identifi\u00e9es' },
  { max: 100, message: 'Votre situation n\u00e9cessite une action rapide' },
]

export default function PdfClientReport({ diagnostic, clientName, wheelImageUri, advisor }: PdfClientReportProps) {
  const globalColor = diagnostic.globalScore <= 25 ? NEED_COLORS.low :
                       diagnostic.globalScore <= 50 ? NEED_COLORS.moderate :
                       diagnostic.globalScore <= 75 ? NEED_COLORS.high : NEED_COLORS.critical

  const qualitativeMessage = SCORE_MESSAGES.find(m => diagnostic.globalScore <= m.max)?.message ?? SCORE_MESSAGES[3].message

  const activeUniverses = Object.entries(diagnostic.universeScores).filter(([, s]) => s.active)
  const priorityActions = diagnostic.actions.filter(a => a.type === 'immediate' || a.type === 'event')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Roue des Besoins Assurance</Text>
          <Text style={styles.subtitle}>Votre diagnostic personnalis\u00e9{clientName ? ` \u2014 ${clientName}` : ''}</Text>
          <Text style={styles.date}>G\u00e9n\u00e9r\u00e9 le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
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
            <Image src={wheelImageUri} style={styles.wheelImage} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse par univers</Text>
          {activeUniverses.map(([key, score]) => (
            <View key={key} style={styles.universeRow}>
              <View style={{ ...styles.universeIndicator, backgroundColor: NEED_COLORS[score.needLevel] }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.universeName}>{UNIVERSE_LABELS[key]}</Text>
                <Text style={styles.universeMessage}>{NEED_MESSAGES[score.needLevel]}</Text>
              </View>
            </View>
          ))}
        </View>

        {advisor && (
          <View style={styles.advisorBox}>
            <Text style={styles.advisorTitle}>Votre conseiller Baloise</Text>
            <Text style={styles.advisorInfo}>{advisor.name}</Text>
            {advisor.phone && <Text style={styles.advisorInfo}>{`T\u00e9l : ${advisor.phone}`}</Text>}
            {advisor.email && <Text style={styles.advisorInfo}>{`Email : ${advisor.email}`}</Text>}
            <Text style={styles.advisorCta}>Prenez rendez-vous pour \u00e9changer sur vos r\u00e9sultats</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Roue des Besoins Assurance {'\u2014'} Document confidentiel</Text>
          <Text>Page 1/2</Text>
        </View>
      </Page>

      {priorityActions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions recommand\u00e9es</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 12 }}>
              Voici les actions prioritaires identifi\u00e9es lors de votre diagnostic.
            </Text>
            {priorityActions.map((action, i) => (
              <View key={i} style={styles.actionItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.description}</Text>
                  {action.productName && (
                    <Text style={styles.actionProduct}>Solution : {action.productName}</Text>
                  )}
                  <Text style={styles.actionPriority}>
                    Priorit\u00e9 : {'\u2605'.repeat(action.priority)}{'\u2606'.repeat(5 - action.priority)} {'\u2014'} {UNIVERSE_LABELS[action.universe]}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20, padding: 15, backgroundColor: '#e5e7f0', borderRadius: 6 }}>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#000739', marginBottom: 6 }}>Prochaines \u00e9tapes</Text>
            <Text style={{ fontSize: 9, color: '#000d6e' }}>
              {advisor
                ? `1. Contactez votre conseiller ${advisor.name}${advisor.phone ? ` au ${advisor.phone}` : ''}\n2. \u00c9changez sur les recommandations et demandez des devis personnalis\u00e9s\n3. Planifiez un bilan de suivi dans 6 mois`
                : '1. Prenez contact avec votre conseiller pour discuter des recommandations\n2. Demandez des devis pour les couvertures identifi\u00e9es comme prioritaires\n3. Planifiez un bilan de suivi dans 6 mois'
              }
            </Text>
          </View>

          <View style={styles.footer}>
            <Text>Roue des Besoins Assurance {'\u2014'} Document confidentiel</Text>
            <Text>Page 2/2</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
