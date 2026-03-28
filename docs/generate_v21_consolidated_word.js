const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak } = require('docx');

// ── Baloise brand ──
const NAVY = "000d6e";
const NAVY_LIGHT = "E8EAF6";
const WHITE = "FFFFFF";
const AMBER_DARK = "E65100";
const RED = "D32F2F";
const GREY_LIGHT = "F5F5F5";
const GREEN_DARK = "168741";
const GREEN_BG = "E8F5E9";
const BORDER_COLOR = "BDBDBD";

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
    ...(opts.pageBreakBefore ? { pageBreakBefore: true } : {}),
    ...(opts.indent ? { indent: opts.indent } : {}),
  });
}

function h1(text, pb = true) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 200 },
    ...(pb ? { pageBreakBefore: true } : {}),
    children: [new TextRun({ text, font: "Calibri", size: 32, bold: true, color: NAVY })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 160 },
    children: [new TextRun({ text, font: "Calibri", size: 26, bold: true, color: NAVY })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 120 },
    children: [new TextRun({ text, font: "Calibri", size: 23, bold: true, color: NAVY })] });
}

function hCell(text, w) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: cellMargins,
    children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, font: "Calibri", size: 20, bold: true, color: WHITE })] })] });
}
function dCell(text, w, opts = {}) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA },
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined, margins: cellMargins,
    children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, font: "Calibri", size: 20, bold: opts.bold, color: opts.color })] })] });
}

function makeTable(headers, rows, cw) {
  const tw = cw.reduce((a, b) => a + b, 0);
  return new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, cw[i])) }),
      ...rows.map((r, ri) => new TableRow({
        children: r.map((c, ci) => dCell(String(c), cw[ci], { bg: ri % 2 === 1 ? GREY_LIGHT : undefined }))
      }))
    ]
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 },
    children: [txt(text)] });
}
function bulletBold(b, rest, ref = "bullets") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 },
    children: [boldTxt(b), txt(rest)] });
}
function numItem(children, ref = "numbers") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 },
    children: Array.isArray(children) ? children : [children] });
}

function quote(text) {
  return new Paragraph({ spacing: { after: 120, before: 60 }, indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 8 } },
    children: [txt(text, { size: 21, italics: true })] });
}

function codeLines(lines) {
  return lines.map(l => new Paragraph({ spacing: { after: 0 }, indent: { left: 360 },
    children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "333333" })] }));
}

function spacer(s = 100) { return new Paragraph({ spacing: { after: s }, children: [] }); }

function verdictBox(text) {
  return new Paragraph({ spacing: { before: 120, after: 120 }, alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, bottom: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, left: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK }, right: { style: BorderStyle.SINGLE, size: 3, color: GREEN_DARK } },
    shading: { type: ShadingType.CLEAR, fill: GREEN_BG },
    children: [new TextRun({ text, font: "Calibri", size: 28, bold: true, color: GREEN_DARK })] });
}

function navyBox(text) {
  return new Paragraph({ spacing: { before: 120, after: 120 },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: NAVY }, bottom: { style: BorderStyle.SINGLE, size: 2, color: NAVY }, left: { style: BorderStyle.SINGLE, size: 2, color: NAVY }, right: { style: BorderStyle.SINGLE, size: 2, color: NAVY } },
    shading: { type: ShadingType.CLEAR, fill: NAVY_LIGHT },
    children: [new TextRun({ text, font: "Calibri", size: 22, bold: true, color: NAVY })] });
}

