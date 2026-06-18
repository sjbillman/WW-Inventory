import { useState, useEffect, useCallback } from 'react';

// ── Design tokens ──────────────────────────────────────────────────
const C = {
  black:   '#0A0A0A',
  charcoal:'#1A1A1A',
  card:    '#222222',
  border:  '#2E2E2E',
  muted:   '#3A3A3A',
  gold:    '#C9A96E',
  goldDim: '#8B6F3E',
  white:   '#F5F5F3',
  dim:     '#888880',
  red:     '#C0392B',
  redDim:  '#3A1A1A',
  amber:   '#B25C00',
  amberDim:'#2E1A00',
  purple:  '#7B4F9E',
  purpleDim:'#1E0E2E',
  green:   '#2E7D4F',
  greenDim:'#0A1F14',
};

const T = {
  display: "'Cormorant Garamond', Georgia, serif",
  body:    "'Inter', -apple-system, sans-serif",
};

// ── Data ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'ww-inv-v1';
const PROVIDERS = ['Beth', 'Sammie', 'Meagan'];

const TIER_META = {
  1: { label: 'Tier 1', sub: 'Critical & Regulated', dot: '#C0392B', dimBg: '#3A1A1A', count: 'Weekly counts' },
  2: { label: 'Tier 2', sub: 'Procedure Supplies',   dot: '#C9A96E', dimBg: '#2E1A00', count: 'Monthly counts' },
  3: { label: 'Tier 3', sub: 'Retail & Room',        dot: '#2E7D4F', dimBg: '#0A1F14', count: 'Monthly · 2 left = reorder' },
};

const CAT_OWNER = {
  'Neuromodulators': 'Beth', 'Restylane Fillers': 'Beth', 'Juvederm Fillers': 'Beth',
  'Biostimulators & Fat Dissolvers': 'Beth', 'Chemical Peels': 'Beth', 'IV Therapy': 'Beth',
  'Weight Loss & Injectable Meds': 'Sammie',
  'Injection & Procedure Supplies': 'Meagan', 'Injectable Adjuncts': 'Meagan',
  'Fluids & Infection Control': 'Meagan', 'PRF & Devices': 'Meagan',
  'Circadia': 'Meagan', 'Circadia Masks & Add-Ons': 'Meagan', 'Circadia Lip Hydrators': 'Meagan',
  'Professional Peels': 'Meagan', 'Skinbetter Science': 'Meagan',
  'SkinMedica': 'Meagan', 'VI Derm': 'Meagan', 'Room & Admin Supplies': 'Meagan',
};

function uid() { return Math.random().toString(36).slice(2, 9); }
function mk(tier, category, name, unit = 'units', par = 2) {
  return { id: uid(), tier, category, name, unit, qty: 0, par, cost: 0, expDate: '', lotNum: '', notes: '' };
}

