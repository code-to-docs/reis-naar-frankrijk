import type { WildlifeProfile } from "./types.js";

const defaultProfile: WildlifeProfile = {
  feitje: "Deze soort is sterk aangepast aan ruig terrein en laat zich meestal pas zien als je goed vertraagt en rustig kijkt.",
  gewicht: "Sterk afhankelijk van leeftijd en seizoen",
  lengte: "Formaat verschilt per individu",
  leeftijd: "Meestal meerdere jaren in het wild",
  voeding: "Afhankelijk van leefgebied en seizoen",
  actief: "Vooral actief in de gunstigste uren van de dag"
};

export const wildlifeProfiles: Record<string, WildlifeProfile> = {
  "vale-gier": {
    feitje: "Vale gieren besparen energie door bijna volledig op thermiek te zweven en kunnen zo enorme afstanden afleggen zonder veel te klappen.",
    gewicht: "6-11 kg",
    lengte: "95-110 cm, spanwijdte 2,3-2,8 m",
    leeftijd: "30-40 jaar",
    voeding: "Aas en kadavers",
    actief: "Overdag, vooral vanaf late ochtend"
  },
  "lammergier": {
    feitje: "De lammergier staat bekend als botteneter en laat grote botten op rotsen vallen om bij het voedzame merg te komen.",
    gewicht: "4,5-7 kg",
    lengte: "95-125 cm, spanwijdte 2,3-2,8 m",
    leeftijd: "30-40 jaar",
    voeding: "Botten, aas en resten van karkassen",
    actief: "Overdag langs rotswanden en bergkammen"
  },
  "monniksgier": {
    feitje: "De monniksgier is een van de zwaarste roofvogels van Europa en oogt in de lucht opvallend rechthoekig en massief.",
    gewicht: "7-12 kg",
    lengte: "100-120 cm, spanwijdte 2,5-3,1 m",
    leeftijd: "30-40 jaar",
    voeding: "Aas en grote karkassen",
    actief: "Overdag, vaak in warme middaguurtjes"
  },
  "aasgier": {
    feitje: "Aasgieren gebruiken soms stenen als gereedschap om eieren kapot te slaan, iets wat je maar bij weinig vogels ziet.",
    gewicht: "1,6-2,4 kg",
    lengte: "55-70 cm, spanwijdte 1,55-1,7 m",
    leeftijd: "20-25 jaar",
    voeding: "Aas, eieren, insecten en kleine resten",
    actief: "Overdag in warm, open terrein"
  },
  "rode-wouw": {
    feitje: "De diep gevorkte staart van de rode wouw werkt als een roer en maakt hem uitzonderlijk wendbaar in de lucht.",
    gewicht: "0,8-1,3 kg",
    lengte: "60-72 cm, spanwijdte 1,75-1,95 m",
    leeftijd: "20-25 jaar",
    voeding: "Kleine dieren, aas en afvalresten",
    actief: "Overdag, vaak urenlang zichtbaar"
  },
  "steenarend": {
    feitje: "Steenarenden kunnen in duikvlucht enorme snelheden halen en gebruiken hoogteverschil slim om prooi te verrassen.",
    gewicht: "3-6,5 kg",
    lengte: "75-95 cm, spanwijdte 1,9-2,3 m",
    leeftijd: "25-35 jaar",
    voeding: "Zoogdieren, vogels en aas",
    actief: "Overdag in open bergland"
  },
  "slangenarend": {
    feitje: "De slangenarend is gespecialiseerd in reptielen en kan langdurig stil bidden boven een helling terwijl hij naar slangen speurt.",
    gewicht: "1,2-2,3 kg",
    lengte: "62-70 cm, spanwijdte 1,6-1,9 m",
    leeftijd: "15-20 jaar",
    voeding: "Vooral slangen en andere reptielen",
    actief: "Overdag in zonnige, droge uren"
  },
  "blauwe-kiekendief": {
    feitje: "Blauwe kiekendieven vliegen heel laag en rustig zigzaggend over het landschap, waardoor ze meer lijken te glijden dan te jagen.",
    gewicht: "0,3-0,6 kg",
    lengte: "43-52 cm, spanwijdte 97-122 cm",
    leeftijd: "10-16 jaar",
    voeding: "Muizen, kleine vogels en jonge dieren",
    actief: "Vooral ochtend en avond"
  },
  "oehoe": {
    feitje: "De oehoe is krachtig genoeg om stekelige prooien zoals egels te grijpen en te openen.",
    gewicht: "2-4 kg",
    lengte: "58-75 cm, spanwijdte 1,4-1,8 m",
    leeftijd: "20-25 jaar",
    voeding: "Konijnen, knaagdieren, vogels en egels",
    actief: "Schemer en nacht"
  },
  alpenkraai: {
    feitje: "Alpenkraaien zijn echte luchtacrobaten en gebruiken harde windvlagen soms bijna als speeltoestel.",
    gewicht: "0,25-0,4 kg",
    lengte: "37-41 cm, spanwijdte 73-90 cm",
    leeftijd: "15-20 jaar",
    voeding: "Insecten, zaden en bessen",
    actief: "Overdag, vooral op bergweides"
  },
  fluiter: {
    feitje: "De fluiter verraadt zich vaker met zijn trillende zang dan met zijn uiterlijk, omdat hij hoog in het bladerdak blijft.",
    gewicht: "9-14 g",
    lengte: "11-13 cm, spanwijdte 19-24 cm",
    leeftijd: "5-8 jaar",
    voeding: "Insecten en rupsen",
    actief: "Overdag in bosranden en loofbos"
  },
  sneeuwvink: {
    feitje: "Sneeuwvinken leven zo hoog in de bergen dat ze vaak juist rond berghutten of skiliften het makkelijkst te zien zijn.",
    gewicht: "30-50 g",
    lengte: "16,5-19 cm, spanwijdte 32-38 cm",
    leeftijd: "5-8 jaar",
    voeding: "Zaden en insecten",
    actief: "Overdag in alpien terrein"
  },
  sneeuwhoen: {
    feitje: "De dicht bevederde poten van het sneeuwhoen werken als mini-sneeuwschoenen op koud en stenig bergterrein.",
    gewicht: "0,4-0,7 kg",
    lengte: "34-36 cm, spanwijdte 54-60 cm",
    leeftijd: "5-7 jaar",
    voeding: "Knoppen, bladeren, zaden en insecten",
    actief: "Vooral overdag en in koele uren"
  },
  "middelste-bonte-specht": {
    feitje: "Deze specht is sterk afhankelijk van oud bos met dood hout en is daardoor een goede graadmeter voor boskwaliteit.",
    gewicht: "100-140 g",
    lengte: "24-26 cm, spanwijdte 38-42 cm",
    leeftijd: "8-12 jaar",
    voeding: "Larven, insecten en kevers uit dood hout",
    actief: "Overdag op rustige boomstammen"
  },
  marmot: {
    feitje: "Een marmotkolonie waarschuwt elkaar met een luid fluitsignaal dat kilometers ver over een helling kan dragen.",
    gewicht: "3-7 kg",
    lengte: "45-58 cm, staart 13-20 cm",
    leeftijd: "12-15 jaar",
    voeding: "Grassen, kruiden, wortels en bloemen",
    actief: "Overdag, vaak in zon en nabij holen"
  },
  gems: {
    feitje: "Gemsen kunnen met verbluffend vertrouwen over bijna verticale rotsplaten lopen waar mensen nauwelijks zouden durven staan.",
    gewicht: "25-45 kg",
    lengte: "110-130 cm",
    leeftijd: "15-20 jaar",
    voeding: "Grassen, kruiden en jonge scheuten",
    actief: "Vooral ochtend en avond"
  },
  isard: {
    feitje: "De isard is de Pyrenese tegenhanger van de gems en oogt meestal wat slanker en pittiger in steil terrein.",
    gewicht: "20-35 kg",
    lengte: "100-120 cm",
    leeftijd: "15-20 jaar",
    voeding: "Berggrassen, kruiden en struiken",
    actief: "Vooral ochtend en avond"
  },
  moeflon: {
    feitje: "Bij rammen van de moeflon laten de groeiringen in de hoorns grofweg zien hoe oud een dier is.",
    gewicht: "25-55 kg",
    lengte: "110-140 cm",
    leeftijd: "12-18 jaar",
    voeding: "Grassen, bladeren en kruiden",
    actief: "Schemer, ochtend en avond"
  },
  edelhert: {
    feitje: "In de bronst dragen de burlen van edelherten ver over valleien, waardoor je ze vaak eerder hoort dan ziet.",
    gewicht: "90-240 kg",
    lengte: "1,6-2,5 m",
    leeftijd: "15-18 jaar",
    voeding: "Grassen, bladeren, bast en scheuten",
    actief: "Vooral schemer en nacht"
  },
  "europese-genet": {
    feitje: "De Europese genet is een behendige klimmer die net zo makkelijk door bomen beweegt als langs stenen muren sluipt.",
    gewicht: "1,5-3 kg",
    lengte: "43-55 cm, staart 35-50 cm",
    leeftijd: "10-13 jaar",
    voeding: "Muizen, vogels, insecten en kleine reptielen",
    actief: "Vooral nachtelijk"
  },
  "bruine-beer": {
    feitje: "De schouderbult van een bruine beer bestaat vooral uit spiermassa die helpt bij graven, keren en loswrikken.",
    gewicht: "80-250 kg",
    lengte: "1,7-2,2 m",
    leeftijd: "20-30 jaar",
    voeding: "Bessen, planten, aas, insecten en zo nu en dan grotere prooi",
    actief: "Vooral schemer en nacht"
  },
  desman: {
    feitje: "De Pyrenese desman gebruikt zijn gevoelige snuit als een tastorgaan om in snel stromend water prooi op te sporen.",
    gewicht: "50-80 g",
    lengte: "11-16 cm, staart 12-16 cm",
    leeftijd: "3-4 jaar",
    voeding: "Waterinsecten, larven en kleine ongewervelden",
    actief: "Vooral nachtelijk en langs koude beken"
  },
  hermelijn: {
    feitje: "De zwarte punt aan de staart van de hermelijn trekt soms de aandacht van roofdieren weg van de rest van het lichaam.",
    gewicht: "150-350 g",
    lengte: "22-32 cm, staart 8-12 cm",
    leeftijd: "5-8 jaar",
    voeding: "Muizen, woelmuizen, vogels en eieren",
    actief: "Schemer, nacht en koele daguren"
  },
  "europese-bever": {
    feitje: "Een bever slaat met zijn platte staart hard op het water als alarmsignaal voor andere bevers in de buurt.",
    gewicht: "18-30 kg",
    lengte: "80-110 cm",
    leeftijd: "10-15 jaar",
    voeding: "Bast, twijgen, waterplanten en bladeren",
    actief: "Schemer en nacht"
  },
  "europese-nerts": {
    feitje: "De volledig witte boven- en onderlip maken de Europese nerts in het veld subtiel maar wel goed onderscheidbaar.",
    gewicht: "0,5-0,9 kg",
    lengte: "50-70 cm inclusief staart",
    leeftijd: "6-8 jaar",
    voeding: "Vissen, amfibieen, kreeftjes en kleine zoogdieren",
    actief: "Vooral schemer en nacht"
  },
  przewalskipaard: {
    feitje: "Het Przewalskipaard geldt als het meest oorspronkelijke nog levende wilde paard en heeft een rechtopstaande manenkam.",
    gewicht: "250-350 kg",
    lengte: "2,1-2,6 m",
    leeftijd: "20-25 jaar",
    voeding: "Grassen, kruiden en steppeplanten",
    actief: "Vooral ochtend en avond"
  },
  vuursalamander: {
    feitje: "Het gele vlekkenpatroon van een vuursalamander is voor elk dier net iets anders en werkt als een waarschuwingssignaal.",
    gewicht: "20-40 g",
    lengte: "15-25 cm",
    leeftijd: "15-20 jaar",
    voeding: "Naaktslakken, wormen, spinnen en insecten",
    actief: "Vooral in vochtige nachten en na regen"
  },
  alpenwatersalamander: {
    feitje: "In het voortplantingsseizoen kleurt het mannetje opvallend blauw en oranje, veel intenser dan de rest van het jaar.",
    gewicht: "2-6 g",
    lengte: "8-12 cm",
    leeftijd: "5-10 jaar",
    voeding: "Kleine waterdieren, larven en insecten",
    actief: "Schemer en natte voorjaarsperioden"
  },
  muurhagedis: {
    feitje: "Een muurhagedis kan zijn staart loslaten om een aanvaller af te leiden en groeit daarna geleidelijk een nieuwe staart aan.",
    gewicht: "4-8 g",
    lengte: "15-20 cm inclusief staart",
    leeftijd: "4-8 jaar",
    voeding: "Insecten, spinnen en kleine larven",
    actief: "Zonnige daguren op warme stenen"
  },
  apollovlinder: {
    feitje: "De rode oogvlekken op de vleugels van de apollovlinder werken als schriktekening voor vogels en andere predatoren.",
    gewicht: "0,3-0,7 g",
    lengte: "Spanwijdte 6,5-9 cm",
    leeftijd: "Volwassen dier 2-4 weken",
    voeding: "Nectar, als rups vooral vetplanten zoals hemelsleutel",
    actief: "Zonnige, warme daguren"
  },
  "europese-wolfspin": {
    feitje: "Het vrouwtje van de Europese wolfspin draagt eerst haar eicocon en later zelfs de jonge spinnetjes op haar lijf mee.",
    gewicht: "2-5 g",
    lengte: "Lichaam 2-3 cm, span tot circa 6-7 cm",
    leeftijd: "2-3 jaar",
    voeding: "Insecten en andere kleine geleedpotigen",
    actief: "Schemer en nacht op warme bodem"
  },
  "pyrenese-steenbok": {
    feitje: "Pyrenese steenbokken gebruiken hun zwaar gekromde hoorns niet alleen bij gevechten, maar ook om indruk te maken op afstand.",
    gewicht: "35-100 kg",
    lengte: "1,1-1,5 m",
    leeftijd: "15-20 jaar",
    voeding: "Grassen, kruiden, struiken en scheuten",
    actief: "Vooral ochtend en avond"
  }
};

export function getWildlifeProfile(id: string): WildlifeProfile {
  return wildlifeProfiles[id] || defaultProfile;
}
