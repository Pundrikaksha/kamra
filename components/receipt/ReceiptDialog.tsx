"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ReceiptDialogProps {
  captureId: string
  amount: string
  reason: "pass" | "deposit"
  lang: "en" | "hi"
}

const copy = {
  en: {
    loading: "Loading receipt...",
    viewReceipt: "View AI Receipt",
    refundReq: "Request Refund / Dispute",
    refundSuccess: "Refund Processed Successfully",
    refundFail: "Refund Failed",
    generatingDispute: "Drafting dispute...",
    disputeDraft: "Dispute Draft:",
    submitRefund: "Confirm & Submit Refund",
  },
  hi: {
    loading: "रसीद लोड हो रही है...",
    viewReceipt: "AI रसीद देखें",
    refundReq: "रिफंड / विवाद का अनुरोध करें",
    refundSuccess: "रिफंड सफलतापूर्वक संसाधित",
    refundFail: "रिफंड विफल",
    generatingDispute: "विवाद ड्राफ्ट हो रहा है...",
    disputeDraft: "विवाद ड्राफ्ट:",
    submitRefund: "पुष्टि करें और रिफंड सबमिट करें",
  },
}

export function ReceiptDialog({ captureId, amount, reason, lang }: ReceiptDialogProps) {
  const t = copy[lang]
  const [receiptText, setReceiptText] = useState("")
  const [loading, setLoading] = useState(false)
  const [disputeText, setDisputeText] = useState("")
  const [refundStatus, setRefundStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [view, setView] = useState<"idle" | "receipt" | "dispute">("idle")

  const handleLoadReceipt = async () => {
    setLoading(true)
    setView("receipt")
    try {
      const res = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captureId, amount, type: "receipt", reason }),
      })
      const data = await res.json()
      setReceiptText(data.text || "Failed to load receipt")
    } catch (err) {
      setReceiptText("Error loading receipt")
    }
    setLoading(false)
  }

  const handleLoadDispute = async () => {
    setLoading(true)
    setView("dispute")
    try {
      const res = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captureId, type: "dispute", reason: "Dissatisfied with service" }),
      })
      const data = await res.json()
      setDisputeText(data.text || "Failed to load dispute draft")
    } catch (err) {
      setDisputeText("Error loading dispute draft")
    }
    setLoading(false)
  }

  const handleRefund = async () => {
    setRefundStatus("loading")
    try {
      const res = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captureId }),
      })
      if (res.ok) {
        setRefundStatus("success")
      } else {
        setRefundStatus("error")
      }
    } catch (err) {
      setRefundStatus("error")
    }
  }

  if (view === "idle") {
    return (
      <div className="flex gap-4 mt-6">
        <Button onClick={handleLoadReceipt} variant="outline">{t.viewReceipt}</Button>
        <Button onClick={handleLoadDispute} variant="destructive">{t.refundReq}</Button>
      </div>
    )
  }

  return (
    <div className="mt-6 p-4 border rounded-xl bg-gray-50 text-sm">
      {loading ? (
        <p className="text-gray-500">{t.loading}</p>
      ) : view === "receipt" ? (
        <div className="whitespace-pre-wrap font-mono text-gray-700">{receiptText}</div>
      ) : (
        <div className="space-y-4">
          <p className="font-medium text-gray-800">{t.disputeDraft}</p>
          <div className="whitespace-pre-wrap p-3 bg-white border rounded text-gray-600">{disputeText}</div>

          {refundStatus === "idle" && (
            <Button onClick={handleRefund} variant="destructive">{t.submitRefund}</Button>
          )}
          {refundStatus === "loading" && <p>Processing...</p>}
          {refundStatus === "success" && <p className="text-green-600 font-medium">{t.refundSuccess}</p>}
          {refundStatus === "error" && <p className="text-red-600 font-medium">{t.refundFail}</p>}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button onClick={() => setView("idle")} variant="ghost" size="sm">Close</Button>
      </div>
    </div>
  )
}