const SEED = [
  mk(1,'Neuromodulators','Botox','vials',4), mk(1,'Neuromodulators','Xeomin','vials',2),
  mk(1,'Neuromodulators','Dysport','vials',2), mk(1,'Neuromodulators','Letybo','vials',2),
  mk(1,'Weight Loss & Injectable Meds','Semaglutide','vials',4),
  mk(1,'Weight Loss & Injectable Meds','Tirzepatide','vials',4),
  mk(1,'Weight Loss & Injectable Meds','NAD+','vials',3),
  mk(1,'Weight Loss & Injectable Meds','B12','vials',4),
  mk(1,'IV Therapy','IV Hydration Kits','kits',3),
  mk(1,'Restylane Fillers','Restylane Contour','syringes',2), mk(1,'Restylane Fillers','Restylane Defyne','syringes',2),
  mk(1,'Restylane Fillers','Restylane Eyelight','syringes',2), mk(1,'Restylane Fillers','Restylane Kysse','syringes',2),
  mk(1,'Restylane Fillers','Restylane Lyft','syringes',2), mk(1,'Restylane Fillers','Restylane Refyne','syringes',2),
  mk(1,'Juvederm Fillers','Juvederm Ultra Plus','syringes',2), mk(1,'Juvederm Fillers','Juvederm Ultra XC','syringes',2),
  mk(1,'Juvederm Fillers','Juvederm Volbella','syringes',2), mk(1,'Juvederm Fillers','Juvederm Voluma','syringes',2),
  mk(1,'Juvederm Fillers','Juvederm Volux','syringes',2),
  mk(1,'Biostimulators & Fat Dissolvers','Belotero','syringes',2), mk(1,'Biostimulators & Fat Dissolvers','Radiesse','syringes',2),
  mk(1,'Biostimulators & Fat Dissolvers','Sculptra','vials',2), mk(1,'Biostimulators & Fat Dissolvers','Kybella','vials',2),
  mk(1,'Chemical Peels','VI Peel','kits',3),
  mk(2,'Injection & Procedure Supplies','30u Comfortox Needles','boxes',2),
  mk(2,'Injection & Procedure Supplies','30u Syringes','boxes',2),
  mk(2,'Injection & Procedure Supplies','50u Comfortox Needles','boxes',2),
  mk(2,'Injection & Procedure Supplies','50u Syringes','boxes',2),
  mk(2,'Injection & Procedure Supplies','100u Syringes','boxes',2),
  mk(2,'Injection & Procedure Supplies','Syringe 3mL','boxes',2),
  mk(2,'Injection & Procedure Supplies','Syringe 5mL','boxes',2),
  mk(2,'Injection & Procedure Supplies','Syringe w/Needle 3mL 22g','boxes',2),
  mk(2,'Injection & Procedure Supplies','Needles 18g','boxes',2),
  mk(2,'Injection & Procedure Supplies','Needles 32g','boxes',2),
  mk(2,'Injection & Procedure Supplies','Cannulas 22g + 21g','packs',2),
  mk(2,'Injection & Procedure Supplies','Cannulas 25g + 23g','packs',2),
  mk(2,'Injection & Procedure Supplies','Microneedling Tips','boxes',2),
  mk(2,'Injection & Procedure Supplies','Dermaplaning Blades','boxes',2),
  mk(2,'Injectable Adjuncts','Marcaine','vials',3), mk(2,'Injectable Adjuncts','Xylocaine','vials',3),
  mk(2,'Injectable Adjuncts','8.4 Sodium Bicarbonate','vials',3),
  mk(2,'Fluids & Infection Control','Alcohol (bottled)','bottles',2),
  mk(2,'Fluids & Infection Control','Alcohol Pads M','boxes',3),
  mk(2,'Fluids & Infection Control','Alcohol Pads L','boxes',3),
  mk(2,'Fluids & Infection Control','Cavi Wipes','canisters',3),
  mk(2,'Fluids & Infection Control','Disinfectant Spray','bottles',2),
  mk(2,'Fluids & Infection Control','Sharps Containers','units',2),
  mk(2,'Fluids & Infection Control','Distilled Water','gallons',2),
  mk(2,'Fluids & Infection Control','Wound Irrigation Solution','bottles',2),
  mk(2,'PRF & Devices','Bio PRF Kits','kits',3),
  mk(2,'PRF & Devices','Laser Eye Shields','pairs',5),
  mk(2,'PRF & Devices','Chiller Fluid','bottles',2),
  mk(3,'Circadia','Acne Regimen Bundle','units',2), mk(3,'Circadia','Anti-Aging Regimen Bundle','units',2),
  mk(3,'Circadia','Aloe & Calendula','units',2), mk(3,'Circadia','Amandola Milk Cleanser','units',2),
  mk(3,'Circadia','Aquaporin Cream','units',2), mk(3,'Circadia','Blueberry & White Tea','units',2),
  mk(3,'Circadia','Bright White Serum','units',2), mk(3,'Circadia','Chrono-Calm','units',2),
  mk(3,'Circadia','Circa-Shield SPF','units',2), mk(3,'Circadia','Cleansing Gel (Mandelic & Salicylic)','units',2),
  mk(3,'Circadia','Counter A.G.E.','units',2), mk(3,'Circadia','Cyto-Comm','units',2),
  mk(3,'Circadia','Daytime Control','units',2), mk(3,'Circadia','Emergency Eye Lift','units',2),
  mk(3,'Circadia','Essentials Regimen Bundle','units',2), mk(3,'Circadia','Full Circle Eye','units',2),
  mk(3,'Circadia','Hydralox','units',2), mk(3,'Circadia','Light Day Sunscreen','units',2),
  mk(3,'Circadia','Lipid Replacing Cleanser','units',2), mk(3,'Circadia','Meristem','units',2),
  mk(3,'Circadia','Moisture on Demand','units',2), mk(3,'Circadia','Myo-Cyte Plus','units',2),
  mk(3,'Circadia','Nighttime Control','units',2), mk(3,'Circadia','Nighttime Repair Plus','units',2),
  mk(3,'Circadia','Phyto-Pep Lotion','units',2), mk(3,'Circadia','Post Peel Kit','units',2),
  mk(3,'Circadia','Renewal Eye','units',2), mk(3,'Circadia','Rose-Ease','units',2),
  mk(3,'Circadia','Serum 71','units',2), mk(3,'Circadia','Spot Stop','units',2),
  mk(3,'Circadia','Tranquili-Cream','units',2), mk(3,'Circadia','Vitamin C Reversal','units',2),
  mk(3,'Circadia','Vitamin Veil','units',2), mk(3,'Circadia','White Veil Brightener','units',2),
  mk(3,'Circadia','White Willow & Juniper','units',2),
  mk(3,'Circadia Masks & Add-Ons','B.E. Replenishing Face & Neck Mask','units',2),
  mk(3,'Circadia Masks & Add-Ons','Exosome Soothing Gel Mask','units',2),
  mk(3,'Circadia Masks & Add-Ons','C-Peptide Add-On','units',2),
  mk(3,'Circadia Lip Hydrators','Lip Hydrator — Hibiscus','units',2),
  mk(3,'Circadia Lip Hydrators','Lip Hydrator — Peppermint Mocha','units',2),
  mk(3,'Circadia Lip Hydrators','Lip Hydrator — Pumpkin Spice','units',2),
  mk(3,'Circadia Lip Hydrators','Lip Hydrator — Vanilla Mint','units',2),
  mk(3,'Circadia Lip Hydrators','Lip Hydrator — Naked','units',2),
  mk(3,'Professional Peels','Dermafrost Light','units',2), mk(3,'Professional Peels','Dermafrost Medium','units',2),
  mk(3,'Professional Peels','Dermafrost Deeper','units',2), mk(3,'Professional Peels','Jessner Light','units',2),
  mk(3,'Professional Peels','Jessner Medium','units',2), mk(3,'Professional Peels','Jessner Deeper','units',2),
  mk(3,'Skinbetter Science','AlphaRet Body','units',2), mk(3,'Skinbetter Science','AlphaRet Clearing','units',2),
  mk(3,'Skinbetter Science','AlphaRet Exfoliating','units',2), mk(3,'Skinbetter Science','AlphaRet Overnight','units',2),
  mk(3,'Skinbetter Science','Alto Advanced Defense','units',2), mk(3,'Skinbetter Science','A-Team Duo','units',2),
  mk(3,'Skinbetter Science','Cleansing Gel','units',2), mk(3,'Skinbetter Science','Even Tone Correcting','units',2),
  mk(3,'Skinbetter Science','EyeMax AlphaRet','units',2), mk(3,'Skinbetter Science','Hydration Boosting C','units',2),
  mk(3,'Skinbetter Science','Instant Effect Eye Gel','units',2),
  mk(3,'Skinbetter Science','InterFuse Face & Neck','units',2), mk(3,'Skinbetter Science','InterFuse Intensive','units',2),
  mk(3,'Skinbetter Science','InterFuse Treatment','units',2), mk(3,'Skinbetter Science','Mystro Active Balance','units',2),
  mk(3,'Skinbetter Science','Refining Foam Cleanser','units',2), mk(3,'Skinbetter Science','Trio Rebalancing Moisturizer','units',2),
  mk(3,'Skinbetter Science','Sunbetter SHEER SPF 70','units',2), mk(3,'Skinbetter Science','Sunbetter SHEER Compact','units',2),
  mk(3,'Skinbetter Science','Sunbetter TONE SMART SPF 75','units',2), mk(3,'Skinbetter Science','Sunbetter TONE SMART Compact','units',2),
  mk(3,'SkinMedica','AHA/BHA Exfoliant','units',2), mk(3,'SkinMedica','Brightening Essentials','units',2),
  mk(3,'SkinMedica','Dermal Repair','units',2), mk(3,'SkinMedica','ESD Mineral Shields','units',2),
  mk(3,'SkinMedica','Facial Cleanser','units',2), mk(3,'SkinMedica','HA5','units',2),
  mk(3,'SkinMedica','Instant Bright Eye Cream','units',2), mk(3,'SkinMedica','Instant Bright Eye Mask','units',2),
  mk(3,'SkinMedica','Lytera 2.0','units',2), mk(3,'SkinMedica','Neck Correct','units',2),
  mk(3,'SkinMedica','Retinol 0.5','units',2), mk(3,'SkinMedica','TNS Advanced+','units',2),
  mk(3,'SkinMedica','TNS Eye Repair','units',2), mk(3,'SkinMedica','Ultra Sheer Moisturizer','units',2),
  mk(3,'VI Derm','Daily Defense SPF','units',2), mk(3,'VI Derm','Pigment Correcting Kit','units',2),
  mk(3,'Room & Admin Supplies','Gloves S','boxes',3), mk(3,'Room & Admin Supplies','Gloves M','boxes',3),
  mk(3,'Room & Admin Supplies','Gloves XS','boxes',3),
  mk(3,'Room & Admin Supplies','Gauze (woven)','packs',3), mk(3,'Room & Admin Supplies','Gauze (non-woven)','packs',3),
  mk(3,'Room & Admin Supplies','Bandaids','boxes',2), mk(3,'Room & Admin Supplies','Baby Wipes','packs',3),
  mk(3,'Room & Admin Supplies','Cotton Swabs','boxes',2), mk(3,'Room & Admin Supplies','Facial Pads','bags',2),
  mk(3,'Room & Admin Supplies','Makeup Wipes','packs',2), mk(3,'Room & Admin Supplies','Razors','packs',2),
  mk(3,'Room & Admin Supplies','Tongue Depressors','boxes',2), mk(3,'Room & Admin Supplies','Tissues','boxes',3),
  mk(3,'Room & Admin Supplies','White Eyeliner','units',2), mk(3,'Room & Admin Supplies','Clear Medication Bags','boxes',2),
  mk(3,'Room & Admin Supplies','Printer Paper','reams',2), mk(3,'Room & Admin Supplies','Barbercide','bottles',2),
  mk(3,'Room & Admin Supplies','Hand Sanitizer','bottles',3),
];

