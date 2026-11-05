"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getCopy } from "@/lib/i18n"
import type { Lang, ScoredListing, Requirement } from "@/lib/types"
import type { ScamGuardResult } from "@/lib/scam-guard"

export function ListingCard({
  listing,
  requirement,
  lang,
  saved,
  onContact,
  onSave,
}: {
  listing: ScoredListing
  requirement: Requirement
  lang: Lang
  saved: boolean
  onContact: (listing: ScoredListing) => void
  onSave: (listing: ScoredListing) => void
}) {
  const t = getCopy(lang)
  const [scamResult, setScamResult] = useState<ScamGuardResult | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/scam-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing, requirement }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.level) {
          setScamResult(data)
        }
      })
      .catch((err) => console.error("Scam guard check failed", err))

    return () => {
      active = false
    }
  }, [listing, requirement])

  const rail =
    listing.riskLevel === "high"
      ? "bg-destructive"
      : listing.riskLevel === "medium"
        ? "bg-amber-600"
        : "bg-emerald-700"
  const price = listing.priceText || (lang === "hi" ? "किराया स्निपेट में नहीं" : "Rent not in the snippet")

  return (
    <Card className="relative overflow-hidden py-0">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${rail}`} aria-hidden />
      <div className="flex flex-col gap-3 px-4 py-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {listing.platform}
              {listing.freshness ? ` · ${listing.freshness}` : ""}
            </p>
            <h3 className="mt-1 font-heading text-lg leading-snug text-foreground">{listing.title}</h3>
          </div>
          <p className="shrink-0 text-right font-heading text-xl leading-none text-foreground">{price}</p>
        </div>
        <p className="text-sm text-muted-foreground">{listing.locality || (lang === "hi" ? "इलाका स्निपेट में नहीं" : "Locality not in the snippet")}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={listing.riskLevel === "high" ? "destructive" : listing.riskLevel === "low" ? "secondary" : "outline"}>
            {t.risk[listing.riskLevel]}
          </Badge>
          {listing.risks.map((risk) => (
            <Badge key={risk} variant="outline">
              {t.riskDetail[risk]}
            </Badge>
          ))}
          {listing.demo ? <Badge variant="outline">{t.sample}</Badge> : null}
          <Badge variant="secondary">
            {listing.score} {t.fit}
          </Badge>
        </div>

        {scamResult ? (
          <div className={`rounded-lg px-3 py-2 text-sm leading-5 text-foreground border ${scamResult.level === "high" ? "bg-destructive/10 border-destructive text-destructive" : scamResult.level === "medium" ? "bg-amber-100/50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
            <span className="font-medium block mb-1">Scam Guard Risk: {scamResult.riskScore}/100</span>
            {scamResult.reasons.join(", ")}
          </div>
        ) : null}

        <p className="rounded-lg bg-muted px-3 py-2 text-sm leading-5 text-foreground">
          <span className="font-medium">{t.why}. </span>
          {listing.why}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="h-11 flex-1" onClick={() => onContact(listing)}>
            {t.contact}
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={() => onSave(listing)}>
            {saved ? t.savedVisit : t.saveVisit}
          </Button>
        </div>
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          {t.openListing}
        </a>
      </div>
    </Card>
  )
}
