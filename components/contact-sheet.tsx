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
import type { ScamGuardResult } from "@/lib/scam-guard"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

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
  const [scamResult, setScamResult] = useState<ScamGuardResult | null>(null)

  const [clientId, setClientId] = useState<string | null>(null)
  const [mockMode, setMockMode] = useState<boolean>(false)

  const [depositState, setDepositState] = useState<"idle" | "authorizing" | "authorized" | "capturing" | "voiding">("idle")
  const [authId, setAuthId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/paypal/config")
      .then((res) => res.json())
      .then((data) => {
        setClientId(data.clientId)
        setMockMode(data.mockMode)
      })
      .catch((err) => console.error("Failed to load paypal config", err))
  }, [])

  useEffect(() => {
    if (!listing) return
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
            <h3 className="mb-3 font-heading text-lg">Protected Deposit</h3>
            {scamResult?.level === "high" ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm">
                <p>Deposit blocked due to high scam risk.</p>
                <p className="mt-1 font-medium">{scamResult.reasons.join(", ")}</p>
              </div>
            ) : depositState === "authorized" ? (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <p className="text-sm font-medium text-emerald-700">Deposit Authorized</p>
                <p className="text-xs text-muted-foreground">Funds are held safely. Release them after a successful visit, or cancel if the place isn't right.</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={async () => {
                      if (!authId) return
                      setDepositState("capturing")
                      try {
                        await fetch("/api/deposit/capture", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ authorizationId: authId }),
                        })
                        setDepositState("idle")
                        setAuthId(null)
                        alert("Deposit released to owner.")
                      } catch (err) {
                        console.error(err)
                        setDepositState("authorized")
                      }
                    }}
                  >
                    I visited, release
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={async () => {
                      if (!authId) return
                      setDepositState("voiding")
                      try {
                        await fetch("/api/deposit/void", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ authorizationId: authId }),
                        })
                        setDepositState("idle")
                        setAuthId(null)
                        alert("Deposit cancelled.")
                      } catch (err) {
                        console.error(err)
                        setDepositState("authorized")
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : depositState === "authorizing" || depositState === "capturing" || depositState === "voiding" ? (
               <div className="text-sm text-muted-foreground">Processing...</div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-4">Propose a refundable ₹500 token deposit via PayPal to hold this listing. We won't release funds until you approve.</p>
                {mockMode ? (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={async () => {
                      setDepositState("authorizing")
                      try {
                        const res = await fetch("/api/deposit/create", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ amount: "500", currency: "INR" }),
                        })
                        const order = await res.json()
                        const authRes = await fetch("/api/deposit/authorize", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ orderId: order.id }),
                        })
                        const authData = await authRes.json()
                        setAuthId(authData.purchase_units[0].payments.authorizations[0].id)
                        setDepositState("authorized")
                      } catch (err) {
                        console.error(err)
                        setDepositState("idle")
                      }
                    }}
                  >
                    Simulate Deposit
                  </Button>
                ) : clientId && (
                  <PayPalScriptProvider options={{ clientId, currency: "INR" }}>
                    <PayPalButtons
                      createOrder={async () => {
                        const res = await fetch("/api/deposit/create", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ amount: "500", currency: "INR" }),
                        })
                        const order = await res.json()
                        return order.id
                      }}
                      onApprove={async (data) => {
                        setDepositState("authorizing")
                        try {
                          const authRes = await fetch("/api/deposit/authorize", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: data.orderID }),
                          })
                          const authData = await authRes.json()
                          const id = authData.purchase_units[0].payments.authorizations[0].id
                          setAuthId(id)
                          setDepositState("authorized")
                        } catch (err) {
                          console.error(err)
                          setDepositState("idle")
                        }
                      }}
                    />
                  </PayPalScriptProvider>
                )}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 font-heading text-lg">{t.beforePay}</h3>
            <Checklist lang={lang} city={requirement.city} />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