// ── Storage ────────────────────────────────────────────────────────
function loadData() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// ── Helpers ────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }
function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getStatus(item) {
  const d = daysUntil(item.expDate);
  if (item.qty === 0) return 'out';
  if (d !== null && d <= 0) return 'expired';
  if (item.qty <= item.par) return 'low';
  if (d !== null && d <= 60) return 'expiring';
  return 'ok';
}

// ── Shared styles ──────────────────────────────────────────────────
const s = {
  pill: (color, bg) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 20,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    color, background: bg, fontFamily: T.body,
  }),
  btn: (variant = 'primary') => ({
    padding: variant === 'sm' ? '5px 12px' : '10px 20px',
    borderRadius: 6, border: variant === 'ghost' ? `1px solid ${C.border}` : 'none',
    cursor: 'pointer', fontFamily: T.body, fontWeight: 600,
    fontSize: variant === 'sm' ? 11 : 13,
    background: variant === 'primary' ? C.gold : variant === 'danger' ? C.red : 'transparent',
    color: variant === 'primary' ? C.black : variant === 'ghost' ? C.dim : C.white,
    letterSpacing: '0.02em',
  }),
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: `1px solid ${C.border}`, background: C.charcoal,
    color: C.white, fontSize: 13, fontFamily: T.body, outline: 'none',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block', fontSize: 10, fontWeight: 600, color: C.gold,
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5, marginTop: 14,
  },
  card: {
    background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
    overflow: 'hidden',
  },
};

