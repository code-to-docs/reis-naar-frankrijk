// Gerechten specifiek voor Lozère, Cantal en de Pyrénées Ariégeoises
// plus direct gerelateerde streekkeukens (Aubrac, Auvergne, Occitanie).

import type { Gerecht } from "./types.js";

export const gerechtenData: Gerecht[] = [
  {
    id: "aligot-aubrac",
    naam: "Aligot",
    frans: "Aligot de l'Aubrac",
    omschrijving: "Romige aardappelpuree met tomme-fraiche, vooral populair in Aubrac, Lozère en Cantal.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["aubrac", "lozere", "cantal"]
  },
  {
    id: "truffade-cantal",
    naam: "Truffade",
    frans: "Truffade au Cantal",
    omschrijving: "Gebakken aardappels met verse Cantal-kaas, vaak met ham of charcuterie geserveerd.",
    emoji: "\u{1F95E}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "pounti-cantal",
    naam: "Pounti",
    frans: "Pounti auvergnat",
    omschrijving: "Dikke cake-achtige terrine met kruiden, snijbiet, pruimen en meestal varkensvlees.",
    emoji: "\u{1F9C8}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "bourriol-cantal",
    naam: "Bourriol",
    frans: "Bourriol du Cantal",
    omschrijving: "Boekweitpannenkoek uit Cantal, vaak gevuld met kaas of kruidenboter.",
    emoji: "\u{1F95E}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "streetfood",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "viande-salers-cantal",
    naam: "Viande de Salers",
    frans: "Viande de Salers",
    omschrijving: "Mals en mooi gemarmerd rundvlees van Salers-koeien, vaak als entrecote geserveerd.",
    emoji: "\u{1F969}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "cantal-kaas",
    naam: "Cantal",
    frans: "Fromage Cantal",
    omschrijving: "Halfharde koemelkkaas uit de Auvergne, van jeune tot vieux met steeds meer pit.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "salers-kaas",
    naam: "Salers",
    frans: "Fromage Salers",
    omschrijving: "Rauwmelkse bergkaas met uitgesproken smaak, traditioneel alleen in het weideseizoen gemaakt.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "bleu-auvergne",
    naam: "Bleu d'Auvergne",
    frans: "Bleu d'Auvergne",
    omschrijving: "Romige blauwaderkaas met pittige, ziltige tonen uit het hart van de Auvergne.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "cornet-murat",
    naam: "Cornet de Murat",
    frans: "Cornet de Murat",
    omschrijving: "Opgerold wafelhoorntje uit Murat, traditioneel gevuld met slagroom of banketbakkersroom.",
    emoji: "\u{1F9C7}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "koek_cake",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "manouls-lozere",
    naam: "Manouls",
    frans: "Manouls lozeriens",
    omschrijving: "Traditionele rolletjes pens en kruiden, langzaam gegaard in bouillon.",
    emoji: "\u{1F372}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "soep_stoof",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "fricandeau-lozere",
    naam: "Fricandeau",
    frans: "Fricandeau des Cevennes",
    omschrijving: "Stevige bal van varkensgehakt en lever in crepine, koud gegeten als grove pate.",
    emoji: "\u{1F356}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "pelardon-lozere",
    naam: "Pelardon",
    frans: "Pelardon des Cevennes",
    omschrijving: "Klein rauwmelks geitenkaasje uit de Cevennen met frisse, aardse smaak.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "bleu-causses-lozere",
    naam: "Bleu des Causses",
    frans: "Bleu des Causses",
    omschrijving: "Blauwschimmelkaas van koemelk, gerijpt in kalkgrotten met krachtige smaak.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "farcous-cevenols",
    naam: "Farcous cevenols",
    frans: "Farcous des Cevennes",
    omschrijving: "Kruidige groentekoekjes van snijbiet en peterselie, warm of koud gegeten.",
    emoji: "\u{1F9C6}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "streetfood",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "retortillat-lozere",
    naam: "Retortillat",
    frans: "Retortillat de Lozère",
    omschrijving: "Aardappel- en ei-gerecht uit de bergen van Lozère, vergelijkbaar met een stevige tortilla.",
    emoji: "\u{1F373}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["lozere", "aubrac"]
  },
  {
    id: "potee-auvergnate",
    naam: "Potee auvergnate",
    frans: "Potee auvergnate",
    omschrijving: "Rustieke stoof met kool, aardappel en gezouten varkensvlees uit de Auvergne.",
    emoji: "\u{1F958}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "soep_stoof",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "chou-farci-auvergnat",
    naam: "Chou farci",
    frans: "Chou farci auvergnat",
    omschrijving: "Gevulde koolbladeren met gehakt, ui en kruiden, vaak gebakken in ovenschaal.",
    emoji: "\u{1F96C}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "lentilles-saint-flour",
    naam: "Linzen van Saint-Flour",
    frans: "Lentilles de Saint-Flour",
    omschrijving: "Lokale linzen die vaak lauw met vinaigrette, ui en kruiden worden gegeten.",
    emoji: "\u{1F96B}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "azinat-ariegeois",
    naam: "Azinat ariegeois",
    frans: "Azinat d'Ariège",
    omschrijving: "Stevige wintersoep met kool, aardappel en confit uit de valleien van Ariège.",
    emoji: "\u{1F963}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "soep_stoof",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "rouzolle-ariegeoise",
    naam: "Rouzolle",
    frans: "Rouzolle ariegeoise",
    omschrijving: "Dikke schijf van varkensgehakt, ham, kruiden en broodkruim die vaak in azinat wordt meegegaard.",
    emoji: "\u{1F969}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "mounjetado-ariegeoise",
    naam: "Mounjetado",
    frans: "Mounjetado ariegeoise",
    omschrijving: "Bonenstoof met eend of worst, verwant aan cassoulet in de Ariège.",
    emoji: "\u{1F35B}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "soep_stoof",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "porc-noir-bigorre",
    naam: "Porc Noir de Bigorre",
    frans: "Charcuterie de Porc Noir de Bigorre",
    omschrijving: "Donkere, aromatische charcuterie van het zwarte varken dat vaak op menus in de Ariège verschijnt.",
    emoji: "\u{1F356}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "bethmale-ariege",
    naam: "Bethmale",
    frans: "Fromage Bethmale",
    omschrijving: "Milde, licht nootachtige halfharde koemelkkaas uit de vallei van Bethmale.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "moulis-ariege",
    naam: "Moulis",
    frans: "Fromage de Moulis",
    omschrijving: "Populaire bergkaas uit de Ariège, verkrijgbaar van koe-, schaap- of geitenmelk.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "garbure-pyreneen",
    naam: "Garbure",
    frans: "Garbure pyreneenne",
    omschrijving: "Langzaam getrokken bergsoep met kool en bonen, in de Pyreneeen klassiek comfortfood.",
    emoji: "\u{1F372}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "soep_stoof",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "migas-ariegeoises",
    naam: "Migas",
    frans: "Migas ariegeoises",
    omschrijving: "Krokant opgebakken broodkruimels met knoflook en vaak spek of confit.",
    emoji: "\u{1F35E}",
    vegetarisch: false,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "estofinado-occitan",
    naam: "Estofinado",
    frans: "Estofinado rouergat",
    omschrijving: "Gedroogde kabeljauw met aardappel en ei, traditioneel in de bergstreken rond Aubrac.",
    emoji: "\u{1F41F}",
    vegetarisch: false,
    vis: true,
    smaak: "hartig",
    soort: "hoofdgerecht",
    streken: ["aubrac", "occitanie"]
  },
  {
    id: "plateau-cantal-salers-laguiole",
    naam: "Plateau Cantal Salers Laguiole",
    frans: "Plateau de fromages du Massif Central",
    omschrijving: "Kaasplank met Cantal, Salers en Laguiole, perfect als lunch of aperitief.",
    emoji: "\u{1F9C0}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "kaas",
    streken: ["cantal", "aubrac", "auvergne"]
  },
  {
    id: "pascade-auvergnate",
    naam: "Pascade",
    frans: "Pascade auvergnate",
    omschrijving: "Dikke ovenpannenkoek uit de Auvergne, vaak met kruiden of lokale kaas.",
    emoji: "\u{1F95E}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "streetfood",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "coupetade-lozere",
    naam: "Coupetade",
    frans: "Coupetade lozerienne",
    omschrijving: "Zoete broodpudding met rozijnen uit Lozère, vaak warm met een krokant korstje.",
    emoji: "\u{1F36E}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "dessert",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "flocons-ariege",
    naam: "Flocons d'Ariège",
    frans: "Flocons d'Ariège",
    omschrijving: "Kleine lekkernijen met knapperige meringue en een hart van romige hazelnootpraline.",
    emoji: "\u{1F36C}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "dessert",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "flaune-aubrac",
    naam: "Flaune",
    frans: "Flaune de l'Aubrac",
    omschrijving: "Taart met verse schapenkaas en subtiele citrus, populair rond Aubrac.",
    emoji: "\u{1F967}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "dessert",
    streken: ["aubrac", "lozere", "occitanie"]
  },
  {
    id: "croustade-pommes-ariege",
    naam: "Croustade aux pommes",
    frans: "Croustade aux pommes d'Ariège",
    omschrijving: "Flinterdunne laagjestaart met appel en boter, geliefd in Ariège.",
    emoji: "\u{1F34E}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "koek_cake",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "tourte-myrtilles-pyrenees",
    naam: "Tourte aux myrtilles",
    frans: "Tourte pyreneenne aux myrtilles",
    omschrijving: "Bosbessentaart uit de Pyreneeen, vaak met wilde myrtilles uit de bergen.",
    emoji: "\u{1FAD0}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "koek_cake",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "gateau-broche-pyrenees",
    naam: "Gateau a la broche",
    frans: "Gateau a la broche",
    omschrijving: "Feestcake die laag voor laag rond een spit wordt gebakken in Pyrenese dorpen.",
    emoji: "\u{1F370}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "koek_cake",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "millas-occitan",
    naam: "Millas",
    frans: "Millas occitan",
    omschrijving: "Maizengerecht tussen pudding en cake, vaak met vanille en citroen.",
    emoji: "\u{1F36E}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "dessert",
    streken: ["occitanie", "pyrenees_ariegeoises"]
  },
  {
    id: "pompe-huile-occitanie",
    naam: "Pompe a l'huile",
    frans: "Pompe a l'huile d'Occitanie",
    omschrijving: "Luchtig zoet brood met olijfolie en sinaasappelbloesem, populair in Zuid-Frankrijk.",
    emoji: "\u{1F35E}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "koek_cake",
    streken: ["occitanie", "lozere"]
  },
  {
    id: "fouace-aubrac",
    naam: "Fouace",
    frans: "Fouace de l'Aubrac",
    omschrijving: "Licht zoet briochebrood met oranjebloesem, vaak bij ontbijt of koffiepauze.",
    emoji: "\u{1F95E}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "koek_cake",
    streken: ["aubrac", "lozere", "occitanie"]
  },
  {
    id: "oreillettes-occitanes",
    naam: "Oreillettes",
    frans: "Oreillettes occitanes",
    omschrijving: "Dunne gefrituurde koekjes met suiker, vooral rond carnaval in Occitanie.",
    emoji: "\u{1F36A}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "koek_cake",
    streken: ["occitanie", "pyrenees_ariegeoises"]
  },
  {
    id: "gentiane-auvergne",
    naam: "Aperitif de gentiane",
    frans: "Gentiane d'Auvergne",
    omschrijving: "Bittere aperitiefdrank op gentiaanwortel, kenmerkend voor Cantal en Auvergne.",
    emoji: "\u{1F379}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "drank",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "salers-aperitif",
    naam: "Salers",
    frans: "Aperitif Salers",
    omschrijving: "Bekende bittere aperitiefdrank op basis van gele gentiaan uit de vulkaanstreken van Cantal.",
    emoji: "\u{1F379}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "drank",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "aveze-aperitif",
    naam: "Aveze",
    frans: "Aperitif Aveze",
    omschrijving: "Bittere gentiaanlikeur uit de Auvergne, vaak puur of in een mix als aperitief gedronken.",
    emoji: "\u{1F943}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "drank",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "biere-cantal",
    naam: "Biere artisanale du Cantal",
    frans: "Biere artisanale du Cantal",
    omschrijving: "Lokale bieren uit Cantal, soms gebrouwen met linzen of kastanje voor extra streekkarakter.",
    emoji: "\u{1F37A}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "drank",
    streken: ["cantal", "auvergne"]
  },
  {
    id: "castagnou-lozere",
    naam: "Castagnou",
    frans: "Castagnou des Cevennes",
    omschrijving: "Witte wijn met kastanjelikeur uit de Cevennen, lokaal als zachte aperitiefklassieker.",
    emoji: "\u{1F377}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "drank",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "biere-chataigne-lozere",
    naam: "Biere a la chataigne",
    frans: "Biere a la chataigne des Cevennes",
    omschrijving: "Ambachtelijk kastanjebier uit de Cevennen, met licht zoete en nootachtige tonen.",
    emoji: "\u{1F37A}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "drank",
    streken: ["lozere", "occitanie"]
  },
  {
    id: "genepi-pyrenees",
    naam: "Genepi",
    frans: "Génépi des Pyrénées",
    omschrijving: "Kruidige berglikeur op alpenkruiden, traditioneel als digestief.",
    emoji: "\u{1F943}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "drank",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "hypocras-ariege",
    naam: "Hypocras",
    frans: "Hypocras d'Ariège",
    omschrijving: "Gezoete, kruidige wijn met kaneel, gember en kardemom, nog steeds geliefd rond Tarascon.",
    emoji: "\u{1F377}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "drank",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "biere-ariegeoise",
    naam: "Bière artisanale d'Ariège",
    frans: "Bière artisanale ariégeoise",
    omschrijving: "Lokale craftbieren uit Ariège, vaak met bergwater en regionale mout.",
    emoji: "\u{1F37A}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "drank",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  },
  {
    id: "vin-marcillac-aubrac",
    naam: "Vin de Marcillac",
    frans: "Vin de Marcillac",
    omschrijving: "Rode wijn uit de streek ten zuiden van Aubrac, goede match met bergkeuken.",
    emoji: "\u{1F377}",
    vegetarisch: true,
    smaak: "hartig",
    soort: "drank",
    streken: ["aubrac", "occitanie"]
  },
  {
    id: "jus-myrtille-pyrenees",
    naam: "Jus de myrtille",
    frans: "Jus de myrtille pyreneen",
    omschrijving: "Zoete bosbessensap op basis van bergbessen uit de Pyreneeen.",
    emoji: "\u{1F9C3}",
    vegetarisch: true,
    smaak: "zoet",
    soort: "drank",
    streken: ["pyrenees_ariegeoises", "occitanie"]
  }
];

export const gerechtenStreekLocaties = {
  lozere: [
    { naam: "Mende", lat: 44.518, lon: 3.501 },
    { naam: "Florac", lat: 44.326, lon: 3.593 },
    { naam: "Sainte-Enimie", lat: 44.367, lon: 3.411 },
    { naam: "Marvejols", lat: 44.553, lon: 3.291 }
  ],
  cantal: [
    { naam: "Aurillac", lat: 44.926, lon: 2.441 },
    { naam: "Saint-Flour", lat: 45.034, lon: 3.093 },
    { naam: "Salers", lat: 45.137, lon: 2.492 },
    { naam: "Murat", lat: 45.109, lon: 2.867 }
  ],
  pyrenees_ariegeoises: [
    { naam: "Foix", lat: 42.965, lon: 1.607 },
    { naam: "Tarascon-sur-Ariège", lat: 42.845, lon: 1.606 },
    { naam: "Ax-les-Thermes", lat: 42.72, lon: 1.84 },
    { naam: "Saint-Girons", lat: 42.985, lon: 1.145 }
  ],
  aubrac: [
    { naam: "Laguiole", lat: 44.684, lon: 2.848 },
    { naam: "Nasbinals", lat: 44.658, lon: 3.034 },
    { naam: "Aumont-Aubrac", lat: 44.723, lon: 3.284 }
  ],
  auvergne: [
    { naam: "Aurillac", lat: 44.926, lon: 2.441 },
    { naam: "Saint-Flour", lat: 45.034, lon: 3.093 },
    { naam: "Clermont-Ferrand", lat: 45.777, lon: 3.087 }
  ],
  occitanie: [
    { naam: "Mende", lat: 44.518, lon: 3.501 },
    { naam: "Foix", lat: 42.965, lon: 1.607 },
    { naam: "Rodez", lat: 44.351, lon: 2.576 }
  ]
};

export const gerechtenDieetLabels = {
  alle: { label: "Alle", emoji: "\u{1F37D}\uFE0F" },
  vegetarisch: { label: "Vegetarisch", emoji: "\u{1F331}" },
  non_vegetarisch: { label: "Non-veg", emoji: "\u{1F356}" }
};

export const gerechtenSmaakLabels = {
  alle: { label: "Alle", emoji: "\u{1F50D}" },
  hartig: { label: "Hartig", emoji: "\u{1F9C2}" },
  zoet: { label: "Zoet", emoji: "\u{1F370}" }
};

export const gerechtenSoortLabels = {
  alle: { label: "Alle", emoji: "\u{1F9FA}" },
  hoofdgerecht: { label: "Hoofdgerecht", emoji: "\u{1F372}" },
  soep_stoof: { label: "Soep & stoof", emoji: "\u{1F963}" },
  streetfood: { label: "Streetfood", emoji: "\u{1F96A}" },
  kaas: { label: "Kaas", emoji: "\u{1F9C0}" },
  drank: { label: "Drankjes", emoji: "\u{1F379}" },
  dessert: { label: "Desserts", emoji: "\u{1F36E}" },
  koek_cake: { label: "Koek & cake", emoji: "\u{1F36A}" }
};

export const gerechtenStreekLabels = {
  alle: { label: "Alle", emoji: "\u{1F5FA}\uFE0F" },
  lozere: { label: "Lozère", emoji: "\u{1F3DE}\uFE0F" },
  cantal: { label: "Cantal", emoji: "\u{1F30B}" },
  pyrenees_ariegeoises: { label: "Pyrénées Ariégeoises", emoji: "\u{26F0}\uFE0F" },
  aubrac: { label: "Aubrac", emoji: "\u{1F332}" },
  auvergne: { label: "Auvergne", emoji: "\u{1F3DE}\uFE0F" },
  occitanie: { label: "Occitanie", emoji: "\u{1F31E}" }
};
