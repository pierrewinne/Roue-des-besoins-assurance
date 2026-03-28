const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak, TabStopType, TabStopPosition } = require('docx');

// ── Baloise brand colors ──
const NAVY = "000d6e";
const NAVY_LIGHT = "E8EAF6";
const NAVY_MED = "C5CAE9";
const WHITE = "FFFFFF";
const AMBER = "F9A825";
const RED = "D32F2F";
const GREY = "9E9E9E";
const GREY_LIGHT = "F5F5F5";
const GREEN_DARK = "168741";
const BORDER_COLOR = "BDBDBD";

// ── Reusable helpers ──
const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

const PAGE_WIDTH = 11906; // A4
const MARGIN_LEFT = 1440;
const MARGIN_RIGHT = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 9026

function txt(text, opts = {}) {
  return new TextRun({ text, font: "Calibri", size: opts.size || 22, bold: opts.bold, italics: opts.italics, color: opts.color });
}

function boldTxt(text, opts = {}) {
  return txt(text, { ...opts, bold: true });
}

function navyTxt(text, opts = {}) {
  return txt(text, { ...opts, color: NAVY });
}

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

function cell(children, opts = {}) {
  const paras = Array.isArray(children) ? children : [para(Array.isArray(children) ? children : [typeof children === 'string' ? txt(children, { size: opts.fontSize || 20, bold: opts.bold }) : children], { after: 0 })];
  return new TableCell({
    borders,
    width: { size: opts.width || 1000, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: opts.verticalAlign,
    children: paras,
  });
}

function headerCell(text, width) {
  return cell([para([boldTxt(text, { size: 20, color: WHITE })], { after: 0 })], { width, shading: NAVY });
}

function dataCell(text, width, opts = {}) {
  return cell([para([txt(text, { size: 20, bold: opts.bold, italics: opts.italics })], { after: 0 })], { width, shading: opts.shading });
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => headerCell(h, colWidths[i])),
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((c, i) => dataCell(typeof c === 'string' ? c : String(c), colWidths[i], { shading: ri % 2 === 1 ? GREY_LIGHT : undefined })),
      })),
    ],
  });
}

function bullet(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 60 },
    children: [txt(text, { size: 22 })],
  });
}

function bulletBold(boldPart, rest, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [boldTxt(boldPart, { size: 22 }), txt(rest, { size: 22 })],
  });
}

function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    spacing: { after: 0 },
    indent: { left: 360 },
    children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "333333" })],
  }));
}

function quote(text) {
  return new Paragraph({
    spacing: { after: 120, before: 60 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 8 } },
    children: [txt(text, { size: 21, italics: true })],
  });
}

function spacer(size = 100) {
  return new Paragraph({ spacing: { after: size }, children: [] });
}