// ── BUILD ──
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
  numbering: { config: [
    { reference: "bullets", levels: [
      { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    ]},
    { reference: "numbers", levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    ]},
    { reference: "numbers2", levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    ]},
  ]},
  sections: [
    // ── COVER ──
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        spacer(2800),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: "NOTE COLLEGIALE V2.1 CONSOLIDEE", font: "Calibri", size: 52, bold: true, color: NAVY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 12 } },
          children: [new TextRun({ text: "Adequation Contrats \u2014 Protection des Biens (HOME)", font: "Calibri", size: 30, color: NAVY })] }),
        spacer(400),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
          children: [new TextRun({ text: "Roue des Besoins Assurance \u2014 Baloise Luxembourg", font: "Calibri", size: 24, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: "Mars 2026", font: "Calibri", size: 24, color: "666666" })] }),
        spacer(500),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "NOTE DECISIONNELLE POUR COMITE PRODUIT", font: "Calibri", size: 20, bold: true, color: NAVY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Version 2.1 consolidee \u2014 28 mars 2026", font: "Calibri", size: 20, color: "666666" })] }),
        spacer(300),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "14 agents specialises contributeurs", font: "Calibri", size: 18, color: "888888" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PM \u2022 Insurance PM Habitation \u2022 Sales Architect \u2022 Compliance Officer \u2022 Legal Counsel", font: "Calibri", size: 16, color: "999999" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Risk Manager \u2022 Internal Audit \u2022 Senior Underwriting Expert \u2022 Actuaire Senior", font: "Calibri", size: 16, color: "999999" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Process Architect \u2022 IT Architect \u2022 Security Architect \u2022 QA Expert \u2022 Art Director", font: "Calibri", size: 16, color: "999999" })] }),
      ],
    },
    // ── CONTENT ──
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Note collegiale V2.1 consolidee \u2014 Adequation HOME \u2014 Baloise Luxembourg", font: "Calibri", size: 16, color: "999999", italics: true })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [txt("Page ", { size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "999999" })] })] }) },
      children: [
        // ═══ 1. EXECUTIVE SUMMARY ═══
        h1("1. Executive summary", false),
        verdictBox("VERDICT : GO CONDITIONNEL"),
        para([txt("Le recentrage sur la protection des biens (MRH Luxembourg) transforme un projet a risque eleve et perimetre flou en un projet maitrisable, testable et commercialement credible.")]),
        h2("Ce qui change fondamentalement par rapport a la V1"),
        bulletBold("L\u2019article 9 RGPD (donnees de sante) ne s\u2019applique plus", " \u2014 le bloqueur le plus lourd de la V1 disparait"),
        bulletBold("16 garanties MRH au lieu de 48+ multi-produits", " \u2014 le referentiel est fini et bornable"),
        bulletBold("5 assureurs luxembourgeois au lieu de 15+", " \u2014 le dictionnaire de mapping est gerable"),
        bulletBold("L\u2019AI Act Annexe III.5(b) ne couvre pas la MRH", " \u2014 la charge reglementaire IA s\u2019allege massivement"),
        bulletBold("La DPIA reste necessaire mais plus legere", " (1-2 semaines au lieu de 3-4)"),
        h2("Recommandation"),
        para([txt("Lancer sur le perimetre MRH uniquement, avec une Phase 0 de validation marche (CTA factice, 4 semaines), puis une Phase 1 en extraction automatique PDF natifs via pdf-parse + Mistral Large (texte seul). La restitution est categorique (detecte / detecte avec reserve / non detecte / non evaluable), jamais en pourcentage, toujours sous reserve. Le dev backend, le CTA factice et l\u2019ecran d\u2019upload peuvent demarrer immediatement. L\u2019ecran de restitution client, le PDF export et les wordings des statuts sont bloques jusqu\u2019a validation IDD par le service juridique Baloise Luxembourg. Ne pas etendre au-dela de HOME avant d\u2019avoir mesure la precision reelle sur 50+ contrats.")]),

        // ═══ 2. PERIMETRE ═══
        h1("2. Definition stricte du perimetre"),
        h2("2.1 Ce qui est DANS le scope (liste fermee)"),
        h3("a) Garanties coeur de protection des biens"),
        makeTable(["#", "Garantie normalisee", "Criticite"],
          [["G01","Incendie et evenements assimiles","A - critique"],["G02","Degats des eaux et gel","A - critique"],["G03","Vol / cambriolage / vandalisme","A - critique"],["G04","Bris de glace","B - utile"],["G05","Tempete / grele / neige","A - critique"],["G06","Catastrophes naturelles / inondation","A - critique"],["G07","Dommages electriques","B - utile"],["G08","RC occupant / RC locataire","B - utile"]],
          [700, 5326, 3000]),
        spacer(80),
        h3("b) Parametres contractuels critiques"),
        makeTable(["#", "Parametre", "Criticite"],
          [["P01","Capital batiment (proprietaire)","A - critique"],["P02","Capital contenu mobilier","A - critique"],["P03","Franchise generale","A - critique"],["P04","Franchise specifique vol","B - utile"],["P05","Franchise specifique degats des eaux","B - utile"],["P06","Sous-limite objets de valeur","B - utile"],["P07","Mode d\u2019indemnisation (valeur a neuf : oui/non)","B - utile"],["P08","Date d\u2019effet / date d\u2019echeance","A - critique"],["P09","Assureur / nom du produit","A - critique"],["P10","Prime annuelle TTC","C - indicatif"]],
          [700, 5326, 3000]),
        spacer(80),
        h3("c) Elements laisses en \u201Cnon evaluable\u201D"),
        makeTable(["Element", "Raison"],
          [["Perimetres detailles des garanties","Defini dans les CG, pas dans les CP/TRG"],["Exclusions (liste complete)","Trop longues, nuancees, contextuelles"],["Regime de vetuste detaille","Formules complexes dans les CG"],["Obligations de l\u2019assure","Non extractibles automatiquement"],["Regle proportionnelle de capitaux","Dans les CG, pas dans les CP"],["Clauses d\u2019indexation","Variables, cachees, non standardisees"],["Conditions de resiliation","Hors perimetre adequation"]],
          [3000, 6026]),

        h2("2.2 Ce qui est HORS scope"),
        makeTable(["Element exclus", "Justification"],
          [["Assurance auto (DRIVE)","Autre quadrant, autre structure"],["Prevoyance (B-SAFE)","Donnees de sante art. 9 RGPD = bloqueur"],["Voyage (TRAVEL)","Contrats courts, faible enjeu"],["Epargne / pension (FUTUR)","Reglementation distincte"],["RC vie privee standalone","Contrat separe, pas un MRH"],["Protection juridique standalone","Idem"],["Assistance","Garantie de service, pas de dommages aux biens"],["Cyber / e-reputation / animaux / scolaire","Hors protection des biens"]],
          [3500, 5526]),
        para([boldTxt("Regle : "), txt("si c\u2019est absent de cette liste, c\u2019est HORS scope.")]),

        // ═══ 3. PROPOSITION DE VALEUR ═══
        h1("3. Proposition de valeur produit reelle"),
        h2("3.1 A quoi sert cette fonctionnalite"),
        para([boldTxt("Ce qu\u2019elle fait : "), txt("elle permet a un client ayant complete le questionnaire \u201Cbiens\u201D d\u2019uploader son contrat MRH actuel pour obtenir une premiere lecture automatique de son contenu, comparee a ses besoins declares.")]),
        para([boldTxt("Ce qu\u2019elle ne promet PAS :")]),
        bullet("Ce n\u2019est PAS un audit de couverture"),
        bullet("Ce n\u2019est PAS un conseil en assurance"),
        bullet("Ce n\u2019est PAS une comparaison de prix"),
        bullet("Ce n\u2019est PAS un certificat de couverture"),
        bullet("Ce n\u2019est PAS une recommandation de produit Baloise"),

        h2("3.2 Wording CTA retenu"),
        para([boldTxt("Wording : "), txt("\u201CFaites le point sur votre assurance habitation\u201D")]),
        para([boldTxt("Sous-titre : "), txt("\u201CIdentifiez les garanties presentes dans votre contrat \u2014 et celles qui ne le sont pas.\u201D")]),
        para([boldTxt("Condition : "), txt("quadrant biens complete + contrat MRH declare (home_coverage_existing !== \u2019none\u2019)")]),

        // ═══ 4. QUALIFICATION REGLEMENTAIRE ═══
        h1("4. Qualification reglementaire et juridique"),
        h2("4.1 Position IDD : COMPARAISON INFORMATIVE (niveau b)"),
        makeTable(["Niveau IDD", "Description", "Fonctionnalite MRH ?"],
          [["a) Information pure","\u201CVotre contrat mentionne X, Y, Z\u201D","Partiellement"],["b) Comparaison","\u201CVotre contrat mentionne X mais pas Y par rapport a vos besoins declares\u201D","OUI"],["c) Recommandation","\u201CNous vous suggerons de souscrire Z\u201D","NON"],["d) Conseil","\u201CAu vu de votre situation, nous recommandons...\u201D","NON"]],
          [1800, 4226, 3000]),
        spacer(60),
        para([boldTxt("BLOQUANT : "), txt("qualification a valider par le juridique Baloise AVANT mise en production de l\u2019ecran de restitution. Le backend et l\u2019upload peuvent demarrer sans attendre.")]),

        h2("4.2 Impact RGPD"),
        makeTable(["Critere", "V1 (4 quadrants)", "MRH uniquement"],
          [["Donnees de sante (art. 9)","OUI","NON"],["Consentement art. 9","Obligatoire","Non necessaire"],["DPIA","Complexe (3-4 sem.)","Allegee (1-2 sem.)"],["Transfert hors UE","A evaluer","Mistral = Paris, pas de transfert"]],
          [3000, 3013, 3013]),

        h2("4.3 Disclaimers"),
        para([boldTxt("Avant upload :")]),
        quote("En important votre contrat, vous autorisez Baloise a analyser automatiquement son contenu pour le comparer a vos besoins declares. Cette analyse est fournie a titre informatif et ne constitue ni un conseil en assurance, ni un avis sur l\u2019adequation de votre couverture. Votre document est supprime apres analyse."),
        para([boldTxt("Avec les resultats :")]),
        quote("Cette analyse repose sur les informations lisibles de votre contrat et sur vos reponses au questionnaire. Elle ne se substitue pas a la lecture de vos conditions generales et particulieres. Consultez votre conseiller pour une analyse detaillee."),
        para([boldTxt("Dans le PDF/export :")]),
        quote("Document genere automatiquement a titre informatif. Ne constitue pas un conseil en assurance au sens de la Directive sur la Distribution d\u2019Assurance (IDD). Les resultats sont soumis aux reserves liees a la qualite de l\u2019extraction documentaire."),

        h2("4.4 Formulations interdites"),
        makeTable(["INTERDIT", "ACCEPTABLE"],
          [["\u201CVous etes bien assure\u201D","\u201CCette garantie semble presente dans votre contrat\u201D"],["\u201CIl vous manque la garantie X\u201D","\u201CCette garantie n\u2019a pas ete detectee dans votre document\u201D"],["\u201CVous devriez augmenter votre capital\u201D","\u201CUn ecart possible a ete identifie\u201D"],["\u201CVous n\u2019etes pas protege\u201D","\u201CNous n\u2019avons pas identifie cette garantie dans votre document\u201D"],["Score en pourcentage","Statut qualitatif (detecte / non detecte / non evaluable)"],["\u201CSous-assure\u201D","\u201CEcart possible entre le capital assure et votre estimation\u201D"]],
          [4513, 4513]),

        // ═══ 5. MODELE METIER ═══
        h1("5. Modele metier d\u2019adequation"),
        h2("5.1 Les 4 statuts"),
        makeTable(["Statut", "Libelle FR", "Libelle DE", "Icone", "Couleur"],
          [["detected","Detecte dans votre contrat","In Ihrem Vertrag erkannt","Check","Ambre (PAS vert)"],["partial","Detecte avec reserve","Mit Vorbehalt erkannt","Triangle","Ambre fonce"],["not_detected","Non detecte dans ce document","In diesem Dokument nicht erkannt","Croix","Rouge doux"],["not_evaluable","Non evaluable","Nicht bewertbar","?","Gris"]],
          [1500, 2500, 2500, 1000, 1526]),
        spacer(60),
        para([boldTxt("Risk Manager : "), txt("le statut \u201Cdetecte\u201D utilise une icone AMBRE, pas verte. L\u2019ambre signale \u201Ca priori present, mais a verifier\u201D.")]),
        para([boldTxt("Actuaire : "), txt("si la confiance d\u2019extraction < 0.75, le statut est \u201Cnon evaluable\u201D, JAMAIS \u201Cdetecte\u201D.")]),

        h2("5.2 Phrases d\u2019accompagnement client"),
        bulletBold("Detecte : ", "\u201CCette garantie semble presente dans votre contrat. Verifiez les conditions exactes avec votre conseiller.\u201D"),
        bulletBold("Avec reserve : ", "\u201CCette garantie semble presente mais un ecart possible a ete identifie (franchise, plafond ou sous-limite).\u201D"),
        bulletBold("Non detecte : ", "\u201CNous n\u2019avons pas identifie cette garantie dans votre document. Cela ne signifie pas necessairement qu\u2019elle est absente de votre contrat.\u201D"),
        bulletBold("Non evaluable : ", "\u201CL\u2019information n\u2019a pas pu etre extraite de maniere fiable. Consultez votre contrat ou votre conseiller.\u201D"),

        h2("5.3 Seuils de reference"),
        makeTable(["Champ", "Seuil \u201Cdetecte\u201D", "Seuil \u201Cdetecte avec reserve\u201D", "Source"],
          [["Capital contenu",">= 70% de la tranche declaree","40-70% de la tranche","Questionnaire / extraction"],["Franchise principale","<= 500 EUR","501-1 500 EUR","Standard marche LU"],["Franchise DDE","<= 300 EUR","301-1 000 EUR","Standard marche LU"],["Sous-limite objets de valeur",">= 30% du capital contenu","15-30%","Ratio Baloise HOME"],["RC occupant (plafond)",">= 2 500 000 EUR","1 500 000 - 2 500 000 EUR","Norme marche LU"]],
          [2200, 2400, 2200, 2226]),
        para([boldTxt("Ces seuils sont des INDICATEURS, pas des verdicts."), txt(" Tout statut \u201Cdetecte\u201D porte la mention \u201Csous reserve\u201D.")]),

        // ═══ 6. REFERENTIEL (summary) ═══
        h1("6. Referentiel metier HOME"),
        para([txt("16 garanties normalisees avec synonymes assureurs LU (FR/DE), type de donnee, criticite (A/B/C), extractibilite et piege principal. Voir le referentiel complet en annexe du document source.")]),
        para([boldTxt("CP + TRG = base minimale viable. "), txt("L\u2019IPID est un bonus pour confirmer presence/absence.")]),

        // ═══ 7. ARCHITECTURE FONCTIONNELLE ═══
        h1("7. Architecture fonctionnelle cible"),
        h2("7.1 Parcours client"),
        ...codeLines([
          "Etape 1 : DECLENCHEMENT",
          "   Questionnaire biens complete + contrat MRH declare",
          "   \u2192 CTA \u201CFaites le point sur votre assurance habitation\u201D",
          "",
          "Etape 2 : UPLOAD",
          "   \u201CImporter votre document\u201D",
          "   Formats : PDF (recommande), JPEG, PNG \u2014 10 Mo max",
          "   Sous-texte : \u201CPour une analyse automatique, importez de preference",
          "   le PDF recu de votre assureur.\u201D",
          "   Disclaimer consent (checkbox)",
          "",
          "Etape 3 : CONFIRMATION (1 ecran, 2 champs pre-remplis)",
          "   Type de bien + Statut (proprietaire/locataire)",
          "",
          "Etape 4 : TRAITEMENT",
          "   PDF natif \u2192 extraction automatique Mistral",
          "   Scan/image \u2192 message + saisie manuelle",
          "",
          "Etape 5 : RESULTAT",
          "   Synthese par statut + detail par garantie + disclaimer",
          "   CTA : \u201CPrendre RDV avec un conseiller\u201D",
          "",
          "Etape 6 : ACTION",
          "   RDV \u2192 lead qualifie | PDF \u2192 trace audit",
        ]),

        h2("7.2 Matrice de demarrage IDD"),
        para([boldTxt("Regle : "), txt("tout ce qui ne montre pas de resultat au client peut demarrer avant validation IDD.")]),
        makeTable(["Composant", "Avant IDD ?", "Condition"],
          [["Backend (migration, extraction, moteur, Zod)","OUI","Aucune"],["CTA factice (Phase 0)","OUI","Ne delivre aucun resultat"],["Ecran d\u2019upload + confirmation","OUI","Collecte un document, ne restitue rien"],["Ecran de restitution des resultats","NON","Affiche des statuts = risque IDD"],["Wordings des statuts client","NON","Valides avec le juridique"],["PDF export adequation","NON","Contient les resultats"],["Parcours conseiller","NON","Idem"]],
          [3500, 1000, 4526]),

        h2("7.3 UX de l\u2019incertitude"),
        bullet("Statuts visuellement distincts : check ambre, triangle ambre fonce, croix rouge doux, \u201C?\u201D gris"),
        bullet("\u201CNon evaluable\u201D visuellement DISTINCT de \u201Cnon detecte\u201D"),
        bullet("Presentation : detecte d\u2019abord, puis reserves, puis non detectes"),
        bullet("Chaque statut accompagne d\u2019une phrase factuelle + renvoi conseiller"),

        // ═══ 8. POSITION TECHNO ═══
        h1("8. Position technologique"),
        h2("8.1 Contexte"),
        para([txt("Le scope MRH Luxembourg est un domaine considerablement plus restreint que la V1 : 5 assureurs, 16 garanties, 2 langues. Cela reduit la complexite, mais ne l\u2019elimine pas. Les contrats MRH luxembourgeois presentent une heterogeneite reelle : conventions de presentation differentes, terminologie variable entre assureurs, champs parfois absents ou fusionnes. Ce n\u2019est plus un probleme de comprehension ouverte du langage naturel, mais ce n\u2019est pas non plus un simple pattern matching. C\u2019est un probleme de "), boldTxt("structuration guidee avec supervision humaine legere"), txt(".")]),

        h2("8.2 Recommandation : Option B \u2014 pdf-parse + Mistral Large"),
        makeTable(["Critere", "A : OCR + regles", "B : pdf-parse + LLM", "C : Full LLM vision"],
          [["Precision PDF natifs","80-88%","92-96%","93-96%"],["Precision scans","0%","70-80%","88-93%"],["Testabilite CI/CD","Excellente","Partielle","Faible"],["Cout mensuel (500p)","0 EUR","8-15 EUR","15-25 EUR"],["Maintenance prompt","N/A (dict. lourd)","Legere (revue trim.)","Legere"],["Risque hallucination","Zero","Faible","Modere"],["Gestion FR/DE","Rigide","Excellente","Excellente"]],
          [2500, 2000, 2526, 2000]),
        spacer(60),
        para([txt("Le LLM remplace le dictionnaire de regles explicite, pas le besoin de normalisation. Le prompt MRH contient une table de mapping des 16 garanties avec leurs synonymes FR/DE. Ce prompt est un artefact a maintenir : revise a chaque ajout d\u2019assureur et lors du monitoring mensuel.")]),
        para([boldTxt("Le LLM est un accelerateur, pas un pilote automatique."), txt(" Prevoir 0.5 jour/mois de maintenance du prompt et du monitoring qualite.")]),

        h2("8.3 Automatise / Supervise / N\u2019essaie pas"),
        makeTable(["On automatise", "On supervise", "On n\u2019essaie pas"],
          [["Extraction texte via pdf-parse","Taux \u201Cnon evaluable\u201D par assureur","Interpretation des CG"],["Structuration JSON via Mistral","Correction utilisateur par champ","Extraction des exclusions"],["Validation Zod (enum, bornes)","Coherence vs avis conseiller (20 cas/mois)","Detection sous-assurance"],["Detection PDF natif vs scan","Revue prompt trimestrielle","Champs inconnus \u2192 non evaluable"],["Classification MRH / non-MRH","Alertes hallucination","Documents manuscrits"]],
          [3000, 3026, 3000]),

        h2("8.4 Schema TypeScript"),
        ...codeLines([
          "export type MrhGuaranteeId =",
          "  | 'fire' | 'water_damage' | 'theft' | 'glass_breakage'",
          "  | 'storm' | 'natural_disaster' | 'electrical_damage'",
          "  | 'liability' | 'valuables'",
          "",
          "export type AdequacyStatus = 'detected' | 'partial' | 'not_detected' | 'not_evaluable'",
        ]),

        // ═══ 9. PHASAGE ═══
        h1("9. Strategie de phasage"),
        h2("Phase 0 : Validation marche (4 semaines)"),
        makeTable(["Element", "Detail"],
          [["Action","CTA factice \u201CFaites le point\u201D sur ResultsPage"],["Seuil GO","> 10% taux de clic"],["Seuil NO-GO","< 5%"],["Effort","2 jours dev"],["En parallele","IDD + DPIA + constitution corpus"]],
          [2000, 7026]),

        h2("Phase 1 : Minimale credible (6-8 semaines)"),
        makeTable(["Element", "Detail"],
          [["Scope","PDF natifs auto + images acceptees (redirigees vers saisie manuelle). 5 assureurs LU."],["Extraction","pdf-parse + Mistral Large (texte seul). Pas de vision."],["Fallback","Document non exploitable auto \u2192 saisie manuelle. Aucune promesse d\u2019analyse auto pour les images."],["Adequation","Moteur TypeScript, 4 statuts, deterministe"],["GO/NO-GO","IDD validee + DPIA + precision A >= 85% + faux positifs < 10% + coherence conseiller >= 75%"]],
          [2000, 7026]),

        h2("Phase 2 : Enrichissement (6-10 semaines apres Phase 1)"),
        makeTable(["Element", "Detail"],
          [["Scope","Scans/photos via Pixtral. IPID pour validation croisee."],["Garanties","Ajout des 8 garanties B"],["GO/NO-GO","Precision >= 85% en production + correction < 30% + feedback conseillers"]],
          [2000, 7026]),

        // ═══ 10. RISQUES ═══
        h1("10. Risques majeurs"),
        makeTable(["#", "Risque", "Prob.", "Impact", "Mitigation"],
          [["R1","Faux positif \u201Cdetecte\u201D","Elevee","Critique","Ambre (pas vert), confiance >= 0.75, disclaimer, CTA conseiller"],["R2","Requalification IDD","Faible","Bloquant","Qualification prealable, formulations interdites, CTA identique"],["R3","Sous-assurance non detectee","Elevee","Majeur","Message pedagogique, alertes seuils, renvoi conseiller"],["R4","Interpretation abusive client","Moyenne","Majeur","Disclaimer permanent, \u201Csous reserve\u201D systematique"],["R5","Heterogeneite contrats LU","Elevee","Significatif","Prompt MRH + monitoring par assureur + fallback non evaluable"],["R6","Fuite donnees concurrentielles","Faible","Majeur","Zero retention source, pas de stockage texte brut"],["R7","Hallucination LLM","Moyenne","Significatif","Zod strict, enum ferme, confiance < 0.75 \u2192 non evaluable"],["R8","Derive du prompt","Elevee","Significatif","Monitoring mensuel, revue prompt trimestrielle"],["R9","Indisponibilite Mistral","Faible","Significatif","Fallback saisie manuelle, retry backoff"],["R10","Reputation","Faible","Critique","Beta fermee obligatoire (4 sem., 20 clients)"]],
          [500, 2200, 800, 1000, 4526]),

        // ═══ 11. KPIs ═══
        h1("11. KPIs et criteres de succes"),
        h2("11.1 Appetence (Phase 0)"),
        makeTable(["KPI", "GO", "NO-GO"],
          [["Taux de clic CTA","> 10%","< 5%"],["Completion upload","> 40%","< 20%"]],
          [4000, 2513, 2513]),

        h2("11.2 Qualite \u2014 3 niveaux"),
        makeTable(["KPI", "Build interne", "Beta fermee", "Ouverture elargie"],
          [["Precision champs A",">= 75%",">= 85%",">= 90%"],["Precision champs B",">= 60%",">= 70%",">= 80%"],["Faux positifs \u201Cdetecte\u201D","< 20%","< 10%","< 5%"],["Non evaluable / garantie A","< 40%","< 25%","< 15%"],["Coherence avis conseiller","N/A",">= 75%",">= 85%"],["Reclamation client","N/A","< 5%","< 2%"],["Correction utilisateur","N/A","< 30%","< 15%"]],
          [2800, 1800, 2500, 1926]),
        spacer(60),
        para([boldTxt("Build \u2192 Beta : "), txt("seuils Build + IDD + DPIA")]),
        para([boldTxt("Beta \u2192 Ouverture : "), txt("seuils Beta pendant 4 semaines + zero incident critique")]),
        para([boldTxt("Si seuils Beta non atteints apres 6 semaines : "), txt("STOP, recalibration, nouveau cycle beta")]),

        h2("11.3 Transformation commerciale"),
        makeTable(["KPI", "Cible"],
          [["Adequation \u2192 RDV conseiller","> 25%"],["RDV \u2192 offre","> 40%"]],
          [5513, 3513]),

        // ═══ 12. CHARGE ═══
        h1("12. Estimation de charge"),
        h2("Phase 0 + Phase 1 : 37 jours = 8-9 semaines"),
        makeTable(["Poste", "Estimation"],
          [["CTA factice","2 jours"],["Migration Supabase","2 jours"],["Background Function (pdf-parse + Mistral)","5 jours"],["Prompt engineering + calibration","5 jours"],["Moteur adequation TS + tests","4 jours"],["Schema Zod + validation","2 jours"],["UI upload + confirmation + resultats","5 jours"],["PDF export","2 jours"],["RGPD (delete/export)","1 jour"],["Audit trail","1 jour"],["Tests + corpus 50 contrats + annotation","8 jours"],["TOTAL","37 jours"]],
          [5500, 3526]),

        h2("Corpus structure"),
        makeTable(["Niveau", "Taille", "Usage"],
          [["Calibration","15-20 contrats","Dev, iterations prompt, tests"],["Pilote","30-40 contrats","Beta fermee, mesure des seuils"],["Go-live","50+ contrats","Decision finale"]],
          [2000, 2000, 5026]),
        spacer(60),
        para([boldTxt("En dessous de 30 contrats (4+ assureurs), on ne peut pas conclure. En dessous de 50, pas d\u2019ouverture elargie.")]),

        h2("Prerequis bloquants"),
        makeTable(["Prerequis", "Responsable", "Delai", "Bloque"],
          [["Qualification IDD","Juridique Baloise","2-4 sem.","Ecran restitution"],["DPIA allegee","DPO Baloise","1-2 sem.","Production"],["Corpus 50 contrats","PM + UX","3-6 sem.","Prompt + tests"],["Validation disclaimers","Juridique","1-2 sem.","Production"]],
          [2500, 2000, 1500, 3026]),

        // ═══ 13. RECOMMANDATION FINALE ═══
        h1("13. Recommandation finale collegiale"),
        verdictBox("GO CONDITIONNEL \u2014 PERIMETRE MRH UNIQUEMENT"),

        h2("Lancer MAINTENANT"),
        numItem([boldTxt("CTA factice "), txt("sur ResultsPage (2 jours) \u2014 mesure appetence 4 semaines")]),
        numItem([boldTxt("Qualification IDD "), txt("avec le juridique Baloise (en parallele)")]),
        numItem([boldTxt("DPIA allegee "), txt("MRH (en parallele)")]),
        numItem([boldTxt("Constitution corpus "), txt("50 contrats MRH reels multi-assureurs")]),
        numItem([boldTxt("Dev backend + upload : "), txt("migration Supabase + Background Function + moteur + ecran upload")]),

        h2("REPOUSSER"),
        makeTable(["Element", "Reporte a", "Raison"],
          [["Scans / photos (vision)","Phase 2","Effort +30%, risque OCR"],["Extension auto / prevoyance","Phase 3 (S2 2027)","Art. 9 RGPD + AI Act"],["Score en pourcentage","JAMAIS","Fausse precision"],["Comparaison de prix","JAMAIS","Hors IDD"],["Stockage long terme documents","JAMAIS","RGPD + secret des affaires"]],
          [3000, 2500, 3526]),

        h2("INTERDIRE"),
        numItem([txt("Toute formulation suggestive ou directive")], "numbers2"),
        numItem([txt("Tout statut \u201Cdetecte\u201D en vert (uniquement ambre)")], "numbers2"),
        numItem([txt("Tout CTA contextuel lie a un statut particulier")], "numbers2"),
        numItem([txt("Tout stockage du document source ou du texte brut")], "numbers2"),
        numItem([txt("Toute extraction des Conditions Generales")], "numbers2"),
        numItem([txt("Tout verdict automatique de sous-assurance")], "numbers2"),

        h2("Decision CPO"),
        navyBox("Lancer Phase 0 (CTA factice) + dev backend + ecran d\u2019upload immediatement. Bloquer l\u2019ecran de restitution et les wordings jusqu\u2019a validation IDD. Constituer le corpus de 50 contrats en parallele. Go beta fermee uniquement si precision champs A >= 85%, faux positifs < 10%, coherence conseiller >= 75%."),
        spacer(60),
        para([boldTxt("Budget : "), txt("8-9 semaines dev (1 developpeur) + 8-15 EUR/mois API Mistral + 0.5 jour/mois maintenance prompt.")]),
        para([boldTxt("Pre-requis : "), txt("IDD + DPIA + corpus 50 contrats.")]),
        para([boldTxt("Go/No-Go Phase 1 : "), txt("CTA > 10% ET IDD favorable ET DPIA validee ET precision A >= 85% ET faux positifs < 10% ET coherence conseiller >= 75%.")]),

        spacer(200),
        new Paragraph({ alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR, space: 12 } },
          children: [new TextRun({ text: "Note etablie le 28 mars 2026 par le college des 14 agents specialises pour decision en comite produit.", font: "Calibri", size: 18, color: "999999", italics: true })] }),
      ],
    },
  ],
});

const OUT = "/Users/pierrewinne/Roue-des-besoins-assurance/docs/NOTE-COLLEGIALE-V2.1-CONSOLIDEE-ADEQUATION-HOME.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT, buffer);
  console.log("OK: " + OUT.split('/').pop() + " (" + buffer.length + " bytes)");
});
