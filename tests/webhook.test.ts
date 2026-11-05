import { describe, expect, it } from "vitest"
import { POST } from "../app/api/paypal/webhook/route"

describe("webhook verification", () => {
  it("mock mode responds with success", async () => {
    const req = new Request("http://localhost/api/paypal/webhook", {
      method: "POST",
      body: JSON.stringify({ event_type: "CHECKOUT.ORDER.APPROVED" })
    })
    const res = await POST(req)
    const data = await res.json()
    expect(data.status).toBe("success")
  })
})
