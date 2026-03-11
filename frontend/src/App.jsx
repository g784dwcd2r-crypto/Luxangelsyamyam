

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import ExcelJS from "exceljs";

/* ===========================================================
LUX ANGELS CLEANING - Management System v3 (Bug-free) 
=========================================================== */

// -- Persistence --
const STORE_KEY = "lux-angels-v3";
const LANG_KEY = "lux-angels-lang";
const loadStore = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } };
const saveStore = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {} };
const loadLang = () => {
try { return localStorage.getItem(LANG_KEY) || "fr"; } catch { return "fr"; }
};
const saveLang = (lang) => { try { localStorage.setItem(LANG_KEY, lang); } catch {} };

const I18N = {
fr: {
language: "Langue", french: "Français", english: "Anglais", login: "Connexion", welcome: "Bienvenue", selectRole: "Rôle", pin: "Code PIN", loginBtn: "Se connecter",
dashboard: "Tableau de bord", employees: "Employés", clients: "Clients", schedule: "Planning", timeclock: "Pointage", inventory: "Stock", devis: "Devis", invoices: "Factures", payslips: "Fiches de paie", conges: "Congés", reminders: "Rappels", reports: "Rapports", database: "Base Excel", settings: "Paramètres",
newQuote: "Nouveau devis", editQuote: "Modifier devis", newInvoice: "Nouvelle facture", editInvoice: "Modifier facture", save: "Enregistrer", cancel: "Annuler", actions: "Actions", status: "Statut", client: "Client", date: "Date", amount: "Montant", view: "Voir", sendEmail: "Envoyer email", draft: "Brouillon", sent: "Envoyée", paid: "Payée", overdue: "En retard", auto: "Auto", select: "Sélectionner...", prestationDate: "Date de prestation",
invoice: "Facture", quote: "Devis", dueDate: "Date échéance", notes: "Notes", total: "Total", subtotal: "Sous-total", vat: "TVA", item: "Ligne", qty: "Qté", unitPrice: "Prix unitaire", description: "Description",
managementSystem: "Système de gestion", ownerAccess: "Accès propriétaire", ownerAccessDesc: "Tableau de gestion complet", cleanerAccess: "Accès agent", cleanerAccessDesc: "Planning, heures, pointage et congés",
back: "Retour", ownerLogin: "Connexion propriétaire", cleanerLogin: "Connexion agent", yourName: "Votre nom", choose: "Choisir...", logout: "Déconnexion", visitation: "Visites", history: "Historique", downloadApp: "Télécharger l'application", ownerPortal: "Portail propriétaire", managerPortal: "Portail manager", visitationSchedule: "Planning des visites", historyImages: "Historique & images", installIntro: "Choisissez votre téléphone puis appuyez sur installer.", installOnIphone: "Installer sur iPhone", installOnAndroid: "Installer sur Android",
mySchedule: "Mon planning", clockInOut: "Pointage entrée/sortie", photoUploads: "Photos", products: "Produits", upcomingJobs: "Interventions à venir", noUpcomingJobs: "Aucune intervention à venir"
},
en: {
language: "Language", french: "French", english: "English", login: "Login", welcome: "Welcome", selectRole: "Role", pin: "PIN", loginBtn: "Sign in",
dashboard: "Dashboard", employees: "Employees", clients: "Clients", schedule: "Schedule", timeclock: "Time Clock", inventory: "Inventory", devis: "Quotes", invoices: "Invoices", payslips: "Payslips", conges: "Leave", reminders: "Reminders", reports: "Reports", database: "Excel DB", settings: "Settings",
newQuote: "New quote", editQuote: "Edit quote", newInvoice: "New invoice", editInvoice: "Edit invoice", save: "Save", cancel: "Cancel", actions: "Actions", status: "Status", client: "Client", date: "Date", amount: "Amount", view: "View", sendEmail: "Send email", draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", auto: "Auto", select: "Select...", prestationDate: "Service date",
invoice: "Invoice", quote: "Quote", dueDate: "Due date", notes: "Notes", total: "Total", subtotal: "Subtotal", vat: "VAT", item: "Item", qty: "Qty", unitPrice: "Unit price", description: "Description",
managementSystem: "Management System", ownerAccess: "Owner Access", ownerAccessDesc: "Full management dashboard", cleanerAccess: "Cleaner Access", cleanerAccessDesc: "Schedule, hours, clock & time-off",
back: "Back", ownerLogin: "Owner Login", cleanerLogin: "Cleaner Login", yourName: "Your Name", choose: "Choose...", logout: "Logout", visitation: "Visitation", history: "History", downloadApp: "Download App", ownerPortal: "Owner Portal", managerPortal: "Manager Portal", visitationSchedule: "Visitation Schedule", historyImages: "History & Images", installIntro: "Choose your phone, then tap install.", installOnIphone: "Install on iPhone", installOnAndroid: "Install on Android",
mySchedule: "My Schedule", clockInOut: "Clock In/Out", photoUploads: "Photo Uploads", products: "Products", upcomingJobs: "Upcoming Jobs", noUpcomingJobs: "No upcoming jobs"
}
};
const LanguageContext = createContext({ lang: "fr", setLang: () => {}, t: (k) => k });
const useI18n = () => useContext(LanguageContext);
const tr = (lang, key, fallback = key) => I18N[lang]?.[key] || I18N.fr?.[key] || fallback;
const localeForLang = (lang) => lang === "en" ? "en-GB" : "fr-FR";
let CURRENT_LANG = "fr";

const DEFAULTS = {
employees: [], clients: [], schedules: [], clockEntries: [], quotes: [], invoices: [], payslips: [],
photoUploads: [], timeOffRequests: [], inventoryProducts: [], productRequests: [], cleanerProductHoldings: [], prospectVisits: [],
ownerUsername: "info@luxangelscleaning.lu", ownerPin: "0000",
managerUsername: "manager", managerPin: "4321",
employeePins: {}, employeeUsernames: {},
settings: {
companyName: "LAC Lux angels cleaning",
companyAddress: "12 Rue de la Liberté, L-1930 Luxembourg",
companyEmail: "info@luxangels.lu",
companyPhone: "+352 123 456",
vatNumber: "LU12345678",
bankIban: "LU12 3456 7890 1234 5678",
defaultVatRate: 17,
},
};

// -- Utils --
let _idCtr = Date.now();
const makeId = () => `id_${_idCtr++}`;
const getToday = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString(localeForLang(CURRENT_LANG), { day: "2-digit", month: "short", year: "numeric" }) : "";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString(localeForLang(CURRENT_LANG), { hour: "2-digit", minute: "2-digit" }) : "";
const fmtBoth = (d) => `${fmtDate(d)} ${fmtTime(d)}`;
const calcHrs = (a, b) => (a && b) ? Math.max(0, Math.round((new Date(b) - new Date(a)) / 36e5 * 100) / 100) : 0;
const makeISO = (d, t) => `${d}T${t}:00`;
const mapsUrl = (address = "") => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const scheduleStatusColor = (status) => status === "completed" ? CL.green : status === "in-progress" ? CL.orange : status === "cancelled" ? CL.red : CL.blue;
const getScheduleForClockEvent = (schedules, { employeeId, clientId, date }) => schedules
.filter(s => s.employeeId === employeeId && s.clientId === clientId && s.date === date && s.status !== "cancelled")
.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))[0];
const getLateMeta = (schedules, { employeeId, clientId, clockInAt = new Date() }) => {
const date = clockInAt.toISOString().slice(0, 10);
const scheduled = getScheduleForClockEvent(schedules, { employeeId, clientId, date });
if (!scheduled?.startTime) return { isLate: false, lateMinutes: 0, scheduledStart: null, scheduleId: scheduled?.id || null, workDate: date };
const scheduledAt = new Date(makeISO(date, scheduled.startTime));
const lateMinutes = Math.max(0, Math.round((clockInAt - scheduledAt) / 60000));
return { isLate: lateMinutes > 0, lateMinutes, scheduledStart: makeISO(date, scheduled.startTime), scheduleId: scheduled.id, workDate: date };
};
const leaveDaysInclusive = (startDate, endDate) => {
if (!startDate || !endDate) return 0;
const start = new Date(`${startDate}T00:00:00`);
const end = new Date(`${endDate}T00:00:00`);
if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
return Math.floor((end - start) / 86400000) + 1;
};
const getLeaveSummary = (data, employeeId, year = getToday().slice(0, 4)) => {
const allowance = data.employees.find(e => e.id === employeeId)?.leaveAllowance ?? 26;
const requests = (data.timeOffRequests || []).filter(r => r.employeeId === employeeId && (r.startDate || "").startsWith(year));
const approvedDays = requests.filter(r => r.status === "approved").reduce((sum, r) => sum + leaveDaysInclusive(r.startDate, r.endDate), 0);
const pendingDays = requests.filter(r => r.status === "pending").reduce((sum, r) => sum + leaveDaysInclusive(r.startDate, r.endDate), 0);
return { allowance, approvedDays, pendingDays, remaining: Math.max(0, allowance - approvedDays), requests };
};
const updateScheduleStatusForJob = (schedules, { employeeId, clientId, date, from, to }) => {
const idx = schedules.findIndex(s => s.employeeId === employeeId && s.clientId === clientId && s.date === date && s.status === from);
if (idx === -1) return schedules;
const next = [...schedules];
next[idx] = { ...next[idx], status: to };
return next;
};
const syncSchedulesWithClockEntries = (schedules = [], clockEntries = []) => schedules.map(sched => {
if (sched.status === "cancelled") return sched;
const related = clockEntries.filter(c => c.employeeId === sched.employeeId && c.clientId === sched.clientId && c.clockIn?.slice(0, 10) === sched.date);
const hasActive = related.some(c => !c.clockOut);
const hasCompleted = related.some(c => c.clockOut);
const nextStatus = hasActive ? "in-progress" : hasCompleted ? "completed" : "scheduled";
return sched.status === nextStatus ? sched : { ...sched, status: nextStatus };
});

// -- Theme --
const CL = {
bg: "#0C0F16", sf: "#151922", s2: "#1C2130", bd: "#2C3348",
gold: "#D4A843", goldDark: "#B08C2F", goldLight: "#F0D78C",
blue: "#4A9FD9", green: "#3EC47E", red: "#D95454", orange: "#E89840",
text: "#E4E6ED", muted: "#838AA3", dim: "#525976", white: "#FFF",
};

// -- Base Styles --
const inputSt = { width: "100%", padding: "12px 16px", background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 10, color: CL.text, fontSize: 14, outline: "none", boxSizing: "border-box" };
const btnPri = { padding: "10px 20px", background: CL.gold, color: CL.bg, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
const btnSec = { ...btnPri, background: CL.s2, color: CL.text, border: `1px solid ${CL.bd}` };
const btnDng = { ...btnPri, background: CL.red, color: CL.white };
const btnSm = { padding: "6px 12px", fontSize: 13 };
const cardSt = { background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 14, padding: 28 };
const thSt = { textAlign: "left", padding: "10px 14px", color: CL.muted, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: `1px solid ${CL.bd}` };
const tdSt = { padding: "10px 14px", borderBottom: `1px solid ${CL.bd}`, color: CL.text, fontSize: 14 };

// -- Icons --
const SvgIcon = ({ paths, size = 18 }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);
const ICN = {
dash: <SvgIcon paths={<><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>} />,
team: <SvgIcon paths={<><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>} />,
user: <SvgIcon paths={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />,
cal: <SvgIcon paths={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />,
clock: <SvgIcon paths={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
doc: <SvgIcon paths={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>} />,
pay: <SvgIcon paths={<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>} />,
mail: <SvgIcon paths={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>} />,
chart: <SvgIcon paths={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>} />,
gear: <SvgIcon paths={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>} />,
plus: <SvgIcon paths={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />,
edit: <SvgIcon paths={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />,
trash: <SvgIcon paths={<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>} />,
download: <SvgIcon paths={<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} />,
check: <SvgIcon paths={<><polyline points="20 6 9 17 4 12"/></>} />,
close: <SvgIcon paths={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />,
search: <SvgIcon paths={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />,
logout: <SvgIcon paths={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />,
excel: <SvgIcon paths={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>} />,
shield: <SvgIcon paths={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>} />,
};

// -- UI Components --
const ModalBox = ({ title, onClose, children, wide }) => (

  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "30px" }} onClick={onClose}>
    <div className={wide ? "modal-wide" : "modal-normal"} style={{ ...cardSt, overflow: "auto" }} onClick={ev => ev.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "sticky", top: 0, background: CL.sf, paddingBottom: 14, zIndex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: CL.gold, fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: CL.muted, padding: 8 }}>{ICN.close}</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (

  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", marginBottom: 5, fontSize: 13, color: CL.muted, fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

const TextInput = (props) => <input {...props} style={{ ...inputSt, ...(props.style || {}) }} />;
const SelectInput = ({ children, ...props }) => <select {...props} style={{ ...inputSt, appearance: "auto", color: CL.text, colorScheme: "dark", ...(props.style || {}) }}>{children}</select>;
const TextArea = (props) => <textarea {...props} style={{ ...inputSt, minHeight: 80, resize: "vertical", ...(props.style || {}) }} />;
const Badge = ({ children, color = CL.gold }) => <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: color + "20", color }}>{children}</span>;
const StatCard = ({ label, value, icon, color = CL.gold }) => (

  <div style={{ ...cardSt, display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 160 }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
    <div><div style={{ fontSize: 12, color: CL.muted, marginBottom: 2 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div></div>
  </div>
);
const ToastMsg = ({ message, type }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, padding: "12px 22px", borderRadius: 10, background: type === "success" ? CL.green : type === "error" ? CL.red : CL.blue, color: CL.white, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,.4)", animation: "slideIn .3s ease" }}>{message}</div>
);

// Tab bar for forms
const FormTabs = ({ tabs, active, onChange }) => (

  <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${CL.bd}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", color: active === t.id ? CL.gold : CL.muted, fontWeight: active === t.id ? 600 : 400, fontSize: 13, borderBottom: active === t.id ? `2px solid ${CL.gold}` : "2px solid transparent", whiteSpace: "nowrap", flexShrink: 0 }}>{t.label}</button>
    ))}
  </div>
);

// -- Excel Export --
const exportExcel = async (data) => {
const wb = new ExcelJS.Workbook();
const addSheet = (name, rows, cols) => {
const ws = wb.addWorksheet(name);
ws.columns = cols.map(c => ({ header: c, key: c, width: Math.max(c.length + 4, 14) }));
ws.addRows(rows.length ? rows : [Object.fromEntries(cols.map(c => [c, ""]))]);
};

addSheet("Employees", data.employees.map(emp => ({ ID: emp.id, Name: emp.name, Username: data.employeeUsernames?.[emp.id] || "", Email: emp.email, Phone: emp.phone, Mobile: emp.phoneMobile || "", Role: emp.role, "Rate": emp.hourlyRate, Address: emp.address, City: emp.city || "", Zip: emp.postalCode || "", Country: emp.country || "", "Start": emp.startDate, Status: emp.status, Contract: emp.contractType || "", IBAN: emp.bankIban || "", SSN: emp.socialSecNumber || "", DOB: emp.dateOfBirth || "", Nationality: emp.nationality || "", Languages: emp.languages || "", Transport: emp.transport || "", "WorkPermit": emp.workPermit || "", "EmergName": emp.emergencyName || "", "EmergPhone": emp.emergencyPhone || "", Password: data.employeePins?.[emp.id] || "0000", LeaveAllowance: emp.leaveAllowance ?? 26, Notes: emp.notes || "" })),
["ID","Name","Username","Email","Phone","Mobile","Role","Rate","Address","City","Zip","Country","Start","Status","Contract","IBAN","SSN","DOB","Nationality","Languages","Transport","WorkPermit","EmergName","EmergPhone","Password","LeaveAllowance","Notes"]);

addSheet("Clients", data.clients.map(cl => ({ ID: cl.id, Name: cl.name, Contact: cl.contactPerson || "", Email: cl.email, Phone: cl.phone, Mobile: cl.phoneMobile || "", Address: cl.address, "Apt": cl.apartmentFloor || "", City: cl.city || "", Zip: cl.postalCode || "", Country: cl.country || "", Type: cl.type, Freq: cl.cleaningFrequency, Billing: cl.billingType, "Hourly": cl.pricePerHour || 0, "Fixed": cl.priceFixed || 0, Status: cl.status, Lang: cl.language || "", "Code": cl.accessCode || "", "KeyLoc": cl.keyLocation || "", Parking: cl.parkingInfo || "", Pets: cl.petInfo || "", "PrefDay": cl.preferredDay || "", "PrefTime": cl.preferredTime || "", "ContStart": cl.contractStart || "", "ContEnd": cl.contractEnd || "", "SqM": cl.squareMeters || "", "TaxID": cl.taxId || "", "Instructions": cl.specialInstructions || "", Notes: cl.notes || "" })),
["ID","Name","Contact","Email","Phone","Mobile","Address","Apt","City","Zip","Country","Type","Freq","Billing","Hourly","Fixed","Status","Lang","Code","KeyLoc","Parking","Pets","PrefDay","PrefTime","ContStart","ContEnd","SqM","TaxID","Instructions","Notes"]);

addSheet("Schedule", data.schedules.map(sc => { const cl = data.clients.find(c => c.id === sc.clientId); const em = data.employees.find(e => e.id === sc.employeeId); return { ID: sc.id, Date: sc.date, Client: cl?.name || "", CliID: sc.clientId, Employee: em?.name || "", EmpID: sc.employeeId, Start: sc.startTime, End: sc.endTime, Status: sc.status, Notes: sc.notes || "" }; }),
["ID","Date","Client","CliID","Employee","EmpID","Start","End","Status","Notes"]);

addSheet("TimeClock", data.clockEntries.map(ce => { const em = data.employees.find(e => e.id === ce.employeeId); const cl = data.clients.find(c => c.id === ce.clientId); const h = calcHrs(ce.clockIn, ce.clockOut); return { ID: ce.id, Employee: em?.name || "", EmpID: ce.employeeId, Client: cl?.name || "", CliID: ce.clientId, In: ce.clockIn || "", Out: ce.clockOut || "", Hours: ce.clockOut ? h : "Active", Late: ce.isLate ? "yes" : "no", LateMins: ce.lateMinutes || 0, Note: ce.notes || "", Rate: em?.hourlyRate || 0, Cost: ce.clockOut ? Math.round(h * (em?.hourlyRate || 0) * 100) / 100 : "" }; }),
["ID","Employee","EmpID","Client","CliID","In","Out","Hours","Rate","Cost"]);

const invRows = [];
data.invoices.forEach(inv => { const cl = data.clients.find(c => c.id === inv.clientId); (inv.items || [{}]).forEach((item, idx) => { invRows.push({ "Inv": inv.invoiceNumber, Date: inv.date, Due: inv.dueDate || "", Client: cl?.name || "", CliID: inv.clientId, Status: inv.status, Item: item.description || "", Qty: item.quantity || "", Price: item.unitPrice || "", LineTotal: item.total || "", Sub: idx === 0 ? inv.subtotal : "", "VAT%": idx === 0 ? inv.vatRate : "", VAT: idx === 0 ? inv.vatAmount : "", Total: idx === 0 ? inv.total : "", Notes: idx === 0 ? (inv.notes || "") : "" }); }); });
addSheet("Invoices", invRows, ["Inv","Date","Due","Client","CliID","Status","Item","Qty","Price","LineTotal","Sub","VAT%","VAT","Total","Notes"]);

addSheet("Payslips", data.payslips.map(ps => { const em = data.employees.find(e => e.id === ps.employeeId); return { Num: ps.payslipNumber, Employee: em?.name || "", EmpID: ps.employeeId, Month: ps.month, Hours: ps.totalHours, Rate: ps.hourlyRate, Gross: ps.grossPay, Social: ps.socialCharges, Tax: ps.taxEstimate, Net: ps.netPay, Status: ps.status }; }),
["Num","Employee","EmpID","Month","Hours","Rate","Gross","Social","Tax","Net","Status"]);

addSheet("Settings", [
{ Key: "Company Name", Val: data.settings.companyName }, { Key: "Address", Val: data.settings.companyAddress },
{ Key: "Email", Val: data.settings.companyEmail }, { Key: "Phone", Val: data.settings.companyPhone },
{ Key: "VAT Number", Val: data.settings.vatNumber }, { Key: "Bank IBAN", Val: data.settings.bankIban },
{ Key: "VAT Rate", Val: data.settings.defaultVatRate },
{ Key: "Owner Username", Val: data.ownerUsername || "info@luxangelscleaning.lu" }, { Key: "Owner Password", Val: data.ownerPin || "0000" },
{ Key: "Manager Username", Val: data.managerUsername || "manager" }, { Key: "Manager Password", Val: data.managerPin || "4321" },
], ["Key", "Val"]);

const months = [...new Set(data.clockEntries.filter(c => c.clockOut && c.clockIn).map(c => c.clockIn.slice(0, 7)))].sort();
addSheet("Summary", months.map(mo => {
const ents = data.clockEntries.filter(c => c.clockOut && c.clockIn?.startsWith(mo));
const totalH = ents.reduce((sum, ce) => sum + calcHrs(ce.clockIn, ce.clockOut), 0);
const laborCost = ents.reduce((sum, ce) => { const em = data.employees.find(x => x.id === ce.employeeId); return sum + calcHrs(ce.clockIn, ce.clockOut) * (em?.hourlyRate || 0); }, 0);
const revenue = data.invoices.filter(inv => inv.date?.startsWith(mo)).reduce((sum, inv) => sum + (inv.total || 0), 0);
return { Month: mo, Hours: Math.round(totalH * 100) / 100, Labor: Math.round(laborCost * 100) / 100, Revenue: Math.round(revenue * 100) / 100, Profit: Math.round((revenue - laborCost) * 100) / 100 };
}), ["Month", "Hours", "Labor", "Revenue", "Profit"]);

const buffer = await wb.xlsx.writeBuffer();
const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url; a.download = `LuxAngels_DB_${getToday()}.xlsx`; a.click();
URL.revokeObjectURL(url);
};

// -- Excel Import --
const importExcel = async (file, setData, showToast) => {
try {
const buffer = await file.arrayBuffer();
const wb = new ExcelJS.Workbook();
await wb.xlsx.load(buffer);
const sheet = (name) => {
  const ws = wb.getWorksheet(name);
  if (!ws) return [];
  const hdrs = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, colIdx) => {
    hdrs[colIdx] = cell.value;
  });
  const rows = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      if (hdrs[colIdx]) obj[hdrs[colIdx]] = cell.value != null ? cell.value : "";
    });
    if (Object.keys(obj).length) rows.push(obj);
  });
  return rows;
};

  const emps = sheet("Employees").filter(r => r.ID && r.Name).map(r => ({ id: r.ID, name: r.Name, email: r.Email || "", phone: r.Phone || "", phoneMobile: r.Mobile || "", role: r.Role || "Cleaner", hourlyRate: parseFloat(r.Rate) || 15, address: r.Address || "", city: r.City || "", postalCode: r.Zip || "", country: r.Country || "Luxembourg", startDate: r.Start || getToday(), status: r.Status || "active", contractType: r.Contract || "CDI", bankIban: r.IBAN || "", socialSecNumber: r.SSN || "", dateOfBirth: r.DOB || "", nationality: r.Nationality || "", languages: r.Languages || "", transport: r.Transport || "", workPermit: r.WorkPermit || "", emergencyName: r.EmergName || "", emergencyPhone: r.EmergPhone || "", leaveAllowance: parseInt(r.LeaveAllowance || "26", 10) || 26, notes: r.Notes || "" }));
  const pins = {}; sheet("Employees").filter(r => r.ID).forEach(r => { pins[r.ID] = String(r.Password || r.PIN || "0000"); });
  const employeeUsernames = {}; sheet("Employees").filter(r => r.ID && r.Username).forEach(r => { employeeUsernames[r.ID] = String(r.Username); });

  const clients = sheet("Clients").filter(r => r.ID && r.Name).map(r => ({ id: r.ID, name: r.Name, contactPerson: r.Contact || "", email: r.Email || "", phone: r.Phone || "", phoneMobile: r.Mobile || "", address: r.Address || "", apartmentFloor: r.Apt || "", city: r.City || "", postalCode: r.Zip || "", country: r.Country || "Luxembourg", type: r.Type || "Residential", cleaningFrequency: r.Freq || "Weekly", billingType: r.Billing || "hourly", pricePerHour: parseFloat(r.Hourly) || 35, priceFixed: parseFloat(r.Fixed) || 0, status: r.Status || "active", language: r.Lang || "FR", accessCode: r.Code || "", keyLocation: r.KeyLoc || "", parkingInfo: r.Parking || "", petInfo: r.Pets || "", preferredDay: r.PrefDay || "", preferredTime: r.PrefTime || "", contractStart: r.ContStart || "", contractEnd: r.ContEnd || "", squareMeters: r.SqM || "", taxId: r.TaxID || "", specialInstructions: r.Instructions || "", notes: r.Notes || "" }));

  const scheds = sheet("Schedule").filter(r => r.ID).map(r => ({ id: r.ID, date: r.Date || "", clientId: r.CliID || "", employeeId: r.EmpID || "", startTime: r.Start || "08:00", endTime: r.End || "12:00", status: r.Status || "scheduled", notes: r.Notes || "", recurrence: "none" }));
  const clocks = sheet("TimeClock").filter(r => r.ID).map(r => ({ id: r.ID, employeeId: r.EmpID || "", clientId: r.CliID || "", clockIn: r.In || "", clockOut: r.Out || null, notes: r.Note || "", isLate: String(r.Late || "").toLowerCase() === "yes", lateMinutes: parseFloat(r.LateMins) || 0 }));

  const invMap = {};
  sheet("Invoices").filter(r => r.Inv).forEach(r => {
    if (!invMap[r.Inv]) invMap[r.Inv] = { id: makeId(), invoiceNumber: r.Inv, date: r.Date || "", dueDate: r.Due || "", clientId: r.CliID || "", status: r.Status || "draft", items: [], subtotal: parseFloat(r.Sub) || 0, vatRate: parseFloat(r["VAT%"]) || 17, vatAmount: parseFloat(r.VAT) || 0, total: parseFloat(r.Total) || 0, notes: r.Notes || "", paymentTerms: "Due within 30 days." };
    if (r.Item) invMap[r.Inv].items.push({ description: r.Item, quantity: parseFloat(r.Qty) || 1, unitPrice: parseFloat(r.Price) || 0, total: parseFloat(r.LineTotal) || 0 });
  });

  const payslips = sheet("Payslips").filter(r => r.Num).map(r => ({ id: makeId(), payslipNumber: r.Num, employeeId: r.EmpID || "", month: r.Month || "", totalHours: parseFloat(r.Hours) || 0, hourlyRate: parseFloat(r.Rate) || 0, grossPay: parseFloat(r.Gross) || 0, socialCharges: parseFloat(r.Social) || 0, taxEstimate: parseFloat(r.Tax) || 0, netPay: parseFloat(r.Net) || 0, status: r.Status || "draft", createdAt: new Date().toISOString() }));

  const sett = {}; sheet("Settings").forEach(r => { if (r.Key) sett[r.Key] = r.Val; });

  setData(prev => ({
    ...prev,
    employees: emps.length ? emps : prev.employees,
    employeePins: Object.keys(pins).length ? pins : prev.employeePins,
    employeeUsernames: Object.keys(employeeUsernames).length ? employeeUsernames : prev.employeeUsernames,
    clients: clients.length ? clients : prev.clients,
    schedules: scheds.length ? scheds : prev.schedules,
    clockEntries: clocks.length ? clocks : prev.clockEntries,
    invoices: Object.values(invMap).length ? Object.values(invMap) : prev.invoices,
    payslips: payslips.length ? payslips : prev.payslips,
    ownerUsername: sett["Owner Username"] || prev.ownerUsername || "info@luxangelscleaning.lu",
    ownerPin: sett["Owner Password"] || sett["Owner PIN"] || prev.ownerPin || "0000",
    managerUsername: sett["Manager Username"] || prev.managerUsername || "manager",
    managerPin: sett["Manager Password"] || sett["Manager PIN"] || prev.managerPin || "4321",
    settings: { ...prev.settings, companyName: sett["Company Name"] || prev.settings.companyName, companyAddress: sett["Address"] || prev.settings.companyAddress, companyEmail: sett["Email"] || prev.settings.companyEmail, companyPhone: sett["Phone"] || prev.settings.companyPhone, vatNumber: sett["VAT Number"] || prev.settings.vatNumber, bankIban: sett["Bank IBAN"] || prev.settings.bankIban, defaultVatRate: parseFloat(sett["VAT Rate"]) || prev.settings.defaultVatRate },
  }));
  showToast("Excel imported!", "success");
} catch (err) { console.error(err); showToast("Import failed", "error"); }
};

