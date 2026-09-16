"use strict";
/* ---------- brain.js (demo answer engine — retrieval-grounded, deterministic, multilingual) ---------- */
const Brain = {
  detectScript(q){
    if (/[\u0A00-\u0A7F]/.test(q)) return "pa";
    if (/[\u0900-\u097F]/.test(q)) return "hi";
    return null;
  },
  statusLine(lang){
    return {
      en:"Based on the information provided — not a guarantee of eligibility.",
      hi:"दी गई जानकारी के आधार पर — यह पात्रता की गारंटी नहीं है।",
      pa:"ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਦੇ ਅਧਾਰ ਉੱਤੇ — ਇਹ ਯੋਗਤਾ ਦੀ ਗਾਰੰਟੀ ਨਹੀਂ ਹੈ।",
    }[lang] || lang;
  },
  respond(q, lang, profile){
    Retrieval.build();
    const t = q.toLowerCase();
    const has = (...w) => w.some(x => t.includes(x));
    const rank = Eligibility.rank(profile || {});
    const bySlug = new Map(rank.map(m => [m.scheme.slug, m]));
    const hits = Retrieval.search(q, 4);
    const good = l => l.filter(Boolean).filter(m => m.status.key !== "NOT_MATCHED");
    const top = (hits.length ? bySlug.get(hits[0].scheme.slug) : null) || good(rank)[0] || rank[0];

    // Answer language: explicit translate request > script detected in the question > site language.
    let replyLang = this.detectScript(q) || lang;
    if (has("translate", "अनुवाद", "ਅਨੁਵਾਦ"))
      replyLang = has("punjabi", "panjabi", "ਪੰਜਾਬੀ") ? "pa"
        : has("hindi", "हिन्दी", "हिंदी") ? "hi"
        : has("english", "angreji") ? "en"
        : (lang === "pa" ? "hi" : "pa");
    const T = (en, hi, pa) => replyLang === "hi" ? hi : replyLang === "pa" ? pa : en;

    const out = { answer:"", answerLang:replyLang, schemes:[], sources:[], suggested:[], docs:null, note:this.statusLine(replyLang), q, rag:null };
    const addSources = l => { out.sources = [...new Map(l.flatMap(m => m.scheme.sources.map(s => [s.url, s]))).values()].slice(0, 3); };
    const finish = () => {
      out.rag = {
        tokens: Retrieval.tokenize(q, true).slice(0, 16),
        chunks: hits.slice(0, 4).map(h => ({ name:h.scheme.name, score:h.score, fields:h.fields.map(f => ({ label:f.label, txt:Utils.truncate(f.txt, 160) })) })),
      };
      return out;
    };

    // 1) document checklist
    if (has("document", "paper", "required", "क्या चाहिए", "दस्तावे", "ਕਾਗਜ਼", "ਦਸਤਾਵੇਜ਼", "ਚਾਹੀਦੇ")){
      out.answer = T(
        `For “${top.scheme.name}”, you will typically need these documents:`,
        `«${top.scheme.name}» के लिए आमतौर पर ये दस्तावेज़ चाहिए:`,
        `«${top.scheme.name}» ਲਈ ਆਮ ਤੌਰ ਉੱਤੇ ਇਹ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ:`);
      out.docs = top.scheme.documents;
      addSources([top]);
      out.suggested = T(
        ["How do I apply?", "Which schemes might I qualify for?", "Translate this into Punjabi"],
        ["आवेदन कैसे करूँ?", "मैं किसके लिए पात्र हो सकता हूँ?", "ਇਸ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ"],
        ["ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਵਾਂ?", "ਮੈਂ ਕਿਸ ਲਈ ਯੋਗ ਹੋ ਸਕਦਾ ਹਾਂ?", "इसे हिन्दी में दीजिए"]);
      return finish();
    }

    // 2) how to apply
    if (has("apply", "application", "process", "form", "आवेदन", "प्रक्रिया", "ਫਾਰਮ", "ਅਰਜ਼ੀ", "ਪ੍ਰਕਿਰਿਆ")){
      out.answer = T(
        `Here is the application route for “${top.scheme.name}”, straight from the official process:`,
        `«${top.scheme.name}» के लिए आवेदन की प्रक्रिया — आधिकारिक पोर्टल के अनुसार:`,
        `«${top.scheme.name}» ਲਈ ਅਰਜ਼ੀ ਦੀ ਪ੍ਰਕਿਰਿਆ — ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਅਨੁਸਾਰ:`);
      out.schemes = [top];
      out.applySteps = top.scheme.apply;
      addSources([top]);
      out.suggested = T(
        ["What documents do I need?", "Explain this scheme simply", "Translate this into Hindi"],
        ["क्या दस्तावेज़ चाहिए?", "इस योजना को सरल भाषा में समझाइए", "ਇਸ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ"],
        ["ਕੀ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ?", "ਇਸ ਸਕੀਮ ਨੂੰ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ", "इसे हिन्दी में दीजिए"]);
      return finish();
    }

    // 3) explain simply
    if (has("explain", "simplify", "simply", "simple", "plain", "सरल", "आसान", "समझ", "ਸੌਖਾ", "ਸਮਝਾ")){
      out.answer = T(
        `In plain words: “${top.scheme.name}” — ${top.scheme.summary.toLowerCase()} Everything below traces back to the official source.`,
        `आसान भाषा में: «${top.scheme.name}» — ${top.scheme.summary} पूरी जानकारी नीचे दिए आधिकारिक स्रोत से जाँची जा सकती है।`,
        `ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ: «${top.scheme.name}» — ${top.scheme.summary} ਹਰ ਗੱਲ ਹੇਠਾਂ ਦਿੱਤੇ ਸਰਕਾਰੀ ਸਰੋਤ ਤੋਂ ਜਾਂਚੀ ਜਾ ਸਕਦੀ ਹੈ।`);
      out.schemes = [top];
      addSources([top]);
      out.suggested = T(
        ["What documents do I need?", "How do I apply?", "Show me more schemes"],
        ["क्या दस्तावेज़ चाहिए?", "आवेदन कैसे करूँ?", "और योजनाएँ दिखाइए"],
        ["ਕੀ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ?", "ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਵਾਂ?", "ਹੋਰ ਸਕੀਮਾਂ ਦਿਖਾਓ"]);
      return finish();
    }

    // 4) retrieval found scheme passages → the core RAG path
    if (hits.length){
      const picked = good(hits.slice(0, 3).map(h => bySlug.get(h.scheme.slug)));
      const list = picked.length ? picked : hits.slice(0, 3).map(h => bySlug.get(h.scheme.slug));
      out.answer = (profile && (profile.age || profile.state))
        ? T(
          `I searched the scheme knowledge base for your question and matched it against your profile (${profile.age ? profile.age + " yrs" : ""}${profile.state ? ", " + profile.state : ""}). These ${list.length} came up closest — each shows why it matched and its official source.`,
          `मैंने योजना-ज्ञानकोश में आपके सवाल को खोजा और आपकी प्रोफ़ाइल (${profile.age ? profile.age + " वर्ष" : ""}${profile.state ? ", " + profile.state : ""}) से मिलाया। ये ${list.length} सबसे निकट लगी — हर एक के साथ कारण और आधिकारिक स्रोत है।`,
          `ਮੈਂ ਸਕੀਮ-ਜਾਣਕਾਰੀ-ਅੱਧਾਰ ਵਿੱਚ ਤੁਹਾਡੇ ਸਵਾਲ ਲਈ ਖੋਜ ਕੀਤੀ ਅਤੇ ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ (${profile.age ? profile.age + " ਸਾਲ" : ""}${profile.state ? ", " + profile.state : ""}) ਨਾਲ ਮਿਲਾਈ। ਇਹ ${list.length} ਸਭ ਤੋਂ ਨੇੜੇ ਰਹੀਆਂ — ਹਰੇਕ ਨਾਲ ਕਾਰਨ ਅਤੇ ਸਰਕਾਰੀ ਸਰੋਤ ਹੈ।`)
        : T(
          `I searched the scheme knowledge base for your question — these ${list.length} matched most closely. Add a short profile and I can tell you which ones you may actually qualify for.`,
          `मैंने योजना-ज्ञानकोश में खोजा — ये ${list.length} आपके सवाल से सबसे ज़्यादा मेल खाती हैं। छोटी सी प्रोफ़ाइल जोड़ें, तो बता पाऊँगा कि आप किनके लिए पात्र हो सकते हैं।`,
          `ਮੈਂ ਜਾਣਕਾਰੀ-ਅੱਧਾਰ ਵਿੱਚ ਖੋਜ ਕੀਤੀ — ਇਹ ${list.length} ਤੁਹਾਡੇ ਸਵਾਲ ਨਾਲ ਸਭ ਤੋਂ ਵੱਧ ਮੇਲ ਖਾਂਦੀਆਂ ਹਨ। ਥੋੜ੍ਹੀ ਪ੍ਰੋਫ਼ਾਈਲ ਜੋੜੋ, ਤਾਂ ਦੱਸ ਸਕਾਂਗਾ ਕਿ ਤੁਸੀਂ ਕਿਸ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ।`);
      out.schemes = list;
      addSources(list);
      out.suggested = T(
        ["What documents do I need?", "How do I apply?", "Translate this into Punjabi", "Check my eligibility"],
        ["क्या दस्तावेज़ चाहिए?", "आवेदन कैसे करूँ?", "ਇਸ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ", "मेरी पात्रता जाँचें"],
        ["ਕੀ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ?", "ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਵਾਂ?", "इसे हिन्दी में दीजिए", "ਮੇਰੀ ਯੋਗਤਾ ਜਾਂਚੋ"]);
      return finish();
    }

    // 5) broad eligibility intent
    if (has("eligible", "qualify", "scheme", "yojan", "योजना", "ਸਕੀਮ", "ਯੋਗ", "पात्र", "सरकार", "ਸਰਕਾਰੀ")){
      const picks = good(rank).slice(0, 3);
      out.schemes = picks;
      addSources(picks);
      out.answer = (profile && (profile.age || profile.state))
        ? T(
          `Based on your profile (${profile.age ? profile.age + " yrs" : ""}${profile.state ? ", " + profile.state : ""}), these ${picks.length || 3} opportunities look most relevant. I have added why each one matched and its official source.`,
          `आपकी प्रोफ़ाइल (${profile.age ? profile.age + " वर्ष" : ""}${profile.state ? ", " + profile.state : ""}) के अनुसार ये ${picks.length || 3} अवसर सबसे प्रासंगिक लगते हैं। हर एक के साथ मेल का कारण और आधिकारिक स्रोत जोड़ा है।`,
          `ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ (${profile.age ? profile.age + " ਸਾਲ" : ""}${profile.state ? ", " + profile.state : ""}) ਅਨੁਸਾਰ ਇਹ ${picks.length || 3} ਮੌਕੇ ਸਭ ਤੋਂ ਢੁੱਕਵੇਂ ਹਨ। ਹਰੇਕ ਨਾਲ ਕਾਰਨ ਅਤੇ ਸਰਕਾਰੀ ਸਰੋਤ ਹੈ।`)
        : T(
          `Here are the most broadly relevant schemes in this demo knowledge base. Add a two-minute profile and the rule engine can explain exactly which ones you may qualify for.`,
          `डेमो ज्ञानकोश में सबसे प्रासंगिक योजनाएँ नीचे हैं। दो मिनट की प्रोफ़ाइल जोड़ें — नियम इंजन बता देगा कि आप किनके लिए पात्र हो सकते हैं।`,
          `ਡੈਮੋ ਜਾਣਕਾਰੀ-ਅੱਧਾਰ ਵਿੱਚ ਸਭ ਤੋਂ ਢੁੱਕਵੀਆਂ ਸਕੀਮਾਂ ਹੇਠਾਂ ਹਨ। ਦੋ ਮਿੰਟ ਦੀ ਪ੍ਰੋਫ਼ਾਈਲ ਜੋੜੋ — ਨਿਯਮ ਇੰਜਣ ਦੱਸ ਦੇਵੇਗਾ ਕਿ ਤੁਸੀਂ ਕਿਸ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ।`);
      out.suggested = T(
        ["What documents do I need?", "Explain this scheme simply", "Translate this into Hindi"],
        ["क्या दस्तावेज़ चाहिए?", "इस योजना को सरल भाषा में समझाइए", "ਇਸ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ"],
        ["ਕੀ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ?", "ਇਸ ਸਕੀਮ ਨੂੰ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ", "इसे हिन्दी में दीजिए"]);
      return finish();
    }

    // 6) greeting
    if (t.length < 25 && /^\s*(hi+|hello|hey|hii|namaste|salaam|ਸਤ ਸ੍ਰੀ|ਨਮਸਤੇ|ਹੈਲੋ)/.test(t)){
      out.answer = T(
        "Namaste! I am Bharat Sahay. Ask me about scholarships, housing, health cover, farmer support — in English, हिन्दी or ਪੰਜਾਬੀ. I answer from official sources and show you how each result matched.",
        "नमस्ते! मैं भारत सहाय हूँ। छात्रवृत्ति, आवास, स्वास्थ्य बीमा, किसान सहायता के बारे में पूछिए — हिन्दी, ਪੰਜਾਬੀ या English में। मैं आधिकारिक स्रोतों से जवाब देता हूँ।",
        "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਭਾਰਤ ਸਹਾਏ ਹਾਂ। ਸਕਾਲਰਸ਼ਿਪ, ਆਵਾਸ, ਸਿਹਤ ਬੀਮਾ, ਕਿਸਾਨ ਮਦਦ ਬਾਰੇ ਪੁੱਛੋ — English, ਹਿੰਦੀ ਜਾਂ ਪੰਜਾਬੀ ਵਿੱਚ। ਮੈਂ ਸਰਕਾਰੀ ਸਰੋਤਾਂ ਤੋਂ ਜਵਾਬ ਦਿੰਦਾ ਹਾਂ।");
      out.suggested = T(
        ["What scholarships are available for students?", "ਕिसान कौन सी योजनाएँ ले सकते हैं?", "What support exists for farmers?"],
        ["विद्यार्थियों के लिए कौन सी छात्रਵृत्तियाँ हैं?", "ਕਿਸਾਨਾਂ ਲਈ ਕੀ ਯੋਜਨਾਵਾਂ ਹਨ?", "What support exists for farmers?"],
        ["ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਕਿਹੜੀਆਂ ਸਕਾਲਰਸ਼ਿਪਾਂ ਹਨ?", "ਕਿਸਾਨਾਂ ਲਈ ਕੀ ਯੋਜਨਾਵਾਂ ਹਨ?", "What support exists for farmers?"]);
      return finish();
    }

    // 7) no retrieval match — helpful fallback
    out.answer = T(
      "I could not match your wording to the demo knowledge base yet. Ask about education, health, housing, farmers, employment, pensions or money — or set up a profile and say “check my eligibility”. You can also tap the mic and speak in any of these languages.",
      "फ़िलहाल मैं आपके शब्दों को डेमो ज्ञानकोश से नहीं जोड़ पाया। पढ़ाई, स्वास्थ्य, आवास, किसान, रोज़गार, पेंशन या पैसों के बारे में पूछिए — या प्रोफ़ाइल बनाकर कहिए “मेरी पात्रता जाँचें”। माइक दबाकर हिन्दी/ਪੰਜਾਬੀ में भी बोल सकते हैं।",
      "ਫ਼ਿਲਹਾਲ ਮੈਂ ਤੁਹਾਡੇ ਸ਼ਬਦ ਡੈਮੋ ਜਾਣਕਾਰੀ-ਅੱਧਾਰ ਨਾਲ ਨਹੀਂ ਜੋੜ ਪਾਇਆ। ਪੜ੍ਹਾਈ, ਸਿਹਤ, ਆਵਾਸ, ਕਿਸਾਨ, ਰੁਜ਼ਗਾਰ, ਪੈਨਸ਼ਨ ਜਾਂ ਪੈਸਿਆਂ ਬਾਰੇ ਪੁੱਛੋ — ਜਾਂ ਪ੍ਰੋਫ਼ਾਈਲ ਬਣਾ ਕੇ ਕਹੋ “ਮੇਰੀ ਯੋਗਤਾ ਜਾਂਚੋ”। ਮਾਈਕ ਦਬਾ ਕੇ ਹਿੰਦੀ/ਪੰਜਾਬੀ ਵਿੱਚ ਵੀ ਬੋਲ ਸਕਦੇ ਹੋ।");
    out.schemes = good(rank).slice(0, 2);
    addSources(out.schemes);
    out.suggested = T(
      ["What scholarships are available for students?", "What schemes can help with housing?", "Check my eligibility"],
      ["विद्यार्थियों के लिए कौन सी छात्रवृत्तियाँ हैं?", "आवास के लिए कौन सी योजनाएँ हैं?", "मेरी पात्रता जाँचें"],
      ["ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਕਿਹੜੀਆਂ ਸਕਾਲਰਸ਼ਿਪਾਂ ਹਨ?", "ਆਵਾਸ ਲਈ ਕਿਹੜੀਆਂ ਸਕੀਮਾਂ ਹਨ?", "ਮੇਰੀ ਯੋਗਤਾ ਜਾਂਚੋ"]);
    return finish();
  },
};
