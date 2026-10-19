"use client"

import { useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Checklist } from "@/components/checklist"
import { usePreferences } from "@/components/preferences"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCopy } from "@/lib/i18n"
import { loadEmail, loadSearches, loadVisits, queueRerun, saveEmail, saveSearches, saveVisits } from "@/lib/storage"
import type { SavedSearch, VisitItem } from "@/lib/types"

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function SavedScreen() {
  const { lang } = usePreferences()
  const t = getCopy(lang)
  const router = useRouter()
  const mounted = useMounted()
  const [searchOverride, setSearchOverride] = useState<SavedSearch[] | null>(null)
  const [visitOverride, setVisitOverride] = useState<VisitItem[] | null>(null)
  const [emailOverride, setEmailOverride] = useState<string | null>(null)
  const [emailNote, setEmailNote] = useState("")
  const searches = searchOverride ?? (mounted ? loadSearches() : [])
  const visits = visitOverride ?? (mounted ? loadVisits() : [])
  const email = emailOverride ?? (mounted ? loadEmail() : "")

  function updateVisit(id: string, patch: Partial<VisitItem>) {
    const next = visits.map((item) => (item.id === id ? { ...item, ...patch } : item))
    setVisitOverride(next)
    saveVisits(next)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6">
      <header>
        <h1 className="font-heading text-4xl text-foreground">{t.savedTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.notBroker}</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl">{t.savedSearches}</h2>
        {mounted && searches.length === 0 ? <p className="text-sm text-muted-foreground">{t.noSearches}</p> : null}
        {searches.map((search) => (
          <article key={search.id} className="rounded-2xl border border-border bg-card px-3 py-3">
            <h3 className="font-medium">{search.label}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(search.savedAt).toLocaleString("en-IN")}</p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                className="h-10"
                onClick={() => {
                  queueRerun(search.requirement)
                  router.push("/")
                }}
              >
                {t.rerun}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => {
                  const next = searches.filter((item) => item.id !== search.id)
                  setSearchOverride(next)
                  saveSearches(next)
                }}
              >
                {t.remove}
              </Button>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl">{t.visits}</h2>
        {mounted && visits.length === 0 ? <p className="text-sm text-muted-foreground">{t.noVisits}</p> : null}
        {visits.map((visit) => (
          <article key={visit.id} className="space-y-2 rounded-2xl border border-border bg-card px-3 py-3">
            <h3 className="font-medium leading-snug">{visit.title}</h3>
            <p className="text-sm text-muted-foreground">
              {visit.platform}
              {visit.locality ? ` · ${visit.locality}` : ""}
              {visit.priceText ? ` · ${visit.priceText}` : ""}
            </p>
            <a href={visit.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
              {t.openListing}
            </a>
            <label className="block text-sm">
              {t.when}
              <Input
                className="mt-1 h-10"
                value={visit.when}
                onChange={(event) => updateVisit(visit.id, { when: event.target.value.slice(0, 80) })}
                placeholder={lang === "hi" ? "शनिवार, 11 बजे" : "Saturday, 11:00"}
              />
            </label>
            <label className="block text-sm">
              {t.notes}
              <textarea
                className="mt-1 min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
                value={visit.notes}
                maxLength={500}
                onChange={(event) => updateVisit(visit.id, { notes: event.target.value })}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const next = visits.filter((item) => item.id !== visit.id)
                setVisitOverride(next)
                saveVisits(next)
              }}
            >
              {t.remove}
            </Button>
          </article>
        ))}
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card px-3 py-3">
        <h2 className="font-heading text-2xl">{t.notify}</h2>
        <p className="text-sm text-muted-foreground">{t.notifyHelp}</p>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            const next = email.trim().slice(0, 120)
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) return
            saveEmail(next)
            setEmailOverride(next)
            setEmailNote(t.notifySaved)
          }}
        >
          <Input
            type="email"
            value={email}
            maxLength={120}
            onChange={(event) => setEmailOverride(event.target.value)}
            placeholder="you@email.com"
            className="h-11"
            aria-label={t.notify}
          />
          <Button type="submit" className="h-11">
            {t.notifySave}
          </Button>
        </form>
        {emailNote ? <p className="text-sm text-muted-foreground">{emailNote}</p> : null}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-2xl">{t.beforePay}</h2>
        <Checklist lang={lang} city="Noida" />
      </section>
    </div>
  )
}