// ==============================================
// GLOBAL CSS
// ==============================================
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Cormorant+Garamond:wght@600;700&display=swap');
:root { --bd: Outfit, sans-serif; --hd: Cormorant Garamond, serif; }

* { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: ${CL.bd}; border-radius: 3px; }
  @keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  input:focus, select:focus, textarea:focus { border-color: ${CL.gold} !important; }
  input[type="date"], input[type="time"], input[type="month"], input[type="datetime-local"] { color-scheme: dark; }
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator,
  input[type="month"]::-webkit-calendar-picker-indicator,
  input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.95); cursor: pointer; }
  @media print { .no-print { display: none !important; } }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-row { display: flex; gap: 16px; flex-wrap: wrap; }
.sched-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-layout { display: flex; gap: 22px; flex-wrap: wrap; }
.cal-main { flex: 1 1 600px; min-width: 0; }
.cal-side { flex: 0 0 280px; min-width: 240px; }
.tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.tbl-wrap table { min-width: 680px; }
.modal-normal { width: 760px; max-width: 95vw; max-height: 94vh; padding: 36px !important; }
.modal-wide { width: 1020px; max-width: 95vw; max-height: 94vh; padding: 38px !important; }
.desk-sidebar { display: flex; }
.mob-nav { display: none; }
.main-content { padding: 30px; }

