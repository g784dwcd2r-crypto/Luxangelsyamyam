import React, { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
LUX ANGELS CLEANING — Management System v3 (Bug-free)
═══════════════════════════════════════════════════════════ */

// ── Persistence ──
const STORE_KEY = "lux-angels-v3";
const loadStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY));
  } catch {
    return null;
  }
};
const saveStore = (d) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(d));
  } catch {}
};

const DEFAULTS = {
  employees: [],
  clients: [],
  schedules: [],
  clockEntries: [],
  invoices: [],
  payslips: [],
  ownerPin: "1234",
  employeePins: {},
  settings: {
    companyName: "Lux Angels Cleaning",
    companyAddress: "12 Rue de la Liberté, L-1930 Luxembourg",
    companyEmail: "info@luxangels.lu",
    companyPhone: "+352 123 456",
    vatNumber: "LU12345678",
    bankIban: "LU12 3456 7890 1234 5678",
    defaultVatRate: 17,
  },
};

// ── Utils ──
let _idCtr = Date.now();
const makeId = () => `id_${_idCtr++}`;
const getToday = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const fmtBoth = (d) => `${fmtDate(d)} ${fmtTime(d)}`;
const calcHrs = (a, b) =>
  a && b
    ? Math.max(0, Math.round(((new Date(b) - new Date(a)) / 36e5) * 100) / 100)
    : 0;
const makeISO = (d, t) => `${d}T${t}:00`;

// ── Theme ──
const CL = {
  bg: "#0C0F16",
  sf: "#151922",
  s2: "#1C2130",
  bd: "#2C3348",
  gold: "#D4A843",
  goldDark: "#B08C2F",
  goldLight: "#F0D78C",
  blue: "#4A9FD9",
  green: "#3EC47E",
  red: "#D95454",
  orange: "#E89840",
  text: "#E4E6ED",
  muted: "#838AA3",
  dim: "#525976",
  white: "#FFF",
};

// ── Base Styles ──
const inputSt = {
  width: "100%",
  padding: "10px 14px",
  background: CL.sf,
  border: `1px solid ${CL.bd}`,
  borderRadius: 8,
  color: CL.text,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
const btnPri = {
  padding: "10px 20px",
  background: CL.gold,
  color: CL.bg,
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};
const btnSec = {
  ...btnPri,
  background: CL.s2,
  color: CL.text,
  border: `1px solid ${CL.bd}`,
};
const btnDng = { ...btnPri, background: CL.red, color: CL.white };
const btnSm = { padding: "6px 12px", fontSize: 13 };
const cardSt = {
  background: CL.sf,
  border: `1px solid ${CL.bd}`,
  borderRadius: 12,
  padding: 24,
};
const thSt = {
  textAlign: "left",
  padding: "10px 14px",
  color: CL.muted,
  fontWeight: 500,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  borderBottom: `1px solid ${CL.bd}`,
};
const tdSt = {
  padding: "10px 14px",
  borderBottom: `1px solid ${CL.bd}`,
  color: CL.text,
  fontSize: 14,
};

// ── Icons ──
const SvgIcon = ({ paths, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths}
  </svg>
);

const ICN = {
  dash: (
    <SvgIcon
      paths={
        <>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </>
      }
    />
  ),
  team: (
    <SvgIcon
      paths={
        <>
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </>
      }
    />
  ),
  user: (
    <SvgIcon
      paths={
        <>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      }
    />
  ),
  cal: (
    <SvgIcon
      paths={
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      }
    />
  ),
  clock: (
    <SvgIcon
      paths={
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      }
    />
  ),
  close: (
    <SvgIcon
      paths={
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      }
    />
  ),
};

// ── UI Components ──
const ModalBox = ({ title, onClose, children, wide }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 0,
    }}
    onClick={onClose}
  >
    <div
      className={wide ? "modal-wide" : "modal-normal"}
      style={{ ...cardSt, overflow: "auto" }}
      onClick={(ev) => ev.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          position: "sticky",
          top: 0,
          background: CL.sf,
          paddingBottom: 10,
          zIndex: 1,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            color: CL.gold,
            fontFamily: "var(--hd)",
          }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: CL.muted,
            padding: 8,
          }}
        >
          {ICN.close}
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        marginBottom: 5,
        fontSize: 13,
        color: CL.muted,
        fontWeight: 500,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const TextInput = (props) => (
  <input {...props} style={{ ...inputSt, ...(props.style || {}) }} />
);
const SelectInput = ({ children, ...props }) => (
  <select
    {...props}
    style={{ ...inputSt, appearance: "auto", ...(props.style || {}) }}
  >
    {children}
  </select>
);
const TextArea = (props) => (
  <textarea
    {...props}
    style={{
      ...inputSt,
      minHeight: 80,
      resize: "vertical",
      ...(props.style || {}),
    }}
  />
);
const Badge = ({ children, color = CL.gold }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: color + "20",
      color,
    }}
  >
    {children}
  </span>
);
const StatCard = ({ label, value, icon, color = CL.gold }) => (
  <div
    style={{
      ...cardSt,
      display: "flex",
      alignItems: "center",
      gap: 14,
      flex: 1,
      minWidth: 160,
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: color + "15",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 12, color: CL.muted, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--hd)" }}>
        {value}
      </div>
    </div>
  </div>
);
const ToastMsg = ({ message, type }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 2000,
      padding: "12px 22px",
      borderRadius: 10,
      background:
        type === "success"
          ? CL.green
          : type === "error"
            ? CL.red
            : CL.blue,
      color: CL.white,
      fontWeight: 600,
      fontSize: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,.4)",
      animation: "slideIn .3s ease",
    }}
  >
    {message}
  </div>
);

// Tab bar for forms
const FormTabs = ({ tabs, active, onChange }) => (
  <div
    style={{
      display: "flex",
      gap: 0,
      marginBottom: 16,
      borderBottom: `1px solid ${CL.bd}`,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          padding: "8px 14px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: active === t.id ? CL.gold : CL.muted,
          fontWeight: active === t.id ? 600 : 400,
          fontSize: 13,
          borderBottom:
            active === t.id ? `2px solid ${CL.gold}` : "2px solid transparent",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);

// ── Excel Export ──
const exportExcel = async (data) => {
  const XLSX = await import(
    "https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs"
  );
  const wb = XLSX.utils.book_new();
  const addSheet = (name, rows, cols) => {
    const ws = XLSX.utils.json_to_sheet(
      rows.length ? rows : [Object.fromEntries(cols.map((c) => [c, ""]))]
    );
    ws["!cols"] = cols.map((c) => ({ wch: Math.max(c.length + 4, 14) }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  // TODO: addSheets from pasted code in next step.

  XLSX.writeFile(wb, `LuxAngels_DB_${getToday()}.xlsx`);
};

export default function App() {
  return (
    <div style={{ padding: 24, background: CL.bg, minHeight: "100vh", color: CL.text }}>
      <h1 style={{ marginTop: 0, color: CL.gold }}>Lux Angels Cleaning</h1>
      <p style={{ color: CL.muted }}>Part 2 loaded. Next: paste the addSheet(...) blocks.</p>
    </div>
  );
}