import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
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
  Settings2,
  Eye,
  Trash2,
  Camera,
  Copy,
  LogOut,
  Nfc,
} from "lucide-react";
import QRCode from "qrcode";
import { destination, vcard, download } from "./contact";
import {
  configured,
  owner,
  watchUser,
  login,
  logout,
  readPublic,
  publish,
} from "./cloud";
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
const seed = publishedProfiles;
const draftMode =
  import.meta.env.DEV ||
  new URLSearchParams(location.search).get("edit") === "1";
function initial() {
  if (!draftMode) return seed;
  try {
    const d = JSON.parse(
      localStorage.getItem("abrahams-network-draft") ||
        localStorage.getItem("conecta-draft"),
    );
    if (
      Array.isArray(d) &&
      d.length &&
      d.every((p) => p.id && Array.isArray(p.links))
    )
      return d
        .filter(
          (p) =>
            !(
              p.id === "object" &&
              p.name === "Object" &&
              !p.links.length &&
              !p.avatar &&
              !p.cover
            ),
        )
        .map((p) => ({
          ...p,
          tab: p.id === "abraham" && p.tab === "AR" ? "Personal" : p.tab,
          accent:
            p.accent === "#566344"
              ? "#2563b8"
              : p.accent === "#555c62"
                ? "#315b91"
                : p.accent,
        }));
  } catch {}
  return seed;
}
function App() {
  const [profiles, setProfiles] = useState(initial),
    [id, setId] = useState(
      new URLSearchParams(location.search).get("p") || "abraham",
    ),
    [editing, setEditing] = useState(
      new URLSearchParams(location.search).get("edit") === "1",
    ),
    [user, setUser] = useState(null),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState(false),
    [qr, setQr] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(configured),
    [failure, setFailure] = useState("");
  const toastTimer = useRef(),
    dialogRef = useRef();
  const p = profiles.find((x) => x.id === id) || profiles[0];
  const canEdit =
    (!configured && draftMode) || (configured && user?.uid === owner);
  const notify = (m) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  };
  useEffect(() => watchUser(setUser), []);
  useEffect(() => {
    if (configured)
      readPublic()
        .then((data) => {
          if (data?.length) setProfiles(data);
          else setFailure("No profile has been published yet.");
        })
        .catch(() =>
          setFailure(
            "Unable to load this profile. Check your connection and try again.",
          ),
        )
        .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (editing && matchMedia("(max-width: 700px)").matches)
      document
        .querySelector(".editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editing]);
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
  function change(all) {
    setProfiles(all);
    try {
      localStorage.setItem("abrahams-network-draft", JSON.stringify(all));
    } catch {
      notify("Your browser could not save this draft. Try smaller photos.");
    }
  }
  const update = (key, value) =>
    change(profiles.map((x) => (x.id === p.id ? { ...x, [key]: value } : x)));
  const updateLink = (i, key, value) =>
    update(
      "links",
      p.links.map((l, j) => (j === i ? { ...l, [key]: value } : l)),
    );
  function move(items, i, d) {
    const a = [...items];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    return a;
  }
  function addProfile() {
    const next = {
      ...seed[0],
      id: crypto.randomUUID(),
      tab: `Business ${profiles.length}`,
      name: "New business",
      avatar: "",
      cover: "",
      role: "",
      bio: "",
      location: "",
      links: [],
    };
    change([...profiles, next]);
    choose(next.id);
    notify("Business profile created. Make it yours below.");
  }
  async function upload(file, key) {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return notify("Please select an image.");
    if (file.size > 15 * 1024 * 1024)
      return notify("Please choose an image smaller than 15 MB.");
    try {
      const bitmap = await createImageBitmap(file);
      const max = key === "avatar" ? 320 : 1000;
      const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const c = document.createElement("canvas");
      c.width = bitmap.width * scale;
      c.height = bitmap.height * scale;
      c.getContext("2d").drawImage(bitmap, 0, 0, c.width, c.height);
      update(key, c.toDataURL("image/jpeg", 0.72));
      bitmap.close();
    } catch {
      notify("Unable to open this photo. Try a JPG or PNG.");
    }
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
  async function save() {
    if (profiles.some((x) => !x.name.trim() || !x.tab.trim()))
      return notify("Enter a name and tab label for every profile.");
    if (
      profiles.some((x) =>
        x.links.some((l) => l.visible && (!l.label.trim() || !destination(l))),
      )
    )
      return notify("Check the titles and destinations of your visible links.");
    if (!configured)
      return notify(
        "Draft saved on this device. Export your profiles to update the published site.",
      );
    setBusy(true);
    try {
      await publish(profiles);
      setFailure("");
      notify("Profiles published. Your NFC link stays the same.");
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
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
        <div className="top-actions">
          {!configured && draftMode && (
            <span className="local-label">DRAFT</span>
          )}
          <button
            className="icon-button"
            aria-label={editing ? "View profile" : "Edit profiles"}
            onClick={async () => {
              if (canEdit) setEditing(!editing);
              else if (!configured) {
                const url = new URL(location.href);
                url.searchParams.set("edit", "1");
                location.href = url.href;
              } else
                try {
                  await login();
                } catch {
                  notify("Unable to sign in with Google.");
                }
            }}
          >
            {editing ? <Eye size={20} /> : <Settings2 size={20} />}
          </button>
          {user && (
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={() => {
                logout();
                setEditing(false);
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>
      {loading ? (
        <main className="loading">Loading your connection…</main>
      ) : failure && !canEdit ? (
        <main className="loading">
          {failure}
          <button onClick={() => location.reload()}>Try again</button>
        </main>
      ) : (
        <div className={`workspace ${editing ? "is-editing" : ""}`}>
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
                        ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                          e.key,
                        )
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
                        document
                          .getElementById(`tab-${profiles[n].id}`)
                          ?.focus();
                      }
                    }}
                  >
                    {x.tab}
                  </button>
                ))}
              </div>
              {editing && (
                <button
                  className="add-tab icon-button"
                  aria-label="Add business"
                  onClick={addProfile}
                >
                  <Plus size={20} />
                </button>
              )}
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
                    <span
                      className="availability"
                      aria-label="Active profile"
                    />
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
                    <span>
                      {canEdit
                        ? "Add your social accounts and links in the editor."
                        : "More links are coming soon."}
                    </span>
                    {canEdit && (
                      <button onClick={() => setEditing(true)}>
                        Add my links <ArrowUpRight size={15} />
                      </button>
                    )}
                  </div>
                )}
              </section>
              <footer className="profile-footer">
                <span>GOOD PEOPLE. GREAT CONNECTIONS.</span>
                <span className="footer-brand">Abraham’s Network</span>
              </footer>
            </article>
          </main>
          {editing && canEdit && (
            <aside className="editor">
              <div className="editor-title">
                <div>
                  <span className="eyebrow">YOUR SPACE. YOUR WAY.</span>
                  <h2>Edit profile</h2>
                </div>
                <button
                  className="icon-button"
                  aria-label="Close editor"
                  onClick={() => setEditing(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="editor-notice">
                {configured
                  ? "Your changes go live when you select Publish."
                  : "Draft editor · Changes stay on this device. Export profiles, replace src/profiles.json in your repository, and commit to publish through GitHub Pages."}
              </div>
              <div className="editor-section">
                <h3>
                  01 <span>Your profiles</span>
                </h3>
                <div className="profile-controls">
                  <button onClick={addProfile}>
                    <Plus size={16} />
                    Add business
                  </button>
                  <button
                    aria-label="Move profile left"
                    disabled={profiles.indexOf(p) === 0}
                    onClick={() =>
                      change(move(profiles, profiles.indexOf(p), -1))
                    }
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    aria-label="Move profile right"
                    disabled={profiles.indexOf(p) === profiles.length - 1}
                    onClick={() =>
                      change(move(profiles, profiles.indexOf(p), 1))
                    }
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button
                    aria-label="Delete profile"
                    disabled={profiles.length === 1}
                    onClick={() => {
                      if (
                        confirm(
                          `Delete “${p.name}”? Its link will no longer select this profile.`,
                        )
                      ) {
                        const next = profiles.filter((x) => x.id !== p.id);
                        change(next);
                        choose(next[0].id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <Field
                  label="Tab name"
                  value={p.tab}
                  onChange={(v) => update("tab", v)}
                  maxLength={24}
                />
              </div>
              <div className="editor-section">
                <h3>
                  02 <span>Identity</span>
                </h3>
                <div className="photo-controls">
                  {[
                    ["avatar", "Profile photo"],
                    ["cover", "Cover photo"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="upload">
                        <Camera size={19} />
                        {label}
                        <input
                          aria-label={label}
                          type="file"
                          accept="image/*"
                          onChange={(e) => upload(e.target.files[0], key)}
                        />
                      </label>
                      {p[key] && (
                        <button
                          className="text-button"
                          onClick={() => update(key, "")}
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Field
                  label="Name"
                  value={p.name}
                  onChange={(v) => update("name", v)}
                  maxLength={80}
                />
                <Field
                  label="Profession or headline"
                  value={p.role}
                  onChange={(v) => update("role", v)}
                  maxLength={120}
                />
                <label>
                  About
                  <textarea
                    value={p.bio}
                    maxLength={500}
                    rows={3}
                    onChange={(e) => update("bio", e.target.value)}
                  />
                </label>
                <Field
                  label="Location or specialties"
                  value={p.location}
                  onChange={(v) => update("location", v)}
                  maxLength={100}
                />
                <label className="color-label">
                  Accent color
                  <input
                    type="color"
                    value={p.accent}
                    onChange={(e) => update("accent", e.target.value)}
                  />
                </label>
              </div>
              <div className="editor-section">
                <h3>
                  03 <span>Links and contact</span>
                </h3>
                {p.links.map((l, i) => (
                  <div className="link-editor" key={l.id}>
                    <div className="link-editor-top">
                      <span>LINK {i + 1}</span>
                      <div>
                        <button
                          aria-label={`Move link up ${i + 1}`}
                          disabled={i === 0}
                          onClick={() => update("links", move(p.links, i, -1))}
                        >
                          <ArrowLeft size={15} />
                        </button>
                        <button
                          aria-label={`Move link down ${i + 1}`}
                          disabled={i === p.links.length - 1}
                          onClick={() => update("links", move(p.links, i, 1))}
                        >
                          <ArrowRight size={15} />
                        </button>
                        <button
                          aria-label={`Delete link ${i + 1}`}
                          onClick={() =>
                            update(
                              "links",
                              p.links.filter((x) => x.id !== l.id),
                            )
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <label>
                      Type
                      <select
                        value={l.type}
                        onChange={(e) => updateLink(i, "type", e.target.value)}
                      >
                        {Object.entries(types).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="Title"
                      value={l.label}
                      onChange={(v) => updateLink(i, "label", v)}
                      maxLength={70}
                    />
                    <Field
                      label={
                        l.type === "email"
                          ? "Email address"
                          : ["phone", "whatsapp"].includes(l.type)
                            ? "Phone number with country code"
                            : "Web address"
                      }
                      value={l.value}
                      onChange={(v) => updateLink(i, "value", v)}
                      placeholder={
                        l.type === "email"
                          ? "name@example.com"
                          : ["phone", "whatsapp"].includes(l.type)
                            ? "+51 999 000 000"
                            : "https://…"
                      }
                    />
                    {l.value && !destination(l) && (
                      <p className="invalid">Please check this destination.</p>
                    )}
                    <Field
                      label="Short description"
                      value={l.description}
                      onChange={(v) => updateLink(i, "description", v)}
                      maxLength={90}
                    />
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={l.visible}
                        onChange={(e) =>
                          updateLink(i, "visible", e.target.checked)
                        }
                      />
                      Show on profile
                    </label>
                  </div>
                ))}
                <button
                  className="add-link"
                  onClick={() =>
                    update("links", [
                      ...p.links,
                      {
                        id: crypto.randomUUID(),
                        type: "link",
                        label: "",
                        value: "",
                        description: "",
                        visible: true,
                      },
                    ])
                  }
                >
                  <Plus size={18} />
                  Add link or contact
                </button>
              </div>
              <div className="editor-bottom">
                {!configured && (
                  <button
                    className="add-link"
                    onClick={() =>
                      download(
                        JSON.stringify(profiles, null, 2),
                        "profiles.json",
                        "application/json",
                      )
                    }
                  >
                    <Download size={18} />
                    Export profiles for publishing
                  </button>
                )}

                <button className="save-contact" disabled={busy} onClick={save}>
                  <Check size={19} />
                  {busy
                    ? "Publishing…"
                    : configured
                      ? "Publish profiles"
                      : "Save draft"}
                </button>
                <button
                  className="text-button"
                  onClick={() => setEditing(false)}
                >
                  View my page <ArrowUpRight size={15} />
                </button>
              </div>
            </aside>
          )}
        </div>
      )}
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
        {!configured && draftMode && (
          <p className="qr-warning">
            Draft changes are visible only on this device until published.
          </p>
        )}
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
function Field({ label, onChange, ...props }) {
  return (
    <label>
      {label}
      <input {...props} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
createRoot(document.getElementById("root")).render(<App />);
