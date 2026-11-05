import { NextResponse } from "next/server"
import { isMockMode, getAccessToken } from "@/lib/paypal"

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox"

function getBaseUrl(): string {
  if (PAYPAL_ENV === "production") {
    return "https://api-m.paypal.com"
  }
  return "https://api-m.sandbox.paypal.com"
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()

    // In mock mode, just log and accept
    if (isMockMode() || !PAYPAL_WEBHOOK_ID) {
      console.log("Mock mode webhook received", bodyText)
      return NextResponse.json({ status: "success", mocked: true })
    }

    const headers = {
        "PAYPAL-AUTH-ALGO": request.headers.get("PAYPAL-AUTH-ALGO") || "",
        "PAYPAL-CERT-URL": request.headers.get("PAYPAL-CERT-URL") || "",
        "PAYPAL-TRANSMISSION-ID": request.headers.get("PAYPAL-TRANSMISSION-ID") || "",
        "PAYPAL-TRANSMISSION-SIG": request.headers.get("PAYPAL-TRANSMISSION-SIG") || "",
        "PAYPAL-TRANSMISSION-TIME": request.headers.get("PAYPAL-TRANSMISSION-TIME") || "",
    }

    const token = await getAccessToken()

    const verifyRes = await fetch(`${getBaseUrl()}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            auth_algo: headers["PAYPAL-AUTH-ALGO"],
            cert_url: headers["PAYPAL-CERT-URL"],
            transmission_id: headers["PAYPAL-TRANSMISSION-ID"],
            transmission_sig: headers["PAYPAL-TRANSMISSION-SIG"],
            transmission_time: headers["PAYPAL-TRANSMISSION-TIME"],
            webhook_id: PAYPAL_WEBHOOK_ID,
            webhook_event: JSON.parse(bodyText)
        })
    })

    const verifyData = await verifyRes.json()

    if (verifyData.verification_status !== "SUCCESS") {
        console.error("Webhook signature verification failed:", verifyData)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("Real webhook received and verified, event:", JSON.parse(bodyText).event_type)

    const event = JSON.parse(bodyText)
    switch(event.event_type) {
        case "CHECKOUT.ORDER.APPROVED":
        case "PAYMENT.AUTHORIZATION.CREATED":
        case "PAYMENT.AUTHORIZATION.VOIDED":
        case "PAYMENT.CAPTURE.COMPLETED":
        case "PAYMENT.CAPTURE.REFUNDED":
            console.log(`Handled webhook event: ${event.event_type}`)
            break
        default:
            console.log(`Unhandled webhook event: ${event.event_type}`)
    }

    return NextResponse.json({ status: "success" })
  } catch (error: any) {
    console.error("Failed to handle webhook:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
