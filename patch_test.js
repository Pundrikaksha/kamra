const fs = require('fs');
const file = 'tests/paypal.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'it("mock mode refunds a mock payment", async () => {\n    delete process.env.PAYPAL_CLIENT_ID\n    delete process.env.PAYPAL_CLIENT_SECRET\n    const { refundPayment } = await import("@/lib/paypal")\n\n    const refund = await refundPayment("MOCK_CAPTURE_123")\n    expect(refund.id).toBe("MOCK_REFUND_ID")\n    expect(refund.status).toBe("COMPLETED")\n  })',
  'describe("refund mock", () => {\n    it("mock mode refunds a mock payment", async () => {\n      delete process.env.PAYPAL_CLIENT_ID\n      delete process.env.PAYPAL_CLIENT_SECRET\n      const { refundPayment } = await import("@/lib/paypal")\n\n      const refund = await refundPayment("MOCK_CAPTURE_123")\n      expect(refund.id).toBe("MOCK_REFUND_ID")\n      expect(refund.status).toBe("COMPLETED")\n    })\n  })'
);

fs.writeFileSync(file, content);
console.log('Patched tests/paypal.test.ts');