@media (max-width: 1024px) {
.sched-grid { grid-template-columns: repeat(7, 1fr); }
.cal-side { flex: 0 0 100%; }
.grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
.desk-sidebar { display: none !important; }
.mob-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 900; background: ${CL.sf}; border-top: 1px solid ${CL.bd}; padding: 4px 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.mob-nav button { flex: none; padding: 6px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px; border: none; background: transparent; cursor: pointer; font-size: 9px; min-width: 52px; white-space: nowrap; font-family: 'Outfit', sans-serif; }
.main-content { padding: 18px 16px 84px 16px; }
.grid-2, .form-grid { grid-template-columns: 1fr; }
.stat-row > div { min-width: calc(50% - 8px) !important; flex: 1 1 calc(50% - 8px) !important; }
.modal-normal, .modal-wide { width: 100% !important; max-width: 100vw !important; max-height: 100vh !important; border-radius: 0 !important; padding: 22px !important; }
}
@media (max-width: 480px) {
.sched-grid { grid-template-columns: repeat(7, 1fr); }
.grid-3 { grid-template-columns: 1fr; }
.stat-row > div { min-width: 100% !important; flex: 1 1 100% !important; }
.main-content { padding: 14px 10px 82px 10px; }
}
`;

// ==============================================
// MAIN APP
// ==============================================
function LanguageSwitcher({ compact = false }) {
const { lang, setLang, t } = useI18n();
return (
<div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
{!compact && <span style={{ color: CL.muted, fontSize: 12 }}>{t("language")}</span>}
<button style={{ ...btnSec, ...btnSm, background: lang === "fr" ? CL.gold + "20" : CL.s2, color: lang === "fr" ? CL.gold : CL.text }} onClick={() => setLang("fr")}>{t("french")}</button>
<button style={{ ...btnSec, ...btnSm, background: lang === "en" ? CL.gold + "20" : CL.s2, color: lang === "en" ? CL.gold : CL.text }} onClick={() => setLang("en")}>{t("english")}</button>
</div>
);
}

export default function App() {
const [data, setData] = useState(() => loadStore() || DEFAULTS);
const [lang, setLang] = useState(() => loadLang());
const [auth, setAuth] = useState(null);
const [toast, setToast] = useState(null);
const [section, setSection] = useState("dashboard");
const [devisSeed, setDevisSeed] = useState(null);
const [sideOpen, setSideOpen] = useState(true);
const installPromptRef = useRef(null);

useEffect(() => {
const onBeforeInstallPrompt = (ev) => {
  ev.preventDefault();
  installPromptRef.current = ev;
};
const onInstalled = () => { installPromptRef.current = null; };
window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
window.addEventListener("appinstalled", onInstalled);
return () => {
  window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.removeEventListener("appinstalled", onInstalled);
};
}, []);

useEffect(() => { saveStore(data); }, [data]);
useEffect(() => { saveLang(lang); CURRENT_LANG = lang; }, [lang]);
const t = useCallback((key, fallback) => tr(lang, key, fallback), [lang]);

const showToast = useCallback((msg, type = "success") => {
setToast({ msg, type });
setTimeout(() => setToast(null), 3000);
}, []);

const updateData = useCallback((key, val) => {
setData(prev => {
const nextValue = typeof val === "function" ? val(prev[key]) : val;
const draft = { ...prev, [key]: nextValue };
if (key === "clockEntries" || key === "schedules") {
draft.schedules = syncSchedulesWithClockEntries(draft.schedules, draft.clockEntries);
}
return draft;
});
}, []);

if (!auth) return <LanguageContext.Provider value={{ lang, setLang, t }}><LoginScreen data={data} onAuth={setAuth} /></LanguageContext.Provider>;
if (auth.role === "cleaner") return <LanguageContext.Provider value={{ lang, setLang, t }}><CleanerPortal data={data} updateData={updateData} auth={auth} onLogout={() => setAuth(null)} showToast={showToast} toast={toast} /></LanguageContext.Provider>;

// Owner nav items
const pendingProductRequests = (data.productRequests || []).filter(r => r.status === "pending").length;
const pendingTimeOffRequests = (data.timeOffRequests || []).filter(r => r.status === "pending").length;
const unseenUploads = (data.photoUploads || []).filter(u => !u.seenByOwner).length;

const navItems = [
{ id: "dashboard", label: t("dashboard"), icon: ICN.dash },
{ id: "employees", label: t("employees"), icon: ICN.team },
{ id: "clients", label: t("clients"), icon: ICN.user },
{ id: "schedule", label: t("schedule"), icon: ICN.cal },
{ id: "visits", label: t("visitation"), icon: ICN.cal },
{ id: "timeclock", label: t("timeclock"), icon: ICN.clock },
{ id: "inventory", label: t("inventory"), icon: ICN.doc, hasAlert: pendingProductRequests > 0 },
{ id: "devis", label: t("devis"), icon: ICN.doc },
{ id: "invoices", label: t("invoices"), icon: ICN.doc },
{ id: "payslips", label: t("payslips"), icon: ICN.pay },
{ id: "conges", label: t("conges"), icon: ICN.cal, hasAlert: pendingTimeOffRequests > 0 },
{ id: "history", label: t("history"), icon: ICN.doc, hasAlert: unseenUploads > 0 },
{ id: "reminders", label: t("reminders"), icon: ICN.mail },
{ id: "reports", label: t("reports"), icon: ICN.chart },
{ id: "database", label: t("database"), icon: ICN.excel },
{ id: "download-app", label: t("downloadApp"), icon: ICN.download },
{ id: "settings", label: t("settings"), icon: ICN.gear },
];

const openDownloadApp = () => {
setSection("download-app");
};

const installForPlatform = async (platform) => {
const iosLink = data.settings?.iosAppUrl || "https://apps.apple.com";
const androidLink = data.settings?.androidAppUrl || "https://play.google.com/store";
if (platform === "android" && installPromptRef.current) {
  try {
    await installPromptRef.current.prompt();
    await installPromptRef.current.userChoice;
    installPromptRef.current = null;
    return;
  } catch {
  }
}
window.location.href = platform === "ios" ? iosLink : androidLink;
};

const renderSection = () => {
const props = { data, updateData, showToast, setData, auth, setSection, setDevisSeed, devisSeed };
switch (section) {
case "dashboard": return <DashboardPage data={data} auth={auth} />;
case "employees": return <EmployeesPage {...props} />;
case "clients": return <ClientsPage {...props} />;
case "schedule": return <SchedulePage {...props} />;
case "visits": return <VisitationPage {...props} />;
case "timeclock": return <TimeClockPage {...props} />;
case "inventory": return <InventoryPage {...props} />;
case "devis": return <DevisPage {...props} />;
case "invoices": return <InvoicesPage {...props} />;
case "payslips": return <PayslipsPage {...props} />;
case "conges": return <LeaveManagementPage {...props} />;
case "history": return <HistoryPage {...props} />;
case "reminders": return <RemindersPage data={data} showToast={showToast} />;
case "reports": return <ReportsPage data={data} />;
case "database": return <ExcelDBPage data={data} setData={setData} showToast={showToast} />;
case "download-app": return <DownloadAppPage data={data} onInstallApp={installForPlatform} />;
case "settings": return <SettingsPage {...props} />;
default: return <DashboardPage data={data} auth={auth} />;
}
};

return (
<LanguageContext.Provider value={{ lang, setLang, t }}>
<div style={{ display: "flex", height: "100vh", background: CL.bg, fontFamily: "'Outfit', sans-serif", color: CL.text, overflow: "hidden" }}>
<style>{globalCSS}</style>
{toast && <ToastMsg message={toast.msg} type={toast.type} />}

  {/* Desktop Sidebar */}
  <div className="no-print desk-sidebar" style={{ width: sideOpen ? 215 : 54, background: CL.sf, borderRight: `1px solid ${CL.bd}`, flexDirection: "column", transition: "width .2s", overflow: "hidden", flexShrink: 0 }}>
    <div style={{ padding: sideOpen ? "16px 12px" : "16px 8px", borderBottom: `1px solid ${CL.bd}`, display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => setSideOpen(!sideOpen)}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${CL.gold}, ${CL.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: CL.bg, flexShrink: 0 }}>LAC</div>
      {sideOpen && <div><div style={{ fontSize: 13, fontWeight: 700, color: CL.gold, fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>Lux Angels Cleaning</div><div style={{ fontSize: 10, color: CL.muted }}>{auth.role === "manager" ? t("managerPortal") : t("ownerPortal")}</div></div>}
    </div>
    <nav style={{ flex: 1, padding: "6px 4px", overflowY: "auto" }}>
      {navItems.map(nav => (
        <button key={nav.id} onClick={() => nav.id === "download-app" ? openDownloadApp() : setSection(nav.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: sideOpen ? "7px 10px" : "7px 11px", background: section === nav.id ? CL.gold + "15" : "transparent", border: "none", borderRadius: 7, cursor: "pointer", color: section === nav.id ? CL.gold : CL.muted, fontSize: 13, fontWeight: section === nav.id ? 600 : 400, marginBottom: 1, textAlign: "left", whiteSpace: "nowrap" }}>
          <span style={{ flexShrink: 0 }}>{nav.icon}</span>
          {sideOpen && <span>{nav.label}{nav.hasAlert ? <span style={{ color: CL.red, marginLeft: 6, fontWeight: 700 }}>!</span> : null}</span>}
        </button>
      ))}
    </nav>
    <div style={{ padding: "8px 4px", borderTop: `1px solid ${CL.bd}` }}>
      <button onClick={() => setAuth(null)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "transparent", border: "none", borderRadius: 7, cursor: "pointer", color: CL.red, fontSize: 13 }}>
        <span>{ICN.logout}</span>{sideOpen && t("logout")}
      </button>
    </div>
  </div>

  {/* Mobile Bottom Nav */}
  <div className="mob-nav">
    {navItems.map(nav => (
      <button key={nav.id} onClick={() => nav.id === "download-app" ? openDownloadApp() : setSection(nav.id)} style={{ color: section === nav.id ? CL.gold : CL.muted, fontWeight: section === nav.id ? 600 : 400 }}>
        <span>{nav.icon}</span><span>{nav.label}</span>
      </button>
    ))}
    <button onClick={() => setAuth(null)} style={{ color: CL.red }}>
      <span>{ICN.logout}</span><span>{t("logout")}</span>
    </button>
  </div>

  {/* Main Content */}
  <div className="main-content" style={{ flex: 1, overflow: "auto" }}>
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}><LanguageSwitcher compact /></div>
    <div style={{ maxWidth: 1200, margin: "0 auto", animation: "fadeIn .3s ease" }}>
      {renderSection()}
    </div>
  </div>
</div>

</LanguageContext.Provider>

);
}

// ==============================================
// LOGIN SCREEN
// ==============================================
function LoginScreen({ data, onAuth }) {
const { lang, t } = useI18n();
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const norm = (v) => String(v || "").trim().toLowerCase();

const doLogin = () => {
const user = norm(username);
const pass = String(password || "").trim();
if (!user || !pass) { setError(lang === "en" ? "Enter username/email and password" : "Saisissez identifiant/email et mot de passe"); return; }

const ownerAliases = [
norm(data.ownerUsername || "info@luxangelscleaning.lu"),
norm(data.settings?.companyEmail),
].filter(Boolean);
if (ownerAliases.includes(user)) {
if (pass === String(data.ownerPin || "1234")) { onAuth({ role: "owner" }); return; }
setError(lang === "en" ? "Wrong password" : "Mot de passe incorrect");
return;
}

if (user === norm(data.managerUsername || "manager")) {
if (pass === String(data.managerPin || "4321")) { onAuth({ role: "manager" }); return; }
setError(lang === "en" ? "Wrong password" : "Mot de passe incorrect");
return;
}

const employee = (data.employees || []).find(emp => {
if (emp.status !== "active") return false;
const empEmail = norm(emp.email);
const empName = norm(emp.name);
const empNameUser = empName.replace(/\s+/g, "");
const empCustomUser = norm(data.employeeUsernames?.[emp.id]);
return user === empEmail || user === empName || user === empNameUser || (empCustomUser && user === empCustomUser);
});
if (!employee) { setError(lang === "en" ? "User not found" : "Utilisateur introuvable"); return; }
const cleanerPassword = String(data.employeePins?.[employee.id] || "0000");
if (pass === cleanerPassword) { onAuth({ role: "cleaner", employeeId: employee.id }); return; }
setError(lang === "en" ? "Wrong password" : "Mot de passe incorrect");
};

return (
<div style={{ minHeight: "100vh", background: CL.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }}>
<style>{globalCSS}</style>
<div style={{ animation: "fadeIn .5s ease", width: 420, maxWidth: "95vw", padding: "0 16px" }}>
<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}><LanguageSwitcher /></div>
<div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${CL.gold}, ${CL.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32, fontWeight: 700, color: CL.bg, fontFamily: "'Cormorant Garamond', serif" }}>LAC</div>
<h1 style={{ fontSize: 30, fontWeight: 700, color: CL.gold, fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>{data.settings?.companyName || "Lux Angels Cleaning"}</h1>
<p style={{ color: CL.muted, marginBottom: 20 }}>{t("managementSystem")}</p>

<div style={{ ...cardSt, textAlign: "left", padding: 24 }}>
  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 22, marginBottom: 14 }}>Secure Sign-In</h3>
  <Field label="Username or email">
    <TextInput value={username} onChange={ev => { setUsername(ev.target.value); setError(""); }} placeholder="username or email" onKeyDown={ev => ev.key === "Enter" && doLogin()} />
  </Field>

  <Field label="Password">
    <TextInput type="password" maxLength={24} value={password} onChange={ev => { setPassword(ev.target.value); setError(""); }} placeholder="••••••" onKeyDown={ev => ev.key === "Enter" && doLogin()} />
  </Field>

  {error && <div style={{ color: CL.red, fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}
  <button onClick={doLogin} style={{ ...btnPri, width: "100%", justifyContent: "center", background: CL.gold }}>{t("loginBtn")}</button>
  <p style={{ marginTop: 10, fontSize: 11, color: CL.dim, textAlign: "center" }}>Use your assigned credentials only.</p>
</div>
</div>
</div>

);
}

// ==============================================
// CLEANER PORTAL
// ==============================================
function CleanerPortal({ data, updateData, auth, onLogout, showToast, toast }) {
const { lang, t } = useI18n();
const [tab, setTab] = useState("schedule");
const emp = data.employees.find(e => e.id === auth.employeeId);
const [monthFilter, setMonthFilter] = useState(getToday().slice(0, 7));
const [uploadNote, setUploadNote] = useState("");
const [uploadType, setUploadType] = useState("issue");
const [clockInNote, setClockInNote] = useState("");
const [timeOffForm, setTimeOffForm] = useState({ startDate: "", endDate: "", reason: "", leaveType: "conge" });
const [productForm, setProductForm] = useState({ productId: "", quantity: 1, note: "", deliveryAt: "" });

const upcoming = data.schedules.filter(s => s.employeeId === auth.employeeId && s.date >= getToday() && s.status !== "cancelled").sort((a, b) => a.date.localeCompare(b.date));
const myClocks = data.clockEntries.filter(c => c.employeeId === auth.employeeId).sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));
const activeClock = myClocks.find(c => !c.clockOut);
const monthClocks = myClocks.filter(c => c.clockOut && c.clockIn?.startsWith(monthFilter));
const monthHours = monthClocks.reduce((sum, c) => sum + calcHrs(c.clockIn, c.clockOut), 0);
const myUploads = (data.photoUploads || []).filter(u => u.employeeId === auth.employeeId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const myTimeOffRequests = (data.timeOffRequests || []).filter(r => r.employeeId === auth.employeeId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const leaveSummary = getLeaveSummary(data, auth.employeeId);
const myProductRequests = (data.productRequests || []).filter(r => r.employeeId === auth.employeeId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const inventoryProducts = (data.inventoryProducts || []).filter(p => p.active !== false);
const myReceivedTotal = myProductRequests.reduce((sum, r) => sum + (Number(r.deliveredQty) || 0), 0);
const myRequestedTotal = myProductRequests.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
const myHoldings = (data.cleanerProductHoldings || []).filter(h => h.employeeId === auth.employeeId && Number(h.qtyInHand) > 0);
const myInHandTotal = myHoldings.reduce((sum, h) => sum + (Number(h.qtyInHand) || 0), 0);
const hasPendingProductRequest = myProductRequests.some(r => r.status === "pending");
const hasPendingTimeOffRequest = myTimeOffRequests.some(r => r.status === "pending");

const doClockIn = (clientId) => {
if (activeClock) { showToast("Already clocked in!", "error"); return; }
const isCompletedToday = data.schedules.some(sc => sc.employeeId === auth.employeeId && sc.clientId === clientId && sc.date === getToday() && sc.status === "completed");
if (isCompletedToday) { showToast("This job is already completed and locked", "error"); return; }
const nowAt = new Date();
const lateMeta = getLateMeta(data.schedules, { employeeId: auth.employeeId, clientId, clockInAt: nowAt });
updateData("clockEntries", prev => [...prev, {
id: makeId(), employeeId: auth.employeeId, clientId,
clockIn: nowAt.toISOString(), clockOut: null,
notes: clockInNote.trim(),
isLate: lateMeta.isLate, lateMinutes: lateMeta.lateMinutes,
scheduledStart: lateMeta.scheduledStart,
}]);
updateData("schedules", prev => updateScheduleStatusForJob(prev, { employeeId: auth.employeeId, clientId, date: lateMeta.workDate, from: "scheduled", to: "in-progress" }));
setClockInNote("");
showToast(lateMeta.isLate ? `Clocked in (Late by ${lateMeta.lateMinutes} min)` : "Clocked in!");
};
const doClockOut = () => {
if (!activeClock) return;
const today = activeClock.clockIn?.slice(0, 10) || getToday();
updateData("clockEntries", prev => prev.map(c => c.id === activeClock.id ? { ...c, clockOut: new Date().toISOString() } : c));
updateData("schedules", prev => updateScheduleStatusForJob(prev, { employeeId: auth.employeeId, clientId: activeClock.clientId, date: today, from: "in-progress", to: "completed" }));
showToast("Clocked out!");
};

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
const fr = new FileReader();
fr.onload = () => resolve(fr.result);
fr.onerror = reject;
fr.readAsDataURL(file);
});

const onUploadPhoto = async (file) => {
if (!file) return;
if (!file.type?.startsWith("image/")) { showToast("Please upload an image file", "error"); return; }
if (!activeClock) { showToast("Clock in to a job before uploading photos", "error"); return; }
try {
const imageData = await readAsDataUrl(file);
updateData("photoUploads", (prev = []) => [...prev, {
id: makeId(), employeeId: auth.employeeId, createdAt: new Date().toISOString(),
fileName: file.name, imageData, note: uploadNote.trim(),
type: uploadType,
seenByOwner: false,
clockEntryId: activeClock.id,
clientId: activeClock.clientId,
}]);
setUploadNote("");
setUploadType("issue");
showToast("Photo uploaded");
} catch {
showToast("Upload failed", "error");
}
};

const submitTimeOff = () => {
if (!timeOffForm.startDate || !timeOffForm.endDate) { showToast("Select start and end dates", "error"); return; }
if (timeOffForm.endDate < timeOffForm.startDate) { showToast("End date must be after start date", "error"); return; }
const requestedDays = leaveDaysInclusive(timeOffForm.startDate, timeOffForm.endDate);
if (!requestedDays) { showToast("Invalid leave dates", "error"); return; }
if (requestedDays > leaveSummary.remaining) { showToast("Request exceeds remaining leave balance", "error"); return; }
updateData("timeOffRequests", (prev = []) => [...prev, {
id: makeId(), employeeId: auth.employeeId, ...timeOffForm,
requestedDays,
reason: timeOffForm.reason.trim(), status: "pending", createdAt: new Date().toISOString(),
reviewedAt: null, reviewedBy: null, reviewNote: "",
}]);
setTimeOffForm({ startDate: "", endDate: "", reason: "", leaveType: "conge" });
showToast("Leave request sent");
};

const submitProductRequest = () => {
if (!productForm.productId) { showToast("Select a product", "error"); return; }
if (!productForm.quantity || Number(productForm.quantity) <= 0) { showToast("Enter quantity", "error"); return; }
updateData("productRequests", (prev = []) => [...prev, {
id: makeId(), employeeId: auth.employeeId,
productId: productForm.productId, quantity: Number(productForm.quantity),
note: productForm.note.trim(), deliveryAt: productForm.deliveryAt || "",
status: "pending", approvedQty: 0, deliveredQty: 0, createdAt: new Date().toISOString(),
}]);
setProductForm({ productId: "", quantity: 1, note: "", deliveryAt: "" });
showToast("Product request sent");
};

const tabItems = [
{ id: "schedule", label: t("mySchedule"), icon: ICN.cal },
{ id: "clock", label: t("clockInOut"), icon: ICN.clock },
{ id: "photos", label: t("photoUploads"), icon: ICN.doc },
{ id: "products", label: t("products"), icon: ICN.doc, hasAlert: hasPendingProductRequest },
{ id: "timeoff", label: "Congés", icon: ICN.cal, hasAlert: hasPendingTimeOffRequest },
];

return (
<div style={{ minHeight: "100vh", background: CL.bg, fontFamily: "'Outfit', sans-serif", color: CL.text }}>
<style>{globalCSS}</style>
{toast && <ToastMsg message={toast.msg} type={toast.type} />}
{/* Header */}
<div style={{ background: CL.sf, borderBottom: `1px solid ${CL.bd}`, padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<div style={{ width: 32, height: 32, borderRadius: 9, background: CL.blue + "20", display: "flex", alignItems: "center", justifyContent: "center", color: CL.blue }}>{ICN.user}</div>
<div><div style={{ fontWeight: 600, fontSize: 14 }}>{emp?.name || "Cleaner"}</div><div style={{ fontSize: 10, color: CL.muted }}>{emp?.role}</div></div>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}><LanguageSwitcher compact /><button onClick={onLogout} style={{ ...btnSec, ...btnSm, color: CL.red }}>{ICN.logout} {t("logout")}</button></div>
</div>
{/* Tabs */}
<div style={{ display: "flex", background: CL.sf, borderBottom: `1px solid ${CL.bd}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
{tabItems.map(t => (
<button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "11px 16px", border: "none", background: "transparent", cursor: "pointer", color: tab === t.id ? CL.blue : CL.muted, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, borderBottom: tab === t.id ? `2px solid ${CL.blue}` : "2px solid transparent", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0 }}>{t.icon} {t.label}{t.hasAlert ? <span style={{ color: CL.red, fontWeight: 700, marginLeft: 4 }}>!</span> : null}</button>
))}
</div>
{/* Content */}
<div style={{ padding: 18, maxWidth: 800, margin: "0 auto" }}>
{tab === "schedule" && (
<div>
<h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>{t("upcomingJobs")}</h2>
{upcoming.length === 0 ? <div style={{ ...cardSt, textAlign: "center", padding: 36, color: CL.muted }}>{t("noUpcomingJobs")}</div> :
upcoming.slice(0, 20).map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
return (
<div key={sched.id} style={{ ...cardSt, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
<div style={{ flex: 1 }}>
<div style={{ fontWeight: 600 }}>{client?.name || "?"}</div>
<div style={{ fontSize: 12, color: CL.muted }}>{client?.address}{client?.apartmentFloor ? `, ${client.apartmentFloor}` : ""} {client?.address && <a href={mapsUrl(`${client.address}${client.apartmentFloor ? ` ${client.apartmentFloor}` : ""} ${client.postalCode || ""} ${client.city || ""}`)} target="_blank" rel="noreferrer" style={{ color: CL.blue, marginLeft: 6, textDecoration: "underline" }}>Map</a>}</div>
{client?.accessCode && <div style={{ fontSize: 11, color: CL.orange, marginTop: 2 }}>Code: {client.accessCode}</div>}
{client?.keyLocation && <div style={{ fontSize: 11, color: CL.orange }}>Key: {client.keyLocation}</div>}
{client?.petInfo && <div style={{ fontSize: 11, color: CL.orange }}>Pets: {client.petInfo}</div>}
{client?.specialInstructions && <div style={{ fontSize: 11, color: CL.dim, marginTop: 2 }}>{client.specialInstructions}</div>}
<div style={{ fontSize: 13, color: CL.blue, marginTop: 3 }}>{fmtDate(sched.date)} · {sched.startTime}-{sched.endTime}</div>
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
<Badge color={sched.date === getToday() ? CL.green : CL.blue}>{sched.date === getToday() ? "Today" : fmtDate(sched.date)}</Badge>
<Badge color={scheduleStatusColor(sched.status)}>{sched.status}</Badge>
</div>
</div>
);
})
}
</div>
)}

    {tab === "clock" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>Clock In / Out</h2>
        {activeClock ? (
          <div style={{ ...cardSt, borderColor: CL.green, textAlign: "center", marginBottom: 18 }}>
            <div style={{ color: CL.green, marginBottom: 4 }}>{ICN.clock}</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: CL.green }}>Clocked In</div>
            <div style={{ color: CL.muted }}>Since {fmtBoth(activeClock.clockIn)} at {data.clients.find(c => c.id === activeClock.clientId)?.name || "?"}</div>
            <button onClick={doClockOut} style={{ ...btnPri, background: CL.red, marginTop: 12 }}>Clock Out Now</button>
          </div>
        ) : (
          <div style={cardSt}>
            <p style={{ color: CL.muted, marginBottom: 12 }}>Select client to clock in:</p>
            <Field label="Clock-in note (optional)">
              <TextArea value={clockInNote} onChange={ev => setClockInNote(ev.target.value)} placeholder="Late reason, traffic, access issues..." />
            </Field>
            {(() => {
              const todayJobs = data.schedules.filter(sc => sc.date === getToday() && sc.employeeId === auth.employeeId && sc.status !== "cancelled");
              const todayClientIds = todayJobs.map(sc => sc.clientId);
              const todayClients = data.clients.filter(c => todayClientIds.includes(c.id));
              const otherClients = data.clients.filter(c => c.status === "active" && !todayClientIds.includes(c.id));
              return (
                <>
                  {todayClients.length > 0 && <div style={{ fontSize: 11, color: CL.green, fontWeight: 600, marginBottom: 5 }}>TODAY'S CLIENTS:</div>}
                  {todayClients.map(client => (
                    <button key={client.id} onClick={() => doClockIn(client.id)} style={{ ...cardSt, width: "100%", padding: "12px 16px", marginBottom: 5, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", borderColor: CL.green + "60" }}>
                      <div><div style={{ fontWeight: 600 }}>{client.name}</div><div style={{ fontSize: 11, color: CL.muted }}>{client.address} {client.address && <a href={mapsUrl(`${client.address} ${client.postalCode || ""} ${client.city || ""}`)} target="_blank" rel="noreferrer" onClick={ev => ev.stopPropagation()} style={{ color: CL.blue, marginLeft: 6, textDecoration: "underline" }}>Map</a>}</div></div>
                      <span style={{ color: CL.green, fontWeight: 600, fontSize: 13 }}>Clock In →</span>
                    </button>
                  ))}
                  {otherClients.length > 0 && <div style={{ fontSize: 11, color: CL.muted, fontWeight: 600, margin: "10px 0 5px" }}>OTHER:</div>}
                  {otherClients.map(client => (
                    <button key={client.id} onClick={() => doClockIn(client.id)} style={{ ...cardSt, width: "100%", padding: "10px 16px", marginBottom: 5, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                      <div><div style={{ fontWeight: 600 }}>{client.name}</div><div style={{ fontSize: 11, color: CL.muted }}>{client.address} {client.address && <a href={mapsUrl(`${client.address} ${client.postalCode || ""} ${client.city || ""}`)} target="_blank" rel="noreferrer" onClick={ev => ev.stopPropagation()} style={{ color: CL.blue, marginLeft: 6, textDecoration: "underline" }}>Map</a>}</div></div>
                      <span style={{ color: CL.blue, fontSize: 13 }}>Clock In →</span>
                    </button>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>
    )}

    {tab === "hours" && (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22 }}>My Hours</h2>
          <TextInput type="month" value={monthFilter} onChange={ev => setMonthFilter(ev.target.value)} style={{ width: 160 }} />
        </div>
        <div className="stat-row" style={{ marginBottom: 18 }}>
          <StatCard label="Hours" value={`${monthHours.toFixed(1)}h`} icon={ICN.clock} color={CL.blue} />
          <StatCard label="Days" value={monthClocks.length} icon={ICN.cal} color={CL.green} />
        </div>
        <div style={cardSt} className="tbl-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr><th style={thSt}>Date</th><th style={thSt}>Client</th><th style={thSt}>In</th><th style={thSt}>Out</th><th style={thSt}>Hours</th></tr></thead>
            <tbody>
              {monthClocks.map(clk => { const client = data.clients.find(c => c.id === clk.clientId); return (
                <tr key={clk.id}><td style={tdSt}>{fmtDate(clk.clockIn)}</td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{fmtTime(clk.clockIn)}</td><td style={tdSt}>{fmtTime(clk.clockOut)}</td><td style={{ ...tdSt, fontWeight: 600 }}>{calcHrs(clk.clockIn, clk.clockOut).toFixed(2)}h</td></tr>
              ); })}
              {monthClocks.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No entries</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {tab === "photos" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>Photo Uploads</h2>
        <div style={{ ...cardSt, marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: activeClock ? CL.green : CL.orange, marginBottom: 12 }}>
            {activeClock
              ? `Clocked in at ${data.clients.find(c => c.id === activeClock.clientId)?.name || "this job"}. Photos will be saved to this active job.`
              : "You must clock in before uploading job photos."}
          </p>
          <Field label="Photo type">
            <SelectInput value={uploadType} onChange={ev => setUploadType(ev.target.value)} disabled={!activeClock}>
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="issue">Issue / Damage Proof</option>
            </SelectInput>
          </Field>
          <Field label="Upload cleaning photo">
            <TextInput type="file" accept="image/*" disabled={!activeClock} onChange={ev => onUploadPhoto(ev.target.files?.[0])} />
          </Field>
          <Field label="Optional note">
            <TextArea value={uploadNote} onChange={ev => setUploadNote(ev.target.value)} disabled={!activeClock} placeholder="Add context for this photo" />
          </Field>
        </div>
        <div style={cardSt}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.blue }}>My Uploaded Photos</h3>
          {myUploads.map(up => (
            <div key={up.id} style={{ padding: "10px 0", borderBottom: `1px solid ${CL.bd}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: CL.muted }}>{fmtBoth(up.createdAt)} · {up.fileName}</div>
                <Badge color={up.type === "before" ? CL.blue : up.type === "after" ? CL.green : CL.orange}>{up.type || "issue"}</Badge>
              </div>
              <div style={{ fontSize: 12, color: CL.dim, marginBottom: 8 }}>
                Job: {data.clients.find(c => c.id === up.clientId)?.name || "Unknown client"}
              </div>
              {up.note && <div style={{ fontSize: 12, color: CL.text, marginBottom: 8 }}>{up.note}</div>}
              {up.imageData && <img src={up.imageData} alt={up.fileName} style={{ width: "100%", maxWidth: 360, borderRadius: 8, border: `1px solid ${CL.bd}` }} />}
            </div>
          ))}
          {myUploads.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>No photos uploaded yet</p>}
        </div>
      </div>
    )}

    {tab === "products" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>Products</h2>
        <div className="stat-row" style={{ marginBottom: 14 }}>
          <StatCard label="Requested" value={`${myRequestedTotal}`} icon={ICN.doc} color={CL.blue} />
          <StatCard label="Received" value={`${myReceivedTotal}`} icon={ICN.check} color={CL.green} />
          <StatCard label="In Hand" value={`${myInHandTotal}`} icon={ICN.user} color={CL.green} />
          <StatCard label="Open Requests" value={myProductRequests.filter(r => r.status === "pending").length} icon={ICN.clock} color={CL.orange} />
        </div>
        <div style={{ ...cardSt, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>Products I Currently Have</h3>
          {myHoldings.map(h => {
            const prod = (data.inventoryProducts || []).find(p => p.id === h.productId);
            return <div key={h.id} style={{ padding: "8px 0", borderBottom: `1px solid ${CL.bd}` }}><div style={{ fontWeight: 600 }}>{prod?.name || "Unknown product"}</div><div style={{ fontSize: 12, color: CL.muted }}>In hand: {h.qtyInHand} {prod?.unit || "pcs"} · Total assigned: {h.qtyAssigned || 0}</div></div>;
          })}
          {myHoldings.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>No products currently assigned</p>}
        </div>

        <div style={{ ...cardSt, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>Request Products</h3>
          <div className="form-grid">
            <Field label="Product"><SelectInput value={productForm.productId} onChange={ev => setProductForm(v => ({ ...v, productId: ev.target.value }))}><option value="">Select...</option>{inventoryProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock || 0} {p.unit || "pcs"} in stock)</option>)}</SelectInput></Field>
            <Field label="Quantity"><TextInput type="number" min={1} value={productForm.quantity} onChange={ev => setProductForm(v => ({ ...v, quantity: ev.target.value }))} /></Field>
            <Field label="Delivery Date & Time"><TextInput type="datetime-local" value={productForm.deliveryAt} onChange={ev => setProductForm(v => ({ ...v, deliveryAt: ev.target.value }))} /></Field>
          </div>
          <Field label="Note"><TextArea value={productForm.note} onChange={ev => setProductForm(v => ({ ...v, note: ev.target.value }))} placeholder="Need for upcoming jobs, preferred handover location..." /></Field>
          <button style={btnPri} onClick={submitProductRequest}>Submit Request</button>
        </div>
        <div style={cardSt}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.blue }}>My Product Requests</h3>
          {myProductRequests.map(req => { const prod = inventoryProducts.find(p => p.id === req.productId) || (data.inventoryProducts || []).find(p => p.id === req.productId); return (
            <div key={req.id} style={{ padding: "10px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{prod?.name || "Unknown product"} · Qty {req.quantity}</div>
                <div style={{ fontSize: 12, color: CL.muted }}>Requested {fmtBoth(req.createdAt)}{req.deliveryAt ? ` · Delivery ${fmtBoth(req.deliveryAt)}` : ""}</div>
                {req.note && <div style={{ fontSize: 12, color: CL.dim }}>{req.note}</div>}
                <div style={{ fontSize: 12, color: CL.text }}>Approved: {req.approvedQty || 0} · Received: {req.deliveredQty || 0}</div>
              </div>
              <Badge color={req.status === "delivered" ? CL.green : req.status === "rejected" ? CL.red : req.status === "approved" ? CL.blue : CL.orange}>{req.status}</Badge>
            </div>
          ); })}
          {myProductRequests.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>No product requests yet</p>}
        </div>
      </div>
    )}

    {tab === "timeoff" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>Congés</h2>
        <div className="stat-row" style={{ marginBottom: 14 }}>
          <StatCard label="Allowance (days)" value={`${leaveSummary.allowance}d`} icon={ICN.cal} color={CL.blue} />
          <StatCard label="Approved (days)" value={`${leaveSummary.approvedDays}d`} icon={ICN.check} color={CL.green} />
          <StatCard label="Remaining (days)" value={`${leaveSummary.remaining}d`} icon={ICN.clock} color={CL.gold} />
        </div>
        <div style={{ ...cardSt, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>New Leave Request</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            <Field label="Start Date"><TextInput type="date" value={timeOffForm.startDate} onChange={ev => setTimeOffForm(v => ({ ...v, startDate: ev.target.value }))} /></Field>
            <Field label="End Date"><TextInput type="date" value={timeOffForm.endDate} onChange={ev => setTimeOffForm(v => ({ ...v, endDate: ev.target.value }))} /></Field>
          </div>
          <Field label="Type"><SelectInput value={timeOffForm.leaveType} onChange={ev => setTimeOffForm(v => ({ ...v, leaveType: ev.target.value }))}><option value="conge">Congé</option><option value="maladie">Maladie</option></SelectInput></Field>
          <Field label="Reason"><TextArea value={timeOffForm.reason} onChange={ev => setTimeOffForm(v => ({ ...v, reason: ev.target.value }))} placeholder="Vacation, personal, medical, etc." /></Field>
          <button onClick={submitTimeOff} style={btnPri}>Submit Request</button>
        </div>
        <div style={cardSt}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.blue }}>My Request Status</h3>
          {myTimeOffRequests.map(req => (
            <div key={req.id} style={{ padding: "10px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{fmtDate(req.startDate)} - {fmtDate(req.endDate)} ({leaveDaysInclusive(req.startDate, req.endDate)}d)</div>
                <div style={{ fontSize: 12, color: CL.muted }}>{req.leaveType === "maladie" ? "Maladie" : "Congé"} · {req.reason || "No reason provided"}</div>
                {req.reviewedAt && <div style={{ fontSize: 11, color: CL.dim }}>Reviewed {fmtBoth(req.reviewedAt)} {req.reviewNote ? `· ${req.reviewNote}` : ""}</div>}
              </div>
              <Badge color={req.status === "approved" ? CL.green : req.status === "rejected" ? CL.red : CL.orange}>{req.status}</Badge>
            </div>
          ))}
          {myTimeOffRequests.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>No leave requests submitted yet</p>}
        </div>
      </div>
    )}
  </div>
</div>

);
}

// ==============================================
// DASHBOARD
// ==============================================
function DashboardPage({ data, auth }) {
const todayStr = getToday();
const todayScheds = data.schedules.filter(s => s.date === todayStr);
const activeClocks = data.clockEntries.filter(c => !c.clockOut);
const monthRev = data.invoices.filter(inv => inv.date?.startsWith(todayStr.slice(0, 7))).reduce((sum, inv) => sum + (inv.total || 0), 0);
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const tomorrowScheds = data.schedules.filter(s => s.date === tomorrow);

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 5 }}>Dashboard</h1>
<p style={{ color: CL.muted, marginBottom: 18 }}>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
<div className="stat-row" style={{ marginBottom: 22 }}>
<StatCard label="Today's Jobs" value={todayScheds.length} icon={ICN.cal} color={CL.blue} />
<StatCard label="Clocked In" value={activeClocks.length} icon={ICN.clock} color={CL.green} />
<StatCard label="Clients" value={data.clients.length} icon={ICN.user} color={CL.gold} />
{auth?.role !== "manager" && <StatCard label="Month Rev" value={`€${monthRev.toFixed(0)}`} icon={ICN.chart} color={CL.goldLight} />}
</div>
<div className="grid-2">
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Today's Schedule</h3>
{todayScheds.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>No jobs</p> :
todayScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
const clockInfo = data.clockEntries.find(c => c.employeeId === sched.employeeId && c.clientId === sched.clientId && c.clockIn?.slice(0, 10) === sched.date);
return (
<div key={sched.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between", gap: 8 }}>
<div>
<div style={{ fontWeight: 600, fontSize: 13 }}>{client?.name || "?"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{employee?.name || "-"} · {sched.startTime}-{sched.endTime}</div>
{clockInfo?.isLate && <div style={{ fontSize: 11, color: CL.orange, fontWeight: 600 }}>Late by {clockInfo.lateMinutes || 0} min</div>}
</div>
<Badge color={scheduleStatusColor(sched.status)}>{sched.status}</Badge>
</div>
);
})
}
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Tomorrow ({tomorrowScheds.length})</h3>
{tomorrowScheds.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>Nothing</p> :
tomorrowScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
return (
<div key={sched.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ fontWeight: 600, fontSize: 13 }}>{client?.name || "?"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{employee?.name || "-"} · {sched.startTime}-{sched.endTime}</div>
{client?.email && <div style={{ fontSize: 10, color: CL.blue }}>Reminder → {client.email}</div>}
</div>
);
})
}
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.green }}>Active Clocks</h3>
{activeClocks.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>None</p> :
activeClocks.map(clk => {
const employee = data.employees.find(e => e.id === clk.employeeId);
const client = data.clients.find(c => c.id === clk.clientId);
return (
<div key={clk.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ fontWeight: 600, fontSize: 13 }}>{employee?.name || "?"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>At {client?.name || "?"} · {fmtTime(clk.clockIn)}</div>
</div>
);
})
}
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Recent Invoices</h3>
{data.invoices.slice(-5).reverse().map(inv => {
const client = data.clients.find(c => c.id === inv.clientId);
return (
<div key={inv.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between" }}>
<div><div style={{ fontWeight: 600, fontSize: 13 }}>{inv.invoiceNumber}</div><div style={{ fontSize: 11, color: CL.muted }}>{client?.name}</div></div>
<div style={{ textAlign: "right" }}><div style={{ fontWeight: 600 }}>€{(inv.total || 0).toFixed(2)}</div><Badge color={inv.status === "paid" ? CL.green : CL.muted}>{inv.status}</Badge></div>
</div>
);
})}
{data.invoices.length === 0 && <p style={{ color: CL.muted, fontSize: 13 }}>No invoices</p>}
</div>
</div>
</div>
);
}

// ==============================================
// EMPLOYEES PAGE
// ==============================================
function EmployeesPage({ data, updateData, showToast }) {
const [modal, setModal] = useState(null);
const [deleteId, setDeleteId] = useState(null);
const [search, setSearch] = useState("");

const emptyEmployee = {
name: "", email: "", phone: "", phoneMobile: "", address: "", city: "Luxembourg", postalCode: "", country: "Luxembourg",
role: "Cleaner", hourlyRate: 15, startDate: getToday(), status: "active", notes: "", bankIban: "", socialSecNumber: "",
pin: "0000", dateOfBirth: "", nationality: "", contractType: "CDI", workPermit: "", emergencyName: "", emergencyPhone: "",
username: "",
languages: "", transport: "", leaveAllowance: 26,
};

const handleSave = (empData) => {
const { pin: empPin, username: empUsername, ...empFields } = empData;
const pinValue = empPin || "0000";
if (empData.id) {
updateData("employees", prev => prev.map(e => e.id === empData.id ? empFields : e));
updateData("employeePins", prev => ({ ...prev, [empData.id]: pinValue }));
updateData("employeeUsernames", prev => ({ ...prev, [empData.id]: String(empUsername || "").trim().toLowerCase() }));
showToast("Employee updated");
} else {
const newId = makeId();
updateData("employees", prev => [...prev, { ...empFields, id: newId }]);
updateData("employeePins", prev => ({ ...prev, [newId]: pinValue }));
updateData("employeeUsernames", prev => ({ ...prev, [newId]: String(empUsername || "").trim().toLowerCase() }));
showToast("Employee added");
}
setModal(null);
};

const handleDelete = (id) => {
updateData("employees", prev => prev.filter(e => e.id !== id));
updateData("employeePins", prev => {
  const next = { ...(prev || {}) };
  delete next[id];
  return next;
});
updateData("employeeUsernames", prev => {
  const next = { ...(prev || {}) };
  delete next[id];
  return next;
});
showToast("Deleted", "error");
setDeleteId(null);
};

const filtered = data.employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Employees</h1>
<button style={btnPri} onClick={() => setModal({ ...emptyEmployee })}>{ICN.plus} Add</button>
</div>
<div style={{ marginBottom: 12, position: "relative" }}>
<TextInput placeholder="Search..." value={search} onChange={ev => setSearch(ev.target.value)} style={{ paddingLeft: 34 }} />
<span style={{ position: "absolute", left: 10, top: 10, color: CL.muted }}>{ICN.search}</span>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead>
<tr><th style={thSt}>Name</th><th style={thSt}>Role</th><th style={thSt}>Rate</th><th style={thSt}>Contact</th><th style={thSt}>Username</th><th style={thSt}>Password</th><th style={thSt}>Status</th><th style={thSt}>Actions</th></tr>
</thead>
<tbody>
{filtered.map(emp => (
<tr key={emp.id}>
<td style={tdSt}><div style={{ fontWeight: 600 }}>{emp.name}</div><div style={{ fontSize: 11, color: CL.muted }}>{emp.nationality ? `${emp.nationality} · ` : ""}{emp.languages || ""}</div></td>
<td style={tdSt}>{emp.role}</td>
<td style={tdSt}>€{Number(emp.hourlyRate).toFixed(2)}/hr</td>
<td style={tdSt}><div style={{ fontSize: 12 }}>{emp.phone}</div><div style={{ fontSize: 11, color: CL.muted }}>{emp.email}</div></td>
<td style={tdSt}><code style={{ background: CL.s2, padding: "2px 5px", borderRadius: 4, fontSize: 12 }}>{data.employeeUsernames?.[emp.id] || "(email/full name)"}</code></td>
<td style={tdSt}><code style={{ background: CL.s2, padding: "2px 5px", borderRadius: 4, fontSize: 12 }}>{data.employeePins?.[emp.id] || "0000"}</code></td>
<td style={tdSt}><Badge color={emp.status === "active" ? CL.green : CL.red}>{emp.status}</Badge></td>
<td style={tdSt}>
<div style={{ display: "flex", gap: 4 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...emp, pin: data.employeePins?.[emp.id] || "0000", username: data.employeeUsernames?.[emp.id] || "" })}>{ICN.edit}</button>
<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => setDeleteId(emp.id)}>{ICN.trash}</button>
</div>
</td>
</tr>
))}
{filtered.length === 0 && <tr><td colSpan={7} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No employees</td></tr>}
</tbody>
</table>
</div>

  {deleteId && (
    <ModalBox title="Delete?" onClose={() => setDeleteId(null)}>
      <p style={{ marginBottom: 16 }}>Remove this employee?</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={() => setDeleteId(null)}>Cancel</button>
        <button style={btnDng} onClick={() => handleDelete(deleteId)}>Delete</button>
      </div>
    </ModalBox>
  )}

  {modal && (
    <ModalBox title={modal.id ? "Edit Employee" : "Add Employee"} onClose={() => setModal(null)}>
      <EmployeeForm initialData={modal} onSave={handleSave} onCancel={() => setModal(null)} />
    </ModalBox>
  )}
</div>

);
}

function EmployeeForm({ initialData, onSave, onCancel }) {
const [form, setForm] = useState(initialData);
const [activeTab, setActiveTab] = useState("basic");

const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const tabs = [
{ id: "basic", label: "Basic Info" },
{ id: "personal", label: "Personal" },
{ id: "work", label: "Work & Pay" },
{ id: "emergency", label: "Emergency" },
];

return (
<div>
<FormTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

  {activeTab === "basic" && (
    <div className="form-grid">
      <Field label="Full Name *"><TextInput value={form.name} onChange={ev => set("name", ev.target.value)} /></Field>
      <Field label="Role">
        <SelectInput value={form.role} onChange={ev => set("role", ev.target.value)}>
          <option>Cleaner</option><option>Senior Cleaner</option><option>Team Lead</option><option>Supervisor</option>
        </SelectInput>
      </Field>
      <Field label="Email"><TextInput type="email" value={form.email} onChange={ev => set("email", ev.target.value)} /></Field>
      <Field label="Phone"><TextInput value={form.phone} onChange={ev => set("phone", ev.target.value)} placeholder="+352 ..." /></Field>
      <Field label="Mobile"><TextInput value={form.phoneMobile || ""} onChange={ev => set("phoneMobile", ev.target.value)} placeholder="+352 ..." /></Field>
      <Field label="Login Username"><TextInput value={form.username || ""} onChange={ev => set("username", ev.target.value.toLowerCase())} placeholder="optional custom username" /></Field>
      <Field label="Login Password"><TextInput maxLength={24} value={form.pin || "0000"} onChange={ev => set("pin", ev.target.value)} /></Field>
      <div style={{ gridColumn: "1/-1" }}><Field label="Address"><TextInput value={form.address} onChange={ev => set("address", ev.target.value)} placeholder="Street & house number" /></Field></div>
      <Field label="Postal Code"><TextInput value={form.postalCode || ""} onChange={ev => set("postalCode", ev.target.value)} placeholder="L-1234" /></Field>
      <Field label="City"><TextInput value={form.city || ""} onChange={ev => set("city", ev.target.value)} /></Field>
      <Field label="Country"><TextInput value={form.country || ""} onChange={ev => set("country", ev.target.value)} /></Field>
    </div>
  )}

  {activeTab === "personal" && (
    <div className="form-grid">
      <Field label="Date of Birth"><TextInput type="date" value={form.dateOfBirth || ""} onChange={ev => set("dateOfBirth", ev.target.value)} /></Field>
      <Field label="Nationality"><TextInput value={form.nationality || ""} onChange={ev => set("nationality", ev.target.value)} placeholder="e.g. Portuguese" /></Field>
      <Field label="Languages"><TextInput value={form.languages || ""} onChange={ev => set("languages", ev.target.value)} placeholder="FR, DE, PT, EN..." /></Field>
      <Field label="Social Security No."><TextInput value={form.socialSecNumber || ""} onChange={ev => set("socialSecNumber", ev.target.value)} /></Field>
      <Field label="Transport">
        <SelectInput value={form.transport || ""} onChange={ev => set("transport", ev.target.value)}>
          <option value="">Select...</option><option>Car</option><option>Public Transport</option><option>Bicycle</option><option>Walking</option>
        </SelectInput>
      </Field>
    </div>
  )}

  {activeTab === "work" && (
    <div className="form-grid">
      <Field label="Hourly Rate (€)"><TextInput type="number" step=".5" value={form.hourlyRate} onChange={ev => set("hourlyRate", parseFloat(ev.target.value) || 0)} /></Field>
      <Field label="Vacation allowance (days/year)"><TextInput type="number" min={0} value={form.leaveAllowance ?? 26} onChange={ev => set("leaveAllowance", Math.max(0, parseInt(ev.target.value || "0", 10) || 0))} /></Field>
      <Field label="Contract Type">
        <SelectInput value={form.contractType || "CDI"} onChange={ev => set("contractType", ev.target.value)}>
          <option>CDI</option><option>CDD</option><option>Mini-job</option><option>Freelance</option><option>Student</option>
        </SelectInput>
      </Field>
      <Field label="Start Date"><TextInput type="date" value={form.startDate} onChange={ev => set("startDate", ev.target.value)} /></Field>
      <Field label="Work Permit #"><TextInput value={form.workPermit || ""} onChange={ev => set("workPermit", ev.target.value)} placeholder="If applicable" /></Field>
      <Field label="Bank IBAN"><TextInput value={form.bankIban || ""} onChange={ev => set("bankIban", ev.target.value)} placeholder="LU..." /></Field>
      <Field label="Status">
        <SelectInput value={form.status} onChange={ev => set("status", ev.target.value)}>
          <option value="active">Active</option><option value="inactive">Inactive</option>
        </SelectInput>
      </Field>
    </div>
  )}

  {activeTab === "emergency" && (
    <div className="form-grid">
      <Field label="Emergency Contact Name"><TextInput value={form.emergencyName || ""} onChange={ev => set("emergencyName", ev.target.value)} /></Field>
      <Field label="Emergency Phone"><TextInput value={form.emergencyPhone || ""} onChange={ev => set("emergencyPhone", ev.target.value)} placeholder="+352 ..." /></Field>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="Notes"><TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} placeholder="Any additional info..." /></Field>
      </div>
    </div>
  )}

  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
    <button style={btnSec} onClick={onCancel}>Cancel</button>
    <button style={btnPri} onClick={() => form.name && onSave(form)}>Save Employee</button>
  </div>
</div>

);
}

// ==============================================
// CLIENTS PAGE
// ==============================================
function ClientsPage({ data, updateData, showToast }) {
const [modal, setModal] = useState(null);
const [deleteId, setDeleteId] = useState(null);
const [search, setSearch] = useState("");

const emptyClient = {
name: "", email: "", phone: "", phoneMobile: "", address: "", apartmentFloor: "", city: "Luxembourg", postalCode: "", country: "Luxembourg",
type: "Residential", cleaningFrequency: "Weekly", pricePerHour: 35, priceFixed: 0, billingType: "hourly", notes: "", contactPerson: "",
status: "active", accessCode: "", keyLocation: "", parkingInfo: "", petInfo: "", specialInstructions: "", preferredDay: "", preferredTime: "",
contractStart: "", contractEnd: "", squareMeters: "", taxId: "", language: "FR",
};

const handleSave = (clientData) => {
if (clientData.id) {
updateData("clients", prev => prev.map(c => c.id === clientData.id ? clientData : c));
showToast("Client updated");
} else {
updateData("clients", prev => [...prev, { ...clientData, id: makeId() }]);
showToast("Client added");
}
setModal(null);
};

const handleDelete = (id) => {
updateData("clients", prev => prev.filter(c => c.id !== id));
showToast("Deleted", "error");
setDeleteId(null);
};

const filtered = data.clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Clients</h1>
<button style={btnPri} onClick={() => setModal({ ...emptyClient })}>{ICN.plus} Add</button>
</div>
<div style={{ marginBottom: 12, position: "relative" }}>
<TextInput placeholder="Search..." value={search} onChange={ev => setSearch(ev.target.value)} style={{ paddingLeft: 34 }} />
<span style={{ position: "absolute", left: 10, top: 10, color: CL.muted }}>{ICN.search}</span>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead>
<tr><th style={thSt}>Client</th><th style={thSt}>Address</th><th style={thSt}>Type</th><th style={thSt}>Freq</th><th style={thSt}>Price</th><th style={thSt}>Status</th><th style={thSt}>Actions</th></tr>
</thead>
<tbody>
{filtered.map(client => (
<tr key={client.id}>
<td style={tdSt}>
<div style={{ fontWeight: 600 }}>{client.name}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{client.contactPerson ? `${client.contactPerson} · ` : ""}{client.email}</div>
<div style={{ fontSize: 11, color: CL.dim }}>{client.phone}{client.phoneMobile ? ` / ${client.phoneMobile}` : ""}</div>
</td>
<td style={tdSt}>
<div style={{ fontSize: 12 }}>{client.address}{client.apartmentFloor ? `, ${client.apartmentFloor}` : ""}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{client.postalCode ? `${client.postalCode} ` : ""}{client.city || ""}</div>
{client.accessCode && <div style={{ fontSize: 10, color: CL.orange }}>Code: {client.accessCode}</div>}
</td>
<td style={tdSt}>{client.type}</td>
<td style={tdSt}>{client.cleaningFrequency}</td>
<td style={tdSt}>{client.billingType === "fixed" ? `€${Number(client.priceFixed).toFixed(2)}` : `€${Number(client.pricePerHour).toFixed(2)}/hr`}</td>
<td style={tdSt}><Badge color={client.status === "active" ? CL.green : client.status === "prospect" ? CL.orange : CL.red}>{client.status}</Badge></td>
<td style={tdSt}>
<div style={{ display: "flex", gap: 4 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...client })}>{ICN.edit}</button>
<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => setDeleteId(client.id)}>{ICN.trash}</button>
</div>
</td>
</tr>
))}
{filtered.length === 0 && <tr><td colSpan={7} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No clients</td></tr>}
</tbody>
</table>
</div>

  {deleteId && (
    <ModalBox title="Delete?" onClose={() => setDeleteId(null)}>
      <p style={{ marginBottom: 16 }}>Remove this client?</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={() => setDeleteId(null)}>Cancel</button>
        <button style={btnDng} onClick={() => handleDelete(deleteId)}>Delete</button>
      </div>
    </ModalBox>
  )}

  {modal && (
    <ModalBox title={modal.id ? "Edit Client" : "Add Client"} onClose={() => setModal(null)}>
      <ClientForm initialData={modal} onSave={handleSave} onCancel={() => setModal(null)} />
    </ModalBox>
  )}
</div>

);
}

function ClientForm({ initialData, onSave, onCancel }) {
const [form, setForm] = useState(initialData);
const [activeTab, setActiveTab] = useState("basic");
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const tabs = [
{ id: "basic", label: "Basic Info" },
{ id: "address", label: "Address & Access" },
{ id: "service", label: "Service & Billing" },
{ id: "details", label: "Property Details" },
];

return (
<div>
<FormTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

  {activeTab === "basic" && (
    <div className="form-grid">
      <Field label="Client Name *"><TextInput value={form.name} onChange={ev => set("name", ev.target.value)} placeholder="Name or company" /></Field>
      <Field label="Contact Person"><TextInput value={form.contactPerson || ""} onChange={ev => set("contactPerson", ev.target.value)} /></Field>
      <Field label="Email"><TextInput type="email" value={form.email} onChange={ev => set("email", ev.target.value)} /></Field>
      <Field label="Phone"><TextInput value={form.phone} onChange={ev => set("phone", ev.target.value)} placeholder="+352 ..." /></Field>
      <Field label="Mobile"><TextInput value={form.phoneMobile || ""} onChange={ev => set("phoneMobile", ev.target.value)} placeholder="+352 ..." /></Field>
      <Field label="Preferred Language">
        <SelectInput value={form.language || "FR"} onChange={ev => set("language", ev.target.value)}>
          <option value="FR">Français</option><option value="DE">Deutsch</option><option value="EN">English</option><option value="PT">Português</option><option value="LU">Lëtzebuergesch</option>
        </SelectInput>
      </Field>
      <Field label="Client Type">
        <SelectInput value={form.type} onChange={ev => set("type", ev.target.value)}>
          <option>Residential</option><option>Commercial</option><option>Office</option><option>Industrial</option><option>Airbnb</option>
        </SelectInput>
      </Field>
      <Field label="Status">
        <SelectInput value={form.status} onChange={ev => set("status", ev.target.value)}>
          <option value="active">Active</option><option value="inactive">Inactive</option><option value="prospect">Prospect</option>
        </SelectInput>
      </Field>
      {(form.type === "Commercial" || form.type === "Office") && <Field label="Tax / VAT ID"><TextInput value={form.taxId || ""} onChange={ev => set("taxId", ev.target.value)} placeholder="LU..." /></Field>}
    </div>
  )}

  {activeTab === "address" && (
    <div className="form-grid">
      <div style={{ gridColumn: "1/-1" }}><Field label="Street Address"><TextInput value={form.address} onChange={ev => set("address", ev.target.value)} placeholder="Street name & house number" /></Field></div>
      <Field label="Apt / Floor / Unit"><TextInput value={form.apartmentFloor || ""} onChange={ev => set("apartmentFloor", ev.target.value)} placeholder="e.g. 3rd floor, Apt 12B" /></Field>
      <Field label="Postal Code"><TextInput value={form.postalCode || ""} onChange={ev => set("postalCode", ev.target.value)} placeholder="L-1234" /></Field>
      <Field label="City"><TextInput value={form.city || ""} onChange={ev => set("city", ev.target.value)} /></Field>
      <Field label="Country"><TextInput value={form.country || ""} onChange={ev => set("country", ev.target.value)} /></Field>
      <div style={{ gridColumn: "1/-1", borderTop: `1px solid ${CL.bd}`, paddingTop: 12, marginTop: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: CL.gold, marginBottom: 10 }}>Access Information</div>
      </div>
      <Field label="Building Code / Digicode"><TextInput value={form.accessCode || ""} onChange={ev => set("accessCode", ev.target.value)} placeholder="e.g. #1234" /></Field>
      <Field label="Key Location"><TextInput value={form.keyLocation || ""} onChange={ev => set("keyLocation", ev.target.value)} placeholder="e.g. Under mat, with concierge" /></Field>
      <Field label="Parking Info"><TextInput value={form.parkingInfo || ""} onChange={ev => set("parkingInfo", ev.target.value)} placeholder="e.g. Free street parking" /></Field>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="Access / Entry Instructions"><TextArea value={form.specialInstructions || ""} onChange={ev => set("specialInstructions", ev.target.value)} placeholder="Special instructions to enter..." /></Field>
      </div>
    </div>
  )}

  {activeTab === "service" && (
    <div className="form-grid">
      <Field label="Cleaning Frequency">
        <SelectInput value={form.cleaningFrequency} onChange={ev => set("cleaningFrequency", ev.target.value)}>
          <option>One-time</option><option>Weekly</option><option>Bi-weekly</option><option>Monthly</option><option>2x per week</option><option>3x per week</option><option>Daily</option><option>Custom</option>
        </SelectInput>
      </Field>
      <Field label="Preferred Day">
        <SelectInput value={form.preferredDay || ""} onChange={ev => set("preferredDay", ev.target.value)}>
          <option value="">No preference</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
        </SelectInput>
      </Field>
      <Field label="Preferred Time"><TextInput value={form.preferredTime || ""} onChange={ev => set("preferredTime", ev.target.value)} placeholder="e.g. 09:00-12:00" /></Field>
      <Field label="Billing Type">
        <SelectInput value={form.billingType} onChange={ev => set("billingType", ev.target.value)}>
          <option value="hourly">Hourly</option><option value="fixed">Fixed Price</option>
        </SelectInput>
      </Field>
      {form.billingType === "hourly"
        ? <Field label="Price per Hour (€)"><TextInput type="number" step=".5" value={form.pricePerHour} onChange={ev => set("pricePerHour", parseFloat(ev.target.value) || 0)} /></Field>
        : <Field label="Fixed Price (€)"><TextInput type="number" value={form.priceFixed} onChange={ev => set("priceFixed", parseFloat(ev.target.value) || 0)} /></Field>
      }
      <Field label="Contract Start"><TextInput type="date" value={form.contractStart || ""} onChange={ev => set("contractStart", ev.target.value)} /></Field>
      <Field label="Contract End"><TextInput type="date" value={form.contractEnd || ""} onChange={ev => set("contractEnd", ev.target.value)} /></Field>
    </div>
  )}

  {activeTab === "details" && (
    <div className="form-grid">
      <Field label="Property Size (m²)"><TextInput type="number" value={form.squareMeters || ""} onChange={ev => set("squareMeters", ev.target.value)} placeholder="e.g. 120" /></Field>
      <Field label="Pets"><TextInput value={form.petInfo || ""} onChange={ev => set("petInfo", ev.target.value)} placeholder="e.g. 1 cat (friendly)" /></Field>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="Notes & Special Requests"><TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} placeholder="Allergies, products to use/avoid, rooms to skip..." /></Field>
      </div>
    </div>
  )}

  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
    <button style={btnSec} onClick={onCancel}>Cancel</button>
    <button style={btnPri} onClick={() => form.name && onSave(form)}>Save Client</button>
  </div>
</div>

);
}

// ==============================================
// SCHEDULE PAGE - Monthly Calendar
// ==============================================
function SchedulePage({ data, updateData, showToast }) {
const [modal, setModal] = useState(null);
const [selectedDate, setSelectedDate] = useState(null);
const [filterEmp, setFilterEmp] = useState("");
const [viewMode, setViewMode] = useState("calendar");
const now = new Date();
const [viewYear, setViewYear] = useState(now.getFullYear());
const [viewMonth, setViewMonth] = useState(now.getMonth());

const emptySchedule = { clientId: "", employeeId: "", date: getToday(), startTime: "08:00", endTime: "12:00", status: "scheduled", notes: "", recurrence: "none" };
const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const todayStr = getToday();

const prevMonth = () => {
if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
else setViewMonth(viewMonth - 1);
};
const nextMonth = () => {
if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
else setViewMonth(viewMonth + 1);
};
const goToday = () => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); };
const jumpToDate = (dateObj) => {
setViewYear(dateObj.getFullYear());
setViewMonth(dateObj.getMonth());
setSelectedDate(dateObj.getDate());
};
const goTomorrow = () => {
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
jumpToDate(tomorrow);
};
const goNextWeek = () => {
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
jumpToDate(nextWeek);
};

const monthSchedules = data.schedules.filter(s => {
if (!s.date?.startsWith(monthStr)) return false;
if (filterEmp && s.employeeId !== filterEmp) return false;
return true;
});
const orderedMonthSchedules = [...monthSchedules].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

const empColors = {};
const colorPalette = [CL.blue, CL.green, "#E06CC0", CL.orange, "#8B6CE0", "#6CE0B8", "#E0A86C", "#6C8BE0", CL.red, "#C0E06C"];
data.employees.forEach((emp, idx) => { empColors[emp.id] = colorPalette[idx % colorPalette.length]; });

const calendarCells = [];
for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
while (calendarCells.length < 42) calendarCells.push(null);

const selectedDateStr = selectedDate ? `${monthStr}-${String(selectedDate).padStart(2, "0")}` : null;
const selectedDateScheds = selectedDateStr ? orderedMonthSchedules.filter(s => s.date === selectedDateStr) : [];

const handleSave = (schedData) => {
if (schedData.id) {
updateData("schedules", prev => prev.map(s => s.id === schedData.id ? { ...schedData, updatedAt: new Date().toISOString() } : s));
showToast("Updated");
} else {
const stamp = new Date().toISOString();
const items = [{ ...schedData, id: makeId(), updatedAt: stamp }];
if (schedData.recurrence !== "none") {
const baseDate = new Date(schedData.date);
if (schedData.recurrence === "daily") {
for (let i = 1; i <= 30; i++) {
const d = new Date(baseDate);
d.setDate(d.getDate() + i);
items.push({ ...schedData, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
}
} else if (schedData.recurrence === "daily-weekdays") {
let added = 0;
let offset = 1;
while (added < 30) {
const d = new Date(baseDate);
d.setDate(d.getDate() + offset);
const dayOfWeek = d.getDay();
if (dayOfWeek !== 0 && dayOfWeek !== 6) {
items.push({ ...schedData, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
added++;
}
offset++;
}
} else {
const interval = schedData.recurrence === "weekly" ? 7 : schedData.recurrence === "biweekly" ? 14 : 28;
for (let i = 1; i <= 12; i++) {
const d = new Date(baseDate);
d.setDate(d.getDate() + interval * i);
items.push({ ...schedData, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
}
}
}
updateData("schedules", prev => [...prev, ...items]);
showToast(`${items.length} job(s) scheduled`);
}
setModal(null);
};

const handleDelete = (id) => {
updateData("schedules", prev => prev.filter(s => s.id !== id));
showToast("Removed", "error");
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Schedule</h1>
<button style={btnPri} onClick={() => setModal({ ...emptySchedule })}>{ICN.plus} New Job</button>
</div>

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<button onClick={prevMonth} style={{ ...btnSec, ...btnSm, padding: "8px 14px", fontSize: 16 }}>‹</button>
<button onClick={goToday} style={{ ...btnSec, ...btnSm }}>Today</button>
<button onClick={goTomorrow} style={{ ...btnSec, ...btnSm }}>Tomorrow</button>
<button onClick={goNextWeek} style={{ ...btnSec, ...btnSm }}>Next Week</button>
<button onClick={nextMonth} style={{ ...btnSec, ...btnSm, padding: "8px 14px", fontSize: 16 }}>›</button>
<h2 style={{ margin: 0, fontSize: 20, fontFamily: "'Cormorant Garamond', serif", color: CL.text, marginLeft: 8 }}>{monthLabel}</h2>
</div>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<div style={{ display: "flex", background: CL.s2, border: `1px solid ${CL.bd}`, borderRadius: 8, padding: 2 }}>
<button style={{ ...btnSec, ...btnSm, background: viewMode === "calendar" ? CL.blue : "transparent", border: "none", color: viewMode === "calendar" ? CL.white : CL.muted }} onClick={() => setViewMode("calendar")}>Calendar</button>
<button style={{ ...btnSec, ...btnSm, background: viewMode === "list" ? CL.blue : "transparent", border: "none", color: viewMode === "list" ? CL.white : CL.muted }} onClick={() => setViewMode("list")}>List</button>
</div>
<SelectInput value={filterEmp} onChange={ev => setFilterEmp(ev.target.value)} style={{ width: 180 }}>
<option value="">All Employees</option>
{data.employees.filter(emp => emp.status === "active").map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
</SelectInput>
</div>
</div>

<div className="stat-row" style={{ marginBottom: 16 }}>
<StatCard label="This Month" value={`${monthSchedules.length} jobs`} icon={ICN.cal} color={CL.blue} />
<StatCard label="In Progress" value={monthSchedules.filter(s => s.status === "in-progress").length} icon={ICN.clock} color={CL.orange} />
<StatCard label="Completed" value={monthSchedules.filter(s => s.status === "completed").length} icon={ICN.check} color={CL.green} />
</div>

{viewMode === "calendar" ? (
<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
<div style={{ flex: "1 1 600px", minWidth: 0 }}>
<div style={{ ...cardSt, padding: 12 }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
{dayHeaders.map(d => <div key={d} style={{ textAlign: "center", padding: "6px 0", fontSize: 11, fontWeight: 600, color: CL.muted, textTransform: "uppercase" }}>{d}</div>)}
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
{calendarCells.map((day, idx) => {
if (day === null) return <div key={`empty-${idx}`} style={{ minHeight: 70, background: CL.bg + "40", borderRadius: 6 }} />;
const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
const dayScheds = orderedMonthSchedules.filter(s => s.date === dateStr);
const isToday = dateStr === todayStr;
const isSelected = day === selectedDate;
const isPast = dateStr < todayStr;
return (
<div key={day} onClick={() => setSelectedDate(day === selectedDate ? null : day)} style={{ minHeight: 70, padding: 4, borderRadius: 6, cursor: "pointer", background: isSelected ? CL.gold + "15" : isToday ? CL.blue + "08" : CL.s2, border: isSelected ? `2px solid ${CL.gold}` : isToday ? `2px solid ${CL.blue}40` : `1px solid ${CL.bd}50`, opacity: isPast ? 0.7 : 1, transition: "all 0.15s" }}>
<div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? CL.blue : CL.text, marginBottom: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<span>{day}</span>
{dayScheds.length > 0 && <span style={{ fontSize: 9, background: CL.gold + "30", color: CL.gold, padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>{dayScheds.length}</span>}
</div>
{dayScheds.slice(0, 3).map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const statusColor = scheduleStatusColor(sched.status);
return <div key={sched.id} onClick={ev => { ev.stopPropagation(); setModal({ ...sched }); }} style={{ padding: "2px 4px", marginBottom: 1, borderRadius: 3, fontSize: 9, background: statusColor + "20", borderLeft: `3px solid ${statusColor}`, cursor: "pointer", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}><span style={{ fontWeight: 600, color: CL.text }}>{sched.startTime} </span><span style={{ color: CL.muted }}>{client?.name?.slice(0, 10) || "?"}</span></div>;
})}
{dayScheds.length > 3 && <div style={{ fontSize: 8, color: CL.muted, textAlign: "center" }}>+{dayScheds.length - 3} more</div>}
</div>
);
})}
</div>
</div>
</div>

<div style={{ flex: "0 0 280px", minWidth: 240 }}>
<div style={cardSt}>
{selectedDate ? (<>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
<h3 style={{ fontSize: 15, fontWeight: 600, color: CL.gold, fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>{fmtDate(selectedDateStr)}</h3>
<button style={{ ...btnPri, ...btnSm, background: CL.green }} onClick={() => setModal({ ...emptySchedule, date: selectedDateStr })}>{ICN.plus} Add</button>
</div>
{selectedDateScheds.length === 0 ? <p style={{ color: CL.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No jobs this day</p> : selectedDateScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(emp => emp.id === sched.employeeId);
const empColor = empColors[sched.employeeId] || CL.muted;
return <div key={sched.id} onClick={() => setModal({ ...sched })} style={{ padding: "10px 12px", marginBottom: 8, borderRadius: 8, cursor: "pointer", background: CL.s2, borderLeft: `4px solid ${empColor}` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontWeight: 600, fontSize: 14, color: CL.text }}>{client?.name || "?"}</div><Badge color={scheduleStatusColor(sched.status)}>{sched.status}</Badge></div><div style={{ fontSize: 12, color: CL.muted, marginTop: 4 }}>{sched.startTime} - {sched.endTime}</div><div style={{ fontSize: 12, color: empColor, marginTop: 2 }}>{employee?.name || "Unassigned"}</div></div>;
})}
</>) : <div style={{ textAlign: "center", padding: "30px 10px" }}><div style={{ color: CL.muted, marginBottom: 8 }}>{ICN.cal}</div><p style={{ color: CL.muted, fontSize: 13 }}>Click a date to see details</p></div>}
</div>
</div>
</div>
) : (
<div style={cardSt}>
<div style={{ fontSize: 12, color: CL.muted, marginBottom: 10 }}>Monthly job list by date (readable after clocking/status changes).</div>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Date</th><th style={thSt}>Time</th><th style={thSt}>Client</th><th style={thSt}>Cleaner</th><th style={thSt}>Status</th></tr></thead>
<tbody>
{orderedMonthSchedules.map(s => {
const client = data.clients.find(c => c.id === s.clientId);
const employee = data.employees.find(e => e.id === s.employeeId);
return <tr key={s.id} onClick={() => setModal({ ...s })} style={{ cursor: "pointer" }}><td style={tdSt}>{fmtDate(s.date)}</td><td style={tdSt}>{s.startTime} - {s.endTime}</td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{employee?.name || "Unassigned"}</td><td style={tdSt}><Badge color={scheduleStatusColor(s.status)}>{s.status}</Badge></td></tr>;
})}
{orderedMonthSchedules.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No jobs in this month</td></tr>}
</tbody>
</table>
</div>
</div>
)}

{modal && (
<ModalBox title={modal.id ? "Edit Job" : "New Job"} onClose={() => setModal(null)}>
<ScheduleForm initialData={modal} data={data} onSave={handleSave} onDelete={handleDelete} onCancel={() => setModal(null)} />
</ModalBox>
)}
</div>
);
}

function ScheduleForm({ initialData, data, onSave, onDelete, onCancel }) {
const [form, setForm] = useState(initialData);
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

// Show client details when selected
const selectedClient = data.clients.find(c => c.id === form.clientId);
const isCompletedLocked = Boolean(form.id && form.status === "completed");

return (
<div>
<div className="form-grid">
<Field label="Client *">
<SelectInput value={form.clientId} onChange={ev => set("clientId", ev.target.value)} disabled={isCompletedLocked}>
<option value="">Select...</option>
{data.clients.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
</SelectInput>
</Field>
<Field label="Employee *">
<SelectInput value={form.employeeId} onChange={ev => set("employeeId", ev.target.value)} disabled={isCompletedLocked}>
<option value="">Select...</option>
{data.employees.filter(emp => emp.status === "active").map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
</SelectInput>
</Field>
<Field label="Date"><TextInput type="date" value={form.date} onChange={ev => set("date", ev.target.value)} disabled={isCompletedLocked} /></Field>
<Field label="Status">
<SelectInput value={form.status} onChange={ev => set("status", ev.target.value)} disabled={isCompletedLocked}>
<option value="scheduled">Scheduled</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
</SelectInput>
</Field>
<Field label="Start"><TextInput type="time" value={form.startTime} onChange={ev => set("startTime", ev.target.value)} disabled={isCompletedLocked} /></Field>
<Field label="End"><TextInput type="time" value={form.endTime} onChange={ev => set("endTime", ev.target.value)} disabled={isCompletedLocked} /></Field>
{!form.id && (
<Field label="Recurrence">
<SelectInput value={form.recurrence} onChange={ev => set("recurrence", ev.target.value)} disabled={isCompletedLocked}>
<option value="none">One-time</option><option value="daily">Daily (weekends included)</option><option value="daily-weekdays">Daily (weekdays only)</option><option value="weekly">Weekly (12 weeks)</option><option value="biweekly">Bi-weekly (12x)</option><option value="monthly">Monthly (12 months)</option>
</SelectInput>
</Field>
)}
</div>

  {/* Client quick info */}
  {isCompletedLocked && <div style={{ marginBottom: 10, fontSize: 12, color: CL.green }}>This job is marked as completed and can no longer be edited.</div>}
  {selectedClient && (
    <div style={{ padding: 10, background: CL.s2, borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: CL.gold, marginBottom: 4 }}>Client Info</div>
      <div style={{ color: CL.muted }}>
        {selectedClient.address}{selectedClient.apartmentFloor ? `, ${selectedClient.apartmentFloor}` : ""}
        {selectedClient.city ? ` · ${selectedClient.postalCode || ""} ${selectedClient.city}` : ""}
      </div>
      {selectedClient.accessCode && <div style={{ color: CL.orange }}>Code: {selectedClient.accessCode}</div>}
      {selectedClient.keyLocation && <div style={{ color: CL.orange }}>Key: {selectedClient.keyLocation}</div>}
      {selectedClient.petInfo && <div style={{ color: CL.orange }}>Pets: {selectedClient.petInfo}</div>}
      {selectedClient.preferredDay && <div style={{ color: CL.dim }}>Prefers: {selectedClient.preferredDay} {selectedClient.preferredTime || ""}</div>}
    </div>
  )}

  <Field label="Notes"><TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} disabled={isCompletedLocked} /></Field>
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 8 }}>
    <div>{form.id && <button style={{ ...btnDng, ...btnSm }} disabled={isCompletedLocked} onClick={() => { onCancel(); onDelete(form.id); }}>Delete Job</button>}</div>
    <div style={{ display: "flex", gap: 10 }}>
      <button style={btnSec} onClick={onCancel}>Cancel</button>
      <button style={btnPri} disabled={isCompletedLocked} onClick={() => form.clientId && form.employeeId && onSave(form)}>{isCompletedLocked ? "Completed" : "Save Job"}</button>
    </div>
  </div>
</div>

);
}

// ==============================================
// TIME CLOCK PAGE
// ==============================================
function TimeClockPage({ data, updateData, showToast }) {
const [selectedEmp, setSelectedEmp] = useState("");
const [selectedCli, setSelectedCli] = useState("");
const [clockInNote, setClockInNote] = useState("");
const [manualEntry, setManualEntry] = useState({
employeeId: "",
clientId: "",
clockInDate: getToday(),
clockInTime: "08:00",
clockOutDate: "",
clockOutTime: "",
notes: "",
});
const [filters, setFilters] = useState({ emp: "", month: getToday().slice(0, 7) });
const [editEntry, setEditEntry] = useState(null);

const setManual = (key, value) => setManualEntry(prev => ({ ...prev, [key]: value }));

const doClockIn = () => {
if (!selectedEmp || !selectedCli) { showToast("Select both", "error"); return; }
if (data.clockEntries.find(c => c.employeeId === selectedEmp && !c.clockOut)) { showToast("Already in!", "error"); return; }
const isCompletedToday = data.schedules.some(sc => sc.employeeId === selectedEmp && sc.clientId === selectedCli && sc.date === getToday() && sc.status === "completed");
if (isCompletedToday) { showToast("Job already completed for today", "error"); return; }
const nowAt = new Date();
const lateMeta = getLateMeta(data.schedules, { employeeId: selectedEmp, clientId: selectedCli, clockInAt: nowAt });
updateData("clockEntries", prev => [...prev, {
id: makeId(), employeeId: selectedEmp, clientId: selectedCli,
clockIn: nowAt.toISOString(), clockOut: null,
notes: clockInNote.trim(),
isLate: lateMeta.isLate, lateMinutes: lateMeta.lateMinutes,
scheduledStart: lateMeta.scheduledStart,
}]);
updateData("schedules", prev => updateScheduleStatusForJob(prev, { employeeId: selectedEmp, clientId: selectedCli, date: lateMeta.workDate, from: "scheduled", to: "in-progress" }));
setClockInNote("");
showToast(lateMeta.isLate ? `Clocked in (Late by ${lateMeta.lateMinutes} min)` : "Clocked in!");
};

const doClockOut = (id) => {
const entry = data.clockEntries.find(c => c.id === id);
updateData("clockEntries", prev => prev.map(c => c.id === id ? { ...c, clockOut: new Date().toISOString() } : c));
if (entry) {
const workDate = entry.clockIn?.slice(0, 10) || getToday();
updateData("schedules", prev => updateScheduleStatusForJob(prev, { employeeId: entry.employeeId, clientId: entry.clientId, date: workDate, from: "in-progress", to: "completed" }));
}
showToast("Clocked out!");
};

const addManualEntry = () => {
if (!manualEntry.employeeId || !manualEntry.clientId) { showToast("Select employee and client", "error"); return; }
if (!manualEntry.clockInDate || !manualEntry.clockInTime) { showToast("Set clock-in date/time", "error"); return; }

const clockInISO = makeISO(manualEntry.clockInDate, manualEntry.clockInTime);
const hasClockOut = Boolean(manualEntry.clockOutDate && manualEntry.clockOutTime);
const clockOutISO = hasClockOut ? makeISO(manualEntry.clockOutDate, manualEntry.clockOutTime) : null;

if (clockOutISO && new Date(clockOutISO) < new Date(clockInISO)) {
showToast("Clock-out must be after clock-in", "error");
return;
}

const lateMeta = getLateMeta(data.schedules, {
employeeId: manualEntry.employeeId,
clientId: manualEntry.clientId,
clockInAt: new Date(clockInISO),
});

updateData("clockEntries", prev => [...prev, {
id: makeId(),
employeeId: manualEntry.employeeId,
clientId: manualEntry.clientId,
clockIn: clockInISO,
clockOut: clockOutISO,
notes: manualEntry.notes.trim(),
isLate: lateMeta.isLate,
lateMinutes: lateMeta.lateMinutes,
scheduledStart: lateMeta.scheduledStart,
}]);

updateData("schedules", prev => updateScheduleStatusForJob(prev, {
employeeId: manualEntry.employeeId,
clientId: manualEntry.clientId,
date: manualEntry.clockInDate,
from: "scheduled",
to: clockOutISO ? "completed" : "in-progress",
}));

setManualEntry({
employeeId: "",
clientId: "",
clockInDate: getToday(),
clockInTime: "08:00",
clockOutDate: "",
clockOutTime: "",
notes: "",
});
showToast("Manual clock entry added");
};

const saveEntry = (entry) => {
updateData("clockEntries", prev => prev.map(c => c.id === entry.id ? entry : c));
showToast("Updated");
setEditEntry(null);
};

const deleteEntry = (id) => {
updateData("clockEntries", prev => prev.filter(c => c.id !== id));
showToast("Deleted", "error");
};

const activeClocks = data.clockEntries.filter(c => !c.clockOut);
const filteredEntries = data.clockEntries.filter(c => {
if (filters.emp && c.employeeId !== filters.emp) return false;
if (filters.month && c.clockIn && !c.clockIn.startsWith(filters.month)) return false;
return true;
}).sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 16 }}>Time Clock</h1>

  <div style={{ ...cardSt, marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Quick Clock In</h3>
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <Field label="Employee">
          <SelectInput value={selectedEmp} onChange={ev => setSelectedEmp(ev.target.value)}>
            <option value="">Select...</option>
            {data.employees.filter(emp => emp.status === "active").map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </SelectInput>
        </Field>
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <Field label="Client">
          <SelectInput value={selectedCli} onChange={ev => setSelectedCli(ev.target.value)}>
            <option value="">Select...</option>
            {data.clients.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </Field>
      </div>
      <button style={{ ...btnPri, marginBottom: 14, background: CL.green }} onClick={doClockIn}>Clock In</button>
    </div>
    <Field label="Clock-in note (optional)">
      <TextInput value={clockInNote} onChange={ev => setClockInNote(ev.target.value)} placeholder="Late reason, traffic, access issue..." />
    </Field>
    {activeClocks.length > 0 && (
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 12, color: CL.green, fontWeight: 600, marginBottom: 4 }}>Active:</div>
        {activeClocks.map(clk => {
          const employee = data.employees.find(e => e.id === clk.employeeId);
          const client = data.clients.find(c => c.id === clk.clientId);
          return (
            <div key={clk.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${CL.bd}` }}>
              <span><strong>{employee?.name}</strong> at {client?.name} · {fmtTime(clk.clockIn)} {clk.isLate ? `· Late ${clk.lateMinutes || 0}m` : ""}</span>
              <button style={{ ...btnDng, ...btnSm }} onClick={() => doClockOut(clk.id)}>Out</button>
            </div>
          );
        })}
      </div>
    )}
  </div>

  <div style={{ ...cardSt, marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>Owner: Add missed clock-in</h3>
    <div className="form-grid" style={{ marginBottom: 8 }}>
      <Field label="Employee">
        <SelectInput value={manualEntry.employeeId} onChange={ev => setManual("employeeId", ev.target.value)}>
          <option value="">Select...</option>
          {data.employees.filter(emp => emp.status === "active").map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
        </SelectInput>
      </Field>
      <Field label="Client">
        <SelectInput value={manualEntry.clientId} onChange={ev => setManual("clientId", ev.target.value)}>
          <option value="">Select...</option>
          {data.clients.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectInput>
      </Field>
      <Field label="In Date"><TextInput type="date" value={manualEntry.clockInDate} onChange={ev => setManual("clockInDate", ev.target.value)} /></Field>
      <Field label="In Time"><TextInput type="time" value={manualEntry.clockInTime} onChange={ev => setManual("clockInTime", ev.target.value)} /></Field>
      <Field label="Out Date (optional)"><TextInput type="date" value={manualEntry.clockOutDate} onChange={ev => setManual("clockOutDate", ev.target.value)} /></Field>
      <Field label="Out Time (optional)"><TextInput type="time" value={manualEntry.clockOutTime} onChange={ev => setManual("clockOutTime", ev.target.value)} /></Field>
    </div>
    <Field label="Reason / note (optional)">
      <TextInput value={manualEntry.notes} onChange={ev => setManual("notes", ev.target.value)} placeholder="Forgot to clock in, adjusted by owner..." />
    </Field>
    <button style={{ ...btnPri, background: CL.blue }} onClick={addManualEntry}>Add Manual Entry</button>
  </div>

  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
    <SelectInput value={filters.emp} onChange={ev => setFilters(f => ({ ...f, emp: ev.target.value }))} style={{ width: 160 }}>
      <option value="">All Employees</option>
      {data.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
    </SelectInput>
    <TextInput type="month" value={filters.month} onChange={ev => setFilters(f => ({ ...f, month: ev.target.value }))} style={{ width: 160 }} />
  </div>

  <div style={cardSt} className="tbl-wrap">
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead><tr><th style={thSt}>Employee</th><th style={thSt}>Client</th><th style={thSt}>In</th><th style={thSt}>Out</th><th style={thSt}>Late</th><th style={thSt}>Notes</th><th style={thSt}>Hours</th><th style={thSt}>Actions</th></tr></thead>
      <tbody>
        {filteredEntries.map(entry => {
          const employee = data.employees.find(e => e.id === entry.employeeId);
          const client = data.clients.find(c => c.id === entry.clientId);
          const hours = calcHrs(entry.clockIn, entry.clockOut);
          return (
            <tr key={entry.id}>
              <td style={tdSt}>{employee?.name || "-"}</td>
              <td style={tdSt}>{client?.name || "-"}</td>
              <td style={tdSt}>{fmtBoth(entry.clockIn)}</td>
              <td style={tdSt}>{entry.clockOut ? fmtBoth(entry.clockOut) : <Badge color={CL.green}>Active</Badge>}</td>
              <td style={tdSt}>{entry.isLate ? <Badge color={CL.orange}>Late {entry.lateMinutes || 0}m</Badge> : <Badge color={CL.green}>On time</Badge>}</td>
              <td style={tdSt}>{entry.notes || "-"}</td>
              <td style={tdSt}>{entry.clockOut ? `${hours.toFixed(2)}h` : "-"}</td>
              <td style={tdSt}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ ...btnSec, ...btnSm }} onClick={() => setEditEntry({ ...entry })}>{ICN.edit}</button>
                  <button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => deleteEntry(entry.id)}>{ICN.trash}</button>
                </div>
              </td>
            </tr>
          );
        })}
        {filteredEntries.length === 0 && <tr><td colSpan={8} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No entries</td></tr>}
      </tbody>
    </table>
  </div>

  {editEntry && (
    <ModalBox title="Edit Entry" onClose={() => setEditEntry(null)}>
      <TimeEntryForm entry={editEntry} data={data} onSave={saveEntry} onCancel={() => setEditEntry(null)} />
    </ModalBox>
  )}
</div>

);
}

function TimeEntryForm({ entry, data, onSave, onCancel }) {
const clockInDate = entry.clockIn ? entry.clockIn.slice(0, 10) : getToday();
const clockInTime = entry.clockIn ? entry.clockIn.slice(11, 16) : "08:00";
const clockOutDate = entry.clockOut ? entry.clockOut.slice(0, 10) : clockInDate;
const clockOutTime = entry.clockOut ? entry.clockOut.slice(11, 16) : "17:00";

const [form, setForm] = useState({ ...entry, clockInDate, clockInTime, clockOutDate, clockOutTime });
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const handleSave = () => {
const updated = {
...form,
clockIn: makeISO(form.clockInDate, form.clockInTime),
clockOut: form.clockOutDate && form.clockOutTime ? makeISO(form.clockOutDate, form.clockOutTime) : null,
};
delete updated.clockInDate;
delete updated.clockInTime;
delete updated.clockOutDate;
delete updated.clockOutTime;
onSave(updated);
};

return (
<div>
<div className="form-grid">
<Field label="Employee">
<SelectInput value={form.employeeId} onChange={ev => set("employeeId", ev.target.value)}>
{data.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
</SelectInput>
</Field>
<Field label="Client">
<SelectInput value={form.clientId} onChange={ev => set("clientId", ev.target.value)}>
{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
</SelectInput>
</Field>
<Field label="In Date"><TextInput type="date" value={form.clockInDate} onChange={ev => set("clockInDate", ev.target.value)} /></Field>
<Field label="In Time"><TextInput type="time" value={form.clockInTime} onChange={ev => set("clockInTime", ev.target.value)} /></Field>
<Field label="Out Date"><TextInput type="date" value={form.clockOutDate} onChange={ev => set("clockOutDate", ev.target.value)} /></Field>
<Field label="Out Time"><TextInput type="time" value={form.clockOutTime} onChange={ev => set("clockOutTime", ev.target.value)} /></Field>
</div>
<div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
<button style={btnSec} onClick={onCancel}>Cancel</button>
<button style={btnPri} onClick={handleSave}>Save</button>
</div>
</div>
);
}

// ==============================================
// INVOICES PAGE
// ==============================================

function InventoryPage({ data, updateData, showToast }) {
const [productForm, setProductForm] = useState({ name: "", unit: "bottles", stock: 0, minStock: 0, note: "" });

const products = (data.inventoryProducts || []).sort((a, b) => a.name.localeCompare(b.name));
const requests = (data.productRequests || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const holdings = (data.cleanerProductHoldings || []);

const saveProduct = () => {
if (!productForm.name.trim()) { showToast("Product name required", "error"); return; }
updateData("inventoryProducts", (prev = []) => [...prev, { id: makeId(), active: true, ...productForm, name: productForm.name.trim(), stock: Number(productForm.stock) || 0, minStock: Number(productForm.minStock) || 0 }]);
setProductForm({ name: "", unit: "bottles", stock: 0, minStock: 0, note: "" });
showToast("Product added");
};

const adjustStock = (id, delta) => {
updateData("inventoryProducts", prev => (prev || []).map(p => p.id === id ? { ...p, stock: Math.max(0, (Number(p.stock) || 0) + delta) } : p));
};

const setRequestStatus = (id, status) => {
updateData("productRequests", prev => (prev || []).map(r => r.id === id ? { ...r, status } : r));
};

const approveRequest = (req, qty) => {
const approved = Math.max(0, Number(qty) || 0);
updateData("productRequests", prev => (prev || []).map(r => r.id === req.id ? { ...r, status: "approved", approvedQty: approved } : r));
showToast("Request approved");
};

const upsertHolding = (employeeId, productId, deliveredQty) => {
updateData("cleanerProductHoldings", (prev = []) => {
const idx = prev.findIndex(h => h.employeeId === employeeId && h.productId === productId);
if (idx === -1) return [...prev, { id: makeId(), employeeId, productId, qtyAssigned: deliveredQty, qtyInHand: deliveredQty, updatedAt: new Date().toISOString() }];
const next = [...prev];
next[idx] = { ...next[idx], qtyAssigned: (Number(next[idx].qtyAssigned) || 0) + deliveredQty, qtyInHand: (Number(next[idx].qtyInHand) || 0) + deliveredQty, updatedAt: new Date().toISOString() };
return next;
});
};

const updateHoldingInHand = (holdingId, qtyInHand) => {
updateData("cleanerProductHoldings", prev => (prev || []).map(h => h.id === holdingId ? { ...h, qtyInHand: Math.max(0, Number(qtyInHand) || 0), updatedAt: new Date().toISOString() } : h));
};

const deliverRequest = (req, qty) => {
const delivered = Math.max(0, Number(qty) || 0);
updateData("productRequests", prev => (prev || []).map(r => r.id === req.id ? { ...r, status: "delivered", deliveredQty: delivered } : r));
updateData("inventoryProducts", prev => (prev || []).map(p => p.id === req.productId ? { ...p, stock: Math.max(0, (Number(p.stock) || 0) - delivered) } : p));
upsertHolding(req.employeeId, req.productId, delivered);
showToast("Products delivered");
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Inventory</h1>
</div>

<div className="grid-2" style={{ marginBottom: 16 }}>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Add Product</h3>
<div className="form-grid">
<Field label="Name"><TextInput value={productForm.name} onChange={ev => setProductForm(v => ({ ...v, name: ev.target.value }))} /></Field>
<Field label="Unit"><TextInput value={productForm.unit} onChange={ev => setProductForm(v => ({ ...v, unit: ev.target.value }))} /></Field>
<Field label="Stock"><TextInput type="number" value={productForm.stock} onChange={ev => setProductForm(v => ({ ...v, stock: ev.target.value }))} /></Field>
<Field label="Min Stock"><TextInput type="number" value={productForm.minStock} onChange={ev => setProductForm(v => ({ ...v, minStock: ev.target.value }))} /></Field>
</div>
<Field label="Note"><TextArea value={productForm.note} onChange={ev => setProductForm(v => ({ ...v, note: ev.target.value }))} /></Field>
<button style={btnPri} onClick={saveProduct}>{ICN.plus} Add Product</button>
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Usage Overview</h3>
{products.map(p => {
const reqs = requests.filter(r => r.productId === p.id);
const requested = reqs.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
const delivered = reqs.reduce((s, r) => s + (Number(r.deliveredQty) || 0), 0);
return <div key={p.id} style={{ padding: "8px 0", borderBottom: `1px solid ${CL.bd}` }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><div><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12, color: CL.muted }}>Stock: {p.stock} {p.unit} · Requested: {requested} · Delivered: {delivered}</div></div><div style={{ display: "flex", gap: 4 }}><button style={{ ...btnSec, ...btnSm }} onClick={() => adjustStock(p.id, -1)}>-1</button><button style={{ ...btnSec, ...btnSm }} onClick={() => adjustStock(p.id, 1)}>+1</button></div></div></div>;
})}
{products.length === 0 && <p style={{ color: CL.muted }}>No products added yet.</p>}
</div>
</div>

<div style={{ ...cardSt, marginBottom: 16 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Assigned / In-Hand by Cleaner</h3>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Cleaner</th><th style={thSt}>Product</th><th style={thSt}>Assigned</th><th style={thSt}>In Hand</th><th style={thSt}>Update In Hand</th></tr></thead>
<tbody>
{holdings.map(h => { const emp = data.employees.find(e => e.id === h.employeeId); const prod = products.find(p => p.id === h.productId) || (data.inventoryProducts || []).find(p => p.id === h.productId); return (
<tr key={h.id}><td style={tdSt}>{emp?.name || "-"}</td><td style={tdSt}>{prod?.name || "-"}</td><td style={tdSt}>{h.qtyAssigned || 0}</td><td style={tdSt}>{h.qtyInHand || 0}</td><td style={tdSt}><div style={{ display: "flex", gap: 4 }}><button style={{ ...btnSec, ...btnSm }} onClick={() => updateHoldingInHand(h.id, (Number(h.qtyInHand)||0) - 1)}>-1</button><button style={{ ...btnSec, ...btnSm }} onClick={() => updateHoldingInHand(h.id, (Number(h.qtyInHand)||0) + 1)}>+1</button></div></td></tr>
); })}
{holdings.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No product assignments yet</td></tr>}
</tbody>
</table>
</div>
</div>

<div style={cardSt} className="tbl-wrap">
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Cleaner Product Requests</h3>
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Cleaner</th><th style={thSt}>Product</th><th style={thSt}>Qty</th><th style={thSt}>Delivery</th><th style={thSt}>Status</th><th style={thSt}>Actions</th></tr></thead>
<tbody>
{requests.map(req => { const emp = data.employees.find(e => e.id === req.employeeId); const prod = products.find(p => p.id === req.productId) || (data.inventoryProducts || []).find(p => p.id === req.productId); return (
<tr key={req.id}><td style={tdSt}>{emp?.name || "-"}</td><td style={tdSt}>{prod?.name || "-"}</td><td style={tdSt}>{req.quantity}</td><td style={tdSt}>{req.deliveryAt ? fmtBoth(req.deliveryAt) : "-"}</td><td style={tdSt}><Badge color={req.status === "delivered" ? CL.green : req.status === "rejected" ? CL.red : req.status === "approved" ? CL.blue : CL.orange}>{req.status}</Badge></td><td style={tdSt}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
{req.status === "pending" && <button style={{ ...btnSec, ...btnSm, color: CL.green }} onClick={() => approveRequest(req, req.quantity)}>{ICN.check} Approve</button>}
{["pending", "approved"].includes(req.status) && <button style={{ ...btnSec, ...btnSm }} onClick={() => deliverRequest(req, req.approvedQty || req.quantity)}>{ICN.doc} Deliver</button>}
{req.status !== "rejected" && req.status !== "delivered" && <button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => setRequestStatus(req.id, "rejected")}>{ICN.close} Reject</button>}
</div></td></tr>
); })}
{requests.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No product requests yet</td></tr>}
</tbody>
</table>
</div>
</div>
);
}

function DevisPage({ data, updateData, showToast, devisSeed, setDevisSeed }) {
const { t, lang } = useI18n();
const [modal, setModal] = useState(null);
const [preview, setPreview] = useState(null);
const [quoteForPdf, setQuoteForPdf] = useState(null);
const previewRef = useRef(null);
const hiddenQuoteRef = useRef(null);

const defaultQuoteColumns = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true };

const newQuoteDraft = (clientId = "", presetDescription = "Cleaning service") => ({ quoteNumber: quoteNumber(), clientId, date: getToday(), validUntil: "", items: [{ prestationDate: getToday(), description: presetDescription, hours: "", quantity: 1, unitPrice: 0, total: 0 }], pricingMode: "hours", visibleColumns: { ...defaultQuoteColumns }, vatRate: data.settings.defaultVatRate, subtotal: 0, vatAmount: 0, total: 0, status: "draft", notes: "", paymentTerms: "Quote valid for 30 days." });

useEffect(() => {
if (!devisSeed) return;
setModal(newQuoteDraft(devisSeed.clientId, devisSeed.description || "Prospect visit quotation"));
if (setDevisSeed) setDevisSeed(null);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [devisSeed]);

const quoteNumber = () => {
const year = getToday().slice(0, 4);
const prefix = `DEV-${year}-`;
const nums = (data.quotes || []).map(q => String(q.quoteNumber || "")).filter(n => n.startsWith(prefix)).map(n => parseInt(n.slice(prefix.length), 10)).filter(n => Number.isFinite(n));
return `${prefix}${String(nums.length ? Math.max(...nums) + 1 : 1).padStart(4, "0")}`;
};

const ensureLib = (src, check) => new Promise((resolve, reject) => {
if (check()) return resolve();
const existing = document.querySelector(`script[src="${src}"]`);
if (existing) { existing.addEventListener("load", () => resolve()); return; }
const script = document.createElement("script");
script.src = src;
script.async = true;
script.onload = () => resolve();
script.onerror = reject;
document.body.appendChild(script);
});

const toQuotePreviewShape = (q) => ({ ...q, invoiceNumber: q.quoteNumber, dueDate: q.validUntil });
const waitForPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

const buildPdfFromElement = async (element, fileName, shouldDownload = false) => {
await ensureLib("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", () => Boolean(window.html2canvas));
await ensureLib("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js", () => Boolean(window.jspdf));
const canvas = await window.html2canvas(element, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
const { jsPDF } = window.jspdf;
const pdf = new jsPDF("p", "mm", "a4");
const pageWidth = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();
const imgData = canvas.toDataURL("image/png");
const imgWidth = pageWidth;
const imgHeight = (canvas.height * imgWidth) / canvas.width;
if (imgHeight <= pageHeight) {
pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
} else {
let y = 0;
while (y < imgHeight) {
pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
y += pageHeight;
if (y < imgHeight) pdf.addPage();
}
}
if (shouldDownload) pdf.save(fileName);
return pdf.output("blob");
};

const triggerPdfDownload = (blob, fileName) => {
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = fileName;
a.click();
setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const downloadQuotePdf = async (q) => {
const fileName = `${q.quoteNumber || "quote"}.pdf`;
const currentPreview = preview?.id === q.id ? preview : null;
if (!currentPreview) {
setQuoteForPdf(toQuotePreviewShape(q));
await waitForPaint();
}
const target = currentPreview ? previewRef.current : hiddenQuoteRef.current;
if (!target) { showToast("Quote preview unavailable", "error"); return; }
await buildPdfFromElement(target, fileName, true);
if (!currentPreview) setQuoteForPdf(null);
showToast("Quote PDF downloaded");
};

const sendQuote = async (q) => {
const client = data.clients.find(c => c.id === q.clientId);
if (!client?.email) { showToast("Client email missing", "error"); return; }
const currentPreview = preview?.id === q.id ? preview : null;
if (!currentPreview) {
setQuoteForPdf(toQuotePreviewShape(q));
await waitForPaint();
}
const target = currentPreview ? previewRef.current : hiddenQuoteRef.current;
if (!target) { showToast("Quote preview unavailable", "error"); return; }
const pdfBlob = await buildPdfFromElement(target, `${q.quoteNumber || "quote"}.pdf`, false);
if (!currentPreview) setQuoteForPdf(null);
const pdfFile = new File([pdfBlob], `${q.quoteNumber || "quote"}.pdf`, { type: "application/pdf" });
const bodyText = `Dear ${client.contactPerson || client.name},

Please find quote ${q.quoteNumber}.
Date: ${fmtDate(q.date)}
Total: €${(q.total || 0).toFixed(2)}

Best regards,
${data.settings.companyName}`;

if (navigator.canShare && navigator.canShare({ files: [pdfFile] }) && navigator.share) {
try {
await navigator.share({ title: `Quote ${q.quoteNumber}`, text: bodyText, files: [pdfFile] });
showToast("Quote shared with PDF attachment");
return;
} catch {
}
}

triggerPdfDownload(pdfBlob, `${q.quoteNumber || "quote"}.pdf`);
const subject = encodeURIComponent(`Quote ${q.quoteNumber}`);
const body = encodeURIComponent(`${bodyText}

PDF downloaded automatically. Please attach it to this email.`);
window.open(`mailto:${client.email}?subject=${subject}&body=${body}`);
showToast("Email draft opened. PDF downloaded for attachment.");
};

const saveQuote = (q) => {
const subtotal = (q.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
const vatAmount = Math.round(subtotal * (Number(q.vatRate) || 0) / 100 * 100) / 100;
const final = { ...q, subtotal, vatAmount, total: subtotal + vatAmount };
if (final.id) updateData("quotes", prev => (prev || []).map(x => x.id === final.id ? final : x));
else updateData("quotes", prev => [...(prev || []), { ...final, id: makeId() }]);
showToast(final.id ? "Quote updated" : "Quote created");
setModal(null);
};

const deleteQuote = (id) => { updateData("quotes", prev => (prev || []).filter(q => q.id !== id)); showToast("Quote deleted", "error"); };

const toInvoiceNum = () => {
const [year, month, day] = getToday().split("-");
const prefix = `LA-${year}-${month}-${day}-`;
const nums = (data.invoices || []).map(i => String(i.invoiceNumber || "")).filter(n => n.startsWith(prefix)).map(n => parseInt(n.slice(prefix.length), 10)).filter(n => Number.isFinite(n));
return `${prefix}${nums.length ? Math.max(...nums) + 1 : 500}`;
};

const convertToInvoice = (q) => {
const invoice = {
id: makeId(),
invoiceNumber: toInvoiceNum(),
clientId: q.clientId,
date: getToday(),
dueDate: q.validUntil || "",
items: (q.items || []).map(it => ({ ...it })),
visibleColumns: q.visibleColumns || defaultQuoteColumns,
pricingMode: q.pricingMode || "hours",
subtotal: q.subtotal || 0,
vatRate: q.vatRate || data.settings.defaultVatRate,
vatAmount: q.vatAmount || 0,
total: q.total || 0,
status: "draft",
notes: q.notes || "",
paymentTerms: q.paymentTerms || "Payment due within 30 days.",
};
updateData("invoices", prev => [...prev, invoice]);
updateData("quotes", prev => (prev || []).map(x => x.id === q.id ? { ...x, status: "converted", convertedInvoiceId: invoice.id } : x));
showToast("Quote converted to invoice");
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{t("devis")}</h1>
<button style={btnPri} onClick={() => setModal(newQuoteDraft())}>{ICN.plus} {t("newQuote")}</button>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{t("quote")} #</th><th style={thSt}>{t("client")}</th><th style={thSt}>{t("date")}</th><th style={thSt}>{t("total")}</th><th style={thSt}>{t("status")}</th><th style={thSt}>{t("actions")}</th></tr></thead>
<tbody>
{(data.quotes || []).sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(q => { const client = data.clients.find(c => c.id === q.clientId); return (
<tr key={q.id}><td style={tdSt}><strong>{q.quoteNumber}</strong></td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{fmtDate(q.date)}</td><td style={{ ...tdSt, fontWeight: 600 }}>€{(q.total || 0).toFixed(2)}</td><td style={tdSt}><Badge color={q.status === "accepted" || q.status === "converted" ? CL.green : q.status === "rejected" ? CL.red : CL.blue}>{q.status || t("draft")}</Badge></td><td style={tdSt}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}><button style={{ ...btnSec, ...btnSm }} onClick={() => setPreview({ ...q, invoiceNumber: q.quoteNumber, dueDate: q.validUntil })}>{t("view")}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...q })}>{ICN.edit}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => downloadQuotePdf(q)}>{ICN.download} PDF</button><button style={{ ...btnSec, ...btnSm }} onClick={() => sendQuote(q)}>{ICN.mail}</button>{q.status !== "converted" && <button style={{ ...btnSec, ...btnSm, color: CL.green }} onClick={() => convertToInvoice(q)}>{lang === "en" ? "To Invoice" : "Vers facture"}</button>}<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => deleteQuote(q.id)}>{ICN.trash}</button></div></td></tr>
); })}
{(data.quotes || []).length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No quotes</td></tr>}
</tbody>
</table>
</div>

{preview && <ModalBox title={lang === "en" ? "Quote Preview" : "Aperçu devis"} onClose={() => setPreview(null)} wide><div ref={previewRef}><InvoicePreviewContent invoice={preview} data={data} /></div><div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}><button style={btnSec} onClick={() => setPreview(null)}>{lang === "en" ? "Close" : "Fermer"}</button><button style={btnPri} onClick={() => downloadQuotePdf(preview)}>{ICN.download} PDF</button><button style={{ ...btnSec, color: CL.blue }} onClick={() => sendQuote(preview)}>{ICN.mail} {t("sendEmail")}</button></div></ModalBox>}
{modal && <ModalBox title={modal.id ? t("editQuote") : t("newQuote")} onClose={() => setModal(null)} wide><QuoteForm quote={{ pricingMode: "hours", visibleColumns: { ...defaultQuoteColumns }, ...modal }} data={data} onSave={saveQuote} onCancel={() => setModal(null)} /></ModalBox>}
{quoteForPdf && <div style={{ position: "fixed", left: -10000, top: 0, width: 1200, background: "#fff", zIndex: -1 }}><div ref={hiddenQuoteRef}><InvoicePreviewContent invoice={quoteForPdf} data={data} /></div></div>}
</div>
);
}

function QuoteForm({ quote, data, onSave, onCancel }) {
const defaultColumns = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true };
const [form, setForm] = useState({ pricingMode: "hours", ...quote, visibleColumns: { ...defaultColumns, ...(quote.visibleColumns || {}) } });
const set = (k,v) => setForm(prev => ({ ...prev, [k]: v }));

const recalcRow = (row, pricingMode = form.pricingMode) => {
const qty = pricingMode === "hours" ? Number(row.hours || 0) : Number(row.quantity || 0);
const normalizedQty = Math.max(0, Number.isFinite(qty) ? qty : 0);
return { ...row, quantity: normalizedQty, total: Math.round(normalizedQty * Number(row.unitPrice || 0) * 100) / 100 };
};

const onClientChange = (clientId) => {
const cl = data.clients.find(c => c.id === clientId);
const unit = cl ? (cl.billingType === "fixed" ? (cl.priceFixed || cl.pricePerHour || 0) : (cl.pricePerHour || cl.priceFixed || 0)) : 0;
setForm(prev => ({
...prev,
clientId,
items: (prev.items || []).map(it => recalcRow({ ...it, unitPrice: unit }, prev.pricingMode)),
}));
};

const updateItem = (idx, key, value) => setForm(prev => {
const items = [...(prev.items || [])];
const nextRow = { ...items[idx], [key]: value };
items[idx] = recalcRow(nextRow, prev.pricingMode);
return { ...prev, items };
});

const changePricingMode = (mode) => {
setForm(prev => ({
...prev,
pricingMode: mode,
visibleColumns: {
...(prev.visibleColumns || defaultColumns),
hours: mode === "hours",
quantity: mode === "subscription",
},
items: (prev.items || []).map(it => {
const row = mode === "hours" ? { ...it, hours: it.hours === "" ? "" : Number(it.hours || it.quantity || 0) } : { ...it, quantity: Number(it.quantity || it.hours || 1) || 1 };
return recalcRow(row, mode);
}),
}));
};

const subtotal = (form.items || []).reduce((s, it) => s + (Number(it.total) || 0), 0);
const vatAmount = Math.round(subtotal * (Number(form.vatRate) || 0) / 100 * 100) / 100;

return (
<div>
<div className="form-grid">
<Field label="Quote #"><TextInput value={form.quoteNumber} onChange={ev => set("quoteNumber", ev.target.value)} /></Field>
<Field label="Status"><SelectInput value={form.status || "draft"} onChange={ev => set("status", ev.target.value)}><option value="draft">Draft</option><option value="sent">Sent</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="converted">Converted</option></SelectInput></Field>
<Field label="Client"><SelectInput value={form.clientId} onChange={ev => onClientChange(ev.target.value)}><option value="">Select...</option>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectInput></Field>
<Field label="Date"><TextInput type="date" value={form.date} onChange={ev => set("date", ev.target.value)} /></Field>
<Field label="Valid Until"><TextInput type="date" value={form.validUntil || ""} onChange={ev => set("validUntil", ev.target.value)} /></Field>
<Field label="TVA %"><TextInput type="number" value={form.vatRate} onChange={ev => set("vatRate", parseFloat(ev.target.value) || 0)} /></Field>
</div>

<div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "8px 0 12px" }}>
<Field label="Pricing mode">
<SelectInput value={form.pricingMode || "hours"} onChange={ev => changePricingMode(ev.target.value)}>
<option value="hours">By hours</option>
<option value="subscription">By subscription</option>
</SelectInput>
</Field>
<Field label="Visible columns">
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 8 }}>
{[
["prestationDate", "Date"],
["description", "Description"],
["hours", "Hours"],
["quantity", "Quantity"],
["unitPrice", "Unit Price"],
["total", "Line Total"],
["tva", "TVA"],
].map(([col, label]) => <label key={col} style={{ fontSize: 12, color: CL.muted }}><input type="checkbox" checked={form.visibleColumns?.[col] !== false} onChange={ev => setForm(prev => ({ ...prev, visibleColumns: { ...(prev.visibleColumns || {}), [col]: ev.target.checked } }))} /> {label}</label>)}
</div>
</Field>
</div>

<div style={{ marginTop: 8 }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}><span style={{ fontSize: 13, color: CL.muted }}>Quote Lines</span><button style={{ ...btnSec, ...btnSm }} onClick={() => setForm(prev => ({ ...prev, items: [...(prev.items || []), recalcRow({ prestationDate: prev.date, description: "", hours: "", quantity: prev.pricingMode === "hours" ? 0 : 1, unitPrice: 0, total: 0 }, prev.pricingMode)] }))}>+ Add</button></div>

<div style={{ display: "grid", gridTemplateColumns: `${form.visibleColumns?.prestationDate !== false ? "1.1fr " : ""}${form.visibleColumns?.description !== false ? "2fr " : ""}${form.visibleColumns?.hours !== false ? ".8fr " : ""}${form.visibleColumns?.quantity !== false ? ".8fr " : ""}${form.visibleColumns?.unitPrice !== false ? ".9fr " : ""}${form.visibleColumns?.total !== false ? ".9fr " : ""}auto`, gap: 5, marginBottom: 6, fontSize: 11, color: CL.dim, fontWeight: 600 }}>
{form.visibleColumns?.prestationDate !== false && <div>DATE</div>}
{form.visibleColumns?.description !== false && <div>DESCRIPTION</div>}
{form.visibleColumns?.hours !== false && <div style={{ textAlign: "right" }}>HOURS</div>}
{form.visibleColumns?.quantity !== false && <div style={{ textAlign: "right" }}>QTY</div>}
{form.visibleColumns?.unitPrice !== false && <div style={{ textAlign: "right" }}>UNIT €</div>}
{form.visibleColumns?.total !== false && <div style={{ textAlign: "right" }}>TOTAL €</div>}
<div></div>
</div>

{(form.items || []).map((it, idx) => <div key={idx} style={{ display: "grid", gridTemplateColumns: `${form.visibleColumns?.prestationDate !== false ? "1.1fr " : ""}${form.visibleColumns?.description !== false ? "2fr " : ""}${form.visibleColumns?.hours !== false ? ".8fr " : ""}${form.visibleColumns?.quantity !== false ? ".8fr " : ""}${form.visibleColumns?.unitPrice !== false ? ".9fr " : ""}${form.visibleColumns?.total !== false ? ".9fr " : ""}auto`, gap: 5, marginBottom: 5, alignItems: "center" }}>
{form.visibleColumns?.prestationDate !== false && <TextInput type="date" value={it.prestationDate || ""} onChange={ev => updateItem(idx, "prestationDate", ev.target.value)} />}
{form.visibleColumns?.description !== false && <TextInput value={it.description || ""} onChange={ev => updateItem(idx, "description", ev.target.value)} />}
{form.visibleColumns?.hours !== false && <TextInput type="number" step="0.25" value={it.hours ?? ""} onChange={ev => updateItem(idx, "hours", ev.target.value === "" ? "" : parseFloat(ev.target.value) || 0)} />}
{form.visibleColumns?.quantity !== false && <TextInput type="number" step="0.25" value={it.quantity ?? 0} onChange={ev => updateItem(idx, "quantity", parseFloat(ev.target.value) || 0)} />}
{form.visibleColumns?.unitPrice !== false && <TextInput type="number" step="0.01" value={it.unitPrice} onChange={ev => updateItem(idx, "unitPrice", parseFloat(ev.target.value) || 0)} />}
{form.visibleColumns?.total !== false && <div style={{ textAlign: "right", fontWeight: 600 }}>€{Number(it.total || 0).toFixed(2)}</div>}
<button style={{ background: "none", border: "none", color: CL.red, cursor: "pointer" }} onClick={() => setForm(prev => ({ ...prev, items: (prev.items || []).filter((_, j) => j !== idx) }))}>{ICN.close}</button>
</div>)}
</div>
<div style={{ textAlign: "right", marginTop: 8 }}><div style={{ color: CL.muted }}>Subtotal: €{subtotal.toFixed(2)}</div>{form.visibleColumns?.tva !== false && <div style={{ color: CL.muted }}>TVA ({form.vatRate}%): €{vatAmount.toFixed(2)}</div>}<div style={{ fontSize: 18, fontWeight: 700, color: CL.gold }}>Total: €{(subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount)).toFixed(2)}</div></div>
<Field label="Notes"><TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} /></Field>
<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button style={btnSec} onClick={onCancel}>Cancel</button><button style={btnPri} onClick={() => form.clientId && onSave({ ...form, subtotal, vatAmount: form.visibleColumns?.tva === false ? 0 : vatAmount, total: subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount) })}>Save Quote</button></div>
</div>
);
}

