const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak, TabStopType, TabStopPosition } = require('docx');

// ── Baloise brand colors ──
const NAVY = "000d6e";
const NAVY_LIGHT = "E8EAF6";
const WHITE = "FFFFFF";
const AMBER = "F9A825";
const AMBER_DARK = "E65100";
const RED = "D32F2F";
const RED_SOFT = "EF5350";
const GREY = "9E9E9E";
const GREY_LIGHT = "F5F5F5";
const GREEN_DARK = "168741";
const BORDER_COLOR = "BDBDBD";
const ORANGE_BG = "FFF3E0";
const RED_BG = "FFEBEE";
const GREEN_BG = "E8F5E9";
const BLUE_BG = "E3F2FD";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function txt(text, opts = {}) {
  return new TextRun({ text, font: "Calibri", size: opts.size || 22, bold: opts.bold, italics: opts.italics, color: opts.color });
}
function boldTxt(text, opts = {}) { return txt(text, { ...opts, bold: true }); }

function para(children, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after !== undefined ? opts.after : 120, before: opts.before || 0 },
    alignment: opts.alignment,
    children: Array.isArray(children) ? children : [children],
    ...(opts.heading ? { heading: opts.heading } : {}),
    ...(opts.indent ? { indent: opts.indent } : {}),
    ...(opts.pageBreakBefore ? { pageBreakBefore: true } : {}),
  });
}

function heading1(text, pageBreak = true) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 200 },
    ...(pageBreak ? { pageBreakBefore: true } : {}),
    children: [new TextRun({ text, font: "Calibri", size: 32, bold: true, color: NAVY })],
  });
}
function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 160 },
    children: [new TextRun({ text, font: "Calibri", size: 26, bold: true, color: NAVY })],
  });
}
function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 120 },
    children: [new TextRun({ text, font: "Calibri", size: 23, bold: true, color: NAVY })],
  });
}

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, font: "Calibri", size: 20, bold: true, color: WHITE })] })],
  });
}

function dataCell(text, width, opts = {}) {
  const runs = [];
  if (opts.bold) runs.push(new TextRun({ text, font: "Calibri", size: 20, bold: true, color: opts.color }));
  else runs.push(new TextRun({ text, font: "Calibri", size: 20, color: opts.color }));
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ spacing: { after: 0 }, children: runs })],
  });
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((c, ci) => {
          const isTag = typeof c === 'string' && ['KEEP', 'CHANGE', 'REWRITE', 'DELETE'].includes(c.trim());
          let bg = ri % 2 === 1 ? GREY_LIGHT : undefined;
          let color = undefined;
          let bold = false;
          if (isTag) {
            bold = true;
            if (c.trim() === 'KEEP') { bg = GREEN_BG; color = GREEN_DARK; }
            else if (c.trim() === 'CHANGE') { bg = ORANGE_BG; color = AMBER_DARK; }
            else if (c.trim() === 'REWRITE') { bg = RED_BG; color = RED; }
            else if (c.trim() === 'DELETE') { bg = RED_BG; color = RED; }
          }
          return dataCell(typeof c === 'string' ? c : String(c), colWidths[ci], { shading: bg, color, bold: bold });
        }),
      })),
    ],
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [txt(text)],
  });
}
function bulletBold(b, rest, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [boldTxt(b), txt(rest)],
  });
}

function quote(text) {
  return new Paragraph({
    spacing: { after: 120, before: 60 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 8 } },
    children: [txt(text, { size: 21, italics: true })],
  });
}

function spacer(size = 100) { return new Paragraph({ spacing: { after: size }, children: [] }); }

function tagBox(tag, color, bgColor, text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 200 },
    children: [
      new TextRun({ text: ` ${tag} `, font: "Calibri", size: 20, bold: true, color: WHITE }),
      new TextRun({ text: `  ${text}`, font: "Calibri", size: 20 }),
    ],
  });
}

