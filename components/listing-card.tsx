"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getCopy } from "@/lib/i18n"
import type { Lang, ScoredListing } from "@/lib/types"

export function ListingCard({
  listing,
  lang,
  saved,
  onContact,
  onSave,
}: {
  listing: ScoredListing
  lang: Lang
  saved: boolean
  onContact: (listing: ScoredListing) => void
  onSave: (listing: ScoredListing) => void
}) {
  const t = getCopy(lang)
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