function InvoicesPage({ data, updateData, showToast }) {
const { t, lang } = useI18n();
const [modal, setModal] = useState(null);
const [preview, setPreview] = useState(null);

const nextInvoiceNum = (dateStr = getToday()) => {
const [year, month, day] = (dateStr || getToday()).split("-");
const prefix = `LA-${year || new Date().getFullYear()}-${(month || "01").padStart(2, "0")}-${(day || "01").padStart(2, "0")}-`;
const nums = data.invoices.map(i => String(i.invoiceNumber || "")).filter(n => n.startsWith(prefix)).map(n => parseInt(n.slice(prefix.length), 10)).filter(n => Number.isFinite(n));
return `${prefix}${nums.length ? Math.max(...nums) + 1 : 500}`;
};

const buildPrestationOptions = (clientId, rangeStart, rangeEnd) => {
if (!clientId || !rangeStart || !rangeEnd) return [];
const inRange = (dateStr) => dateStr && dateStr >= rangeStart && dateStr <= rangeEnd;

const latestBySlot = new Map();
(data.schedules || []).forEach((s, idx) => {
if (s.clientId !== clientId || s.status === "cancelled" || !inRange(s.date)) return;
const slotKey = `${s.clientId}::${s.employeeId || "none"}::${s.date}::${s.startTime || ""}::${s.endTime || ""}`;
const score = `${s.updatedAt || ""}|${s.date || ""}|${String(idx).padStart(6, "0")}`;
const prev = latestBySlot.get(slotKey);
if (!prev || score > prev.score) latestBySlot.set(slotKey, { sched: s, score });
});

const scheduleRows = [...latestBySlot.values()].map(({ sched: s }) => {
const employee = data.employees.find(e => e.id === s.employeeId);
const sameDayClocks = data.clockEntries.filter(c => c.clientId === s.clientId && c.employeeId === s.employeeId && c.clockIn?.slice(0, 10) === s.date && c.clockOut);
const clockHours = sameDayClocks.reduce((sum, c) => sum + calcHrs(c.clockIn, c.clockOut), 0);
const schedHours = calcHrs(makeISO(s.date, s.startTime || "00:00"), makeISO(s.date, s.endTime || "00:00"));
const hours = clockHours > 0 ? clockHours : schedHours;
return {
id: `sched-${s.id}`,
source: "schedule",
prestationDate: s.date,
description: `Prestation ${s.date} (${s.startTime || "--:--"}-${s.endTime || "--:--"})`,
hours: Math.round((hours || 0) * 100) / 100,
employeeName: employee?.name || "Unassigned",
};
});

const existingKeys = new Set(scheduleRows.map(r => `${r.prestationDate}-${r.employeeName}`));
const manualClockRows = data.clockEntries
.filter(c => c.clientId === clientId && c.clockOut && inRange(c.clockIn?.slice(0, 10)))
.map(c => {
const employee = data.employees.find(e => e.id === c.employeeId);
return {
id: `clock-${c.id}`,
source: "clock",
prestationDate: c.clockIn.slice(0, 10),
description: `Prestation ${c.clockIn.slice(0, 10)} (clock ${fmtTime(c.clockIn)}-${fmtTime(c.clockOut)})`,
hours: Math.round(calcHrs(c.clockIn, c.clockOut) * 100) / 100,
employeeName: employee?.name || "Unassigned",
};
})
.filter(r => !existingKeys.has(`${r.prestationDate}-${r.employeeName}`));

return [...scheduleRows, ...manualClockRows].sort((a, b) => `${a.prestationDate}`.localeCompare(b.prestationDate));
};

const handleSave = (inv) => {
const subtotal = (inv.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
const vatAmount = Math.round(subtotal * (Number(inv.vatRate) || 0) / 100 * 100) / 100;
const hasValidFormat = /^LA-\d{4}-\d{2}-\d{2}-\d+$/.test(inv.invoiceNumber || "");
const final = { ...inv, invoiceNumber: hasValidFormat ? inv.invoiceNumber : nextInvoiceNum(inv.date || getToday()), subtotal, vatAmount, total: subtotal + vatAmount };
if (final.id) updateData("invoices", prev => prev.map(i => i.id === final.id ? final : i));
else updateData("invoices", prev => [...prev, { ...final, id: makeId() }]);
showToast(final.id ? "Updated" : "Created");
setModal(null);
};

const handleDelete = (id) => { updateData("invoices", prev => prev.filter(i => i.id !== id)); showToast("Deleted", "error"); };

const previewRef = useRef(null);

const ensureLib = (src, check) => new Promise((resolve, reject) => {
if (check()) return resolve();
const existing = document.querySelector(`script[src="${src}"]`);
if (existing) { existing.addEventListener("load", () => resolve()); return; }
const script = document.createElement("script");
script.src = src;
script.async = true;
script.onload = () => resolve();
script.onerror = reject;
document.body.appendChild(script);
});

const capturePreviewCanvas = async () => {
if (!previewRef.current) throw new Error("Preview not ready");
await ensureLib("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", () => Boolean(window.html2canvas));
return window.html2canvas(previewRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
};

const downloadInvoicePng = async (inv) => {
const canvas = await capturePreviewCanvas();
const a = document.createElement("a");
a.href = canvas.toDataURL("image/png");
a.download = `${inv.invoiceNumber || "invoice"}.png`;
a.click();
};

const downloadInvoicePdf = async (inv) => {
const canvas = await capturePreviewCanvas();
await ensureLib("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js", () => Boolean(window.jspdf));
const { jsPDF } = window.jspdf;
const pdf = new jsPDF("p", "mm", "a4");
const pageWidth = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();
const imgData = canvas.toDataURL("image/png");
const imgWidth = pageWidth;
const imgHeight = (canvas.height * imgWidth) / canvas.width;
if (imgHeight <= pageHeight) {
pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
} else {
let y = 0;
while (y < imgHeight) {
pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
y += pageHeight;
if (y < imgHeight) pdf.addPage();
}
}
pdf.save(`${inv.invoiceNumber || "invoice"}.pdf`);
};

const emailInvoice = (inv) => {
const client = data.clients.find(c => c.id === inv.clientId);
if (!client?.email) { showToast("Client email missing", "error"); return; }
const template = inv.emailTemplate || "standard";
const subject = encodeURIComponent(`Invoice ${inv.invoiceNumber}`);
const bodyPlain = template === "friendly"
? `Hello ${client.contactPerson || client.name},

Please find your invoice ${inv.invoiceNumber} for cleaning services on ${fmtDate(inv.date)}.
Amount due: €${(inv.total || 0).toFixed(2)}

Best regards,
${data.settings.companyName}`
: `Dear ${client.contactPerson || client.name},

Invoice: ${inv.invoiceNumber}
Date: ${fmtDate(inv.date)}
Total: €${(inv.total || 0).toFixed(2)}

Regards,
${data.settings.companyName}`;
const fromInfo = inv.zohoEmail ? `

Sender (Zoho configured): ${inv.zohoEmail}` : `

Sender: ${data.settings.companyEmail}`;
window.open(`mailto:${client.email}?subject=${subject}&body=${encodeURIComponent(bodyPlain + fromInfo)}`);
showToast("Email draft opened");
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{t("invoices")}</h1>
<button style={btnPri} onClick={() => setModal({ clientId: "", date: getToday(), dueDate: "", invoiceNumber: nextInvoiceNum(), items: [{ prestationDate: getToday(), description: "", hours: "", quantity: 1, unitPrice: 0, total: 0 }], visibleColumns: { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true }, subtotal: 0, vatRate: data.settings.defaultVatRate, vatAmount: 0, total: 0, status: "draft", notes: "", paymentTerms: "Payment due within 30 days.", emailTemplate: "standard", zohoEmail: "" })}>{ICN.plus} {t("newInvoice")}</button>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>#</th><th style={thSt}>{t("client")}</th><th style={thSt}>{t("date")}</th><th style={thSt}>{t("total")}</th><th style={thSt}>{t("status")}</th><th style={thSt}>{t("actions")}</th></tr></thead>
<tbody>
{data.invoices.sort((a, b) => (b.date || "").localeCompare(a.date || "")).map(inv => { const client = data.clients.find(c => c.id === inv.clientId); return (
<tr key={inv.id}><td style={tdSt}><strong>{inv.invoiceNumber}</strong></td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{fmtDate(inv.date)}</td><td style={{ ...tdSt, fontWeight: 600 }}>€{(inv.total || 0).toFixed(2)}</td><td style={tdSt}><Badge color={inv.status === "paid" ? CL.green : inv.status === "overdue" ? CL.red : inv.status === "sent" ? CL.blue : CL.muted}>{t(inv.status, inv.status)}</Badge></td><td style={tdSt}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}><button style={{ ...btnSec, ...btnSm }} onClick={() => setPreview(inv)}>{t("view")}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...inv })}>{ICN.edit}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => emailInvoice(inv)}>{ICN.mail}</button><button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => handleDelete(inv.id)}>{ICN.trash}</button></div></td></tr>
); })}
{data.invoices.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No invoices</td></tr>}
</tbody>
</table>
</div>