// ── BUILD DOCUMENT ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri", color: NAVY },
        paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: NAVY },
        paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, font: "Calibri", color: NAVY },
        paragraph: { spacing: { before: 160, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
      { reference: "numbers2", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ],
  },
  sections: [
    // ── COVER PAGE ──
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: [
        spacer(2500),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
          children: [new TextRun({ text: "CORRECTIF COLLEGIAL V2.1", font: "Calibri", size: 56, bold: true, color: NAVY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 12 } },
          children: [new TextRun({ text: "Adequation Contrats \u2014 Protection des Biens (HOME)", font: "Calibri", size: 32, color: NAVY })] }),
        spacer(300),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "PATCH DECISIONNEL \u2014 6 corrections imperatives", font: "Calibri", size: 24, bold: true, color: AMBER_DARK })] }),
        spacer(200),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
          children: [new TextRun({ text: "Roue des Besoins Assurance \u2014 Baloise Luxembourg", font: "Calibri", size: 24, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: "Mars 2026", font: "Calibri", size: 24, color: "666666" })] }),
        spacer(400),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Statut : PATCH de la Note Collegiale V2.0", font: "Calibri", size: 20, bold: true, color: NAVY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Nature : verrouillage des 15-20 % de fragilites restantes", font: "Calibri", size: 20, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Le reste de la V2 est CONFIRME", font: "Calibri", size: 20, italics: true, color: "999999" })] }),
        spacer(300),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "14 agents specialises contributeurs (college identique a la V2)", font: "Calibri", size: 18, color: "888888" })] }),
      ],
    },
    // ── MAIN CONTENT ──
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Correctif V2.1 \u2014 Adequation HOME \u2014 Baloise Luxembourg", font: "Calibri", size: 16, color: "999999", italics: true })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [txt("Page ", { size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "999999" })] })] }),
      },
      children: [
        // ════════════════════════════════════════
        // PARTIE 1 — VERDICT V2.1
        // ════════════════════════════════════════
        heading1("PARTIE 1 \u2014 Verdict V2.1", false),

        new Paragraph({
          spacing: { before: 120, after: 120 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, bottom: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, left: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, right: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK } },
          shading: { type: ShadingType.CLEAR, fill: GREEN_BG },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "GO CONDITIONNEL CONFIRME \u2014 V2 corrigee sur 6 points", font: "Calibri", size: 28, bold: true, color: GREEN_DARK })],
        }),

        para([txt("La V2 est confirmee a 80-85 %. Le GO CONDITIONNEL tient. Le perimetre MRH, l\u2019approche prudente, la restitution categorique, l\u2019Option B (pdf-parse + Mistral Large) et la strategie de phasage sont maintenus.")]),
        para([txt("Le present correctif verrouille 6 fragilites identifiees par relecture collegiale :")]),

        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("La contradiction sur ce qui peut demarrer avant validation IDD est levee par une matrice composant par composant.")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("L\u2019incoherence entre formats acceptes (PDF/JPEG/PNG) et strategie Phase 1 (PDF natifs seulement) est eliminee.")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("La position technologique est reecrite avec une honnetete accrue sur les besoins de supervision.")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Les seuils de qualite sont rehausses et structures en 3 niveaux (build / beta / go-live).")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Le corpus passe de 25 a 50 contrats structures, avec un plan d\u2019echantillonnage.")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Le libelle client \u201Ccouvert\u201D est remplace par \u201Cdetecte dans votre contrat\u201D pour reduire le risque juridique et reputationnel.")] }),

        spacer(60),
        para([boldTxt("Apres application de ce correctif, la V2.1 est presentable comme base d\u2019arbitrage finale en comite produit. Aucun tour supplementaire n\u2019est necessaire.")]),

        // ════════════════════════════════════════
        // PARTIE 2 — LES 6 CORRECTIONS
        // ════════════════════════════════════════
        heading1("PARTIE 2 \u2014 Les 6 corrections imperatives"),

        // ── SUJET 1 ──
        heading2("Sujet 1 \u2014 Ce qui peut demarrer avant validation IDD"),
        heading3("Contradiction identifiee"),
        para([txt("La V2 contient deux affirmations incompatibles :")]),
        bullet("Section 1 : \u201CLe dev peut commencer sur le moteur d\u2019adequation et l\u2019UI\u201D"),
        bullet("Section 13 : \u201CFront-end bloque jusqu\u2019a validation IDD\u201D"),
        para([txt("Le probleme : \u201Cl\u2019UI\u201D est un terme ambigu. L\u2019ecran d\u2019upload n\u2019a pas le meme statut IDD que l\u2019ecran de restitution des resultats.")]),

        heading3("Decision V2.1"),
        para([boldTxt("Regle unique : "), txt("tout ce qui ne montre pas de resultat d\u2019adequation au client peut demarrer avant validation IDD. Tout ce qui affiche un statut au client est bloque.")]),
        spacer(60),

        makeTable(
          ["Composant", "Avant IDD ?", "Condition", "Marquage"],
          [
            ["Backend : migration Supabase, table, RLS, bucket", "OUI", "Aucune", "KEEP"],
            ["Backend : Background Function (pdf-parse + Mistral)", "OUI", "Aucune", "KEEP"],
            ["Backend : moteur d\u2019adequation TypeScript + tests", "OUI", "Tests sur donnees fictives", "KEEP"],
            ["Backend : schema Zod + validation", "OUI", "Aucune", "KEEP"],
            ["CTA factice (Phase 0)", "OUI", "Ne delivre aucun resultat", "KEEP"],
            ["Ecran d\u2019upload + confirmation (2 champs)", "OUI", "Collecte un document, ne restitue rien", "CHANGE"],
            ["Ecran de restitution des resultats", "NON", "Affiche des statuts = risque IDD", "KEEP"],
            ["Wordings des statuts client", "NON", "Valides avec le juridique", "KEEP"],
            ["PDF export adequation", "NON", "Contient les resultats", "CHANGE"],
          ],
          [3000, 900, 3126, 1000]
        ),
        spacer(60),

        heading3("Reformulation V2.1 [REWRITE]"),
        quote("Le dev backend (migration, extraction, moteur d\u2019adequation, Zod) et le CTA factice Phase 0 peuvent demarrer immediatement, sans attendre la validation IDD. L\u2019ecran d\u2019upload peut etre developpe en parallele car il ne restitue aucun resultat. En revanche, l\u2019ecran de restitution client, le PDF export et les wordings des statuts sont bloques jusqu\u2019a validation IDD par le service juridique Baloise Luxembourg."),

        // ── SUJET 2 ──
        heading2("Sujet 2 \u2014 Realignement formats UX et strategie Phase 1"),
        heading3("Contradiction identifiee"),
        bullet("Section 7.1, etape 2 : \u201CPDF, JPEG, PNG \u2014 max 10 MB\u201D"),
        bullet("Section 9, Phase 1 : \u201CPDF natifs uniquement\u201D, \u201CPas de vision en Phase 1\u201D"),
        para([txt("Le client qui voit \u201CJPEG, PNG\u201D s\u2019attend a un traitement automatique. En Phase 1, il ne l\u2019obtiendra pas. Promesse implicite trompeuse.")]),

        heading3("Decision V2.1 : Option B retenue"),
        para([boldTxt("Phase 1 = PDF + images acceptees, mais images non traitees automatiquement.")]),
        para([txt("L\u2019option A (PDF uniquement) frustre les clients mobiles. L\u2019option B accepte tout, detecte le type, et redirige honnetement vers la saisie manuelle si necessaire.")]),

        heading3("Textes UX exacts [REWRITE]"),
        para([boldTxt("Bouton d\u2019upload :")]),
        quote("Importer votre document"),
        para([boldTxt("Label :")]),
        quote("Formats acceptes : PDF (recommande), JPEG, PNG \u2014 10 Mo maximum"),
        para([boldTxt("Sous-texte d\u2019aide :")]),
        quote("Pour une analyse automatique, importez de preference le PDF recu de votre assureur. Les photos de documents seront acceptees mais pourront necessiter une saisie complementaire."),
        para([boldTxt("Message systeme si document non exploitable automatiquement :")]),
        quote("Votre document n\u2019a pas pu etre analyse automatiquement (format image ou document scanne). Vous pouvez : (1) Reessayer avec le PDF original de votre assureur (2) Completer manuellement les informations de votre contrat"),

        // ── SUJET 3 ──
        heading2("Sujet 3 \u2014 Position technologique revisee"),
        heading3("Fragilites identifiees"),
        makeTable(
          ["Passage V2", "Probleme", "Marquage"],
          [
            ["\u201CC\u2019est un probleme de pattern matching structure\u201D", "Sous-estime la variabilite reelle des CP luxembourgeoises", "CHANGE"],
            ["\u201CMaintenance dictionnaire : Nulle\u201D", "Faux. Le prompt MRH est un artefact a maintenir", "CHANGE"],
            ["\u201CPas de dictionnaire a maintenir : Mistral comprend nativement\u201D", "Trop affirmatif. Peut echouer sur des formulations locales", "CHANGE"],
          ],
          [3500, 3526, 1000]
        ),

        heading3("Position techno revisee [REWRITE]"),
        quote("L\u2019Option B (pdf-parse + Mistral Large texte seul) reste la recommandation. Le scope MRH ferme (5 assureurs, 16 garanties, 2 langues) reduit considerablement la complexite par rapport a la V1, mais ne l\u2019elimine pas. Les contrats MRH luxembourgeois presentent une heterogeneite reelle : conventions de presentation differentes, terminologie variable entre assureurs, champs parfois absents ou fusionnes. Le LLM remplace le dictionnaire de regles explicite, pas le besoin de normalisation. Le prompt MRH contient une table de mapping des 16 garanties avec leurs synonymes FR/DE connus. Ce prompt est un artefact a maintenir : revise a chaque ajout d\u2019assureur et lors du monitoring mensuel. Ce n\u2019est plus un probleme de comprehension ouverte du langage naturel, mais ce n\u2019est pas non plus un simple pattern matching. C\u2019est un probleme de structuration guidee avec supervision humaine legere."),

        heading3("Automatise / Supervise / N\u2019essaie pas"),
        makeTable(
          ["On automatise", "On supervise", "On n\u2019essaie pas"],
          [
            ["Extraction texte brut via pdf-parse", "Taux de \u201Cnon evaluable\u201D par assureur (dashboard mensuel)", "Interpretation des Conditions Generales"],
            ["Structuration JSON via Mistral (prompt directif)", "Taux de correction utilisateur par champ", "Extraction des exclusions ou baremes de vetuste"],
            ["Validation schema via Zod (enum, bornes)", "Coherence extraction vs avis conseiller (20 cas/mois)", "Detection automatique de la sous-assurance"],
            ["Detection PDF natif vs scan", "Revue prompt trimestrielle (synonymes, formats)", "Mapping automatique de champs inconnus"],
            ["Classification MRH / non-MRH (rejet)", "Alertes hallucination (montant hors bornes)", "Traitement de documents manuscrits"],
          ],
          [3000, 3026, 3000]
        ),
        spacer(60),
        para([boldTxt("Recommandation techno V2.1 : "), txt("L\u2019Option B reste optimale. Le LLM est un accelerateur, pas un pilote automatique. Prevoir 0.5 jour/mois de maintenance du prompt MRH et du monitoring qualite.")]),

        // ── SUJET 4 ──
        heading2("Sujet 4 \u2014 Seuils de qualite rehausses"),
        heading3("Fragilite identifiee"),
        para([txt("Le GO/NO-GO V2 repose sur \u201Cprecision >= 70% sur corpus 25 contrats\u201D. Ce seuil unique est insuffisant : 70% = 30% d\u2019erreurs sur un outil qui affiche des statuts a des clients. Un seul seuil global ne distingue pas les champs critiques des secondaires.")]),

        heading3("Seuils V2.1 \u2014 3 niveaux [REWRITE]"),
        makeTable(
          ["KPI", "Build interne", "Beta fermee (20 clients, 4 sem.)", "Ouverture elargie"],
          [
            ["Precision champs A (critiques)", ">= 75%", ">= 85%", ">= 90%"],
            ["Precision champs B (utiles)", ">= 60%", ">= 70%", ">= 80%"],
            ["Taux faux positifs \u201Cdetecte\u201D", "< 20%", "< 10%", "< 5%"],
            ["Taux \u201Cnon evaluable\u201D par garantie A", "< 40%", "< 25%", "< 15%"],
            ["Coherence avec avis conseiller", "N/A", ">= 75%", ">= 85%"],
            ["Taux reclamation client", "N/A", "< 5%", "< 2%"],
            ["Taux correction utilisateur", "N/A", "< 30%", "< 15%"],
          ],
          [2800, 1800, 2500, 1926]
        ),
        spacer(60),
        para([boldTxt("Regles de passage :")]),
        bulletBold("Build \u2192 Beta : ", "tous seuils Build atteints + IDD validee + DPIA validee"),
        bulletBold("Beta \u2192 Ouverture : ", "tous seuils Beta atteints pendant 4 semaines consecutives + zero incident critique"),
        bulletBold("Si seuils Beta non atteints apres 6 semaines : ", "STOP, recalibration obligatoire, nouveau cycle beta"),
        spacer(60),
        para([boldTxt("Go/No-Go Phase 1 V2.1 [REWRITE] : "), txt("CTA > 10% ET IDD favorable ET DPIA validee ET precision champs A >= 85% sur corpus pilote ET faux positifs < 10% ET coherence conseiller >= 75%.")]),

        // ── SUJET 5 ──
        heading2("Sujet 5 \u2014 Corpus structure"),
        heading3("Fragilite identifiee"),
        para([txt("25 contrats = 5 contrats par assureur. Insuffisant pour couvrir les variantes (FR/DE, proprio/locataire, formule base/confort/premium). Intervalle de confiance trop large pour conclure.")]),

        heading3("Trois niveaux de corpus [REWRITE]"),
        makeTable(
          ["Niveau", "Objectif", "Taille", "Usage"],
          [
            ["Calibration", "Developper et calibrer le prompt Mistral", "15-20", "Dev interne, iterations, tests unitaires"],
            ["Pilote", "Valider la qualite en conditions reelles", "30-40", "Beta fermee, mesure des seuils"],
            ["Go-live", "Autoriser l\u2019ouverture elargie", "50+", "Decision finale, couverture statistique"],
          ],
          [1500, 3026, 1000, 3500]
        ),

        heading3("Plan d\u2019echantillonnage \u2014 Corpus pilote (30-40 contrats)"),
        makeTable(
          ["Dimension", "Repartition cible"],
          [
            ["Baloise", "8-10 contrats (source interne)"],
            ["Foyer", "6-8 contrats"],
            ["La Luxembourgeoise", "6-8 contrats"],
            ["AXA Luxembourg", "4-6 contrats"],
            ["Lalux", "4-6 contrats"],
            ["Langue FR", ">= 60% du corpus"],
            ["Langue DE ou mixte", ">= 20% du corpus"],
            ["Proprietaire / Locataire", ">= 40% / >= 30%"],
            ["Appartement / Maison", ">= 40% / >= 40%"],
            ["PDF natif propre", ">= 70%"],
            ["PDF natif complexe", ">= 20%"],
            ["Scan (test de rejet)", "3-5 documents"],
          ],
          [3500, 5526]
        ),
        spacer(60),
        new Paragraph({
          spacing: { before: 80, after: 80 },
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: RED }, bottom: { style: BorderStyle.SINGLE, size: 2, color: RED }, left: { style: BorderStyle.SINGLE, size: 2, color: RED }, right: { style: BorderStyle.SINGLE, size: 2, color: RED } },
          shading: { type: ShadingType.CLEAR, fill: RED_BG },
          children: [new TextRun({ text: "En dessous de 30 contrats annotes couvrant au moins 4 assureurs sur 5, on ne peut pas conclure sur la precision d\u2019extraction. En dessous de 50 contrats, on ne peut pas autoriser une ouverture elargie.", font: "Calibri", size: 21, bold: true, color: RED })],
        }),

        // ── SUJET 6 ──
        heading2("Sujet 6 \u2014 Libelles client : remplacement de \u201Ccouvert\u201D"),
        heading3("Fragilite identifiee"),
        para([txt("Le mot \u201Ccouvert\u201D reste trop affirmatif pour un outil d\u2019extraction automatique. Un client qui lit \u201Ccouvert\u201D comprend \u201Cje suis protege\u201D. En cas de sinistre non pris en charge, le risque reputationnel et juridique est maximal.")]),

        heading3("Analyse comparative"),
        makeTable(
          ["Critere", "Option A : couvert / gap", "Option B : detecte / non detecte"],
          [
            ["Risque juridique", "MOYEN \u2014 \u201Ccouvert\u201D peut etre lu comme un avis IDD", "FAIBLE \u2014 \u201Cdetecte\u201D est factuel, constate une presence"],
            ["Risque reputationnel", "ELEVE \u2014 titre possible : \u201CBaloise disait couvert\u201D", "FAIBLE \u2014 \u201CBaloise avait detecte la mention\u201D est defensible"],
            ["Impact commercial", "Fort \u2014 rassure, incite moins au RDV", "Bon \u2014 cree une raison naturelle de consulter un conseiller"],
            ["Comprehension client", "Bonne mais dangereuse \u2014 conclut a tort qu\u2019il est protege", "Bonne et prudente \u2014 comprend que l\u2019outil a trouve une info"],
          ],
          [2000, 3513, 3513]
        ),
        spacer(60),

        heading3("Recommandation V2.1 : Option B retenue"),
        para([boldTxt("Le gain en securite juridique et reputationnelle depasse largement le cout commercial marginal.")]),

        heading3("Libelles exacts finaux [REWRITE]"),
        makeTable(
          ["Statut code", "Libelle FR", "Libelle DE", "Icone", "Couleur"],
          [
            ["detected", "Detecte dans votre contrat", "In Ihrem Vertrag erkannt", "Check", "Ambre"],
            ["partial", "Detecte avec reserve", "Mit Vorbehalt erkannt", "Triangle", "Ambre fonce"],
            ["not_detected", "Non detecte dans ce document", "In diesem Dokument nicht erkannt", "Croix", "Rouge doux"],
            ["not_evaluable", "Non evaluable", "Nicht bewertbar", "?", "Gris"],
          ],
          [1500, 2500, 2500, 1000, 1526]
        ),
        spacer(60),
        para([boldTxt("Phrases d\u2019accompagnement :")]),
        bulletBold("Detecte : ", "\u201CCette garantie semble presente dans votre contrat. Verifiez les conditions exactes avec votre conseiller.\u201D"),
        bulletBold("Avec reserve : ", "\u201CCette garantie semble presente mais un ecart possible a ete identifie (franchise, plafond ou sous-limite).\u201D"),
        bulletBold("Non detecte : ", "\u201CNous n\u2019avons pas identifie cette garantie dans votre document. Cela ne signifie pas necessairement qu\u2019elle est absente de votre contrat.\u201D"),
        bulletBold("Non evaluable : ", "\u201CL\u2019information n\u2019a pas pu etre extraite de maniere fiable. Consultez votre contrat ou votre conseiller.\u201D"),

        para([boldTxt("Impact TypeScript [CHANGE] : "), txt("AdequacyStatus = 'detected' | 'partial' | 'not_detected' | 'not_evaluable'")]),

        // ════════════════════════════════════════
        // PARTIE 3 — RECAPITULATIF MARQUAGES
        // ════════════════════════════════════════
        heading1("PARTIE 3 \u2014 Recapitulatif des marquages"),

        heading2("Sections KEEP (confirmees sans changement)"),
        makeTable(
          ["Section V2", "Statut"],
          [
            ["2. Definition stricte du perimetre (16 garanties MRH)", "KEEP"],
            ["3.1 Proposition de valeur", "KEEP"],
            ["3.2 Wordings CTA (\u201CFaites le point\u201D)", "KEEP"],
            ["3.3 Insertion dans la Roue des Besoins", "KEEP"],
            ["4.1 Position IDD (comparaison informative niveau b)", "KEEP"],
            ["4.2 Impact RGPD (art. 9 non applicable)", "KEEP"],
            ["4.3 Impact AI Act (MRH exclue)", "KEEP"],
            ["4.4 Disclaimers (sous reserve validation juridique)", "KEEP"],
            ["4.5 Formulations interdites (liste des 10)", "KEEP"],
            ["4.6 Points validation juridique (5 questions)", "KEEP"],
            ["5.3 Hierarchie des champs (niveaux A/B/C/D)", "KEEP"],
            ["5.4 Sous-assurance (approche prudente)", "KEEP"],
            ["6. Referentiel metier (16 garanties)", "KEEP"],
            ["7.2 Decisions tranchees (5 decisions)", "KEEP"],
          ],
          [7026, 2000]
        ),

        heading2("Sections CHANGE (correction ponctuelle)"),
        makeTable(
          ["Passage V2", "Changement"],
          [
            ["5.1 Tableau des 4 statuts", "couvert \u2192 detecte, gap \u2192 non detecte"],
            ["5.2 En-tetes seuils", "\u201Ccouvert\u201D \u2192 \u201Cdetecte\u201D"],
            ["7.3 UX de l\u2019incertitude", "Adapter aux nouveaux libelles"],
            ["8.2 Tableau, ligne maintenance", "\u201CNulle\u201D \u2192 \u201CLegere (prompt, revue trim.)\u201D"],
            ["8.4 AdequacyStatus", "covered \u2192 detected, gap \u2192 not_detected"],
            ["10. R1 faux positifs", "\u201Ccouvert\u201D \u2192 \u201Cdetecte\u201D"],
            ["12. Corpus", "25 \u2192 50, +3 jours, +3 jours annotation"],
          ],
          [4000, 5026]
        ),

        heading2("Sections REWRITE (paragraphe entier remplace)"),
        makeTable(
          ["Passage V2", "Remplacement V2.1"],
          [
            ["Section 1, \u201Cdev peut commencer sur l\u2019UI\u201D", "Reformulation 5 lignes (Sujet 1)"],
            ["Section 7.1 etape 2, \u201CPDF, JPEG, PNG\u201D", "Textes UX exacts (Sujet 2)"],
            ["Section 8.1, \u201Cpattern matching structure\u201D", "Position techno revisee (Sujet 3)"],
            ["Section 8.3 point 4, \u201Cpas de dictionnaire\u201D", "Integre dans position techno (Sujet 3)"],
            ["Section 9, GO/NO-GO Phase 1", "Seuils 3 niveaux (Sujet 4)"],
            ["Section 11.2, KPIs extraction", "Tableau 3 niveaux (Sujet 4)"],
            ["Section 13, Decision CPO", "Reformulation avec seuils V2.1 (Sujet 4)"],
          ],
          [4000, 5026]
        ),
        spacer(60),
        para([boldTxt("Sections DELETE : "), txt("aucune suppression. Le scope V2 est integralement maintenu.")]),

        // ════════════════════════════════════════
        // PARTIE 4 — RECOMMANDATION FINALE CPO
        // ════════════════════════════════════════
        heading1("PARTIE 4 \u2014 Recommandation finale CPO"),

        para([txt("La V2.1 confirme le GO CONDITIONNEL sur le perimetre MRH Luxembourg. Six fragilites ont ete corrigees : la matrice IDD est desambiguisee, les formats UX sont realignes avec la strategie Phase 1, la position techno est honnete sur les besoins de supervision, les seuils de qualite sont rehausses a des niveaux credibles pour une exposition client, le corpus passe a 50 contrats structures, et le mot \u201Ccouvert\u201D est remplace par \u201Cdetecte dans votre contrat\u201D.")]),

        new Paragraph({
          spacing: { before: 160, after: 160 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: NAVY }, bottom: { style: BorderStyle.SINGLE, size: 3, color: NAVY }, left: { style: BorderStyle.SINGLE, size: 3, color: NAVY }, right: { style: BorderStyle.SINGLE, size: 3, color: NAVY } },
          shading: { type: ShadingType.CLEAR, fill: NAVY_LIGHT },
          children: [new TextRun({ text: "Decision CPO V2.1 : Lancer Phase 0 (CTA factice) + dev backend + ecran d\u2019upload immediatement. Bloquer l\u2019ecran de restitution et les wordings jusqu\u2019a validation IDD. Constituer le corpus de 50 contrats en parallele. Go beta fermee uniquement si precision champs A >= 85%, faux positifs < 10%, coherence conseiller >= 75%.", font: "Calibri", size: 22, bold: true, color: NAVY })],
        }),
        spacer(60),

        para([boldTxt("Budget V2.1 : "), txt("8-9 semaines dev (1 developpeur, +3 jours corpus) + 8-15 EUR/mois API Mistral + 0.5 jour/mois maintenance prompt.")]),

        spacer(100),
        new Paragraph({
          spacing: { before: 160, after: 80 },
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, bottom: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, left: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, right: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK } },
          shading: { type: ShadingType.CLEAR, fill: GREEN_BG },
          children: [new TextRun({ text: "La V2.1 est suffisamment robuste pour etre presentee comme base d\u2019arbitrage finale. Aucun tour supplementaire n\u2019est requis.", font: "Calibri", size: 24, bold: true, color: GREEN_DARK })],
        }),

        spacer(200),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR, space: 12 } },
          children: [new TextRun({ text: "Correctif etabli le 28 mars 2026 par le college des 14 agents specialises.", font: "Calibri", size: 18, color: "999999", italics: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Ce document se lit conjointement avec la Note Collegiale V2.0 qu\u2019il corrige sur les 6 sujets traites.", font: "Calibri", size: 18, color: "999999", italics: true })],
        }),
      ],
    },
  ],
});

// ── GENERATE ──
const OUT = "/Users/pierrewinne/Roue-des-besoins-assurance/docs/CORRECTIF-COLLEGIAL-V2.1-ADEQUATION-HOME.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT, buffer);
  console.log("OK: " + OUT.split('/').pop() + " (" + buffer.length + " bytes)");
});
