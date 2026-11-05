"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Mic, Send } from "lucide-react"
import { ContactSheet } from "@/components/contact-sheet"
import { ListingCard } from "@/components/listing-card"
import { usePreferences } from "@/components/preferences"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatBudget } from "@/lib/format"
import { getCopy } from "@/lib/i18n"
import { hashId } from "@/lib/hash"
import { emptyRequirement, requirementLabel, sanitizeRequirement } from "@/lib/requirement"
import { loadSearches, loadVisits, saveSearches, saveVisits, takeRerun } from "@/lib/storage"
import type { ChipGroup, Requirement, SavedSearch, ScoredListing, SearchMode, TurnResult } from "@/lib/types"

const TYPE_LABEL: Record<string, { en: string; hi: string }> = {
  flat: { en: "Flat", hi: "फ्लैट" },
  pg: { en: "PG", hi: "पीजी" },
  "flat-share": { en: "Flat share", hi: "फ्लैट शेयर" },
  room: { en: "Room", hi: "कमरा" },
}

export function KamraApp() {
  const { lang } = usePreferences()
  const t = getCopy(lang)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [requirement, setRequirement] = useState<Requirement>(emptyRequirement())
  const [askedCount, setAskedCount] = useState(0)
  const [phase, setPhase] = useState<"idle" | "loading" | "clarify" | "results" | "error">("idle")
  const [question, setQuestion] = useState("")
  const [groups, setGroups] = useState<ChipGroup[]>([])
  const [listings, setListings] = useState<ScoredListing[]>([])
  const [mode, setMode] = useState<SearchMode | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [contact, setContact] = useState<ScoredListing | null>(null)
  const [savedOverride, setSavedOverride] = useState<string[] | null>(null)
  const [savedNote, setSavedNote] = useState("")
  const [editing, setEditing] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const voiceReady = useSyncExternalStore(
    () => () => {},
    () => {
      const root = window as Window & { webkitSpeechRecognition?: { new (): SpeechRecognition } }
      return Boolean(root.SpeechRecognition || root.webkitSpeechRecognition)
    },
    () => false
  )
  const savedIds = savedOverride ?? (mounted ? loadVisits().map((item) => item.id) : [])
  const recognition = useRef<SpeechRecognition | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const rerunStarted = useRef(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [phase, listings.length, question])

  function applyTurn(data: TurnResult) {
    setRequirement(data.requirement)
    setAskedCount(data.askedCount)
    setMode(data.mode)
    if (data.status === "clarify") {
      setPhase("clarify")
      setQuestion(data.question)
      setGroups(data.groups)
      setListings([])
      setNotice(null)
      return
    }
    setPhase("results")
    setQuestion("")
    setGroups([])
    setListings(data.listings)
    setNotice(data.notice)
  }

  async function runTurn(text: string, prior: string[], base: Requirement, asked: number) {
    setPhase("loading")
    setError("")
    const response = await fetch("/api/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, history: prior, requirement: base, askedCount: asked, lang }),
    })
    const data = (await response.json()) as TurnResult & { message?: string }
    if (!response.ok) throw new Error(data.message || t.error)
    applyTurn(data)
  }

  async function runSearch(next: Requirement) {
    setPhase("loading")
    setError("")
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirement: next, lang }),
    })
    const data = (await response.json()) as {
      listings?: ScoredListing[]
      mode?: SearchMode
      notice?: string | null
      requirement?: Requirement
      message?: string
    }
    if (!response.ok || !data.listings || !data.mode) throw new Error(data.message || t.error)
    setRequirement(data.requirement ?? next)
    setMode(data.mode)
    setListings(data.listings)
    setNotice(data.notice ?? null)
    setPhase("results")
    setGroups([])
  }

  useEffect(() => {
    if (rerunStarted.current) return
    rerunStarted.current = true
    const pending = takeRerun()
    if (!pending) return
    const clean = sanitizeRequirement(pending)
    queueMicrotask(() => {
      setRequirement(clean)
      setPhase("loading")
      setError("")
      void fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement: clean, lang }),
      })
        .then(async (response) => {
          const data = (await response.json()) as {
            listings?: ScoredListing[]
            mode?: SearchMode
            notice?: string | null
            requirement?: Requirement
            message?: string
          }
          if (!response.ok || !data.listings || !data.mode) throw new Error(data.message || "Search failed")
          setRequirement(data.requirement ?? clean)
          setMode(data.mode)
          setListings(data.listings)
          setNotice(data.notice ?? null)
          setPhase("results")
          setGroups([])
        })
        .catch((err: unknown) => {
          setPhase("error")
          setError(err instanceof Error ? err.message : "Search failed")
        })
    })
  }, [lang])

  async function submit(text: string) {
    const clean = text.trim().slice(0, 600)
    if (!clean || phase === "loading") return
    setInput("")
    setEditing(null)
    const prior = history
    setHistory([...prior, clean].slice(-8))
    try {
      await runTurn(clean, prior, requirement, askedCount)
    } catch (err) {
      setPhase("error")
      setError(err instanceof Error ? err.message : t.error)
    }
  }

  function patchAndSearch(patch: Partial<Requirement>) {
    const next = sanitizeRequirement({ ...requirement, ...patch, inferredCity: false })
    setRequirement(next)
    setEditing(null)
    if (phase === "results" || phase === "error") {
      void runSearch(next).catch((err: unknown) => {
        setPhase("error")
        setError(err instanceof Error ? err.message : t.error)
      })
    }
  }

  function saveSearch() {
    const item: SavedSearch = {
      id: hashId(`${requirementLabel(requirement)}:${Date.now()}`),
      label: requirementLabel(requirement),
      requirement,
      savedAt: new Date().toISOString(),
    }
    saveSearches([item, ...loadSearches()].slice(0, 12))
    setSavedNote(t.searchSaved)
  }

  function saveVisit(listing: ScoredListing) {
    const current = loadVisits()
    if (!current.some((item) => item.id === listing.id)) {
      saveVisits(
        [
          {
            id: listing.id,
            title: listing.title,
            url: listing.url,
            platform: listing.platform,
            locality: listing.locality,
            priceText: listing.priceText,
            when: "",
            notes: "",
            addedAt: new Date().toISOString(),
          },
          ...current,
        ].slice(0, 20)
      )
    }
    setSavedOverride(loadVisits().map((item) => item.id))
  }

  function toggleVoice() {
    const root = window as Window & { webkitSpeechRecognition?: { new (): SpeechRecognition } }
    const Ctor = root.SpeechRecognition || root.webkitSpeechRecognition
    if (!Ctor) return
    if (listening && recognition.current) {
      recognition.current.stop()
      setListening(false)
      return
    }
    const rec = new Ctor()
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN"
    rec.interimResults = false
    rec.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript ?? ""
      if (spoken) setInput(spoken)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognition.current = rec
    rec.start()
    setListening(true)
  }

  const summary = summaryChips(requirement, lang)
  const showGreeting = phase === "idle" && history.length === 0

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-3xl flex-col px-4">
      <div className="flex flex-1 flex-col gap-4 py-5">
        {showGreeting ? (
          <section className="pt-2">
            <p className="text-xs tracking-[0.16em] text-primary uppercase">{t.kicker}</p>
            <h1 className="mt-2 max-w-xl font-heading text-4xl leading-[1.05] text-foreground sm:text-5xl">
              {t.headline}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-6 text-muted-foreground">{t.greeting}</p>
            <div className="mt-4 flex flex-col gap-2">
              {t.examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => void submit(example)}
                  className="rounded-2xl border border-border bg-card px-3 py-3 text-left text-sm leading-5 text-foreground hover:border-primary/40"
                >
                  {example}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {history.slice(-3).map((line, index) => (
          <p
            key={`${history.length - 3 + index}-${line.slice(0, 24)}`}
            className="ml-8 rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm leading-5 break-words text-primary-foreground"
          >
            {line}
          </p>
        ))}

        {phase === "loading" ? (
          <div className="space-y-3" aria-live="polite">
            <p className="text-sm text-muted-foreground">{t.searching}</p>
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : null}

        {phase === "error" ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm" role="alert">
            <p>{error || t.error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-10"
              onClick={() => {
                const last = history[history.length - 1]
                if (last) void submit(last)
              }}
            >
              {t.retry}
            </Button>
          </div>
        ) : null}

        {summary.length ? (
          <section>
            <h2 className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">{t.editNeed}</h2>
            <div className="flex flex-wrap gap-2">
              {summary.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setEditing(editing === chip.id ? null : chip.id)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                  aria-expanded={editing === chip.id}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            {editing ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {editOptions(editing, lang).map((option) => (
                  <Button
                    key={option.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={() => patchAndSearch(option.patch)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {phase === "clarify" ? (
          <section className="rounded-2xl border border-border bg-card px-3 py-3" aria-live="polite">
            <p className="font-medium">{question}</p>
            <div className="mt-3 space-y-3">
              {groups.map((group) => (
                <div key={group.id}>
                  <p className="mb-2 text-sm text-muted-foreground">{group.prompt}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => (
                      <Button
                        key={option.utterance}
                        type="button"
                        variant="outline"
                        className="h-10"
                        onClick={() => void submit(option.utterance)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {phase === "results" ? (
          <section className="space-y-3">
            {mode === "demo" ? (
              <p className="rounded-xl border border-amber-700/30 bg-amber-700/10 px-3 py-2 text-sm leading-5">{t.demo}</p>
            ) : (
              <p className="text-sm leading-5 text-muted-foreground">{t.liveNote}</p>
            )}
            {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
            {listings.length === 0 ? <p className="text-sm">{t.empty}</p> : null}
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                requirement={requirement}
                lang={lang}
                saved={savedIds.includes(listing.id)}
                onContact={setContact}
                onSave={saveVisit}
              />
            ))}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="h-10" onClick={saveSearch}>
                {t.saveSearch}
              </Button>
              {savedNote ? <p className="text-sm text-muted-foreground">{savedNote}</p> : null}
            </div>
          </section>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        className="sticky bottom-0 -mx-4 mt-auto flex items-center gap-2 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault()
          void submit(input)
        }}
      >
        <Button
          type="button"
          size="icon-lg"
          variant={listening ? "default" : "outline"}
          aria-label={voiceReady ? (listening ? t.voiceOn : t.voice) : t.voiceOff}
          aria-pressed={listening}
          disabled={!voiceReady}
          title={voiceReady ? t.voice : t.voiceOff}
          onClick={toggleVoice}
        >
          <Mic />
        </Button>
        <label className="sr-only" htmlFor="need">
          {t.placeholder}
        </label>
        <Input
          id="need"
          value={input}
          maxLength={600}
          placeholder={t.placeholder}
          className="h-11 text-base"
          onChange={(event) => setInput(event.target.value)}
        />
        <Button type="submit" size="icon-lg" aria-label={t.send} disabled={phase === "loading" || !input.trim()}>
          <Send />
        </Button>
      </form>

      <ContactSheet
        key={contact?.id ?? "closed"}
        listing={contact}
        requirement={requirement}
        lang={lang}
        onClose={() => setContact(null)}
      />
    </div>
  )
}

function summaryChips(requirement: Requirement, lang: "en" | "hi") {
  const chips: { id: string; label: string }[] = []
  if (requirement.city) chips.push({ id: "city", label: requirement.city })
  if (requirement.areas.length) chips.push({ id: "area", label: requirement.areas.join(", ") })
  if (requirement.budgetMin != null || requirement.budgetMax != null) {
    chips.push({ id: "budget", label: formatBudget(requirement.budgetMin, requirement.budgetMax, lang) })
  }
  if (requirement.type) chips.push({ id: "type", label: TYPE_LABEL[requirement.type][lang] })
  if (requirement.bhk) chips.push({ id: "bhk", label: `${requirement.bhk}BHK` })
  if (requirement.furnishing) {
    const label =
      requirement.furnishing === "semi"
        ? lang === "hi"
          ? "सेमी"
          : "Semi-furnished"
        : requirement.furnishing === "furnished"
          ? lang === "hi"
            ? "फर्निश्ड"
            : "Furnished"
          : lang === "hi"
            ? "बिना फर्नीचर"
            : "Unfurnished"
    chips.push({ id: "furnishing", label })
  }
  if (requirement.gender) {
    chips.push({
      id: "gender",
      label: requirement.gender === "female" ? (lang === "hi" ? "लड़कियाँ" : "Women") : lang === "hi" ? "लड़के" : "Men",
    })
  }
  if (requirement.tenant) {
    chips.push({
      id: "tenant",
      label: requirement.tenant === "family" ? (lang === "hi" ? "फैमिली" : "Family") : lang === "hi" ? "बैचलर" : "Bachelor",
    })
  }
  return chips
}

function editOptions(id: string, lang: "en" | "hi"): { label: string; patch: Partial<Requirement> }[] {
  if (id === "city") {
    return ["Noida", "Gurgaon", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Mumbai"].map((city) => ({
      label: city,
      patch: { city, inferredCity: false },
    }))
  }
  if (id === "budget") {
    return [
      { label: lang === "hi" ? "₹15 हज़ार तक" : "Under ₹15k", patch: { budgetMin: null, budgetMax: 15000 } },
      { label: lang === "hi" ? "₹25 हज़ार तक" : "Under ₹25k", patch: { budgetMin: null, budgetMax: 25000 } },
      { label: lang === "hi" ? "₹40 हज़ार तक" : "Under ₹40k", patch: { budgetMin: null, budgetMax: 40000 } },
      { label: "₹25–40k", patch: { budgetMin: 25000, budgetMax: 40000 } },
    ]
  }
  if (id === "type") {
    return (["flat", "pg", "flat-share", "room"] as const).map((type) => ({
      label: TYPE_LABEL[type][lang],
      patch: { type },
    }))
  }
  if (id === "bhk") {
    return [1, 2, 3, 4].map((bhk) => ({ label: `${bhk}BHK`, patch: { bhk, type: "flat" as const } }))
  }
  if (id === "furnishing") {
    return [
      { label: lang === "hi" ? "फर्निश्ड" : "Furnished", patch: { furnishing: "furnished" as const } },
      { label: lang === "hi" ? "सेमी" : "Semi", patch: { furnishing: "semi" as const } },
      { label: lang === "hi" ? "खाली" : "Unfurnished", patch: { furnishing: "unfurnished" as const } },
    ]
  }
  return []
}
