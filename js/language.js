"use strict";
/* ---------- language.js ---------- */
const LANGS = {
  en: { code:"en", label:"English", native:"English", html:"en" },
  hi: { code:"hi", label:"Hindi", native:"हिन्दी", html:"hi" },
  pa: { code:"pa", label:"Punjabi", native:"ਪੰਜਾਬੀ", html:"pa" },
};
const I18N = {
  en: {
    brand_sub:"citizen assistance", nav_how:"How it works", nav_schemes:"Explore schemes", nav_about:"About", nav_start:"Start",
    bn_home:"Home", bn_assist:"Assistant", bn_saved:"Saved",
    hero_eyebrow:"AI-powered citizen assistance",
    hero_h1a:"Government services,", hero_h1b:"explained for you.",
    hero_sub:"Find schemes, understand eligibility, discover required documents and get answers in the language you prefer.",
    cta_ask:"Ask Bharat Sahay", cta_check:"Check eligibility",
    trust_1:"No login needed", trust_2:"Free to use", trust_3:"Sources cited",
    tick_1:"Grounded in official sources", tick_2:"Explainable eligibility", tick_3:"English · हिन्दी · ਪੰਜਾਬੀ",
    tick_4:"Required-document checklists", tick_5:"Never invents facts", tick_6:"Built for every citizen",
    pop_title:"Popular questions", pop_sub:"Tap one to ask the assistant right away.",
    how_title:"How it works", how_sub:"Four calm steps from a question to a confident next step.",
    feat_title:"Everything a citizen needs to navigate schemes", feat_sub:"One assistant that searches, matches, explains and cites — so portals stop feeling like paperwork.",
    lang_title:"Your language, your answer", lang_sub:"Bharat Sahay explains schemes in the language you think in. Try it:",
    trust_title:"Designed around verified public information", trust_sub:"Bharat Sahay is built to be explainable and traceable — every claim points back to an official source you can open yourself.",
    cat_title:"Explore by category", cat_sub:"Start from what matters to you.",
    cta_title:"Curious what you may qualify for?", cta_sub:"A two-minute profile helps Bharat Sahay narrow hundreds of schemes to the few that fit you.",
    cta_btn:"Start eligibility check", cta_btn2:"Or just ask a question",
    foot_disclaimer:"Bharat Sahay provides general information about government schemes. It is not legal advice and does not submit applications. Always confirm details on the official portal before acting.",
  },
  hi: {
    brand_sub:"नागरिक सहायता", nav_how:"कैसे काम करता है", nav_schemes:"योजनाएँ देखें", nav_about:"जानकारी", nav_start:"शुरू करें",
    bn_home:"होम", bn_assist:"सहायक", bn_saved:"सहेजे गए",
    hero_eyebrow:"AI-संचालित नागरिक सहायता",
    hero_h1a:"सरकारी सेवाएँ,", hero_h1b:"आपकी भाषा में आसान।",
    hero_sub:"योजनाएँ खोजें, पात्रता समझें, ज़रूरी दस्तावेज़ जानें — और जवाब पाएँ अपनी पसंदीदा भाषा में।",
    cta_ask:"भारत सहाय से पूछें", cta_check:"पात्रता जाँचें",
    trust_1:"लॉगिन की ज़रूरत नहीं", trust_2:"बिल्कुल मुफ़्त", trust_3:"स्रोत के साथ",
    tick_1:"आधिकारिक स्रोतों पर आधारित", tick_2:"समझाई जा सकने वाली पात्रता", tick_3:"English · हिन्दी · ਪੰਜਾਬੀ",
    tick_4:"दस्तावेज़ों की सूची", tick_5:"कभी तथ्य नहीं गढ़ता", tick_6:"हर नागरिक के लिए",
    pop_title:"लोकप्रिय सवाल", pop_sub:"तुरंत पूछने के लिए किसी एक पर टैप करें।",
    how_title:"कैसे काम करता है", how_sub:"सवाल से लेकर भरोसेमंद अगले कदम तक — चार आसान चरण।",
    feat_title:"योजनाओं को समझने के लिए सब कुछ एक जगह", feat_sub:"एक सहायक जो खोजता है, मिलाता है, समझाता है और स्रोत दिखाता है।",
    lang_title:"आपकी भाषा, आपका जवाब", lang_sub:"भारत सहाय योजनाओं को उसी भाषा में समझाता है जिसमें आप सोचते हैं। आज़माएँ:",
    trust_title:"सत्यापित सार्वजनिक जानकारी पर बना", trust_sub:"हर दावा एक आधिकारिक स्रोत की ओर इशारा करता है जिसे आप स्वयं खोल सकते हैं।",
    cat_title:"श्रेणी के अनुसार देखें", cat_sub:"जो आपके लिए मायने रखता है, वहाँ से शुरू करें।",
    cta_title:"जानना चाहते हैं आप किसके पात्र हैं?", cta_sub:"दो मिनट की प्रोफ़ाइल से सैकड़ों योजनाएँ छँटकर कुछ रह जाती हैं।",
    cta_btn:"पात्रता जाँच शुरू करें", cta_btn2:"या बस एक सवाल पूछें",
    foot_disclaimer:"भारत सहाय सरकारी योजनाओं की सामान्य जानकारी देता है। यह कानूनी सलाह नहीं है। कार्रवाई से पहले आधिकारिक पोर्टल पर पुष्टि करें।",
  },
  pa: {
    brand_sub:"ਨਾਗਰਿਕ ਮਦਦ", nav_how:"ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", nav_schemes:"ਸਕੀਮਾਂ ਵੇਖੋ", nav_about:"ਜਾਣਕਾਰੀ", nav_start:"ਸ਼ੁਰੂ ਕਰੋ",
    bn_home:"ਹੋਮ", bn_assist:"ਸਹਾਇਕ", bn_saved:"ਸੰਭਾਲੇ",
    hero_eyebrow:"AI-ਅਧਾਰਿਤ ਨਾਗਰਿਕ ਮਦਦ",
    hero_h1a:"ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ,", hero_h1b:"ਤੁਹਾਡੇ ਲਈ ਆਸਾਨ।",
    hero_sub:"ਸਕੀਮਾਂ ਲੱਭੋ, ਯੋਗਤਾ ਸਮਝੋ, ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ ਜਾਣੋ — ਅਤੇ ਜਵਾਬ ਪਾਓ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ।",
    cta_ask:"ਭਾਰਤ ਸਹਾਏ ਨੂੰ ਪੁੱਛੋ", cta_check:"ਯੋਗਤਾ ਜਾਂਚੋ",
    trust_1:"ਲੌਗਇਨ ਦੀ ਲੋੜ ਨਹੀਂ", trust_2:"ਬਿਲਕੁਲ ਮੁਫ਼ਤ", trust_3:"ਸਰੋਤ ਸਹਿਤ",
    tick_1:"ਸਰਕਾਰੀ ਸਰੋਤਾਂ ਉੱਤੇ ਅਧਾਰਿਤ", tick_2:"ਸਮਝਾਈ ਜਾ ਸਕਣ ਵਾਲੀ ਯੋਗਤਾ", tick_3:"English · हिन्दी · ਪੰਜਾਬੀ",
    tick_4:"ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ", tick_5:"ਕਦੇ ਤੱਥ ਨਹੀਂ ਘੜਦਾ", tick_6:"ਹਰ ਨਾਗਰਿਕ ਲਈ",
    pop_title:"ਪ੍ਰਸਿੱਧ ਸਵਾਲ", pop_sub:"ਤੁਰੰਤ ਪੁੱਛਣ ਲਈ ਕਿਸੇ ਇੱਕ ਉੱਤੇ ਟੈਪ ਕਰੋ।",
    how_title:"ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", how_sub:"ਸਵਾਲ ਤੋਂ ਲੈ ਕੇ ਭਰੋਸੇਯੋਗ ਅਗਲੇ ਕਦਮ ਤੱਕ — ਚਾਰ ਸੌਖੇ ਕਦਮ।",
    feat_title:"ਸਕੀਮਾਂ ਸਮਝਣ ਲਈ ਸਭ ਕੁਝ ਇੱਕ ਥਾਂ", feat_sub:"ਇੱਕ ਸਹਾਇਕ ਜੋ ਲੱਭਦਾ ਹੈ, ਮਿਲਾਉਂਦਾ ਹੈ, ਸਮਝਾਉਂਦਾ ਹੈ ਅਤੇ ਸਰੋਤ ਦਿਖਾਉਂਦਾ ਹੈ।",
    lang_title:"ਤੁਹਾਡੀ ਭਾਸ਼ਾ, ਤੁਹਾਡਾ ਜਵਾਬ", lang_sub:"ਭਾਰਤ ਸਹਾਏ ਸਕੀਮਾਂ ਉਸੇ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਉਂਦਾ ਹੈ ਜਿਸ ਵਿੱਚ ਤੁਸੀਂ ਸੋਚਦੇ ਹੋ। ਅਜ਼ਮਾਓ:",
    trust_title:"ਪ੍ਰਮਾਣਿਤ ਜਨਤਕ ਜਾਣਕਾਰੀ ਉੱਤੇ ਬਣਿਆ", trust_sub:"ਹਰ ਦਾਅਵਾ ਇੱਕ ਸਰਕਾਰੀ ਸਰੋਤ ਵੱਲ ਇਸ਼ਾਰਾ ਕਰਦਾ ਹੈ ਜਿਸ ਨੂੰ ਤੁਸੀਂ ਖ਼ੁਦ ਖੋਲ੍ਹ ਸਕਦੇ ਹੋ।",
    cat_title:"ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਵੇਖੋ", cat_sub:"ਜੋ ਤੁਹਾਡੇ ਲਈ ਮਾਇਨੇ ਰੱਖਦਾ ਹੈ, ਉੱਥੋਂ ਸ਼ੁਰੂ ਕਰੋ।",
    cta_title:"ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ ਤੁਸੀਂ ਕਿਸ ਲਈ ਯੋਗ ਹੋ?", cta_sub:"ਦੋ ਮਿੰਟ ਦੀ ਪ੍ਰੋਫ਼ਾਈਲ ਨਾਲ ਸੈਂਕੜੇ ਸਕੀਮਾਂ ਛੱਟ ਕੇ ਕੁਝ ਰਹਿ ਜਾਂਦੀਆਂ ਹਨ।",
    cta_btn:"ਯੋਗਤਾ ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ", cta_btn2:"ਜਾਂ ਬਸ ਇੱਕ ਸਵਾਲ ਪੁੱਛੋ",
    foot_disclaimer:"ਭਾਰਤ ਸਹਾਏ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਆਮ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹੈ। ਇਹ ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ ਹੈ। ਕਾਰਵਾਈ ਤੋਂ ਪਹਿਲਾਂ ਸਰਕਾਰੀ ਪੋਰਟਲ ਉੱਤੇ ਪੁਸ਼ਟੀ ਕਰੋ।",
  },
};
const Lang = {
  current: Store.get("lang", "en"),
  t(key){ return (I18N[this.current] && I18N[this.current][key]) || I18N.en[key] || key; },
  set(code){
    this.current = code; Store.set("lang", code);
    document.documentElement.lang = LANGS[code].html;
    $("#langLabel").textContent = code.toUpperCase();
    $$(".lang-opt").forEach(b => b.setAttribute("aria-current", b.dataset.lang === code));
    document.querySelectorAll("[data-i18n]").forEach(el => { const v = this.t(el.dataset.i18n); if (v) el.textContent = v; });
    Router.render();
  },
};
