"use client"

import { useEffect, useState } from "react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { ReceiptDialog } from "@/components/receipt/ReceiptDialog"

export default function KamraPassPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [mockMode, setMockMode] = useState<boolean>(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading")
  const [captureId, setCaptureId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/paypal/config")
      .then((res) => res.json())
      .then((data) => {
        setClientId(data.clientId)
        setMockMode(data.mockMode)
        setStatus("idle")
      })
      .catch((err) => {
        console.error("Failed to load config", err)
        setStatus("error")
      })
  }, [])

  const handleSimulatePayment = async () => {
    setStatus("loading")
    try {
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: "4.99" }),
      })
      const order = await createRes.json()

      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })
      const capture = await captureRes.json()

      if (capture.status === "COMPLETED") {
        setCaptureId(capture.id)
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch (err) {
      console.error("Simulation failed", err)
      setStatus("error")
    }
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium">Loading Pass details...</p>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 bg-green-50 rounded-xl border border-green-200 shadow-sm">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Payment Successful!</h2>
        <p className="text-green-800">You now have unlimited access to Kamra live AI searches.</p>

        {captureId && (
          <div className="mt-8 pt-6 border-t border-green-200/60">
            <ReceiptDialog captureId={captureId} amount="4.99" reason="pass" lang="en" />
          </div>
        )}

        <a href="/" className="mt-8 inline-block px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm w-full">Return Home</a>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-md mx-auto mt-12 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold mb-2">Kamra Pass</h1>
      <p className="text-gray-600 mb-8">Unlock unlimited live AI searches and owner-message drafts for a one-time fee of $4.99.</p>

      {mockMode ? (
        <div className="text-center">
          <div className="mb-4 text-sm text-amber-600 bg-amber-50 p-3 rounded">
            Running in Mock Mode (No real payments)
          </div>
          <button
            onClick={handleSimulatePayment}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Simulate Payment ($4.99)
          </button>
        </div>
      ) : (
        clientId && (
          <PayPalScriptProvider options={{ clientId: clientId, currency: "USD" }}>
            <PayPalButtons
              createOrder={async () => {
                const res = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: "4.99" }),
                })
                const order = await res.json()
                return order.id
              }}
              onApprove={async (data) => {
                const res = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.orderID }),
                })
                const capture = await res.json()
                if (capture.status === "COMPLETED") {
                  setCaptureId(capture.id)
                  setStatus("success")
                } else {
                  setStatus("error")
                }
              }}
              onError={(err) => {
                console.error("PayPal Error", err)
                setStatus("error")
              }}
            />
          </PayPalScriptProvider>
        )
      )}

      {status === "error" && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm font-medium">
          Something went wrong with the payment. Please try again later.
        </div>
      )}
    </div>
  )
}
