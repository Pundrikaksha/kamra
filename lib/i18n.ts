import type { Lang, RiskCode, RiskLevel } from "@/lib/types"

const copy = {
  en: {
    tagline: "Rooms, flats and PGs",
    kicker: "Delhi NCR and other cities",
    headline: "Find a room without the runaround.",
    greeting: "Tell me the area, the budget, and who it’s for. I’ll shortlist public search results. You approve anything before it’s sent.",
    placeholder: "2BHK under 25k near Sector 62 metro…",
    send: "Send",
    voice: "Speak",
    voiceOn: "Listening. Tap again to stop.",
    voiceOff: "Voice input needs Chrome or Android.",
    searching: "Checking public listings…",
    contact: "Contact for me",
    saveVisit: "Save for a visit",
    savedVisit: "Saved",
    openListing: "Open listing",
    why: "Why this fits",
    fit: "fit",
    sample: "Sample",
    demo: "Demo mode. These cards are examples written for Kamra, not ads copied from other sites. Add a Gemini key for live search.",
    liveNote: "Links open the original site. Kamra does not copy the listing and is not a broker.",
    empty: "Nothing matched closely. Try a wider budget or a nearby area.",
    error: "That search didn’t finish.",
    retry: "Try again",
    approveLabel: "I approve this message. Kamra will not send it.",
    approveHint: "Nothing is sent until you tap a button. That opens the listing, WhatsApp, or SMS with the text filled in.",
    openApproved: "Approve and open listing",
    whatsapp: "Approve and WhatsApp",
    sms: "Approve and SMS",
    copy: "Copy text",
    copied: "Copied",
    draftTitle: "Message to the owner",
    drafting: "Writing a short note…",
    beforePay: "Before you pay",
    editNeed: "Your search",
    saveSearch: "Save search",
    searchSaved: "Search saved on this phone",
    savedTitle: "Saved",
    savedSearches: "Saved searches",
    noSearches: "Save a search from the shortlist and you can run it again.",
    rerun: "Run again",
    visits: "Visit plan",
    noVisits: "Save a card for a visit and keep a note of what you saw.",
    when: "When",
    notes: "Notes",
    remove: "Remove",
    notify: "Email for later",
    notifyHelp: "Saved only on this phone. Kamra does not send mail yet.",
    notifySave: "Save email",
    notifySaved: "Saved on this phone",
    privacy: "Privacy",
    terms: "Terms",
    notBroker: "Kamra isn’t a broker and takes no commission.",
    back: "Back to search",
    risk: {
      low: "Ordinary",
      medium: "Check this",
      high: "High risk",
    } satisfies Record<RiskLevel, string>,
    riskDetail: {
      broker: "Broker hint",
      below_norm: "Far below usual rent",
      token: "Token / visiting charge",
      duplicate: "Also on another site",
    } satisfies Record<RiskCode, string>,
    examples: [
      "2BHK under 25k near Sector 62 metro, family, semi-furnished",
      "Girls PG under 12k in Noida",
      "flat share near Cyber City under 18k, veg",
    ],
  },
  hi: {
    tagline: "कमरा, फ्लैट और पीजी",
    kicker: "दिल्ली NCR और दूसरे शहर",
    headline: "बिना चक्कर के कमरा खोजें।",
    greeting: "एरिया, बजट और किसके लिए चाहिए — एक संदेश में बताइए। मैं सार्वजनिक सर्च से छोटी सूची लाऊँगा। भेजने से पहले आप मंज़ूरी देंगे।",
    placeholder: "सेक्टर 62 मेट्रो के पास 25 हज़ार में 2BHK…",
    send: "भेजें",
    voice: "बोलें",
    voiceOn: "सुन रहा हूँ। रोकने के लिए फिर टैप करें।",
    voiceOff: "आवाज़ के लिए Chrome या Android चाहिए।",
    searching: "सार्वजनिक लिस्टिंग देख रहा हूँ…",
    contact: "मेरे लिए संपर्क करें",
    saveVisit: "विज़िट में रखें",
    savedVisit: "रख लिया",
    openListing: "लिस्टिंग खोलें",
    why: "यह क्यों फिट है",
    fit: "फिट",
    sample: "नमूना",
    demo: "डेमो मोड। ये कार्ड कमरा के उदाहरण हैं, किसी साइट से कॉपी किए विज्ञापन नहीं। लाइव सर्च के लिए Gemini कुंजी जोड़ें।",
    liveNote: "लिंक असली साइट खोलते हैं। कमरा लिस्टिंग कॉपी नहीं करता और दलाल नहीं है।",
    empty: "कोई क़रीबी मिलान नहीं। बजट या एरिया थोड़ा चौड़ा करें।",
    error: "सर्च पूरी नहीं हुई।",
    retry: "फिर कोशिश करें",
    approveLabel: "मैं इस संदेश को मंज़ूर करता/करती हूँ। कमरा इसे नहीं भेजेगा।",
    approveHint: "बटन दबाने तक कुछ नहीं जाता। बटन लिस्टिंग, WhatsApp या SMS को टेक्स्ट के साथ खोलता है।",
    openApproved: "मंज़ूरी दें और लिस्टिंग खोलें",
    whatsapp: "मंज़ूरी दें और WhatsApp",
    sms: "मंज़ूरी दें और SMS",
    copy: "टेक्स्ट कॉपी करें",
    copied: "कॉपी हो गया",
    draftTitle: "मालिक के लिए संदेश",
    drafting: "छोटा संदेश लिख रहा हूँ…",
    beforePay: "पैसे देने से पहले",
    editNeed: "आपकी खोज",
    saveSearch: "खोज सेव करें",
    searchSaved: "खोज इस फ़ोन पर सेव हुई",
    savedTitle: "सेव",
    savedSearches: "सेव की हुई खोजें",
    noSearches: "शॉर्टलिस्ट से खोज सेव करें, फिर उसे दोबारा चला सकते हैं।",
    rerun: "फिर चलाएँ",
    visits: "विज़िट प्लान",
    noVisits: "कार्ड सेव करें और देखकर नोट लिखें।",
    when: "कब",
    notes: "नोट",
    remove: "हटाएँ",
    notify: "बाद के लिए ईमेल",
    notifyHelp: "सिर्फ़ इस फ़ोन पर सेव होगा। कमरा अभी मेल नहीं भेजता।",
    notifySave: "ईमेल सेव करें",
    notifySaved: "इस फ़ोन पर सेव हुआ",
    privacy: "प्राइवेसी",
    terms: "शर्तें",
    notBroker: "कमरा दलाल नहीं है और कमीशन नहीं लेता।",
    back: "खोज पर वापस",
    risk: {
      low: "सामान्य",
      medium: "जाँचें",
      high: "ज़्यादा जोखिम",
    } satisfies Record<RiskLevel, string>,
    riskDetail: {
      broker: "दलाल का संकेत",
      below_norm: "इलाके के किराए से बहुत कम",
      token: "टोकन / विज़िटिंग चार्ज",
      duplicate: "दूसरी साइट पर भी",
    } satisfies Record<RiskCode, string>,
    examples: [
      "सेक्टर 62 मेट्रो के पास 25 हजार में 2BHK, फैमिली, सेमी फर्निश्ड",
      "नोएडा में 12 हजार के अंदर लड़कियों की पीजी",
      "साइबर सिटी के पास 18 हजार में फ्लैट शेयर, वेज",
    ],
  },
} as const

