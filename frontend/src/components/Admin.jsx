/**
 * Admin.jsx
 * Drop into your React frontend as a sub-route, e.g. /admin
 *
 * Usage:
 *   import Admin from './Admin';
 *   // in your router: <Route path="/admin" element={<Admin />} />
 *
 * Requires: React 18+, no extra deps beyond what your project already has.
 */

import { useState, useEffect, useRef, useCallback } from "react";

const API = "http://localhost:8000";

// utils

const api = {
  get:    (path)         => fetch(`${API}${path}`).then(r => r.json()),
  post:   (path, body)   => fetch(`${API}${path}`, { method:"POST",   headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) }).then(r => r.json()),
  put:    (path, body)   => fetch(`${API}${path}`, { method:"PUT",    headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path)         => fetch(`${API}${path}`, { method:"DELETE" }),
  upload: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`${API}/upload-image`, { method:"POST", body: fd }).then(r => r.json());
  },
};

// super safe password location

const ADMIN_PASSWORD = "porto";

// reuse the site's CSS variables; admin-specific overrides below

const css = {
  
  page: {
    fontFamily: "var(--font-body)",
    background: "var(--bg)",
    color: "var(--text)",
    minHeight: "100vh",
    paddingTop: "var(--nav-h, 64px)",
  },
  inner: { maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" },
  heading: { fontFamily:"var(--font-display)", fontWeight:"normal", fontSize:"2.2rem", letterSpacing:"-.02em", marginBottom:".3rem" },
  rule: { width:60, height:3, background:"var(--accent)", marginBottom:"2.5rem" },
  sectionHead: { fontFamily:"var(--font-ui)", fontSize:".68rem", textTransform:"uppercase", letterSpacing:".15em", color:"var(--muted)", marginBottom:"1rem", marginTop:"2.5rem" },
  card: { background:"var(--surface)", border:"1px solid var(--border)", padding:"1.25rem 1.5rem", marginBottom:".6rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem" },
  cardTitle: { fontFamily:"var(--font-display)", fontSize:"1.05rem", fontWeight:"normal", marginBottom:".35rem" },
  tags: { display:"flex", gap:".3rem", flexWrap:"wrap", marginTop:".3rem" },
  tag: { fontFamily:"var(--font-ui)", fontSize:".65rem", textTransform:"uppercase", letterSpacing:".1em", color:"var(--accent)", border:"1px solid var(--accent)", padding:".1rem .45rem" },
  tagBlue: { fontFamily:"var(--font-ui)", fontSize:".65rem", textTransform:"uppercase", letterSpacing:".1em", color:"var(--accent2)", border:"1px solid var(--accent2)", padding:".1rem .45rem" },
  muted: { color:"var(--muted)", fontSize:".82rem", lineHeight:1.6 },
  btnRow: { display:"flex", gap:".5rem", flexShrink:0 },
  btnEdit: { fontFamily:"var(--font-ui)", fontSize:".68rem", textTransform:"uppercase", letterSpacing:".1em", background:"none", border:"1px solid var(--border)", color:"var(--muted)", padding:".35rem .85rem", cursor:"pointer" },
  btnDel: { fontFamily:"var(--font-ui)", fontSize:".68rem", textTransform:"uppercase", letterSpacing:".1em", background:"none", border:"1px solid var(--accent)", color:"var(--accent)", padding:".35rem .85rem", cursor:"pointer" },
  btnAdd: { fontFamily:"var(--font-ui)", fontSize:".72rem", textTransform:"uppercase", letterSpacing:".12em", background:"none", border:"1px solid var(--border)", color:"var(--text)", padding:".5rem 1.4rem", cursor:"pointer", marginTop:".75rem" },
  btnPrimary: { fontFamily:"var(--font-ui)", fontSize:".75rem", textTransform:"uppercase", letterSpacing:".12em", background:"var(--accent)", color:"var(--bg)", border:"none", padding:".65rem 1.75rem", cursor:"pointer" },
  btnSecondary: { fontFamily:"var(--font-ui)", fontSize:".75rem", textTransform:"uppercase", letterSpacing:".12em", background:"none", color:"var(--muted)", border:"1px solid var(--border)", padding:".65rem 1.75rem", cursor:"pointer" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,.8)", backdropFilter:"blur(4px)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" },
  modal: { background:"var(--surface)", border:"1px solid var(--border)", width:"100%", maxWidth:640, maxHeight:"90vh", overflowY:"auto", padding:"2rem 2.5rem", position:"relative" },
  modalTitle: { fontFamily:"var(--font-display)", fontSize:"1.5rem", fontWeight:"normal", marginBottom:".2rem" },
  modalSub: { fontFamily:"var(--font-ui)", fontSize:".68rem", textTransform:"uppercase", letterSpacing:".1em", color:"var(--muted)", marginBottom:"1.75rem" },
  formGroup: { display:"flex", flexDirection:"column", gap:".35rem", marginBottom:"1.15rem" },
  label: { fontFamily:"var(--font-ui)", fontSize:".65rem", textTransform:"uppercase", letterSpacing:".12em", color:"var(--muted)" },
  input: { background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:".9rem", padding:".6rem .8rem", outline:"none", width:"100%" },
  textarea: { background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:".85rem", padding:".6rem .8rem", outline:"none", width:"100%", minHeight:100, resize:"vertical" },
  modalClose: { position:"absolute", top:"1rem", right:"1.25rem", background:"none", border:"none", color:"var(--muted)", fontSize:"1.5rem", cursor:"pointer", lineHeight:1 },
  modalFooter: { display:"flex", gap:".75rem", justifyContent:"flex-end", marginTop:"1.5rem", paddingTop:"1.25rem", borderTop:"1px solid var(--border)" },
  chipInput: { display:"flex", gap:".4rem", flexWrap:"wrap", background:"var(--bg)", border:"1px solid var(--border)", padding:".5rem .6rem", alignItems:"center" },
  chip: { display:"flex", alignItems:"center", gap:".3rem", background:"var(--border)", padding:".15rem .55rem", fontSize:".75rem", fontFamily:"var(--font-ui)" },
  chipX: { background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:".9rem", lineHeight:1, padding:0 },
  imgThumb: { width:64, height:48, objectFit:"cover", border:"1px solid var(--border)" },
  imgRow: { display:"flex", alignItems:"center", gap:".65rem", marginBottom:".5rem" },
  uploadBtn: { fontFamily:"var(--font-ui)", fontSize:".65rem", textTransform:"uppercase", letterSpacing:".1em", background:"none", border:"1px solid var(--border)", color:"var(--muted)", padding:".3rem .75rem", cursor:"pointer" },
  toast: { position:"fixed", bottom:"calc(var(--foot-h, 52px) + 1rem)", left:"50%", transform:"translateX(-50%)", background:"var(--surface)", border:"1px solid var(--accent)", color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:".72rem", letterSpacing:".08em", padding:".65rem 1.5rem", zIndex:9999, pointerEvents:"none" },
  lockWrap: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:"1.5rem" },
  lockTitle: { fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:"normal", textAlign:"center" },
  lockSub: { fontFamily:"var(--font-ui)", fontSize:".72rem", textTransform:"uppercase", letterSpacing:".14em", color:"var(--muted)" },
  lockErr: { color:"var(--accent)", fontFamily:"var(--font-ui)", fontSize:".72rem", textTransform:"uppercase", letterSpacing:".1em" },
  tabRow: { display:"flex", gap:0, borderBottom:"1px solid var(--border)", marginBottom:"1.5rem" },
  tab: { fontFamily:"var(--font-ui)", fontSize:".72rem", textTransform:"uppercase", letterSpacing:".12em", background:"none", border:"none", borderBottom:"2px solid transparent", color:"var(--muted)", padding:".7rem 1.2rem", cursor:"pointer", marginBottom:-1 },
};