// ── Status pill ────────────────────────────────────────────────────
function StatusPill({ item }) {
  const st = getStatus(item);
  const d = daysUntil(item.expDate);
  if (st === 'out')      return <span style={s.pill(C.white, C.red)}>OUT</span>;
  if (st === 'expired')  return <span style={s.pill(C.white, C.red)}>EXPIRED</span>;
  if (st === 'low')      return <span style={s.pill(C.black, C.gold)}>LOW</span>;
  if (st === 'expiring') return <span style={s.pill(C.white, C.purple)}>EXP {d}d</span>;
  return <span style={s.pill(C.white, C.green)}>OK</span>;
}

// ── Modal ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }} onClick={onClose}>
      <div style={{ background: C.charcoal, borderRadius: '14px 14px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 3, background: C.muted, borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: T.display, fontSize: 20, color: C.white, fontWeight: 400 }}>{title}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', color: C.dim, fontSize: 22, cursor: 'pointer', padding: 4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Item Form ──────────────────────────────────────────────────────
const T1CATS = ['Neuromodulators','Weight Loss & Injectable Meds','IV Therapy','Restylane Fillers','Juvederm Fillers','Biostimulators & Fat Dissolvers','Chemical Peels'];
const T2CATS = ['Injection & Procedure Supplies','Injectable Adjuncts','Fluids & Infection Control','PRF & Devices'];
const T3CATS = ['Circadia','Circadia Masks & Add-Ons','Circadia Lip Hydrators','Professional Peels','Skinbetter Science','SkinMedica','VI Derm','Room & Admin Supplies'];

function ItemForm({ initial, onSave, onCancel, onDelete }) {
  const blank = { id: uid(), tier: 1, category: '', name: '', unit: 'units', qty: 0, par: 2, cost: 0, expDate: '', lotNum: '', notes: '' };
  const [f, setF] = useState(initial || blank);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const cats = f.tier === 1 ? T1CATS : f.tier === 2 ? T2CATS : T3CATS;

  return (
    <div>
      <label style={s.label}>Tier</label>
      <select value={f.tier} onChange={e => setF(p => ({ ...p, tier: +e.target.value, category: '' }))} style={s.input}>
        <option value={1}>Tier 1 — Critical & Regulated</option>
        <option value={2}>Tier 2 — Procedure Supplies</option>
        <option value={3}>Tier 3 — Retail & Room</option>
      </select>

      <label style={s.label}>Category</label>
      <select value={f.category} onChange={e => set('category', e.target.value)} style={s.input}>
        <option value=''>Select category…</option>
        {cats.map(c => <option key={c}>{c}</option>)}
      </select>

      <label style={s.label}>Item Name</label>
      <input value={f.name} onChange={e => set('name', e.target.value)} style={s.input} placeholder='Product name' />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label style={s.label}>Current Qty</label><input type='number' min={0} value={f.qty} onChange={e => set('qty', +e.target.value)} style={s.input} /></div>
        <div><label style={s.label}>Unit</label><input value={f.unit} onChange={e => set('unit', e.target.value)} style={s.input} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label style={s.label}>Par Level</label><input type='number' min={0} value={f.par} onChange={e => set('par', +e.target.value)} style={s.input} /></div>
        <div><label style={s.label}>Cost / Unit ($)</label><input type='number' min={0} step={0.01} value={f.cost} onChange={e => set('cost', +e.target.value)} style={s.input} /></div>
      </div>

      {f.tier === 1 && <>
        <label style={s.label}>Expiration Date</label>
        <input type='date' value={f.expDate} onChange={e => set('expDate', e.target.value)} style={s.input} />
        <label style={s.label}>Lot Number</label>
        <input value={f.lotNum} onChange={e => set('lotNum', e.target.value)} style={s.input} placeholder='e.g. BX2024-001' />
      </>}

      <label style={s.label}>Notes</label>
      <textarea value={f.notes} onChange={e => set('notes', e.target.value)} style={{ ...s.input, height: 56, resize: 'vertical' }} placeholder='Storage, vendor, etc.' />

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button onClick={() => f.name.trim() && f.category && onSave(f)} style={{ ...s.btn('primary'), flex: 1 }}>Save Item</button>
        <button onClick={onCancel} style={{ ...s.btn('ghost'), flex: 1 }}>Cancel</button>
      </div>
      {onDelete && <button onClick={onDelete} style={{ ...s.btn('danger'), width: '100%', marginTop: 8 }}>Delete Item</button>}
    </div>
  );
}

// ── Log Modal ──────────────────────────────────────────────────────
function LogModal({ item, onClose, onConfirm }) {
  const [type, setType] = useState('use');
  const [qty, setQty] = useState(1);
  const [provider, setProvider] = useState('Beth');
  const [note, setNote] = useState('');
  const afterQty = Math.max(0, item.qty + (type === 'use' ? -qty : qty));
  const willBeLow = type === 'use' && afterQty <= item.par;

  return (
    <Modal title={item.name} onClose={onClose}>
      <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>
        On hand: <span style={{ color: C.white, fontWeight: 600 }}>{item.qty} {item.unit}</span>
        <span style={{ marginLeft: 12 }}>Par: {item.par}</span>
        {item.expDate && <span style={{ marginLeft: 12 }}>Exp: {item.expDate}</span>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['use', 'restock'].map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${type === t ? C.gold : C.border}`,
            background: type === t ? C.goldDim : 'transparent',
            color: type === t ? C.gold : C.dim, fontFamily: T.body, fontWeight: 600, fontSize: 12, cursor: 'pointer',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>{t === 'use' ? 'Log Use' : 'Restock'}</button>
        ))}
      </div>

      <label style={s.label}>Quantity</label>
      <input type='number' min={1} value={qty} onChange={e => setQty(+e.target.value)} style={{ ...s.input, fontSize: 20, textAlign: 'center' }} />

      {item.tier === 1 && <>
        <label style={s.label}>Provider</label>
        <select value={provider} onChange={e => setProvider(e.target.value)} style={s.input}>
          {PROVIDERS.map(p => <option key={p}>{p}</option>)}
        </select>
      </>}

      <label style={s.label}>Note (optional)</label>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder='Procedure, patient, vendor…' style={s.input} />

      <div style={{ fontSize: 12, color: C.dim, marginTop: 12, marginBottom: 4 }}>
        After: <span style={{ color: willBeLow ? C.gold : C.white, fontWeight: 600 }}>{afterQty} {item.unit}</span>
        {willBeLow && <span style={{ color: C.gold, marginLeft: 8 }}>⚠ Will be at or below par</span>}
      </div>

      <button onClick={() => onConfirm({ type, qty, provider, note })} style={{ ...s.btn(type === 'use' ? 'danger' : 'primary'), width: '100%', marginTop: 14, padding: '12px 0' }}>
        {type === 'use' ? 'Confirm Use' : 'Confirm Restock'}
      </button>
    </Modal>
  );
}

// ── Main App ───────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => loadData() || { items: SEED, log: [] });
  const [view, setView] = useState('dashboard');
  const [filterTier, setFilterTier] = useState(0);
  const [filterOwner, setFilterOwner] = useState('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [logItem, setLogItem] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => saveData(data), [data]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2600); };

  const saveItem = useCallback((item) => {
    setData(d => ({ ...d, items: d.items.some(i => i.id === item.id) ? d.items.map(i => i.id === item.id ? item : i) : [...d.items, item] }));
    setModal(null); showToast('Saved.');
  }, []);

  const deleteItem = useCallback((id) => {
    if (!window.confirm('Delete this item?')) return;
    setData(d => ({ ...d, items: d.items.filter(i => i.id !== id) }));
    setModal(null); showToast('Deleted.');
  }, []);

  const confirmLog = useCallback((item, { type, qty, provider, note }) => {
    const change = type === 'use' ? -qty : qty;
    const newQty = Math.max(0, item.qty + change);
    const entry = { id: uid(), date: today(), itemId: item.id, itemName: item.name, category: item.category, tier: item.tier, change, newQty, provider: item.tier === 1 ? provider : null, note };
    setData(d => ({
      ...d,
      items: d.items.map(i => i.id === item.id ? { ...i, qty: newQty } : i),
      log: [entry, ...d.log].slice(0, 500),
    }));
    setLogItem(null);
    showToast(type === 'use' ? `Logged ${qty} ${item.unit} used.` : `Restocked ${qty} ${item.unit}.`);
  }, []);

  const { items, log } = data;
  const lowItems   = items.filter(i => i.qty <= i.par);
  const expItems   = items.filter(i => { const d = daysUntil(i.expDate); return d !== null && d <= 60; });
  const totalVal   = items.reduce((s, i) => s + i.qty * (i.cost || 0), 0);

  const filtered = items.filter(i => {
    if (filterTier && i.tier !== filterTier) return false;
    if (filterOwner !== 'All' && CAT_OWNER[i.category] !== filterOwner) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(i => {
    if (!grouped[i.tier]) grouped[i.tier] = {};
    if (!grouped[i.tier][i.category]) grouped[i.tier][i.category] = [];
    grouped[i.tier][i.category].push(i);
  });

  const snapshotText = () => {
    let out = `WELL WITHIN SKIN & LASER CENTER\nINVENTORY SNAPSHOT — ${today()}\n${'─'.repeat(50)}\n\n`;
    [1,2,3].forEach(t => {
      out += `${TIER_META[t].label.toUpperCase()} — ${TIER_META[t].sub.toUpperCase()}\n${'─'.repeat(40)}\n`;
      items.filter(i => i.tier === t).forEach(i => {
        const st = i.qty === 0 ? 'OUT' : i.qty <= i.par ? 'LOW' : 'OK ';
        out += `  [${st}] ${i.name.padEnd(34)} ${String(i.qty).padStart(4)} ${i.unit}`;
        if (i.expDate) out += `   Exp: ${i.expDate}`;
        if (i.lotNum)  out += `  Lot: ${i.lotNum}`;
        out += '\n';
      });
      out += '\n';
    });
    out += `ORDER LIST\n${'─'.repeat(40)}\n`;
    lowItems.forEach(i => {
      const suggest = Math.max(1, i.par * 2 - i.qty);
      out += `  • [T${i.tier}] ${i.name} — have ${i.qty}, order ~${suggest} ${i.unit}  (${CAT_OWNER[i.category] || '—'})\n`;
    });
    out += `\nTotal inventory value: $${fmt(totalVal)}\nGenerated: ${today()}\n`;
    return out;
  };

  // ── Layout constants ──
  const NAV_H = 56;
  const HEADER_H = 52;

  const navItem = (v, icon, label) => (
    <button onClick={() => setView(v)} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 3, border: 'none', background: 'none', cursor: 'pointer', padding: '6px 0',
      color: view === v ? C.gold : C.muted,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 9, fontFamily: T.body, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
    </button>
  );

  return (
    <div style={{ background: C.black, minHeight: '100vh', maxWidth: 600, margin: '0 auto', position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: C.card, border: `1px solid ${C.gold}`, color: C.gold, padding: '9px 20px', borderRadius: 30, fontSize: 12, fontWeight: 600, zIndex: 300, fontFamily: T.body, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: C.black, borderBottom: `1px solid ${C.border}`, height: HEADER_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
        <div>
          <div style={{ fontFamily: T.display, fontSize: 18, color: C.white, letterSpacing: '0.02em', lineHeight: 1 }}>Well Within</div>
          <div style={{ fontFamily: T.body, fontSize: 9, color: C.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 1 }}>Skin & Laser Center</div>
        </div>
        <div style={{ fontFamily: T.body, fontSize: 10, color: C.dim, letterSpacing: '0.08em' }}>INVENTORY</div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 80px', overflowY: 'auto' }}>

        {/* ── DASHBOARD ── */}
        {view === 'dashboard' && (
          <div>
            <div style={{ fontFamily: T.display, fontSize: 26, color: C.white, fontWeight: 300, marginBottom: 18, letterSpacing: '0.01em' }}>Overview</div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[
                { label: 'Total Items',     value: items.length,      color: C.white, dim: C.muted },
                { label: 'Needs Ordering',  value: lowItems.length,   color: C.gold,  dim: C.goldDim },
                { label: 'Expiring ≤60d',   value: expItems.length,   color: '#9B6DB5', dim: C.purpleDim },
                { label: 'Inventory Value', value: `$${fmt(totalVal)}`, color: C.white, dim: C.muted },
              ].map(k => (
                <div key={k.label} style={{ ...s.card, padding: '14px 16px' }}>
                  <div style={{ fontSize: 9, fontFamily: T.body, fontWeight: 700, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontSize: 28, fontFamily: T.display, color: k.color, fontWeight: 400, lineHeight: 1 }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Owner status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18 }}>
              {PROVIDERS.map(p => {
                const mine = items.filter(i => CAT_OWNER[i.category] === p);
                const myLow = mine.filter(i => i.qty <= i.par);
                return (
                  <div key={p} style={{ ...s.card, padding: '12px 14px', borderTop: `2px solid ${myLow.length ? C.gold : C.green}` }}>
                    <div style={{ fontFamily: T.body, fontWeight: 700, fontSize: 12, color: C.white }}>{p}</div>
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{mine.length} items</div>
                    <div style={{ fontSize: 11, color: myLow.length ? C.gold : C.green, fontWeight: 600, marginTop: 6 }}>
                      {myLow.length ? `${myLow.length} low` : '✓ OK'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Low stock */}
            {lowItems.length > 0 && (
              <div style={{ ...s.card, marginBottom: 14, borderTop: `2px solid ${C.gold}` }}>
                <div style={{ padding: '12px 16px 8px', fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>⚠ Below Par — {lowItems.length} items</div>
                {lowItems.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontFamily: T.body, fontWeight: 600, fontSize: 13, color: C.white }}>{i.name}</div>
                      <div style={{ fontSize: 10, color: C.dim }}>{CAT_OWNER[i.category]} · Tier {i.tier}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: C.gold }}>{i.qty}/{i.par}</span>
                      <button onClick={() => setLogItem(i)} style={s.btn('sm')}>+ Add</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expiring */}
            {expItems.length > 0 && (
              <div style={{ ...s.card, borderTop: `2px solid ${C.purple}` }}>
                <div style={{ padding: '12px 16px 8px', fontFamily: T.body, fontSize: 11, fontWeight: 700, color: '#9B6DB5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>⏰ Expiring Soon</div>
                {expItems.map(i => {
                  const d = daysUntil(i.expDate);
                  return (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: `1px solid ${C.border}` }}>
                      <div>
                        <div style={{ fontFamily: T.body, fontWeight: 600, fontSize: 13, color: C.white }}>{i.name}</div>
                        {i.lotNum && <div style={{ fontSize: 10, color: C.dim }}>Lot: {i.lotNum}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: d <= 14 ? C.red : '#9B6DB5' }}>{d <= 0 ? 'EXPIRED' : `${d} days`}</div>
                        <div style={{ fontSize: 10, color: C.dim }}>{i.expDate}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {lowItems.length === 0 && expItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: C.green }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <div style={{ fontFamily: T.display, fontSize: 20, color: C.white, fontWeight: 300 }}>All items are in good standing</div>
              </div>
            )}
          </div>
        )}

        {/* ── INVENTORY ── */}
        {view === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: T.display, fontSize: 26, color: C.white, fontWeight: 300 }}>Inventory</div>
              <button onClick={() => setModal('add')} style={s.btn('primary')}>+ Add</button>
            </div>

            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search items…' style={{ ...s.input, marginBottom: 12 }} />

            {/* Tier filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {[0,1,2,3].map(t => (
                <button key={t} onClick={() => setFilterTier(t)} style={{
                  padding: '5px 12px', borderRadius: 20, border: `1px solid ${filterTier === t ? C.gold : C.border}`,
                  background: filterTier === t ? C.goldDim : 'transparent',
                  color: filterTier === t ? C.gold : C.dim,
                  fontFamily: T.body, fontWeight: 600, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                }}>
                  {t === 0 ? 'All' : `Tier ${t}`}
                </button>
              ))}
              <span style={{ color: C.border, padding: '0 4px' }}>|</span>
              {['All', ...PROVIDERS].map(p => (
                <button key={p} onClick={() => setFilterOwner(p)} style={{
                  padding: '5px 12px', borderRadius: 20, border: `1px solid ${filterOwner === p ? C.gold : C.border}`,
                  background: filterOwner === p ? C.goldDim : 'transparent',
                  color: filterOwner === p ? C.gold : C.dim,
                  fontFamily: T.body, fontWeight: 600, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {p}
                </button>
              ))}
            </div>

            {[1,2,3].map(t => {
              if (!grouped[t]) return null;
              const tm = TIER_META[t];
              return (
                <div key={t} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tm.dot, display: 'inline-block' }} />
                    <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{tm.label} · {tm.sub}</span>
                  </div>
                  {Object.entries(grouped[t]).map(([cat, catItems]) => (
                    <div key={cat} style={{ ...s.card, marginBottom: 8 }}>
                      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat}</span>
                        <span style={{ fontSize: 10, color: C.dim }}>{CAT_OWNER[cat]}</span>
                      </div>
                      {catItems.map((item, idx) => (
                        <div key={item.id} style={{ padding: '10px 14px', borderBottom: idx < catItems.length - 1 ? `1px solid ${C.border}` : 'none', background: item.qty <= item.par ? '#1A1400' : 'transparent' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: T.body, fontWeight: 600, fontSize: 13, color: C.white }}>{item.name}</div>
                              {item.expDate && <div style={{ fontSize: 10, color: daysUntil(item.expDate) <= 30 ? C.red : C.dim, marginTop: 1 }}>Exp: {item.expDate}{item.lotNum ? ` · Lot: ${item.lotNum}` : ''}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 10 }}>
                              <StatusPill item={item} />
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: T.display, fontSize: 22, color: item.qty <= item.par ? C.gold : C.white, fontWeight: 400, lineHeight: 1 }}>{item.qty}</div>
                                <div style={{ fontSize: 9, color: C.dim, lineHeight: 1.2 }}>{item.unit}<br/>par {item.par}</div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            <button onClick={() => setLogItem(item)} style={{ ...s.btn('ghost'), flex: 1, fontSize: 11, padding: '6px 0' }}>Log Use</button>
                            <button onClick={() => { setLogItem({ ...item, _restock: true }); }} style={{ ...s.btn('ghost'), flex: 1, fontSize: 11, padding: '6px 0' }}>Restock</button>
                            <button onClick={() => setModal({ type: 'edit', item })} style={{ ...s.btn('ghost'), fontSize: 11, padding: '6px 12px' }}>Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ORDERS ── */}
        {view === 'orders' && (
          <div>
            <div style={{ fontFamily: T.display, fontSize: 26, color: C.white, fontWeight: 300, marginBottom: 4 }}>Order List</div>
            <div style={{ fontFamily: T.body, fontSize: 12, color: C.dim, marginBottom: 18 }}>Items at or below par · sorted by owner</div>

            {lowItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <div style={{ fontFamily: T.display, fontSize: 20, color: C.white, fontWeight: 300 }}>Nothing to order</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>All items are above par</div>
              </div>
            ) : (
              <>
                {PROVIDERS.map(person => {
                  const pLow = lowItems.filter(i => CAT_OWNER[i.category] === person);
                  if (!pLow.length) return null;
                  return (
                    <div key={person} style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: T.display, fontSize: 18, color: C.white, fontWeight: 400, marginBottom: 10, letterSpacing: '0.02em' }}>{person}</div>
                      <div style={s.card}>
                        {pLow.map((item, idx) => {
                          const suggest = Math.max(1, item.par * 2 - item.qty);
                          return (
                            <div key={item.id} style={{ padding: '12px 16px', borderBottom: idx < pLow.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ fontFamily: T.body, fontWeight: 600, fontSize: 13, color: C.white }}>{item.name}</div>
                                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Have {item.qty} · Par {item.par}{item.cost ? ` · $${fmt(item.cost)}/unit` : ''}</div>
                                  {item.lotNum && <div style={{ fontSize: 10, color: C.muted }}>Last lot: {item.lotNum}</div>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontFamily: T.body, fontWeight: 700, fontSize: 13, color: C.gold }}>~{suggest} {item.unit}</div>
                                  {item.cost > 0 && <div style={{ fontSize: 11, color: C.dim }}>${fmt(suggest * item.cost)}</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div style={{ ...s.card, padding: '14px 16px', borderTop: `2px solid ${C.gold}`, marginTop: 8 }}>
                  <div style={{ fontFamily: T.body, fontSize: 11, color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Estimated Total</div>
                  <div style={{ fontFamily: T.display, fontSize: 28, color: C.white, fontWeight: 300 }}>${fmt(lowItems.reduce((s, i) => s + Math.max(1, i.par * 2 - i.qty) * (i.cost || 0), 0))}</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LOG ── */}
        {view === 'log' && (
          <div>
            <div style={{ fontFamily: T.display, fontSize: 26, color: C.white, fontWeight: 300, marginBottom: 18 }}>Activity</div>
            {log.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: C.dim }}>
                <div style={{ fontFamily: T.display, fontSize: 18, color: C.white, fontWeight: 300 }}>No activity yet</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Use "Log Use" on any item to start tracking</div>
              </div>
            ) : (
              <div style={s.card}>
                {log.map(entry => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontFamily: T.body, fontWeight: 600, fontSize: 13, color: C.white }}>{entry.itemName}</div>
                      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>
                        {entry.category}
                        {entry.provider && <span style={{ color: C.gold, marginLeft: 6 }}>· {entry.provider}</span>}
                        {entry.note && <span style={{ marginLeft: 6 }}>· {entry.note}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: T.display, fontSize: 20, color: entry.change < 0 ? C.red : C.green, fontWeight: 400 }}>{entry.change < 0 ? entry.change : `+${entry.change}`}</div>
                      <div style={{ fontSize: 10, color: C.dim }}>{entry.date} · {entry.newQty} left</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SNAPSHOT ── */}
        {view === 'snapshot' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontFamily: T.display, fontSize: 26, color: C.white, fontWeight: 300 }}>Snapshot</div>
              <button onClick={() => { navigator.clipboard?.writeText(snapshotText()); showToast('Copied to clipboard'); }} style={s.btn('primary')}>Copy All</button>
            </div>
            <pre style={{ ...s.card, padding: 16, fontSize: 10, lineHeight: 1.8, color: C.dim, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{snapshotText()}</pre>
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: C.charcoal, borderTop: `1px solid ${C.border}`, height: NAV_H, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItem('dashboard', '◈', 'Home')}
        {navItem('inventory', '▦', 'Stock')}
        {navItem('orders', '◎', 'Orders')}
        {navItem('log', '◷', 'Activity')}
        {navItem('snapshot', '⊡', 'Report')}
      </div>

      {/* Modals */}
      {modal === 'add' && <Modal title='Add New Item' onClose={() => setModal(null)}><ItemForm onSave={saveItem} onCancel={() => setModal(null)} /></Modal>}
      {modal?.type === 'edit' && <Modal title='Edit Item' onClose={() => setModal(null)}><ItemForm initial={modal.item} onSave={saveItem} onCancel={() => setModal(null)} onDelete={() => deleteItem(modal.item.id)} /></Modal>}
      {logItem && (
        <LogModal
          item={logItem}
          onClose={() => setLogItem(null)}
          onConfirm={(opts) => {
            if (logItem._restock) opts = { ...opts, type: 'restock' };
            confirmLog(logItem, opts);
          }}
        />
      )}
    </div>
  );
}
