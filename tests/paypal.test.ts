import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("lib/paypal", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
    global.fetch = undefined as any
  })

  it("isMockMode should be true if keys are missing", async () => {
    delete process.env.PAYPAL_CLIENT_ID
    delete process.env.PAYPAL_CLIENT_SECRET
    const { isMockMode } = await import("@/lib/paypal")
    expect(isMockMode()).toBe(true)
  })

  it("mock mode creates a mock order", async () => {
    delete process.env.PAYPAL_CLIENT_ID
    delete process.env.PAYPAL_CLIENT_SECRET
    const { createOrder } = await import("@/lib/paypal")

    const order = await createOrder("10.00")
    expect(order.id).toMatch(/^MOCK_ORDER_ID_/)
    expect(order.status).toBe("CREATED")
  })

  it("mock mode captures a mock order", async () => {
    delete process.env.PAYPAL_CLIENT_ID
    delete process.env.PAYPAL_CLIENT_SECRET
    const { captureOrder } = await import("@/lib/paypal")

    const capture = await captureOrder("MOCK_ORDER_123")
    expect(capture.id).toBe("MOCK_ORDER_123")
    expect(capture.status).toBe("COMPLETED")
  })

  it("mock mode refunds a mock payment", async () => {
    delete process.env.PAYPAL_CLIENT_ID
    delete process.env.PAYPAL_CLIENT_SECRET
    const { refundPayment } = await import("@/lib/paypal")

    const refund = await refundPayment("MOCK_CAPTURE_123")
    expect(refund.id).toBe("MOCK_REFUND_ID")
    expect(refund.status).toBe("COMPLETED")
  })

  describe("real mode", () => {
    it("fetches a token and creates an order", async () => {
      // Stub the environment for "real mode"
      process.env.PAYPAL_CLIENT_ID = "real_client"
      process.env.PAYPAL_CLIENT_SECRET = "real_secret"

      const fetchMock = vi.fn().mockImplementation((url, options) => {
        if (url.endsWith("/oauth2/token")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: "real_token", expires_in: 3600 }),
          })
        }
        if (url.endsWith("/v2/checkout/orders")) {
          // check request shape
          const body = JSON.parse(options.body)
          expect(body.purchase_units[0].amount.value).toBe("12.50")
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: "REAL_ORDER_ID", status: "CREATED" }),
          })
        }
        return Promise.reject(new Error(`Unhandled URL: ${url}`))
      })
      global.fetch = fetchMock

      const { createOrder } = await import("@/lib/paypal")
      const order = await createOrder("12.50")

      expect(order.id).toBe("REAL_ORDER_ID")
      expect(order.status).toBe("CREATED")
      expect(fetchMock).toHaveBeenCalledTimes(2) // Once for token, once for order
    })
  })
})