{preview && (
<ModalBox title="" onClose={() => setPreview(null)} wide>
<div ref={previewRef}><InvoicePreviewContent invoice={preview} data={data} /></div>
<div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}>
<button style={btnSec} onClick={() => setPreview(null)}>{lang === "en" ? "Close" : "Fermer"}</button>
<button style={btnSec} onClick={() => downloadInvoicePng(preview)}>{ICN.download} PNG</button>
<button style={btnPri} onClick={() => downloadInvoicePdf(preview)}>{ICN.download} PDF</button>
<button style={{ ...btnSec, color: CL.blue }} onClick={() => emailInvoice(preview)}>{ICN.mail} {t("sendEmail")}</button>
</div>
</ModalBox>
)}

{modal && (
<ModalBox title={modal.id ? t("editInvoice") : t("newInvoice")} onClose={() => setModal(null)} wide>
<InvoiceFormContent invoice={modal} data={data} onSave={handleSave} nextInvoiceNum={nextInvoiceNum} buildPrestationOptions={buildPrestationOptions} onCancel={() => setModal(null)} />
</ModalBox>
)}
</div>
);
}

function InvoiceFormContent({ invoice, data, onSave, nextInvoiceNum, buildPrestationOptions, onCancel }) {
const { t } = useI18n();
const [form, setForm] = useState({ visibleColumns: { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true }, billingStart: "", billingEnd: "", ...invoice });
const [globalDescription, setGlobalDescription] = useState("");
const [scheduleLoadMessage, setScheduleLoadMessage] = useState("");
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const client = data.clients.find(c => c.id === form.clientId);
const defaultUnitPrice = client ? (client.billingType === "fixed" ? (client.priceFixed || client.pricePerHour || 0) : (client.pricePerHour || client.priceFixed || 0)) : 0;
const prestations = form.clientId ? buildPrestationOptions(form.clientId, form.billingStart, form.billingEnd) : [];

const updateItem = (idx, key, value) => setForm(prev => {
const items = [...(prev.items || [])];
items[idx] = { ...items[idx], [key]: value };
const qty = Number(items[idx].quantity || 0);
const unit = Number(items[idx].unitPrice || 0);
items[idx].total = Math.round(qty * unit * 100) / 100;
return { ...prev, items };
});

const addPrestation = (p) => setForm(prev => {
const unitPrice = Number(defaultUnitPrice || 0);
const quantity = p.hours && p.hours > 0 ? Math.round(p.hours * 100) / 100 : 1;
const row = { prestationDate: p.prestationDate, description: "", hours: p.hours ? Math.round(p.hours * 100) / 100 : "", quantity, unitPrice, total: Math.round(quantity * unitPrice * 100) / 100 };
return { ...prev, items: [...(prev.items || []), row] };
});

const loadPrestationsFromRange = () => {
if (!form.clientId || !form.billingStart || !form.billingEnd) {
setScheduleLoadMessage("No prestations found in this billing period.");
return;
}
const unitPrice = Number(defaultUnitPrice || 0);
const nextItems = prestations.map(p => {
const quantity = p.hours && p.hours > 0 ? Math.round(p.hours * 100) / 100 : 1;
return { prestationDate: p.prestationDate, description: "", hours: p.hours ? Math.round(p.hours * 100) / 100 : "", quantity, unitPrice, total: Math.round(quantity * unitPrice * 100) / 100 };
});
setForm(prev => ({ ...prev, items: nextItems }));
setScheduleLoadMessage(nextItems.length ? "Prestations loaded from the latest client schedule." : "No prestations found in this billing period.");
};

const onClientChange = (clientId) => {
const cl = data.clients.find(c => c.id === clientId);
const unit = cl ? (cl.billingType === "fixed" ? (cl.priceFixed || cl.pricePerHour || 0) : (cl.pricePerHour || cl.priceFixed || 0)) : 0;
setForm(prev => {
const nextItems = (prev.items || []).length ? prev.items.map(it => ({ ...it, unitPrice: unit, total: Math.round((Number(it.quantity)||0) * unit * 100) / 100 })) : [{ prestationDate: prev.date, description: "", hours: "", quantity: 1, unitPrice: unit, total: unit }];
return { ...prev, clientId, items: nextItems };
});
};

const applyDescriptionToAll = () => setForm(prev => ({
...prev,
items: (prev.items || []).map(it => ({ ...it, description: globalDescription })),
}));

const subtotal = (form.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
const vatAmount = Math.round(subtotal * (Number(form.vatRate) || 0) / 100 * 100) / 100;

return (
<div>
<div className="form-grid">
<Field label={`${t("invoice")} #`}><div style={{ display: "flex", gap: 5 }}><TextInput value={form.invoiceNumber} onChange={ev => set("invoiceNumber", ev.target.value)} style={{ flex: 1 }} /><button style={{ ...btnSec, ...btnSm }} onClick={() => set("invoiceNumber", nextInvoiceNum(form.date || getToday()))}>{t("auto")}</button></div></Field>
<Field label={t("status")}><SelectInput value={form.status} onChange={ev => set("status", ev.target.value)}><option value="draft">{t("draft")}</option><option value="sent">{t("sent")}</option><option value="paid">{t("paid")}</option><option value="overdue">{t("overdue")}</option></SelectInput></Field>
<Field label={t("client")}><SelectInput value={form.clientId} onChange={ev => onClientChange(ev.target.value)}><option value="">{t("select")}</option>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectInput></Field>
<Field label={t("prestationDate")}><TextInput type="date" value={form.date} onChange={ev => { const v = ev.target.value; set("date", v); if (!form.invoiceNumber || /^LA-\d{4}-\d{2}-\d{2}-\d+$/.test(form.invoiceNumber)) set("invoiceNumber", nextInvoiceNum(v)); }} /></Field>
<Field label="TVA %"><TextInput type="number" value={form.vatRate} onChange={ev => set("vatRate", parseFloat(ev.target.value) || 0)} /></Field>
<Field label="Due"><TextInput type="date" value={form.dueDate || ""} onChange={ev => set("dueDate", ev.target.value)} /></Field>
</div>

<div style={{ ...cardSt, padding: 12, marginBottom: 10 }}>
<div style={{ fontSize: 13, color: CL.muted, marginBottom: 8 }}>Période de facturation</div>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end", marginBottom: 8 }}>
<Field label="Start date"><TextInput type="date" value={form.billingStart || ""} onChange={ev => set("billingStart", ev.target.value)} /></Field>
<Field label="End date"><TextInput type="date" value={form.billingEnd || ""} onChange={ev => set("billingEnd", ev.target.value)} /></Field>
<button style={{ ...btnPri, marginBottom: 14 }} onClick={loadPrestationsFromRange} disabled={!form.clientId}>Generate prestations from schedule</button>
</div>
<div style={{ fontSize: 12, color: CL.muted, marginBottom: 8 }}>Prestations from latest schedule updates for selected client and range</div>
<div style={{ maxHeight: 150, overflow: "auto" }}>
{prestations.map(p => <button key={p.id} style={{ ...btnSec, ...btnSm, width: "100%", marginBottom: 5, justifyContent: "space-between" }} onClick={() => addPrestation(p)}><span>{fmtDate(p.prestationDate)} · {p.employeeName} · {p.description}</span><span>{p.hours ? `${p.hours.toFixed(2)}h` : ""}</span></button>)}
{prestations.length === 0 && <div style={{ fontSize: 12, color: CL.dim }}>No prestations found in this billing period.</div>}
</div>
{scheduleLoadMessage && <div style={{ fontSize: 12, color: CL.blue, marginTop: 6 }}>{scheduleLoadMessage}</div>}
</div>

<div style={{ marginTop: 12 }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexWrap: "wrap", gap: 8 }}>
<span style={{ fontSize: 13, color: CL.muted }}>Fields (columns) and line items</span>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
{["prestationDate","description","hours","quantity","unitPrice","total","tva"].map(col => <label key={col} style={{ fontSize: 12, color: CL.muted }}><input type="checkbox" checked={form.visibleColumns?.[col] !== false} onChange={ev => setForm(prev => ({ ...prev, visibleColumns: { ...(prev.visibleColumns || {}), [col]: ev.target.checked } }))} /> {col}</label>)}
<button style={{ ...btnSec, ...btnSm }} onClick={() => setForm(prev => ({ ...prev, items: [...(prev.items || []), { prestationDate: prev.date, description: "", hours: "", quantity: 1, unitPrice: defaultUnitPrice || 0, total: defaultUnitPrice || 0 }] }))}>+ Add row</button>
</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
<TextInput placeholder="Désignation globale (optionnel)" value={globalDescription} onChange={ev => setGlobalDescription(ev.target.value)} />
<button style={{ ...btnSec, ...btnSm }} onClick={applyDescriptionToAll}>Appliquer à toutes les lignes</button>
</div>
{(form.items || []).map((item, idx) => (
<div key={idx} style={{ display: "grid", gridTemplateColumns: "1.1fr 2fr .8fr .8fr .9fr .9fr auto", gap: 5, marginBottom: 5, alignItems: "center" }}>
<TextInput type="date" placeholder="Prestation date" value={item.prestationDate || ""} onChange={ev => updateItem(idx, "prestationDate", ev.target.value)} />
<TextInput placeholder="Description" value={item.description || ""} onChange={ev => updateItem(idx, "description", ev.target.value)} />
<TextInput type="number" step="0.25" placeholder="Hours" value={item.hours ?? ""} onChange={ev => { const h = ev.target.value; updateItem(idx, "hours", h === "" ? "" : parseFloat(h) || 0); updateItem(idx, "quantity", h === "" ? 1 : parseFloat(h) || 0); }} />
<TextInput type="number" step="0.25" placeholder="Qty" value={item.quantity ?? 0} onChange={ev => updateItem(idx, "quantity", parseFloat(ev.target.value) || 0)} />
<TextInput type="number" step="0.01" placeholder="Unit" value={item.unitPrice} onChange={ev => updateItem(idx, "unitPrice", parseFloat(ev.target.value) || 0)} />
<div style={{ textAlign: "right", fontWeight: 600 }}>€{Number(item.total || 0).toFixed(2)}</div>
<button style={{ background: "none", border: "none", color: CL.red, cursor: "pointer" }} onClick={() => setForm(prev => ({ ...prev, items: (prev.items || []).filter((_, j) => j !== idx) }))}>{ICN.close}</button>
</div>
))}
</div>

<div style={{ textAlign: "right", marginTop: 8 }}><div style={{ color: CL.muted }}>Subtotal: €{subtotal.toFixed(2)}</div>{form.visibleColumns?.tva !== false && <div style={{ color: CL.muted }}>TVA ({form.vatRate}%): €{vatAmount.toFixed(2)}</div>}<div style={{ fontSize: 18, fontWeight: 700, color: CL.gold, marginTop: 4 }}>Total: €{(subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount)).toFixed(2)}</div></div>

<div className="form-grid" style={{ marginTop: 12 }}>
<Field label="Sender email (optional)"><TextInput value={form.zohoEmail || ""} onChange={ev => set("zohoEmail", ev.target.value)} placeholder="name@yourcompany.com" /></Field>
<Field label="Email template"><SelectInput value={form.emailTemplate || "standard"} onChange={ev => set("emailTemplate", ev.target.value)}><option value="standard">Standard</option><option value="friendly">Friendly reminder</option></SelectInput></Field>
</div>

<Field label="Terms"><TextInput value={form.paymentTerms || ""} onChange={ev => set("paymentTerms", ev.target.value)} /></Field>
<div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
<button style={btnSec} onClick={onCancel}>{t("cancel")}</button>
<button style={btnPri} onClick={() => form.clientId && onSave({ ...form, subtotal, vatAmount: form.visibleColumns?.tva === false ? 0 : vatAmount, total: subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount) })}>{t("save")}</button>
</div>
</div>
);
}