export type Copy = (typeof copy)["en"]

export function getCopy(lang: Lang): Copy {
  return copy[lang] as Copy
}

export function checklistFor(lang: Lang, city: string | null) {
  const up = city === "Noida" || city === "Greater Noida" || city === "Ghaziabad"
  if (lang === "hi") {
    return [
      {
        title: "एग्रीमेंट से पहले टोकन नहीं",
        body: "जगह देखने या सोसाइटी गेट के लिए टोकन, विज़िटिंग कार्ड या गेट पास न दें। असली गार्ड देखने का पैसा नहीं माँगता।",
      },
      {
        title: "मालिक की पहचान देखें",
        body: "मिलते समय पहचान पत्र और बिजली बिल या प्रॉपर्टी टैक्स जैसा सबूत माँगें। नाम लिस्टिंग से मिलाएँ।",
      },
      {
        title: up ? "नोएडा में डिपॉज़िट की सीमा" : "डिपॉज़िट पर सवाल करें",
        body: up
          ? "उत्तर प्रदेश के किराया कानून में आवासीय डिपॉज़िट आमतौर पर दो महीने के किराए तक है। नोएडा उसी राज्य में है। इससे ज़्यादा माँग हो तो लिखित वजह पूछें।"
          : "दिल्ली और हरियाणा ने दो महीने वाली सीमा नहीं अपनाई। फिर भी दो–तीन महीने से ऊपर की डिपॉज़िट की वजह पूछें।",
      },
      {
        title: "दलाली अलग बात है",
        body: "NCR में अक्सर 15 दिन की दलाली माँगी जाती है। कमरा कमीशन नहीं लेता। “ओनर” कहकर दलाली माँगे तो उसे दलाल मानें।",
      },
      {
        title: "UPI से जल्दी न भेजें",
        body: "जिस नंबर की जाँच न हुई हो, उसे पैसे न भेजें। ठगी हो तो राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें।",
      },
    ]
  }
  return [
    {
      title: "No token before the agreement",
      body: "Don’t pay a token, visiting card, or gate pass to see a flat. A society guard does not charge a viewing fee.",
    },
    {
      title: "Check who the owner is",
      body: "Ask for an ID and a proof such as an electricity bill or property-tax receipt. Match the name to the person you meet.",
    },
    {
      title: up ? "Noida deposit cap" : "Question a large deposit",
      body: up
        ? "Uttar Pradesh’s tenancy law generally caps a residential deposit at two months’ rent, and Noida is in UP. Ask why if someone wants more."
        : "Delhi and Haryana have not adopted that two-month cap. Still ask why a deposit is more than two or three months.",
    },
    {
      title: "Brokerage is a separate ask",
      body: "In NCR people often ask for about 15 days’ rent as brokerage. Kamra takes no commission. If an “owner” asks for brokerage, treat them as a broker.",
    },
    {
      title: "Don’t rush a UPI transfer",
      body: "Don’t send money to a number you haven’t checked. If you are cheated, call the national cyber-crime helpline on 1930.",
    },
  ]
}
