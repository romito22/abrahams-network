export function destination(link) {
  const v = link.value.trim();
  if (!v) return null;
  if (link.type === "email")
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? `mailto:${v}` : null;
  if (link.type === "phone" || link.type === "whatsapp") {
    const n = v.replace(/[\s()+.-]/g, "");
    if (!/^\d{5,15}$/.test(n)) return null;
    return link.type === "phone" ? `tel:+${n}` : `https://wa.me/${n}`;
  }
  try {
    const u = new URL(/^[\w+.-]+:/.test(v) ? v : `https://${v}`);
    return ["https:", "http:"].includes(u.protocol) && u.hostname.includes(".")
      ? u.href
      : null;
  } catch {
    return null;
  }
}
const escape = (v) =>
  String(v || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function vcard(p) {
  const rows = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(p.name)}`,
    `TITLE:${escape(p.role)}`,
    `NOTE:${escape(p.bio)}`,
  ];
  for (const l of p.links.filter((l) => l.visible && destination(l))) {
    if (l.type === "email") rows.push(`EMAIL:${escape(l.value)}`);
    else if (l.type === "phone") rows.push(`TEL:${escape(l.value)}`);
    else if (l.type !== "whatsapp") rows.push(`URL:${escape(destination(l))}`);
  }
  return [...rows, "END:VCARD", ""].join("\r\n");
}
export function download(data, name, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