function InvoicePreviewContent({ invoice, data }) {
const client = data.clients.find(c => c.id === invoice.clientId);
const settings = data.settings;
const cols = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true, ...(invoice.visibleColumns || {}) };
return (
<div style={{ background: "#fff", color: "#1a1a1a", padding: 28, borderRadius: 8 }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
<div><h1 style={{ fontSize: 24, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>{settings.companyName}</h1><div style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.6 }}>{settings.companyAddress}<br />{settings.companyEmail}<br />{settings.companyPhone}<br />TVA: {settings.vatNumber}</div></div>
<div style={{ textAlign: "right" }}><h2 style={{ fontSize: 20, color: "#333", margin: 0 }}>FACTURE</h2><div style={{ fontSize: 12, color: "#666", marginTop: 5 }}><strong>{invoice.invoiceNumber}</strong><br />Date: {fmtDate(invoice.date)}{invoice.dueDate && <><br />Échéance: {fmtDate(invoice.dueDate)}</>}</div></div>
</div>

<div style={{ marginBottom: 18, padding: 12, background: "#f8f8f8", borderRadius: 8 }}>
<div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", marginBottom: 2 }}>Client</div>
<div style={{ fontWeight: 600 }}>{client?.name}</div>
{client?.address && <div style={{ fontSize: 12, color: "#666" }}>{client.address}{client?.apartmentFloor ? `, ${client.apartmentFloor}` : ""}</div>}
{(client?.postalCode || client?.city || client?.country) && <div style={{ fontSize: 12, color: "#666" }}>{client?.postalCode ? `${client.postalCode} ` : ""}{client?.city || ""}{client?.country ? `, ${client.country}` : ""}</div>}
{client?.email && <div style={{ fontSize: 12, color: "#666" }}>{client.email}</div>}
</div>

<div style={{ marginBottom: 8, fontWeight: 600, color: "#35526b" }}>Description des prestations</div>
<div style={{ overflowX: "auto" }}>
<table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
<thead><tr style={{ borderBottom: "2px solid #C9A84C" }}><th style={{ textAlign: "left", padding: "5px 0", fontSize: 10, color: "#999" }}>Ref</th>{cols.prestationDate && <th style={{ textAlign: "left", padding: "5px 0", fontSize: 10, color: "#999" }}>Date</th>}{cols.description && <th style={{ textAlign: "left", padding: "5px 0", fontSize: 10, color: "#999" }}>Désignation</th>}{cols.quantity && <th style={{ textAlign: "right", padding: "5px 0", fontSize: 10, color: "#999" }}>Quantité</th>}{cols.hours && <th style={{ textAlign: "right", padding: "5px 0", fontSize: 10, color: "#999" }}>Heures</th>}{cols.unitPrice && <th style={{ textAlign: "right", padding: "5px 0", fontSize: 10, color: "#999" }}>PU</th>}{cols.total && <th style={{ textAlign: "right", padding: "5px 0", fontSize: 10, color: "#999" }}>Montant HT</th>}</tr></thead>
<tbody>{(invoice.items || []).map((item, idx) => <tr key={idx} style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "8px 0" }}>{idx + 1}</td>{cols.prestationDate && <td style={{ padding: "8px 0" }}>{fmtDate(item.prestationDate)}</td>}{cols.description && <td style={{ padding: "8px 0" }}>{item.description}</td>}{cols.quantity && <td style={{ padding: "8px 0", textAlign: "right" }}>{Number(item.quantity || 0).toFixed(2)}</td>}{cols.hours && <td style={{ padding: "8px 0", textAlign: "right" }}>{item.hours === "" || item.hours == null ? "" : Number(item.hours).toFixed(2)}</td>}{cols.unitPrice && <td style={{ padding: "8px 0", textAlign: "right" }}>€{Number(item.unitPrice || 0).toFixed(2)}</td>}{cols.total && <td style={{ padding: "8px 0", textAlign: "right" }}>€{Number(item.total || 0).toFixed(2)}</td>}</tr>)}</tbody>
</table>
</div>