// ── BUILD DOCUMENT ──

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
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
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        spacer(3000),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "NOTE COLLEGIALE V2", font: "Calibri", size: 56, bold: true, color: NAVY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 12 } },
          children: [new TextRun({ text: "Adequation Contrats \u2014 Protection des Biens (HOME)", font: "Calibri", size: 32, color: NAVY })],
        }),
        spacer(400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Roue des Besoins Assurance \u2014 Baloise Luxembourg", font: "Calibri", size: 24, color: "666666" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Mars 2026", font: "Calibri", size: 24, color: "666666" })],
        }),
        spacer(600),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "Statut : NOTE DECISIONNELLE POUR COMITE PRODUIT", font: "Calibri", size: 20, bold: true, color: NAVY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "Version 2.0 \u2014 28 mars 2026", font: "Calibri", size: 20, color: "666666" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "Supersede : V1 (perimetre 4 quadrants, 48 garanties)", font: "Calibri", size: 20, color: "999999", italics: true })],
        }),
        spacer(400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "14 agents specialises contributeurs :", font: "Calibri", size: 18, color: "666666" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [new TextRun({ text: "PM, Insurance PM Habitation, Sales Architect, Compliance Officer, Legal Counsel,", font: "Calibri", size: 17, color: "888888" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [new TextRun({ text: "Risk Manager, Internal Audit, Senior Underwriting Expert, Actuaire Senior,", font: "Calibri", size: 17, color: "888888" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [new TextRun({ text: "Process Architect, IT Architect, Security Architect, QA Expert, Art Director", font: "Calibri", size: 17, color: "888888" })],
        }),
      ],
    },
    // ── MAIN CONTENT ──
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Note collegiale V2 \u2014 Adequation HOME \u2014 Baloise Luxembourg", font: "Calibri", size: 16, color: "999999", italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", font: "Calibri", size: 16, color: "999999" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "999999" }),
            ],
          })],
        }),
      },
      children: [
        // ══════════════════════════════════════════
        // SECTION 1: EXECUTIVE SUMMARY
        // ══════════════════════════════════════════
        heading1("1. Executive summary", false),

        // Verdict box
        new Paragraph({
          spacing: { before: 120, after: 120 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, bottom: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, left: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, right: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK } },
          shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "VERDICT : GO CONDITIONNEL", font: "Calibri", size: 28, bold: true, color: GREEN_DARK })],
        }),

        para([txt("Le recentrage sur la protection des biens (MRH Luxembourg) transforme un projet a risque eleve et perimetre flou en un projet maitrisable, testable et commercialement credible.")]),

        heading2("Ce qui change fondamentalement par rapport a la V1"),
        bulletBold("L\u2019article 9 RGPD (donnees de sante) ne s\u2019applique plus", " \u2014 le bloqueur le plus lourd de la V1 disparait"),
        bulletBold("16 garanties MRH au lieu de 48+ multi-produits", " \u2014 le referentiel est fini et bornable"),
        bulletBold("5 assureurs luxembourgeois au lieu de 15+", " \u2014 le dictionnaire de mapping est gerable"),
        bulletBold("L\u2019AI Act Annexe III.5(b) ne couvre pas la MRH", " \u2014 la charge reglementaire IA s\u2019allege massivement"),
        bulletBold("La DPIA reste necessaire mais devient significativement plus legere", " (1-2 semaines au lieu de 3-4)"),

        heading2("Recommandation"),
        para([txt("Lancer la V2 sur le perimetre MRH uniquement, avec une Phase 0 de validation marche (CTA factice, 4 semaines), puis une Phase 1 en extraction automatique PDF natifs via pdf-parse + Mistral Large (texte seul). Le full LLM vision n\u2019est PAS le chemin par defaut \u2014 le scope etroit MRH rend l\u2019OCR structuree + normalisation LLM plus efficace et moins chere. La restitution est categorique (couvert / partiel / gap / non evaluable), jamais en pourcentage, toujours sous reserve. Les 2 bloqueurs absolus restent la qualification IDD (a valider par le juridique Baloise) et la DPIA (meme allegee). Le dev peut commencer sur le moteur d\u2019adequation et l\u2019UI pendant que ces validations sont en cours. Ne pas etendre au-dela de HOME avant d\u2019avoir mesure la precision reelle sur 50+ contrats luxembourgeois.")]),

        // ══════════════════════════════════════════
        // SECTION 2: DEFINITION DU PERIMETRE
        // ══════════════════════════════════════════
        heading1("2. Definition stricte du perimetre V2"),

        heading2("2.1 Ce qui est DANS le scope (liste fermee)"),
        heading3("a) Garanties coeur de protection des biens"),
        makeTable(
          ["#", "Garantie normalisee", "Criticite"],
          [
            ["G01", "Incendie et evenements assimiles", "A - critique"],
            ["G02", "Degats des eaux et gel", "A - critique"],
            ["G03", "Vol / cambriolage / vandalisme", "A - critique"],
            ["G04", "Bris de glace", "B - utile"],
            ["G05", "Tempete / grele / neige", "A - critique"],
            ["G06", "Catastrophes naturelles / inondation", "A - critique"],
            ["G07", "Dommages electriques", "B - utile"],
            ["G08", "RC occupant / RC locataire", "B - utile (indissociable du MRH LU)"],
          ],
          [700, 5326, 3000]
        ),
        spacer(100),

        heading3("b) Parametres contractuels critiques"),
        makeTable(
          ["#", "Parametre", "Criticite"],
          [
            ["P01", "Capital batiment (proprietaire)", "A - critique"],
            ["P02", "Capital contenu mobilier", "A - critique"],
            ["P03", "Franchise generale", "A - critique"],
            ["P04", "Franchise specifique vol", "B - utile"],
            ["P05", "Franchise specifique degats des eaux", "B - utile"],
            ["P06", "Sous-limite objets de valeur", "B - utile"],
            ["P07", "Mode d\u2019indemnisation (valeur a neuf : oui/non)", "B - utile"],
            ["P08", "Date d\u2019effet / date d\u2019echeance", "A - critique"],
            ["P09", "Assureur / nom du produit", "A - critique"],
            ["P10", "Prime annuelle TTC", "C - indicatif"],
          ],
          [700, 5326, 3000]
        ),
        spacer(100),

        heading3("c) Elements laisses en \u201Cnon evaluable\u201D en V2"),
        makeTable(
          ["Element", "Raison"],
          [
            ["Perimetres detailles des garanties", "Defini dans les CG, pas dans les CP/TRG. Interpretation juridique requise."],
            ["Exclusions (liste complete)", "Trop longues, nuancees, contextuelles. Faux sentiment de securite si extraites partiellement."],
            ["Regime de vetuste detaille", "Formules complexes dans les CG. La mention \u201Cvaleur a neuf oui/non\u201D est le maximum extractible."],
            ["Obligations de l\u2019assure", "Conditionnent la couverture mais non extractibles automatiquement."],
            ["Regle proportionnelle de capitaux", "Mecanisme de sous-assurance dans les CG, pas dans les CP."],
            ["Clauses d\u2019indexation", "Variables, cachees, non standardisees."],
            ["Conditions de resiliation", "Hors perimetre adequation."],
          ],
          [3000, 6026]
        ),

        heading2("2.2 Ce qui est HORS scope (V2 uniquement)"),
        makeTable(
          ["Element exclus", "Justification"],
          [
            ["Assurance auto (DRIVE)", "Autre quadrant, autre structure de contrat"],
            ["Prevoyance (B-SAFE)", "Donnees de sante art. 9 RGPD = bloqueur"],
            ["Voyage (TRAVEL)", "Contrats courts, faible enjeu adequation"],
            ["Epargne / pension (FUTUR)", "Produits financiers, reglementation distincte"],
            ["RC vie privee standalone", "Contrat separe, pas un MRH"],
            ["Protection juridique standalone", "Idem"],
            ["Assistance (depannage, relogement)", "Garantie de service, pas de dommages aux biens"],
            ["Garantie scolaire", "Hors protection des biens"],
            ["Cyber / e-reputation", "Garantie recente, faible penetration, non standardisee"],
            ["Animaux de compagnie", "Hors protection des biens"],
            ["Piscine / jardin (detail)", "Peut etre mentionne mais pas evalue en profondeur"],
          ],
          [3500, 5526]
        ),
        spacer(60),
        para([boldTxt("Regle : "), txt("si c\u2019est absent de cette liste, c\u2019est HORS scope. Pas d\u2019interpretation extensive.")]),

        // ══════════════════════════════════════════
        // SECTION 3: PROPOSITION DE VALEUR
        // ══════════════════════════════════════════
        heading1("3. Proposition de valeur produit reelle"),

        heading2("3.1 A quoi sert cette fonctionnalite"),
        para([boldTxt("Ce qu\u2019elle fait : "), txt("elle permet a un client ayant complete le questionnaire \u201Cbiens\u201D de la Roue des Besoins d\u2019uploader son contrat MRH actuel pour obtenir une premiere lecture automatique de sa couverture, comparee a ses besoins declares.")]),
        para([boldTxt("Ce qu\u2019elle ne promet PAS :")]),
        bullet("Ce n\u2019est PAS un audit de couverture"),
        bullet("Ce n\u2019est PAS un conseil en assurance"),
        bullet("Ce n\u2019est PAS une comparaison de prix"),
        bullet("Ce n\u2019est PAS un certificat de couverture"),
        bullet("Ce n\u2019est PAS une recommandation de produit Baloise"),

        heading2("3.2 Wordings CTA evalues"),
        makeTable(
          ["#", "Wording", "Risque juridique", "Impact commercial", "Recommandation"],
          [
            ["1", "Verifiez si votre assurance habitation vous protege vraiment", "ELEVE \u2014 \u201Cvraiment\u201D implique un jugement", "Fort", "REJETE"],
            ["2", "Analysez votre couverture habitation", "MOYEN \u2014 \u201Canalysez\u201D peut etre lu comme conseil", "Fort", "ACCEPTABLE avec disclaimer"],
            ["3", "Faites le point sur votre assurance habitation", "FAIBLE \u2014 constatation factuelle", "Moyen-Fort", "RECOMMANDE"],
            ["4", "Comparez votre contrat habitation a vos besoins", "MOYEN \u2014 \u201Ccomparez\u201D implique une comparaison qualitative", "Fort", "ACCEPTABLE avec disclaimer"],
            ["5", "Consultez un apercu de votre couverture habitation", "FAIBLE \u2014 \u201Capercu\u201D = modestie assumee", "Faible", "Trop timide"],
          ],
          [500, 3200, 2200, 1200, 1926]
        ),
        spacer(60),
        para([boldTxt("Wording retenu : "), txt("\u201CFaites le point sur votre assurance habitation\u201D")]),
        para([boldTxt("Sous-titre : "), txt("\u201CIdentifiez ce que votre contrat couvre \u2014 et ce qu\u2019il ne couvre pas.\u201D")]),
        para([boldTxt("Condition d\u2019affichage : "), txt("le CTA n\u2019apparait que si le client a complete le quadrant biens ET a declare posseder un contrat MRH (home_coverage_existing !== \u2019none\u2019).")]),

        heading2("3.3 Insertion dans la Roue des Besoins"),
        para([txt("Le module V2 est une brique additionnelle qui enrichit le diagnostic existant. Il ne remplace ni le scoring, ni les recommandations, ni le tunnel de souscription.")]),
        ...codeBlock([
          "Questionnaire biens (7 questions)",
          "         |",
          "         v",
          "Scoring quadrant biens (needScore / coverageScore)",
          "         |",
          "         v",
          "Page resultats --> CTA \u201CFaites le point sur votre assurance habitation\u201D",
          "         |",
          "         v",
          "[V2] Upload contrat MRH --> extraction --> adequation",
          "         |",
          "         v",
          "Page adequation (couvert/partiel/gap/non evaluable par garantie)",
          "         |",
          "         v",
          "CTA principal : \u201CPrendre rendez-vous avec un conseiller\u201D",
          "CTA secondaire : \u201CTelecharger cette synthese\u201D",
        ]),
        spacer(60),
        para([boldTxt("Avantage du recentrage HOME : "), txt("la profondeur remplace l\u2019etendue. Un diagnostic MRH serieux avec 8-10 garanties evaluees individuellement a plus de valeur percue qu\u2019un survol superficiel de 4 branches. Baloise Luxembourg est un acteur de reference en MRH \u2014 c\u2019est une force a exploiter.")]),

        // ══════════════════════════════════════════
        // SECTION 4: QUALIFICATION REGLEMENTAIRE
        // ══════════════════════════════════════════
        heading1("4. Qualification reglementaire et juridique"),

        heading2("4.1 Position IDD : COMPARAISON INFORMATIVE (niveau b)"),
        para([txt("La V2 se situe au niveau de la comparaison factuelle, pas du conseil.")]),
        makeTable(
          ["Niveau IDD", "Description", "V2 MRH ?"],
          [
            ["a) Information pure", "\u201CVotre contrat inclut X, Y, Z\u201D", "Partiellement \u2014 l\u2019extraction seule est de l\u2019information"],
            ["b) Comparaison", "\u201CVotre contrat couvre X mais pas Y par rapport a vos besoins declares\u201D", "OUI \u2014 c\u2019est exactement ce que fait la V2"],
            ["c) Recommandation", "\u201CNous vous suggerons de souscrire Z\u201D", "NON \u2014 aucune suggestion de produit"],
            ["d) Conseil", "\u201CAu vu de votre situation personnelle, nous recommandons...\u201D", "NON \u2014 aucun conseil personnalise"],
          ],
          [1800, 4226, 3000]
        ),
        spacer(60),
        para([boldTxt("Frontiere a ne pas franchir :")]),
        bulletBold("Frontiere de langage : ", "aucune formulation suggestive (\u201Cnous recommandons\u201D, \u201Cvous devriez\u201D, \u201Cinsuffisant\u201D)"),
        bulletBold("Frontiere fonctionnelle : ", "le CTA post-adequation doit etre identique quel que soit le resultat (pas de bouton \u201Ccombler ce gap\u201D qui apparait uniquement devant un gap)"),
        spacer(60),
        para([boldTxt("Le recentrage MRH renforce cette qualification : "), txt("la V1 avec prevoyance/sante comportait un risque de glissement vers le conseil du fait de la sensibilite des donnees. La MRH est un produit de dommages aux biens \u2014 le registre factuel est plus naturel et defensible.")]),
        para([boldTxt("BLOQUANT : ", { color: RED }), txt("cette qualification doit etre validee par le service juridique Baloise Luxembourg AVANT la mise en production du front-end. Le dev backend peut demarrer.")]),

        heading2("4.2 Impact RGPD"),
        makeTable(
          ["Critere", "V1 (4 quadrants)", "V2 (MRH only)"],
          [
            ["Donnees de sante (art. 9)", "OUI (prevoyance, sante)", "NON"],
            ["Consentement art. 9 separe", "Obligatoire", "Non necessaire"],
            ["DPIA", "Obligatoire, complexe (3-4 sem.)", "Necessaire mais allegee (1-2 sem.)"],
            ["Donnees personnelles", "Oui (nom, adresse, patrimoine)", "Oui (idem)"],
            ["Consentement art. 6(1)(a)", "Requis", "Requis (checkbox avant upload)"],
            ["Transfert hors UE", "A evaluer selon provider", "Mistral = Paris, pas de transfert"],
          ],
          [3000, 3013, 3013]
        ),
        spacer(60),
        para([boldTxt("Condition critique : "), txt("le systeme DOIT rejeter tout contrat non-MRH pour eviter de traiter des donnees de sante par accident. Si un utilisateur uploade un contrat prevoyance, le systeme doit detecter le type et refuser le traitement.")]),

        heading2("4.3 Impact AI Act"),
        para([txt("L\u2019Annexe III point 5(b) du reglement AI Act ne couvre que l\u2019assurance-vie et l\u2019assurance maladie. La MRH en est exclue.")]),
        makeTable(
          ["Option technique", "Charge AI Act"],
          [
            ["OCR structure (pas d\u2019IA)", "Aucune"],
            ["Hybride OCR + LLM normalisation", "Transparence art. 50 uniquement : informer que l\u2019IA est utilisee"],
            ["Full LLM Vision", "Idem"],
          ],
          [4513, 4513]
        ),
        spacer(60),
        para([boldTxt("Si le scope est elargi a la prevoyance en V3, la question AI Act se reouvre.")]),

        heading2("4.4 Disclaimers precis"),
        para([boldTxt("Disclaimer 1 \u2014 Avant upload :")]),
        quote("En important votre contrat, vous autorisez Baloise a analyser automatiquement son contenu pour le comparer a vos besoins declares. Cette analyse est fournie a titre informatif et ne constitue ni un conseil en assurance, ni un avis sur l\u2019adequation de votre couverture. Votre document est supprime apres analyse."),
        para([boldTxt("Disclaimer 2 \u2014 Avec les resultats :")]),
        quote("Cette analyse repose sur les informations lisibles de votre contrat et sur vos reponses au questionnaire. Elle ne se substitue pas a la lecture de vos conditions generales et particulieres. Consultez votre conseiller pour une analyse detaillee."),
        para([boldTxt("Disclaimer 3 \u2014 Dans le PDF/export :")]),
        quote("Document genere automatiquement a titre informatif. Ne constitue pas un conseil en assurance au sens de la Directive sur la Distribution d\u2019Assurance (IDD). Les resultats presentes sont soumis aux reserves liees a la qualite de l\u2019extraction documentaire."),
        para([boldTxt("Ces disclaimers doivent etre valides par le service juridique Baloise Luxembourg avant production.", { color: RED })]),

        heading2("4.5 Formulations interdites"),
        makeTable(
          ["INTERDIT", "POURQUOI", "ACCEPTABLE"],
          [
            ["\u201CVous etes bien assure\u201D", "Jugement de valeur = conseil", "\u201CVotre contrat semble couvrir ce risque\u201D"],
            ["\u201CVotre couverture est suffisante\u201D", "Appreciation d\u2019adequation = conseil", "\u201CLe capital apparait coherent avec votre estimation\u201D"],
            ["\u201CIl vous manque la garantie X\u201D", "Directive = conseil", "\u201CCe risque ne semble pas couvert par votre contrat actuel\u201D"],
            ["\u201CVous devriez augmenter votre capital\u201D", "Injonction = conseil", "\u201CUn ecart possible a ete identifie entre votre estimation et le capital couvert\u201D"],
            ["\u201CVous n\u2019etes pas protege\u201D", "Dramatisation = manipulation", "\u201CNous n\u2019avons pas identifie de couverture pour ce risque dans votre document\u201D"],
            ["Score en pourcentage (78%)", "Fausse precision", "Statut qualitatif (couvert/partiel/gap/non eval.)"],
            ["\u201CNous recommandons le produit X\u201D", "Recommandation = conseil regule", "\u201CUn echange avec votre conseiller permettrait de preciser vos besoins\u201D"],
            ["\u201CCouverture insuffisante\u201D", "Jugement = conseil", "\u201CEcart possible detecte\u201D"],
            ["\u201CRisque non couvert\u201D", "Trop affirmatif sans CG", "\u201CNon detecte dans ce document\u201D"],
            ["\u201CSous-assure\u201D", "Terme technique + jugement", "\u201CEcart possible entre le capital assure et votre estimation\u201D"],
          ],
          [3000, 2800, 3226]
        ),

        heading2("4.6 Points necessitant validation juridique interne"),
        makeTable(
          ["#", "Question", "Bloquant ?", "Dev peut commencer ?"],
          [
            ["Q1", "La V2 MRH constitue-t-elle de l\u2019information ou de la comparaison au sens IDD ?", "OUI \u2014 bloquant front-end", "Backend : oui. UI resultats : non."],
            ["Q2", "Les disclaimers proposes sont-ils juridiquement suffisants ?", "OUI \u2014 bloquant production", "Dev avec disclaimers provisoires : oui"],
            ["Q3", "Le traitement de contrats concurrents pose-t-il un probleme de secret des affaires ?", "Bloquant production", "Oui"],
            ["Q4", "Le consentement par checkbox avant upload est-il suffisant ou faut-il une co-signature ?", "Non bloquant dev", "Oui"],
            ["Q5", "La mention \u201Csous reserve\u201D suffit-elle a exonerer Baloise en cas de faux positif ?", "Important", "Oui"],
          ],
          [500, 4526, 2000, 2000]
        ),

        // ══════════════════════════════════════════
        // SECTION 5: MODELE METIER
        // ══════════════════════════════════════════
        heading1("5. Modele metier d\u2019adequation V2"),

        heading2("5.1 Les 4 statuts \u2014 definition precise en contexte MRH"),
        makeTable(
          ["Statut", "Icone", "Couleur", "Definition precise"],
          [
            ["COUVERT", "Check", "Ambre (PAS vert)", "La garantie est presente ET le capital/plafond est dans la fourchette standard du marche LU. TOUJOURS accompagne de \u201Csous reserve des conditions de votre contrat\u201D."],
            ["PARTIEL", "Triangle", "Ambre fonce", "La garantie est presente MAIS capital/plafond inferieur au standard OU franchise elevee (> 500 EUR) OU sous-limite insuffisante par rapport aux biens declares."],
            ["GAP", "Croix", "Rouge", "La garantie est absente ou explicitement exclue du contrat."],
            ["NON EVALUABLE", "?", "Gris", "Information insuffisante, champ non extractible, ou confiance d\u2019extraction < 0.75."],
          ],
          [1500, 1000, 1500, 5026]
        ),
        spacer(60),
        para([boldTxt("Decision critique du Risk Manager : "), txt("le statut \u201CCOUVERT\u201D utilise une icone AMBRE, pas verte. Le vert donnerait un faux sentiment de securite. L\u2019ambre signale \u201Ca priori present, mais a verifier\u201D. C\u2019est la mitigation la plus forte contre le faux positif.")]),
        para([boldTxt("Decision critique de l\u2019Actuaire : "), txt("si la franchise ou le plafond n\u2019est pas extrait avec confiance >= 0.75, le statut est \u201Cnon evaluable\u201D, JAMAIS \u201Ccouvert\u201D. Mieux vaut un exces de prudence.")]),

        heading2("5.2 Seuils de reference pour \u201Cpartiel\u201D vs \u201Ccouvert\u201D"),
        makeTable(
          ["Champ", "Seuil \u201Ccouvert\u201D", "Seuil \u201Cpartiel\u201D", "Source"],
          [
            ["Capital contenu", ">= 70% de la tranche declaree", "40-70% de la tranche declaree", "Croisement questionnaire / extraction"],
            ["Franchise principale", "<= 500 EUR", "501-1 500 EUR", "Standard marche LU"],
            ["Franchise degats des eaux", "<= 300 EUR", "301-1 000 EUR", "Standard marche LU"],
            ["Sous-limite objets de valeur", ">= 30% du capital contenu", "15-30%", "Ratio standard Baloise HOME"],
            ["RC occupant (plafond)", ">= 2 500 000 EUR", "1 500 000 - 2 500 000 EUR", "Norme marche LU"],
          ],
          [2200, 2400, 2200, 2226]
        ),
        spacer(60),
        para([boldTxt("Ces seuils sont des INDICATEURS, pas des verdicts."), txt(" Tout statut \u201Ccouvert\u201D porte la mention \u201Csous reserve\u201D.")]),

        heading2("5.3 Hierarchie des champs"),
        heading3("Niveau A \u2014 Champs porteurs d\u2019un avis robuste"),
        makeTable(
          ["Champ", "Confiance attendue", "Justification"],
          [
            ["Assureur / produit", "> 95%", "En-tete standardise"],
            ["N\u00B0 contrat", "> 90%", "Format reconnaissable"],
            ["Qualite d\u2019occupation", "> 85%", "Structurant, CP"],
            ["Capital batiment", "> 85%", "Chiffre, CP/TRG"],
            ["Capital contenu", "> 85%", "Chiffre, CP/TRG"],
            ["Franchise generale", "> 80%", "Chiffre, CP/TRG"],
            ["Liste des garanties actives", "> 75%", "CP/TRG, necessite normalisation"],
            ["Dates d\u2019effet / echeance", "> 90%", "Structurees"],
          ],
          [3000, 2000, 4026]
        ),
        spacer(60),
        heading3("Niveau B \u2014 Champs exploitables avec reserve"),
        para([txt("Sous-limite objets de valeur, franchise vol, franchise degats des eaux, catastrophes naturelles (mention), prime TTC, valeur a neuf (mention oui/non), RC occupant (mention), surface.")]),
        heading3("Niveau C \u2014 Champs indicatifs"),
        para([txt("Bris de glace, dommages electriques, troubles du voisinage, recours des voisins, formule/niveau de garantie.")]),
        heading3("Niveau D \u2014 Non exploitables en V2"),
        para([txt("Perimetres detailles des garanties, exclusions, regime de vetuste, obligations de l\u2019assure, regle proportionnelle, clauses d\u2019indexation.")]),

        heading2("5.4 Sous-assurance"),
        para([boldTxt("Verdict : le systeme NE PEUT PAS detecter la sous-assurance de maniere fiable.")]),
        para([txt("Le systeme n\u2019a acces qu\u2019au capital assure (CP/TRG) mais PAS a la valeur reelle du bien. Traitement V2 :")]),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 60 },
          children: [boldTxt("Alertes objectives "), txt("(automatisables) : capital contenu < 10 000 EUR \u2192 alerte / capital batiment / surface < 1 500 EUR/m2 \u2192 alerte indicative")],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 60 },
          children: [boldTxt("Message pedagogique "), txt("(systematique) : \u201CL\u2019adequation de vos capitaux a la valeur reelle de vos biens ne peut etre verifiee automatiquement. Verifiez regulierement que vos capitaux correspondent a la valeur actuelle de votre habitation.\u201D")],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 60 },
          children: [boldTxt("Renvoi conseiller : "), txt("si alertes declenchees")],
        }),
        para([boldTxt("INTERDIT : ", { color: RED }), txt("donner un verdict \u201Ccouverture suffisante\u201D ou \u201Ccouverture insuffisante\u201D base sur des heuristiques.")]),

        // ══════════════════════════════════════════
        // SECTION 6: REFERENTIEL METIER
        // ══════════════════════════════════════════
        heading1("6. Referentiel metier HOME / protection des biens"),

        heading2("6.1 Referentiel V2 \u2014 16 garanties normalisees"),
        para([txt("Tableau complet des 16 garanties avec synonymes assureurs LU, type de donnee, criticite, extractibilite et piege principal. (Voir document source pour le detail integral.)")]),

        // Simplified table for the 16 guarantees (full table would be too wide)
        makeTable(
          ["#", "Garantie normalisee", "Type donnee", "Criticite", "Extractibilite"],
          [
            ["1", "Incendie / explosion", "Boolean inclus", "A", "Haute"],
            ["2", "Degats des eaux", "Boolean inclus", "A", "Haute"],
            ["3", "Vol / cambriolage", "Boolean + plafond EUR", "A", "Haute"],
            ["4", "Bris de glace", "Boolean inclus", "B", "Moyenne"],
            ["5", "Tempete / grele / neige", "Boolean inclus", "A", "Haute"],
            ["6", "Catastrophes naturelles", "Boolean + franchise EUR", "A", "Moyenne"],
            ["7", "Dommages electriques", "Boolean + plafond EUR", "B", "Moyenne"],
            ["8", "RC occupant", "Boolean + plafond EUR", "B", "Moyenne"],
            ["9", "Capital batiment", "Capital EUR", "A", "Haute"],
            ["10", "Capital contenu", "Capital EUR", "A", "Haute"],
            ["11", "Franchise generale", "Montant EUR", "A", "Haute"],
            ["12", "Franchise vol", "Montant EUR", "B", "Moyenne"],
            ["13", "Franchise degats des eaux", "Montant EUR", "B", "Moyenne"],
            ["14", "Sous-limite objets de valeur", "Sous-limite EUR", "B", "Moyenne"],
            ["15", "Valeur a neuf", "Boolean oui/non", "B", "Haute (mention)"],
            ["16", "Recours des voisins", "Boolean inclus", "C", "Basse"],
          ],
          [500, 2800, 2000, 900, 2826]
        ),

        heading2("6.2 HORS referentiel V2"),
        para([txt("Assistance (depannage, relogement), protection juridique standalone, garantie scolaire, piscine/jardin (detail), cyber/e-reputation, animaux, loyers impayes, panneaux solaires (detail), home office, garantie all-risk.")]),

        heading2("6.3 Documents sources cibles"),
        para([boldTxt("CP + TRG = base minimale viable. "), txt("L\u2019IPID est un bonus pour confirmer presence/absence d\u2019une garantie.")]),
        para([txt("Le systeme est credible pour repondre a :")]),
        bullet("\u201CQuelles garanties avez-vous souscrites ?\u201D \u2192 OUI"),
        bullet("\u201CQuels sont vos capitaux et franchises ?\u201D \u2192 OUI"),
        bullet("\u201CVotre contrat est-il en vigueur ?\u201D \u2192 OUI"),
        para([txt("Le systeme n\u2019est PAS credible pour repondre a :")]),
        bullet("\u201CEtes-vous suffisamment couvert ?\u201D \u2192 NON (necessite CG + evaluation du bien)"),
        bullet("\u201CQue couvre exactement votre garantie incendie ?\u201D \u2192 NON (necessite CG)"),
        bullet("\u201CQuelles sont vos exclusions ?\u201D \u2192 NON (necessite CG)"),

        // ══════════════════════════════════════════
        // SECTION 7: ARCHITECTURE FONCTIONNELLE
        // ══════════════════════════════════════════
        heading1("7. Architecture fonctionnelle cible"),

        heading2("7.1 Parcours client"),
        ...codeBlock([
          "Etape 1 : DECLENCHEMENT",
          "   Questionnaire biens complete + home_coverage_existing !== 'none'",
          "   \u2192 CTA \u201CFaites le point sur votre assurance habitation\u201D",
          "",
          "Etape 2 : UPLOAD",
          "   Ecran unique : \u201CImportez vos conditions particulieres MRH\u201D",
          "   \u2192 PDF, JPEG, PNG \u2014 max 10 MB",
          "   \u2192 Disclaimer consent (checkbox)",
          "",
          "Etape 3 : CONFIRMATION RAPIDE (1 ecran, PAS de wizard)",
          "   Pre-rempli depuis le questionnaire :",
          "   - Type de bien (appartement/maison)",
          "   - Statut (proprietaire/locataire)",
          "   \u2192 Le client confirme ou corrige ces 2 champs",
          "",
          "Etape 4 : ATTENTE",
          "   Loader avec estimation (\u201CAnalyse en cours, environ 30 secondes\u201D)",
          "   \u2192 Le client peut quitter et revenir",
          "",
          "Etape 5 : RESULTAT",
          "   Vue synthetique : nombre de points couvert/partiel/gap/non evaluable",
          "   Detail par garantie : 8-10 lignes max",
          "   Bandeau permanent : disclaimer V2",
          "   \u2192 CTA principal : \u201CPrendre rendez-vous avec un conseiller\u201D",
          "   \u2192 CTA secondaire : \u201CTelecharger cette synthese\u201D",
          "",
          "Etape 6 : ACTION",
          "   Si RDV \u2192 lead qualifie pousse au conseiller avec le rapport",
          "   Si telechargement PDF \u2192 trace audit",
        ]),

        heading2("7.2 Decisions tranchees"),
        makeTable(
          ["Question", "Decision", "Justification"],
          [
            ["Upload direct ?", "OUI \u2014 un seul bouton, pas de selection de type", "Chaque etape divise le taux de completion par 2"],
            ["Validation legere ou guidee ?", "Legere \u2014 1 ecran, 2 champs", "Le wizard est pour la souscription, pas le diagnostic"],
            ["Donnees a confirmer par le client ?", "Type de bien + statut (min. absolu)", "Structurant pour le matching, pre-rempli depuis questionnaire"],
            ["Le conseiller intervient quand ?", "APRES le resultat", "Il recoit le lead enrichi, pas un formulaire a valider"],
            ["Faut-il un ecran \u201Cverification\u201D ?", "NON \u2014 le bandeau disclaimer suffit", "Exception : si > 60% de \u201Cnon evaluable\u201D, message specifique"],
          ],
          [2500, 3500, 3026]
        ),

        heading2("7.3 UX de l\u2019incertitude (Art Director)"),
        bullet("Statuts visuellement distincts : check ambre (couvert), triangle ambre fonce (partiel), croix rouge (gap), \u201C?\u201D gris (non evaluable)"),
        bullet("\u201CNon evaluable\u201D est visuellement DISTINCT de \u201Cgap\u201D \u2014 pas la meme couleur, pas le meme icone"),
        bullet("Nombre d\u2019elements non evaluables affiche clairement"),
        bullet("Presentation : d\u2019abord ce qui est couvert, puis les zones partielles, puis les gaps"),
        bullet("Le client voit d\u2019abord la partie pleine du verre"),

        // ══════════════════════════════════════════
        // SECTION 8: POSITION TECHNOLOGIQUE
        // ══════════════════════════════════════════
        heading1("8. Position technologique V2"),

        heading2("8.1 Le scope MRH change-t-il la donne technique ?"),
        para([boldTxt("Oui, radicalement. "), txt("La V1 (5 familles de produits, 48 garanties, 15+ assureurs) justifiait un LLM capable de comprendre des documents inconnus. Le scope MRH Luxembourg est un domaine ferme : 5 assureurs, 16 garanties, 2 langues, champs connus a l\u2019avance.")]),
        para([txt("C\u2019est un probleme de "), boldTxt("pattern matching structure"), txt(", pas de "), boldTxt("comprehension ouverte du langage naturel"), txt(".")]),

        heading2("8.2 Comparaison des 3 options"),
        makeTable(
          ["Critere", "A : OCR + regles", "B : pdf-parse + LLM texte", "C : Full LLM vision"],
          [
            ["Precision PDF natifs MRH", "80-88%", "92-96%", "93-96%"],
            ["Precision scans", "0% (sans OCR)", "70-80% (Tesseract)", "88-93%"],
            ["Testabilite CI/CD", "Excellente", "Partielle", "Faible"],
            ["Cout mensuel (500p)", "0 EUR", "8-15 EUR", "15-25 EUR"],
            ["Charge reglementaire", "Nulle", "Moderee (art. 50 AI Act)", "Moderee"],
            ["Effort implementation", "10-15j", "8-10j", "5-7j"],
            ["Maintenance dictionnaire", "Lourde", "Nulle", "Nulle"],
            ["Risque hallucination", "Zero", "Faible", "Modere"],
            ["Gestion FR/DE bilingue", "Rigide", "Excellente", "Excellente"],
            ["Robustesse nouveaux formats", "Fragile", "Bonne", "Bonne"],
          ],
          [2500, 2000, 2526, 2000]
        ),

        heading2("8.3 Recommandation : Option B \u2014 pdf-parse + Mistral Large (texte seul)"),
        para([boldTxt("Le full LLM vision (Option C) n\u2019est PAS le chemin par defaut pour le scope MRH.")]),
        para([txt("Raisonnement :")]),
        new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 60 }, children: [txt("L\u2019ecrasante majorite des contrats MRH sont des PDF natifs (generes numeriquement). Envoyer une image la ou du texte propre suffit = gaspillage de tokens (cout 2x)")] }),
        new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 60 }, children: [txt("Le texte extrait par pdf-parse est parfait (c\u2019est le texte original). Le LLM n\u2019a qu\u2019a le structurer en JSON")] }),
        new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 60 }, children: [txt("Le scope etroit (16 garanties connues) permet un prompt tres directif \u2014 l\u2019espace d\u2019hallucination est drastiquement reduit")] }),
        new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 60 }, children: [txt("Pas de dictionnaire a maintenir : Mistral comprend \u201CWasserschaden\u201D = \u201Cdegats des eaux\u201D nativement")] }),
        new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 60 }, children: [txt("Mistral = Paris, RGPD conforme sans DPA supplementaire")] }),
        new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 60 }, children: [txt("Cout optimal : 8-15 EUR/mois pour 500 pages")] }),
        spacer(60),
        para([boldTxt("Le chemin vision (Pixtral) est le fallback pour les scans"), txt(" \u2014 branche conditionnelle, pas chemin par defaut. En V2, si le PDF n\u2019est pas natif, proposer la saisie manuelle plutot que d\u2019implementer la branche vision immediatement.")]),

        heading3("Pipeline V2"),
        ...codeBlock([
          "Upload PDF \u2192 Supabase Storage (bucket prive)",
          "    |",
          "    v",
          "Netlify Background Function (timeout 15 min)",
          "    |",
          "    v",
          "pdf-parse \u2192 texte extrait",
          "    |",
          "    v",
          "Texte > 50 chars/page ?",
          "    |           |",
          "   OUI         NON",
          "    |           |",
          "    v           v",
          "Mistral Large   Status 'manual' \u2192 saisie manuelle",
          "(texte seul)",
          "    |",
          "    v",
          "Validation Zod (schema MRH strict, enum garanties)",
          "    |",
          "    v",
          "UPDATE contract_uploads (status: 'completed', extracted_data: JSONB)",
          "    |",
          "    v",
          "Frontend : Supabase Realtime \u2192 affichage",
          "    |",
          "    v",
          "Moteur d\u2019adequation TypeScript (fonction pure, client-side)",
        ]),
        spacer(60),
        para([boldTxt("Ce qui change par rapport a la V1 :")]),
        bullet("1 table au lieu de 3 (JSONB dans contract_uploads)"),
        bullet("16 garanties au lieu de 48+ (enum ferme)"),
        bullet("Texte par defaut au lieu de vision par defaut"),
        bullet("Pas de stockage du texte brut (risque secret des affaires)"),
        bullet("Pas de stockage de l\u2019identite de l\u2019assure (minimisation RGPD)"),
        bullet("5 statuts simplifies a 4 (suppression de \u201Creview\u201D)"),

        heading2("8.4 Schema TypeScript MRH"),
        ...codeBlock([
          "export type MrhGuaranteeId =",
          "  | 'fire' | 'water_damage' | 'theft' | 'glass_breakage'",
          "  | 'storm' | 'natural_disaster' | 'electrical_damage'",
          "  | 'liability' | 'valuables'",
          "",
          "export interface MrhGuarantee {",
          "  id: MrhGuaranteeId",
          "  included: boolean",
          "  limit_eur: number | null",
          "  deductible_eur: number | null",
          "  confidence: number  // 0-1",
          "}",
          "",
          "export interface MrhExtractedData {",
          "  insurer: string",
          "  product_name: string | null",
          "  contract_number: string | null",
          "  effective_date: string | null",
          "  expiry_date: string | null",
          "  annual_premium_eur: number | null",
          "  contents_capital_eur: number | null",
          "  building_capital_eur: number | null",
          "  general_deductible_eur: number | null",
          "  new_value_replacement: boolean | null",
          "  guarantees: MrhGuarantee[]",
          "  language_detected: 'fr' | 'de' | 'mixed'",
          "  extraction_confidence: 'high' | 'medium' | 'low'",
          "}",
          "",
          "export type AdequacyStatus = 'covered' | 'partial' | 'gap' | 'not_evaluable'",
          "",
          "export interface GuaranteeAdequacy {",
          "  guaranteeId: MrhGuaranteeId",
          "  label: string",
          "  status: AdequacyStatus",
          "  detail: string",
          "  contractValue: string | null",
          "  needValue: string | null",
          "}",
        ]),

        // ══════════════════════════════════════════
        // SECTION 9: STRATEGIE DE PHASAGE
        // ══════════════════════════════════════════
        heading1("9. Strategie de phasage realiste"),

        heading2("Phase 0 : Validation marche (4 semaines)"),
        makeTable(
          ["Element", "Detail"],
          [
            ["Action", "Deployer CTA factice \u201CFaites le point sur votre assurance habitation\u201D sur ResultsPage"],
            ["Condition", "Uniquement si quadrant biens complete + contrat MRH declare"],
            ["Mesure", "Taux de clic pendant 4 semaines"],
            ["Seuil GO", "> 10% de taux de clic"],
            ["Seuil NO-GO", "< 5% \u2192 reconsiderer la priorite"],
            ["Effort", "2 jours dev"],
            ["En parallele", "Lancer la qualification IDD avec le juridique + DPIA allegee"],
          ],
          [2000, 7026]
        ),

        heading2("Phase 1 : V2 minimale credible (6-8 semaines dev)"),
        makeTable(
          ["Element", "Detail"],
          [
            ["Scope", "PDF natifs uniquement. Multi-assureurs (Baloise + Foyer + La Lux + AXA + Lalux)"],
            ["Extraction", "pdf-parse + Mistral Large (texte seul). Pas de vision."],
            ["Fallback", "Si PDF non natif (scan) \u2192 saisie manuelle structuree"],
            ["Garanties", "8 garanties A (coeur) + 8 parametres contractuels"],
            ["Adequation", "Moteur TypeScript pur, 4 statuts, deterministe"],
            ["UI", "Upload + confirmation + resultats + PDF export"],
            ["GO/NO-GO", "IDD validee + DPIA validee + precision >= 70% sur corpus 25 contrats"],
          ],
          [2000, 7026]
        ),
        spacer(60),
        para([boldTxt("Decisions tranchees Phase 1 :")]),
        bulletBold("PDF natifs seulement : ", "les scans/photos sont un cas minoritaire. Les differer a Phase 2 reduit l\u2019effort de 30% et elimine les risques OCR"),
        bulletBold("Multi-assureurs des Phase 1 : ", "la valeur de l\u2019outil est precisement de comparer les contrats concurrents. Baloise-only serait un gadget"),
        bulletBold("Pas de vision en Phase 1 : ", "si le PDF n\u2019est pas natif, saisie manuelle. C\u2019est honnete et ca construit le corpus de validation"),

        heading2("Phase 2 : Enrichissement (6-10 semaines apres Phase 1)"),
        makeTable(
          ["Element", "Detail"],
          [
            ["Scope", "Ajout scans/photos via Pixtral (vision). Ajout IPID pour validation croisee"],
            ["Garanties", "Ajout des 8 garanties B (utiles)"],
            ["UX", "Parcours conseiller (vue du rapport client, feedback post-RDV)"],
            ["Adequation", "Alertes sous-assurance (niveau 1 : seuils planchers)"],
            ["GO/NO-GO", "Precision Phase 1 >= 70% ET taux correction utilisateur < 30% ET feedback conseillers positif"],
          ],
          [2000, 7026]
        ),

        heading2("Phase 3 : Extension eventuelle (pas avant S2 2027)"),
        makeTable(
          ["Element", "Detail"],
          [
            ["Scope eventuel", "Extension a l\u2019auto (DRIVE) ou a la prevoyance (B-SAFE)"],
            ["Prerequis", "Precision MRH >= 80% en production + ROI commercial demontre"],
            ["Alerte", "L\u2019extension a la prevoyance reouvre l\u2019art. 9 RGPD + AI Act Annexe III"],
          ],
          [2000, 7026]
        ),
        spacer(60),
        para([boldTxt("Hypothese remise en question : "), txt("la V1 prevoyait Phase 1 = saisie manuelle, Phase 2 = extraction auto. La V2 inverse : Phase 1 = extraction auto PDF natifs (le cas majoritaire), saisie manuelle uniquement comme fallback. Raison : la saisie manuelle seule n\u2019apporte pas assez de valeur pour justifier l\u2019effort d\u2019implementation du wizard.")]),

        // ══════════════════════════════════════════
        // SECTION 10: RISQUES MAJEURS
        // ══════════════════════════════════════════
        heading1("10. Risques majeurs et contre-mesures"),

        heading2("Top 10 par criticite (impact x probabilite)"),
        makeTable(
          ["#", "Risque", "Prob.", "Impact", "Crit.", "Mitigation"],
          [
            ["R1", "Faux positif \u201Ccouvert\u201D : systeme dit couvert, client ne l\u2019est pas", "Elevee", "Critique", "1", "Icone ambre (pas vert), confiance >= 0.75, disclaimer, CTA conseiller"],
            ["R2", "Requalification IDD : le CAA considere l\u2019outil comme du conseil", "Faible", "Bloquant", "2", "Qualification IDD prealable, formulations interdites, CTA identique"],
            ["R3", "Sous-assurance non detectee", "Elevee", "Majeur", "3", "Message pedagogique, alertes seuils planchers, renvoi conseiller"],
            ["R4", "Interpretation abusive du client", "Moyenne", "Majeur", "4", "Bandeau disclaimer permanent, pas de vert, \u201Csous reserve\u201D"],
            ["R5", "Heterogeneite des contrats MRH LU", "Elevee", "Significatif", "5", "Dictionnaire normalisation LLM, monitoring par assureur"],
            ["R6", "Fuite de donnees concurrentielles", "Faible", "Majeur", "6", "Zero retention du document source, pas de stockage texte brut"],
            ["R7", "Hallucination LLM", "Moyenne", "Significatif", "7", "Schema Zod strict, enum ferme, confiance < 0.75 \u2192 non evaluable"],
            ["R8", "Derive du dictionnaire", "Elevee", "Significatif", "8", "Monitoring mensuel taux de \u201Cnon evaluable\u201D"],
            ["R9", "Indisponibilite API Mistral", "Faible", "Significatif", "9", "Fallback saisie manuelle, retry avec backoff"],
            ["R10", "Reputation : faux resultat mediatise", "Faible", "Critique", "10", "Beta fermee obligatoire (4 sem., 20 clients reels)"],
          ],
          [500, 2700, 800, 1000, 600, 3426]
        ),

        // ══════════════════════════════════════════
        // SECTION 11: KPIs
        // ══════════════════════════════════════════
        heading1("11. KPIs et criteres de succes"),

        heading2("11.1 KPIs d\u2019appetence (Phase 0)"),
        makeTable(
          ["KPI", "Seuil GO", "Seuil NO-GO", "Mesure"],
          [
            ["Taux de clic CTA", "> 10%", "< 5%", "Analytics"],
            ["Taux de completion upload", "> 40%", "< 20%", "Funnel analytics"],
          ],
          [3000, 1500, 1500, 3026]
        ),

        heading2("11.2 KPIs de qualite d\u2019extraction (Phase 1)"),
        makeTable(
          ["KPI", "Seuil minimum", "Cible", "Mesure"],
          [
            ["Precision extraction champs A", ">= 70%", ">= 85%", "Corpus annote 25 contrats"],
            ["Taux de \u201Cnon evaluable\u201D par garantie", "< 40%", "< 20%", "Production"],
            ["Taux de champs corriges par l\u2019utilisateur", "< 30%", "< 15%", "Ecran validation"],
            ["Temps d\u2019extraction", "< 30 sec", "< 15 sec", "Monitoring"],
            ["Taux d\u2019echec (status \u2019failed\u2019)", "< 10%", "< 5%", "Production"],
            ["Cout par extraction", "< 0.05 EUR", "< 0.03 EUR", "Facturation API"],
          ],
          [3000, 1500, 1500, 3026]
        ),

        heading2("11.3 KPIs de qualite d\u2019adequation"),
        makeTable(
          ["KPI", "Seuil minimum", "Mesure"],
          [
            ["Taux de faux positifs \u201Ccouvert\u201D", "< 10%", "Feedback conseillers post-RDV"],
            ["Taux de faux negatifs \u201Cgap\u201D", "< 15%", "Idem"],
            ["Coherence adequation vs avis conseiller", "> 80%", "Echantillon mensuel 20 cas"],
          ],
          [4000, 1500, 3526]
        ),

        heading2("11.4 KPIs de transformation commerciale"),
        makeTable(
          ["KPI", "Cible", "Mesure"],
          [
            ["Taux de conversion adequation \u2192 RDV conseiller", "> 25%", "CRM"],
            ["Taux de transformation RDV \u2192 offre", "> 40%", "CRM"],
          ],
          [4000, 1500, 3526]
        ),

        heading2("11.5 KPIs de risque / incidents"),
        makeTable(
          ["KPI", "Seuil alerte", "Action"],
          [
            ["Reclamation client liee a l\u2019adequation", "> 2/mois", "Revue immediate"],
            ["Faux positif detecte par conseiller", "> 15%", "Suspension + recalibration"],
            ["Derive qualite (taux non evaluable en hausse)", "+10pts en 1 mois", "Investigation"],
          ],
          [4000, 1500, 3526]
        ),

        // ══════════════════════════════════════════
        // SECTION 12: ESTIMATION DE CHARGE
        // ══════════════════════════════════════════
        heading1("12. Estimation de charge realiste"),

        heading2("Version minimale credible (Phase 0 + Phase 1)"),
        makeTable(
          ["Poste", "Estimation", "Faisable par 1 dev ?"],
          [
            ["CTA factice (Phase 0)", "2 jours", "Oui"],
            ["Migration Supabase (table + RLS + bucket Storage)", "2 jours", "Oui"],
            ["Netlify Background Function (pdf-parse + Mistral)", "5 jours", "Oui"],
            ["Prompt engineering + calibration MRH", "5 jours", "Oui, mais necessite corpus"],
            ["Moteur d\u2019adequation TypeScript + tests", "4 jours", "Oui"],
            ["Schema Zod + validation", "2 jours", "Oui"],
            ["UI upload + confirmation + resultats", "5 jours", "Oui"],
            ["PDF export adequation", "2 jours", "Oui"],
            ["Mise a jour delete_my_data / export_my_data", "1 jour", "Oui"],
            ["Audit trail (log_audit_event)", "1 jour", "Oui"],
            ["Tests integration + corpus 25 contrats", "5 jours", "Oui, si corpus disponible"],
            ["TOTAL", "34 jours = 7-8 semaines", "Oui, 1 dev"],
          ],
          [4000, 2500, 2526]
        ),

        heading2("Version confort (Phase 0 + Phase 1 + Phase 2)"),
        makeTable(
          ["Poste supplementaire", "Estimation"],
          [
            ["Branche vision Pixtral (scans/photos)", "5 jours"],
            ["Parcours conseiller (vue client + feedback)", "5 jours"],
            ["Alertes sous-assurance", "3 jours"],
            ["Tests supplementaires + corpus elargi", "5 jours"],
            ["TOTAL Phase 1 + Phase 2", "52 jours = 12-14 semaines"],
          ],
          [5500, 3526]
        ),

        heading2("Prerequis bloquants"),
        makeTable(
          ["Prerequis", "Responsable", "Delai estime", "Bloque quoi ?"],
          [
            ["Qualification IDD", "Service juridique Baloise", "2-4 semaines", "Front-end (UI resultats)"],
            ["DPIA allegee", "DPO Baloise", "1-2 semaines", "Production"],
            ["Corpus 25 contrats MRH (multi-assureurs)", "PM + UX", "2-4 semaines", "Prompt engineering + tests"],
            ["Validation disclaimers", "Service juridique", "1-2 semaines", "Production"],
          ],
          [2800, 2200, 1500, 2526]
        ),
        spacer(60),
        para([boldTxt("Alerte charge : "), txt("le corpus de 25 contrats MRH reels de 5 assureurs est le prerequis le plus difficile a obtenir. Sans contrats reels, le prompt engineering est un travail theorique. Le PM doit mobiliser des contacts internes (Baloise) et des clients volontaires (concurrence) pour constituer ce corpus.")]),

        // ══════════════════════════════════════════
        // SECTION 13: RECOMMANDATION FINALE
        // ══════════════════════════════════════════
        heading1("13. Recommandation finale collegiale"),

        // Verdict box
        new Paragraph({
          spacing: { before: 120, after: 120 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, bottom: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, left: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, right: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK } },
          shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "VERDICT : GO CONDITIONNEL \u2014 PERIMETRE MRH UNIQUEMENT", font: "Calibri", size: 28, bold: true, color: GREEN_DARK })],
        }),

        heading2("Ce qu\u2019il faut lancer MAINTENANT"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [boldTxt("CTA factice"), txt(" sur ResultsPage (2 jours) \u2014 mesure d\u2019appetence pendant 4 semaines")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [boldTxt("Qualification IDD"), txt(" avec le service juridique Baloise Luxembourg (en parallele)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [boldTxt("DPIA allegee"), txt(" MRH (en parallele, 1-2 semaines)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [boldTxt("Constitution du corpus"), txt(" de 25 contrats MRH reels multi-assureurs")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [boldTxt("Dev backend : "), txt("migration Supabase + Background Function + moteur d\u2019adequation (peut commencer des maintenant, pas bloque par IDD)")] }),

        heading2("Ce qu\u2019il faut REPOUSSER"),
        makeTable(
          ["Element", "Reporte a", "Raison"],
          [
            ["Scans / photos (vision LLM)", "Phase 2", "Cas minoritaire, effort +30%, risque OCR"],
            ["Extension a d\u2019autres quadrants", "Phase 3, pas avant S2 2027", "Reouvre art. 9 RGPD + AI Act"],
            ["Fine-tuning de modele", "Jamais en V2", "Injustifie a 500 pages/mois"],
            ["Score en pourcentage", "JAMAIS", "Fausse precision, risque reglementaire"],
            ["Comparaison de prix entre assureurs", "JAMAIS en V2", "Hors perimetre IDD"],
            ["Stockage long terme des documents", "JAMAIS", "RGPD minimisation + secret des affaires"],
          ],
          [3000, 2500, 3526]
        ),

        heading2("Ce qu\u2019il faut INTERDIRE dans la V2"),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Toute formulation suggestive ou directive (cf. liste des 10 formulations interdites)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Tout statut \u201Ccouvert\u201D en vert (uniquement ambre)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Tout CTA contextuel qui n\u2019apparait que devant un gap (\u201CCombler ce gap\u201D \u2192 INTERDIT)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Tout stockage du document source au-dela de l\u2019extraction")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Tout stockage du texte brut extrait (secret des affaires)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Toute extraction des Conditions Generales (trop risque en V2)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 }, children: [txt("Tout verdict automatique de sous-assurance")] }),

        heading2("Decision CPO"),
        new Paragraph({
          spacing: { before: 120, after: 120 },
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: NAVY }, bottom: { style: BorderStyle.SINGLE, size: 2, color: NAVY }, left: { style: BorderStyle.SINGLE, size: 2, color: NAVY }, right: { style: BorderStyle.SINGLE, size: 2, color: NAVY } },
          shading: { type: ShadingType.CLEAR, fill: NAVY_LIGHT },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Lancer Phase 0 immediatement. Dev backend Phase 1 en parallele. Front-end bloque jusqu\u2019a validation IDD.", font: "Calibri", size: 24, bold: true, color: NAVY })],
        }),
        spacer(60),
        para([txt("Le recentrage MRH transforme un projet ambitieux et risque en un projet sobre, testable et defensible. La valeur est dans la profondeur (8-10 garanties evaluees serieusement) et non dans l\u2019etendue. Le scope ferme est une force, pas une limite.")]),
        spacer(60),
        para([boldTxt("Budget : "), txt("7-8 semaines dev (1 developpeur) + 8-15 EUR/mois API Mistral.")]),
        para([boldTxt("Pre-requis critiques : "), txt("IDD + DPIA + corpus 25 contrats.")]),
        para([boldTxt("Go/No-Go Phase 1 : "), txt("CTA > 10% ET IDD favorable ET DPIA validee ET precision >= 70%.")]),

        spacer(200),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR, space: 12 } },
          children: [new TextRun({ text: "Note etablie le 28 mars 2026 par le college des 14 agents specialises pour decision en comite produit.", font: "Calibri", size: 18, color: "999999", italics: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Les analyses detaillees de chaque agent sont disponibles dans les documents de travail associes.", font: "Calibri", size: 18, color: "999999", italics: true })],
        }),
      ],
    },
  ],
});

// ── GENERATE ──
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/pierrewinne/Roue-des-besoins-assurance/docs/NOTE-COLLEGIALE-V2-ADEQUATION-HOME.docx", buffer);
  console.log("OK: NOTE-COLLEGIALE-V2-ADEQUATION-HOME.docx generated (" + buffer.length + " bytes)");
});
