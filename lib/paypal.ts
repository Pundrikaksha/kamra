import "server-only"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox"
const KAMRA_SESSION_SECRET = process.env.KAMRA_SESSION_SECRET

export function isMockMode(): boolean {
  return !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET
}

function getBaseUrl(): string {
  if (PAYPAL_ENV === "production") {
    return "https://api-m.paypal.com"
  }
  return "https://api-m.sandbox.paypal.com"
}

let cachedToken: string | null = null
let tokenExpiryTime: number | null = null

export async function getAccessToken(): Promise<string> {
  if (isMockMode()) {
    return "mock_access_token"
  }

  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedToken
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")
  const response = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`)
  }

  const data = await response.json()
  cachedToken = data.access_token
  // Subtract a small buffer (e.g. 5 minutes) from the expiry time
  tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000

  return data.access_token
}

export async function createOrder(amount: string, currency: string = "USD", intent: "CAPTURE" | "AUTHORIZE" = "CAPTURE"): Promise<any> {
  if (isMockMode()) {
    return {
      id: "MOCK_ORDER_ID_" + Math.random().toString(36).substring(7).toUpperCase(),
      status: "CREATED",
      links: [
        { href: "https://mock.paypal.com/checkout", rel: "approve", method: "GET" }
      ]
    }
  }

  const token = await getAccessToken()
  const response = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent,
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create order: ${await response.text()}`)
  }

  return response.json()
}

export async function captureAuthorization(authorizationId: string): Promise<any> {
  if (isMockMode()) {
    return {
      id: "MOCK_CAPTURE_ID_" + Math.random().toString(36).substring(7).toUpperCase(),
      status: "COMPLETED",
    }
  }

  const token = await getAccessToken()
  const response = await fetch(`${getBaseUrl()}/v2/payments/authorizations/${authorizationId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to capture authorization: ${await response.text()}`)
  }

  return response.json()
}

export async function captureOrder(orderId: string): Promise<any> {
  if (isMockMode()) {
    return {
      id: orderId,
      status: "COMPLETED",
      payer: {
        email_address: "mock@example.com"
      }
    }
  }

  const token = await getAccessToken()
  const response = await fetch(`${getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to capture order: ${await response.text()}`)
  }

  return response.json()
}

export async function authorizeOrder(orderId: string): Promise<any> {
  if (isMockMode()) {
    return {
      id: orderId,
      status: "COMPLETED",
      purchase_units: [{
        payments: {
          authorizations: [{ id: "MOCK_AUTH_ID" }]
        }
      }]
    }
  }

  const token = await getAccessToken()
  const response = await fetch(`${getBaseUrl()}/v2/checkout/orders/${orderId}/authorize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to authorize order: ${await response.text()}`)
  }

  return response.json()
}

export async function voidAuthorization(authorizationId: string): Promise<any> {
  if (isMockMode()) {
    return {
      status: "VOIDED"
    }
  }

  const token = await getAccessToken()
  const response = await fetch(`${getBaseUrl()}/v2/payments/authorizations/${authorizationId}/void`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to void authorization: ${await response.text()}`)
  }

  if (response.status === 204) {
      return { status: "VOIDED" }
  }

  return response.json()
}

export async function refundPayment(captureId: string, amount?: string, currency: string = "USD"): Promise<any> {
  if (isMockMode()) {
    return {
      id: "MOCK_REFUND_ID",
      status: "COMPLETED"
    }
  }

  const token = await getAccessToken()
  const body = amount ? { amount: { value: amount, currency_code: currency } } : {}
  const response = await fetch(`${getBaseUrl()}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Failed to refund payment: ${await response.text()}`)
  }

  return response.json()
}