<div style={{ textAlign: "right", marginBottom: 18 }}>
<div style={{ fontSize: 12, color: "#666" }}>TOTAL HT: €{(invoice.subtotal || 0).toFixed(2)}</div>
{cols.tva !== false && <div style={{ fontSize: 12, color: "#666" }}>TVA ({invoice.vatRate}%): €{(invoice.vatAmount || 0).toFixed(2)}</div>}
{cols.tva !== false && <div style={{ fontSize: 12, color: "#666" }}>TOTAL TVA: €{(invoice.vatAmount || 0).toFixed(2)}</div>}
<div style={{ fontSize: 24, fontWeight: 700, color: "#C9A84C", marginTop: 5 }}>TOTAL TTC A PAYER: €{(invoice.total || 0).toFixed(2)}</div>
</div>

<div style={{ padding: 12, background: "#f8f8f8", borderRadius: 8, fontSize: 11, color: "#666", marginBottom: 20 }}>
<div><strong>Conditions de paiement :</strong> {invoice.paymentTerms || "Paiement comptant."}</div>
<div><strong>IBAN:</strong> {settings.bankIban}</div>
</div>

<div style={{ marginTop: 40 }}>
<div style={{ fontSize: 12, color: "#333", marginBottom: 24 }}>Bon pour Accord</div>
<div style={{ borderTop: "1px solid #333", width: 260, paddingTop: 4, fontSize: 12, color: "#333" }}>Signature Client</div>
</div>
</div>
);
}

// ==============================================
// PAYSLIPS PAGE
// ==============================================
function PayslipsPage({ data, updateData, showToast, auth }) {
const [preview, setPreview] = useState(null);
const [month, setMonth] = useState(getToday().slice(0, 7));

if (auth?.role !== "owner") return <div style={cardSt}>Payroll access is restricted.</div>;

const generatePayslips = () => {
const payslips = data.employees.filter(emp => emp.status === "active").map(emp => {
const entries = data.clockEntries.filter(c => c.employeeId === emp.id && c.clockOut && c.clockIn?.startsWith(month));
const totalH = entries.reduce((sum, ce) => sum + calcHrs(ce.clockIn, ce.clockOut), 0);
const gross = Math.round(totalH * emp.hourlyRate * 100) / 100;
return {
id: makeId(), employeeId: emp.id, month, totalHours: Math.round(totalH * 100) / 100,
hourlyRate: emp.hourlyRate, grossPay: gross,
status: "draft", createdAt: new Date().toISOString(),
payslipNumber: `PS-${month.replace("-", "")}-${emp.name.slice(0, 3).toUpperCase()}`,
};
});
updateData("payslips", prev => [...prev, ...payslips]);
showToast(`${payslips.length} generated`);
};

const markPaid = (id) => {
updateData("payslips", prev => prev.map(ps => ps.id === id ? { ...ps, status: "paid" } : ps));
showToast("Marked paid");
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Payslips</h1>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<TextInput type="month" value={month} onChange={ev => setMonth(ev.target.value)} style={{ width: 160 }} />
<button style={btnPri} onClick={generatePayslips}>{ICN.plus} Generate</button>
</div>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>#</th><th style={thSt}>Employee</th><th style={thSt}>Month</th><th style={thSt}>Hours</th><th style={thSt}>Gross</th><th style={thSt}>Status</th><th style={thSt}>Actions</th></tr></thead>
<tbody>
{data.payslips.sort((a, b) => b.month.localeCompare(a.month)).map(ps => {
const employee = data.employees.find(e => e.id === ps.employeeId);
return (
<tr key={ps.id}>
<td style={tdSt}><strong>{ps.payslipNumber}</strong></td>
<td style={tdSt}>{employee?.name || "-"}</td>
<td style={tdSt}>{ps.month}</td>
<td style={tdSt}>{ps.totalHours}h</td>
<td style={{ ...tdSt, fontWeight: 600 }}>€{ps.grossPay?.toFixed(2)}</td>
<td style={tdSt}><Badge color={ps.status === "paid" ? CL.green : CL.muted}>{ps.status}</Badge></td>
<td style={tdSt}>
<div style={{ display: "flex", gap: 4 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setPreview(ps)}>View</button>
{ps.status !== "paid" && <button style={{ ...btnSec, ...btnSm, color: CL.green }} onClick={() => markPaid(ps.id)}>{ICN.check}</button>}
</div>
</td>
</tr>
);
})}
{data.payslips.length === 0 && <tr><td colSpan={7} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No payslips</td></tr>}
</tbody>
</table>
</div>

  {preview && (
    <ModalBox title="" onClose={() => setPreview(null)}>
      {(() => {
        const employee = data.employees.find(e => e.id === preview.employeeId);
        const settings = data.settings;
        return (
          <div style={{ background: "#fff", color: "#1a1a1a", padding: 28, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div><h1 style={{ fontSize: 22, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>{settings.companyName}</h1><div style={{ fontSize: 10, color: "#666" }}>{settings.companyAddress}</div></div>
              <div style={{ textAlign: "right" }}><h2 style={{ fontSize: 18, color: "#333", margin: 0 }}>PAYSLIP</h2><div style={{ fontSize: 11, color: "#666" }}>{preview.payslipNumber}<br />{preview.month}</div></div>
            </div>
            <div style={{ padding: 12, background: "#f8f8f8", borderRadius: 8, marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>Employee</div>
              <div style={{ fontWeight: 600 }}>{employee?.name}</div>
              <div style={{ fontSize: 11, color: "#666" }}>{employee?.role} · SSN: {employee?.socialSecNumber || "N/A"}</div>
              {employee?.bankIban && <div style={{ fontSize: 11, color: "#666" }}>IBAN: {employee.bankIban}</div>}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "7px 0", color: "#666" }}>Hours</td><td style={{ padding: "7px 0", textAlign: "right", fontWeight: 600 }}>{preview.totalHours}h</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "7px 0", color: "#666" }}>Rate</td><td style={{ padding: "7px 0", textAlign: "right" }}>€{preview.hourlyRate?.toFixed(2)}</td></tr>
                <tr style={{ borderBottom: "2px solid #C9A84C" }}><td style={{ padding: "7px 0", fontWeight: 600 }}>Gross</td><td style={{ padding: "7px 0", textAlign: "right", fontWeight: 600 }}>€{preview.grossPay?.toFixed(2)}</td></tr>
                <tr><td style={{ padding: "10px 0", fontSize: 18, fontWeight: 700, color: "#C9A84C" }}>Gross Amount</td><td style={{ padding: "10px 0", textAlign: "right", fontSize: 18, fontWeight: 700, color: "#C9A84C" }}>€{preview.grossPay?.toFixed(2)}</td></tr>
              </tbody>
            </table>
            <div style={{ fontSize: 9, color: "#999", textAlign: "center" }}>Gross-only payroll view.</div>
          </div>
        );
      })()}
      <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
        <button style={btnSec} onClick={() => setPreview(null)}>Close</button>
        <button style={btnPri} onClick={() => window.print()}>{ICN.download} Print</button>
      </div>
    </ModalBox>
  )}
</div>

);
}


// ==============================================
// LEAVE MANAGEMENT (CONGÉS) - OWNER
// ==============================================
function VisitationPage({ data, updateData, showToast, setSection, setDevisSeed }) {
const { t } = useI18n();
const [form, setForm] = useState({ clientId: "", visitDate: getToday(), visitTime: "10:00", address: "", notes: "", status: "planned" });
const visits = (data.prospectVisits || []).slice().sort((a, b) => `${b.visitDate} ${b.visitTime}`.localeCompare(`${a.visitDate} ${a.visitTime}`));
const prospects = data.clients.filter(c => c.status === "prospect" || c.status === "active");
const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

const saveVisit = () => {
if (!form.clientId || !form.visitDate) { showToast("Select client and date", "error"); return; }
const client = data.clients.find(c => c.id === form.clientId);
const payload = { ...form, id: makeId(), createdAt: new Date().toISOString(), address: form.address || client?.address || "" };
updateData("prospectVisits", prev => [payload, ...(prev || [])]);
setForm({ clientId: "", visitDate: getToday(), visitTime: "10:00", address: "", notes: "", status: "planned" });
showToast("Visit added");
};

const markStatus = (id, status) => updateData("prospectVisits", prev => (prev || []).map(v => v.id === id ? { ...v, status, updatedAt: new Date().toISOString() } : v));
const removeVisit = (id) => updateData("prospectVisits", prev => (prev || []).filter(v => v.id !== id));

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 16 }}>{t("visitationSchedule")}</h1>
<div style={{ ...cardSt, marginBottom: 14 }}>
  <div className="form-grid">
    <Field label="Prospect / Client"><SelectInput value={form.clientId} onChange={ev => { const id = ev.target.value; const c = data.clients.find(x => x.id === id); setForm(v => ({ ...v, clientId: id, address: c?.address || "" })); }}><option value="">Select...</option>{prospects.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectInput></Field>
    <Field label="Address"><TextInput value={form.address} onChange={ev => set("address", ev.target.value)} placeholder="Visit address" /></Field>
    <Field label="Visit date"><TextInput type="date" value={form.visitDate} onChange={ev => set("visitDate", ev.target.value)} /></Field>
    <Field label="Visit time"><TextInput type="time" value={form.visitTime} onChange={ev => set("visitTime", ev.target.value)} /></Field>
  </div>
  <Field label="Notes"><TextArea value={form.notes} onChange={ev => set("notes", ev.target.value)} placeholder="Scope, apartment access, expectations..." /></Field>
  <button style={btnPri} onClick={saveVisit}>{ICN.plus} Add Visit</button>
</div>

<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Date</th><th style={thSt}>Client</th><th style={thSt}>Address</th><th style={thSt}>Notes</th><th style={thSt}>Status</th><th style={thSt}>Actions</th></tr></thead>
<tbody>
{visits.map(v => { const client = data.clients.find(c => c.id === v.clientId); return <tr key={v.id}><td style={tdSt}>{fmtDate(v.visitDate)} {v.visitTime || ""}</td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}><a href={mapsUrl(v.address || client?.address || "") } target="_blank" rel="noreferrer" style={{ color: CL.blue, textDecoration: "underline" }}>{v.address || client?.address || "-"}</a></td><td style={tdSt}>{v.notes || "-"}</td><td style={tdSt}><Badge color={v.status === "done" ? CL.green : v.status === "cancelled" ? CL.red : CL.orange}>{v.status}</Badge></td><td style={tdSt}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button style={{ ...btnSec, ...btnSm }} onClick={() => markStatus(v.id, "done")}>Done</button><button style={{ ...btnSec, ...btnSm }} onClick={() => { setDevisSeed?.({ clientId: v.clientId, description: `Quote after visit on ${v.visitDate}` }); setSection?.("devis"); }}>Create Devis</button><button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => removeVisit(v.id)}>Delete</button></div></td></tr>; })}
{visits.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No visits scheduled yet</td></tr>}
</tbody>
</table>
</div>
</div>
);
}

