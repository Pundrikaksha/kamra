import { describe, expect, it } from "vitest"
import { createOrder, authorizeOrder, captureAuthorization, voidAuthorization } from "@/lib/paypal"

describe("deposit flow in mock mode", () => {
  it("creates an authorize order", async () => {
    const order = await createOrder("500", "INR", "AUTHORIZE")
    expect(order.status).toBe("CREATED")
    expect(order.id).toContain("MOCK_ORDER_ID_")
  })

  it("authorizes the order", async () => {
    const auth = await authorizeOrder("ORDER_123")
    expect(auth.status).toBe("COMPLETED")
    expect(auth.purchase_units[0].payments.authorizations[0].id).toBe("MOCK_AUTH_ID")
  })

  it("captures the authorization", async () => {
    const capture = await captureAuthorization("MOCK_AUTH_ID")
    expect(capture.status).toBe("COMPLETED")
  })

  it("voids the authorization", async () => {
    const result = await voidAuthorization("MOCK_AUTH_ID")
    expect(result.status).toBe("VOIDED")
  })
})
