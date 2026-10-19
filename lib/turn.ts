import type { ChipGroup, Lang, Requirement } from "@/lib/types"

function placeGroup(lang: Lang): ChipGroup {
  const options = [
    ["Noida", "in Noida"],
    ["Gurgaon", "in Gurgaon"],
    ["Delhi", "in Delhi"],
    ["Bengaluru", "in Bengaluru"],
    ["Pune", "in Pune"],
    ["Hyderabad", "in Hyderabad"],
    ["Mumbai", "in Mumbai"],
  ]
  return {
    id: "place",
    prompt: lang === "hi" ? "कौन सा शहर?" : "Which city?",
    options: options.map(([label, utterance]) => ({ label, utterance })),
  }
}

function budgetGroup(lang: Lang): ChipGroup {
  const options: [string, string][] =
    lang === "hi"
      ? [
          ["₹10,000 तक", "under 10k"],
          ["₹10–15 हज़ार", "budget 10k to 15k"],
          ["₹15–25 हज़ार", "budget 15k to 25k"],
          ["₹25–40 हज़ार", "budget 25k to 40k"],
          ["₹40,000 से ऊपर", "budget above 40k"],
        ]
      : [
          ["Under ₹10k", "under 10k"],
          ["₹10–15k", "budget 10k to 15k"],
          ["₹15–25k", "budget 15k to 25k"],
          ["₹25–40k", "budget 25k to 40k"],
          ["Above ₹40k", "budget above 40k"],
        ]
  return {
    id: "budget",
    prompt: lang === "hi" ? "महीने का बजट?" : "Monthly budget?",
    options: options.map(([label, utterance]) => ({ label, utterance })),
  }
}

function typeGroup(lang: Lang): ChipGroup {
  const options: [string, string][] =
    lang === "hi"
      ? [
          ["फ्लैट", "a flat"],
          ["पीजी", "a PG"],
          ["फ्लैट शेयर", "a flat share"],
          ["कमरा", "a room"],
        ]
      : [
          ["Flat", "a flat"],
          ["PG", "a PG"],
          ["Flat share", "a flat share"],
          ["Room", "a room"],
        ]
  return {
    id: "type",
    prompt: lang === "hi" ? "किस तरह की जगह?" : "What kind of place?",
    options: options.map(([label, utterance]) => ({ label, utterance })),
  }
}

export function missingGroups(requirement: Requirement, lang: Lang): ChipGroup[] {
  const groups: ChipGroup[] = []
  if (!requirement.city && requirement.areas.length === 0) groups.push(placeGroup(lang))
  if (requirement.budgetMin == null && requirement.budgetMax == null) groups.push(budgetGroup(lang))
  if (!requirement.type) groups.push(typeGroup(lang))
  return groups
}

export function clarifyStep(
  requirement: Requirement,
  askedCount: number,
  lang: Lang
): { question: string; groups: ChipGroup[]; askedCount: number } | null {
  if (askedCount >= 2) return null
  const pending = missingGroups(requirement, lang)
  if (!pending.length) return null
  const room = 2 - askedCount
  const groups = pending.slice(0, room)
  const question =
    lang === "hi"
      ? "दो बातें और, फिर मैं खोजूँगा।"
      : groups.length > 1
        ? "Two quick things, then I’ll search."
        : groups[0].prompt
  return { question, groups, askedCount: askedCount + groups.length }
}