function HistoryPage({ data, updateData }) {
  const { t } = useI18n();
const [clientFilter, setClientFilter] = useState("");
const uploads = (data.photoUploads || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const jobs = (data.schedules || []).slice().sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
const filteredUploads = uploads.filter(u => !clientFilter || u.clientId === clientFilter);
const filteredJobs = jobs.filter(j => !clientFilter || j.clientId === clientFilter);

const markAllSeen = () => updateData("photoUploads", prev => (prev || []).map(u => ({ ...u, seenByOwner: true })));

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
  <h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{t("historyImages")}</h1>
  <div style={{ display: "flex", gap: 8 }}>
    <SelectInput value={clientFilter} onChange={ev => setClientFilter(ev.target.value)} style={{ width: 220 }}><option value="">All clients</option>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectInput>
    <button style={btnSec} onClick={markAllSeen}>Mark images seen</button>
  </div>
</div>
<div className="grid-2">
  <div style={cardSt}>
    <h3 style={{ marginBottom: 10, color: CL.gold }}>Job history</h3>
    {filteredJobs.slice(0, 120).map(j => { const c = data.clients.find(x => x.id === j.clientId); const e = data.employees.find(x => x.id === j.employeeId); return <div key={j.id} style={{ borderBottom: `1px solid ${CL.bd}`, padding: "8px 0" }}><div style={{ fontWeight: 600 }}>{fmtDate(j.date)} · {j.startTime}-{j.endTime}</div><div style={{ fontSize: 12, color: CL.muted }}>{c?.name || "-"} · {e?.name || "-"}</div><Badge color={scheduleStatusColor(j.status)}>{j.status}</Badge></div>; })}
    {filteredJobs.length === 0 && <div style={{ color: CL.muted }}>No jobs</div>}
  </div>
  <div style={cardSt}>
    <h3 style={{ marginBottom: 10, color: CL.gold }}>Image history</h3>
    {filteredUploads.slice(0, 120).map(u => { const c = data.clients.find(x => x.id === u.clientId); const e = data.employees.find(x => x.id === u.employeeId); return <div key={u.id} style={{ borderBottom: `1px solid ${CL.bd}`, padding: "8px 0" }}><div style={{ fontWeight: 600 }}>{c?.name || "Unknown client"} · {u.type || "issue"}</div><div style={{ fontSize: 12, color: CL.muted }}>{fmtBoth(u.createdAt)} · {e?.name || "-"}</div>{u.imageData && <img src={u.imageData} alt={u.fileName} style={{ width: "100%", maxWidth: 260, marginTop: 6, borderRadius: 8, border: `1px solid ${CL.bd}` }} />}</div>; })}
    {filteredUploads.length === 0 && <div style={{ color: CL.muted }}>No images</div>}
  </div>
</div>
</div>
);
}

function LeaveManagementPage({ data, updateData, showToast }) {
const [employeeFilter, setEmployeeFilter] = useState("");
const [yearFilter, setYearFilter] = useState(getToday().slice(0, 4));
const [reviewNote, setReviewNote] = useState({});

const requests = (data.timeOffRequests || [])
.filter(r => (!employeeFilter || r.employeeId === employeeFilter) && (!yearFilter || (r.startDate || "").startsWith(yearFilter)))
.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const pendingCount = requests.filter(r => r.status === "pending").length;
const approvedCount = requests.filter(r => r.status === "approved").length;
const rejectedCount = requests.filter(r => r.status === "rejected").length;

const reviewRequest = (id, status) => {
updateData("timeOffRequests", prev => prev.map(r => r.id === id ? {
...r,
status,
reviewedAt: new Date().toISOString(),
reviewedBy: "owner",
reviewNote: (reviewNote[id] || "").trim(),
} : r));
setReviewNote(prev => ({ ...prev, [id]: "" }));
showToast(status === "approved" ? "Leave approved" : "Leave rejected", status === "approved" ? "success" : "error");
};

const summaryRows = data.employees.filter(emp => emp.status === "active").map(emp => ({ emp, ...getLeaveSummary(data, emp.id, yearFilter) }));

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Congés</h1>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<SelectInput value={employeeFilter} onChange={ev => setEmployeeFilter(ev.target.value)} style={{ width: 180 }}>
<option value="">All Cleaners</option>
{data.employees.filter(e => e.status === "active").map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
</SelectInput>
<TextInput type="number" value={yearFilter} onChange={ev => setYearFilter(ev.target.value)} style={{ width: 110 }} />
</div>
</div>

<div className="stat-row" style={{ marginBottom: 16 }}>
<StatCard label="Pending" value={pendingCount} icon={ICN.clock} color={CL.orange} />
<StatCard label="Approved" value={approvedCount} icon={ICN.check} color={CL.green} />
<StatCard label="Rejected" value={rejectedCount} icon={ICN.close} color={CL.red} />
</div>

<div style={{ ...cardSt, marginBottom: 16 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Holiday Counter</h3>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Cleaner</th><th style={thSt}>Allowance</th><th style={thSt}>Approved</th><th style={thSt}>Pending</th><th style={thSt}>Remaining</th></tr></thead>
<tbody>
{summaryRows.map(row => <tr key={row.emp.id}><td style={tdSt}>{row.emp.name}</td><td style={tdSt}><TextInput type="number" min={0} value={row.emp.leaveAllowance ?? 26} onChange={ev => updateData("employees", prev => prev.map(e => e.id === row.emp.id ? { ...e, leaveAllowance: Math.max(0, parseInt(ev.target.value || "0", 10) || 0) } : e))} style={{ width: 90 }} /></td><td style={tdSt}>{row.approvedDays}d</td><td style={tdSt}>{row.pendingDays}d</td><td style={{ ...tdSt, fontWeight: 700, color: row.remaining > 5 ? CL.green : CL.orange }}>{row.remaining}d</td></tr>)}
{summaryRows.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No active cleaners</td></tr>}
</tbody>
</table>
</div>
</div>

<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.gold }}>Time-off Requests</h3>
{requests.map(req => {
const employee = data.employees.find(e => e.id === req.employeeId);
const days = req.requestedDays || leaveDaysInclusive(req.startDate, req.endDate);
return (
<div key={req.id} style={{ padding: "12px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
<div>
<div style={{ fontWeight: 600 }}>{employee?.name || "Unknown"} · {fmtDate(req.startDate)} - {fmtDate(req.endDate)} ({days}d)</div>
<div style={{ fontSize: 12, color: CL.muted }}>{req.leaveType === "maladie" ? "Maladie" : "Congé"}{req.reason ? ` · ${req.reason}` : ""}</div>
<div style={{ fontSize: 11, color: CL.dim }}>Requested {fmtBoth(req.createdAt)}</div>
{req.reviewedAt && <div style={{ fontSize: 11, color: CL.dim }}>Reviewed {fmtBoth(req.reviewedAt)} {req.reviewNote ? `· ${req.reviewNote}` : ""}</div>}
</div>
<Badge color={req.status === "approved" ? CL.green : req.status === "rejected" ? CL.red : CL.orange}>{req.status}</Badge>
</div>
{req.status === "pending" && (
<div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
<TextInput value={reviewNote[req.id] || ""} onChange={ev => setReviewNote(v => ({ ...v, [req.id]: ev.target.value }))} placeholder="Optional comment" style={{ minWidth: 220, flex: 1 }} />
<button style={{ ...btnPri, ...btnSm, background: CL.green }} onClick={() => reviewRequest(req.id, "approved")}>{ICN.check} Approve</button>
<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => reviewRequest(req.id, "rejected")}>{ICN.close} Reject</button>
</div>
)}
</div>
);
})}
{requests.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>No leave requests found.</p>}
</div>
</div>
);
}

// ==============================================
// REMINDERS PAGE
// ==============================================
function RemindersPage({ data, showToast }) {
const [channel, setChannel] = useState("email");
const [workflowType, setWorkflowType] = useState("all");
const [selectedOnly, setSelectedOnly] = useState(false);
const [selectedClientIds, setSelectedClientIds] = useState([]);
const [campaignFrequency, setCampaignFrequency] = useState("weekly");
const [campaignChannel, setCampaignChannel] = useState("email");
const [campaignSubject, setCampaignSubject] = useState("Lux Angels update");
const [campaignBody, setCampaignBody] = useState("Hello, this is your scheduled client communication from Lux Angels.");

const clients = data.clients.filter(c => c.status === "active");

const toggleClient = (id) => setSelectedClientIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

const openEmail = ({ to, subject, body }) => {
if (!to) { showToast("Client email missing", "error"); return; }
window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
};
const openWhatsApp = ({ phone, message }) => {
if (!phone) { showToast("Client phone missing", "error"); return; }
const cleaned = String(phone).replace(/[^\d+]/g, "").replace(/^00/, "+");
window.open(`https://wa.me/${cleaned.replace("+", "")}?text=${encodeURIComponent(message)}`, "_blank");
};
const openZohoDraft = ({ to, subject, body }) => {
if (!to) { showToast("Client email missing", "error"); return; }
const zohoEmail = data.settings.companyEmail;
window.open(`mailto:${to}?subject=${encodeURIComponent(`[ZOHO] ${subject}`)}&body=${encodeURIComponent(`${body}\n\nFrom (Zoho configured): ${zohoEmail}`)}`);
};

const dispatch = (mode, payload, client) => {
if (mode === "whatsapp") return openWhatsApp({ phone: client.phoneMobile || client.phone, message: payload.body });
if (mode === "zoho") return openZohoDraft(payload);
return openEmail(payload);
};

const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const upcomingShiftReminders = data.schedules
.filter(s => s.date === tomorrow && s.status !== "cancelled")
.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
if (!client) return null;
return {
id: `shift-${sched.id}`,
kind: "work",
client,
title: `Upcoming shift reminder · ${client.name}`,
details: `${fmtDate(sched.date)} ${sched.startTime}-${sched.endTime} · ${employee?.name || "TBA"}`,
buildPayload: () => ({
to: client.email,
subject: `Appointment reminder - ${fmtDate(sched.date)}`,
body: `Dear ${client.contactPerson || client.name},\n\nReminder for your cleaning appointment:\nDate: ${fmtDate(sched.date)}\nTime: ${sched.startTime}-${sched.endTime}\nCleaner: ${employee?.name || "TBA"}\n\nRegards,\n${data.settings.companyName}`,
}),
};
}).filter(Boolean);

const invoiceSentReminders = (data.invoices || [])
.filter(inv => inv.status === "sent")
.map(inv => {
const client = data.clients.find(c => c.id === inv.clientId);
if (!client) return null;
return {
id: `invoice-${inv.id}`,
kind: "followup",
client,
title: `Invoice sent notification · ${client.name}`,
details: `${inv.invoiceNumber} · ${fmtDate(inv.date)} · €${(inv.total || 0).toFixed(2)}`,
buildPayload: () => ({
to: client.email,
subject: `Invoice ${inv.invoiceNumber} sent`,
body: `Dear ${client.contactPerson || client.name},\n\nYour invoice ${inv.invoiceNumber} has been sent.\nAmount: €${(inv.total || 0).toFixed(2)}\nDate: ${fmtDate(inv.date)}\n\nRegards,\n${data.settings.companyName}`,
}),
};
}).filter(Boolean);

const paymentFollowUpReminders = (data.invoices || [])
.filter(inv => ["sent", "overdue"].includes(inv.status) && inv.dueDate && inv.dueDate < getToday())
.map(inv => {
const client = data.clients.find(c => c.id === inv.clientId);
if (!client) return null;
return {
id: `pay-${inv.id}`,
kind: "followup",
client,
title: `Payment follow-up · ${client.name}`,
details: `${inv.invoiceNumber} due ${fmtDate(inv.dueDate)} · €${(inv.total || 0).toFixed(2)}`,
buildPayload: () => ({
to: client.email,
subject: `Payment follow-up - ${inv.invoiceNumber}`,
body: `Dear ${client.contactPerson || client.name},\n\nThis is a friendly follow-up for invoice ${inv.invoiceNumber}.\nDue date: ${fmtDate(inv.dueDate)}\nOutstanding amount: €${(inv.total || 0).toFixed(2)}\n\nPlease let us know if payment has already been made.\n\nRegards,\n${data.settings.companyName}`,
}),
};
}).filter(Boolean);

const workflows = [...upcomingShiftReminders, ...invoiceSentReminders, ...paymentFollowUpReminders];
const filtered = workflows.filter(w => (workflowType === "all" || w.kind === workflowType) && (!selectedOnly || selectedClientIds.includes(w.client.id)));

const sendReminder = (rem) => {
const payload = rem.buildPayload();
dispatch(channel, payload, rem.client);
showToast(`Reminder opened via ${channel}`);
};

const sendCampaign = () => {
const recipients = clients.filter(c => selectedClientIds.includes(c.id));
if (!recipients.length) { showToast("Select at least one client for campaign", "error"); return; }
recipients.forEach((client, idx) => {
const payload = {
to: client.email,
subject: `[${campaignFrequency.toUpperCase()}] ${campaignSubject}`,
body: `Dear ${client.contactPerson || client.name},\n\n${campaignBody}\n\nRegards,\n${data.settings.companyName}`,
};
setTimeout(() => dispatch(campaignChannel, payload, client), idx * 200);
});
showToast(`Campaign opened for ${recipients.length} client(s)`);
};

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 5 }}>Reminders</h1>
<p style={{ color: CL.muted, marginBottom: 16 }}>Operational reminders + business follow-up + marketing communication workflows.</p>

<div style={{ ...cardSt, marginBottom: 12 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: CL.gold }}>Recipient Selection</h3>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setSelectedClientIds(clients.map(c => c.id))}>Select all</button>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setSelectedClientIds([])}>Clear</button>
<label style={{ fontSize: 12, color: CL.muted, display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={selectedOnly} onChange={ev => setSelectedOnly(ev.target.checked)} /> Restrict reminders to selected clients only</label>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 6 }}>
{clients.map(c => <label key={c.id} style={{ fontSize: 12, color: CL.text, display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={selectedClientIds.includes(c.id)} onChange={() => toggleClient(c.id)} /> {c.name}</label>)}
</div>
</div>

<div style={{ ...cardSt, marginBottom: 12, padding: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
<SelectInput value={workflowType} onChange={ev => setWorkflowType(ev.target.value)} style={{ width: 220 }}>
<option value="all">All workflows</option>
<option value="work">Work reminders / upcoming shifts</option>
<option value="followup">Business follow-up</option>
</SelectInput>
<SelectInput value={channel} onChange={ev => setChannel(ev.target.value)} style={{ width: 170 }}>
<option value="email">Email</option>
<option value="whatsapp">WhatsApp</option>
<option value="zoho">Zoho</option>
</SelectInput>
<div style={{ fontSize: 12, color: CL.muted }}>Ready reminders: {filtered.length}</div>
</div>

{filtered.length === 0 ? <div style={{ ...cardSt, textAlign: "center", padding: 26, color: CL.muted }}>No reminders ready for this filter.</div> : (
<div>{filtered.map(rem => <div key={rem.id} style={{ ...cardSt, marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}><div><div style={{ fontWeight: 600, fontSize: 15 }}>{rem.title}</div><div style={{ fontSize: 12, color: CL.muted, marginTop: 3 }}>{rem.details}</div><div style={{ fontSize: 12, color: CL.dim, marginTop: 2 }}>{rem.client.email || rem.client.phone || rem.client.phoneMobile || "No contact"}</div></div><button style={btnPri} onClick={() => sendReminder(rem)}>{ICN.mail} Send via {channel}</button></div></div>)}</div>
)}

<div style={{ ...cardSt, marginTop: 12 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Email Marketing Campaigns</h3>
<div className="form-grid">
<Field label="Frequency"><SelectInput value={campaignFrequency} onChange={ev => setCampaignFrequency(ev.target.value)}><option value="weekly">Weekly</option><option value="monthly">Monthly</option></SelectInput></Field>
<Field label="Channel"><SelectInput value={campaignChannel} onChange={ev => setCampaignChannel(ev.target.value)}><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="zoho">Zoho</option></SelectInput></Field>
</div>
<Field label="Campaign subject"><TextInput value={campaignSubject} onChange={ev => setCampaignSubject(ev.target.value)} /></Field>
<Field label="Campaign content"><TextArea value={campaignBody} onChange={ev => setCampaignBody(ev.target.value)} /></Field>
<div style={{ display: "flex", justifyContent: "flex-end" }}><button style={btnPri} onClick={sendCampaign}>{ICN.mail} Send Campaign to Selected Clients</button></div>
</div>
</div>
);
}

// ==============================================
// REPORTS PAGE
// ==============================================
function ReportsPage({ data }) {
const [month, setMonth] = useState(getToday().slice(0, 7));
const monthEntries = data.clockEntries.filter(c => c.clockOut && c.clockIn?.startsWith(month));

const empSummary = data.employees.filter(emp => emp.status === "active").map(emp => {
const entries = monthEntries.filter(c => c.employeeId === emp.id);
const totalH = entries.reduce((sum, ce) => sum + calcHrs(ce.clockIn, ce.clockOut), 0);
return { ...emp, totalH: Math.round(totalH * 100) / 100, cost: Math.round(totalH * emp.hourlyRate * 100) / 100 };
});

const clientSummary = data.clients.filter(c => c.status === "active").map(client => {
const entries = monthEntries.filter(c => c.clientId === client.id);
const totalH = entries.reduce((sum, ce) => sum + calcHrs(ce.clockIn, ce.clockOut), 0);
const revenue = client.billingType === "fixed" ? client.priceFixed : totalH * client.pricePerHour;
const invoiced = data.invoices.filter(inv => inv.clientId === client.id && inv.date?.startsWith(month)).reduce((sum, inv) => sum + (inv.total || 0), 0);
return { ...client, totalH: Math.round(totalH * 100) / 100, revenue: Math.round(revenue * 100) / 100, invoiced: Math.round(invoiced * 100) / 100 };
});

const totalRevenue = clientSummary.reduce((sum, c) => sum + c.revenue, 0);
const totalCost = empSummary.reduce((sum, e) => sum + e.cost, 0);
const totalHours = empSummary.reduce((sum, e) => sum + e.totalH, 0);
const profit = totalRevenue - totalCost;

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Reports</h1>
<TextInput type="month" value={month} onChange={ev => setMonth(ev.target.value)} style={{ width: 160 }} />
</div>
<div className="stat-row" style={{ marginBottom: 22 }}>
<StatCard label="Hours" value={`${totalHours.toFixed(1)}h`} icon={ICN.clock} color={CL.blue} />
<StatCard label="Revenue" value={`€${totalRevenue.toFixed(2)}`} icon={ICN.chart} color={CL.green} />
<StatCard label="Labour" value={`€${totalCost.toFixed(2)}`} icon={ICN.team} color={CL.red} />
<StatCard label="Profit" value={`€${profit.toFixed(2)}`} icon={ICN.check} color={profit >= 0 ? CL.green : CL.red} />
</div>
<div className="grid-2">
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Employee Hours</h3>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Employee</th><th style={thSt}>Hours</th><th style={thSt}>Rate</th><th style={thSt}>Cost</th></tr></thead>
<tbody>
{empSummary.map(emp => <tr key={emp.id}><td style={tdSt}>{emp.name}</td><td style={tdSt}>{emp.totalH}h</td><td style={tdSt}>€{emp.hourlyRate}/hr</td><td style={{ ...tdSt, fontWeight: 600 }}>€{emp.cost.toFixed(2)}</td></tr>)}
{empSummary.length === 0 && <tr><td colSpan={4} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>-</td></tr>}
</tbody>
</table>
</div>
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>Client Revenue</h3>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Client</th><th style={thSt}>Hours</th><th style={thSt}>Revenue</th><th style={thSt}>Invoiced</th></tr></thead>
<tbody>
{clientSummary.map(cl => <tr key={cl.id}><td style={tdSt}>{cl.name}</td><td style={tdSt}>{cl.totalH}h</td><td style={tdSt}>€{cl.revenue.toFixed(2)}</td><td style={{ ...tdSt, color: cl.invoiced >= cl.revenue ? CL.green : CL.red }}>€{cl.invoiced.toFixed(2)}</td></tr>)}
{clientSummary.length === 0 && <tr><td colSpan={4} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>-</td></tr>}
</tbody>
</table>
</div>
</div>
</div>
</div>
);
}

// ==============================================
// EXCEL DB PAGE
// ==============================================
function ExcelDBPage({ data, setData, showToast }) {
const fileRef = useRef(null);
const [exporting, setExporting] = useState(false);

const doExport = async () => {
setExporting(true);
try { await exportExcel(data); showToast("Exported!"); }
catch (err) { console.error(err); showToast("Failed", "error"); }
setExporting(false);
};

const doImport = (ev) => {
const file = ev.target.files[0];
if (!file) return;
importExcel(file, setData, showToast);
ev.target.value = "";
};

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 5 }}>Excel Database</h1>
<p style={{ color: CL.muted, marginBottom: 20 }}>Full backup/restore with structured 8-sheet Excel file.</p>
<div className="grid-2" style={{ marginBottom: 20 }}>
<div style={{ ...cardSt, textAlign: "center", padding: 28 }}>
<div style={{ width: 56, height: 56, borderRadius: 16, background: CL.green + "15", display: "flex", alignItems: "center", justifyContent: "center", color: CL.green, margin: "0 auto 12px" }}>{ICN.download}</div>
<h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CL.green, marginBottom: 6 }}>Export Database</h3>
<p style={{ color: CL.muted, fontSize: 12, marginBottom: 14 }}>8 sheets: Employees, Clients, Schedule, Time Clock, Invoices, Payslips, Settings, Summary</p>
<button style={{ ...btnPri, background: CL.green, justifyContent: "center", width: "100%" }} onClick={doExport}>{exporting ? "Exporting..." : "Export .xlsx"}</button>
</div>
<div style={{ ...cardSt, textAlign: "center", padding: 28 }}>
<div style={{ width: 56, height: 56, borderRadius: 16, background: CL.blue + "15", display: "flex", alignItems: "center", justifyContent: "center", color: CL.blue, margin: "0 auto 12px" }}>{ICN.excel}</div>
<h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CL.blue, marginBottom: 6 }}>Import Database</h3>
<p style={{ color: CL.muted, fontSize: 12, marginBottom: 14 }}>Upload a previously exported Excel file to restore all data.</p>
<input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={doImport} style={{ display: "none" }} />
<button style={{ ...btnPri, background: CL.blue, justifyContent: "center", width: "100%" }} onClick={() => fileRef.current?.click()}>Import .xlsx</button>
</div>
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.gold }}>Data Summary</h3>
<div className="grid-3">
{[
{ label: "Employees", count: data.employees.length, color: CL.blue },
{ label: "Clients", count: data.clients.length, color: CL.green },
{ label: "Schedules", count: data.schedules.length, color: CL.gold },
{ label: "Time Entries", count: data.clockEntries.length, color: CL.orange },
{ label: "Invoices", count: data.invoices.length, color: CL.blue },
{ label: "Payslips", count: data.payslips.length, color: CL.green },
].map(d => (
<div key={d.label} style={{ padding: 12, background: CL.s2, borderRadius: 8, textAlign: "center" }}>
<div style={{ fontSize: 20, fontWeight: 700, color: d.color }}>{d.count}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{d.label}</div>
</div>
))}
</div>
</div>
</div>
);
}

// ==============================================
// SETTINGS PAGE
// ==============================================
function SettingsPage({ data, updateData, setData, showToast }) {
const [form, setForm] = useState(data.settings);
const [ownerUsername, setOwnerUsername] = useState(data.ownerUsername || "info@luxangelscleaning.lu");
const [pin, setPin] = useState(data.ownerPin);
const [managerUsername, setManagerUsername] = useState(data.managerUsername || "manager");
const [managerPin, setManagerPin] = useState(data.managerPin || "4321");
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const handleSave = () => {
updateData("settings", form);
setData(prev => ({ ...prev, ownerUsername: ownerUsername.trim().toLowerCase(), ownerPin: pin, managerUsername: managerUsername.trim().toLowerCase(), managerPin }));
showToast("Saved");
};

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 16 }}>Settings</h1>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.gold }}>Company Info</h3>
<div className="form-grid">
<Field label="Company Name"><TextInput value={form.companyName} onChange={ev => set("companyName", ev.target.value)} /></Field>
<Field label="Email"><TextInput value={form.companyEmail} onChange={ev => set("companyEmail", ev.target.value)} /></Field>
<Field label="Phone"><TextInput value={form.companyPhone} onChange={ev => set("companyPhone", ev.target.value)} /></Field>
<Field label="VAT Number"><TextInput value={form.vatNumber} onChange={ev => set("vatNumber", ev.target.value)} /></Field>
<Field label="Default VAT %"><TextInput type="number" value={form.defaultVatRate} onChange={ev => set("defaultVatRate", parseFloat(ev.target.value) || 0)} /></Field>
<Field label="Bank IBAN"><TextInput value={form.bankIban} onChange={ev => set("bankIban", ev.target.value)} /></Field>
</div>
<Field label="Address"><TextInput value={form.companyAddress} onChange={ev => set("companyAddress", ev.target.value)} /></Field>
</div>
<div style={{ ...cardSt, marginTop: 14 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.gold }}>Access Credentials</h3>
<div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
<Field label="Owner Username"><TextInput value={ownerUsername} onChange={ev => setOwnerUsername(ev.target.value)} style={{ width: 260 }} /></Field>
<Field label="Owner Password"><TextInput maxLength={24} value={pin} onChange={ev => setPin(ev.target.value)} style={{ width: 180 }} /></Field>
<Field label="Manager Username"><TextInput value={managerUsername} onChange={ev => setManagerUsername(ev.target.value)} style={{ width: 220 }} /></Field>
<Field label="Manager Password"><TextInput maxLength={24} value={managerPin} onChange={ev => setManagerPin(ev.target.value)} style={{ width: 180 }} /></Field>
</div>
</div>
<div style={{ marginTop: 14 }}><button style={btnPri} onClick={handleSave}>{ICN.check} Save All</button></div>
<div style={{ ...cardSt, marginTop: 14 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.red }}>Danger Zone</h3>
<button style={btnDng} onClick={() => { if (confirm("DELETE ALL DATA?")) { saveStore(DEFAULTS); window.location.reload(); } }}>Reset Everything</button>
</div>
</div>
);
}

// ==============================================
// DOWNLOAD APP PAGE
// ==============================================
function DownloadAppPage({ data, onInstallApp }) {
  const { t } = useI18n();
  return (
    <div>
      <h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 8 }}>{t("downloadApp")}</h1>
      <p style={{ color: CL.muted, marginBottom: 12 }}>{t("installIntro")}</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button style={{ ...btnPri, background: CL.gold }} onClick={() => onInstallApp("ios")}>{ICN.download} {t("installOnIphone")}</button>
        <button style={{ ...btnPri, background: CL.green }} onClick={() => onInstallApp("android")}>{ICN.download} {t("installOnAndroid")}</button>
      </div>
    </div>
  );
}
