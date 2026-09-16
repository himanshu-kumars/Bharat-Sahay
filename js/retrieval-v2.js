"use strict";
/* ============================================================
   retrieval-v2.js — widens the BM25 index over the new corpus
   · indexes tags, state, authority and FAQ text
   · adds multilingual synonyms for the new domains
     (solar, loans, pension, ration, disability, insurance…)
   ============================================================ */

/* extra synonym groups merged into the existing lexicon */
[
  ["solar","rooftop","electricity","bijli","power","सौर","बिजली","छत","ਸੂਰਜੀ","ਬਿਜਲੀ","ਛੱਤ","suryaghar","surya","panel"],
  ["loan","credit","finance","mudra","udhaar","कर्ज","ऋण","लोन","ਕਰਜ਼ਾ","ਲੋਨ","karz","rin","byaj","interest"],
  ["pension","retirement","old age","बुढ़ापा","पेंशन","वृद्धावस्था","ਪੈਨਸ਼ਨ","ਬੁਢਾਪਾ","budhapa","pensan"],
  ["ration","food","grain","anna","राशन","अनाज","खाना","भोजन","ਰਾਸ਼ਨ","ਅਨਾਜ","ਭੋਜਨ","chawal","gehu","rice","wheat"],
  ["disability","divyang","handicap","विकलांग","दिव्यांग","अपंग","ਅਪੰਗ","ਦਿਵਿਆਂਗ","udid","viklang","wheelchair"],
  ["insurance","bima","cover","policy","बीमा","सुरक्षा","ਬੀਮਾ","ਸੁਰੱਖਿਆ","suraksha","jeevan","claim"],
  ["business","enterprise","startup","shop","udyam","व्यापार","व्यवसाय","दुकान","ਕਾਰੋਬਾਰ","ਦੁਕਾਨ","vyapar","dukan","msme"],
  ["widow","vidhwa","विधवा","ਵਿਧਵਾ","vidhva"],
  ["marriage","shagun","wedding","शादी","विवाह","शगुन","ਵਿਆਹ","ਸ਼ਗਨ","shaadi","vivah"],
  ["water","tap","toilet","sanitation","पानी","नल","शौचालय","ਪਾਣੀ","ਟੂਟੀ","ਪਖਾਨਾ","paani","nal","jal"],
  ["job","employment","work","rozgar","नौकरी","रोजगार","काम","ਨੌਕਰੀ","ਰੁਜ਼ਗਾਰ","ਕੰਮ","naukri","kaam","internship","apprentice"],
  ["girl","daughter","beti","लड़की","बेटी","कन्या","ਕੁੜੀ","ਧੀ","ladki","beti","kanya"],
  ["senior","elderly","old","बुजुर्ग","वरिष्ठ","ਬਜ਼ੁਰਗ","buzurg","varishth"],
  ["minority","muslim","christian","sikh","अल्पसंख्यक","ਘੱਟ ਗਿਣਤੀ","alpsankhyak"],
].forEach(g => {
  SYN_GROUPS.push(g);
  for (const w of g){
    if (typeof w !== "string") continue;
    SYN_MAP[w] = SYN_MAP[w] || new Set();
    for (const x of g) if (typeof x === "string" && x !== w) SYN_MAP[w].add(x);
  }
});

/* rebuild the index with the wider field set */
const _build = Retrieval.build.bind(Retrieval);
Retrieval.build = function(){
  if (this._built) return;
  _build();
  // enrich each document bag with fields the original indexer skipped
  this.docs.forEach(d => {
    const s = d.s;
    const add = (txt, wt) => {
      for (const tk of this.tokenize(txt)) { d.bag[tk] = (d.bag[tk] || 0) + wt; d.len += wt; }
    };
    add((s.tags || []).join(" "), 2.2);
    add(s.authority, 1.1);
    if (s.state) add(s.state + " state", 2.4);
    add(s.level === "state" ? "state scheme rajya" : "central scheme kendra", .9);
    (s.faqs || []).forEach(f => add(f.q + " " + f.a, .9));
    (s.benefits || []).forEach(b => add(String(b.amount), 1.0));
  });
  // recompute document frequencies and average length over the new bags
  this.df = Object.create(null);
  for (const d of this.docs) for (const tk of Object.keys(d.bag)) this.df[tk] = (this.df[tk] || 0) + 1;
  this.avg = this.docs.reduce((a, d) => a + d.len, 0) / (this.docs.length || 1);
};
