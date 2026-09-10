import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Plus,
  Download,
  Share2,
  QrCode,
  X,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Instagram,
  MessageCircle,
  Layers,
  Copy,
  Nfc,
} from "lucide-react";
import QRCode from "qrcode";
import { destination, vcard, download } from "./contact";
import "./style.css";
import publishedProfiles from "./profiles.json";
const icons = {
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  instagram: Instagram,
  link: Globe,
};
const types = {
  link: "Website",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  phone: "Phone",
  email: "Email",
};
const profiles = publishedProfiles;
function App() {
  const [id, setId] = useState(
    new URLSearchParams(location.search).get("p") || profiles[0].id,
  );
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(false);
  const [qr, setQr] = useState("");
  const toastTimer = useRef(),
    dialogRef = useRef();
  const p = profiles.find((x) => x.id === id) || profiles[0];
  const notify = (m) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  };
  useEffect(() => {
    document.title = `${p.name} | Abraham’s Network`;
  }, [p.name]);
  useEffect(() => {
    const f = () =>
      setId(new URLSearchParams(location.search).get("p") || profiles[0].id);
    window.addEventListener("popstate", f);
    return () => window.removeEventListener("popstate", f);
  }, [profiles]);
  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);
  function choose(next) {
    setId(next);
    const u = new URL(location.href);
    u.searchParams.set("p", next);
    history.replaceState({}, "", u);
  }
  function profileURL() {
    const u = new URL(location.href);
    u.search = "";
    u.searchParams.set("p", p.id);
    u.hash = "";
    return u.href;
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(profileURL());
      notify("Link copied.");
    } catch {
      notify("Unable to copy. Select the link in the QR window instead.");
    }
  }
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({ title: p.name, url: profileURL() });
      else await copy();
    } catch (e) {
      if (e.name !== "AbortError") notify("Unable to share this profile.");
    }
  }
  async function openQR() {
    try {
      setQr(
        await QRCode.toDataURL(profileURL(), {
          width: 640,
          margin: 2,
          color: { dark: "#172a43", light: "#ffffff" },
        }),
      );
      setModal(true);
    } catch {
      notify("Unable to generate the QR code.");
    }
  }
  const visible = p.links.filter((l) => l.visible && destination(l));
  const links = visible;
  const initials = p.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
  return (
    <div style={{ "--accent": p.accent }}>
      <header className="topbar">
        <a
          className="brand"
          href={import.meta.env.BASE_URL}
          aria-label="Abraham’s Network home"
        >
          <span className="brand-symbol">a.</span>
          <span className="brand-name">
            Abraham’s <strong>Network</strong>
          </span>
        </a>
      </header>
      <div className="workspace">
        <main className="profile-shell">
          <div className="profile-navigation">
            <div className="tabs" role="tablist" aria-label="Profiles">
              {profiles.map((x, i) => (
                <button
                  role="tab"
                  id={`tab-${x.id}`}
                  aria-controls="profile-panel"
                  aria-selected={p.id === x.id}
                  tabIndex={p.id === x.id ? 0 : -1}
                  key={x.id}
                  onClick={() => choose(x.id)}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                    ) {
                      e.preventDefault();
                      const n =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? profiles.length - 1
                            : (i +
                                (e.key === "ArrowRight" ? 1 : -1) +
                                profiles.length) %
                              profiles.length;
                      choose(profiles[n].id);
                      document.getElementById(`tab-${profiles[n].id}`)?.focus();
                    }
                  }}
                >
                  {x.tab}
                </button>
              ))}
            </div>
          </div>
          <article
            id="profile-panel"
            role="tabpanel"
            aria-labelledby={`tab-${p.id}`}
            key={p.id}
          >
            <div
              className="cover"
              style={p.cover ? { backgroundImage: `url(${p.cover})` } : {}}
            >
              {!p.cover && (
                <>
                  <div className="architecture arch-one" />
                  <div className="architecture arch-two" />
                  <div className="cover-caption">
                    ONE PLACE.
                    <br />
                    ALL MY CONNECTIONS.
                  </div>
                  <span className="cover-index">
                    {p.tab.toUpperCase()} /{" "}
                    {String(profiles.indexOf(p) + 1).padStart(3, "0")}
                  </span>
                </>
              )}
              <span className="nfc-badge">
                <Nfc size={14} /> DIGITAL BUSINESS CARD
              </span>
            </div>
            <section className="identity">
              <div className="identity-top">
                <div className="avatar">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} />
                  ) : (
                    <span>{initials}</span>
                  )}
                  <span className="availability" aria-label="Active profile" />
                </div>
                <div className="identity-actions">
                  <button
                    className="icon-button"
                    aria-label="Show QR code"
                    onClick={openQR}
                  >
                    <QrCode size={21} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Share profile"
                    onClick={share}
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              <div className="eyebrow">YOUR WORLD, CONNECTED</div>
              <h1>
                {p.name}
                <span className="name-dot">.</span>
              </h1>
              {p.role && <p className="role">{p.role}</p>}
              {p.bio && <p className="bio">{p.bio}</p>}
              {p.location && (
                <p className="location">
                  <span /> {p.location}
                </p>
              )}
              <button
                className="save-contact contact-secondary"
                title="Download a contact file to add this person to your address book"
                onClick={() => {
                  download(
                    vcard(p),
                    `${p.name}.vcf`,
                    "text/vcard;charset=utf-8",
                  );
                  notify(
                    "Contact file downloaded. Open it to add this profile to your address book.",
                  );
                }}
              >
                <Plus size={21} />
                Save contact
                <Download size={18} />
              </button>
            </section>
            <section className="links-section">
              <div className="section-heading">
                <h2>My links</h2>
                <span>{String(links.length).padStart(2, "0")}</span>
              </div>
              {links.length ? (
                links.map((l, i) => {
                  const Icon = icons[l.type] || Globe;
                  return (
                    <a
                      className="link-card"
                      key={l.id}
                      href={destination(l)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="link-icon">
                        <Icon size={23} />
                      </span>
                      <span className="link-text">
                        <strong>{l.label}</strong>
                        <small>{l.description || types[l.type]}</small>
                      </span>
                      <ArrowUpRight size={19} />
                    </a>
                  );
                })
              ) : (
                <div className="empty-links">
                  <Layers size={23} />
                  <p>Your next connection starts here.</p>
                  <span>More links are coming soon.</span>
                </div>
              )}
            </section>
            <footer className="profile-footer">
              <span>GOOD PEOPLE. GREAT CONNECTIONS.</span>
              <span className="footer-brand">Abraham’s Network</span>
            </footer>
          </article>
        </main>
      </div>
      <dialog
        ref={dialogRef}
        onCancel={() => setModal(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(false);
        }}
      >
        <div className="dialog-header">
          <span className="eyebrow">LET’S CONNECT</span>
          <button
            className="icon-button"
            aria-label="Close QR code"
            onClick={() => setModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <h2>Scan to connect.</h2>
        <p>Find {p.name} with one quick scan.</p>
        {qr && <img className="qr" src={qr} alt={`QR code for ${p.name}`} />}
        <input
          aria-label="Profile link"
          readOnly
          value={profileURL()}
          onFocus={(e) => e.target.select()}
        />
        <button className="save-contact" onClick={copy}>
          <Copy size={18} />
          Copy link
        </button>
        <button
          className="text-button"
          onClick={() => {
            const a = document.createElement("a");
            a.href = qr;
            a.download = `qr-${p.tab}.png`;
            a.click();
          }}
        >
          Download QR <Download size={16} />
        </button>
      </dialog>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
