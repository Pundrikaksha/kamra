"use client"

import { useEffect, useState } from "react"
import { Checklist } from "@/components/checklist"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { getCopy } from "@/lib/i18n"
import type { Lang, Requirement, ScoredListing } from "@/lib/types"

export function ContactSheet({
  listing,
  requirement,
  lang,
  onClose,
}: {
  listing: ScoredListing | null
  requirement: Requirement
  lang: Lang
  onClose: () => void
}) {
  const t = getCopy(lang)
  const [text, setText] = useState("")
  const [approved, setApproved] = useState(false)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!listing) return
    let cancel = false
    fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang,
        requirement,
        listing: {
          title: listing.title,
          locality: listing.locality,
          platform: listing.platform,
          price: listing.price,
          url: listing.url,
        },
      }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { text?: string; message?: string }
        if (!response.ok || !data.text) throw new Error(data.message || "draft failed")
        if (!cancel) {
          setText(data.text)
          setStatus("ready")
        }
      })
      .catch(() => {
        if (!cancel) setStatus("error")
      })
    return () => {
      cancel = true
    }
  }, [listing, lang, requirement])

  function openApproved(kind: "link" | "whatsapp" | "sms") {
    if (!approved || !listing || !text) return
    if (kind === "link") {
      navigator.clipboard?.writeText(text).catch(() => {})
      window.open(listing.url, "_blank", "noopener,noreferrer")
      return
    }
    if (kind === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
      return
    }
    window.location.href = `sms:?&body=${encodeURIComponent(text)}`
  }

  return (
    <Sheet open={Boolean(listing)} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="pr-10 text-left">
          <SheetTitle className="font-heading text-xl">{t.draftTitle}</SheetTitle>
          <SheetDescription>{t.approveHint}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          {status === "loading" ? <p className="text-sm text-muted-foreground">{t.drafting}</p> : null}
          {status === "error" ? <p className="text-sm text-destructive">{t.error}</p> : null}
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            className="min-h-40 text-base"
            aria-label={t.draftTitle}
            disabled={status !== "ready"}
          />
          <Label className="items-start gap-3 rounded-xl border border-border bg-muted/60 p-3 text-sm leading-5">
            <Checkbox
              className="mt-0.5"
              checked={approved}
              onCheckedChange={(checked) => setApproved(checked === true)}
              disabled={status !== "ready"}
            />
            <span>{t.approveLabel}</span>
          </Label>
          <div className="grid gap-2">
            <Button type="button" className="h-11" disabled={!approved} onClick={() => openApproved("link")}>
              {t.openApproved}
            </Button>
            <Button type="button" variant="outline" className="h-11" disabled={!approved} onClick={() => openApproved("whatsapp")}>
              {t.whatsapp}
            </Button>
            <Button type="button" variant="outline" className="h-11" disabled={!approved} onClick={() => openApproved("sms")}>
              {t.sms}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={!text}
              onClick={() => {
                navigator.clipboard?.writeText(text).then(() => {
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 1500)
                })
              }}
            >
              {copied ? t.copied : t.copy}
            </Button>
          </div>
          <section>
            <h3 className="mb-3 font-heading text-lg">{t.beforePay}</h3>
            <Checklist lang={lang} city={requirement.city} />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
