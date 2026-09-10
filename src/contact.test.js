import { test } from "node:test";
import assert from "node:assert/strict";
import { destination, vcard } from "./contact.js";
test("rejects executable links and invalid contacts", () => {
  assert.equal(
    destination({ type: "link", value: "javascript:alert(1)" }),
    null,
  );
  assert.equal(destination({ type: "email", value: "bad" }), null);
  assert.equal(destination({ type: "phone", value: "123abc" }), null);
  assert.equal(
    destination({ type: "link", value: "example.com" }),
    "https://example.com/",
  );
});
test("normalizes phone and WhatsApp", () => {
  assert.equal(
    destination({ type: "phone", value: "+1 (801) 555-1234" }),
    "tel:+18015551234",
  );
  assert.equal(
    destination({ type: "whatsapp", value: "+51 999 111 222" }),
    "https://wa.me/51999111222",
  );
});
test("vCard escapes injected records and excludes hidden contacts", () => {
  const c = vcard({
    name: "A;B\nTEL:bad",
    links: [{ type: "email", value: "a@example.com", visible: false }],
  });
  assert.ok(c.includes("FN:A\\;B\\nTEL:bad"));
  assert.ok(!c.includes("EMAIL:"));
  assert.ok(c.endsWith("END:VCARD\r\n"));
});