//chip tag input

function ChipInput({ values, onChange, placeholder = "Add tag…" }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div style={css.chipInput}>
      {values.map(v => (
        <span key={v} style={css.chip}>
          {v}
          <button style={css.chipX} onClick={() => onChange(values.filter(x => x !== v))}>×</button>
        </span>
      ))}
      <input
        style={{ background:"none", border:"none", color:"var(--text)", fontFamily:"var(--font-body)", fontSize:".82rem", outline:"none", minWidth:120, flex:1 }}
        value={draft}
        placeholder={placeholder}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
      />
    </div>
  );
}

// image field: URL or file upload

function ImageField({ url, onChange, label = "Image" }) {
  const [mode, setMode] = useState("url");
  const [uploading, setUploading] = useState(false);
  const ref = useRef();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.upload(file);
      onChange(`${API}${data.url}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={css.formGroup}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <label style={css.label}>{label}</label>
        <div style={{ display:"flex", gap:".5rem" }}>
          {["url","file"].map(m => (
            <button key={m} style={{ ...css.uploadBtn, borderColor: mode===m ? "var(--accent2)" : "var(--border)", color: mode===m ? "var(--accent2)" : "var(--muted)" }}
              onClick={() => setMode(m)}>{m}</button>
          ))}
        </div>
      </div>
      {mode === "url" ? (
        <input style={css.input} value={url} placeholder="https://…" onChange={e => onChange(e.target.value)} />
      ) : (
        <>
          <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
          <button style={css.uploadBtn} onClick={() => ref.current.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Choose file…"}
          </button>
        </>
      )}
      {url && <img src={url} alt="" style={css.imgThumb} onError={e => e.target.style.display="none"} />}
    </div>
  );
}

// multi-image list (design)

function ImageListField({ urls, onChange }) {
  return (
    <div>
      {urls.map((url, i) => (
        <div key={i} style={css.imgRow}>
          <ImageField url={url} onChange={v => { const n=[...urls]; n[i]=v; onChange(n); }} label={`Image ${i+1}`} />
          <button style={css.chipX} onClick={() => onChange(urls.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
      <button style={css.uploadBtn} onClick={() => onChange([...urls,""])}>+ Add image</button>
    </div>
  );
}

// paragraph list (IT desc)

function ParagraphList({ paras, onChange }) {
  return (
    <div>
      {paras.map((p, i) => (
        <div key={i} style={{ display:"flex", gap:".5rem", marginBottom:".5rem", alignItems:"flex-start" }}>
          <textarea style={{...css.textarea, minHeight:70}} value={p}
            onChange={e => { const n=[...paras]; n[i]=e.target.value; onChange(n); }} />
          <button style={{...css.chipX, marginTop:".4rem"}} onClick={() => onChange(paras.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
      <button style={css.uploadBtn} onClick={() => onChange([...paras,""])}>+ Add paragraph</button>
    </div>
  );
}

// toast

function Toast({ msg }) {
  if (!msg) return null;
  return <div style={css.toast}>{msg}</div>;
}

// confirm delete

function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div style={css.overlay} onClick={onCancel}>
      <div style={{ ...css.modal, maxWidth:400 }} onClick={e => e.stopPropagation()}>
        <p style={{ ...css.modalTitle, fontSize:"1.2rem", marginBottom:".75rem" }}>Delete "{title}"?</p>
        <p style={css.muted}>This cannot be undone.</p>
        <div style={css.modalFooter}>
          <button style={css.btnSecondary} onClick={onCancel}>Cancel</button>
          <button style={css.btnPrimary} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// design editor

function DesignModal({ item, onSave, onClose }) {
  const blank = { title:"", desc:"", tags:[], images:[] };
  const [form, setForm] = useState(item ? { ...item, tags: item.tags.map(t=>t.value||t), images: item.images.map(i=>i.url||i) } : blank);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const payload = { title: form.title, desc: form.desc, tags: form.tags, images: form.images };
      const result = item ? await api.put(`/design/${item.id}`, payload) : await api.post("/design", payload);
      onSave(result);
    } finally { setSaving(false); }
  }

  return (
    <div style={css.overlay} onClick={onClose}>
      <div style={css.modal} onClick={e => e.stopPropagation()}>
        <button style={css.modalClose} onClick={onClose}>×</button>
        <p style={css.modalTitle}>{item ? "Edit" : "New"} Design Project</p>
        <p style={css.modalSub}>{item ? item.id : "new entry"}</p>

        <div style={css.formGroup}>
          <label style={css.label}>Title</label>
          <input style={css.input} value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
        </div>
        <div style={css.formGroup}>
          <label style={css.label}>Description</label>
          <textarea style={css.textarea} value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))} />
        </div>
        <div style={css.formGroup}>
          <label style={css.label}>Tags</label>
          <ChipInput values={form.tags} onChange={v => setForm(f=>({...f,tags:v}))} />
        </div>
        <div style={css.formGroup}>
          <label style={css.label}>Images</label>
          <ImageListField urls={form.images} onChange={v => setForm(f=>({...f,images:v}))} />
        </div>

        <div style={css.modalFooter}>
          <button style={css.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={css.btnPrimary} onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
        </div>
      </div>
    </div>
  );
}

// IT editor

function ITModal({ item, onSave, onClose }) {
  const blank = { title:"", tags:[], desc:[""], image_src:"", image_alt:"" };
  const init = item ? {
    title: item.title,
    tags: item.tags.map(t=>t.value||t),
    desc: (item.descs||[]).sort((a,b)=>Number(a.position)-Number(b.position)).map(d=>d.text||d),
    image_src: item.image_src || "",
    image_alt: item.image_alt || "",
  } : blank;
  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const payload = { title:form.title, tags:form.tags, desc:form.desc.filter(Boolean), image_src:form.image_src||null, image_alt:form.image_alt||null };
      const result = item ? await api.put(`/it/${item.id}`, payload) : await api.post("/it", payload);
      onSave(result);
    } finally { setSaving(false); }
  }

  return (
    <div style={css.overlay} onClick={onClose}>
      <div style={css.modal} onClick={e => e.stopPropagation()}>
        <button style={css.modalClose} onClick={onClose}>×</button>
        <p style={css.modalTitle}>{item ? "Edit" : "New"} IT Project</p>
        <p style={css.modalSub}>{item ? item.id : "new entry"}</p>

        <div style={css.formGroup}>
          <label style={css.label}>Title</label>
          <input style={css.input} value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
        </div>
        <div style={css.formGroup}>
          <label style={css.label}>Tags</label>
          <ChipInput values={form.tags} onChange={v => setForm(f=>({...f,tags:v}))} />
        </div>
        <div style={css.formGroup}>
          <label style={css.label}>Description paragraphs</label>
          <ParagraphList paras={form.desc} onChange={v => setForm(f=>({...f,desc:v}))} />
        </div>
        <ImageField url={form.image_src} onChange={v => setForm(f=>({...f,image_src:v}))} label="Project image (optional)" />
        <div style={css.formGroup}>
          <label style={css.label}>Image alt text</label>
          <input style={css.input} value={form.image_alt} onChange={e => setForm(f=>({...f,image_alt:e.target.value}))} />
        </div>

        <div style={css.modalFooter}>
          <button style={css.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={css.btnPrimary} onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
        </div>
      </div>
    </div>
  );
}

// photo editor

function PhotoModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? {...item} : { title:"", desc:"", src:"" });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const result = item ? await api.put(`/photos/${item.id}`, form) : await api.post("/photos", form);
      onSave(result);
    } finally { setSaving(false); }
  }

  return (
    <div style={css.overlay} onClick={onClose}>
      <div style={css.modal} onClick={e => e.stopPropagation()}>
        <button style={css.modalClose} onClick={onClose}>×</button>
        <p style={css.modalTitle}>{item ? "Edit" : "New"} Photo</p>
        <p style={css.modalSub}>{item ? item.id : "new entry"}</p>

        <div style={css.formGroup}>
          <label style={css.label}>Title</label>
          <input style={css.input} value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
        </div>
        <div style={css.formGroup}>
          <label style={css.label}>Caption / description</label>
          <textarea style={css.textarea} value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))} />
        </div>
        <ImageField url={form.src} onChange={v => setForm(f=>({...f,src:v}))} label="Photo" />

        <div style={css.modalFooter}>
          <button style={css.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={css.btnPrimary} onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
        </div>
      </div>
    </div>
  );
}

// section panels

function DesignPanel({ toast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, "new" or item obj
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { api.get("/design").then(setItems); }, []);

  function handleSave(result) {
    setItems(prev => prev.find(x => x.id === result.id) ? prev.map(x => x.id===result.id ? result : x) : [...prev, result]);
    setEditing(null);
    toast("Saved.");
  }
  async function handleDelete(item) {
    await api.delete(`/design/${item.id}`);
    setItems(prev => prev.filter(x => x.id !== item.id));
    setDeleting(null);
    toast("Deleted.");
  }

  return (
    <>
      {items.map(item => (
        <div key={item.id} style={css.card}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={css.cardTitle}>{item.title}</p>
            <p style={{ ...css.muted, marginBottom:".5rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:480 }}>{item.desc}</p>
            <div style={css.tags}>{item.tags.map(t=><span key={t.id||t} style={css.tagBlue}>{t.value||t}</span>)}</div>
            <p style={{ ...css.muted, marginTop:".5rem", fontSize:".72rem" }}>{item.images?.length || 0} image(s)</p>
          </div>
          <div style={css.btnRow}>
            <button style={css.btnEdit} onClick={() => setEditing(item)}>Edit</button>
            <button style={css.btnDel}  onClick={() => setDeleting(item)}>Delete</button>
          </div>
        </div>
      ))}
      <button style={css.btnAdd} onClick={() => setEditing("new")}>+ New Design Project</button>

      {editing && <DesignModal item={editing==="new"?null:editing} onSave={handleSave} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmModal title={deleting.title} onConfirm={() => handleDelete(deleting)} onCancel={() => setDeleting(null)} />}
    </>
  );
}

function ITPanel({ toast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { api.get("/it").then(setItems); }, []);

  function handleSave(result) {
    setItems(prev => prev.find(x => x.id === result.id) ? prev.map(x => x.id===result.id ? result : x) : [...prev, result]);
    setEditing(null);
    toast("Saved.");
  }
  async function handleDelete(item) {
    await api.delete(`/it/${item.id}`);
    setItems(prev => prev.filter(x => x.id !== item.id));
    setDeleting(null);
    toast("Deleted.");
  }

  return (
    <>
      {items.map(item => (
        <div key={item.id} style={css.card}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={css.cardTitle}>{item.title}</p>
            <div style={css.tags}>{item.tags.map(t=><span key={t.id||t} style={css.tag}>{t.value||t}</span>)}</div>
            {item.image_src && <img src={item.image_src} alt="" style={{ ...css.imgThumb, marginTop:".6rem" }} onError={e=>e.target.style.display="none"} />}
          </div>
          <div style={css.btnRow}>
            <button style={css.btnEdit} onClick={() => setEditing(item)}>Edit</button>
            <button style={css.btnDel}  onClick={() => setDeleting(item)}>Delete</button>
          </div>
        </div>
      ))}
      <button style={css.btnAdd} onClick={() => setEditing("new")}>+ New IT Project</button>

      {editing && <ITModal item={editing==="new"?null:editing} onSave={handleSave} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmModal title={deleting.title} onConfirm={() => handleDelete(deleting)} onCancel={() => setDeleting(null)} />}
    </>
  );
}

function PhotoPanel({ toast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { api.get("/photos").then(setItems); }, []);

  function handleSave(result) {
    setItems(prev => prev.find(x => x.id === result.id) ? prev.map(x => x.id===result.id ? result : x) : [...prev, result]);
    setEditing(null);
    toast("Saved.");
  }
  async function handleDelete(item) {
    await api.delete(`/photos/${item.id}`);
    setItems(prev => prev.filter(x => x.id !== item.id));
    setDeleting(null);
    toast("Deleted.");
  }

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:".6rem" }}>
        {items.map(item => (
          <div key={item.id} style={{ ...css.card, flexDirection:"column", alignItems:"stretch" }}>
            <img src={item.src} alt={item.title} style={{ width:"100%", aspectRatio:"16/9", objectFit:"cover", marginBottom:".75rem", border:"1px solid var(--border)" }} onError={e=>e.target.style.display="none"} />
            <p style={css.cardTitle}>{item.title}</p>
            <p style={{ ...css.muted, marginBottom:".75rem" }}>{item.desc}</p>
            <div style={css.btnRow}>
              <button style={css.btnEdit} onClick={() => setEditing(item)}>Edit</button>
              <button style={css.btnDel}  onClick={() => setDeleting(item)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <button style={css.btnAdd} onClick={() => setEditing("new")}>+ New Photo</button>

      {editing && <PhotoModal item={editing==="new"?null:editing} onSave={handleSave} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmModal title={deleting.title} onConfirm={() => handleDelete(deleting)} onCancel={() => setDeleting(null)} />}
    </>
  );
}

// password

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function attempt() {
    if (pw === ADMIN_PASSWORD) { onUnlock(); }
    else { setErr(true); setPw(""); }
  }

  return (
    <div style={css.lockWrap}>
      <div>
        <p style={css.lockTitle}>Admin</p>
        <p style={{ ...css.lockSub, textAlign:"center", marginBottom:"2rem" }}>Portfolio CMS</p>
      </div>
      <div style={{ width:"100%", maxWidth:320, display:"flex", flexDirection:"column", gap:".75rem" }}>
        <input
          type="password"
          style={{ ...css.input, textAlign:"center", letterSpacing:".2em", fontSize:"1rem" }}
          value={pw}
          placeholder="Password"
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key==="Enter" && attempt()}
          autoFocus
        />
        {err && <p style={{ ...css.lockErr, textAlign:"center" }}>Incorrect password</p>}
        <button style={{ ...css.btnPrimary, width:"100%" }} onClick={attempt}>Enter</button>
      </div>
    </div>
  );
}

// root

const TABS = ["Design", "IT", "Photography"];

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  }, []);

  if (!unlocked) return (
    <div style={css.page}>
      <div style={css.inner}><PasswordGate onUnlock={() => setUnlocked(true)} /></div>
      <Toast msg={toastMsg} />
    </div>
  );

  return (
    <div style={css.page}>
      <div style={css.inner}>
        <p style={css.heading}>Admin</p>
        <div style={css.rule} />

        <div style={css.tabRow}>
          {TABS.map((t, i) => (
            <button key={t} style={{ ...css.tab, color: tab===i ? "var(--text)" : "var(--muted)", borderBottomColor: tab===i ? "var(--accent)" : "transparent" }}
              onClick={() => setTab(i)}>{t}</button>
          ))}
          <div style={{ flex:1 }} />
          <button style={{ ...css.tab, color:"var(--muted)" }} onClick={() => setUnlocked(false)}>Sign out</button>
        </div>

        {tab === 0 && <DesignPanel toast={toast} />}
        {tab === 1 && <ITPanel toast={toast} />}
        {tab === 2 && <PhotoPanel toast={toast} />}
      </div>
      <Toast msg={toastMsg} />
    </div>
  );
}
