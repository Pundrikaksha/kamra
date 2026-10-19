import { formatINR } from "@/lib/format"
import { sanitizeUntrusted } from "@/lib/sanitize"
import type { Lang, Requirement, ScoredListing } from "@/lib/types"

export type DraftInput = {
  requirement: Requirement
  listing: Pick<ScoredListing, "title" | "locality" | "platform" | "price" | "url">
  lang: Lang
}

const MAX_DRAFT = 900

export function templateDraft({ requirement, listing, lang }: DraftInput): string {
  const kind =
    requirement.type === "pg"
      ? lang === "hi"
        ? "पीजी"
        : "PG"
      : requirement.type === "flat-share"
        ? lang === "hi"
          ? "फ्लैट शेयर"
          : "flat share"
        : requirement.type === "room"
          ? lang === "hi"
            ? "कमरा"
            : "room"
          : requirement.bhk
            ? `${requirement.bhk}BHK`
            : lang === "hi"
              ? "जगह"
              : "place"
  const where = listing.locality || requirement.areas[0] || requirement.city || ""
  const rent = listing.price != null ? formatINR(listing.price) : lang === "hi" ? "जो लिखा है" : "the advertised rent"

  if (lang === "hi") {
    return [
      `नमस्ते, मुझे ${listing.platform} पर आपकी लिस्टिंग दिखी: "${sanitizeUntrusted(listing.title, 120)}"${where ? `, ${where}` : ""}।`,
      `मैं ${kind} ढूँढ रहा/रही हूँ। क्या यह अभी उपलब्ध है? क्या हम एक बार देख सकते हैं? मासिक किराया (${rent}), डिपॉज़िट और ब्रोकरेज कितना है?`,
      `लिखित एग्रीमेंट से पहले मैं टोकन, विज़िटिंग चार्ज या गेट पास का भुगतान नहीं करूँगा/करूँगी। धन्यवाद।`,
    ].join("\n\n")
  }

  return [
    `Hello, I found your listing on ${listing.platform}: "${sanitizeUntrusted(listing.title, 120)}"${where ? ` in ${where}` : ""}.`,
    `I am looking for a ${kind}. Is it still available, and could we fix a time to visit? What is the monthly rent (the snippet mentioned ${rent}), the deposit, and is there any brokerage?`,
    `I will not pay a token, visiting charge, or gate pass before a written agreement. Thank you.`,
  ].join("\n\n")
}

export function acceptDraft(candidate: string, fallback: string): string {
  const text = sanitizeUntrusted(candidate, MAX_DRAFT)
  if (text.length < 40 || text.length > MAX_DRAFT) return fallback
  if (/ignore (all |any )?(previous|prior) instructions|system prompt|api[_ ]?key/i.test(text)) return fallback
  if (/https?:\/\//i.test(text)) return fallback
  if (!/(available|visit|उपलब्ध|देख)/i.test(text)) return fallback
  if (/(pay now|upi|gpay|token amount|visiting charge)/i.test(text)) return fallback
  return text
}
