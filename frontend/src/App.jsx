

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, Children, isValidElement } from "react";

/* ===========================================================
LUX ANGELS CLEANING - Management System v3 (Bug-free) 
=========================================================== */


let excelJsPromise;
const loadExcelJS = async () => {
  if (!excelJsPromise) {
    excelJsPromise = import("exceljs").then((mod) => mod.default || mod);
  }
  return excelJsPromise;
};

// -- Persistence --
// Database-only persistence for business data: no local cache/offline shadow copies.
const loadLang = () => { try { const a = JSON.parse(sessionStorage.getItem("lux_auth") || "null"); return a?.lang || "fr"; } catch { return "fr"; } };
const saveLang = (l) => {
  try {
    const raw = sessionStorage.getItem("lux_auth");
    if (!raw) return;
    const a = JSON.parse(raw);
    a.lang = l;
    sessionStorage.setItem("lux_auth", JSON.stringify(a));
    void persistPreferenceToApi({ role: a.role, userId: a.employeeId, lang: l });
  } catch {}
};
const loadTheme = () => { try { const a = JSON.parse(sessionStorage.getItem("lux_auth") || "null"); return a?.theme || "dark"; } catch { return "dark"; } };
const saveTheme = (t) => {
  try {
    const raw = sessionStorage.getItem("lux_auth");
    if (!raw) return;
    const a = JSON.parse(raw);
    a.theme = t;
    sessionStorage.setItem("lux_auth", JSON.stringify(a));
    void persistPreferenceToApi({ role: a.role, userId: a.employeeId, theme: t });
  } catch {}
};

async function persistPreferenceToApi(payload) {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}/api/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
    } catch {}
  }
  return false;
}

const I18N = {
fr: {
language: "Langue", french: "Français", english: "Anglais", login: "Connexion", welcome: "Bienvenue", selectRole: "Rôle", pin: "Code PIN", loginBtn: "Se connecter",
dashboard: "Tableau de bord", employees: "Employés", clients: "Clients", schedule: "Planning", timeclock: "Pointage", inventory: "Stock", devis: "Devis", invoices: "Factures", payslips: "Fiches de paie", expenses: "Dépenses", conges: "Congés", communications: "Communications", reports: "Rapports", database: "Base Excel", settings: "Paramètres",
newQuote: "Nouveau devis", editQuote: "Modifier devis", newInvoice: "Nouvelle facture", editInvoice: "Modifier facture", save: "Enregistrer", cancel: "Annuler", actions: "Actions", status: "Statut", client: "Client", date: "Date", amount: "Montant", view: "Voir", sendEmail: "Envoyer email", draft: "Brouillon", sent: "Envoyée", paid: "Payée", overdue: "En retard", auto: "Auto", select: "Sélectionner...", prestationDate: "Date de prestation", invoiceDate: "Date de facturation",
invoice: "Facture", quote: "Devis", dueDate: "Date échéance", notes: "Notes", total: "Total", subtotal: "Sous-total", vat: "TVA", item: "Ligne", qty: "Qté", unitPrice: "Prix unitaire", description: "Description",
managementSystem: "Système de gestion", ownerAccess: "Accès propriétaire", ownerAccessDesc: "Tableau de gestion complet", cleanerAccess: "Accès agent", cleanerAccessDesc: "Planning, heures, validation et congés",
back: "Retour", ownerLogin: "Connexion propriétaire", cleanerLogin: "Connexion agent", yourName: "Votre nom", choose: "Choisir...", logout: "Déconnexion", visitation: "Visites", history: "Historique", downloadApp: "Télécharger l'application", ownerPortal: "Portail propriétaire", managerPortal: "Portail manager", visitationSchedule: "Planning des visites", historyImages: "Historique & images", installIntro: "Installez cette app directement depuis votre navigateur (sans App Store / Play Store).", installOnIphone: "Installer sur iPhone", installOnAndroid: "Installer sur Android", installAndroidFallback: "Si rien ne se passe: menu ⋮ du navigateur > Installer l'application / Ajouter à l'écran d'accueil.", installIosHint: "Sur iPhone: bouton Partager (□↑) > Sur l'écran d'accueil.",
mySchedule: "Mon planning", clockInOut: "Pointage", photoUploads: "Photos", products: "Produits", upcomingJobs: "Interventions à venir", noUpcomingJobs: "Aucune intervention à venir", calendarView: "Calendrier", listView: "Liste", noJobsThisDay: "Aucune intervention ce jour", clickDayToSee: "Cliquez sur un jour pour voir les interventions"
},
en: {
language: "Language", french: "French", english: "English", login: "Login", welcome: "Welcome", selectRole: "Role", pin: "PIN", loginBtn: "Sign in",
dashboard: "Dashboard", employees: "Employees", clients: "Clients", schedule: "Schedule", timeclock: "Time Clock", inventory: "Inventory", devis: "Quotes", invoices: "Invoices", payslips: "Payslips", expenses: "Expenses", conges: "Leave", communications: "Communications", reports: "Reports", database: "Excel DB", settings: "Settings",
newQuote: "New quote", editQuote: "Edit quote", newInvoice: "New invoice", editInvoice: "Edit invoice", save: "Save", cancel: "Cancel", actions: "Actions", status: "Status", client: "Client", date: "Date", amount: "Amount", view: "View", sendEmail: "Send email", draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", auto: "Auto", select: "Select...", prestationDate: "Service date", invoiceDate: "Invoice date",
invoice: "Invoice", quote: "Quote", dueDate: "Due date", notes: "Notes", total: "Total", subtotal: "Subtotal", vat: "VAT", item: "Item", qty: "Qty", unitPrice: "Unit price", description: "Description",
managementSystem: "Management System", ownerAccess: "Owner Access", ownerAccessDesc: "Full management dashboard", cleanerAccess: "Cleaner Access", cleanerAccessDesc: "Schedule, hours, validation & time-off",
back: "Back", ownerLogin: "Owner Login", cleanerLogin: "Cleaner Login", yourName: "Your Name", choose: "Choose...", logout: "Logout", visitation: "Visitation", history: "History", downloadApp: "Download App", ownerPortal: "Owner Portal", managerPortal: "Manager Portal", visitationSchedule: "Visitation Schedule", historyImages: "History & Images", installIntro: "Install this app directly from your browser (no App Store / Play Store needed).", installOnIphone: "Install on iPhone", installOnAndroid: "Install on Android", installAndroidFallback: "If nothing happens: browser menu ⋮ > Install app / Add to Home screen.", installIosHint: "On iPhone: Share button (□↑) > Add to Home Screen.",
mySchedule: "My Schedule", clockInOut: "Clock In/Out", photoUploads: "Photo Uploads", products: "Products", upcomingJobs: "Upcoming Jobs", noUpcomingJobs: "No upcoming jobs", calendarView: "Calendar", listView: "List", noJobsThisDay: "No jobs this day", clickDayToSee: "Click a day to see jobs"
}
};
const LanguageContext = createContext({ lang: "fr", setLang: () => {}, t: (k) => k });
const useI18n = () => useContext(LanguageContext);
const tr = (lang, key, fallback = key) => I18N[lang]?.[key] || I18N.fr?.[key] || fallback;
const localeForLang = (lang) => lang === "en" ? "en-GB" : "fr-FR";
let CURRENT_LANG = loadLang();


const UI_FR = {
"Username or email": "Nom d'utilisateur ou email",
"Password": "Mot de passe",
"Clock-in note (optional)": "Note de pointage (optionnelle)",
"Photo type": "Type de photo",
"Upload cleaning photo": "Télécharger une photo de nettoyage",
"Optional note": "Note optionnelle",
"Product": "Produit",
"Select...": "Sélectionner...",
"Quantity": "Quantité",
"Delivery Date & Time": "Date et heure de livraison",
"Note": "Note",
"Start Date": "Date de début",
"End Date": "Date de fin",
"Type": "Type",
"Reason": "Raison",
"Name": "Nom",
"Role": "Rôle",
"Rate": "Taux",
"Contact": "Contact",
"Status": "Statut",
"Actions": "Actions",
"Delete": "Supprimer",
"Full Name *": "Nom complet *",
"Email": "Email",
"Phone": "Téléphone",
"Mobile": "Mobile",
"Login Username": "Identifiant de connexion",
"Login Password": "Mot de passe de connexion",
"Address": "Adresse",
"Postal Code": "Code postal",
"City": "Ville",
"Country": "Pays",
"Date of Birth": "Date de naissance",
"Nationality": "Nationalité",
"Languages": "Langues",
"Social Security No.": "N° de sécurité sociale",
"Transport": "Transport",
"Hourly Rate (€)": "Taux horaire (€)",
"Vacation allowance (days/year)": "Allocation de congé (jours/an)",
"Contract Type": "Type de contrat",
"Monthly": "Mensuel",
"Weekly": "Hebdomadaire",
"Campaign subject": "Sujet de campagne",
"Campaign content": "Contenu de campagne",
"Settings": "Paramètres",
"Company Info": "Informations entreprise",
"Company Name": "Nom de l'entreprise",
"VAT Number": "N° TVA",
"Default VAT %": "TVA par défaut %",
"Bank IBAN": "IBAN bancaire",
"Access Credentials": "Identifiants d'accès",
"Owner Username": "Identifiant propriétaire",
"Owner Password": "Mot de passe propriétaire",
"Manager Username": "Identifiant manager",
"Manager Password": "Mot de passe manager",
"Save All": "Tout enregistrer",
"Company": "Entreprise",
"Finance": "Finance",
"Planning": "Planning",
"Notifications": "Notifications",
"Danger Zone": "Zone dangereuse",
"Reset Everything": "Tout réinitialiser",
"DELETE ALL DATA?": "SUPPRIMER TOUTES LES DONNÉES ?",
"Visit address": "Adresse de visite",
"Visit date": "Date de visite",
"Visit time": "Heure de visite",
"Prospect / Client": "Prospect / Client",
"Done": "Terminé",
"Create Devis": "Créer devis",
"Pending": "En attente",
"Approved": "Approuvé",
"Rejected": "Rejeté",
"Cleaner": "Agent",
"Allowance": "Allocation",
"Remaining": "Restant",
"Employee": "Employé",
"Hours": "Heures",
"Cost": "Coût",
"Revenue": "Revenu",
"Invoiced": "Facturé",
"Payroll access is restricted.": "L'accès à la paie est restreint.",
"Email Marketing Campaigns": "Campagnes marketing par email",
"Frequency": "Fréquence",
"Quote #": "N° devis",
"Channel": "Canal",
"8 sheets: Employees, Clients, Schedule, Time Clock, Invoices, Payslips, Settings, Summary": "8 feuilles : Employés, Clients, Planning, Pointage, Factures, Fiches de paie, Paramètres, Résumé",
"Use Share > Add to Home Screen": "Utilisez Partager > Sur l'écran d'accueil",
"Use browser menu > Install app": "Utilisez le menu du navigateur > Installer l'application",
"Install prompt opened": "Invite d'installation ouverte",
"Reports": "Rapports",
"Labour": "Main-d'œuvre",
"Profit": "Profit",
"Employee Hours": "Heures employés",
"Client Revenue": "Revenus clients",
"Excel Database": "Base de données Excel",
"Full backup/restore with structured 8-sheet Excel file.": "Sauvegarde/restauration complète avec fichier Excel structuré de 8 feuilles.",
"Export Database": "Exporter la base",
"Import Database": "Importer la base",
"Exporting...": "Export en cours...",
"Export .xlsx": "Exporter .xlsx",
"Upload a previously exported Excel file to restore all data.": "Téléversez un fichier Excel exporté précédemment pour restaurer toutes les données.",
"Import .xlsx": "Importer .xlsx",
"No reminders ready for this filter.": "Aucun rappel prêt pour ce filtre.",
"No contact": "Aucun contact",
"Send via": "Envoyer via",
"Send Campaign to Selected Clients": "Envoyer la campagne aux clients sélectionnés",
"Email template": "Modèle d'email",
"Standard": "Standard",
"Friendly reminder": "Rappel amical",
"Ready reminders:": "Rappels prêts :",
"Saved": "Enregistré",
"Exported!": "Exporté !",
"Failed": "Échec",
"Today": "Aujourd'hui",
"Tomorrow": "Demain",
"Next Week": "Semaine prochaine",
"Next 7 Days": "7 prochains jours",
"No jobs in this period.": "Aucune intervention sur cette période.",
"Assigned to:": "Assigné à :",
"Unassigned": "Non assigné",
"Details:": "Détails :",
"Client email missing": "Email client manquant",
"Client phone missing": "Téléphone client manquant",
"Unable to send SMS": "Impossible d'envoyer le SMS",
"Unable to send email": "Impossible d'envoyer l'email",
"SMS": "SMS",
"Reminder opened via": "Rappel ouvert via",
"Select at least one client for campaign": "Sélectionnez au moins un client pour la campagne",
"Campaign opened for": "Campagne ouverte pour",
"client(s)": "client(s)",
"Operational reminders + business follow-up + marketing communication workflows.": "Rappels opérationnels + suivi commercial + workflows de communication marketing.",
"Default channel": "Canal par défaut",
"Save communication settings": "Enregistrer les réglages de communication",
"Communication settings saved": "Réglages de communication enregistrés",
"Failed to save communication settings": "Impossible d'enregistrer les réglages de communication",
"Recipient Selection": "Sélection des destinataires",
"Select all": "Tout sélectionner",
"Clear": "Effacer",
"Restrict reminders to selected clients only": "Limiter les rappels aux clients sélectionnés uniquement",
"All workflows": "Tous les workflows",
"Work reminders / upcoming shifts": "Rappels d'interventions / prestations à venir",
"Business follow-up": "Suivi commercial",
"Workflow": "Workflow",
"Active Clients": "Clients actifs :",
"Selected": "Sélectionnés :",
"Client search": "Recherche client",
"Search by name, contact, email or phone": "Rechercher par nom, contact, email ou téléphone",
"Hide clients": "Masquer les clients",
"Show clients": "Afficher les clients",
"No clients match this search.": "Aucun client ne correspond à cette recherche.",
"Action": "Action",
"Send": "Envoyer",
"more": "en plus",
"Upcoming shift reminder": "Rappel intervention à venir",
"Invoice sent notification": "Notification facture envoyée",
"due": "échéance",
"WhatsApp": "WhatsApp",
"Zoho": "Zoho",
// Dashboard
"Dashboard": "Tableau de bord",
"Today's Jobs": "Interventions aujourd'hui",
"Clocked In": "Pointés",
"Active Staff": "Personnel actif",
"Month Rev": "Rev. du mois",
"Unpaid": "Impayé",
"Today's Schedule": "Planning du jour",
"No jobs scheduled today": "Aucune intervention aujourd'hui",
"Tomorrow": "Demain",
"Nothing scheduled": "Rien de planifié",
"Active Clocks": "Pointages actifs",
"No one clocked in right now": "Personne n'est pointé en ce moment",
"Next 7 Days": "7 prochains jours",
"Nothing upcoming": "Rien à venir",
"Recent Invoices": "Factures récentes",
"No invoices yet": "Aucune facture pour l'instant",
"Show all": "Voir tout",
"Show less": "Réduire",
"Showing": "Affichage",
"of": "sur",
"record": "élément",
"records": "éléments",
"leave request": "demande de congé",
"leave requests": "demandes de congé",
"pending": "en attente",
"product request": "demande de produit",
"product requests": "demandes de produit",
"new photo": "nouvelle photo",
"new photos": "nouvelles photos",
"uploaded": "téléversée(s)",
"overdue invoice": "facture en retard",
"overdue invoices": "factures en retard",
// Employees
"Employees": "Employés",
"Add": "Ajouter",
"Search by name, role, email, phone...": "Rechercher par nom, rôle, email, téléphone...",
"All Statuses": "Tous les statuts",
"All Locations": "Toutes les zones",
"Active": "Actif",
"Inactive": "Inactif",
"No employees": "Aucun employé",
"Delete?": "Supprimer ?",
"Remove this employee?": "Supprimer cet employé ?",
"Cancel": "Annuler",
"Delete": "Supprimer",
"Edit Employee": "Modifier l'employé",
"Add Employee": "Ajouter un employé",
"Basic Info": "Infos de base",
"Personal": "Personnel",
"Work & Pay": "Travail & Paie",
"Operations": "Opérations",
"Management": "Gestion",
"Human Resources": "Ressources humaines",
"Support": "Support",
"Analytics": "Analyse",
"System": "Système",
"Emergency": "Urgence",
"Location Group": "Groupe / Zone",
"Stage": "Statut embauche",
"Assigned Clients": "Clients assignés",
"No city": "Pas de ville",
"Standby": "En attente",
"Hired": "Embauché",
"(email/full name)": "(email/nom complet)",
"Cleaner Location Group": "Groupe / Zone de travail",
"Hiring Stage": "Statut d'embauche",
"Standby / Potential": "En attente / Potentiel",
"Tip: use Standby for potential cleaners you want to keep in your contact pipeline.": "Conseil : utilisez En attente pour les agents potentiels que vous souhaitez garder dans votre pipeline de contacts.",
"Weekly hours (contract)": "Heures par semaine (contrat)",
"e.g. 38": "ex. 38",
"Cleaner": "Agent",
"Senior Cleaner": "Agent senior",
"Team Lead": "Chef d'équipe",
"Supervisor": "Superviseur",
"optional custom username": "identifiant personnalisé (optionnel)",
"Street & house number": "Rue et numéro",
"e.g. Portuguese": "ex. Portugais",
"FR, DE, PT, EN...": "FR, DE, PT, EN...",
"Car": "Voiture",
"Public Transport": "Transports en commun",
"Bicycle": "Vélo",
"Walking": "À pied",
"CDI": "CDI",
"CDD": "CDD",
"Mini-job": "Mini-job",
"Freelance": "Freelance",
"Student": "Étudiant",
"If applicable": "Si applicable",
"Save Employee": "Enregistrer l'employé",
"Work Permit #": "N° de permis de travail",
"Emergency Contact Name": "Nom du contact d'urgence",
"Emergency Phone": "Tél. d'urgence",
"Any additional info...": "Toute information complémentaire...",
// Clients
"Clients": "Clients",
"Search by name, contact, email, phone, city...": "Rechercher par nom, contact, email, téléphone, ville...",
"All Types": "Tous les types",
"Residential": "Résidentiel",
"Commercial": "Commercial",
"No clients": "Aucun client",
"Remove this client?": "Supprimer ce client ?",
"Edit Client": "Modifier le client",
"Add Client": "Ajouter un client",
"Client Name *": "Nom du client *",
"Name or company": "Nom ou société",
"Contact Person": "Personne de contact",
"Preferred Language": "Langue préférée",
"Client Type": "Type de client",
"Office": "Bureau",
"Industrial": "Industriel",
"Airbnb": "Airbnb",
"Prospect": "Prospect",
"Tax / VAT ID": "N° TVA / Fiscal",
"Address & Access": "Adresse & Accès",
"Service & Billing": "Service & Facturation",
"Property Details": "Détails du bien",
"Street Address": "Adresse",
"Street name & house number": "Nom de rue et numéro",
"Apt / Floor / Unit": "Appt / Étage / Unité",
"e.g. 3rd floor, Apt 12B": "ex. 3e étage, Appt 12B",
"Access Information": "Informations d'accès",
"Building Code / Digicode": "Code d'accès / Digicode",
"e.g. #1234": "ex. #1234",
"Key Location": "Emplacement des clés",
"e.g. Under mat, with concierge": "ex. Sous le paillasson, chez le concierge",
"Parking Info": "Informations stationnement",
"e.g. Free street parking": "ex. Parking gratuit dans la rue",
"Access / Entry Instructions": "Instructions d'accès",
"Special instructions to enter...": "Instructions spéciales pour entrer...",
"Cleaning Frequency": "Fréquence de nettoyage",
"One-time": "Ponctuel",
"Weekly": "Hebdomadaire",
"Bi-weekly": "Bihebdomadaire",
"Monthly": "Mensuel",
"2x per week": "2x par semaine",
"3x per week": "3x par semaine",
"Daily": "Quotidien",
"Custom": "Personnalisé",
"Preferred Day": "Jour préféré",
"No preference": "Pas de préférence",
"Monday": "Lundi",
"Tuesday": "Mardi",
"Wednesday": "Mercredi",
"Thursday": "Jeudi",
"Friday": "Vendredi",
"Saturday": "Samedi",
"Preferred Time": "Heure préférée",
"e.g. 09:00-12:00": "ex. 09:00-12:00",
"Billing Type": "Type de facturation",
"Hourly": "À l'heure",
"Fixed Price": "Prix fixe",
"Price per Hour (€)": "Prix par heure (€)",
"Fixed Price (€)": "Prix fixe (€)",
"Contract Start": "Début du contrat",
"Contract End": "Fin du contrat",
"Property Size (m²)": "Surface (m²)",
"e.g. 120": "ex. 120",
"Pets": "Animaux",
"e.g. 1 cat (friendly)": "ex. 1 chat (docile)",
"Notes & Special Requests": "Notes & demandes spéciales",
"Allergies, products to use/avoid, rooms to skip...": "Allergies, produits à utiliser/éviter, pièces à ne pas nettoyer...",
"Save Client": "Enregistrer le client",
// Schedule
"Schedule": "Planning",
"New Job": "Nouveau travail",
"Calendar": "Calendrier",
"List": "Liste",
"All Employees": "Tous les employés",
"This Month": "Ce mois",
"In Progress": "En cours",
"Completed": "Terminé",
"No jobs this day": "Aucun travail ce jour",
"Click a date to see details": "Cliquez sur une date pour voir les détails",
"Monthly job list by date (readable after clocking/status changes).": "Liste mensuelle des travaux par date.",
"No jobs in this month": "Aucun travail ce mois",
"Edit Job": "Modifier le travail",
"Client *": "Client *",
"Employee *": "Employé *",
"Scheduled": "Planifié",
"Cancelled": "Annulé",
"Recurrence": "Récurrence",
"Daily (weekends included)": "Quotidien (week-ends inclus)",
"Daily (weekdays only)": "Quotidien (jours ouvrables uniquement)",
"Weekly (12 weeks)": "Hebdomadaire (12 semaines)",
"Bi-weekly (12x)": "Bihebdomadaire (12x)",
"Monthly (12 months)": "Mensuel (12 mois)",
"Every day": "Chaque jour",
"Interval in range": "Intervalle dans la plage",
"Date From": "Date de début",
"Date To (optional)": "Date de fin (optionnelle)",
"Select employees *": "Sélectionner les employés *",
"No active employees": "Aucun employé actif",
"This job is marked as completed and can no longer be edited.": "Ce travail est marqué comme terminé et ne peut plus être modifié.",
"Client Info": "Infos client",
"Delete Job": "Supprimer le travail",
"Save Job": "Enregistrer le travail",
"Mon": "Lun",
"Tue": "Mar",
"Wed": "Mer",
"Thu": "Jeu",
"Fri": "Ven",
"Sat": "Sam",
"Sun": "Dim",
// Time Clock
"Time Clock": "Pointage",
"Quick Clock In": "Pointage rapide",
"Clock In": "Pointer entrée",
"Active:": "Actif :",
"Out": "Sortie",
"Owner: Add missed clock-in": "Propriétaire : Ajouter un pointage manqué",
"In Date": "Date entrée",
"In Time": "Heure entrée",
"Out Date (optional)": "Date sortie (optionnelle)",
"Out Time (optional)": "Heure sortie (optionnelle)",
"Reason / note (optional)": "Raison / note (optionnelle)",
"Forgot to clock in, adjusted by owner...": "Oublié de pointer, ajusté par le propriétaire...",
"Add Manual Entry": "Ajouter une entrée manuelle",
"Late": "En retard",
"On time": "À l'heure",
"No entries": "Aucune entrée",
"Edit Entry": "Modifier l'entrée",
"Active": "Actif",
"Clock Out Now": "Pointer la sortie",
"Select client to clock in:": "Sélectionner un client pour pointer :",
"Late reason, traffic, access issues...": "Raison du retard, trafic, problème d'accès...",
"Late reason, traffic, access issue...": "Raison du retard, trafic, problème d'accès...",
"TODAY'S CLIENTS:": "CLIENTS DU JOUR :",
"Today's remaining jobs:": "Interventions restantes aujourd'hui :",
"Current": "En cours",
"OTHER:": "AUTRES :",
"My Hours": "Mes heures",
"Days": "Jours",
"Clocked In": "Pointé",
"Clock In →": "Pointer →",
// Validation-based time tracking
"Validate Hours": "Valider les heures",
"Validate": "Valider",
"Validated": "Validé",
"Planned hours": "Heures planifiées",
"Adjust hours if needed:": "Ajuster les heures si nécessaire :",
"h": "h",
"min": "min",
"No jobs scheduled for today": "Aucune intervention planifiée aujourd'hui",
"Hours validated!": "Heures validées !",
"Already validated for today": "Déjà validé pour aujourd'hui",
"TODAY'S JOBS:": "INTERVENTIONS DU JOUR :",
"Planned": "Planifié",
"Adjust & Validate": "Ajuster et valider",
"Validated today": "Validé aujourd'hui",
"pending validation": "en attente de validation",
"All Dates": "Toutes les dates",
"Validate All Today": "Tout valider aujourd'hui",
"Modify Hours": "Modifier les heures",
"Save Hours": "Enregistrer les heures",
"Adjusted by manager": "Ajusté par le manager",
"Date": "Date",
"Client": "Client",
"Employee": "Employé",
"Planned Hours": "Heures planifiées",
"Actual Hours": "Heures réelles",
"validated": "validé",
"All validated": "Tout validé",
"planned": "planifié",
"Cancel": "Annuler",
// Photos / CleanerPortal
"Photo Uploads": "Photos",
"Photo type": "Type de photo",
"Before": "Avant",
"After": "Après",
"Issue / Damage Proof": "Preuve de problème / dommage",
"Upload cleaning photo": "Téléverser une photo",
"Optional note": "Note optionnelle",
"Add context for this photo": "Ajouter un contexte à cette photo",
"My Uploaded Photos": "Mes photos téléversées",
"No photos uploaded yet": "Aucune photo téléversée",
// Products
"Products": "Produits",
"Requested": "Demandé",
"Received": "Reçu",
"In Hand": "En main",
"Open Requests": "Demandes ouvertes",
"Products I Currently Have": "Produits que j'ai actuellement",
"No products currently assigned": "Aucun produit assigné actuellement",
"Request Products": "Demander des produits",
"In stock": "en stock",
"Need for upcoming jobs, preferred handover location...": "Nécessaire pour les prochains travaux, lieu de remise préféré...",
"Submit Request": "Envoyer la demande",
"My Product Requests": "Mes demandes de produits",
"No product requests yet": "Aucune demande de produit",
"pending": "en attente",
"approved": "approuvé",
"delivered": "livré",
"rejected": "rejeté",
"Unknown product": "Produit inconnu",
"Qty": "Qté",
"Approved": "Approuvé",
// Leave / Congés
"Congés": "Congés",
"Allowance (days)": "Quota (jours)",
"Approved (days)": "Approuvé (jours)",
"Remaining (days)": "Restant (jours)",
"New Leave Request": "Nouvelle demande de congé",
"Vacation, personal, medical, etc.": "Vacances, personnel, médical, etc.",
"Submit Request": "Envoyer la demande",
"My Request Status": "Statut de mes demandes",
"Maladie": "Maladie",
"Congé": "Congé",
"No reason provided": "Aucune raison fournie",
"No leave requests submitted yet": "Aucune demande de congé soumise",
"Leave": "Congé",
"Sick Leave": "Maladie",
"Select start and end dates": "Sélectionnez les dates de début et de fin",
"End date must be after start date": "La date de fin doit être après la date de début",
"Invalid leave dates": "Dates de congé invalides",
"Request exceeds remaining leave balance": "La demande dépasse le solde de congés restant",
"Leave request sent": "Demande de congé envoyée",
"Reviewed": "Examiné le",
"Time-off Requests": "Demandes de congé",
"Unknown": "Inconnu",
"Approve": "Approuver",
"Reject": "Rejeter",
"No leave requests found.": "Aucune demande de congé trouvée.",
"Optional comment": "Commentaire optionnel",
// Inventory
"Inventory": "Stock",
"Add Product": "Ajouter un produit",
"Unit": "Unité",
"Min Stock": "Stock minimum",
"Usage Overview": "Aperçu des stocks",
"No products added yet.": "Aucun produit ajouté.",
"Assigned / In-Hand by Cleaner": "Assigné / En main par agent",
"No product assignments yet": "Aucune attribution de produit",
"Cleaner Product Requests": "Demandes de produits agents",
"Update In Hand": "Màj en main",
"Assigned": "Assigné",
"Deliver": "Livrer",
"Delete Product?": "Supprimer le produit ?",
"Remove this product?": "Supprimer ce produit ?",
"Requested:": "Demandé :",
"Delivered:": "Livré :",
"Product name required": "Nom du produit requis",
"Product added": "Produit ajouté",
"Product deleted": "Produit supprimé",
// History
"Job history": "Historique des travaux",
"No jobs": "Aucun travail",
"Image history": "Historique des images",
"No images": "Aucune image",
"All clients": "Tous les clients",
"Mark images seen": "Marquer les images comme vues",
"All": "Tous",
"From": "Du",
"To": "Au",
"Prestation": "Prestation",
"Reset": "Réinitialiser",
"Use the filters above and click Search to load history.": "Utilisez les filtres ci-dessus et cliquez sur Rechercher pour charger l'historique.",
"Showing first 200 results. Refine your filters to narrow down.": "Affichage des 200 premiers résultats. Affinez vos filtres.",
// Leave management (owner view)
"All Cleaners": "Tous les agents",
"Holiday Counter": "Compteur de congés",
"Search cleaner by name": "Rechercher un agent par nom",
"Next": "Suivant",
"No active cleaners": "Aucun agent actif",
// Payslips
"No payslips": "Aucune fiche de paie",
"Gross Amount": "Montant brut",
"Gross-only payroll view.": "Vue paie brut uniquement.",
"Print": "Imprimer",
"Close": "Fermer",
"PAYSLIP": "FICHE DE PAIE",
"Employee": "Employé",
// Quotes
"No quotes": "Aucun devis",
"Quote Preview": "Aperçu du devis",
"By hours": "À l'heure",
"By subscription": "Par abonnement",
"Quote Lines": "Lignes du devis",
"+ Add": "+ Ajouter",
"Save Quote": "Enregistrer le devis",
"Accepted": "Accepté",
"Converted": "Converti",
// Invoices
"No invoices": "Aucune facture",
"Invoice Preview": "Aperçu de la facture",
"Generate prestations from schedule": "Générer les prestations depuis le planning",
"No prestations found in this billing period.": "Aucune prestation trouvée pour cette période.",
"Fields (columns) and line items": "Champs et lignes",
// Reports
"Labour": "Main-d'œuvre",
"Employee Hours": "Heures employés",
"Client Revenue": "Revenus clients",
"Data Summary": "Résumé des données",
// Settings
"Owner Username": "Identifiant propriétaire",
"Owner Password": "Mot de passe propriétaire",
"Manager Username": "Identifiant manager",
"Manager Password": "Mot de passe manager",
"Save All": "Tout enregistrer",
"Company": "Entreprise",
"Finance": "Finance",
"Planning": "Planning",
"Notifications": "Notifications",
"Public Holidays": "Jours Fériés",
"Select public holidays that apply": "Sélectionnez les jours fériés applicables",
"Settings Control Panel": "Panneau de contrôle des paramètres",
"Configure company identity, access rights, finance, planning, time tracking, stock and system behavior.": "Configurez l'identité de l'entreprise, les droits d'accès, la finance, le planning, le pointage, le stock et le comportement système.",
"Business identity": "Identité de l'entreprise",
"Users & Roles": "Utilisateurs et rôles",
"Time Tracking": "Pointage",
"Stock": "Stock",
"System": "Système",
"Users & permissions": "Utilisateurs et permissions",
"Users": "Utilisateurs",
"Roles & permissions": "Rôles et permissions",
"Save changes": "Enregistrer les modifications",
"Logo": "Logo",
"Invoice header preview (live)": "Aperçu de l'en-tête de facture (en direct)",
"Legal footer for invoices": "Pied de page légal des factures",
"Please upload an image file": "Veuillez téléverser une image",
"No users yet. Add users from the Employees tab.": "Aucun utilisateur pour le moment. Ajoutez des utilisateurs depuis l'onglet Employés.",
"Deactivate": "Désactiver",
"User deactivated": "Utilisateur désactivé",
"Search users...": "Rechercher des utilisateurs...",
"Delete user": "Supprimer l'utilisateur",
"Delete this user?": "Supprimer cet utilisateur ?",
"User deleted": "Utilisateur supprimé",
"Show more": "Voir plus",
"Show less": "Voir moins",
"Role already exists": "Le rôle existe déjà",
"Financial rules": "Règles financières",
"Planning behavior": "Comportement du planning",
"Public holidays shown in planning": "Jours fériés affichés dans le planning",
"Holiday": "Jour férié",
"No public holiday selected": "Aucun jour férié sélectionné",
"No public holiday this day": "Aucun jour férié ce jour",
"Auto-assign employee": "Assigner automatiquement un employé",
"Suggest grouping by location": "Suggérer un groupement par localisation",
"Time tracking": "Pointage",
"Allow manual entry": "Autoriser la saisie manuelle",
"Require reason for manual edits": "Exiger une raison pour les modifications manuelles",
"Stock logic": "Logique de stock",
"Enable stock alerts": "Activer les alertes de stock",
"Email: Late employees": "E-mail : employés en retard",
"Email: New invoices": "E-mail : nouvelles factures",
"Email: Overdue invoices": "E-mail : factures en retard",
"Email: Low stock": "E-mail : stock faible",
"Email Reminders & Auto Send": "Rappels e-mail & envoi automatique",
"Future: Push notifications": "À venir : notifications push",
"System preferences": "Préférences système",
"Dark": "Sombre",
"Light": "Clair",
"Please fix validation errors": "Veuillez corriger les erreurs de validation",
"Changes saved successfully.": "Modifications enregistrées avec succès.",
"Settings updated": "Paramètres mis à jour",
"Owner only danger zone": "Zone rouge réservée au propriétaire",
"Permanently delete all business data from the app and database.": "Supprime définitivement toutes les données métier de l'application et de la base.",
"Wipe all data": "Effacer toutes les données",
"Wiping data...": "Effacement des données...",
"This action is irreversible. Continue?": "Cette action est irréversible. Continuer ?",
"Type WIPE to confirm full deletion": "Tapez WIPE pour confirmer la suppression complète",
"Type WIPE to proceed.": "Tapez WIPE pour continuer.",
"All data deleted successfully": "Toutes les données ont été supprimées",
"Failed to wipe data": "Échec de l'effacement des données",
// Client service
"Hours per Session": "Heures par séance",
"Forfait / Subscription": "Forfait / Abonnement",
"Forfait Name": "Nom du forfait",
"Forfait Price (€)": "Prix du forfait (€)",
"Billing Period": "Période de facturation",
"Included Hours / Period": "Heures incluses / période",
"e.g. Forfait Mensuel Premium": "ex. Forfait Mensuel Premium",
// General
"Unassigned": "Non assigné",
"Unknown client": "Client inconnu",
"Map": "Carte",
"Save": "Enregistrer",
"Add": "Ajouter",
"Search": "Rechercher",
"Prospect": "Prospect",
"Office": "Bureau",
"active": "actif",
"inactive": "inactif",
"scheduled": "planifié",
"in-progress": "en cours",
"completed": "terminé",
"cancelled": "annulé",
"Start": "Début",
"End": "Fin",
"Time": "Heure",
"Cleaner": "Agent",
"Price": "Prix",
"Freq": "Fréq.",
"Client": "Client",
"Address": "Adresse",
"Username": "Identifiant",
"Password": "Mot de passe",
"More": "Plus",
// Days
"Sunday": "Dimanche",
// Visitation
"Site Photos (optional)": "Photos du site (optionnel)",
"Add Photo": "Ajouter une photo",
"No photos for this visit": "Aucune photo pour cette visite",
"File too large (max 5MB)": "Fichier trop grand (max 5 Mo)",
"Select client and date": "Sélectionnez un client et une date",
"Visit added": "Visite ajoutée",
"Add Visit": "Ajouter une visite",
"Filter by client": "Filtrer par client",
"View details": "Voir les détails",
"View": "Voir",
"Visit": "Visite",
"No visits scheduled yet": "Aucune visite programmée",
"planned": "Planifié",
"done": "Terminé",
"Scope, apartment access, expectations...": "Périmètre, accès appartement, attentes...",
// Schedule Form
"Suggested:": "Suggéré :",
"Use suggested cleaner": "Utiliser l'agent suggéré",
"No group": "Aucun groupe",
"City check unavailable": "Vérification ville indisponible",
"Cleaner is in client city": "L'agent est dans la ville du client",
"Cleaner is outside client city": "L'agent est hors de la ville du client",
"Code:": "Code :",
"Key:": "Clé :",
"Pets:": "Animaux :",
"Prefers:": "Préférence :",
"Preferred days:": "Jours préférés :",
// Cleaning frequency
"Daily (weekends included)": "Quotidien (week-ends inclus)",
"Daily (weekdays only)": "Quotidien (jours ouvrables uniquement)",
// Expenses
"include in monthly budget & reminders": "inclure dans le budget mensuel et rappels",
"Due on the": "Dû le",
"of each month": "de chaque mois",
"Save Expense": "Enregistrer la dépense",
"Expected Amount": "Montant attendu",
"Period": "Période",
"Expense": "Dépense",
"Payment Date *": "Date de paiement *",
"Amount Paid (€) *": "Montant payé (€) *",
"Reference / Notes": "Référence / Notes",
"Receipt / Invoice (optional)": "Reçu / Facture (optionnel)",
"Attach receipt, invoice, or bank confirmation": "Joindre reçu, facture ou confirmation bancaire",
"Choose File": "Choisir un fichier",
"Loading...": "Chargement...",
"Remove": "Supprimer",
"Confirm Payment": "Confirmer le paiement",
"Failed to read file": "Échec de lecture du fichier",
"Please enter a valid amount": "Veuillez entrer un montant valide",
"Please select a payment date": "Veuillez sélectionner une date de paiement",
"File is too large. Maximum size is 5MB.": "Fichier trop volumineux. Taille maximale 5 Mo.",
// General
"All clients": "Tous les clients",
"No preference": "Pas de préférence",
"Preferred cleaners for auto-assignment": "Agents préférés pour l'auto-attribution",
"Requested:": "Demandé :",
"Delivery:": "Livraison :",
"due today": "dû aujourd'hui",
"due in": "dans",
"days": "jours",
"day": "jour",
"overdue": "en retard",
"No group": "Aucun groupe",
// Expense status labels
"Paid": "Payé",
"Overdue": "En retard",
"Due Today": "Dû aujourd'hui",
"Due Soon": "Bientôt dû",
"Pending": "En attente",
"paid": "payé(e)s",
"overdue since day": "en retard depuis le jour",
"expenses are overdue": "dépenses en retard",
"expense is overdue": "dépense en retard",
"action required": "action requise",
// Dashboard clock strings
"At": "Chez",
"since": "depuis",
"m elapsed": "min écoulées",
// Invoice form strings
"Billing period": "Période de facturation",
"Start date": "Date de début",
"End date": "Date de fin",
"Load services from schedule": "Générer les prestations depuis le planning",
"Services loaded from latest schedule.": "Prestations issues du dernier planning pour ce client et cette période.",
"No services found for this period.": "Aucune prestation trouvée pour cette période.",
"Invoice lines": "Lignes de facturation",
"Columns:": "Colonnes :",
"Global description (optional)": "Désignation globale (optionnel)",
"Apply to all lines": "Appliquer à toutes les lignes",
"Date": "Date",
"Description": "Description",
"Hours": "Heures",
"Qty": "Qté",
"Unit price": "Prix unit.",
"Total": "Total",
// Recurrence weekdays
"Select days:": "Choisir les jours :",
"4x per week": "4x par semaine",
"Mon": "Lun", "Tue": "Mar", "Wed": "Mer", "Thu": "Jeu", "Fri": "Ven", "Sat": "Sam", "Sun": "Dim",
// Visits
"New prospect name or address": "Nom du prospect ou adresse",
"Prospect / Client name": "Nom du prospect / client",
// Expense page strings
"Track and manage your monthly business expenses": "Suivez et gérez vos dépenses professionnelles mensuelles",
"Add Expense": "Ajouter une dépense",
"Current Month": "Mois en cours",
"Monthly Budget": "Budget mensuel",
"Paid This Month": "Payé ce mois",
"Outstanding": "Restant",
"Payment Progress": "Progression des paiements",
"Expense List": "Liste des dépenses",
"Sorted by urgency · overdue first": "Trié par urgence · en retard d'abord",
"No expenses defined yet": "Aucune dépense définie",
"Add your monthly expenses — rent, utilities, subscriptions — to track payments.": "Ajoutez vos dépenses mensuelles — loyer, services, abonnements — pour suivre les paiements.",
"Add First Expense": "Ajouter la première dépense",
"Category": "Catégorie",
"Due Day": "Jour d'échéance",
"Frequency / Dates": "Fréquence / Dates",
"Monthly": "Mensuel",
"Weekly": "Hebdomadaire",
"Every 2 weeks": "Toutes les 2 semaines",
"Quarterly": "Trimestriel",
"Yearly": "Annuel",
"from": "à partir du",
"Receipt": "Reçu",
"Delete this expense? All payment history will be lost.": "Supprimer cette dépense ? Tout l'historique de paiement sera perdu.",
"Expense deleted": "Dépense supprimée",
"Marked as unpaid": "Marqué comme non payé",
"Marked as paid": "Marqué comme payé",
"Payment Status": "Statut de paiement",
"Payment": "Paiement",
"Mark as Paid": "Marquer comme payé",
"Mark as Unpaid": "Marquer comme non payé",
"View Receipt": "Voir le reçu",
"Edit": "Modifier",
"Delete": "Supprimer",
"No payment recorded for this month": "Aucun paiement enregistré ce mois",
"Paid on": "Payé le",
"Day": "Jour",
"Pay": "Payer",
"Undo": "Annuler",
"MONTHLY TOTAL": "TOTAL MENSUEL",
"remaining": "restant",
"Inactive Expenses": "Dépenses inactives",
"Edit / Reactivate": "Modifier / Réactiver",
"Notes / Reference": "Notes / Référence",
"Profile": "Profil",
"My Profile": "Mon profil",
"Profile Picture": "Photo de profil",
"Upload Photo": "Télécharger une photo",
"Remove": "Supprimer",
"Saving...": "Enregistrement...",
"Upload a photo to personalise your profile.": "Téléchargez une photo pour personnaliser votre profil.",
"Personal Information": "Informations personnelles",
"Your information is managed by the owner. Contact them to make changes.": "Vos informations sont gérées par le propriétaire. Contactez-le pour apporter des modifications.",
"Profile picture updated": "Photo de profil mise à jour",
"Failed to update profile picture": "Échec de la mise à jour de la photo de profil",
"Failed to remove picture": "Échec de la suppression de la photo",
"Profile picture removed": "Photo de profil supprimée",
};

const uiText = (text) => {
if (CURRENT_LANG !== "fr") return text;
if (typeof text !== "string") return text;
return UI_FR[text] || text;
};

const effectiveInvoiceStatus = (inv) => {
if (!inv) return "draft";
if (inv.status === "paid") return "paid";
if (inv.dueDate && inv.dueDate < getToday()) return "overdue";
return inv.status || "draft";
};


const LU_PUBLIC_HOLIDAYS = [
  "1 Janvier — Jour de l'An",
  "Lundi de Pâques",
  "1 Mai — Fête du Travail",
  "9 Mai — Journée de l'Europe",
  "Jeudi de l'Ascension",
  "Lundi de Pentecôte",
  "23 Juin — Fête Nationale",
  "15 Août — Assomption",
  "1 Novembre — Toussaint",
  "25 Décembre — Noël",
  "26 Décembre — 2ème jour de Noël",
];


const DEFAULTS = {
employees: [], clients: [], schedules: [], clockEntries: [], quotes: [], invoices: [], payslips: [],
photoUploads: [], timeOffRequests: [], inventoryProducts: [], productRequests: [], cleanerProductHoldings: [], prospectVisits: [], expenses: [],
ownerUsername: "", ownerPin: "",
managerUsername: "", managerPin: "",
employeePins: {}, employeeUsernames: {},
settings: {
companyName: "Lux Angels Cleaning",
companyAddress: "12 Rue de la Liberté, L-1930 Luxembourg",
companyEmail: "info@luxangels.lu",
companyPhone: "+352 123 456",
companyWhatsApp: "",
vatNumber: "LU12345678",
bankIban: "LU12 3456 7890 1234 5678",
defaultVatRate: 17,
defaultCurrency: "EUR",
financeVatRate: 17,
latePaymentPenalty: 0,
autoMarkOverdueDays: 30,
invoicePrefix: "LA-YYYY-XXX",
paymentTermsDays: "30 days",
currencyFormat: "€ 1,234.56",
defaultHourlyRate: 0,
defaultJobDuration: "2h",
workingHoursStart: "08:00",
workingHoursEnd: "18:00",
maxJobsPerEmployeePerDay: 3,
allowOverlappingJobs: false,
autoAssignEmployee: false,
groupByLocationSuggestion: false,
allowManualEntry: false,
requireReasonManualEdits: false,
lateToleranceMinutes: 0,
autoClockOutAfterHours: 10,
defaultStockUnit: "bottles",
minStockThreshold: 5,
enableStockAlerts: false,
defaultLanguage: "FR",
dateFormat: "DD/MM/YYYY",
timeFormat: "24h",
theme: "dark",
invoiceFooterText: "",
rolePermissions: {},
notifLateEmployees: false,
notifNewInvoices: false,
notifOverdueInvoices: false,
notifLowStock: false,
notifPushEnabled: false,
publicHolidays: ["newYear", "easterMonday", "labourDay", "europeDay", "ascensionDay", "whitMonday", "nationalDay", "assumptionDay", "allSaintsDay", "christmasDay", "stStephensDay"],
customRoles: [],
emailSignature: "Best regards,\nLux Angels Cleaning Team\ninfo@luxangels.lu | +352 123 456",
communicationChannel: "email",
communicationCampaignSubject: "Lux Angels update",
communicationCampaignBody: "Hello, this is your scheduled client communication from Lux Angels.",
communicationOwnerManagerChannels: { email: true, sms: true, whatsapp: true },
communicationOwnerManagerEvents: {
clockInOut: true,
lateArrival: true,
timeOffRequest: true,
timeOffApproval: true,
scheduleChange: true,
invoiceOverdue: true,
},
communicationCleanerChannels: { email: false, sms: true, whatsapp: true },
communicationCleanerEvents: {
jobReminder: true,
jobRescheduled: true,
lateAlert: false,
vacationApproval: true,
vacationRequestStatus: true,
},
communicationClientChannels: { email: true, sms: true, whatsapp: false },
communicationClientEvents: {
jobCompleted: true,
jobReminder: true,
jobRescheduled: true,
invoiceSent: true,
paymentReceived: true,
},
},
};

// -- Utils --
let _idCtr = Date.now();
const makeId = () => `id_${_idCtr++}`;
const toLocalDateKey = (value) => {
if (!value) return "";
if (typeof value === "string") {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return trimmed.slice(0, 10);
}
const parsed = value instanceof Date ? value : new Date(value);
if (Number.isNaN(parsed.getTime())) return "";
const y = parsed.getFullYear();
const m = String(parsed.getMonth() + 1).padStart(2, "0");
const d = String(parsed.getDate()).padStart(2, "0");
return `${y}-${m}-${d}`;
};
const getToday = () => toLocalDateKey(new Date());
const normalizeDateOnly = (value) => {
if (!value) return "";
if (typeof value === "string") return value.slice(0, 10);
if (value instanceof Date && !Number.isNaN(value.getTime())) return toLocalDateKey(value);
const parsed = new Date(value);
return Number.isNaN(parsed.getTime()) ? "" : toLocalDateKey(parsed);
};
const safeDate = (value) => {
if (!value) return null;
const parsed = value instanceof Date ? value : new Date(value);
return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const fmtDate = (d) => {
const parsed = safeDate(d);
return parsed ? parsed.toLocaleDateString(localeForLang(CURRENT_LANG), { day: "2-digit", month: "short", year: "numeric" }) : "";
};
const fmtTime = (d) => {
const parsed = safeDate(d);
return parsed ? parsed.toLocaleTimeString(localeForLang(CURRENT_LANG), { hour: "2-digit", minute: "2-digit" }) : "";
};
const fmtBoth = (d) => {
const date = fmtDate(d);
const time = fmtTime(d);
return [date, time].filter(Boolean).join(" ");
};
const calcHrs = (a, b) => (a && b) ? Math.max(0, Math.round((new Date(b) - new Date(a)) / 36e5 * 100) / 100) : 0;
const getPlannedHoursForClockEntry = (entry, schedules = []) => {
if (!entry?.clockIn || !entry?.employeeId || !entry?.clientId) return 0;
const workDate = toLocalDateKey(entry.clockIn);
const sameSlotSchedules = (schedules || []).filter(s =>
  s?.status !== "cancelled"
  && isSameId(s?.employeeId, entry.employeeId)
  && isSameId(s?.clientId, entry.clientId)
  && toLocalDateKey(s?.date) === workDate
);
return sameSlotSchedules.reduce((sum, sched) => (
  sum + calcHrs(makeISO(workDate, sched.startTime || "00:00"), makeISO(workDate, sched.endTime || "00:00"))
), 0);
};
const calcAccountedClockHours = (entry, schedules = []) => {
const actual = calcHrs(entry?.clockIn, entry?.clockOut);
if (actual <= 0) return 0;
const planned = getPlannedHoursForClockEntry(entry, schedules);
if (planned <= 0) return actual;
return Math.min(actual, planned);
};
const EARLY_CLOCK_IN_PAYABLE_MINUTES = 15;
const calcPayableClockHours = (entry, schedules = []) => {
const actual = calcHrs(entry?.clockIn, entry?.clockOut);
if (!entry?.clockIn || !entry?.clockOut || actual <= 0) return actual;
const workDate = toLocalDateKey(entry.clockIn);
const scheduled = getScheduleForClockEvent(schedules, {
  employeeId: entry.employeeId,
  clientId: entry.clientId,
  date: workDate
});
if (!scheduled?.startTime) return actual;
const scheduledStartAt = safeDate(makeISO(workDate, scheduled.startTime));
const clockOutAt = safeDate(entry.clockOut);
if (!scheduledStartAt || !clockOutAt) return actual;
const earliestPayableStartAt = new Date(scheduledStartAt.getTime() - (EARLY_CLOCK_IN_PAYABLE_MINUTES * 60 * 1000));
const clockInAt = safeDate(entry.clockIn);
if (!clockInAt) return actual;
const payableStartAt = clockInAt < earliestPayableStartAt ? earliestPayableStartAt : clockInAt;
if (clockOutAt <= payableStartAt) return 0;
return calcHrs(payableStartAt.toISOString(), clockOutAt.toISOString());
};
const makeISO = (d, t) => `${d}T${t}:00`;
const mapsUrl = (address = "") => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const normalizeCity = (value = "") => String(value || "").trim().toLowerCase();

// ---------------------------------------------------------------------------
const cityMatchLabel = (employee, client) => {
const empCity = normalizeCity(employee?.city);
const clientCity = normalizeCity(client?.city);
if (!employee || !client || !clientCity || !empCity) return uiText("City check unavailable");
return empCity === clientCity ? `✅ ${uiText("Cleaner is in client city")}` : `⚠️ ${uiText("Cleaner is outside client city")}`;
};
const recommendedCleanerForClient = (client, employees = []) => {
if (!client) return null;
const active = employees.filter(e => e.status === "active");
const preferred = (client.preferredCleanerIds || [])
  .map(id => active.find(e => e.id === id))
  .filter(Boolean);
if (!preferred.length) return null;
const cityMatched = preferred.find(e => normalizeCity(e.city) && normalizeCity(e.city) === normalizeCity(client.city));
return cityMatched || preferred[0];
};
const scheduleStatusColor = (status) => status === "completed" ? CL.green : status === "in-progress" ? CL.orange : status === "cancelled" ? CL.red : CL.blue;
const isSameId = (a, b) => String(a ?? "") === String(b ?? "");
const getScheduleForClockEvent = (schedules, { employeeId, clientId, date }) => schedules
.filter(s => isSameId(s.employeeId, employeeId) && isSameId(s.clientId, clientId) && s.date === date && s.status !== "cancelled")
.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))[0];
const getLateMeta = (schedules, { employeeId, clientId, clockInAt = new Date() }) => {
const date = toLocalDateKey(clockInAt);
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
const LUX_PUBLIC_HOLIDAY_KEYS = [
  "newYear",
  "easterMonday",
  "labourDay",
  "europeDay",
  "ascensionDay",
  "whitMonday",
  "nationalDay",
  "assumptionDay",
  "allSaintsDay",
  "christmasDay",
  "stStephensDay",
];
const easterSunday = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
};
const addDaysUtc = (date, days) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};
const toIsoDateUtc = (date) => date.toISOString().slice(0, 10);
const getLuxembourgPublicHolidaysForYear = (year) => {
  const easter = easterSunday(year);
  return [
    { key: "newYear", date: `${year}-01-01` },
    { key: "easterMonday", date: toIsoDateUtc(addDaysUtc(easter, 1)) },
    { key: "labourDay", date: `${year}-05-01` },
    { key: "europeDay", date: `${year}-05-09` },
    { key: "ascensionDay", date: toIsoDateUtc(addDaysUtc(easter, 39)) },
    { key: "whitMonday", date: toIsoDateUtc(addDaysUtc(easter, 50)) },
    { key: "nationalDay", date: `${year}-06-23` },
    { key: "assumptionDay", date: `${year}-08-15` },
    { key: "allSaintsDay", date: `${year}-11-01` },
    { key: "christmasDay", date: `${year}-12-25` },
    { key: "stStephensDay", date: `${year}-12-26` },
  ];
};
const getLuxHolidayLabel = (key, lang = CURRENT_LANG) => {
  const labels = {
    newYear: { fr: "Nouvel An", en: "New Year's Day" },
    easterMonday: { fr: "Lundi de Pâques", en: "Easter Monday" },
    labourDay: { fr: "Fête du Travail", en: "Labour Day" },
    europeDay: { fr: "Journée de l'Europe", en: "Europe Day" },
    ascensionDay: { fr: "Ascension", en: "Ascension Day" },
    whitMonday: { fr: "Lundi de Pentecôte", en: "Whit Monday" },
    nationalDay: { fr: "Fête Nationale", en: "National Day" },
    assumptionDay: { fr: "Assomption", en: "Assumption Day" },
    allSaintsDay: { fr: "Toussaint", en: "All Saints' Day" },
    christmasDay: { fr: "Noël", en: "Christmas Day" },
    stStephensDay: { fr: "Saint-Étienne", en: "St Stephen's Day" },
  };
  return labels[key]?.[lang === "en" ? "en" : "fr"] || key;
};
const resolveEnabledPublicHolidayKeys = (settings) => {
  const selected = Array.isArray(settings?.publicHolidays) ? settings.publicHolidays.filter(Boolean) : [];
  return selected.length > 0 ? selected : LUX_PUBLIC_HOLIDAY_KEYS;
};
const getLuxPublicHolidaysByMonth = ({ year, month, selectedKeys }) => {
  const allowed = new Set(selectedKeys && selectedKeys.length ? selectedKeys : LUX_PUBLIC_HOLIDAY_KEYS);
  return getLuxembourgPublicHolidaysForYear(year).filter(h => allowed.has(h.key) && Number(h.date.slice(5, 7)) === month + 1);
};

const DEFAULT_API_BASES = [
"https://luxangelsyamyam-api.onrender.com",
];
const normalizeBaseUrl = (url) => String(url || "").trim().replace(/\/$/, "");
const envApiBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const API_BASE_CANDIDATES = Array.from(new Set([
envApiBase,
...DEFAULT_API_BASES,
].filter(Boolean)));
const apiUrl = (path, base = API_BASE_CANDIDATES[0] || "") => `${base}${path.startsWith("/") ? path : `/${path}`}`;

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onloadend = () => resolve(reader.result.split(',')[1]);
reader.onerror = reject;
reader.readAsDataURL(blob);
});

const sendPlatformEmail = async ({ to, subject, body, html, attachments }, { showToast, lang }) => {
if (!to) { showToast(uiText("Client email missing"), "error"); return false; }
try {
let fetchOptions;
const hasBlobs = attachments?.length && attachments[0].blob instanceof Blob;
if (hasBlobs) {
  const formData = new FormData();
  formData.append('to', to);
  formData.append('subject', subject);
  if (body) formData.append('body', body);
  if (html) formData.append('html', html);
  attachments.forEach(a => formData.append('attachments', a.blob, a.filename));
  fetchOptions = { method: 'POST', body: formData };
} else {
  fetchOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body, html, attachments }),
  };
}
const response = await fetch(apiUrl('/api/notifications/email'), fetchOptions);
if (!response.ok) {
const errPayload = await response.json().catch(() => ({}));
throw new Error(errPayload.error || 'Unable to send email');
}
showToast(lang === "fr" ? "Email envoyé" : "Email sent", "success");
return true;
} catch (err) {
console.error(err);
const fallbackEmailError = !err?.message || /load failed|failed to fetch/i.test(err.message);
showToast(fallbackEmailError ? uiText("Unable to send email") : err.message, "error");
return false;
}
};

const BOOLEAN_SETTING_KEYS = new Set([
  "allowOverlappingJobs", "autoAssignEmployee", "groupByLocationSuggestion", "allowManualEntry",
  "requireReasonManualEdits", "requireCheckinValidation", "enableStockAlerts", "notifLateEmployees",
  "notifNewInvoices", "notifOverdueInvoices", "notifLowStock", "notifPushEnabled",
]);
const NUMBER_SETTING_KEYS = new Set([
  "defaultVatRate", "financeVatRate", "latePaymentPenalty", "defaultHourlyRate",
  "maxJobsPerEmployeePerDay", "lateToleranceMinutes", "minStockThreshold", "autoClockOutAfterHours",
  "autoMarkOverdueDays",
]);
const JSON_SETTING_KEYS = new Set([
  "publicHolidays",
  "customRoles",
  "rolePermissions",
  "communicationOwnerManagerChannels",
  "communicationOwnerManagerEvents",
  "communicationCleanerChannels",
  "communicationCleanerEvents",
  "communicationClientChannels",
  "communicationClientEvents",
]);
const parseJsonSafe = (raw, fallback) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
const normalizeSettingValue = (key, value, fallback) => {
  if (value == null) return fallback;
  if (JSON_SETTING_KEYS.has(key)) {
    if (typeof value === "string") return parseJsonSafe(value, fallback);
    if (typeof value === "object") return value;
    return fallback;
  }
  if (BOOLEAN_SETTING_KEYS.has(key)) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return Boolean(value);
  }
  if (NUMBER_SETTING_KEYS.has(key)) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return value;
};
const normalizeSettingsPayload = (incoming = {}, baseSettings = DEFAULTS.settings) => {
  const normalized = {};
  Object.entries(incoming || {}).forEach(([key, value]) => {
    normalized[key] = normalizeSettingValue(key, value, baseSettings[key]);
  });
  return normalized;
};

// Convert frontend camelCase employee to snake_case for backend API
const toApiEmployee = (emp, pin, username) => ({
  id: emp.id,
  name: emp.name,
  email: emp.email || "",
  phone: emp.phone || "",
  phone_mobile: emp.phoneMobile || "",
  role: emp.role || "Cleaner",
  hourly_rate: emp.hourlyRate || 15,
  address: emp.address || "",
  city: emp.city || "",
  postal_code: emp.postalCode || "",
  country: emp.country || "Luxembourg",
  start_date: emp.startDate || null,
  contract_end_date: emp.contractEndDate || null,
  status: emp.status || "active",
  contract_type: emp.contractType || "CDI",
  bank_iban: emp.bankIban || "",
  social_sec_number: emp.socialSecNumber || "",
  date_of_birth: emp.dateOfBirth || null,
  nationality: emp.nationality || "",
  languages: emp.languages || "",
  transport: emp.transport || "",
  work_permit: emp.workPermit || "",
  emergency_name: emp.emergencyName || "",
  emergency_phone: emp.emergencyPhone || "",
  notes: emp.notes || "",
  username: (username !== undefined ? username : emp.username) || "",
  weekly_hours: emp.weeklyHours || 0,
  ...(pin !== undefined ? { pin } : {}),
});

const parseApiErrorMessage = async (response, fallbackMessage) => {
  let payload = {};
  try { payload = await response.json(); } catch { payload = {}; }
  return payload?.error || payload?.message || fallbackMessage;
};

const ensureApiOk = async (response, fallbackMessage) => {
  if (response.ok) return;
  throw new Error(await parseApiErrorMessage(response, fallbackMessage));
};


const fetchApiList = async (path) => {
  const response = await fetch(apiUrl(path), { cache: "no-store" });
  await ensureApiOk(response, `Failed to load ${path}`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};

const syncCollectionToApi = async ({ importedItems = [], listPath, deletePath, syncItem }) => {
  const existing = await fetchApiList(listPath);
  const importedIds = new Set(importedItems.map(item => item?.id).filter(Boolean));

  for (const row of existing) {
    if (row?.id && !importedIds.has(row.id)) await deletePath(row.id);
  }

  for (const item of importedItems) {
    if (!item?.id) continue;
    await syncItem(item);
  }
};

const syncImportedDataToDb = async (imported) => {
  if (!imported || typeof imported !== "object") return;

  if (imported.settings && typeof imported.settings === "object") {
    const settingsPayload = {
      ...imported.settings,
      ownerUsername: imported.ownerUsername || "",
      ownerPin: imported.ownerPin || "",
      managerUsername: imported.managerUsername || "",
      managerPin: imported.managerPin || "",
    };
    const response = await fetch(apiUrl("/api/settings"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsPayload),
    });
    await ensureApiOk(response, "Failed to sync settings");
  }

  if (Array.isArray(imported.employees)) {
    await syncCollectionToApi({
      importedItems: imported.employees,
      listPath: "/api/employees",
      deletePath: deleteEmployeeFromApi,
      syncItem: async (emp) => {
      await syncEmployeeToApi(emp, imported.employeePins?.[emp.id], imported.employeeUsernames?.[emp.id]);
      if (imported.employeePins?.[emp.id] != null) await syncEmployeePinToApi(emp.id, imported.employeePins[emp.id]);
      if (emp.profilePicture !== undefined) await syncProfilePictureToApi(emp.id, emp.profilePicture || null);
      },
    });
  }

  if (Array.isArray(imported.clients)) {
    await syncCollectionToApi({
      importedItems: imported.clients,
      listPath: "/api/clients",
      deletePath: deleteClientFromApi,
      syncItem: syncClientToApi,
    });
  }

  if (Array.isArray(imported.schedules)) {
    await syncCollectionToApi({
      importedItems: imported.schedules,
      listPath: "/api/schedules",
      deletePath: deleteScheduleFromApi,
      syncItem: syncScheduleToApi,
    });
  }

  if (Array.isArray(imported.clockEntries)) {
    await syncCollectionToApi({
      importedItems: imported.clockEntries,
      listPath: "/api/clock-entries",
      deletePath: deleteClockEntryFromApi,
      syncItem: syncClockEntryToApi,
    });
  }

  if (Array.isArray(imported.invoices)) {
    await syncCollectionToApi({
      importedItems: imported.invoices,
      listPath: "/api/invoices",
      deletePath: deleteInvoiceFromApi,
      syncItem: syncInvoiceToApi,
    });
  }

  if (Array.isArray(imported.payslips)) {
    await syncCollectionToApi({
      importedItems: imported.payslips,
      listPath: "/api/payslips",
      deletePath: deletePayslipFromApi,
      syncItem: syncPayslipToApi,
    });
  }

  if (Array.isArray(imported.quotes)) {
    await syncCollectionToApi({
      importedItems: imported.quotes,
      listPath: "/api/quotes",
      deletePath: deleteQuoteFromApi,
      syncItem: syncQuoteToApi,
    });
  }

  if (Array.isArray(imported.photoUploads)) {
    await syncCollectionToApi({
      importedItems: imported.photoUploads,
      listPath: "/api/photo-uploads",
      deletePath: deletePhotoUploadFromApi,
      syncItem: syncPhotoUploadToApi,
    });
  }

  if (Array.isArray(imported.timeOffRequests)) {
    await syncCollectionToApi({
      importedItems: imported.timeOffRequests,
      listPath: "/api/time-off-requests",
      deletePath: deleteTimeOffRequestFromApi,
      syncItem: syncTimeOffRequestToApi,
    });
  }

  if (Array.isArray(imported.inventoryProducts)) {
    await syncCollectionToApi({
      importedItems: imported.inventoryProducts,
      listPath: "/api/inventory-products",
      deletePath: deleteInventoryProductFromApi,
      syncItem: syncInventoryProductToApi,
    });
  }

  if (Array.isArray(imported.productRequests)) {
    await syncCollectionToApi({
      importedItems: imported.productRequests,
      listPath: "/api/product-requests",
      deletePath: deleteProductRequestFromApi,
      syncItem: syncProductRequestToApi,
    });
  }

  if (Array.isArray(imported.cleanerProductHoldings)) {
    await syncCollectionToApi({
      importedItems: imported.cleanerProductHoldings,
      listPath: "/api/cleaner-product-holdings",
      deletePath: deleteCleanerProductHoldingFromApi,
      syncItem: syncCleanerProductHoldingToApi,
    });
  }

  if (Array.isArray(imported.prospectVisits)) {
    await syncCollectionToApi({
      importedItems: imported.prospectVisits,
      listPath: "/api/prospect-visits",
      deletePath: deleteProspectVisitFromApi,
      syncItem: syncProspectVisitToApi,
    });
  }

  if (Array.isArray(imported.expenses)) {
    await syncCollectionToApi({
      importedItems: imported.expenses,
      listPath: "/api/expenses",
      deletePath: deleteExpenseFromApi,
      syncItem: syncExpenseToApi,
    });
  }
};

const syncEmployeeToApi = async (emp, pin, username) => {
  const payload = toApiEmployee(emp, pin, username);
  const updateRes = await fetch(apiUrl(`/api/employees/${emp.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/employees"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create employee");
    return;
  }

  await ensureApiOk(updateRes, "Failed to update employee");
};

const createEmployeeInApi = async (emp, pin, username) => {
  const payload = toApiEmployee(emp, pin, username);
  const response = await fetch(apiUrl("/api/employees"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await ensureApiOk(response, "Failed to create employee");
};

const syncProfilePictureToApi = async (id, imageData) => {
  const response = await fetch(apiUrl(`/api/employees/${id}/profile-picture`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData: imageData || null }),
  });
  await ensureApiOk(response, "Failed to update profile picture");
};

const syncEmployeePinToApi = async (id, pin) => {
  const response = await fetch(apiUrl(`/api/employees/${id}/pin`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  await ensureApiOk(response, "Failed to update employee PIN");
};

const deleteEmployeeFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/employees/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete employee");
};

// CLIENT API helpers
const toApiClient = (c) => ({
  id: c.id,
  name: c.name,
  contact_person: c.contactPerson || "",
  email: c.email || "",
  phone: c.phone || "",
  phone_mobile: c.phoneMobile || "",
  address: c.address || "",
  apartment_floor: c.apartmentFloor || "",
  city: c.city || "",
  postal_code: c.postalCode || "",
  country: c.country || "Luxembourg",
  type: c.type || "Residential",
  cleaning_frequency: c.cleaningFrequency || "Weekly",
  billing_type: c.billingType || "hourly",
  price_per_hour: c.pricePerHour || 35,
  price_fixed: c.priceFixed || 0,
  status: c.status || "active",
  language: c.language || "FR",
  access_code: c.accessCode || "",
  key_location: c.keyLocation || "",
  parking_info: c.parkingInfo || "",
  pet_info: c.petInfo || "",
  preferred_day: c.preferredDay || "",
  preferred_time: c.preferredTime || "",
  contract_start: c.contractStart || null,
  contract_end: c.contractEnd || null,
  square_meters: c.squareMeters || null,
  tax_id: c.taxId || "",
  special_instructions: c.specialInstructions || "",
  notes: c.notes || "",
  meta: {
    region: c.region || "",
    preferredDays: Array.isArray(c.preferredDays) ? c.preferredDays : [],
    preferredCleanerIds: Array.isArray(c.preferredCleanerIds) ? c.preferredCleanerIds : [],
    hoursPerSession: Number(c.hoursPerSession) || 0,
    forfaitLabel: c.forfaitLabel || "",
    forfaitPrice: Number(c.forfaitPrice) || 0,
    forfaitPeriod: c.forfaitPeriod || "monthly",
    forfaitIncludedHours: Number(c.forfaitIncludedHours) || 0,
  },
});

const syncClientToApi = async (client) => {
  const payload = toApiClient(client);
  const updateRes = await fetch(apiUrl(`/api/clients/${client.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/clients"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create client");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update client");
};

const createClientInApi = async (client) => {
  const response = await fetch(apiUrl("/api/clients"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiClient(client)),
  });
  await ensureApiOk(response, "Failed to create client");
};

const deleteClientFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/clients/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete client");
};

// SCHEDULE API helpers
const toApiSchedule = (s) => ({
  id: s.id,
  date: normalizeDateOnly(s.date),
  client_id: s.clientId || null,
  employee_id: s.employeeId || null,
  start_time: s.startTime || "08:00",
  end_time: s.endTime || "12:00",
  status: s.status || "scheduled",
  payment_status: s.paymentStatus || "unpaid",
  notes: s.notes || "",
  recurrence: s.recurrence || "none",
});

const createScheduleInApi = async (sched) => {
  const response = await fetch(apiUrl("/api/schedules"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiSchedule(sched)),
  });
  await ensureApiOk(response, "Failed to create schedule");
};

const syncScheduleToApi = async (sched) => {
  const payload = toApiSchedule(sched);
  const updateRes = await fetch(apiUrl(`/api/schedules/${sched.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/schedules"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create schedule");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update schedule");
};

const deleteScheduleFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/schedules/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete schedule");
};

// INVOICE API helpers
const toApiInvoice = (inv) => ({
  id: inv.id,
  invoice_number: inv.invoiceNumber,
  date: inv.date,
  due_date: inv.dueDate || null,
  client_id: inv.clientId || null,
  status: inv.status || "draft",
  items: inv.items || [],
  subtotal: inv.subtotal || 0,
  vat_rate: inv.vatRate || 17,
  vat_amount: inv.vatAmount || 0,
  total: inv.total || 0,
  notes: inv.notes || "",
  payment_terms: inv.paymentTerms || "",
});

const syncInvoiceToApi = async (inv) => {
  const payload = toApiInvoice(inv);
  const updateRes = await fetch(apiUrl(`/api/invoices/${inv.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/invoices"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create invoice");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update invoice");
};

const createInvoiceInApi = async (inv) => {
  const response = await fetch(apiUrl("/api/invoices"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiInvoice(inv)),
  });
  await ensureApiOk(response, "Failed to create invoice");
};

const deleteInvoiceFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/invoices/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete invoice");
};

// PAYSLIP API helpers
const toApiPayslip = (ps) => ({
  id: ps.id,
  payslip_number: ps.payslipNumber,
  employee_id: ps.employeeId,
  month: ps.month,
  period_start: ps.periodStart || null,
  period_end: ps.periodEnd || null,
  total_hours: ps.totalHours || 0,
  hourly_rate: ps.hourlyRate || 0,
  gross_pay: ps.grossPay || 0,
  social_charges: ps.socialCharges || 0,
  tax_estimate: ps.taxEstimate || 0,
  net_pay: ps.netPay || 0,
  hour_breakdown: Array.isArray(ps.hourBreakdown) ? ps.hourBreakdown : [],
  status: ps.status || "draft",
});

const createPayslipInApi = async (ps) => {
  const response = await fetch(apiUrl("/api/payslips"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayslip(ps)),
  });
  await ensureApiOk(response, "Failed to create payslip");
};

const syncPayslipToApi = async (ps) => {
  const payload = toApiPayslip(ps);
  const updateRes = await fetch(apiUrl(`/api/payslips/${ps.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/payslips"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create payslip");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update payslip");
};

// CLOCK ENTRY API helpers
const toApiClock = (c) => ({
  id: c.id,
  employee_id: c.employeeId,
  client_id: c.clientId || null,
  clock_in: c.clockIn,
  clock_out: c.clockOut || null,
  notes: c.notes || "",
});

const createClockEntryInApi = async (entry) => {
  const response = await fetch(apiUrl("/api/clock-entries"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiClock(entry)),
  });
  await ensureApiOk(response, "Failed to create clock entry");
};

const syncClockEntryToApi = async (entry) => {
  const payload = toApiClock(entry);
  const updateRes = await fetch(apiUrl(`/api/clock-entries/${entry.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/clock-entries"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create clock entry");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update clock entry");
};

const deleteClockEntryFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/clock-entries/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete clock entry");
};

const deletePayslipFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/payslips/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete payslip");
};

const deleteApiResourceIfPresent = async (path) => {
  const response = await fetch(apiUrl(path), { method: "DELETE" });
  if (response.status === 404) return;
  await ensureApiOk(response, `Failed to delete ${path}`);
};

const toApiQuote = (quote) => ({
  id: quote.id,
  quoteNumber: quote.quoteNumber || "",
  date: quote.date || "",
  clientId: quote.clientId || null,
  status: quote.status || "draft",
  items: quote.items || [],
  subtotal: Number(quote.subtotal) || 0,
  vatRate: Number(quote.vatRate) || 17,
  vatAmount: Number(quote.vatAmount) || 0,
  total: Number(quote.total) || 0,
  notes: quote.notes || "",
  pricingMode: quote.pricingMode || "hours",
  jobSchedule: quote.jobSchedule || {},
  visibleColumns: quote.visibleColumns || {},
});

const syncQuoteToApi = async (quote) => {
  const payload = toApiQuote(quote);
  const updateRes = await fetch(apiUrl(`/api/quotes/${quote.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/quotes"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create quote");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update quote");
};

const deleteQuoteFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/quotes/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete quote");
};

const toApiPhotoUpload = (upload) => ({
  id: upload.id,
  employeeId: upload.employeeId || null,
  clientId: upload.clientId || null,
  clockEntryId: upload.clockEntryId || null,
  fileName: upload.fileName || "",
  imageData: upload.imageData || "",
  note: upload.note || "",
  type: upload.type || "issue",
  seenByOwner: upload.seenByOwner === true,
});

const syncPhotoUploadToApi = async (upload) => {
  await deleteApiResourceIfPresent(`/api/photo-uploads/${upload.id}`);
  const response = await fetch(apiUrl("/api/photo-uploads"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPhotoUpload(upload)),
  });
  await ensureApiOk(response, "Failed to sync photo upload");
};

const deletePhotoUploadFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/photo-uploads/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete photo upload");
};

const toApiTimeOffRequest = (request) => ({
  id: request.id,
  employeeId: request.employeeId || null,
  startDate: request.startDate,
  endDate: request.endDate,
  requestedDays: Number(request.requestedDays) || leaveDaysInclusive(request.startDate, request.endDate) || 1,
  reason: request.reason || "",
  leaveType: request.leaveType || "conge",
  status: request.status || "pending",
});

const syncTimeOffRequestToApi = async (request) => {
  await deleteApiResourceIfPresent(`/api/time-off-requests/${request.id}`);
  const response = await fetch(apiUrl("/api/time-off-requests"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiTimeOffRequest(request)),
  });
  await ensureApiOk(response, "Failed to sync time-off request");
};

const deleteTimeOffRequestFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/time-off-requests/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete time-off request");
};

const toApiInventoryProduct = (product) => ({
  id: product.id,
  name: product.name || "",
  unit: product.unit || "pcs",
  stock: Number(product.stock) || 0,
  minStock: Number(product.minStock) || 0,
  note: product.note || "",
  active: product.active !== false,
});

const syncInventoryProductToApi = async (product) => {
  const payload = toApiInventoryProduct(product);
  const updateRes = await fetch(apiUrl(`/api/inventory-products/${product.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/inventory-products"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create inventory product");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update inventory product");
};

const deleteInventoryProductFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/inventory-products/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete inventory product");
};

const toApiProductRequest = (request) => ({
  id: request.id,
  employeeId: request.employeeId || null,
  productId: request.productId || null,
  quantity: Number(request.quantity) || 1,
  note: request.note || "",
  deliveryAt: request.deliveryAt || "",
  status: request.status || "pending",
  approvedQty: Number(request.approvedQty) || 0,
  deliveredQty: Number(request.deliveredQty) || 0,
});

const syncProductRequestToApi = async (request) => {
  await deleteApiResourceIfPresent(`/api/product-requests/${request.id}`);
  const response = await fetch(apiUrl("/api/product-requests"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiProductRequest(request)),
  });
  await ensureApiOk(response, "Failed to sync product request");
};

const deleteProductRequestFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/product-requests/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete product request");
};

const toApiCleanerProductHolding = (holding) => ({
  id: holding.id,
  employeeId: holding.employeeId || null,
  productId: holding.productId || null,
  qtyInHand: Number(holding.qtyInHand) || 0,
});

const syncCleanerProductHoldingToApi = async (holding) => {
  await deleteApiResourceIfPresent(`/api/cleaner-product-holdings/${holding.id}`);
  const response = await fetch(apiUrl("/api/cleaner-product-holdings"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiCleanerProductHolding(holding)),
  });
  await ensureApiOk(response, "Failed to sync cleaner product holding");
};

const deleteCleanerProductHoldingFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/cleaner-product-holdings/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete cleaner product holding");
};

const toApiProspectVisit = (visit) => ({
  id: visit.id,
  clientId: visit.clientId || null,
  visitDate: visit.visitDate,
  visitTime: visit.visitTime || "",
  address: visit.address || "",
  notes: visit.notes || "",
  status: visit.status || "planned",
  photos: visit.photos || [],
});

const syncProspectVisitToApi = async (visit) => {
  await deleteApiResourceIfPresent(`/api/prospect-visits/${visit.id}`);
  const response = await fetch(apiUrl("/api/prospect-visits"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiProspectVisit(visit)),
  });
  await ensureApiOk(response, "Failed to sync prospect visit");
};

const deleteProspectVisitFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/prospect-visits/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete prospect visit");
};

const toApiExpense = (expense) => ({
  id: expense.id,
  name: expense.name || "",
  amount: Number(expense.amount) || 0,
  dueDay: Number(expense.dueDay) || 1,
  frequency: expense.frequency || "monthly",
  startDate: expense.startDate || "",
  endDate: expense.endDate || null,
  category: expense.category || "other",
  note: expense.note || expense.notes || "",
  isActive: expense.isActive !== false,
  payments: Array.isArray(expense.payments) ? expense.payments : [],
});

const syncExpenseToApi = async (expense) => {
  const payload = toApiExpense(expense);
  const updateRes = await fetch(apiUrl(`/api/expenses/${expense.id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (updateRes.status === 404) {
    const createRes = await fetch(apiUrl("/api/expenses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await ensureApiOk(createRes, "Failed to create expense");
    return;
  }
  await ensureApiOk(updateRes, "Failed to update expense");
};

const deleteExpenseFromApi = async (id) => {
  const response = await fetch(apiUrl(`/api/expenses/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete expense");
};

const getLeaveSummary = (data, employeeId, year = getToday().slice(0, 4)) => {
const allowance = data.employees.find(e => e.id === employeeId)?.leaveAllowance ?? 26;
const requests = (data.timeOffRequests || []).filter(r => r.employeeId === employeeId && (r.startDate || "").startsWith(year));
const approvedDays = requests.filter(r => r.status === "approved").reduce((sum, r) => sum + leaveDaysInclusive(r.startDate, r.endDate), 0);
const pendingDays = requests.filter(r => r.status === "pending").reduce((sum, r) => sum + leaveDaysInclusive(r.startDate, r.endDate), 0);
return { allowance, approvedDays, pendingDays, remaining: Math.max(0, allowance - approvedDays), requests };
};
const updateScheduleStatusForJob = (schedules, { employeeId, clientId, date, from, to }) => {
const idx = schedules.findIndex(s => isSameId(s.employeeId, employeeId) && isSameId(s.clientId, clientId) && toLocalDateKey(s.date) === toLocalDateKey(date) && s.status === from);
if (idx === -1) return schedules;
const next = [...schedules];
next[idx] = { ...next[idx], status: to };
return next;
};
const syncSchedulesWithClockEntries = (schedules = [], clockEntries = []) => schedules.map(sched => {
if (sched.status === "cancelled") return sched;
const related = clockEntries.filter(c => isSameId(c.employeeId, sched.employeeId) && isSameId(c.clientId, sched.clientId) && toLocalDateKey(c.clockIn) === toLocalDateKey(sched.date));
const hasActive = related.some(c => !c.clockOut);
const hasCompleted = related.some(c => c.clockOut);
const nextStatus = hasActive ? "in-progress" : hasCompleted ? "completed" : "scheduled";
return sched.status === nextStatus ? sched : { ...sched, status: nextStatus };
});

// -- Theme --
const THEMES = {
dark: {
  bg: "#0C0F16", sf: "#151922", s2: "#1C2130", bd: "#2C3348",
  gold: "#D4A843", goldDark: "#B08C2F", goldLight: "#F0D78C",
  blue: "#4A9FD9", green: "#3EC47E", red: "#D95454", orange: "#E89840",
  text: "#E4E6ED", muted: "#838AA3", dim: "#525976", white: "#FFF", line: "#2C3348",
},
light: {
  bg: "#F4F1EA", sf: "#FFFFFF", s2: "#EDE9DF", bd: "#D4C9B0",
  gold: "#B8860B", goldDark: "#8B6914", goldLight: "#D4A843",
  blue: "#1565C0", green: "#2E7D32", red: "#C62828", orange: "#E65100",
  text: "#1A1A1A", muted: "#5C5C5C", dim: "#888888", white: "#FFF", line: "#D4C9B0",
},
};
const INIT_THEME = loadTheme();
const CL = { ...THEMES[INIT_THEME] || THEMES.dark };

// -- Base Styles --
const inputSt = { width: "100%", padding: "0 16px", height: 46, background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 10, color: CL.text, fontSize: 14, outline: "none", boxSizing: "border-box" };
const btnPri = { padding: "10px 20px", background: CL.gold, color: CL.bg, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
const btnSec = { ...btnPri, background: CL.s2, color: CL.text, border: `1px solid ${CL.bd}` };
const btnDng = { ...btnPri, background: CL.red, color: CL.white };
const btnSm = { padding: "6px 12px", fontSize: 13 };
const cardSt = { background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 16, padding: "clamp(16px, 2vw, 26px)", boxShadow: `0 10px 30px ${CL.bg}35`, display: "flex", flexDirection: "column", gap: 12 };
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
wallet: <SvgIcon paths={<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></>} />,
receipt: <SvgIcon paths={<><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></>} />,
};

// -- UI Components --
const ModalBox = ({ title, onClose, children, wide }) => (

  <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={onClose}>
    <div className={wide ? "modal-wide" : "modal-normal"} style={{ ...cardSt, overflow: "auto", display: "flex", flexDirection: "column" }} onClick={ev => ev.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, position: "sticky", top: 0, background: CL.sf, paddingBottom: 16, borderBottom: `1px solid ${CL.bd}`, zIndex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: CL.gold, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.02em" }}>{uiText(title)}</h2>
        <button onClick={onClose} style={{ background: CL.bd, border: "none", cursor: "pointer", color: CL.muted, padding: "6px 8px", borderRadius: 8, display: "flex", alignItems: "center" }}>{ICN.close}</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (

  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", marginBottom: 5, fontSize: 13, color: CL.muted, fontWeight: 500 }}>{uiText(label)}</label>
    {children}
  </div>
);

const TextInput = (props) => <input {...props} placeholder={uiText(props.placeholder)} style={{ ...inputSt, ...(props.style || {}) }} />;
const NumberAdjustInput = ({ value, onChange, min = 0, max = 999, step = 1, style = {}, ...props }) => {
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : Number(min) || 0;
  };
  const clamp = (n) => Math.max(Number(min), Math.min(Number(max), n));
  const sendValue = (next) => onChange?.({ target: { value: String(clamp(next)) } });
  const increment = () => sendValue(toNum(value) + Number(step));
  const decrement = () => sendValue(toNum(value) - Number(step));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, ...(style || {}) }}>
      <button type="button" onClick={decrement} style={{ ...btnSec, ...btnSm, minWidth: 28, height: 28, padding: 0, justifyContent: "center", fontSize: 15, lineHeight: 1 }}>−</button>
      <TextInput type="number" min={min} max={max} step={step} value={value} onChange={onChange} {...props} style={{ width: 60, textAlign: "center" }} />
      <button type="button" onClick={increment} style={{ ...btnSec, ...btnSm, minWidth: 28, height: 28, padding: 0, justifyContent: "center", fontSize: 15, lineHeight: 1 }}>+</button>
    </div>
  );
};
const SearchableSelectInput = ({ options = [], value = "", onChange, placeholder = "Select...", disabled = false, multiple = false, noResultsLabel = "No results", style = {}, searchThreshold = 0, menuStyle = {}, searchInputStyle = {} }) => {
const [open, setOpen] = useState(false);
const [search, setSearch] = useState("");
const ref = useRef(null);

useEffect(() => {
  const onDocClick = (ev) => {
    if (ref.current && !ref.current.contains(ev.target)) setOpen(false);
  };
  document.addEventListener("mousedown", onDocClick);
  return () => document.removeEventListener("mousedown", onDocClick);
}, []);

const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
const selected = options.filter(opt => selectedValues.includes(opt.value));
const filtered = options.filter(opt => !search || opt.label.toLowerCase().includes(search.toLowerCase()));

const selectVal = (val) => {
  if (!onChange) return;
  if (multiple) {
    onChange(selectedValues.includes(val) ? selectedValues.filter(v => v !== val) : [...selectedValues, val]);
    return;
  }
  onChange(val);
  setOpen(false);
};

const summary = selected.length === 0
  ? placeholder
  : !multiple
    ? selected[0]?.label
    : selected.length <= 2
    ? selected.map(s => s.label).join(", ")
    : `${selected.length} items`;

return (
  <div ref={ref} style={{ position: "relative" }}>
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setOpen(o => !o)}
      style={{ ...inputSt, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: disabled ? "not-allowed" : "pointer", background: disabled ? CL.s2 : CL.sf, ...(style || {}) }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selected.length ? CL.text : CL.dim }}>{summary}</span>
      <span style={{ color: CL.muted }}>▾</span>
    </button>
    {open && (
      <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 1001, background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 10, boxShadow: "0 10px 28px rgba(0,0,0,.35)", padding: 8, ...(menuStyle || {}) }}>
        {options.length >= searchThreshold && (
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={uiText("Search") + "..."}
            style={{ width: "100%", height: 34, padding: "0 10px", marginBottom: 8, borderRadius: 8, border: `1px solid ${CL.bd}`, background: CL.bg, color: CL.text, outline: "none", ...(searchInputStyle || {}) }}
          />
        )}
        <div style={{ maxHeight: 220, overflowY: "auto" }}>
          {filtered.length === 0 ? <div style={{ fontSize: 12, color: CL.muted, padding: "8px 4px" }}>{uiText(noResultsLabel)}</div> : filtered.map(opt => {
            const checked = selectedValues.includes(opt.value);
            const optDisabled = Boolean(opt.disabled);
            return (
              <button
                type="button"
                key={opt.value}
                disabled={optDisabled}
                onClick={() => !optDisabled && selectVal(opt.value)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 6px",
                  borderRadius: 7,
                  border: "none",
                  background: checked ? `${CL.gold}22` : "transparent",
                  cursor: optDisabled ? "not-allowed" : "pointer",
                  opacity: optDisabled ? 0.6 : 1,
                  fontSize: 13
                }}
              >
                {multiple ? <input type="checkbox" readOnly checked={checked} /> : <span style={{ color: checked ? CL.green : "transparent" }}>✓</span>}
                <span style={{ color: CL.text }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
};
const SelectInput = ({ children, value, onChange, multiple = false, disabled = false, style = {}, name, ...props }) => {
  const options = useMemo(() => {
    const parsed = [];
    const walk = (nodes) => {
      Children.forEach(nodes, (node) => {
        if (!isValidElement(node)) return;
        if (node.type === "option") {
          const raw = node.props.children;
          parsed.push({ value: node.props.value ?? "", label: typeof raw === "string" ? raw : String(raw ?? ""), disabled: node.props.disabled });
          return;
        }
        if (node.props?.children) walk(node.props.children);
      });
    };
    walk(children);
    return parsed;
  }, [children]);

  const placeholder = options.find(opt => opt.value === "")?.label || uiText("Select...");
  const normalizedValue = multiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ?? "");
  const handleChange = (next) => onChange?.({ target: { value: next, name } });

  return (
    <SearchableSelectInput
      options={options}
      value={normalizedValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      multiple={multiple}
      noResultsLabel="No results"
      style={style}
      {...props}
    />
  );
};
const MultiSelectInput = (props) => <SearchableSelectInput {...props} multiple />;
const TextArea = (props) => <textarea {...props} placeholder={uiText(props.placeholder)} style={{ ...inputSt, height: "auto", minHeight: 80, padding: "12px 16px", resize: "vertical", ...(props.style || {}) }} />;
const Badge = ({ children, color = CL.gold }) => <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: color + "20", color }}>{uiText(children)}</span>;
const StatCard = ({ label, value, icon, color = CL.gold }) => (

  <div style={{ ...cardSt, display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 170, borderTop: `3px solid ${color}` }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
    <div><div style={{ fontSize: 12, color: CL.muted, marginBottom: 2 }}>{uiText(label)}</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div></div>
  </div>
);

const MiniBars = ({ title, items = [], accent = CL.gold }) => {
  const max = Math.max(1, ...items.map(item => item.value || 0));
  const chartWidth = 360;
  const chartHeight = 120;
  const xStep = items.length > 1 ? chartWidth / (items.length - 1) : chartWidth;
  const points = items.map((item, index) => {
    const value = item.value || 0;
    const x = items.length > 1 ? index * xStep : chartWidth / 2;
    const y = chartHeight - (value / max) * (chartHeight - 20) - 10;
    return { ...item, x, y, value };
  });
  const linePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ ...cardSt, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: accent }}>{title}</h3>
        <span style={{ fontSize: 11, color: CL.muted }}>{items.reduce((sum, item) => sum + (item.value || 0), 0)} {uiText("total")}</span>
      </div>
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: 130, overflow: "visible" }}>
          <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke={CL.bd} strokeWidth="1" />
          <polyline
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />
          {points.map(point => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="4.5" fill={point.color || accent} />
              <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize="11" fill={CL.text} style={{ fontWeight: 600 }}>
                {point.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))`, gap: 6 }}>
        {items.map(item => (
          <div key={`${item.label}-label`} style={{ textAlign: "center", fontSize: 11, color: CL.muted, lineHeight: 1.3 }}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const ToastMsg = ({ message, type }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, padding: "12px 22px", borderRadius: 10, background: type === "success" ? CL.green : type === "error" ? CL.red : CL.blue, color: CL.white, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,.4)", animation: "slideIn .3s ease" }}>{message}</div>
);

// -- Date Picker Component --
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const DAYS_EN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function DatePicker({ value, onChange, placeholder, style }) {
const { lang } = useI18n();
const [open, setOpen] = useState(false);
const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 280 });
const [viewDate, setViewDate] = useState(() => {
  if (value) { const d = new Date(value + "T00:00:00"); return { year: d.getFullYear(), month: d.getMonth() }; }
  const now = new Date(); return { year: now.getFullYear(), month: now.getMonth() };
});
const ref = useRef(null);
const MONTHS = lang === "en" ? MONTHS_EN : MONTHS_FR;
const DAYS = lang === "en" ? DAYS_EN : DAYS_FR;

useEffect(() => {
  const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);

const openCalendar = () => {
  if (ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const calW = 280;
    const left = rect.left + calW > window.innerWidth ? Math.max(0, window.innerWidth - calW - 8) : rect.left;
    const top = rect.bottom + calW > window.innerHeight ? Math.max(0, rect.top - calW - 4) : rect.bottom + 4;
    setDropPos({ top, left, width: calW });
  }
  if (value) { const d = new Date(value + "T00:00:00"); setViewDate({ year: d.getFullYear(), month: d.getMonth() }); }
  setOpen(o => !o);
};

const prevMonth = () => setViewDate(v => { const d = new Date(v.year, v.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
const nextMonth = () => setViewDate(v => { const d = new Date(v.year, v.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });

const firstDay = new Date(viewDate.year, viewDate.month, 1);
const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
const todayStr = getToday();
const cells = [];
for (let i = 0; i < startDow; i++) cells.push(null);
for (let d = 1; d <= daysInMonth; d++) cells.push(d);

const select = (day) => {
  const y = String(viewDate.year);
  const m = String(viewDate.month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  onChange({ target: { value: `${y}-${m}-${d}` } });
  setOpen(false);
};

const displayValue = value ? (() => { const d = new Date(value + "T00:00:00"); return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; })() : "";

return (
<div ref={ref} style={{ position: "relative", ...style }}>
  <div
    onClick={openCalendar}
    style={{ ...inputSt, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
  >
    <span style={{ color: displayValue ? CL.text : CL.dim }}>{displayValue || (placeholder || (lang === "en" ? "Pick a date..." : "Choisir une date..."))}</span>
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={CL.muted} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  </div>
  {open && (
    <div style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999, background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: 12, width: dropPos.width, boxShadow: "0 8px 32px rgba(0,0,0,.35)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", color: CL.text, cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: 18 }}>‹</button>
        <div style={{ fontWeight: 600, fontSize: 14, color: CL.gold }}>{MONTHS[viewDate.month]} {viewDate.year}</div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", color: CL.text, cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: 18 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: CL.muted, fontWeight: 600, padding: "2px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSelected = dateStr === value;
          const isToday = dateStr === todayStr;
          return (
            <button key={day} onClick={() => select(day)} style={{ padding: "5px 2px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: isSelected ? 700 : 400, background: isSelected ? CL.gold : isToday ? CL.gold + "25" : "transparent", color: isSelected ? CL.bg : isToday ? CL.gold : CL.text, textAlign: "center" }}>{day}</button>
          );
        })}
      </div>
      {value && (
        <button onClick={() => { onChange({ target: { value: "" } }); setOpen(false); }} style={{ marginTop: 8, width: "100%", padding: "6px", background: "none", border: `1px solid ${CL.bd}`, borderRadius: 6, color: CL.muted, fontSize: 12, cursor: "pointer" }}>
          {lang === "en" ? "Clear" : "Effacer"}
        </button>
      )}
    </div>
  )}
</div>
);
}

// Tab bar for forms
const FormTabs = ({ tabs, active, onChange }) => (

  <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${CL.bd}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", color: active === t.id ? CL.gold : CL.muted, fontWeight: active === t.id ? 600 : 400, fontSize: 13, borderBottom: active === t.id ? `2px solid ${CL.gold}` : "2px solid transparent", whiteSpace: "nowrap", flexShrink: 0 }}>{uiText(t.label)}</button>
    ))}
  </div>
);

// -- Excel Export --
const exportExcel = async (data) => {
const ExcelJS = await loadExcelJS();
const wb = new ExcelJS.Workbook();
const addSheet = (name, rows, cols) => {
const ws = wb.addWorksheet(name);
ws.columns = cols.map(c => ({ header: c, key: c, width: Math.max(c.length + 4, 14) }));
ws.addRows(rows.length ? rows : [Object.fromEntries(cols.map(c => [c, ""]))]);
};
const splitIntoChunks = (value, size = 30000) => {
const text = String(value || "");
if (!text) return [];
const chunks = [];
for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
return chunks;
};

addSheet("Employees", data.employees.map(emp => ({ ID: emp.id, Name: emp.name, Username: data.employeeUsernames?.[emp.id] || "", Email: emp.email, Phone: emp.phone, Mobile: emp.phoneMobile || "", Role: emp.role, "Rate": emp.hourlyRate, Address: emp.address, City: emp.city || "", Zip: emp.postalCode || "", Country: emp.country || "", "Start": emp.startDate, "EndDate": emp.contractEndDate || "", Status: emp.status, Contract: emp.contractType || "", IBAN: emp.bankIban || "", SSN: emp.socialSecNumber || "", DOB: emp.dateOfBirth || "", Nationality: emp.nationality || "", Languages: emp.languages || "", Transport: emp.transport || "", "WorkPermit": emp.workPermit || "", "EmergName": emp.emergencyName || "", "EmergPhone": emp.emergencyPhone || "", Password: data.employeePins?.[emp.id] || "0000", LeaveAllowance: emp.leaveAllowance ?? 26, Group: emp.cleanerGroup || "", HiringStage: emp.hiringStage || "hired", Notes: emp.notes || "" })),
["ID","Name","Username","Email","Phone","Mobile","Role","Rate","Address","City","Zip","Country","Start","EndDate","Status","Contract","IBAN","SSN","DOB","Nationality","Languages","Transport","WorkPermit","EmergName","EmergPhone","Password","LeaveAllowance","Group","HiringStage","Notes"]);

addSheet("Clients", data.clients.map(cl => ({ ID: cl.id, Name: cl.name, Contact: cl.contactPerson || "", Email: cl.email, Phone: cl.phone, Mobile: cl.phoneMobile || "", Address: cl.address, "Apt": cl.apartmentFloor || "", City: cl.city || "", Zip: cl.postalCode || "", Country: cl.country || "", Type: cl.type, Freq: cl.cleaningFrequency, Billing: cl.billingType, "Hourly": cl.pricePerHour || 0, "Fixed": cl.priceFixed || 0, Status: cl.status, Lang: cl.language || "", "Code": cl.accessCode || "", "KeyLoc": cl.keyLocation || "", Parking: cl.parkingInfo || "", Pets: cl.petInfo || "", "PrefDay": cl.preferredDay || "", "PrefTime": cl.preferredTime || "", "ContStart": cl.contractStart || "", "ContEnd": cl.contractEnd || "", "SqM": cl.squareMeters || "", "TaxID": cl.taxId || "", "Instructions": cl.specialInstructions || "", PreferredCleaners: (cl.preferredCleanerIds || []).join("|"), Notes: cl.notes || "" })),
["ID","Name","Contact","Email","Phone","Mobile","Address","Apt","City","Zip","Country","Type","Freq","Billing","Hourly","Fixed","Status","Lang","Code","KeyLoc","Parking","Pets","PrefDay","PrefTime","ContStart","ContEnd","SqM","TaxID","Instructions","PreferredCleaners","Notes"]);

addSheet("Schedule", data.schedules.map(sc => { const cl = data.clients.find(c => c.id === sc.clientId); const em = data.employees.find(e => e.id === sc.employeeId); return { ID: sc.id, Date: sc.date, Client: cl?.name || "", CliID: sc.clientId, Employee: em?.name || "", EmpID: sc.employeeId, Start: sc.startTime, End: sc.endTime, Status: sc.status, PaymentStatus: sc.paymentStatus || "unpaid", Notes: sc.notes || "" }; }),
["ID","Date","Client","CliID","Employee","EmpID","Start","End","Status","PaymentStatus","Notes"]);

addSheet("TimeClock", data.clockEntries.map(ce => { const em = data.employees.find(e => e.id === ce.employeeId); const cl = data.clients.find(c => c.id === ce.clientId); const h = calcPayableClockHours(ce, data.schedules, data.clockEntries); return { ID: ce.id, Employee: em?.name || "", EmpID: ce.employeeId, Client: cl?.name || "", CliID: ce.clientId, In: ce.clockIn || "", Out: ce.clockOut || "", Hours: ce.clockOut ? h : "Active", Late: ce.isLate ? "yes" : "no", LateMins: ce.lateMinutes || 0, Note: ce.notes || "", Rate: em?.hourlyRate || 0, Cost: ce.clockOut ? Math.round(h * (em?.hourlyRate || 0) * 100) / 100 : "" }; }),
["ID","Employee","EmpID","Client","CliID","In","Out",uiText("Hours"),"Rate","Cost"]);

const invRows = [];
data.invoices.forEach(inv => { const cl = data.clients.find(c => c.id === inv.clientId); (inv.items || [{}]).forEach((item, idx) => { invRows.push({ "Inv": inv.invoiceNumber, Date: inv.date, Due: inv.dueDate || "", Client: cl?.name || "", CliID: inv.clientId, Status: inv.status, Item: item.description || "", Qty: item.quantity || "", Price: item.unitPrice || "", LineTotal: item.total || "", Sub: idx === 0 ? inv.subtotal : "", "VAT%": idx === 0 ? inv.vatRate : "", VAT: idx === 0 ? inv.vatAmount : "", Total: idx === 0 ? inv.total : "", Notes: idx === 0 ? (inv.notes || "") : "" }); }); });
addSheet("Invoices", invRows, ["Inv","Date","Due","Client","CliID","Status","Item","Qty","Price","LineTotal","Sub","VAT%","VAT","Total","Notes"]);

addSheet("Payslips", data.payslips.map(ps => { const em = data.employees.find(e => e.id === ps.employeeId); return { Num: ps.payslipNumber, Employee: em?.name || "", EmpID: ps.employeeId, Month: ps.month, Hours: ps.totalHours, Rate: ps.hourlyRate, Gross: ps.grossPay, Social: ps.socialCharges, Tax: ps.taxEstimate, Net: ps.netPay, Status: ps.status }; }),
["Num","Employee","EmpID","Month",uiText("Hours"),"Rate","Gross","Social","Tax","Net","Status"]);

const formatSettingCell = (value) => {
  if (value == null) return "";
  if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value);
  return String(value);
};
const settingsRows = Object.entries(data.settings || {})
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => ({ Key: key, Val: formatSettingCell(value) }));
addSheet("Settings", [
  ...settingsRows,
  { Key: "ownerUsername", Val: data.ownerUsername || "" },
  { Key: "ownerPin", Val: data.ownerPin || "" },
  { Key: "managerUsername", Val: data.managerUsername || "" },
  { Key: "managerPin", Val: data.managerPin || "" },
], ["Key", "Val"]);

const months = [...new Set(data.clockEntries.filter(c => c.clockOut && c.clockIn).map(c => c.clockIn.slice(0, 7)))].sort();
addSheet("Summary", months.map(mo => {
const ents = data.clockEntries.filter(c => c.clockOut && toLocalDateKey(c.clockIn).startsWith(mo));
const totalH = ents.reduce((sum, ce) => sum + calcPayableClockHours(ce, data.schedules, ents), 0);
const laborCost = ents.reduce((sum, ce) => { const em = data.employees.find(x => x.id === ce.employeeId); return sum + calcPayableClockHours(ce, data.schedules, ents) * (em?.hourlyRate || 0); }, 0);
const revenue = data.invoices.filter(inv => inv.date?.startsWith(mo)).reduce((sum, inv) => sum + (inv.total || 0), 0);
return { Month: mo, Hours: Math.round(totalH * 100) / 100, Labor: Math.round(laborCost * 100) / 100, Revenue: Math.round(revenue * 100) / 100, Profit: Math.round((revenue - laborCost) * 100) / 100 };
}), ["Month", uiText("Hours"), "Labor", uiText("Revenue"), uiText("Profit")]);

const fullBackupPayload = {
...data,
settings: normalizeSettingsPayload(data.settings || {}, DEFAULTS.settings),
};
const backupChunks = splitIntoChunks(JSON.stringify(fullBackupPayload));
addSheet("FullBackupJSON", backupChunks.map((chunk, idx) => ({ Part: idx + 1, JSONChunk: chunk })), ["Part", "JSONChunk"]);

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
const ExcelJS = await loadExcelJS();
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

  const backupRows = sheet("FullBackupJSON");
  if (backupRows.length) {
    try {
      const backupJson = backupRows
        .sort((a, b) => Number(a.Part || 0) - Number(b.Part || 0))
        .map(r => String(r.JSONChunk || ""))
        .join("");
      const parsedBackup = JSON.parse(backupJson);

      const importedSnapshot = {
        ...(parsedBackup || {}),
        settings: normalizeSettingsPayload(parsedBackup?.settings || {}, DEFAULTS.settings),
        employeePins: parsedBackup?.employeePins && typeof parsedBackup.employeePins === "object" ? parsedBackup.employeePins : {},
        employeeUsernames: parsedBackup?.employeeUsernames && typeof parsedBackup.employeeUsernames === "object" ? parsedBackup.employeeUsernames : {},
      };

      setData(prev => ({
        ...prev,
        ...importedSnapshot,
      }));

      await syncImportedDataToDb(importedSnapshot);
      showToast("Excel imported and synced to database!", "success");
      return;
    } catch (backupErr) {
      console.warn("Full backup import failed, falling back to legacy sheets", backupErr);
    }
  }

  const emps = sheet("Employees").filter(r => r.ID && r.Name).map(r => ({ id: r.ID, name: r.Name, email: r.Email || "", phone: r.Phone || "", phoneMobile: r.Mobile || "", role: r.Role || "Cleaner", hourlyRate: parseFloat(r.Rate) || 15, address: r.Address || "", city: r.City || "", postalCode: r.Zip || "", country: r.Country || "Luxembourg", startDate: r.Start || getToday(), contractEndDate: r.EndDate || "", status: r.Status || "active", contractType: r.Contract || "CDI", bankIban: r.IBAN || "", socialSecNumber: r.SSN || "", dateOfBirth: r.DOB || "", nationality: r.Nationality || "", languages: r.Languages || "", transport: r.Transport || "", workPermit: r.WorkPermit || "", emergencyName: r.EmergName || "", emergencyPhone: r.EmergPhone || "", leaveAllowance: parseInt(r.LeaveAllowance || "26", 10) || 26, cleanerGroup: r.Group || "", hiringStage: r.HiringStage || "hired", notes: r.Notes || "" }));
  const pins = {}; sheet("Employees").filter(r => r.ID).forEach(r => { pins[r.ID] = String(r.Password || r.PIN || "0000"); });
  const employeeUsernames = {}; sheet("Employees").filter(r => r.ID && r.Username).forEach(r => { employeeUsernames[r.ID] = String(r.Username); });

  const clients = sheet("Clients").filter(r => r.ID && r.Name).map(r => ({ id: r.ID, name: r.Name, contactPerson: r.Contact || "", email: r.Email || "", phone: r.Phone || "", phoneMobile: r.Mobile || "", address: r.Address || "", apartmentFloor: r.Apt || "", city: r.City || "", postalCode: r.Zip || "", country: r.Country || "Luxembourg", type: r.Type || "Residential", cleaningFrequency: r.Freq || "Weekly", billingType: r.Billing || "hourly", pricePerHour: parseFloat(r.Hourly) || 35, priceFixed: parseFloat(r.Fixed) || 0, status: r.Status || "active", language: r.Lang || "FR", accessCode: r.Code || "", keyLocation: r.KeyLoc || "", parkingInfo: r.Parking || "", petInfo: r.Pets || "", preferredDay: r.PrefDay || "", preferredTime: r.PrefTime || "", contractStart: r.ContStart || "", contractEnd: r.ContEnd || "", squareMeters: r.SqM || "", taxId: r.TaxID || "", specialInstructions: r.Instructions || "", preferredCleanerIds: String(r.PreferredCleaners || "").split("|").map(v => v.trim()).filter(Boolean), notes: r.Notes || "" }));

  const scheds = sheet("Schedule").filter(r => r.ID).map(r => ({ id: r.ID, date: r.Date || "", clientId: r.CliID || "", employeeId: r.EmpID || "", startTime: r.Start || "08:00", endTime: r.End || "12:00", status: r.Status || "scheduled", paymentStatus: r.PaymentStatus || "unpaid", notes: r.Notes || "", recurrence: "none" }));
  const clocks = sheet("TimeClock").filter(r => r.ID).map(r => ({ id: r.ID, employeeId: r.EmpID || "", clientId: r.CliID || "", clockIn: r.In || "", clockOut: r.Out || null, notes: r.Note || "", isLate: String(r.Late || "").toLowerCase() === "yes", lateMinutes: parseFloat(r.LateMins) || 0 }));

  const invMap = {};
  sheet("Invoices").filter(r => r.Inv).forEach(r => {
    if (!invMap[r.Inv]) invMap[r.Inv] = { id: makeId(), invoiceNumber: r.Inv, date: r.Date || "", dueDate: r.Due || "", clientId: r.CliID || "", status: r.Status || "draft", items: [], subtotal: parseFloat(r.Sub) || 0, vatRate: parseFloat(r["VAT%"]) || 17, vatAmount: parseFloat(r.VAT) || 0, total: parseFloat(r.Total) || 0, notes: r.Notes || "", paymentTerms: "Due within 30 days." };
    if (r.Item) invMap[r.Inv].items.push({ description: r.Item, quantity: parseFloat(r.Qty) || 1, unitPrice: parseFloat(r.Price) || 0, total: parseFloat(r.LineTotal) || 0 });
  });

  const payslips = sheet("Payslips").filter(r => r.Num).map(r => ({ id: makeId(), payslipNumber: r.Num, employeeId: r.EmpID || "", month: r.Month || "", totalHours: parseFloat(r.Hours) || 0, hourlyRate: parseFloat(r.Rate) || 0, grossPay: parseFloat(r.Gross) || 0, socialCharges: parseFloat(r.Social) || 0, taxEstimate: parseFloat(r.Tax) || 0, netPay: parseFloat(r.Net) || 0, status: r.Status || "draft", createdAt: new Date().toISOString() }));

  const sett = {};
  sheet("Settings").forEach(r => {
    if (!r.Key) return;
    sett[String(r.Key)] = r.Val;
  });

  const parseSettingValue = (value) => {
    if (value == null || value === "") return value;
    if (typeof value === "number" || typeof value === "boolean") return value;
    const raw = String(value).trim();
    if (raw === "") return "";
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
    if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
      try { return JSON.parse(raw); } catch { return raw; }
    }
    return raw;
  };

  const importedSettings = {};
  Object.entries(sett).forEach(([key, val]) => {
    const isCredential = ["ownerUsername", "ownerPin", "managerUsername", "managerPin"].includes(key);
    if (!isCredential) importedSettings[key] = parseSettingValue(val);
  });

  const ownerUsername = sett.ownerUsername || sett["Owner Username"];
  const ownerPin = sett.ownerPin || sett["Owner Password"] || sett["Owner PIN"];
  const managerUsername = sett.managerUsername || sett["Manager Username"];
  const managerPin = sett.managerPin || sett["Manager Password"] || sett["Manager PIN"];

  const importedSnapshot = {
    employees: emps.length ? emps : [],
    employeePins: pins,
    employeeUsernames,
    clients: clients.length ? clients : [],
    schedules: scheds.length ? scheds : [],
    clockEntries: clocks.length ? clocks : [],
    invoices: Object.values(invMap),
    payslips: payslips.length ? payslips : [],
    ownerUsername: ownerUsername || "",
    ownerPin: ownerPin || "",
    managerUsername: managerUsername || "",
    managerPin: managerPin || "",
    settings: normalizeSettingsPayload({
      ...importedSettings,
      companyName: importedSettings.companyName || importedSettings["Company Name"] || DEFAULTS.settings.companyName,
      companyAddress: importedSettings.companyAddress || importedSettings.Address || DEFAULTS.settings.companyAddress,
      companyEmail: importedSettings.companyEmail || importedSettings.Email || DEFAULTS.settings.companyEmail,
      companyPhone: importedSettings.companyPhone || importedSettings.Phone || DEFAULTS.settings.companyPhone,
      vatNumber: importedSettings.vatNumber || importedSettings["VAT Number"] || DEFAULTS.settings.vatNumber,
      bankIban: importedSettings.bankIban || importedSettings["Bank IBAN"] || DEFAULTS.settings.bankIban,
      defaultVatRate: importedSettings.defaultVatRate ?? importedSettings["VAT Rate"] ?? DEFAULTS.settings.defaultVatRate,
    }, DEFAULTS.settings),
  };

  setData(prev => ({
    ...prev,
    employees: importedSnapshot.employees,
    employeePins: importedSnapshot.employeePins,
    employeeUsernames: importedSnapshot.employeeUsernames,
    clients: importedSnapshot.clients,
    schedules: importedSnapshot.schedules,
    clockEntries: importedSnapshot.clockEntries,
    invoices: importedSnapshot.invoices,
    payslips: importedSnapshot.payslips,
    ownerUsername: importedSnapshot.ownerUsername || "",
    ownerPin: importedSnapshot.ownerPin || "",
    managerUsername: importedSnapshot.managerUsername || "",
    managerPin: importedSnapshot.managerPin || "",
    settings: importedSnapshot.settings,
  }));

  await syncImportedDataToDb(importedSnapshot);
  showToast("Excel imported and synced to database!", "success");
} catch (err) { console.error(err); showToast("Import failed", "error"); }
};

// ==============================================
// GLOBAL CSS
// ==============================================
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Cormorant+Garamond:wght@600;700&display=swap');
:root { --bd: Outfit, sans-serif; --hd: Cormorant Garamond, serif; }

* { box-sizing: border-box; margin: 0; padding: 0; }
  body { line-height: 1.45; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: ${CL.bd}; border-radius: 3px; }
  @keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  input:focus, select:focus, textarea:focus { border-color: ${CL.gold} !important; }
  input[type="date"], input[type="time"], input[type="month"], input[type="datetime-local"] { color-scheme: ${INIT_THEME === "dark" ? "dark" : "light"}; }
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator,
  input[type="month"]::-webkit-calendar-picker-indicator,
  input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: ${INIT_THEME === "dark" ? "invert(0.95)" : "none"}; cursor: pointer; }
  input[type="date"], input[type="time"], input[type="month"], input[type="datetime-local"], input[type="number"], input[type="text"], input[type="email"], input[type="password"], input[type="tel"], select { height: 46px !important; padding: 0 16px !important; line-height: 46px; }
  select { color-scheme: ${INIT_THEME === "dark" ? "dark" : "light"}; }
  select option { background: ${CL.sf}; color: ${CL.text}; }
  select[multiple] { height: auto !important; min-height: 120px; padding: 8px 12px !important; line-height: 1.35; }
  textarea { padding: 12px 16px !important; height: auto !important; min-height: 80px; }
  @media print { .no-print { display: none !important; } }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: end; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
.grid-span-2 { grid-column: span 2; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-row { display: flex; gap: 16px; flex-wrap: wrap; }
.sched-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-layout { display: flex; gap: 22px; flex-wrap: wrap; }
.cal-main { flex: 1 1 600px; min-width: 0; }
.cal-side { flex: 0 0 280px; min-width: 240px; }
.tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.tbl-wrap table { min-width: 680px; }
.tbl-wrap .employees-table { min-width: 1200px; width: 100%; table-layout: auto; }
.tbl-wrap .employees-table th,
.tbl-wrap .employees-table td { vertical-align: top; }
.tbl-wrap .employees-table th { white-space: nowrap; }
.tbl-wrap .employees-table .emp-name-cell { min-width: 220px; }
.tbl-wrap .employees-table thead .emp-name-cell {
  position: sticky;
  left: 0;
  z-index: 4;
  background: ${CL.sf};
  box-shadow: 1px 0 0 ${CL.bd};
}
.tbl-wrap .employees-table tbody .emp-name-cell {
  position: sticky;
  left: 0;
  z-index: 2;
  background: ${CL.sf};
  box-shadow: 1px 0 0 ${CL.bd};
}
.tbl-wrap .employees-table tbody tr:hover .emp-name-cell { background: ${CL.s2}; }
.tbl-wrap .employees-table .emp-location-cell { min-width: 150px; }
.tbl-wrap .employees-table .emp-role-cell { min-width: 130px; white-space: nowrap; }
.tbl-wrap .employees-table .emp-rate-cell { min-width: 100px; white-space: nowrap; }
.tbl-wrap .employees-table .emp-contact-cell { min-width: 190px; }
.tbl-wrap .employees-table .emp-stage-cell,
.tbl-wrap .employees-table .emp-assigned-cell,
.tbl-wrap .employees-table .emp-status-cell { min-width: 110px; white-space: nowrap; }
.tbl-wrap .employees-table .emp-username-cell { min-width: 210px; }
.tbl-wrap .employees-table .emp-password-cell { min-width: 90px; white-space: nowrap; }
.tbl-wrap .employees-table .emp-actions-cell { min-width: 95px; white-space: nowrap; }
.tbl-wrap .employees-table .emp-code {
  display: inline-block;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.35;
}
.tbl-wrap .employees-table tbody tr:hover { background: ${CL.s2}; }
.modal-normal { width: 820px; max-width: 96vw; max-height: 92vh; padding: 36px !important; }
.modal-wide { width: 1100px; max-width: 96vw; max-height: 92vh; padding: 42px !important; }
.desk-sidebar { display: flex; }
.mob-nav { display: none; }
.main-content { padding: 34px 30px; }

@media (max-width: 1024px) {
.sched-grid { grid-template-columns: repeat(7, 1fr); }
.cal-side { flex: 0 0 100%; }
.grid-3 { grid-template-columns: repeat(2, 1fr); }
.main-content { padding: 24px 20px 90px 20px; }
.grid-2 { gap: 16px; }
.stat-row { gap: 12px; }
.stat-row > div { min-width: calc(50% - 8px) !important; flex: 1 1 calc(50% - 8px) !important; }
}
@media (max-width: 768px) {
.desk-sidebar { display: none !important; }
.mob-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 900; background: ${CL.sf}; border-top: 1px solid ${CL.bd}; padding: 4px 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.mob-nav button { flex: none; padding: 6px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px; border: none; background: transparent; cursor: pointer; font-size: 9px; min-width: 52px; white-space: nowrap; font-family: 'Outfit', sans-serif; }
.main-content { padding: 16px 12px 86px 12px; }
.grid-2, .form-grid { grid-template-columns: 1fr; }
.grid-span-2 { grid-column: span 1; }
.stat-row > div { min-width: calc(50% - 8px) !important; flex: 1 1 calc(50% - 8px) !important; }
.modal-normal, .modal-wide { width: 100% !important; max-width: 100vw !important; max-height: 100vh !important; border-radius: 0 !important; padding: 22px !important; }
.modal-overlay { padding: 0 !important; }
.action-btn-row button { min-height: 38px; min-width: 38px; padding: 6px 10px !important; font-size: 12px !important; }
.email-template-btns button { min-height: 40px; padding: 8px 14px !important; font-size: 13px !important; flex: 1 1 auto; }
.email-modal-textarea { min-height: 140px !important; }
.email-modal-footer { flex-wrap: wrap; }
.email-modal-footer button { flex: 1 1 auto; min-height: 44px; justify-content: center; }
}
@media (max-width: 480px) {
.sched-grid { grid-template-columns: repeat(7, 1fr); }
.grid-3 { grid-template-columns: 1fr; }
.stat-row > div { min-width: 100% !important; flex: 1 1 100% !important; }
.main-content { padding: 14px 10px 82px 10px; }
.modal-overlay { padding: 0 !important; }
.action-btn-row button { min-height: 36px; padding: 5px 8px !important; font-size: 11px !important; }
.email-template-btns { flex-direction: column; gap: 6px !important; }
.email-template-btns button { width: 100%; min-height: 42px; justify-content: center; }
.email-modal-textarea { min-height: 120px !important; }
.email-modal-footer { flex-direction: column; gap: 8px !important; }
.email-modal-footer button { width: 100%; min-height: 46px; justify-content: center; }
}

/* Cleaner calendar mobile fixes */
.cleaner-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.cleaner-cal-grid .cal-hdr { text-align: center; padding: 6px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; }
.cleaner-cal-cell { min-height: 62px; padding: 4px; border-radius: 6px; cursor: pointer; transition: all 0.12s; overflow: hidden; }
.cleaner-cal-cell .day-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.cleaner-cal-cell .day-num { font-size: 12px; line-height: 1; }
.cleaner-cal-cell .day-badge { font-size: 9px; padding: 1px 4px; border-radius: 8px; font-weight: 700; line-height: 1.2; flex-shrink: 0; }
.cleaner-cal-cell .cal-evt { padding: 1px 3px; margin-bottom: 1px; border-radius: 3px; font-size: 9px; border-left-width: 3px; border-left-style: solid; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; line-height: 1.35; }
.cleaner-cal-cell .cal-evt .evt-time { font-weight: 600; }
.cleaner-cal-cell .cal-evt .evt-name { font-size: 8px; }
@media (max-width: 768px) {
  .cleaner-cal-grid { gap: 2px; }
  .cleaner-cal-cell { min-height: 56px; padding: 3px; }
  .cleaner-cal-cell .day-num { font-size: 11px; }
  .cleaner-cal-cell .cal-evt { font-size: 8px; padding: 1px 2px; border-left-width: 2px; }
  .cleaner-cal-cell .cal-evt .evt-name { display: none; }
}
@media (max-width: 380px) {
  .cleaner-cal-grid { gap: 1px; }
  .cleaner-cal-cell { min-height: 48px; padding: 2px; }
  .cleaner-cal-cell .day-num { font-size: 10px; }
  .cleaner-cal-cell .day-badge { font-size: 8px; padding: 0px 3px; }
  .cleaner-cal-cell .cal-evt { font-size: 7px; padding: 1px 2px; }
  .cleaner-cal-hdr { font-size: 9px !important; padding: 4px 0 !important; }
  .cleaner-portal-content { padding: 10px 6px !important; }
}
`;

// ==============================================
// MAIN APP
// ==============================================
function LanguageSwitcher({ compact = false }) {
const { lang, setLang, t } = useI18n();
return (
<div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
<button style={{ ...btnSec, ...btnSm, background: lang === "fr" ? CL.gold + "20" : CL.s2, color: lang === "fr" ? CL.gold : CL.text }} onClick={() => setLang("fr")}>{t("french")}</button>
<button style={{ ...btnSec, ...btnSm, background: lang === "en" ? CL.gold + "20" : CL.s2, color: lang === "en" ? CL.gold : CL.text }} onClick={() => setLang("en")}>{t("english")}</button>
</div>
);
}

function ThemeToggle() {
const isDark = INIT_THEME === "dark";
const toggle = () => { saveTheme(isDark ? "light" : "dark"); window.location.reload(); };
return (
<button
  onClick={toggle}
  title={isDark ? "Switch to light theme" : "Switch to dark theme"}
  style={{ ...btnSec, ...btnSm, padding: "6px 10px", display: "inline-flex", alignItems: "center", gap: 6 }}
>
  {isDark
    ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  }
</button>
);
}

export default function App() {
const [data, setData] = useState(() => DEFAULTS);
const [lang, setLang] = useState(() => loadLang());
const [auth, setAuth] = useState(() => {
  try { const s = sessionStorage.getItem("lux_auth"); return s ? JSON.parse(s) : null; } catch { return null; }
});
const [toast, setToast] = useState(null);
const [section, setSection] = useState("dashboard");
const [devisSeed, setDevisSeed] = useState(null);
const [sideOpen, setSideOpen] = useState(true);
const [emailConfigured, setEmailConfigured] = useState(true);
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

useEffect(() => {
  const mapEmployee = (e) => ({
    id: e.id,
    name: e.name,
    email: e.email || "",
    phone: e.phone || "",
    phoneMobile: e.phone_mobile || "",
    role: e.role || "Cleaner",
    hourlyRate: Number(e.hourly_rate) || 15,
    address: e.address || "",
    city: e.city || "",
    postalCode: e.postal_code || "",
    country: e.country || "Luxembourg",
    startDate: e.start_date || "",
    contractEndDate: e.contract_end_date || "",
    status: e.status || "active",
    contractType: e.contract_type || "CDI",
    bankIban: e.bank_iban || "",
    socialSecNumber: e.social_sec_number || "",
    dateOfBirth: e.date_of_birth || "",
    nationality: e.nationality || "",
    languages: e.languages || "",
    transport: e.transport || "",
    workPermit: e.work_permit || "",
    emergencyName: e.emergency_name || "",
    emergencyPhone: e.emergency_phone || "",
    notes: e.notes || "",
    weeklyHours: Number(e.weekly_hours) || 0,
    profilePicture: e.profile_picture || "",
  });
  const mapClient = (c) => {
    const meta = (c && typeof c.meta === "object" && c.meta) ? c.meta : {};
    return ({
    id: c.id,
    name: c.name,
    contactPerson: c.contact_person || "",
    email: c.email || "",
    phone: c.phone || "",
    phoneMobile: c.phone_mobile || "",
    address: c.address || "",
    apartmentFloor: c.apartment_floor || "",
    city: c.city || "",
    postalCode: c.postal_code || "",
    country: c.country || "Luxembourg",
    region: String(meta.region || ""),
    type: c.type || "Residential",
    cleaningFrequency: c.cleaning_frequency || "Weekly",
    billingType: c.billing_type || "hourly",
    pricePerHour: Number(c.price_per_hour) || 0,
    priceFixed: Number(c.price_fixed) || 0,
    status: c.status || "active",
    language: c.language || "FR",
    accessCode: c.access_code || "",
    keyLocation: c.key_location || "",
    parkingInfo: c.parking_info || "",
    petInfo: c.pet_info || "",
    preferredDay: c.preferred_day || "",
    preferredTime: c.preferred_time || "",
    preferredDays: Array.isArray(meta.preferredDays) ? meta.preferredDays : [],
    contractStart: c.contract_start || "",
    contractEnd: c.contract_end || "",
    squareMeters: Number(c.square_meters) || 0,
    taxId: c.tax_id || "",
    specialInstructions: c.special_instructions || "",
    notes: c.notes || "",
    preferredCleanerIds: Array.isArray(meta.preferredCleanerIds) ? meta.preferredCleanerIds : [],
    hoursPerSession: Number(meta.hoursPerSession) || 0,
    forfaitLabel: String(meta.forfaitLabel || ""),
    forfaitPrice: Number(meta.forfaitPrice) || 0,
    forfaitPeriod: String(meta.forfaitPeriod || "monthly"),
    forfaitIncludedHours: Number(meta.forfaitIncludedHours) || 0,
  });
  };
  const mapSchedule = (s) => ({
    id: s.id,
    date: normalizeDateOnly(s.date),
    clientId: s.client_id,
    employeeId: s.employee_id,
    startTime: s.start_time || "08:00",
    endTime: s.end_time || "12:00",
    status: s.status || "scheduled",
    paymentStatus: s.payment_status || "unpaid",
    notes: s.notes || "",
    recurrence: s.recurrence || "none",
  });
  const mapClock = (c) => ({
    id: c.id,
    employeeId: c.employee_id,
    clientId: c.client_id,
    clockIn: c.clock_in,
    clockOut: c.clock_out,
    notes: c.notes || "",
    isLate: false,
    lateMinutes: 0,
  });
  const mapInvoice = (inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    date: inv.date,
    dueDate: inv.due_date || "",
    clientId: inv.client_id,
    status: inv.status || "draft",
    items: Array.isArray(inv.items) ? inv.items : [],
    subtotal: Number(inv.subtotal) || 0,
    vatRate: Number(inv.vat_rate) || 0,
    vatAmount: Number(inv.vat_amount) || 0,
    total: Number(inv.total) || 0,
    notes: inv.notes || "",
    paymentTerms: inv.payment_terms || "",
  });
  const mapPayslip = (ps) => ({
    id: ps.id,
    payslipNumber: ps.payslip_number,
    employeeId: ps.employee_id,
    month: ps.month,
    periodStart: ps.period_start || "",
    periodEnd: ps.period_end || "",
    totalHours: Number(ps.total_hours) || 0,
    hourlyRate: Number(ps.hourly_rate) || 0,
    grossPay: Number(ps.gross_pay) || 0,
    socialCharges: Number(ps.social_charges) || 0,
    taxEstimate: Number(ps.tax_estimate) || 0,
    netPay: Number(ps.net_pay) || 0,
    hourBreakdown: Array.isArray(ps.hour_breakdown) ? ps.hour_breakdown : [],
    status: ps.status || "draft",
  });

  const loadFromDb = async () => {
    if (!API_BASE_CANDIDATES.length) return;
    try {
      let responses = null;
      for (const base of API_BASE_CANDIDATES) {
        const current = await Promise.all([
          fetch(apiUrl('/api/employees', base), { cache: 'no-store' }),
          fetch(apiUrl('/api/clients', base), { cache: 'no-store' }),
          fetch(apiUrl('/api/schedules', base), { cache: 'no-store' }),
          fetch(apiUrl('/api/clock-entries', base), { cache: 'no-store' }),
          fetch(apiUrl('/api/invoices', base), { cache: 'no-store' }),
          fetch(apiUrl('/api/payslips', base), { cache: 'no-store' }),
          fetch(apiUrl('/api/settings', base), { cache: 'no-store' }),
          fetch(apiUrl('/api/email-status', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/quotes', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/photo-uploads', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/time-off-requests', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/inventory-products', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/product-requests', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/cleaner-product-holdings', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/prospect-visits', base), { cache: 'no-store' }).catch(() => null),
          fetch(apiUrl('/api/expenses', base), { cache: 'no-store' }).catch(() => null),
        ]);
        const [employeesRes, clientsRes, schedulesRes, clocksRes, invoicesRes, payslipsRes, settingsRes] = current;
        if ([employeesRes, clientsRes, schedulesRes, clocksRes, invoicesRes, payslipsRes, settingsRes].every(r => r?.ok)) {
          responses = current;
          break;
        }
      }

      if (!responses) throw new Error('Unable to load from any configured API base');

      const [employeesRes, clientsRes, schedulesRes, clocksRes, invoicesRes, payslipsRes, settingsRes, emailStatusRes,
             quotesRes, photoUploadsRes, timeOffRes, inventoryRes, productRequestsRes, holdingsRes, visitsRes, expensesRes] = responses;

      if (![employeesRes, clientsRes, schedulesRes, clocksRes, invoicesRes, payslipsRes, settingsRes].every(r => r.ok)) return;

      if (emailStatusRes && emailStatusRes.ok) {
        const emailStatus = await emailStatusRes.json().catch(() => null);
        if (emailStatus) setEmailConfigured(!!emailStatus.configured);
      }

      const [employeesRows, clientsRows, schedulesRows, clocksRows, invoicesRows, payslipsRows, settingsRows] = await Promise.all([
        employeesRes.json(),
        clientsRes.json(),
        schedulesRes.json(),
        clocksRes.json(),
        invoicesRes.json(),
        payslipsRes.json(),
        settingsRes.json(),
      ]);

      const safeJson = async (res) => { try { return res && res.ok ? await res.json() : []; } catch { return []; } };
      const [quotesRows, photoRows, timeOffRows, inventoryRows, productReqRows, holdingsRows, visitsRows, expensesRows] = await Promise.all([
        safeJson(quotesRes), safeJson(photoUploadsRes), safeJson(timeOffRes),
        safeJson(inventoryRes), safeJson(productRequestsRes), safeJson(holdingsRes),
        safeJson(visitsRes), safeJson(expensesRes),
      ]);

      const mapQuote = (q) => ({
        id: q.id, quoteNumber: q.quote_number, date: q.date, clientId: q.client_id || "",
        status: q.status || "draft", items: Array.isArray(q.items) ? q.items : [],
        subtotal: Number(q.subtotal) || 0, vatRate: Number(q.vat_rate) || 17,
        vatAmount: Number(q.vat_amount) || 0, total: Number(q.total) || 0,
        notes: q.notes || "", pricingMode: q.pricing_mode || "hours",
        jobSchedule: q.job_schedule || {}, visibleColumns: q.visible_columns || {},
      });
      const mapPhotoUpload = (p) => ({
        id: p.id, employeeId: p.employee_id || "", clientId: p.client_id || "",
        clockEntryId: p.clock_entry_id || "", fileName: p.file_name || "",
        imageData: p.image_data || "", note: p.note || "",
        type: p.type || "issue", seenByOwner: !!p.seen_by_owner,
        createdAt: p.created_at || "",
      });
      const mapTimeOff = (r) => ({
        id: r.id, employeeId: r.employee_id || "", startDate: r.start_date || "",
        endDate: r.end_date || "", requestedDays: Number(r.requested_days) || 1,
        reason: r.reason || "", leaveType: r.leave_type || "conge",
        status: r.status || "pending", reviewedAt: r.reviewed_at || null,
        reviewedBy: r.reviewed_by || null, reviewNote: r.review_note || "",
        createdAt: r.created_at || "",
      });
      const mapInventoryProduct = (p) => ({
        id: p.id, name: p.name, unit: p.unit || "bottles",
        stock: Number(p.stock) || 0, minStock: Number(p.min_stock) || 0,
        note: p.note || "", active: p.active !== false,
      });
      const mapProductRequest = (r) => ({
        id: r.id, employeeId: r.employee_id || "", productId: r.product_id || "",
        quantity: Number(r.quantity) || 1, note: r.note || "",
        deliveryAt: r.delivery_at || "", status: r.status || "pending",
        approvedQty: Number(r.approved_qty) || 0, deliveredQty: Number(r.delivered_qty) || 0,
        createdAt: r.created_at || "",
      });
      const mapHolding = (h) => ({
        id: h.id, employeeId: h.employee_id || "", productId: h.product_id || "",
        qtyInHand: Number(h.qty_in_hand) || 0, updatedAt: h.updated_at || "",
      });
      const mapVisit = (v) => ({
        id: v.id, clientId: v.client_id || "", visitDate: v.visit_date || "",
        visitTime: v.visit_time || "", address: v.address || "",
        notes: v.notes || "", status: v.status || "planned",
        photos: Array.isArray(v.photos) ? v.photos : [],
        createdAt: v.created_at || "",
      });
      const mapExpense = (e) => ({
        id: e.id, name: e.name, amount: Number(e.amount) || 0,
        dueDay: Number(e.due_day) || 1, category: e.category || "other",
        frequency: e.frequency || "monthly",
        startDate: e.start_date || "",
        endDate: e.end_date || "",
        notes: e.note || e.notes || "", isActive: e.is_active !== false,
        payments: Array.isArray(e.payments) ? e.payments : [],
      });

      const employeePins = Object.fromEntries((employeesRows || []).map(e => [e.id, String(e.pin || '0000')]));
      const employeeUsernames = Object.fromEntries((employeesRows || []).map(e => [e.id, String(e.username || '').toLowerCase()]));

      const mappedSchedules = (schedulesRows || []).map(mapSchedule);
      const mappedClocks = (clocksRows || []).map(mapClock);
      setData(prev => ({
        ...prev,
        employees: (employeesRows || []).map(mapEmployee),
        clients: (clientsRows || []).map(mapClient),
        schedules: syncSchedulesWithClockEntries(mappedSchedules, mappedClocks),
        clockEntries: mappedClocks,
        invoices: (invoicesRows || []).map(mapInvoice),
        payslips: (payslipsRows || []).map(mapPayslip),
        quotes: (quotesRows || []).map(mapQuote),
        photoUploads: (photoRows || []).map(mapPhotoUpload),
        timeOffRequests: (timeOffRows || []).map(mapTimeOff),
        inventoryProducts: (inventoryRows || []).map(mapInventoryProduct),
        productRequests: (productReqRows || []).map(mapProductRequest),
        cleanerProductHoldings: (holdingsRows || []).map(mapHolding),
        prospectVisits: (visitsRows || []).map(mapVisit),
        expenses: (expensesRows || []).map(mapExpense),
        employeePins,
        employeeUsernames,
        settings: normalizeSettingsPayload(settingsRows || {}, prev.settings),
      }));
    } catch (err) {
      console.error("Failed to load data from DB", err);
      showToast("Unable to load data from database", "error");
    }
  };

  void loadFromDb();
}, []);

CURRENT_LANG = lang; // sync before any child render
useEffect(() => { saveLang(lang); }, [lang]);
useEffect(() => {
  try {
    if (auth) {
      sessionStorage.setItem("lux_auth", JSON.stringify(auth));
      // Sync lang preference from DB value returned at login
      if (auth.lang && auth.lang !== lang) setLang(auth.lang);
      // If theme from DB differs from current, reload to apply it
      if (auth.theme && auth.theme !== INIT_THEME) window.location.reload();
    } else {
      sessionStorage.removeItem("lux_auth");
    }
  } catch {}
}, [auth]); // eslint-disable-line react-hooks/exhaustive-deps
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

// Handle password reset link from email (?resetToken=...&resetEmail=...)
const urlParams = new URLSearchParams(window.location.search);
const urlResetToken = urlParams.get("resetToken");
const urlResetEmail = urlParams.get("resetEmail");

// Handle email verification link from registration email (/verify-email?email=...&token=...)
const isVerifyEmailPage = window.location.pathname === "/verify-email";
const urlVerifyEmail = urlParams.get("email") || "";
const urlVerifyToken = urlParams.get("token") || "";
if (!auth && isVerifyEmailPage && urlVerifyToken) {
  return <LanguageContext.Provider value={{ lang, setLang, t }}><EmailVerificationScreen email={urlVerifyEmail} token={urlVerifyToken} /></LanguageContext.Provider>;
}

if (!auth && urlResetToken && urlResetEmail) {
  return <LanguageContext.Provider value={{ lang, setLang, t }}><ResetPasswordScreen token={urlResetToken} email={urlResetEmail} /></LanguageContext.Provider>;
}

if (!auth) return <LanguageContext.Provider value={{ lang, setLang, t }}><LoginScreen data={data} onAuth={setAuth} /></LanguageContext.Provider>;
if (auth.role === "cleaner") return <LanguageContext.Provider value={{ lang, setLang, t }}><CleanerPortal data={data} updateData={updateData} auth={auth} onLogout={() => setAuth(null)} showToast={showToast} toast={toast} /></LanguageContext.Provider>;

// Owner nav items
const pendingProductRequests = (data.productRequests || []).filter(r => r.status === "pending").length;
const pendingTimeOffRequests = (data.timeOffRequests || []).filter(r => r.status === "pending").length;
const unseenUploads = (data.photoUploads || []).filter(u => !u.seenByOwner).length;
const _expCurrentMonth = getToday().slice(0, 7);
const _expTodayDay = new Date().getDate();
const dueOrOverdueExpenses = (data.expenses || []).filter(exp => {
  if (exp.isActive === false) return false;
  const paid = (exp.payments || []).some(p => p.month === _expCurrentMonth);
  return !paid && exp.dueDay <= _expTodayDay;
}).length;

const navGroups = [
  {
    id: "operations",
    label: uiText("Operations"),
    items: [
      { id: "dashboard", label: t("dashboard"), icon: ICN.dash },
      { id: "timeclock", label: t("timeclock"), icon: ICN.clock },
      { id: "schedule", label: t("schedule"), icon: ICN.cal },
      { id: "visits", label: t("visitation"), icon: ICN.cal },
    ],
  },
  {
    id: "management",
    label: uiText("Management"),
    items: [
      { id: "employees", label: t("employees"), icon: ICN.team },
      { id: "clients", label: t("clients"), icon: ICN.user },
    ],
  },
  {
    id: "finance",
    label: uiText("Finance"),
    items: [
      { id: "devis", label: t("devis"), icon: ICN.doc },
      { id: "invoices", label: t("invoices"), icon: ICN.doc },
      { id: "expenses", label: t("expenses"), icon: ICN.wallet, hasAlert: dueOrOverdueExpenses > 0 },
    ],
  },
  {
    id: "hr",
    label: uiText("Human Resources"),
    items: [
      { id: "conges", label: t("conges"), icon: ICN.cal, hasAlert: pendingTimeOffRequests > 0 },
      { id: "payslips", label: t("payslips"), icon: ICN.pay },
    ],
  },
  {
    id: "support",
    label: uiText("Support"),
    items: [
      { id: "inventory", label: t("inventory"), icon: ICN.doc, hasAlert: pendingProductRequests > 0 },
      { id: "communications", label: t("communications"), icon: ICN.mail },
      { id: "database", label: t("database"), icon: ICN.excel },
    ],
  },
  {
    id: "analysis",
    label: uiText("Analytics"),
    items: [
      { id: "history", label: t("history"), icon: ICN.doc, hasAlert: unseenUploads > 0 },
      { id: "reports", label: t("reports"), icon: ICN.chart },
    ],
  },
  {
    id: "system",
    label: uiText("System"),
    items: [
      { id: "settings", label: t("settings"), icon: ICN.gear },
      { id: "download-app", label: t("downloadApp"), icon: ICN.download },
    ],
  },
];
const navItems = navGroups.flatMap(group => group.items);

const openDownloadApp = () => {
setSection("download-app");
};

const installForPlatform = async (platform) => {
if (platform === "android" && installPromptRef.current) {
  try {
    await installPromptRef.current.prompt();
    await installPromptRef.current.userChoice;
    installPromptRef.current = null;
    showToast(uiText("Install prompt opened"));
    return;
  } catch {
  }
}
if (platform === "ios") {
  showToast(uiText("Use Share > Add to Home Screen"), "info");
  return;
}
showToast(uiText("Use browser menu > Install app"), "info");
};

const renderSection = () => {
const props = { data, updateData, showToast, setData, auth, setSection, setDevisSeed, devisSeed, emailConfigured, setEmailConfigured };
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
case "expenses": return <ExpensesPage {...props} />;
case "conges": return <LeaveManagementPage {...props} />;
case "history": return <HistoryPage {...props} />;
case "communications": return <CommunicationHubPage data={data} updateData={updateData} showToast={showToast} />;
case "reports": return <ReportsPage data={data} />;
case "database": return <ExcelDBPage data={data} setData={setData} showToast={showToast} />;
case "download-app": return <DownloadAppPage onInstallApp={installForPlatform} />;
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
      {navGroups.map(group => (
        <div key={group.id} style={{ marginBottom: 8 }}>
          {sideOpen && (
            <div style={{ fontSize: 10, fontWeight: 700, color: CL.muted, padding: "8px 10px 4px", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {group.label}
            </div>
          )}
          {group.items.map(nav => (
            <button key={nav.id} onClick={() => nav.id === "download-app" ? openDownloadApp() : setSection(nav.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: sideOpen ? "7px 10px" : "7px 11px", background: section === nav.id ? CL.gold + "15" : "transparent", border: "none", borderRadius: 7, cursor: "pointer", color: section === nav.id ? CL.gold : CL.muted, fontSize: 13, fontWeight: section === nav.id ? 600 : 400, marginBottom: 1, textAlign: "left", whiteSpace: "nowrap" }}>
              <span style={{ flexShrink: 0 }}>{nav.icon}</span>
              {sideOpen && <span>{nav.label}{nav.hasAlert ? <span style={{ color: CL.red, marginLeft: 6, fontWeight: 700 }}>!</span> : null}</span>}
            </button>
          ))}
        </div>
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
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 10 }}><ThemeToggle /><LanguageSwitcher compact /></div>
    <div style={{ maxWidth: 1200, margin: "0 auto", animation: "fadeIn .3s ease" }}>
      {renderSection()}
    </div>
  </div>
</div>

</LanguageContext.Provider>

);
}

// ==============================================
// EMAIL VERIFICATION SCREEN
// ==============================================
function EmailVerificationScreen({ token, email }) {
const { lang } = useI18n();
const [status, setStatus] = useState("loading"); // loading | success | error
const [error, setError] = useState("");

useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      let base = null;
      for (const b of API_BASE_CANDIDATES) {
        try {
          const r = await fetch(`${b}/`, { signal: AbortSignal.timeout(8000) });
          if (r.ok || (r.status >= 200 && r.status < 500)) { base = b; break; }
        } catch {}
      }
      if (!base) { if (!cancelled) { setError(lang === "en" ? "Server unavailable. Please try again later." : "Serveur indisponible. Veuillez réessayer plus tard."); setStatus("error"); } return; }
      const res = await fetch(`${base}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const body = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (res.ok && body.success) {
        setStatus("success");
      } else {
        setError(body.error || (lang === "en" ? "Invalid or expired verification link." : "Lien de vérification invalide ou expiré."));
        setStatus("error");
      }
    } catch {
      if (!cancelled) { setError(lang === "en" ? "Connection error. Please try again." : "Erreur de connexion. Veuillez réessayer."); setStatus("error"); }
    }
  })();
  return () => { cancelled = true; };
}, []);

if (status === "loading") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28, textAlign: "center" }}>
        <p style={{ color: CL.muted, fontSize: 14 }}>{lang === "en" ? "Verifying your email…" : "Vérification de votre email…"}</p>
      </div>
    </div>
  </LoginShell>
);

if (status === "success") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>&#x2705;</div>
        <h3 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Email verified!" : "Email vérifié !"}</h3>
        <p style={{ color: CL.muted, fontSize: 13, marginBottom: 20 }}>{lang === "en" ? "Your email has been verified. Your account is now awaiting owner approval. You will receive an email once your account is approved." : "Votre email a été vérifié. Votre compte est en attente d'approbation. Vous recevrez un email une fois votre compte approuvé."}</p>
        <button onClick={() => window.location.replace("/")} style={{ ...btnPri, width: "100%", justifyContent: "center" }}>{lang === "en" ? "Go to login" : "Aller à la connexion"}</button>
      </div>
    </div>
  </LoginShell>
);

return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>&#x274C;</div>
        <h3 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond', serif", color: CL.red, fontSize: 21 }}>{lang === "en" ? "Verification failed" : "Échec de la vérification"}</h3>
        <p style={{ color: CL.muted, fontSize: 13, marginBottom: 20 }}>{error}</p>
        <button onClick={() => window.location.replace("/")} style={{ ...btnPri, width: "100%", justifyContent: "center" }}>{lang === "en" ? "Go to login" : "Aller à la connexion"}</button>
      </div>
    </div>
  </LoginShell>
);
}

// ==============================================
// LOGIN SCREEN
// ==============================================
function ResetPasswordScreen({ token, email }) {
const { lang } = useI18n();
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [error, setError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [done, setDone] = useState(false);

const doReset = async () => {
  if (newPassword.length < 6) { setError(lang === "en" ? "Password must be at least 6 characters" : "Le mot de passe doit contenir au moins 6 caractères"); return; }
  if (newPassword !== confirmPassword) { setError(lang === "en" ? "Passwords do not match" : "Les mots de passe ne correspondent pas"); return; }
  setIsSubmitting(true); setError("");
  try {
    let base = null;
    for (const b of API_BASE_CANDIDATES) {
      try {
        const r = await fetch(`${b}/`, { signal: AbortSignal.timeout(8000) });
        if (r.ok || (r.status >= 200 && r.status < 500)) { base = b; break; }
      } catch {}
    }
    if (!base) { setError(lang === "en" ? "Server unavailable. Please try again." : "Serveur indisponible. Veuillez réessayer."); return; }
    const res = await fetch(`${base}/api/auth/cleaner-reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.success) {
      // Remove URL params so page doesn't re-show on refresh
      window.history.replaceState({}, "", window.location.pathname);
      setDone(true);
    } else {
      setError(body.error || (lang === "en" ? "Reset failed. The link may have expired." : "Échec de la réinitialisation. Le lien a peut-être expiré."));
    }
  } catch { setError(lang === "en" ? "Connection error. Please try again." : "Erreur de connexion. Veuillez réessayer."); }
  finally { setIsSubmitting(false); }
};

if (done) return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h3 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Password updated!" : "Mot de passe mis à jour !"}</h3>
        <p style={{ color: CL.muted, fontSize: 13, marginBottom: 20 }}>{lang === "en" ? "Your password has been changed. You can now log in with your new password." : "Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."}</p>
        <button onClick={() => window.location.replace("/")} style={{ ...btnPri, width: "100%", justifyContent: "center" }}>{lang === "en" ? "Go to login" : "Aller à la connexion"}</button>
      </div>
    </div>
  </LoginShell>
);

return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28 }}>
        <h3 style={{ margin: "0 0 16px", fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Set new password" : "Définir un nouveau mot de passe"}</h3>
        <p style={{ color: CL.muted, fontSize: 13, marginBottom: 16 }}>{lang === "en" ? `Resetting password for ${email}` : `Réinitialisation du mot de passe pour ${email}`}</p>
        <Field label={lang === "en" ? "New password" : "Nouveau mot de passe"}>
          <TextInput type="password" maxLength={64} value={newPassword} autoFocus onChange={ev => { setNewPassword(ev.target.value); setError(""); }} placeholder="••••••••" onKeyDown={ev => ev.key === "Enter" && doReset()} />
        </Field>
        <Field label={lang === "en" ? "Confirm password" : "Confirmer le mot de passe"}>
          <TextInput type="password" maxLength={64} value={confirmPassword} onChange={ev => { setConfirmPassword(ev.target.value); setError(""); }} placeholder="••••••••" onKeyDown={ev => ev.key === "Enter" && doReset()} />
        </Field>
        {error && <div style={{ color: CL.red, fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}
        <button disabled={isSubmitting} onClick={() => void doReset()} style={{ ...btnPri, width: "100%", justifyContent: "center", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
          {isSubmitting ? (lang === "en" ? "Saving…" : "Enregistrement…") : (lang === "en" ? "Set password" : "Définir le mot de passe")}
        </button>
      </div>
    </div>
  </LoginShell>
);
}

function LoginScreen({ data, onAuth }) {
const { lang } = useI18n();
// "home" | "admin" | "agent-pick" | "agent-pw"
const [view, setView] = useState("home");
const [agentList, setAgentList] = useState([]);
const [agentListLoading, setAgentListLoading] = useState(false);
const [selectedAgent, setSelectedAgent] = useState(null); // {id, name, display_name}
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");

const REQUEST_TIMEOUT_MS = 8000;
const WARMUP_TIMEOUT_MS = 10000;

const tryFetch = async (baseUrl, path, opts) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(apiUrl(path, baseUrl), { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch { clearTimeout(id); return null; }
};

const tryWarmup = async (baseUrl) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), WARMUP_TIMEOUT_MS);
  try {
    // Warm only the API server process; DB-specific health can be flaky right
    // after cold starts and should not block opening the login screen.
    const res = await fetch(apiUrl("/", baseUrl), { signal: controller.signal });
    clearTimeout(id);
    return res.ok || (res.status >= 200 && res.status < 500);
  } catch { clearTimeout(id); return false; }
};

const getWarmBase = async () => {
  for (const base of API_BASE_CANDIDATES) {
    if (await tryWarmup(base)) return base;
  }
  return null;
};

// Fetch the list of agents for the picker
const loadAgentList = async () => {
  setAgentListLoading(true);
  setError("");
  const base = await getWarmBase();
  if (!base) {
    setError(lang === "en" ? "Server is starting up — please wait and try again." : "Le serveur démarre — réessayez dans un moment.");
    setAgentListLoading(false);
    return;
  }
  const res = await tryFetch(base, "/api/auth/agent-list", { method: "GET" });
  if (res && res.ok) {
    const rows = await res.json();
    setAgentList(rows);
    setView("agent-pick");
  } else {
    setError(lang === "en" ? "Could not load agent list." : "Impossible de charger la liste des agents.");
  }
  setAgentListLoading(false);
};

const loginWithServer = async ({ user, pass, roleHints }) => {
  const base = await getWarmBase();
  if (!base) return { status: "unreachable" };
  let reachedServer = false;
  for (const payload of roleHints) {
    const res = await tryFetch(base, "/api/auth/pin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, pin: pass }),
    });
    if (!res) continue;
    reachedServer = true;
    if (!res.ok) continue;
    let body = null;
    try { body = await res.json(); } catch { continue; }
    if (body?.success && body?.role === "owner") { onAuth({ role: "owner", lang: body.lang || "fr", theme: body.theme || "dark" }); return { status: "success" }; }
    if (body?.success && body?.role === "manager") { onAuth({ role: "manager", lang: body.lang || "fr", theme: body.theme || "dark" }); return { status: "success" }; }
    if (body?.success && body?.role === "cleaner" && body?.employeeId) { onAuth({ role: "cleaner", employeeId: body.employeeId, lang: body.lang || "fr", theme: body.theme || "dark" }); return { status: "success" }; }
  }
  return { status: reachedServer ? "invalid" : "unreachable" };
};

// Admin/Manager login
const doAdminLogin = async () => {
  const rawUser = String(username || "").trim();
  const pass = String(password || "").trim();
  if (!rawUser || !pass) { setError(lang === "en" ? "Enter username and password" : "Saisissez identifiant et mot de passe"); return; }
  setIsSubmitting(true); setError("");
  try {
    const result = await loginWithServer({ user: rawUser, pass, roleHints: [
      { role: "owner", username: rawUser, employeeId: rawUser },
      { role: "manager", employeeId: rawUser },
    ]});
    if (result.status === "success") return;
    if (result.status === "unreachable") setError(lang === "en" ? "Server is starting up — please wait 30s and retry." : "Le serveur démarre — attendez 30 secondes et réessayez.");
    else setError(lang === "en" ? "Incorrect username or password" : "Identifiant ou mot de passe incorrect");
  } catch { setError(lang === "en" ? "Connection error. Please try again." : "Erreur de connexion. Veuillez réessayer."); }
  finally { setIsSubmitting(false); }
};

// Agent login — submits selected agent ID with password/PIN
const doAgentLogin = async () => {
  setIsSubmitting(true); setError("");
  try {
    const result = await loginWithServer({ pass: String(password || "").trim(), roleHints: [
      { role: "cleaner", employeeId: selectedAgent.id },
    ]});
    if (result.status === "success") return;
    if (result.status === "unreachable") setError(lang === "en" ? "Server is starting up — please wait 30s and retry." : "Le serveur démarre — attendez 30 secondes et réessayez.");
    else setError(lang === "en" ? "Login failed. Please try again." : "Échec de connexion. Veuillez réessayer.");
  } catch { setError(lang === "en" ? "Connection error. Please try again." : "Erreur de connexion. Veuillez réessayer."); }
  finally { setIsSubmitting(false); }
};

const doForgotPassword = async () => {
  const email = String(forgotEmail || "").trim();
  if (!email || !email.includes("@")) { setError(lang === "en" ? "Enter a valid email address" : "Saisissez une adresse email valide"); return; }
  setIsSubmitting(true); setError("");
  try {
    const base = await getWarmBase();
    if (!base) { setError(lang === "en" ? "Server is starting up — please wait and try again." : "Le serveur démarre — réessayez dans un moment."); return; }
    const res = await tryFetch(base, "/api/auth/cleaner-forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res && (res.ok || res.status === 200)) {
      setView("forgot-sent");
    } else {
      setError(lang === "en" ? "Could not send reset email. Please try again." : "Impossible d'envoyer l'email. Veuillez réessayer.");
    }
  } catch { setError(lang === "en" ? "Connection error. Please try again." : "Erreur de connexion. Veuillez réessayer."); }
  finally { setIsSubmitting(false); }
};

const goBack = () => { setError(""); setPassword(""); setUsername(""); setSelectedAgent(null); setForgotEmail(""); setView("home"); };

// ── HOME: choose role ─────────────────────────────────────────────────────
if (view === "home") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .5s ease", width: 460, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Admin / Manager card */}
        <div className="login-role-card" onClick={() => { setView("admin"); setError(""); }} style={{ flex: 1, minWidth: 180, background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 18, padding: "28px 20px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: CL.s2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: CL.muted, fontSize: 24 }}>🔐</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: CL.text, marginBottom: 6 }}>{lang === "en" ? "Admin / Manager" : "Admin / Manager"}</div>
          <div style={{ fontSize: 12, color: CL.muted, lineHeight: 1.5 }}>{lang === "en" ? "Owner & manager access" : "Accès propriétaire & manager"}</div>
        </div>
        {/* Agent Login card */}
        <div className="login-role-card" onClick={() => { loadAgentList(); }} style={{ flex: 1, minWidth: 180, background: `linear-gradient(135deg, ${CL.gold}18, ${CL.goldDark}10)`, border: `1.5px solid ${CL.gold}60`, borderRadius: 18, padding: "28px 20px", textAlign: "center" }}>
          {agentListLoading
            ? <div style={{ color: CL.gold, fontSize: 13, paddingTop: 12 }}>{lang === "en" ? "Loading…" : "Chargement…"}</div>
            : <>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${CL.gold}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 24 }}>✨</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: CL.gold, marginBottom: 6 }}>{lang === "en" ? "Agent Login" : "Connexion Agent"}</div>
              <div style={{ fontSize: 12, color: CL.muted, lineHeight: 1.5 }}>{lang === "en" ? "Cleaning agents — tap to continue" : "Agents de nettoyage — appuyez pour continuer"}</div>
            </>}
        </div>
      </div>
      {error && <div style={{ color: CL.red, fontSize: 13, marginTop: 14, textAlign: "center" }}>{error}</div>}
    </div>
  </LoginShell>
);

// ── ADMIN LOGIN form ──────────────────────────────────────────────────────
if (view === "admin") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={goBack} style={{ background: "none", border: "none", color: CL.muted, cursor: "pointer", padding: 4, lineHeight: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Admin / Manager Login" : "Connexion Admin / Manager"}</h3>
        </div>
        <Field label={lang === "en" ? "Username" : "Identifiant"}>
          <TextInput value={username} onChange={ev => { setUsername(ev.target.value); setError(""); }} placeholder={lang === "en" ? "username or email" : "identifiant ou email"} onKeyDown={ev => ev.key === "Enter" && doAdminLogin()} />
        </Field>
        <Field label={lang === "en" ? "Password" : "Mot de passe"}>
          <TextInput type="password" maxLength={32} value={password} onChange={ev => { setPassword(ev.target.value); setError(""); }} placeholder="••••••••" onKeyDown={ev => ev.key === "Enter" && doAdminLogin()} />
        </Field>
        {error && <div style={{ color: CL.red, fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}
        <button disabled={isSubmitting} onClick={() => void doAdminLogin()} style={{ ...btnPri, width: "100%", justifyContent: "center", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
          {isSubmitting ? (lang === "en" ? "Connecting…" : "Connexion…") : (lang === "en" ? "Sign In" : "Se connecter")}
        </button>
        {isSubmitting && <p style={{ marginTop: 6, fontSize: 11, color: CL.muted, textAlign: "center" }}>{lang === "en" ? "Server may need a moment to wake up…" : "Le serveur démarre, merci de patienter…"}</p>}
      </div>
    </div>
  </LoginShell>
);

// ── AGENT PICK: choose name ───────────────────────────────────────────────
if (view === "agent-pick") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={goBack} style={{ background: "none", border: "none", color: CL.muted, cursor: "pointer", padding: 4, lineHeight: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Agent Login" : "Connexion Agent"}</h3>
        </div>
        <label style={{ display: "block", fontSize: 12, color: CL.muted, marginBottom: 6, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>
          {lang === "en" ? "Select your username" : "Sélectionnez votre nom d'utilisateur"}
        </label>
        <SelectInput
          value={selectedAgent ? selectedAgent.id : ""}
          onChange={e => {
            const agent = agentList.find(a => a.id === e.target.value);
            setSelectedAgent(agent || null);
            setError("");
          }}
          style={{ width: "100%" }}
        >
          <option value="" disabled style={{ color: CL.muted }}>{lang === "en" ? "— Choose your username —" : "— Choisissez votre nom d'utilisateur —"}</option>
          {agentList.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.display_name || agent.name}</option>
          ))}
        </SelectInput>
        <button
          onClick={() => { if (selectedAgent) { setError(""); setPassword(""); setView("agent-pw"); } }}
          disabled={!selectedAgent || isSubmitting}
          style={{ marginTop: 18, width: "100%", padding: "13px", background: selectedAgent ? CL.gold : `${CL.gold}44`, border: "none", borderRadius: 10, color: selectedAgent ? "#0a0c12" : CL.muted, fontSize: 15, fontWeight: 700, cursor: (selectedAgent && !isSubmitting) ? "pointer" : "not-allowed", transition: "background .2s" }}
        >
          {lang === "en" ? "Next" : "Suivant"}
        </button>
        {error && <div style={{ color: CL.red, fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</div>}
      </div>
    </div>
  </LoginShell>
);

// ── AGENT PASSWORD ────────────────────────────────────────────────────────
if (view === "agent-pw") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={() => { setView("agent-pick"); setError(""); setPassword(""); }} style={{ background: "none", border: "none", color: CL.muted, cursor: "pointer", padding: 4, lineHeight: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Agent Login" : "Connexion Agent"}</h3>
        </div>
        {/* Show the selected agent's name/avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: `${CL.gold}12`, border: `1px solid ${CL.gold}30`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${CL.gold}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: CL.gold, fontWeight: 700, flexShrink: 0 }}>{(selectedAgent?.display_name || selectedAgent?.name || "?").charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: CL.text }}>{selectedAgent?.display_name || selectedAgent?.name}</div>
            <div style={{ fontSize: 12, color: CL.muted }}>{lang === "en" ? "Cleaning Agent" : "Agent de nettoyage"}</div>
          </div>
        </div>
        <Field label={lang === "en" ? "Password / PIN" : "Mot de passe / PIN"}>
          <TextInput type="password" maxLength={32} value={password} autoFocus onChange={ev => { setPassword(ev.target.value); setError(""); }} placeholder="••••••••" onKeyDown={ev => ev.key === "Enter" && doAgentLogin()} />
        </Field>
        {error &&<div style={{ color: CL.red, fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}
        <button disabled={isSubmitting} onClick={() => void doAgentLogin()} style={{ ...btnPri, width: "100%", justifyContent: "center", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
          {isSubmitting ? (lang === "en" ? "Connecting…" : "Connexion…") : (lang === "en" ? "Sign In" : "Se connecter")}
        </button>
        {isSubmitting && <p style={{ marginTop: 6, fontSize: 11, color: CL.muted, textAlign: "center" }}>{lang === "en" ? "Server may need a moment to wake up…" : "Le serveur démarre, merci de patienter…"}</p>}
        <button onClick={() => { setError(""); setPassword(""); setForgotEmail(""); setView("forgot-pw"); }} style={{ background: "none", border: "none", color: CL.muted, fontSize: 12, cursor: "pointer", marginTop: 12, width: "100%", textAlign: "center", textDecoration: "underline" }}>
          {lang === "en" ? "Forgot password?" : "Mot de passe oublié ?"}
        </button>
      </div>
    </div>
  </LoginShell>
);

// ── FORGOT PASSWORD: enter email ──────────────────────────────────────────
if (view === "forgot-pw") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setView("agent-pw"); setError(""); }} style={{ background: "none", border: "none", color: CL.muted, cursor: "pointer", padding: 4, lineHeight: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Reset Password" : "Réinitialiser le mot de passe"}</h3>
        </div>
        <p style={{ color: CL.muted, fontSize: 13, marginBottom: 16 }}>{lang === "en" ? "Enter the email address linked to your agent account. We'll send you a reset link." : "Saisissez l'adresse email liée à votre compte agent. Nous vous enverrons un lien de réinitialisation."}</p>
        <Field label={lang === "en" ? "Email address" : "Adresse email"}>
          <TextInput type="email" value={forgotEmail} autoFocus onChange={ev => { setForgotEmail(ev.target.value); setError(""); }} placeholder="agent@example.com" onKeyDown={ev => ev.key === "Enter" && doForgotPassword()} />
        </Field>
        {error && <div style={{ color: CL.red, fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}
        <button disabled={isSubmitting} onClick={() => void doForgotPassword()} style={{ ...btnPri, width: "100%", justifyContent: "center", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
          {isSubmitting ? (lang === "en" ? "Sending…" : "Envoi…") : (lang === "en" ? "Send reset link" : "Envoyer le lien")}
        </button>
      </div>
    </div>
  </LoginShell>
);

// ── FORGOT PASSWORD: email sent confirmation ──────────────────────────────
if (view === "forgot-sent") return (
  <LoginShell>
    <div style={{ animation: "fadeIn .4s ease", width: 420, maxWidth: "100%" }}>
      <LoginLogo lang={lang} />
      <div style={{ ...cardSt, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
        <h3 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 21 }}>{lang === "en" ? "Check your email" : "Vérifiez votre email"}</h3>
        <p style={{ color: CL.muted, fontSize: 13, marginBottom: 20 }}>{lang === "en" ? "If that email is linked to an agent account, a reset link has been sent. Check your inbox and click the link within 30 minutes." : "Si cet email est lié à un compte agent, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail et cliquez sur le lien dans les 30 minutes."}</p>
        <button onClick={goBack} style={{ ...btnPri, width: "100%", justifyContent: "center" }}>{lang === "en" ? "Back to login" : "Retour à la connexion"}</button>
      </div>
    </div>
  </LoginShell>
);

return null;
}


const LoginShell = ({ children }) => (
  <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${CL.bg} 0%, #0d0f18 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", padding: "24px 16px" }}>
    <style>{globalCSS}</style>
    <style>{`
      .login-role-card { transition: transform .15s, box-shadow .15s; cursor: pointer; }
      .login-role-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.45); }
      .login-agent-select:focus { border-color: ${CL.gold} !important; box-shadow: 0 0 0 3px ${CL.gold}22; }
    `}</style>
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}><LanguageSwitcher /></div>
    {children}
  </div>
);

const LoginLogo = ({ lang }) => (
  <div style={{ textAlign: "center", marginBottom: 32 }}>
    <div style={{ width: 90, height: 90, borderRadius: 28, background: `linear-gradient(135deg, ${CL.gold}, ${CL.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 34, fontWeight: 700, color: "#0d0e15", fontFamily: "'Cormorant Garamond', serif", boxShadow: `0 8px 32px ${CL.gold}40` }}>LAC</div>
    <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: CL.gold, letterSpacing: "0.06em" }}>Lux Angels Cleaning</h1>
    <p style={{ margin: "6px 0 0", fontSize: 13, color: CL.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{lang === "en" ? "Management Portal" : "Portail de gestion"}</p>
  </div>
);

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
const [adjustHours, setAdjustHours] = useState({});
const [timeOffForm, setTimeOffForm] = useState({ startDate: "", endDate: "", reason: "", leaveType: "conge" });
const [productForm, setProductForm] = useState({ productId: "", quantity: 1, note: "", deliveryAt: "" });

const upcoming = data.schedules.filter(s => isSameId(s.employeeId, auth.employeeId) && s.date >= getToday() && s.status !== "cancelled").sort((a, b) => a.date.localeCompare(b.date));
const [schedViewMode, setSchedViewMode] = useState("calendar");
const nowCal = new Date();
const [calYear, setCalYear] = useState(nowCal.getFullYear());
const [calMonth, setCalMonth] = useState(nowCal.getMonth());
const [calSelectedDay, setCalSelectedDay] = useState(null);
const myClocks = data.clockEntries.filter(c => c.employeeId === auth.employeeId).sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));
const monthClocks = myClocks.filter(c => c.clockOut && toLocalDateKey(c.clockIn).startsWith(monthFilter));
const monthHours = monthClocks.reduce((sum, c) => sum + calcAccountedClockHours(c, data.schedules), 0);
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

const doValidateHours = async (sched) => {
const today = getToday();
const alreadyValidated = data.clockEntries.some(c => isSameId(c.employeeId, auth.employeeId) && isSameId(c.clientId, sched.clientId) && toLocalDateKey(c.clockIn) === today);
if (alreadyValidated) { showToast(uiText("Already validated for today"), "error"); return; }
const plannedH = calcHrs(makeISO(today, sched.startTime), makeISO(today, sched.endTime));
const adj = adjustHours[sched.id];
const validatedH = adj != null ? (Number(adj.hours || 0) + Number(adj.minutes || 0) / 60) : plannedH;
const validatedMinutes = Math.round(validatedH * 60);
const clockIn = makeISO(today, sched.startTime);
const clockOutDate = new Date(new Date(clockIn).getTime() + validatedMinutes * 60000);
const clockOut = clockOutDate.toISOString();
const newEntry = {
id: makeId(), employeeId: auth.employeeId, clientId: sched.clientId,
clockIn, clockOut,
notes: clockInNote.trim(),
isLate: false, lateMinutes: 0,
scheduledStart: sched.startTime,
validatedByAgent: true,
plannedHours: plannedH,
};
try {
await createClockEntryInApi(newEntry);
updateData("clockEntries", prev => [...prev, newEntry]);
const schedToSync = (data.schedules || []).find(s => isSameId(s.employeeId, auth.employeeId) && isSameId(s.clientId, sched.clientId) && s.date === today && (s.status === "scheduled" || s.status === "in-progress"));
if (schedToSync) syncScheduleToApi({ ...schedToSync, status: "completed" }).catch(console.error);
updateData("schedules", prev => {
let result = updateScheduleStatusForJob(prev, { employeeId: auth.employeeId, clientId: sched.clientId, date: today, from: "scheduled", to: "completed" });
if (result === prev) result = updateScheduleStatusForJob(prev, { employeeId: auth.employeeId, clientId: sched.clientId, date: today, from: "in-progress", to: "completed" });
return result;
});
setClockInNote("");
setAdjustHours(prev => { const n = { ...prev }; delete n[sched.id]; return n; });
showToast(uiText("Hours validated!"));
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to validate hours", "error");
}
};

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
const fr = new FileReader();
fr.onload = () => resolve(fr.result);
fr.onerror = reject;
fr.readAsDataURL(file);
});

const todayJobsForPhotos = data.schedules.filter(sc => sc.date === getToday() && isSameId(sc.employeeId, auth.employeeId) && sc.status !== "cancelled");
const activeClockForPhotos = myClocks.find(c => !c.clockOut);
const todayValidatedEntries = data.clockEntries.filter(c => isSameId(c.employeeId, auth.employeeId) && toLocalDateKey(c.clockIn) === getToday() && c.clockOut);
const photoClientId = activeClockForPhotos?.clientId || todayValidatedEntries[todayValidatedEntries.length - 1]?.clientId || todayJobsForPhotos[0]?.clientId || null;
const photoClockEntryId = activeClockForPhotos?.id || todayValidatedEntries[todayValidatedEntries.length - 1]?.id || null;
const canUploadPhoto = !!(photoClientId);

const onUploadPhoto = async (file) => {
if (!file) return;
if (!file.type?.startsWith("image/")) { showToast(uiText("Please upload an image file"), "error"); return; }
if (!canUploadPhoto) { showToast(uiText("No jobs scheduled for today"), "error"); return; }
try {
const imageData = await readAsDataUrl(file);
const newPhoto = {
  id: makeId(), employeeId: auth.employeeId, createdAt: new Date().toISOString(),
  fileName: file.name, imageData, note: uploadNote.trim(),
  type: uploadType, seenByOwner: false,
  clockEntryId: photoClockEntryId, clientId: photoClientId,
};
try {
  const response = await fetch(apiUrl("/api/photo-uploads"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPhoto) });
  await ensureApiOk(response, "Failed to save photo");
} catch (err) { showToast("Failed to save photo to database", "error"); return; }
updateData("photoUploads", (prev = []) => [...prev, newPhoto]);
setUploadNote("");
setUploadType("issue");
showToast("Photo uploaded");
} catch {
showToast("Upload failed", "error");
}
};

const submitTimeOff = async () => {
if (!timeOffForm.startDate || !timeOffForm.endDate) { showToast(uiText("Select start and end dates"), "error"); return; }
if (timeOffForm.endDate < timeOffForm.startDate) { showToast(uiText("End date must be after start date"), "error"); return; }
const requestedDays = leaveDaysInclusive(timeOffForm.startDate, timeOffForm.endDate);
if (!requestedDays) { showToast(uiText("Invalid leave dates"), "error"); return; }
if (requestedDays > leaveSummary.remaining) { showToast(uiText("Request exceeds remaining leave balance"), "error"); return; }
const newReq = {
  id: makeId(), employeeId: auth.employeeId, ...timeOffForm,
  requestedDays, reason: timeOffForm.reason.trim(), status: "pending",
  createdAt: new Date().toISOString(), reviewedAt: null, reviewedBy: null, reviewNote: "",
};
try {
  const response = await fetch(apiUrl("/api/time-off-requests"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newReq) });
  await ensureApiOk(response, "Failed to save leave request");
} catch (err) { showToast("Failed to save leave request to database", "error"); return; }
updateData("timeOffRequests", (prev = []) => [...prev, newReq]);
setTimeOffForm({ startDate: "", endDate: "", reason: "", leaveType: "conge" });
showToast(uiText("Leave request sent"));
};

const submitProductRequest = async () => {
if (!productForm.productId) { showToast("Select a product", "error"); return; }
if (!productForm.quantity || Number(productForm.quantity) <= 0) { showToast("Enter quantity", "error"); return; }
const newReq = {
  id: makeId(), employeeId: auth.employeeId,
  productId: productForm.productId, quantity: Number(productForm.quantity),
  note: productForm.note.trim(), deliveryAt: productForm.deliveryAt || "",
  status: "pending", approvedQty: 0, deliveredQty: 0, createdAt: new Date().toISOString(),
};
try {
  const response = await fetch(apiUrl("/api/product-requests"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newReq) });
  await ensureApiOk(response, "Failed to save product request");
} catch (err) { showToast("Failed to save product request to database", "error"); return; }
updateData("productRequests", (prev = []) => [...prev, newReq]);
setProductForm({ productId: "", quantity: 1, note: "", deliveryAt: "" });
showToast("Product request sent");
};

const [profilePicSaving, setProfilePicSaving] = useState(false);

const handleCleanerProfilePicChange = async (file) => {
  if (!file || !file.type?.startsWith("image/")) return;
  if (!emp) return;
  setProfilePicSaving(true);
  try {
    const fr = new FileReader();
    const imageData = await new Promise((res, rej) => { fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
    const response = await fetch(apiUrl(`/api/employees/${emp.id}/profile-picture`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData }),
    });
    if (response.ok) {
      updateData("employees", prev => prev.map(e => e.id === emp.id ? { ...e, profilePicture: imageData } : e));
      showToast(uiText("Profile picture updated"));
    } else {
      showToast(uiText("Failed to update profile picture"), "error");
    }
  } catch { showToast(uiText("Upload failed"), "error"); }
  finally { setProfilePicSaving(false); }
};

const handleRemoveCleanerProfilePic = async () => {
  if (!emp) return;
  setProfilePicSaving(true);
  try {
    await fetch(apiUrl(`/api/employees/${emp.id}/profile-picture`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: null }),
    });
    updateData("employees", prev => prev.map(e => e.id === emp.id ? { ...e, profilePicture: "" } : e));
    showToast(uiText("Profile picture removed"));
  } catch { showToast(uiText("Failed to remove picture"), "error"); }
  finally { setProfilePicSaving(false); }
};

const tabItems = [
{ id: "schedule", label: t("mySchedule"), icon: ICN.cal },
{ id: "clock", label: t("clockInOut"), icon: ICN.clock },
{ id: "hours", label: t("myHours"), icon: ICN.chart },
{ id: "photos", label: t("photoUploads"), icon: ICN.doc },
{ id: "products", label: t("products"), icon: ICN.doc, hasAlert: hasPendingProductRequest },
{ id: "timeoff", label: t("conges"), icon: ICN.cal, hasAlert: hasPendingTimeOffRequest },
{ id: "profile", label: uiText("Profile"), icon: ICN.user },
];

return (
<div style={{ minHeight: "100vh", background: CL.bg, fontFamily: "'Outfit', sans-serif", color: CL.text }}>
<style>{globalCSS}</style>
{toast && <ToastMsg message={toast.msg} type={toast.type} />}
{/* Header */}
<div style={{ background: CL.sf, borderBottom: `1px solid ${CL.bd}`, padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<div style={{ width: 36, height: 36, borderRadius: "50%", background: CL.blue + "20", display: "flex", alignItems: "center", justifyContent: "center", color: CL.blue, overflow: "hidden", flexShrink: 0 }}>
  {emp?.profilePicture ? <img src={emp.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : ICN.user}
</div>
<div><div style={{ fontWeight: 600, fontSize: 14 }}>{emp?.name || "Cleaner"}</div><div style={{ fontSize: 10, color: CL.muted }}>{emp?.role}</div></div>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}><ThemeToggle /><LanguageSwitcher compact /><button onClick={onLogout} style={{ ...btnSec, ...btnSm, color: CL.red }}>{ICN.logout} {t("logout")}</button></div>
</div>
{/* Tabs */}
<div style={{ display: "flex", background: CL.sf, borderBottom: `1px solid ${CL.bd}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
{tabItems.map(t => (
<button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "11px 16px", border: "none", background: "transparent", cursor: "pointer", color: tab === t.id ? CL.blue : CL.muted, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, borderBottom: tab === t.id ? `2px solid ${CL.blue}` : "2px solid transparent", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0 }}>{t.icon} {t.label}{t.hasAlert ? <span style={{ color: CL.red, fontWeight: 700, marginLeft: 4 }}>!</span> : null}</button>
))}
</div>
{/* Content */}
<div className="cleaner-portal-content" style={{ padding: 18, maxWidth: 800, margin: "0 auto" }}>
{tab === "schedule" && (() => {
const calMonthStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
const calFirstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
const calMonthLabel = new Date(calYear, calMonth).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { month: "long", year: "numeric" });
const calTodayStr = getToday();
const calDayHeaders = lang === "en" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const calCells = [];
for (let i = 0; i < calFirstDayOfWeek; i++) calCells.push(null);
for (let d = 1; d <= calDaysInMonth; d++) calCells.push(d);
while (calCells.length % 7 !== 0) calCells.push(null);
const myMonthScheds = data.schedules.filter(s => isSameId(s.employeeId, auth.employeeId) && s.date?.startsWith(calMonthStr) && s.status !== "cancelled").sort((a,b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
const enabledHolidayKeys = resolveEnabledPublicHolidayKeys(data.settings);
const monthPublicHolidays = getLuxPublicHolidaysByMonth({ year: calYear, month: calMonth, selectedKeys: enabledHolidayKeys });
const holidayByDate = Object.fromEntries(monthPublicHolidays.map(h => [h.date, h]));
const calSelectedStr = calSelectedDay ? `${calMonthStr}-${String(calSelectedDay).padStart(2,"0")}` : null;
const calSelectedScheds = calSelectedStr ? myMonthScheds.filter(s => s.date === calSelectedStr) : [];
const selectedHoliday = calSelectedStr ? holidayByDate[calSelectedStr] : null;
const prevCalMonth = () => { if (calMonth === 0) { setCalYear(calYear-1); setCalMonth(11); } else setCalMonth(calMonth-1); setCalSelectedDay(null); };
const nextCalMonth = () => { if (calMonth === 11) { setCalYear(calYear+1); setCalMonth(0); } else setCalMonth(calMonth+1); setCalSelectedDay(null); };
const goCalToday = () => { setCalYear(nowCal.getFullYear()); setCalMonth(nowCal.getMonth()); setCalSelectedDay(nowCal.getDate()); };
return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 20, margin: 0 }}>{t("upcomingJobs")}</h2>
  <div style={{ display: "flex", background: CL.s2, border: `1px solid ${CL.bd}`, borderRadius: 8, padding: 2, gap: 2 }}>
    <button style={{ ...btnSec, ...btnSm, background: schedViewMode === "calendar" ? CL.blue : "transparent", border: "none", color: schedViewMode === "calendar" ? "#fff" : CL.muted, padding: "6px 10px", fontSize: 12 }} onClick={() => setSchedViewMode("calendar")}>{ICN.cal} {t("calendarView")}</button>
    <button style={{ ...btnSec, ...btnSm, background: schedViewMode === "list" ? CL.blue : "transparent", border: "none", color: schedViewMode === "list" ? "#fff" : CL.muted, padding: "6px 10px", fontSize: 12 }} onClick={() => setSchedViewMode("list")}>{ICN.doc} {t("listView")}</button>
  </div>
</div>

{schedViewMode === "calendar" ? (
<div>
  {/* Month navigation */}
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
    <button onClick={prevCalMonth} style={{ ...btnSec, ...btnSm, padding: "6px 12px", fontSize: 16 }}>‹</button>
    <button onClick={goCalToday} style={{ ...btnSec, ...btnSm, fontSize: 12 }}>{uiText("Today")}</button>
    <button onClick={nextCalMonth} style={{ ...btnSec, ...btnSm, padding: "6px 12px", fontSize: 16 }}>›</button>
    <span style={{ fontSize: 16, fontFamily: "'Cormorant Garamond', serif", color: CL.text, fontWeight: 600, textTransform: "capitalize" }}>{calMonthLabel}</span>
  </div>
  {/* Calendar grid */}
  <div style={{ ...cardSt, padding: 8, marginBottom: 12 }}>
    <div className="cleaner-cal-grid" style={{ marginBottom: 4 }}>
      {calDayHeaders.map(d => <div key={d} className="cal-hdr cleaner-cal-hdr" style={{ color: CL.muted }}>{d}</div>)}
    </div>
    <div className="cleaner-cal-grid">
      {calCells.map((day, idx) => {
        if (day === null) return <div key={`e-${idx}`} className="cleaner-cal-cell" style={{ background: CL.bg + "40", cursor: "default" }} />;
        const dateStr = `${calMonthStr}-${String(day).padStart(2,"0")}`;
        const dayScheds = myMonthScheds.filter(s => s.date === dateStr);
        const dayHoliday = holidayByDate[dateStr];
        const isToday = dateStr === calTodayStr;
        const isSelected = day === calSelectedDay;
        const isPast = dateStr < calTodayStr;
        return (
          <div key={day} className="cleaner-cal-cell" onClick={() => setCalSelectedDay(day === calSelectedDay ? null : day)} style={{ background: dayHoliday ? `${CL.red}0E` : isSelected ? CL.gold + "18" : isToday ? CL.blue + "12" : CL.s2, border: isSelected ? `2px solid ${CL.gold}` : dayHoliday ? `1px solid ${CL.red}60` : isToday ? `2px solid ${CL.blue}50` : `1px solid ${CL.bd}50`, opacity: isPast ? 0.65 : 1 }}>
            <div className="day-row">
              <span className="day-num" style={{ fontWeight: isToday ? 700 : 500, color: isToday ? CL.blue : CL.text }}>{day}</span>
              {dayScheds.length > 0 && <span className="day-badge" style={{ background: CL.gold + "35", color: CL.gold }}>{dayScheds.length}</span>}
            </div>
            {dayHoliday && <div style={{ fontSize: 8, color: CL.red, fontWeight: 700, marginBottom: 1, lineHeight: 1.1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }} title={getLuxHolidayLabel(dayHoliday.key, lang)}>{uiText("Holiday")}</div>}
            {dayScheds.slice(0, 2).map(sched => {
              const statusColor = scheduleStatusColor(sched.status);
              const client = data.clients.find(c => c.id === sched.clientId);
              return <div key={sched.id} className="cal-evt" style={{ background: statusColor + "22", borderLeftColor: statusColor, color: CL.text }}>
                <span className="evt-time">{sched.startTime} </span>
                <span className="evt-name" style={{ color: CL.muted }}>{client?.name?.slice(0, 10) || "?"}</span>
              </div>;
            })}
            {dayScheds.length > 2 && <div style={{ fontSize: 8, color: CL.muted, textAlign: "center", lineHeight: 1 }}>+{dayScheds.length - 2}</div>}
          </div>
        );
      })}
    </div>
  </div>
  {/* Selected day detail */}
  {calSelectedDay && (
    <div style={{ ...cardSt, padding: "8px 10px", marginBottom: 10, borderLeft: `4px solid ${selectedHoliday ? CL.red : CL.bd}` }}>
      <div style={{ fontSize: 12, color: selectedHoliday ? CL.red : CL.muted, fontWeight: selectedHoliday ? 700 : 500 }}>
        {selectedHoliday ? `${uiText("Holiday")}: ${getLuxHolidayLabel(selectedHoliday.key, lang)}` : uiText("No public holiday this day")}
      </div>
    </div>
  )}
  {calSelectedStr ? (
    <div style={{ ...cardSt }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 17, margin: 0 }}>{fmtDate(calSelectedStr)}</h3>
      {calSelectedScheds.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: CL.muted, fontSize: 13 }}>{t("noJobsThisDay")}</div>
      ) : calSelectedScheds.map(sched => {
        const client = data.clients.find(c => c.id === sched.clientId);
        return (
          <div key={sched.id} style={{ border: `1px solid ${CL.bd}`, borderRadius: 10, padding: "12px 14px", background: CL.s2, borderLeft: `4px solid ${scheduleStatusColor(sched.status)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{client?.name || "?"}</div>
                <div style={{ fontSize: 12, color: CL.muted, marginTop: 2 }}>{client?.address}{client?.apartmentFloor ? `, ${client.apartmentFloor}` : ""} {client?.address && <a href={mapsUrl(`${client.address}${client.apartmentFloor ? ` ${client.apartmentFloor}` : ""} ${client.postalCode || ""} ${client.city || ""}`)} target="_blank" rel="noreferrer" style={{ color: CL.blue, marginLeft: 6, textDecoration: "underline" }}>Map</a>}</div>
                {client?.accessCode && <div style={{ fontSize: 11, color: CL.orange, marginTop: 2 }}>Code: {client.accessCode}</div>}
                {client?.keyLocation && <div style={{ fontSize: 11, color: CL.orange }}>Key: {client.keyLocation}</div>}
                {client?.petInfo && <div style={{ fontSize: 11, color: CL.orange }}>Pets: {client.petInfo}</div>}
                {client?.specialInstructions && <div style={{ fontSize: 11, color: CL.dim, marginTop: 2 }}>{client.specialInstructions}</div>}
                <div style={{ fontSize: 13, color: CL.blue, marginTop: 4, fontWeight: 500 }}>{sched.startTime} - {sched.endTime}</div>
              </div>
              <Badge color={scheduleStatusColor(sched.status)}>{uiText(sched.status)}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div style={{ ...cardSt, textAlign: "center", padding: 28, color: CL.muted }}>
      <div style={{ marginBottom: 8 }}>{ICN.cal}</div>
      <div style={{ fontSize: 13 }}>{t("clickDayToSee")}</div>
    </div>
  )}
</div>
) : (
/* List view */
<div>
  {upcoming.length === 0 ? <div style={{ ...cardSt, textAlign: "center", padding: 36, color: CL.muted }}>{t("noUpcomingJobs")}</div> :
  upcoming.slice(0, 50).map(sched => {
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
          <Badge color={sched.date === getToday() ? CL.green : CL.blue}>{sched.date === getToday() ? uiText("Today") : fmtDate(sched.date)}</Badge>
          <Badge color={scheduleStatusColor(sched.status)}>{uiText(sched.status)}</Badge>
        </div>
      </div>
    );
  })}
</div>
)}
</div>
);
})()}

    {tab === "clock" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>{uiText("Validate Hours")}</h2>
        {(() => {
          const today = getToday();
          const todayJobs = data.schedules
            .filter(sc => sc.date === today && isSameId(sc.employeeId, auth.employeeId) && sc.status !== "cancelled")
            .sort((a, b) => `${a.startTime || ""}`.localeCompare(`${b.startTime || ""}`));
          return (
            <div>
              {todayJobs.length > 0 && <div style={{ fontSize: 11, color: CL.gold, fontWeight: 600, marginBottom: 8 }}>{uiText("TODAY'S JOBS:")}</div>}
              {todayJobs.map(job => {
                const client = data.clients.find(c => isSameId(c.id, job.clientId));
                const plannedH = calcHrs(makeISO(today, job.startTime), makeISO(today, job.endTime));
                const plannedHours = Math.floor(plannedH);
                const plannedMins = Math.round((plannedH - plannedHours) * 60);
                const isValidated = data.clockEntries.some(c => isSameId(c.employeeId, auth.employeeId) && isSameId(c.clientId, job.clientId) && toLocalDateKey(c.clockIn) === today);
                const adj = adjustHours[job.id];
                const isAdjusting = adj != null;
                return (
                  <div key={job.id} style={{ ...cardSt, marginBottom: 10, borderColor: isValidated ? CL.green + "60" : CL.bd, borderLeft: `4px solid ${isValidated ? CL.green : CL.gold}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{client?.name || "?"}</div>
                        <div style={{ fontSize: 12, color: CL.muted, marginTop: 2 }}>
                          {job.startTime || "--:--"} - {job.endTime || "--:--"} · {client?.address || ""}
                          {client?.address && <a href={mapsUrl(`${client.address} ${client.postalCode || ""} ${client.city || ""}`)} target="_blank" rel="noreferrer" style={{ color: CL.blue, marginLeft: 6, textDecoration: "underline" }}>{uiText("Map")}</a>}
                        </div>
                      </div>
                      {isValidated && <Badge color={CL.green}>{uiText("Validated")}</Badge>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: `1px solid ${CL.bd}`, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 13, color: CL.text }}>
                        <span style={{ color: CL.muted, marginRight: 6 }}>{uiText("Planned")}:</span>
                        <strong>{plannedHours}{uiText("h")}{plannedMins > 0 ? `${String(plannedMins).padStart(2, "0")}${uiText("min")}` : ""}</strong>
                      </div>
                      {!isValidated && !isAdjusting && (
                        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                          <button onClick={() => setAdjustHours(prev => ({ ...prev, [job.id]: { hours: plannedHours, minutes: plannedMins } }))} style={{ ...btnSec, ...btnSm, fontSize: 11 }}>{ICN.edit} {uiText("Adjust & Validate")}</button>
                          <button onClick={() => doValidateHours(job)} style={{ ...btnPri, ...btnSm, background: CL.green, fontSize: 12 }}>{ICN.check} {uiText("Validate")}</button>
                        </div>
                      )}
                    </div>
                    {!isValidated && isAdjusting && (
                      <div style={{ padding: "10px 0", borderTop: `1px solid ${CL.bd}` }}>
                        <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{uiText("Adjust hours if needed:")}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <NumberAdjustInput min={0} max={23} value={adj.hours} onChange={ev => setAdjustHours(prev => ({ ...prev, [job.id]: { ...prev[job.id], hours: ev.target.value } }))} />
                            <span style={{ color: CL.muted, fontSize: 12 }}>{uiText("h")}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <NumberAdjustInput min={0} max={59} value={adj.minutes} onChange={ev => setAdjustHours(prev => ({ ...prev, [job.id]: { ...prev[job.id], minutes: ev.target.value } }))} />
                            <span style={{ color: CL.muted, fontSize: 12 }}>{uiText("min")}</span>
                          </div>
                          <button onClick={() => doValidateHours(job)} style={{ ...btnPri, ...btnSm, background: CL.green, fontSize: 12 }}>{ICN.check} {uiText("Validate")}</button>
                          <button onClick={() => setAdjustHours(prev => { const n = { ...prev }; delete n[job.id]; return n; })} style={{ ...btnSec, ...btnSm, fontSize: 11 }}>{uiText("Cancel")}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {todayJobs.length === 0 && (
                <div style={{ ...cardSt, textAlign: "center", padding: 36, color: CL.muted }}>
                  <div style={{ marginBottom: 8 }}>{ICN.cal}</div>
                  <div style={{ fontSize: 13 }}>{uiText("No jobs scheduled for today")}</div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    )}

    {tab === "hours" && (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22 }}>{uiText("My Hours")}</h2>
          <TextInput type="month" value={monthFilter} onChange={ev => setMonthFilter(ev.target.value)} style={{ width: 160 }} />
        </div>
        <div className="stat-row" style={{ marginBottom: 18 }}>
          <StatCard label={uiText("Hours")} value={`${monthHours.toFixed(1)}h`} icon={ICN.clock} color={CL.blue} />
          <StatCard label={uiText("Days")} value={monthClocks.length} icon={ICN.cal} color={CL.green} />
        </div>
        <div style={cardSt} className="tbl-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr><th style={thSt}>{uiText("Date")}</th><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("Planned")}</th><th style={thSt}>{uiText("Hours")}</th><th style={thSt}>{uiText("Status")}</th></tr></thead>
            <tbody>
              {monthClocks.map(clk => { const client = data.clients.find(c => c.id === clk.clientId); const actualH = calcAccountedClockHours(clk, data.schedules); const plannedH = clk.plannedHours != null ? clk.plannedHours : actualH; return (
                <tr key={clk.id}><td style={tdSt}>{fmtDate(clk.clockIn)}</td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{plannedH.toFixed(2)}h</td><td style={{ ...tdSt, fontWeight: 600 }}>{actualH.toFixed(2)}h</td><td style={tdSt}><Badge color={CL.green}>{uiText("Validated")}</Badge></td></tr>
              ); })}
              {monthClocks.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No entries")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {tab === "photos" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>{t("photoUploads")}</h2>
        <div style={{ ...cardSt, marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: canUploadPhoto ? CL.green : CL.orange, marginBottom: 12 }}>
            {canUploadPhoto
              ? `${data.clients.find(c => c.id === photoClientId)?.name || uiText("Today's job")} — ${uiText("Photos")}`
              : uiText("No jobs scheduled for today")}
          </p>
          <Field label={uiText("Photo type")}>
            <SelectInput value={uploadType} onChange={ev => setUploadType(ev.target.value)} disabled={!canUploadPhoto}>
              <option value="before">{uiText("Before")}</option>
              <option value="after">{uiText("After")}</option>
              <option value="issue">{uiText("Issue / Damage Proof")}</option>
            </SelectInput>
          </Field>
          <Field label={uiText("Upload cleaning photo")}>
            <TextInput type="file" accept="image/*" disabled={!canUploadPhoto} onChange={ev => onUploadPhoto(ev.target.files?.[0])} />
          </Field>
          <Field label={uiText("Optional note")}>
            <TextArea value={uploadNote} onChange={ev => setUploadNote(ev.target.value)} disabled={!canUploadPhoto} placeholder={uiText("Add context for this photo")} />
          </Field>
        </div>
        <div style={cardSt}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.blue }}>{uiText("My Uploaded Photos")}</h3>
          {myUploads.map(up => (
            <div key={up.id} style={{ padding: "10px 0", borderBottom: `1px solid ${CL.bd}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: CL.muted }}>{fmtBoth(up.createdAt)} · {up.fileName}</div>
                <Badge color={up.type === "before" ? CL.blue : up.type === "after" ? CL.green : CL.orange}>{uiText(up.type || "issue")}</Badge>
              </div>
              <div style={{ fontSize: 12, color: CL.dim, marginBottom: 8 }}>
                Job: {data.clients.find(c => c.id === up.clientId)?.name || uiText("Unknown client")}
              </div>
              {up.note && <div style={{ fontSize: 12, color: CL.text, marginBottom: 8 }}>{up.note}</div>}
              {up.imageData && <img src={up.imageData} alt={up.fileName} style={{ width: "100%", maxWidth: 360, borderRadius: 8, border: `1px solid ${CL.bd}` }} />}
            </div>
          ))}
          {myUploads.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>{uiText("No photos uploaded yet")}</p>}
        </div>
      </div>
    )}

    {tab === "products" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>{t("products")}</h2>
        <div className="stat-row" style={{ marginBottom: 14 }}>
          <StatCard label={uiText("Requested")} value={`${myRequestedTotal}`} icon={ICN.doc} color={CL.blue} />
          <StatCard label={uiText("Received")} value={`${myReceivedTotal}`} icon={ICN.check} color={CL.green} />
          <StatCard label={uiText("In Hand")} value={`${myInHandTotal}`} icon={ICN.user} color={CL.green} />
          <StatCard label={uiText("Open Requests")} value={myProductRequests.filter(r => r.status === "pending").length} icon={ICN.clock} color={CL.orange} />
        </div>
        <div style={{ ...cardSt, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>{uiText("Products I Currently Have")}</h3>
          {myHoldings.map(h => {
            const prod = (data.inventoryProducts || []).find(p => p.id === h.productId);
            return <div key={h.id} style={{ padding: "8px 0", borderBottom: `1px solid ${CL.bd}` }}><div style={{ fontWeight: 600 }}>{prod?.name || uiText("Unknown product")}</div><div style={{ fontSize: 12, color: CL.muted }}>In hand: {h.qtyInHand} {prod?.unit || "pcs"} · Total assigned: {h.qtyAssigned || 0}</div></div>;
          })}
          {myHoldings.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>{uiText("No products currently assigned")}</p>}
        </div>

        <div style={{ ...cardSt, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>{uiText("Request Products")}</h3>
          <div className="form-grid">
            <Field label={uiText("Product")}><SelectInput value={productForm.productId} onChange={ev => setProductForm(v => ({ ...v, productId: ev.target.value }))}><option value="">{uiText("Select...")}</option>{inventoryProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock || 0} {p.unit || "pcs"} {uiText("in stock")})</option>)}</SelectInput></Field>
            <Field label={uiText("Quantity")}><TextInput type="number" min={1} value={productForm.quantity} onChange={ev => setProductForm(v => ({ ...v, quantity: ev.target.value }))} /></Field>
            <Field label={uiText("Delivery Date & Time")}><TextInput type="datetime-local" value={productForm.deliveryAt} onChange={ev => setProductForm(v => ({ ...v, deliveryAt: ev.target.value }))} /></Field>
          </div>
          <Field label={uiText("Note")}><TextArea value={productForm.note} onChange={ev => setProductForm(v => ({ ...v, note: ev.target.value }))} placeholder={uiText("Need for upcoming jobs, preferred handover location...")} /></Field>
          <button style={btnPri} onClick={submitProductRequest}>{uiText("Submit Request")}</button>
        </div>
        <div style={cardSt}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.blue }}>{uiText("My Product Requests")}</h3>
          {myProductRequests.map(req => { const prod = inventoryProducts.find(p => p.id === req.productId) || (data.inventoryProducts || []).find(p => p.id === req.productId); return (
            <div key={req.id} style={{ padding: "10px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{prod?.name || uiText("Unknown product")} · {uiText("Qty")} {req.quantity}</div>
                <div style={{ fontSize: 12, color: CL.muted }}>{uiText("Requested:")} {fmtBoth(req.createdAt)}{req.deliveryAt ? ` · ${uiText("Delivery:")} ${fmtBoth(req.deliveryAt)}` : ""}</div>
                {req.note && <div style={{ fontSize: 12, color: CL.dim }}>{req.note}</div>}
                <div style={{ fontSize: 12, color: CL.text }}>{uiText("Approved")}: {req.approvedQty || 0} · {uiText("Received")}: {req.deliveredQty || 0}</div>
              </div>
              <Badge color={req.status === "delivered" ? CL.green : req.status === "rejected" ? CL.red : req.status === "approved" ? CL.blue : CL.orange}>{uiText(req.status)}</Badge>
            </div>
          ); })}
          {myProductRequests.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>{uiText("No product requests yet")}</p>}
        </div>
      </div>
    )}

    {tab === "timeoff" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>{t("conges")}</h2>
        <div className="stat-row" style={{ marginBottom: 14 }}>
          <StatCard label={uiText("Allowance (days)")} value={`${leaveSummary.allowance}d`} icon={ICN.cal} color={CL.blue} />
          <StatCard label={uiText("Approved (days)")} value={`${leaveSummary.approvedDays}d`} icon={ICN.check} color={CL.green} />
          <StatCard label={uiText("Remaining (days)")} value={`${leaveSummary.remaining}d`} icon={ICN.clock} color={CL.gold} />
        </div>
        <div style={{ ...cardSt, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>{uiText("New Leave Request")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            <Field label={uiText("Start Date")}><DatePicker value={timeOffForm.startDate} onChange={ev => setTimeOffForm(v => ({ ...v, startDate: ev.target.value }))} /></Field>
            <Field label={uiText("End Date")}><DatePicker value={timeOffForm.endDate} onChange={ev => setTimeOffForm(v => ({ ...v, endDate: ev.target.value }))} /></Field>
          </div>
          <Field label={uiText("Type")}><SelectInput value={timeOffForm.leaveType} onChange={ev => setTimeOffForm(v => ({ ...v, leaveType: ev.target.value }))}><option value="conge">{uiText("Leave")}</option><option value="maladie">{uiText("Sick Leave")}</option></SelectInput></Field>
          <Field label={uiText("Reason")}><TextArea value={timeOffForm.reason} onChange={ev => setTimeOffForm(v => ({ ...v, reason: ev.target.value }))} placeholder={uiText("Vacation, personal, medical, etc.")} /></Field>
          <button onClick={submitTimeOff} style={btnPri}>{uiText("Submit Request")}</button>
        </div>
        <div style={cardSt}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.blue }}>{uiText("My Request Status")}</h3>
          {myTimeOffRequests.map(req => (
            <div key={req.id} style={{ padding: "10px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{fmtDate(req.startDate)} - {fmtDate(req.endDate)} ({leaveDaysInclusive(req.startDate, req.endDate)}d)</div>
                <div style={{ fontSize: 12, color: CL.muted }}>{req.leaveType === "maladie" ? uiText("Sick Leave") : uiText("Leave")} · {req.reason || uiText("No reason provided")}</div>
                {req.reviewedAt && <div style={{ fontSize: 11, color: CL.dim }}>{uiText("Reviewed")} {fmtBoth(req.reviewedAt)} {req.reviewNote ? `· ${req.reviewNote}` : ""}</div>}
              </div>
              <Badge color={req.status === "approved" ? CL.green : req.status === "rejected" ? CL.red : CL.orange}>{uiText(req.status)}</Badge>
            </div>
          ))}
          {myTimeOffRequests.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>{uiText("No leave requests submitted yet")}</p>}
        </div>
      </div>
    )}

    {tab === "profile" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>{uiText("My Profile")}</h2>
        {/* Profile Picture Card */}
        <div style={{ ...cardSt, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: CL.blue }}>{uiText("Profile Picture")}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: CL.s2, border: `2px solid ${CL.bd}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {emp?.profilePicture
                ? <img src={emp.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 38, color: CL.muted }}>{ICN.user}</span>}
            </div>
            <div>
              <p style={{ fontSize: 13, color: CL.muted, marginBottom: 10 }}>{uiText("Upload a photo to personalise your profile.")}</p>
              <label style={{ ...btnPri, cursor: "pointer", display: "inline-block", opacity: profilePicSaving ? 0.6 : 1 }}>
                {profilePicSaving ? uiText("Saving...") : uiText("Upload Photo")}
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={profilePicSaving} onChange={ev => handleCleanerProfilePicChange(ev.target.files?.[0])} />
              </label>
              {emp?.profilePicture && (
                <button style={{ ...btnSec, ...btnSm, color: CL.red, marginLeft: 8 }} onClick={handleRemoveCleanerProfilePic} disabled={profilePicSaving}>
                  {uiText("Remove")}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Personal Info Card (read-only, from DB) */}
        <div style={cardSt}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: CL.blue }}>{uiText("Personal Information")}</h3>
          <p style={{ fontSize: 11, color: CL.muted, marginBottom: 14 }}>{uiText("Your information is managed by the owner. Contact them to make changes.")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "10px 20px" }}>
            {[
              ["Full Name", emp?.name],
              ["Role", emp?.role],
              ["Email", emp?.email],
              ["Phone", emp?.phone],
              ["Mobile", emp?.phoneMobile],
              ["Address", emp?.address],
              ["City", emp?.city],
              ["Postal Code", emp?.postalCode],
              ["Country", emp?.country],
              ["Date of Birth", emp?.dateOfBirth ? fmtDate(emp.dateOfBirth) : null],
              ["Nationality", emp?.nationality],
              ["Languages", emp?.languages],
              ["Transport", emp?.transport],
              ["Emergency Contact", emp?.emergencyName],
              ["Emergency Phone", emp?.emergencyPhone],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ padding: "8px 0", borderBottom: `1px solid ${CL.bd}` }}>
                <div style={{ fontSize: 11, color: CL.muted, marginBottom: 2 }}>{uiText(label)}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
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
function DashboardListCard({ title, count, color = CL.gold, emptyText, items, initialVisible = 4 }) {
const [expanded, setExpanded] = useState(false);
const safeInitialVisible = Math.max(1, initialVisible);
const visibleCount = expanded ? count : Math.min(count, safeInitialVisible);
const hasMore = count > safeInitialVisible;

return (
<div style={cardSt}>
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, color }}>{title} ({count})</h3>
{count > 0 && <span style={{ fontSize: 11, color: CL.muted }}>{uiText("Showing")} {visibleCount} {uiText("of")} {count}</span>}
</div>
{count === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>{emptyText}</p> : items.slice(0, visibleCount)}
{hasMore && (
  <button
    type="button"
    style={{ ...btnSec, ...btnSm, alignSelf: "flex-start" }}
    onClick={() => setExpanded(prev => !prev)}
  >
    {expanded ? uiText("Show less") : `${uiText("Show all")} (${count})`}
  </button>
)}
</div>
);
}

function DashboardPage({ data, auth }) {
const todayStr = getToday();
const next7Days = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
const todayScheds = data.schedules.filter(s => s.date === todayStr && s.status !== "cancelled");
const tomorrowStr = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const tomorrowScheds = data.schedules.filter(s => s.date === tomorrowStr && s.status !== "cancelled");
const todayValidatedCount = data.clockEntries.filter(c => toLocalDateKey(c.clockIn) === todayStr && c.clockOut).length;
const todayPendingScheds = todayScheds.filter(s => !data.clockEntries.some(c => c.employeeId === s.employeeId && c.clientId === s.clientId && toLocalDateKey(c.clockIn) === todayStr));
const activeEmployees = data.employees.filter(e => e.status === "active").length;
const monthStr = todayStr.slice(0, 7);
const monthRev = data.invoices.filter(inv => inv.date?.startsWith(monthStr)).reduce((sum, inv) => sum + (inv.total || 0), 0);
const unpaidTotal = data.invoices.filter(inv => inv.status === "sent" || inv.status === "overdue").reduce((sum, inv) => sum + (inv.total || 0), 0);
const overdueInvoices = data.invoices.filter(inv => effectiveInvoiceStatus(inv) === "overdue");
const pendingLeave = (data.timeOffRequests || []).filter(r => r.status === "pending").length;
const pendingProducts = (data.productRequests || []).filter(r => r.status === "pending").length;
const unseenUploads = (data.photoUploads || []).filter(u => !u.seenByOwner).length;
const next7Scheds = data.schedules.filter(s => s.date > todayStr && s.date <= next7Days && s.status !== "cancelled").sort((a, b) => a.date.localeCompare(b.date));
const _dashTodayDay = new Date().getDate();
const dashExpOverdue = (data.expenses || []).filter(exp => exp.isActive !== false && !((exp.payments || []).some(p => p.month === monthStr)) && exp.dueDay < _dashTodayDay);
const dashExpDueToday = (data.expenses || []).filter(exp => exp.isActive !== false && !((exp.payments || []).some(p => p.month === monthStr)) && exp.dueDay === _dashTodayDay);
const dashExpDueSoon = (data.expenses || []).filter(exp => exp.isActive !== false && !((exp.payments || []).some(p => p.month === monthStr)) && exp.dueDay > _dashTodayDay && exp.dueDay <= _dashTodayDay + 3);

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 5 }}>{uiText("Dashboard")}</h1>
<p style={{ color: CL.muted, marginBottom: 18 }}>{new Date().toLocaleDateString(localeForLang(CURRENT_LANG), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>

{/* Pending alerts */}
{(pendingLeave > 0 || pendingProducts > 0 || unseenUploads > 0 || overdueInvoices.length > 0 || dashExpOverdue.length > 0 || dashExpDueToday.length > 0 || dashExpDueSoon.length > 0) && (
  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
    {pendingLeave > 0 && <div style={{ background: CL.orange + "20", border: `1px solid ${CL.orange}40`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: CL.orange, fontWeight: 600 }}>⏳ {pendingLeave} {uiText(pendingLeave > 1 ? "leave requests" : "leave request")} {uiText("pending")}</div>}
    {pendingProducts > 0 && <div style={{ background: CL.blue + "20", border: `1px solid ${CL.blue}40`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: CL.blue, fontWeight: 600 }}>📦 {pendingProducts} {uiText(pendingProducts > 1 ? "product requests" : "product request")} {uiText("pending")}</div>}
    {unseenUploads > 0 && <div style={{ background: CL.gold + "20", border: `1px solid ${CL.gold}40`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: CL.gold, fontWeight: 600 }}>📷 {unseenUploads} {uiText(unseenUploads > 1 ? "new photos" : "new photo")} {uiText("uploaded")}</div>}
    {overdueInvoices.length > 0 && <div style={{ background: CL.red + "20", border: `1px solid ${CL.red}40`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: CL.red, fontWeight: 600 }}>⚠️ {overdueInvoices.length} {uiText(overdueInvoices.length > 1 ? "overdue invoices" : "overdue invoice")}</div>}
    {dashExpOverdue.map(exp => <div key={exp.id} style={{ background: CL.red + "20", border: `1px solid ${CL.red}40`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: CL.red, fontWeight: 600 }}>💸 ! {exp.name} — €{(exp.amount||0).toFixed(2)} {uiText("overdue")}</div>)}
    {dashExpDueToday.map(exp => <div key={exp.id} style={{ background: CL.orange + "20", border: `1px solid ${CL.orange}40`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: CL.orange, fontWeight: 600 }}>💳 ! {exp.name} — €{(exp.amount||0).toFixed(2)} {uiText("due today")}</div>)}
    {dashExpDueSoon.map(exp => <div key={exp.id} style={{ background: CL.gold + "20", border: `1px solid ${CL.gold}40`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: CL.goldLight, fontWeight: 600 }}>📅 {exp.name} — €{(exp.amount||0).toFixed(2)} {uiText("due in")} {exp.dueDay - _dashTodayDay} {uiText("days")}</div>)}
  </div>
)}

<div className="stat-row" style={{ marginBottom: 22 }}>
<StatCard label={uiText("Today's Jobs")} value={todayScheds.length} icon={ICN.cal} color={CL.blue} />
<StatCard label={uiText("Validated")} value={todayValidatedCount} icon={ICN.check} color={CL.green} />
<StatCard label={uiText("Active Staff")} value={`${activeEmployees}/${data.employees.length}`} icon={ICN.team} color={CL.gold} />
{auth?.role !== "manager" && <StatCard label={uiText("Month Rev")} value={`€${monthRev.toFixed(0)}`} icon={ICN.chart} color={CL.goldLight} />}
{auth?.role !== "manager" && unpaidTotal > 0 && <StatCard label={uiText("Unpaid")} value={`€${unpaidTotal.toFixed(0)}`} icon={ICN.pay} color={CL.red} />}
</div>
<div className="grid-2">
<DashboardListCard
title={uiText("Today's Schedule")}
count={todayScheds.length}
color={CL.gold}
emptyText={uiText("No jobs scheduled today")}
initialVisible={4}
items={todayScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
const isJobValidated = data.clockEntries.some(c => c.employeeId === sched.employeeId && c.clientId === sched.clientId && toLocalDateKey(c.clockIn) === sched.date && c.clockOut);
return (
<div key={sched.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between", gap: 8 }}>
<div>
<div style={{ fontWeight: 600, fontSize: 13 }}>{client?.name || "Unassigned"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{employee?.name || "—"} · {sched.startTime}–{sched.endTime}</div>
</div>
<Badge color={isJobValidated ? CL.green : scheduleStatusColor(sched.status)}>{isJobValidated ? uiText("Validated") : uiText(sched.status)}</Badge>
</div>
);
})}
/>
<DashboardListCard
title={uiText("Tomorrow")}
count={tomorrowScheds.length}
color={CL.gold}
emptyText={uiText("Nothing scheduled")}
initialVisible={4}
items={tomorrowScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
return (
<div key={sched.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ fontWeight: 600, fontSize: 13 }}>{client?.name || "Unassigned"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{employee?.name || "—"} · {sched.startTime}–{sched.endTime}</div>
</div>
);
})}
/>
<DashboardListCard
title={uiText("pending validation")}
count={todayPendingScheds.length}
color={CL.orange}
emptyText={uiText("All validated")}
initialVisible={3}
items={todayPendingScheds.map(sched => {
const employee = data.employees.find(e => e.id === sched.employeeId);
const client = data.clients.find(c => c.id === sched.clientId);
const plannedH = calcHrs(makeISO(sched.date, sched.startTime), makeISO(sched.date, sched.endTime));
return (
<div key={sched.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ fontWeight: 600, fontSize: 13 }}>{employee?.name || "?"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{client?.name || "?"} · {sched.startTime}-{sched.endTime}</div>
<div style={{ fontSize: 11, color: CL.orange }}>{plannedH.toFixed(1)}h {uiText("planned")}</div>
</div>
);
})}
/>
<DashboardListCard
title={uiText("Next 7 Days")}
count={next7Scheds.length}
color={CL.gold}
emptyText={uiText("Nothing upcoming")}
initialVisible={6}
items={next7Scheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
return (
<div key={sched.id} style={{ padding: "6px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div><div style={{ fontWeight: 600, fontSize: 13 }}>{client?.name || "Unassigned"}</div><div style={{ fontSize: 11, color: CL.muted }}>{employee?.name || "—"} · {sched.startTime}–{sched.endTime}</div></div>
<div style={{ fontSize: 11, color: CL.muted, textAlign: "right" }}>{fmtDate(sched.date)}</div>
</div>
</div>
);
})}
/>
{auth?.role !== "manager" && <DashboardListCard
title={uiText("Recent Invoices")}
count={data.invoices.length}
color={CL.gold}
emptyText={uiText("No invoices yet")}
initialVisible={5}
items={data.invoices.slice().reverse().map(inv => {
const client = data.clients.find(c => c.id === inv.clientId);
return (
<div key={inv.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between" }}>
<div><div style={{ fontWeight: 600, fontSize: 13 }}>{inv.invoiceNumber}</div><div style={{ fontSize: 11, color: CL.muted }}>{client?.name}</div></div>
<div style={{ textAlign: "right" }}><div style={{ fontWeight: 600 }}>€{(inv.total || 0).toFixed(2)}</div><Badge color={inv.status === "paid" ? CL.green : inv.status === "overdue" ? CL.red : CL.muted}>{inv.status}</Badge></div>
</div>
);
})}
/>}
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
const [statusFilter, setStatusFilter] = useState("all");
const [groupFilter, setGroupFilter] = useState("all");

const emptyEmployee = {
name: "", email: "", phone: "", phoneMobile: "", address: "", city: "Luxembourg", postalCode: "", country: "Luxembourg",
role: "Cleaner", hourlyRate: 15, weeklyHours: 0, startDate: getToday(), contractEndDate: "", status: "active", notes: "", bankIban: "", socialSecNumber: "",
pin: "0000", dateOfBirth: "", nationality: "", contractType: "CDI", workPermit: "", emergencyName: "", emergencyPhone: "",
username: "",
languages: "", transport: "", leaveAllowance: 26, cleanerGroup: "", hiringStage: "hired",
profilePicture: "",
};

const handleSave = async (empData) => {
const { pin: empPin, username: empUsername, profilePicture, ...empFields } = empData;
const pinValue = empPin || "0000";
const normalizedUsername = String(empUsername || "").trim().toLowerCase();
const apiErrorMessage = (err, fallback) => {
  const msg = err?.message;
  return !msg || /load failed|failed to fetch/i.test(msg) ? fallback : msg;
};
try {
if (empData.id) {
await syncEmployeeToApi(empFields, pinValue, normalizedUsername);
await syncEmployeePinToApi(empData.id, pinValue);
if (profilePicture !== undefined) await syncProfilePictureToApi(empData.id, profilePicture).catch(() => {});
updateData("employees", prev => prev.map(e => e.id === empData.id ? { ...empFields, profilePicture: profilePicture || e.profilePicture } : e));
updateData("employeePins", prev => ({ ...prev, [empData.id]: pinValue }));
updateData("employeeUsernames", prev => ({ ...prev, [empData.id]: normalizedUsername }));
showToast("Employee updated", "success");
} else {
const newId = makeId();
const newEmp = { ...empFields, id: newId, profilePicture: profilePicture || "" };
await createEmployeeInApi(newEmp, pinValue, normalizedUsername);
if (profilePicture) await syncProfilePictureToApi(newId, profilePicture).catch(() => {});
updateData("employees", prev => [...prev, newEmp]);
updateData("employeePins", prev => ({ ...prev, [newId]: pinValue }));
updateData("employeeUsernames", prev => ({ ...prev, [newId]: normalizedUsername }));
showToast("Employee added", "success");
}
setModal(null);
} catch (err) {
console.error(err);
showToast(apiErrorMessage(err, "Unable to save employee"), "error");
}
};

const handleDelete = async (id) => {
try {
await deleteEmployeeFromApi(id);
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
showToast("Deleted", "success");
setDeleteId(null);
} catch (err) {
console.error(err);
const msg = err?.message;
showToast(!msg || /load failed|failed to fetch/i.test(msg) ? "Unable to delete employee" : msg, "error");
}
};

const q = search.toLowerCase();
const locationGroups = Array.from(new Set((data.employees || []).map(e => (e.cleanerGroup || e.city || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
const preferredCountByEmployee = (data.clients || []).reduce((acc, client) => {
  (client.preferredCleanerIds || []).forEach(id => { acc[id] = (acc[id] || 0) + 1; });
  return acc;
}, {});
const qLower = q.toLowerCase();
const filtered = data.employees.filter(e => {
  const matchesSearch = !qLower || e.name.toLowerCase().includes(qLower) || (e.role || "").toLowerCase().includes(qLower) || (e.email || "").toLowerCase().includes(qLower) || (e.phone || "").includes(qLower) || (e.phoneMobile || "").includes(qLower) || (e.city || "").toLowerCase().includes(qLower) || (e.cleanerGroup || "").toLowerCase().includes(qLower);
  const matchesStatus = statusFilter === "all" || e.status === statusFilter;
  const empGroup = (e.cleanerGroup || e.city || "").trim();
  const matchesGroup = groupFilter === "all" || empGroup === groupFilter;
  return matchesSearch && matchesStatus && matchesGroup;
});

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{uiText("Employees")} <span style={{ fontSize: 14, color: CL.muted, fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}>({filtered.length}/{data.employees.length})</span></h1>
<button style={btnPri} onClick={() => setModal({ ...emptyEmployee })}>{ICN.plus} {uiText("Add")}</button>
</div>
<div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
<div style={{ flex: 1, minWidth: 200, position: "relative" }}>
  <TextInput placeholder={uiText("Search by name, role, email, phone...")} value={search} onChange={ev => setSearch(ev.target.value)} style={{ paddingLeft: 34 }} />
  <span style={{ position: "absolute", left: 10, top: 10, color: CL.muted }}>{ICN.search}</span>
</div>
<SelectInput value={statusFilter} onChange={ev => setStatusFilter(ev.target.value)} style={{ width: 140 }}>
  <option value="all">{uiText("All Statuses")}</option>
  <option value="active">{uiText("Active")}</option>
  <option value="inactive">{uiText("Inactive")}</option>
</SelectInput>

<SelectInput value={groupFilter} onChange={ev => setGroupFilter(ev.target.value)} style={{ width: 190 }}>
  <option value="all">{uiText("All Locations")}</option>
  {locationGroups.map(group => <option key={group} value={group}>{group}</option>)}
</SelectInput>
</div>
<div style={cardSt} className="tbl-wrap">
<table className="employees-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead>
<tr>
  <th style={thSt} className="emp-name-cell">{uiText("Name")}</th>
  <th style={thSt} className="emp-location-cell">{uiText("Location Group")}</th>
  <th style={thSt} className="emp-role-cell">{uiText("Role")}</th>
  <th style={thSt} className="emp-rate-cell">{uiText("Rate")}</th>
  <th style={thSt} className="emp-contact-cell">{uiText("Contact")}</th>
  <th style={thSt} className="emp-stage-cell">{uiText("Stage")}</th>
  <th style={thSt} className="emp-assigned-cell">{uiText("Assigned Clients")}</th>
  <th style={thSt} className="emp-username-cell">{uiText("Username")}</th>
  <th style={thSt} className="emp-password-cell">{uiText("Password")}</th>
  <th style={thSt} className="emp-status-cell">{uiText("Status")}</th>
  <th style={thSt} className="emp-actions-cell">{uiText("Actions")}</th>
</tr>
</thead>
<tbody>
{filtered.map(emp => (
<tr key={emp.id}>
<td style={tdSt} className="emp-name-cell"><div style={{ display: "flex", alignItems: "center", gap: 8 }}>{emp.profilePicture ? <img src={emp.profilePicture} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 32, height: 32, borderRadius: "50%", background: CL.s2, display: "flex", alignItems: "center", justifyContent: "center", color: CL.muted, flexShrink: 0 }}>{ICN.user}</div>}<div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, lineHeight: 1.3 }}>{emp.name}</div><div style={{ fontSize: 11, color: CL.muted }}>{emp.nationality ? `${emp.nationality} · ` : ""}{emp.languages || ""}</div></div></div></td>
<td style={tdSt} className="emp-location-cell"><div style={{ fontWeight: 600, lineHeight: 1.3 }}>{emp.cleanerGroup || emp.city || "-"}</div><div style={{ fontSize: 11, color: CL.muted }}>{emp.city || uiText("No city")}</div></td>
<td style={tdSt} className="emp-role-cell">{emp.role}</td>
<td style={tdSt} className="emp-rate-cell">€{Number(emp.hourlyRate).toFixed(2)}/hr</td>
<td style={tdSt} className="emp-contact-cell"><div style={{ fontSize: 12, whiteSpace: "nowrap" }}>{emp.phone || "-"}</div><div style={{ fontSize: 11, color: CL.muted, overflowWrap: "anywhere" }}>{emp.email || "-"}</div></td>
<td style={tdSt} className="emp-stage-cell"><Badge color={(emp.hiringStage || "hired") === "standby" ? CL.orange : CL.green}>{(emp.hiringStage || "hired") === "standby" ? uiText("Standby") : uiText("Hired")}</Badge></td>
<td style={tdSt} className="emp-assigned-cell">{preferredCountByEmployee[emp.id] || 0}</td>
<td style={tdSt} className="emp-username-cell"><code className="emp-code" style={{ background: CL.s2, padding: "2px 5px", borderRadius: 4, fontSize: 12 }}>{data.employeeUsernames?.[emp.id] || uiText("(email/full name)")}</code></td>
<td style={tdSt} className="emp-password-cell"><code style={{ background: CL.s2, padding: "2px 5px", borderRadius: 4, fontSize: 12 }}>{data.employeePins?.[emp.id] || "0000"}</code></td>
<td style={tdSt} className="emp-status-cell"><Badge color={emp.status === "active" ? CL.green : CL.red}>{emp.status}</Badge></td>
<td style={tdSt} className="emp-actions-cell">
<div style={{ display: "flex", gap: 4 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...emp, pin: data.employeePins?.[emp.id] || "0000", username: data.employeeUsernames?.[emp.id] || "" })}>{ICN.edit}</button>
<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => setDeleteId(emp.id)}>{ICN.trash}</button>
</div>
</td>
</tr>
))}
{filtered.length === 0 && <tr><td colSpan={11} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No employees")}</td></tr>}
</tbody>
</table>
</div>

  {deleteId && (
    <ModalBox title={uiText("Delete?")} onClose={() => setDeleteId(null)}>
      <p style={{ marginBottom: 16 }}>{uiText("Remove this employee?")}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={() => setDeleteId(null)}>{uiText("Cancel")}</button>
        <button style={btnDng} onClick={() => handleDelete(deleteId)}>{uiText("Delete")}</button>
      </div>
    </ModalBox>
  )}

  {modal && (
    <ModalBox title={uiText(modal.id ? "Edit Employee" : "Add Employee")} onClose={() => setModal(null)}>
      <EmployeeForm initialData={modal} onSave={handleSave} onCancel={() => setModal(null)} customRoles={data.settings?.customRoles || []} existingEmployees={data.employees || []} />
    </ModalBox>
  )}
</div>

);
}

const BUILTIN_ROLES = ["Manager", "Cleaning Agent", "Cleaner", "Senior Cleaner", "Team Lead", "Supervisor"];
const EMPLOYEE_CITY_OPTIONS = ["Luxembourg", "Esch-sur-Alzette", "Differdange", "Dudelange", "Ettelbruck", "Diekirch", "Wiltz", "Grevenmacher", "Remich", "Mersch", "Strassen", "Bertrange", "Hesperange", "Sandweiler"];
const COUNTRY_OPTIONS = ["Luxembourg", "France", "Belgium", "Germany", "Portugal", "Italy", "Spain", "Netherlands", "Romania", "Poland", "Cape Verde", "Brazil", "Morocco", "Ukraine"];
const NATIONALITY_OPTIONS = ["Luxembourgish", "Portuguese", "French", "Belgian", "German", "Italian", "Spanish", "Dutch", "Romanian", "Polish", "Cape Verdean", "Brazilian", "Moroccan", "Ukrainian"];
const LANGUAGE_OPTIONS = ["French", "English", "German", "Luxembourgish", "Portuguese", "Italian", "Spanish", "Dutch", "Romanian", "Polish", "Arabic", "Ukrainian"];

function EmployeeForm({ initialData, onSave, onCancel, customRoles, existingEmployees = [] }) {
const [form, setForm] = useState(() => ({
  ...initialData,
  languages: Array.isArray(initialData.languages)
    ? initialData.languages
    : String(initialData.languages || "").split(",").map(v => v.trim()).filter(Boolean),
}));
const [activeTab, setActiveTab] = useState("basic");

const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
const cityOptions = Array.from(new Set([...EMPLOYEE_CITY_OPTIONS, ...existingEmployees.map(e => e.city).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
const countryOptions = Array.from(new Set([...COUNTRY_OPTIONS, ...existingEmployees.map(e => e.country).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
const nationalityOptions = Array.from(new Set([...NATIONALITY_OPTIONS, ...existingEmployees.map(e => e.nationality).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
const languageOptions = Array.from(new Set([...LANGUAGE_OPTIONS, ...existingEmployees.flatMap(e => String(e.languages || "").split(",").map(v => v.trim()).filter(Boolean))])).sort((a, b) => a.localeCompare(b));

const handleProfilePicChange = async (file) => {
  if (!file) return;
  if (!file.type?.startsWith("image/")) return;
  const fr = new FileReader();
  fr.onload = () => set("profilePicture", fr.result);
  fr.readAsDataURL(file);
};

const tabs = [
{ id: "basic", label: uiText("Basic Info") },
{ id: "personal", label: uiText("Personal") },
{ id: "work", label: uiText("Work & Pay") },
{ id: "operations", label: uiText("Operations") },
{ id: "emergency", label: uiText("Emergency") },
];

return (
<div>
<FormTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

  {activeTab === "basic" && (
    <div className="form-grid">
      <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: CL.s2, border: `2px solid ${CL.bd}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {form.profilePicture
            ? <img src={form.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 28, color: CL.muted }}>{ICN.user}</span>}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{uiText("Profile Picture")}</div>
          <label style={{ ...btnSec, ...btnSm, cursor: "pointer", display: "inline-block" }}>
            {uiText("Upload Photo")}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={ev => handleProfilePicChange(ev.target.files?.[0])} />
          </label>
          {form.profilePicture && (
            <button style={{ ...btnSec, ...btnSm, color: CL.red, marginLeft: 6 }} onClick={() => set("profilePicture", "")}>
              {uiText("Remove")}
            </button>
          )}
        </div>
      </div>
      <Field label="Full Name *"><TextInput value={form.name} onChange={ev => set("name", ev.target.value)} /></Field>
      <Field label="Role">
        <SelectInput value={form.role} onChange={ev => set("role", ev.target.value)}>
          {BUILTIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          {(customRoles || []).length > 0 && <option disabled>──────────</option>}
          {(customRoles || []).map(r => <option key={r} value={r}>{r}</option>)}
        </SelectInput>
      </Field>
      <Field label="Email"><TextInput type="email" value={form.email} onChange={ev => set("email", ev.target.value)} /></Field>
      <Field label="Phone"><TextInput value={form.phone} onChange={ev => set("phone", ev.target.value)} placeholder="+352 ..." /></Field>
      <Field label="Mobile"><TextInput value={form.phoneMobile || ""} onChange={ev => set("phoneMobile", ev.target.value)} placeholder="+352 ..." /></Field>
      <Field label="Login Username"><TextInput value={form.username || ""} onChange={ev => set("username", ev.target.value.toLowerCase())} placeholder="optional custom username" /></Field>
      <Field label="Login Password"><TextInput maxLength={24} value={form.pin || "0000"} onChange={ev => set("pin", ev.target.value)} /></Field>
      <div style={{ gridColumn: "1/-1" }}><Field label="Address"><TextInput value={form.address} onChange={ev => set("address", ev.target.value)} placeholder="Street & house number" /></Field></div>
      <Field label="Postal Code"><TextInput value={form.postalCode || ""} onChange={ev => set("postalCode", ev.target.value)} placeholder="L-1234" /></Field>
      <Field label="City">
        <SearchableSelectInput
          options={cityOptions.map(city => ({ value: city, label: city }))}
          value={form.city || ""}
          onChange={(value) => set("city", value)}
          placeholder={uiText("Select...")}
          searchThreshold={0}
        />
      </Field>
      <Field label="Country">
        <SearchableSelectInput
          options={countryOptions.map(country => ({ value: country, label: country }))}
          value={form.country || ""}
          onChange={(value) => set("country", value)}
          placeholder={uiText("Select...")}
          searchThreshold={0}
        />
      </Field>
    </div>
  )}

  {activeTab === "personal" && (
    <div className="form-grid">
      <Field label="Date of Birth"><DatePicker value={form.dateOfBirth || ""} onChange={ev => set("dateOfBirth", ev.target.value)} /></Field>
      <Field label="Nationality">
        <SearchableSelectInput
          options={nationalityOptions.map(nationality => ({ value: nationality, label: nationality }))}
          value={form.nationality || ""}
          onChange={(value) => set("nationality", value)}
          placeholder={uiText("Select...")}
          searchThreshold={0}
        />
      </Field>
      <Field label="Languages">
        <MultiSelectInput
          options={languageOptions.map(language => ({ value: language, label: language }))}
          value={Array.isArray(form.languages) ? form.languages : []}
          onChange={(values) => set("languages", values)}
          placeholder={uiText("Select...")}
          noResultsLabel="No results"
          searchThreshold={0}
        />
      </Field>
      <Field label="Social Security No."><TextInput value={form.socialSecNumber || ""} onChange={ev => set("socialSecNumber", ev.target.value)} /></Field>
      <Field label="Transport">
        <SelectInput value={form.transport || ""} onChange={ev => set("transport", ev.target.value)}>
          <option value="">{uiText("Select...")}</option><option value="Car">{uiText("Car")}</option><option value="Public Transport">{uiText("Public Transport")}</option><option value="Bicycle">{uiText("Bicycle")}</option><option value="Walking">{uiText("Walking")}</option>
        </SelectInput>
      </Field>
    </div>
  )}

  {activeTab === "work" && (
    <div className="form-grid">
      <Field label={uiText("Hourly Rate (€)")}><TextInput type="number" step=".5" value={form.hourlyRate} onChange={ev => set("hourlyRate", parseFloat(ev.target.value) || 0)} /></Field>
      <Field label={uiText("Weekly hours (contract)")}><TextInput type="number" step="0.5" min={0} value={form.weeklyHours ?? 0} onChange={ev => set("weeklyHours", parseFloat(ev.target.value) || 0)} placeholder={uiText("e.g. 38")} /></Field>
      <Field label={uiText("Vacation allowance (days/year)")}><TextInput type="number" min={0} value={form.leaveAllowance ?? 26} onChange={ev => set("leaveAllowance", Math.max(0, parseInt(ev.target.value || "0", 10) || 0))} /></Field>
      <Field label="Contract Type">
        <SelectInput value={form.contractType || "CDI"} onChange={ev => set("contractType", ev.target.value)}>
          <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Mini-job">{uiText("Mini-job")}</option><option value="Freelance">{uiText("Freelance")}</option><option value="Student">{uiText("Student")}</option>
        </SelectInput>
      </Field>
      <Field label="Start Date"><DatePicker value={form.startDate} onChange={ev => set("startDate", ev.target.value)} /></Field>
      <Field label="End Date"><DatePicker value={form.contractEndDate || ""} onChange={ev => set("contractEndDate", ev.target.value)} /></Field>
      <Field label="Work Permit #"><TextInput value={form.workPermit || ""} onChange={ev => set("workPermit", ev.target.value)} placeholder="If applicable" /></Field>
      <Field label="Bank IBAN"><TextInput value={form.bankIban || ""} onChange={ev => set("bankIban", ev.target.value)} placeholder="LU..." /></Field>
      <Field label="Status">
        <SelectInput value={form.status} onChange={ev => set("status", ev.target.value)}>
          <option value="active">{uiText("Active")}</option><option value="inactive">{uiText("Inactive")}</option>
        </SelectInput>
      </Field>
    </div>
  )}

  {activeTab === "operations" && (
    <div className="form-grid">
      <Field label={uiText("Cleaner Location Group")}><TextInput value={form.cleanerGroup || ""} onChange={ev => set("cleanerGroup", ev.target.value)} placeholder="Luxembourg City Team" /></Field>
      <Field label={uiText("Hiring Stage")}>
        <SelectInput value={form.hiringStage || "hired"} onChange={ev => set("hiringStage", ev.target.value)}>
          <option value="hired">{uiText("Hired")}</option>
          <option value="standby">{uiText("Standby / Potential")}</option>
        </SelectInput>
      </Field>
      <div style={{ gridColumn: "1/-1", fontSize: 12, color: CL.muted }}>{uiText("Tip: use Standby for potential cleaners you want to keep in your contact pipeline.")}</div>
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
    <button style={btnSec} onClick={onCancel}>{uiText("Cancel")}</button>
    <button style={btnPri} onClick={() => form.name && onSave({ ...form, languages: (form.languages || []).join(", ") })}>{uiText("Save Employee")}</button>
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
const [statusFilter, setStatusFilter] = useState("all");
const [typeFilter, setTypeFilter] = useState("all");
const [regionFilter, setRegionFilter] = useState("all");

const emptyClient = {
name: "", email: "", phone: "", phoneMobile: "", address: "", apartmentFloor: "", city: "Luxembourg", postalCode: "", country: "Luxembourg",
region: "",
type: "Residential", cleaningFrequency: "Weekly", pricePerHour: 35, priceFixed: 0, billingType: "hourly",
hoursPerSession: 0, forfaitLabel: "", forfaitPrice: 0, forfaitPeriod: "monthly",
notes: "", contactPerson: "",
status: "active", accessCode: "", keyLocation: "", parkingInfo: "", petInfo: "", specialInstructions: "", preferredDay: "", preferredTime: "",
contractStart: "", contractEnd: "", squareMeters: "", taxId: "", language: "FR", preferredCleanerIds: [],
};

const handleSave = async (clientData) => {
try {
if (clientData.id) {
await syncClientToApi(clientData);
updateData("clients", prev => prev.map(c => c.id === clientData.id ? clientData : c));
showToast("Client updated");
} else {
const newClient = { ...clientData, id: makeId() };
await createClientInApi(newClient);
updateData("clients", prev => [...prev, newClient]);
showToast("Client added");
}
setModal(null);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to save client", "error");
}
};

const handleDelete = async (id) => {
try {
await deleteClientFromApi(id);
updateData("clients", prev => prev.filter(c => c.id !== id));
showToast("Deleted", "error");
setDeleteId(null);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to delete client", "error");
}
};

const q = search.toLowerCase();
const allRegions = [...new Set((data.clients || []).map(c => (c.region || "").trim()).filter(Boolean))].sort();
const filtered = data.clients.filter(c => {
  const matchesSearch = !q || c.name.toLowerCase().includes(q) || (c.contactPerson || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.city || "").toLowerCase().includes(q);
  const matchesStatus = statusFilter === "all" || c.status === statusFilter;
  const matchesType = typeFilter === "all" || (c.type || "") === typeFilter;
  const matchesRegion = regionFilter === "all" || (c.region || "") === regionFilter;
  return matchesSearch && matchesStatus && matchesType && matchesRegion;
});

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{uiText("Clients")} <span style={{ fontSize: 14, color: CL.muted, fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}>({filtered.length}/{data.clients.length})</span></h1>
<button style={btnPri} onClick={() => setModal({ ...emptyClient })}>{ICN.plus} {uiText("Add")}</button>
</div>
<div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
<div style={{ flex: 1, minWidth: 200, position: "relative" }}>
  <TextInput placeholder={uiText("Search by name, contact, email, phone, city...")} value={search} onChange={ev => setSearch(ev.target.value)} style={{ paddingLeft: 34 }} />
  <span style={{ position: "absolute", left: 10, top: 10, color: CL.muted }}>{ICN.search}</span>
</div>
<SelectInput value={statusFilter} onChange={ev => setStatusFilter(ev.target.value)} style={{ width: 150 }}>
  <option value="all">{uiText("All Statuses")}</option>
  <option value="active">{uiText("Active")}</option>
  <option value="inactive">{uiText("Inactive")}</option>
  <option value="prospect">{uiText("Prospect")}</option>
</SelectInput>
<SelectInput value={typeFilter} onChange={ev => setTypeFilter(ev.target.value)} style={{ width: 150 }}>
  <option value="all">{uiText("All Types")}</option>
  <option value="Residential">{uiText("Residential")}</option>
  <option value="Commercial">{uiText("Commercial")}</option>
</SelectInput>
<SelectInput value={regionFilter} onChange={ev => setRegionFilter(ev.target.value)} style={{ width: 160 }}>
  <option value="all">{uiText("All Regions")}</option>
  {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
</SelectInput>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead>
<tr><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("Address")}</th><th style={thSt}>{uiText("Type")}</th><th style={thSt}>{uiText("Freq")}</th><th style={thSt}>{uiText("Price")}</th><th style={thSt}>{uiText("Status")}</th><th style={thSt}>{uiText("Actions")}</th></tr>
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
<td style={tdSt}>{uiText(client.type)}</td>
<td style={tdSt}>{uiText(client.cleaningFrequency)}</td>
<td style={tdSt}>
{client.billingType === "forfait"
  ? <span title={client.forfaitLabel || ""}>{uiText("Forfait / Subscription")} €{Number(client.forfaitPrice || 0).toFixed(2)}{client.forfaitPeriod === "weekly" ? "/sem" : "/mois"}</span>
  : client.billingType === "fixed"
  ? `€${Number(client.priceFixed).toFixed(2)}`
  : `€${Number(client.pricePerHour).toFixed(2)}/hr`}
{client.hoursPerSession ? <div style={{ fontSize: 11, color: CL.muted }}>{client.hoursPerSession}h/séance</div> : null}
</td>
<td style={tdSt}><Badge color={client.status === "active" ? CL.green : client.status === "prospect" ? CL.orange : CL.red}>{uiText(client.status)}</Badge></td>
<td style={tdSt}>
<div style={{ display: "flex", gap: 4 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...client })}>{ICN.edit}</button>
<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => setDeleteId(client.id)}>{ICN.trash}</button>
</div>
</td>
</tr>
))}
{filtered.length === 0 && <tr><td colSpan={7} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No clients")}</td></tr>}
</tbody>
</table>
</div>

  {deleteId && (
    <ModalBox title={uiText("Delete?")} onClose={() => setDeleteId(null)}>
      <p style={{ marginBottom: 16 }}>{uiText("Remove this client?")}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={btnSec} onClick={() => setDeleteId(null)}>{uiText("Cancel")}</button>
        <button style={btnDng} onClick={() => handleDelete(deleteId)}>{uiText("Delete")}</button>
      </div>
    </ModalBox>
  )}

  {modal && (
    <ModalBox title={uiText(modal.id ? "Edit Client" : "Add Client")} onClose={() => setModal(null)}>
      <ClientForm initialData={modal} data={data} onSave={handleSave} onCancel={() => setModal(null)} />
    </ModalBox>
  )}
</div>

);
}

function ClientForm({ initialData, data, onSave, onCancel }) {
const [form, setForm] = useState(initialData);
const [activeTab, setActiveTab] = useState("basic");
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const tabs = [
{ id: "basic", label: uiText("Basic Info") },
{ id: "address", label: uiText("Address & Access") },
{ id: "service", label: uiText("Service & Billing") },
{ id: "details", label: uiText("Property Details") },
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
          <option value="Residential">{uiText("Residential")}</option><option value="Commercial">{uiText("Commercial")}</option><option value="Office">{uiText("Office")}</option><option value="Industrial">{uiText("Industrial")}</option><option value="Airbnb">Airbnb</option>
        </SelectInput>
      </Field>
      <Field label="Status">
        <SelectInput value={form.status} onChange={ev => set("status", ev.target.value)}>
          <option value="active">{uiText("Active")}</option><option value="inactive">{uiText("Inactive")}</option><option value="prospect">{uiText("Prospect")}</option>
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
      <Field label="Region / District"><TextInput value={form.region || ""} onChange={ev => set("region", ev.target.value)} placeholder="e.g. Kirchberg, Esch, Centre-Ville" /></Field>
      <Field label="Country"><TextInput value={form.country || ""} onChange={ev => set("country", ev.target.value)} /></Field>
      <div style={{ gridColumn: "1/-1", borderTop: `1px solid ${CL.bd}`, paddingTop: 12, marginTop: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: CL.gold, marginBottom: 10 }}>{uiText("Access Information")}</div>
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
        <SelectInput value={form.cleaningFrequency} onChange={ev => {
          const newFreq = ev.target.value;
          const hrs = form.hoursPerSession || 3;
          let newDays = form.preferredDays || [];
          if (newFreq === "Daily (weekdays only)") {
            newDays = ["Monday","Tuesday","Wednesday","Thursday","Friday"].map(day => ({ day, hours: hrs }));
          } else if (newFreq === "Daily (weekends included)") {
            newDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => ({ day, hours: hrs }));
          } else if (newFreq === "Weekly" || newFreq === "Bi-weekly" || newFreq === "Monthly") {
            if (newDays.length > 1) newDays = newDays.slice(0, 1);
          } else if (newFreq === "2x per week") {
            if (newDays.length > 2) newDays = newDays.slice(0, 2);
          } else if (newFreq === "3x per week") {
            if (newDays.length > 3) newDays = newDays.slice(0, 3);
          }
          setForm(prev => ({ ...prev, cleaningFrequency: newFreq, preferredDays: newDays }));
        }}>
          <option value="One-time">{uiText("One-time")}</option><option value="Weekly">{uiText("Weekly")}</option><option value="Bi-weekly">{uiText("Bi-weekly")}</option><option value="Monthly">{uiText("Monthly")}</option><option value="2x per week">{uiText("2x per week")}</option><option value="3x per week">{uiText("3x per week")}</option><option value="Daily (weekends included)">{uiText("Daily (weekends included)")}</option><option value="Daily (weekdays only)">{uiText("Daily (weekdays only)")}</option><option value="Custom">{uiText("Custom")}</option>
        </SelectInput>
      </Field>
      <Field label={uiText("Hours per Session")}>
        <TextInput type="number" step=".5" min="0" value={form.hoursPerSession || ""} onChange={ev => {
          const hrs = parseFloat(ev.target.value) || 0;
          setForm(prev => ({ ...prev, hoursPerSession: hrs, preferredDays: (prev.preferredDays || []).map(d => ({ ...d, hours: hrs })) }));
        }} placeholder="ex: 3" />
      </Field>
      <div style={{ gridColumn: "1/-1" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: CL.gold, marginBottom: 8 }}>{uiText("Preferred Day")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => {
            const preferred = (form.preferredDays || []);
            const entry = preferred.find(d => d.day === day);
            const checked = !!entry;
            return (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, background: CL.s2, border: `1px solid ${checked ? CL.gold : CL.bd}`, borderRadius: 8, padding: "8px 10px" }}>
                <input type="checkbox" id={`pday-${day}`} checked={checked} onChange={ev => {
                  const prev = form.preferredDays || [];
                  const next = ev.target.checked
                    ? [...prev, { day, hours: 3 }]
                    : prev.filter(d => d.day !== day);
                  set("preferredDays", next);
                }} style={{ cursor: "pointer" }} />
                <label htmlFor={`pday-${day}`} style={{ fontSize: 13, color: CL.text, cursor: "pointer", flex: 1 }}>{uiText(day)}</label>
                {checked && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <TextInput
                      type="number" min="0.5" step="0.5"
                      value={entry?.hours || ""}
                      onChange={ev => {
                        const prev = form.preferredDays || [];
                        set("preferredDays", prev.map(d => d.day === day ? { ...d, hours: parseFloat(ev.target.value) || 0 } : d));
                      }}
                      style={{ width: 60, padding: "4px 6px", fontSize: 12 }}
                    />
                    <span style={{ fontSize: 11, color: CL.muted }}>h</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Field label="Preferred Time"><TextInput value={form.preferredTime || ""} onChange={ev => set("preferredTime", ev.target.value)} placeholder="e.g. 09:00-12:00" /></Field>
      <Field label="Billing Type">
        <SelectInput value={form.billingType} onChange={ev => set("billingType", ev.target.value)}>
          <option value="hourly">{uiText("Hourly")}</option>
          <option value="fixed">{uiText("Fixed Price")}</option>
          <option value="forfait">{uiText("Forfait / Subscription")}</option>
        </SelectInput>
      </Field>
      {form.billingType === "hourly" && (
        <Field label="Price per Hour (€)"><TextInput type="number" step=".5" value={form.pricePerHour} onChange={ev => set("pricePerHour", parseFloat(ev.target.value) || 0)} /></Field>
      )}
      {form.billingType === "fixed" && (
        <Field label="Fixed Price (€)"><TextInput type="number" value={form.priceFixed} onChange={ev => set("priceFixed", parseFloat(ev.target.value) || 0)} /></Field>
      )}
      {form.billingType === "forfait" && (<>
        <Field label={uiText("Forfait Name")}><TextInput value={form.forfaitLabel || ""} onChange={ev => set("forfaitLabel", ev.target.value)} placeholder={uiText("e.g. Forfait Mensuel Premium")} /></Field>
        <Field label={uiText("Forfait Price (€)")}><TextInput type="number" step=".5" min="0" value={form.forfaitPrice || ""} onChange={ev => set("forfaitPrice", parseFloat(ev.target.value) || 0)} /></Field>
        <Field label={uiText("Billing Period")}>
          <SelectInput value={form.forfaitPeriod || "monthly"} onChange={ev => set("forfaitPeriod", ev.target.value)}>
            <option value="weekly">{uiText("Weekly")}</option>
            <option value="biweekly">{uiText("Bi-weekly")}</option>
            <option value="monthly">{uiText("Monthly")}</option>
          </SelectInput>
        </Field>
        <Field label={uiText("Included Hours / Period")}><TextInput type="number" step=".5" min="0" value={form.forfaitIncludedHours || ""} onChange={ev => set("forfaitIncludedHours", parseFloat(ev.target.value) || 0)} placeholder="ex: 8" /></Field>
      </>)}
      <Field label="Contract Start"><DatePicker value={form.contractStart || ""} onChange={ev => set("contractStart", ev.target.value)} /></Field>
      <Field label="Contract End"><DatePicker value={form.contractEnd || ""} onChange={ev => set("contractEnd", ev.target.value)} /></Field>
    </div>
  )}

  {activeTab === "details" && (
    <div className="form-grid">
      <Field label="Property Size (m²)"><TextInput type="number" value={form.squareMeters || ""} onChange={ev => set("squareMeters", ev.target.value)} placeholder="e.g. 120" /></Field>
      <Field label="Pets"><TextInput value={form.petInfo || ""} onChange={ev => set("petInfo", ev.target.value)} placeholder="e.g. 1 cat (friendly)" /></Field>
      <div style={{ gridColumn: "1/-1", borderTop: `1px solid ${CL.bd}`, paddingTop: 10 }}>
        <div style={{ fontSize: 13, color: CL.gold, marginBottom: 8, fontWeight: 600 }}>{uiText("Preferred cleaners for auto-assignment")}</div>
        <div style={{ display: "grid", gap: 6 }}>
          {(data.employees || []).filter(e => e.status === "active").map(emp => {
            const checked = (form.preferredCleanerIds || []).includes(emp.id);
            return <label key={emp.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: CL.text }}><input type="checkbox" checked={checked} onChange={ev => {
              const prev = form.preferredCleanerIds || [];
              const next = ev.target.checked ? [...new Set([...prev, emp.id])] : prev.filter(id => id !== emp.id);
              set("preferredCleanerIds", next);
            }} />{emp.name} <span style={{ color: CL.muted }}>· {emp.cleanerGroup || emp.city || "No group"}</span></label>;
          })}
        </div>
      </div>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="Notes & Special Requests"><TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} placeholder="Allergies, products to use/avoid, rooms to skip..." /></Field>
      </div>
    </div>
  )}

  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
    <button style={btnSec} onClick={onCancel}>{uiText("Cancel")}</button>
    <button style={btnPri} onClick={() => form.name && onSave(form)}>{uiText("Save Client")}</button>
  </div>
</div>

);
}

// ==============================================
// TIME PICKER - H24 (FR) / AM-PM (EN)
// ==============================================
function TimePicker({ value, onChange, disabled }) {
const { lang } = useI18n();
const timeSelectTheme = INIT_THEME === "dark"
  ? { triggerBg: CL.s2, menuBg: CL.s2, searchBg: CL.bg, border: `${CL.gold}35` }
  : { triggerBg: CL.sf, menuBg: CL.sf, searchBg: "#FFFFFF", border: CL.bd };
const options = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 5) {
    const hStr = String(h).padStart(2, "0");
    const mStr = String(m).padStart(2, "0");
    const val = `${hStr}:${mStr}`;
    let label;
    if (lang === "en") {
      const period = h < 12 ? "AM" : "PM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      label = `${h12}:${mStr} ${period}`;
    } else {
      label = val;
    }
    options.push({ val, label });
  }
}
if (value && !options.some(o => o.val === value)) {
  const [rawH, rawM] = String(value).split(":");
  const h = Number(rawH);
  const m = Number(rawM);
  if (Number.isFinite(h) && Number.isFinite(m)) {
    let label;
    if (lang === "en") {
      const period = h < 12 ? "AM" : "PM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      label = `${h12}:${String(m).padStart(2, "0")} ${period}`;
    } else {
      label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    options.push({ val: value, label });
  }
}
return (
  <SelectInput
    value={value || ""}
    onChange={onChange}
    disabled={disabled}
    searchThreshold={0}
    style={{ background: disabled ? CL.s2 : timeSelectTheme.triggerBg, borderColor: timeSelectTheme.border }}
    menuStyle={{ background: timeSelectTheme.menuBg, borderColor: timeSelectTheme.border }}
    searchInputStyle={{ background: timeSelectTheme.searchBg }}
  >
    {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
  </SelectInput>
);
}

// ==============================================
// SCHEDULE PAGE - Monthly Calendar
// ==============================================
function SchedulePage({ data, updateData, showToast }) {
const [focusWindow, setFocusWindow] = useState("today");
const [modal, setModal] = useState(null);
const [selectedDate, setSelectedDate] = useState(null);
const [filterEmp, setFilterEmp] = useState("");
const [filterClient, setFilterClient] = useState("");
const [viewMode, setViewMode] = useState("calendar");
const now = new Date();
const [viewYear, setViewYear] = useState(now.getFullYear());
const [viewMonth, setViewMonth] = useState(now.getMonth());
const safeSchedules = Array.isArray(data?.schedules) ? data.schedules.filter(s => s && typeof s === "object") : [];

const emptySchedule = { clientId: "", employeeId: "", employeeIds: [], date: getToday(), dateTo: "", startTime: "08:00", endTime: "12:00", status: "scheduled", paymentStatus: "unpaid", notes: "", recurrence: "none", recurrenceDays: [] };
const dayHeaders = [uiText("Mon"), uiText("Tue"), uiText("Wed"), uiText("Thu"), uiText("Fri"), uiText("Sat"), uiText("Sun")];

const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const todayStr = getToday();
const tomorrowStr = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const nextWeekStr = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);

const prevMonth = () => {
if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
else setViewMonth(viewMonth - 1);
};
const nextMonth = () => {
if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
else setViewMonth(viewMonth + 1);
};
const goToday = () => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); setSelectedDate(now.getDate()); setFocusWindow("today"); };
const jumpToDate = (dateObj) => {
setViewYear(dateObj.getFullYear());
setViewMonth(dateObj.getMonth());
setSelectedDate(dateObj.getDate());
};
const goTomorrow = () => {
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
setFocusWindow("tomorrow");
jumpToDate(tomorrow);
};
const goNextWeek = () => {
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
setFocusWindow("nextweek");
jumpToDate(nextWeek);
};

const monthSchedules = safeSchedules.filter(s => {
if (!s.date?.startsWith(monthStr)) return false;
if (filterEmp && s.employeeId !== filterEmp) return false;
if (filterClient && s.clientId !== filterClient) return false;
return true;
});
const orderedMonthSchedules = [...monthSchedules].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
const enabledHolidayKeys = resolveEnabledPublicHolidayKeys(data.settings);
const monthPublicHolidays = getLuxPublicHolidaysByMonth({ year: viewYear, month: viewMonth, selectedKeys: enabledHolidayKeys });
const holidayByDate = Object.fromEntries(monthPublicHolidays.map(h => [h.date, h]));

const empColors = {};
const colorPalette = [CL.blue, CL.green, "#E06CC0", CL.orange, "#8B6CE0", "#6CE0B8", "#E0A86C", "#6C8BE0", CL.red, "#C0E06C"];
data.employees.forEach((emp, idx) => { empColors[emp.id] = colorPalette[idx % colorPalette.length]; });

const calendarCells = [];
for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
while (calendarCells.length < 42) calendarCells.push(null);

const selectedDateStr = selectedDate ? `${monthStr}-${String(selectedDate).padStart(2, "0")}` : null;
const selectedDateScheds = selectedDateStr ? orderedMonthSchedules.filter(s => s.date === selectedDateStr) : [];
const selectedHoliday = selectedDateStr ? holidayByDate[selectedDateStr] : null;

const focusMeta = {
  today: { label: uiText("Today"), from: todayStr, to: todayStr },
  tomorrow: { label: uiText("Tomorrow"), from: tomorrowStr, to: tomorrowStr },
  nextweek: { label: uiText("Next 7 Days"), from: todayStr, to: nextWeekStr },
};
const focused = focusMeta[focusWindow];
const focusedJobs = safeSchedules
  .filter(s => s.date && s.date >= focused.from && s.date <= focused.to && (!filterEmp || s.employeeId === filterEmp) && (!filterClient || s.clientId === filterClient))
  .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
const focusedHolidays = (() => {
  const from = new Date(`${focused.from}T00:00:00Z`);
  const to = new Date(`${focused.to}T00:00:00Z`);
  const out = [];
  for (let year = from.getUTCFullYear(); year <= to.getUTCFullYear(); year++) {
    getLuxembourgPublicHolidaysForYear(year)
      .filter(h => enabledHolidayKeys.includes(h.key) && h.date >= focused.from && h.date <= focused.to)
      .forEach(h => out.push(h));
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
})();

const handleSave = async (schedData) => {
if (schedData.id) {
try {
await syncScheduleToApi({ ...schedData, updatedAt: new Date().toISOString() });
updateData("schedules", prev => prev.map(s => s.id === schedData.id ? { ...schedData, updatedAt: new Date().toISOString() } : s));
showToast("Updated");
setModal(null);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to update schedule", "error");
}
return;
} else {
const stamp = new Date().toISOString();
// Determine employee IDs to use (multi or single)
const selectedEmpIds = (schedData.employeeIds && schedData.employeeIds.length > 0)
  ? schedData.employeeIds
  : (schedData.employeeId ? [schedData.employeeId] : []);
if (selectedEmpIds.length === 0) { showToast(uiText("Employee *") + " requis", "error"); return; }
const base = { ...schedData, dateTo: undefined, employeeIds: undefined };
const items = [];
const hasRange = schedData.dateTo && schedData.dateTo > schedData.date;

if (hasRange) {
  // Date range mode
  const client = data.clients.find(c => c.id === schedData.clientId);
  const preferredDays = client?.preferredDays || [];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let cur = new Date(schedData.date);
  const end = new Date(schedData.dateTo);

  if (preferredDays.length > 0) {
    // Generate on preferred days of week within range
    const pdNums = preferredDays.map(pd => dayNames.indexOf(pd.day));
    while (cur <= end) {
      const dow = cur.getUTCDay();
      if (pdNums.includes(dow)) {
        const pd = preferredDays.find(pd => dayNames.indexOf(pd.day) === dow);
        let endTime = schedData.endTime;
        if (pd?.hours && schedData.startTime) {
          const [h, m] = schedData.startTime.split(":").map(Number);
          const tot = h * 60 + m + pd.hours * 60;
          endTime = `${String(Math.floor(tot / 60) % 24).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
        }
        items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), endTime, updatedAt: stamp });
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  } else if (schedData.recurrence === "daily-weekdays") {
    while (cur <= end) {
      if (cur.getUTCDay() !== 0 && cur.getUTCDay() !== 6) items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), updatedAt: stamp });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  } else if (["2x-weekly","3x-weekly","4x-weekly"].includes(schedData.recurrence)) {
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const selectedDayIndexes = (schedData.recurrenceDays || []).map(d => dayNames.indexOf(d)).filter(idx => idx >= 0);
    if (selectedDayIndexes.length === 0) { showToast(uiText("Select days:"), "error"); return; }
    while (cur <= end) {
      if (selectedDayIndexes.includes(cur.getUTCDay())) {
        items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), updatedAt: stamp });
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  } else if (schedData.recurrence === "weekly") {
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const selectedDayIndexes = (schedData.recurrenceDays || []).map(d => dayNames.indexOf(d)).filter(idx => idx >= 0);
    if (selectedDayIndexes.length > 0) {
      while (cur <= end) {
        if (selectedDayIndexes.includes(cur.getUTCDay())) {
          items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), updatedAt: stamp });
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else {
      while (cur <= end) { items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), updatedAt: stamp }); cur.setUTCDate(cur.getUTCDate() + 7); }
    }
  } else if (schedData.recurrence === "biweekly") {
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const selectedDayIndexes = (schedData.recurrenceDays || []).map(d => dayNames.indexOf(d)).filter(idx => idx >= 0);
    if (selectedDayIndexes.length > 0) {
      let cursor = new Date(schedData.date);
      while (cursor <= end) {
        selectedDayIndexes.forEach(dow => {
          const d = new Date(cursor);
          const diff = (dow - d.getUTCDay() + 7) % 7;
          d.setUTCDate(d.getUTCDate() + diff);
          if (d >= new Date(schedData.date) && d <= end) {
            items.push({ ...base, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
          }
        });
        cursor.setUTCDate(cursor.getUTCDate() + 14);
      }
      const seen = new Set();
      const uniqueItems = [];
      items.forEach(item => {
        if (!seen.has(item.date)) {
          seen.add(item.date);
          uniqueItems.push(item);
        }
      });
      items.length = 0;
      items.push(...uniqueItems.sort((a, b) => a.date.localeCompare(b.date)));
    } else {
      while (cur <= end) { items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), updatedAt: stamp }); cur.setUTCDate(cur.getUTCDate() + 14); }
    }
  } else if (schedData.recurrence === "monthly") {
    while (cur <= end) { items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), updatedAt: stamp }); cur.setUTCMonth(cur.getUTCMonth() + 1); }
  } else {
    // Every day
    while (cur <= end) { items.push({ ...base, id: makeId(), date: cur.toISOString().slice(0, 10), updatedAt: stamp }); cur.setUTCDate(cur.getUTCDate() + 1); }
  }

  if (items.length === 0) { showToast("Aucun créneau dans cette plage", "error"); return; }
} else {
  // Single date or classic recurrence
  items.push({ ...base, id: makeId(), updatedAt: stamp });
  if (schedData.recurrence !== "none") {
    const baseDate = new Date(schedData.date);
    if (schedData.recurrence === "daily") {
      for (let i = 1; i <= 30; i++) {
        const d = new Date(baseDate); d.setUTCDate(d.getUTCDate() + i);
        items.push({ ...base, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
      }
    } else if (schedData.recurrence === "daily-weekdays") {
      let added = 0, offset = 1;
      while (added < 30) {
        const d = new Date(baseDate); d.setUTCDate(d.getUTCDate() + offset);
        if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) { items.push({ ...base, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp }); added++; }
        offset++;
      }
    } else if (["2x-weekly","3x-weekly","4x-weekly"].includes(schedData.recurrence)) {
      // Specific days per week recurrence
      const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const selDays = (schedData.recurrenceDays || []).map(d => dayNames.indexOf(d));
      if (selDays.length === 0) { showToast(uiText("Select days:"), "error"); return; }
      for (let week = 0; week < 12; week++) {
        selDays.forEach(dow => {
          const d = new Date(baseDate);
          const diff = (dow - d.getUTCDay() + 7) % 7 + week * 7;
          if (diff === 0 && week === 0) return; // skip start date itself (already added)
          d.setUTCDate(d.getUTCDate() + diff);
          items.push({ ...base, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
        });
      }
    } else {
      const interval = schedData.recurrence === "weekly" ? 7 : schedData.recurrence === "biweekly" ? 14 : 28;
      const selDays = (["weekly","biweekly"].includes(schedData.recurrence)) ? (schedData.recurrenceDays || []) : [];
      if (selDays.length > 0) {
        const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const dow = dayNames.indexOf(selDays[0]);
        const firstDiff = (dow - baseDate.getUTCDay() + 7) % 7;
        for (let i = 0; i < 12; i++) {
          const d = new Date(baseDate);
          d.setUTCDate(d.getUTCDate() + firstDiff + interval * i);
          if (d.toISOString().slice(0, 10) !== schedData.date) {
            items.push({ ...base, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
          }
        }
      } else {
        for (let i = 1; i <= 12; i++) {
          const d = new Date(baseDate); d.setUTCDate(d.getUTCDate() + interval * i);
          items.push({ ...base, id: makeId(), date: d.toISOString().slice(0, 10), updatedAt: stamp });
        }
      }
    }
  }
}
// Multiply items for each selected employee
const allItems = selectedEmpIds.flatMap(empId =>
  items.map(item => ({ ...item, id: makeId(), employeeId: empId }))
);
try {
await Promise.all(allItems.map(item => createScheduleInApi(item)));
updateData("schedules", prev => [...prev, ...allItems]);
showToast(`${allItems.length} job(s) ${uiText("scheduled") || "scheduled"}`);
setModal(null);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to save schedules", "error");
}
}
};

const handleDelete = async (id) => {
try {
await deleteScheduleFromApi(id);
updateData("schedules", prev => prev.filter(s => s.id !== id));
showToast("Removed", "error");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to delete schedule", "error");
}
};

const handleBulkDelete = async () => {
if (orderedMonthSchedules.length === 0) return;
const confirmed = window.confirm(`${uiText("Delete")} ${orderedMonthSchedules.length} ${uiText("job(s)") || "job(s)"} ?`);
if (!confirmed) return;
const ids = orderedMonthSchedules.map(s => s.id);
try {
await Promise.all(ids.map(id => deleteScheduleFromApi(id)));
updateData("schedules", prev => prev.filter(s => !ids.includes(s.id)));
showToast(`${ids.length} ${uiText("job(s)") || "job(s)"} supprimé(s)`, "error");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to delete schedules", "error");
}
};

const handleTogglePayment = async (sched, ev) => {
ev.stopPropagation();
const next = { ...sched, paymentStatus: sched.paymentStatus === "paid" ? "unpaid" : "paid" };
try {
await syncScheduleToApi(next);
updateData("schedules", prev => prev.map(s => s.id === next.id ? next : s));
showToast(next.paymentStatus === "paid" ? uiText("Marked as paid") : uiText("Marked as unpaid"), "success");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to update payment status", "error");
}
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{uiText("Schedule")}</h1>
<button style={btnPri} onClick={() => setModal({ ...emptySchedule })}>{ICN.plus} {uiText("New Job")}</button>
</div>

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<button onClick={prevMonth} style={{ ...btnSec, ...btnSm, padding: "8px 14px", fontSize: 16 }}>‹</button>
<button onClick={goToday} style={{ ...btnSec, ...btnSm }}>{uiText("Today")}</button>
<button onClick={goTomorrow} style={{ ...btnSec, ...btnSm }}>{uiText("Tomorrow")}</button>
<button onClick={goNextWeek} style={{ ...btnSec, ...btnSm }}>{uiText("Next Week")}</button>
<button onClick={nextMonth} style={{ ...btnSec, ...btnSm, padding: "8px 14px", fontSize: 16 }}>›</button>
<h2 style={{ margin: 0, fontSize: 20, fontFamily: "'Cormorant Garamond', serif", color: CL.text, marginLeft: 8 }}>{monthLabel}</h2>
</div>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<div style={{ display: "flex", background: CL.s2, border: `1px solid ${CL.bd}`, borderRadius: 8, padding: 2 }}>
<button style={{ ...btnSec, ...btnSm, background: viewMode === "calendar" ? CL.blue : "transparent", border: "none", color: viewMode === "calendar" ? CL.white : CL.muted }} onClick={() => setViewMode("calendar")}>{uiText("Calendar")}</button>
<button style={{ ...btnSec, ...btnSm, background: viewMode === "list" ? CL.blue : "transparent", border: "none", color: viewMode === "list" ? CL.white : CL.muted }} onClick={() => setViewMode("list")}>{uiText("List")}</button>
</div>
<SelectInput value={filterEmp} onChange={ev => setFilterEmp(ev.target.value)} style={{ width: 180 }}>
<option value="">{uiText("All Employees")}</option>
{data.employees.filter(emp => emp.status === "active").map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
</SelectInput>
<SelectInput value={filterClient} onChange={ev => setFilterClient(ev.target.value)} style={{ width: 180 }}>
<option value="">{uiText("All clients")}</option>
{data.clients.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
</SelectInput>
</div>
</div>

<div className="stat-row" style={{ marginBottom: 16 }}>
<StatCard label={uiText("This Month")} value={`${monthSchedules.length}`} icon={ICN.cal} color={CL.blue} />
<StatCard label={uiText("In Progress")} value={monthSchedules.filter(s => s.status === "in-progress").length} icon={<span style={{ color: "#ffffff" }}>{ICN.clock}</span>} color={CL.orange} />
<StatCard label={uiText("Completed")} value={monthSchedules.filter(s => s.status === "completed").length} icon={ICN.check} color={CL.green} />
</div>

{viewMode !== "calendar" && <div style={{ ...cardSt, marginBottom: 16 }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
    <h3 style={{ margin: 0, fontSize: 16, color: CL.gold }}>{focused.label} ({focusedJobs.length})</h3>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button style={{ ...btnSec, ...btnSm, background: focusWindow === "today" ? CL.blue : "transparent", color: focusWindow === "today" ? CL.white : CL.muted }} onClick={() => { setFocusWindow("today"); goToday(); }}>{uiText("Today")}</button>
      <button style={{ ...btnSec, ...btnSm, background: focusWindow === "tomorrow" ? CL.blue : "transparent", color: focusWindow === "tomorrow" ? CL.white : CL.muted }} onClick={() => { setFocusWindow("tomorrow"); goTomorrow(); }}>{uiText("Tomorrow")}</button>
      <button style={{ ...btnSec, ...btnSm, background: focusWindow === "nextweek" ? CL.blue : "transparent", color: focusWindow === "nextweek" ? CL.white : CL.muted }} onClick={() => { setFocusWindow("nextweek"); goNextWeek(); }}>{uiText("Next Week")}</button>
    </div>
  </div>
  {focusedHolidays.length > 0 && (
    <div style={{ marginBottom: 8 }}>
      {focusedHolidays.map(holiday => (
        <div key={`fh-${holiday.date}`} style={{ border: `1px solid ${CL.red}60`, borderRadius: 8, padding: 8, marginBottom: 6, background: `${CL.red}0E` }}>
          <div style={{ fontWeight: 600, color: CL.red }}>{fmtDate(holiday.date)} · {uiText("Holiday")}</div>
          <div style={{ fontSize: 12, color: CL.text }}>{getLuxHolidayLabel(holiday.key, CURRENT_LANG)}</div>
        </div>
      ))}
    </div>
  )}
  {focusedJobs.length === 0 ? <p style={{ color: CL.muted, margin: 0 }}>{uiText("No jobs in this period.")}</p> : focusedJobs.slice(0, 20).map(job => {
    const client = data.clients.find(c => c.id === job.clientId);
    const employee = data.employees.find(e => e.id === job.employeeId);
    const isPaid = job.paymentStatus === "paid";
    return <div key={job.id} onClick={() => setModal({ ...job })} style={{ border: `1px solid ${CL.bd}`, borderRadius: 8, padding: 10, marginBottom: 8, cursor: "pointer", background: CL.s2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>{fmtDate(job.date)} · {job.startTime}-{job.endTime}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={ev => handleTogglePayment(job, ev)} style={{ background: isPaid ? CL.green + "20" : CL.s2, color: isPaid ? CL.green : CL.muted, border: `1px solid ${isPaid ? CL.green : CL.bd}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{isPaid ? uiText("Paid") : uiText("Unpaid")}</button>
          <Badge color={scheduleStatusColor(job.status)}>{job.status}</Badge>
        </div>
      </div>
      <div style={{ fontSize: 12, color: CL.text }}>{client?.name || "Unknown client"}</div>
      <div style={{ fontSize: 12, color: CL.muted }}>{uiText("Assigned to:")} {employee?.name || uiText("Unassigned")}</div>
      <div style={{ fontSize: 11, color: cityMatchLabel(employee, client).startsWith("✅") ? CL.green : CL.orange, marginTop: 2 }}>{cityMatchLabel(employee, client)}</div>
      {job.notes ? <div style={{ fontSize: 11, color: CL.dim, marginTop: 3 }}>{uiText("Details:")} {job.notes}</div> : null}
    </div>;
  })}
</div>}

{viewMode === "calendar" ? (
<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
<div style={{ flex: "1 1 600px", minWidth: 0 }}>
<div style={{ ...cardSt, padding: 8 }}>
<div className="cleaner-cal-grid" style={{ marginBottom: 4 }}>
{dayHeaders.map(d => <div key={d} className="cal-hdr cleaner-cal-hdr" style={{ color: CL.muted }}>{d}</div>)}
</div>
<div className="cleaner-cal-grid">
{calendarCells.map((day, idx) => {
if (day === null) return <div key={`empty-${idx}`} className="cleaner-cal-cell" style={{ background: CL.bg + "40", cursor: "default", minHeight: 70 }} />;
const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
const dayScheds = orderedMonthSchedules.filter(s => s.date === dateStr);
const dayHoliday = holidayByDate[dateStr];
const isToday = dateStr === todayStr;
const isSelected = day === selectedDate;
const isPast = dateStr < todayStr;
return (
<div key={day} className="cleaner-cal-cell" onClick={() => setSelectedDate(day === selectedDate ? null : day)} style={{ minHeight: 70, background: dayHoliday ? `${CL.red}0E` : isSelected ? CL.gold + "15" : isToday ? CL.blue + "08" : CL.s2, border: isSelected ? `2px solid ${CL.gold}` : dayHoliday ? `1px solid ${CL.red}60` : isToday ? `2px solid ${CL.blue}40` : `1px solid ${CL.bd}50`, opacity: isPast ? 0.7 : 1 }}>
<div className="day-row">
<span className="day-num" style={{ fontWeight: isToday ? 700 : 500, color: isToday ? CL.blue : CL.text }}>{day}</span>
{dayScheds.length > 0 && <span className="day-badge" style={{ background: CL.gold + "30", color: CL.gold }}>{dayScheds.length}</span>}
</div>
{dayHoliday && <div style={{ fontSize: 8, color: CL.red, fontWeight: 700, marginBottom: 1, lineHeight: 1.1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }} title={getLuxHolidayLabel(dayHoliday.key, CURRENT_LANG)}>{uiText("Holiday")}</div>}
{dayScheds.slice(0, 3).map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const statusColor = scheduleStatusColor(sched.status);
return <div key={sched.id} className="cal-evt" style={{ background: statusColor + "20", borderLeftColor: statusColor, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}><div onClick={ev => { ev.stopPropagation(); setModal({ ...sched }); }} style={{ cursor: "pointer", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}><span className="evt-time" style={{ color: CL.text }}>{sched.startTime} </span><span className="evt-name" style={{ color: CL.muted }}>{client?.name?.slice(0, 10) || "?"}</span></div><button onClick={ev => { ev.stopPropagation(); handleDelete(sched.id); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: CL.red, padding: "0 1px", fontSize: 9, lineHeight: 1, flexShrink: 0, opacity: 0.7, display: "flex", alignItems: "center" }} title="Supprimer">✕</button></div>;
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
{selectedHoliday && (
  <div style={{ border: `1px solid ${CL.red}60`, borderRadius: 8, padding: "8px 10px", marginBottom: 8, background: `${CL.red}0D` }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: CL.red }}>{uiText("Holiday")}</div>
    <div style={{ fontSize: 12, color: CL.text }}>{getLuxHolidayLabel(selectedHoliday.key, CURRENT_LANG)}</div>
  </div>
)}
{selectedDateScheds.length === 0 ? <p style={{ color: CL.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>{uiText("No jobs this day")}</p> : selectedDateScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(emp => emp.id === sched.employeeId);
const empColor = empColors[sched.employeeId] || CL.muted;
return <div key={sched.id} onClick={() => setModal({ ...sched })} style={{ padding: "10px 12px", marginBottom: 8, borderRadius: 8, cursor: "pointer", background: CL.s2, borderLeft: `4px solid ${empColor}` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontWeight: 600, fontSize: 14, color: CL.text }}>{client?.name || "?"}</div><Badge color={scheduleStatusColor(sched.status)}>{uiText(sched.status)}</Badge></div><div style={{ fontSize: 12, color: CL.muted, marginTop: 4 }}>{sched.startTime} - {sched.endTime}</div><div style={{ fontSize: 12, color: empColor, marginTop: 2 }}>{employee?.name || uiText("Unassigned")}</div><div style={{ fontSize: 11, color: cityMatchLabel(employee, client).startsWith("✅") ? CL.green : CL.orange, marginTop: 2 }}>{cityMatchLabel(employee, client)}</div></div>;
})}
</>) : <div style={{ textAlign: "center", padding: "30px 10px" }}><div style={{ color: CL.muted, marginBottom: 8 }}>{ICN.cal}</div><p style={{ color: CL.muted, fontSize: 13 }}>{uiText("Click a date to see details")}</p></div>}
</div>
</div>
</div>
) : (
<div style={cardSt}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
  <div style={{ fontSize: 12, color: CL.muted }}>{uiText("Monthly job list by date (readable after clocking/status changes).")}</div>
  {orderedMonthSchedules.length > 0 && <button onClick={handleBulkDelete} style={{ background: "transparent", border: `1px solid ${CL.red}`, color: CL.red, cursor: "pointer", padding: "4px 10px", borderRadius: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }} title={uiText("Delete all filtered jobs")}>{ICN.trash} {uiText("Delete")} ({orderedMonthSchedules.length})</button>}
</div>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{uiText("Date")}</th><th style={thSt}>{uiText("Time")}</th><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("Cleaner")}</th><th style={thSt}>{uiText("Status")}</th><th style={thSt}>{uiText("Payment")}</th><th style={thSt}></th></tr></thead>
<tbody>
{orderedMonthSchedules.map(s => {
const client = data.clients.find(c => c.id === s.clientId);
const employee = data.employees.find(e => e.id === s.employeeId);
const isPaid = s.paymentStatus === "paid";
return <tr key={s.id} onClick={() => setModal({ ...s })} style={{ cursor: "pointer" }}><td style={tdSt}><div>{fmtDate(s.date)}</div>{holidayByDate[s.date] && <div style={{ fontSize: 11, color: CL.red }}>{uiText("Holiday")}: {getLuxHolidayLabel(holidayByDate[s.date].key, CURRENT_LANG)}</div>}</td><td style={tdSt}>{s.startTime} - {s.endTime}</td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}><div>{employee?.name || uiText("Unassigned")}</div><div style={{ fontSize: 11, color: cityMatchLabel(employee, client).startsWith("✅") ? CL.green : CL.orange }}>{cityMatchLabel(employee, client)}</div></td><td style={tdSt}><Badge color={scheduleStatusColor(s.status)}>{uiText(s.status)}</Badge></td><td style={tdSt} onClick={ev => ev.stopPropagation()}><button onClick={ev => handleTogglePayment(s, ev)} style={{ ...btnSm, background: isPaid ? CL.green + "20" : CL.s2, color: isPaid ? CL.green : CL.muted, border: `1px solid ${isPaid ? CL.green : CL.bd}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{isPaid ? uiText("Paid") : uiText("Unpaid")}</button></td><td style={tdSt} onClick={ev => ev.stopPropagation()}><button onClick={() => handleDelete(s.id)} style={{ background: "transparent", border: "none", color: CL.red, cursor: "pointer", padding: "4px 6px", borderRadius: 6, fontSize: 13, display: "flex", alignItems: "center" }} title={uiText("Delete Job")}>{ICN.trash}</button></td></tr>;
})}
{orderedMonthSchedules.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No jobs in this month")}</td></tr>}
</tbody>
</table>
</div>
</div>
)}

{modal && (
<ModalBox title={uiText(modal.id ? "Edit Job" : "New Job")} onClose={() => setModal(null)}>
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
const selectedEmployee = data.employees.find(e => e.id === form.employeeId);
const suggestedCleaner = recommendedCleanerForClient(selectedClient, data.employees || []);
const isCompletedLocked = Boolean(form.id && form.status === "completed");

// Preview: count how many jobs will be generated in date range
const hasDateRange = !form.id && form.dateTo && form.dateTo > form.date;
const previewJobCount = (() => {
  if (!hasDateRange) return null;
  const preferredDays = selectedClient?.preferredDays || [];
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let count = 0;
  let cur = new Date(form.date);
  const end = new Date(form.dateTo);
  if (preferredDays.length > 0) {
    const pdNums = preferredDays.map(pd => dayNames.indexOf(pd.day));
    while (cur <= end) { if (pdNums.includes(cur.getUTCDay())) count++; cur.setUTCDate(cur.getUTCDate() + 1); }
  } else if (form.recurrence !== "none") {
    const interval = form.recurrence === "daily" ? 1 : form.recurrence === "daily-weekdays" ? 1 : form.recurrence === "weekly" ? 7 : form.recurrence === "biweekly" ? 14 : 28;
    if (form.recurrence === "daily-weekdays") {
      while (cur <= end) { if (cur.getUTCDay() !== 0 && cur.getUTCDay() !== 6) count++; cur.setUTCDate(cur.getUTCDate() + 1); }
    } else if (["2x-weekly","3x-weekly","4x-weekly"].includes(form.recurrence)) {
      const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const selectedDayIndexes = (form.recurrenceDays || []).map(d => dayNames.indexOf(d)).filter(idx => idx >= 0);
      if (selectedDayIndexes.length === 0) return 0;
      while (cur <= end) {
        if (selectedDayIndexes.includes(cur.getUTCDay())) count++;
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else if (form.recurrence === "weekly" || form.recurrence === "biweekly") {
      const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const selectedDayIndexes = (form.recurrenceDays || []).map(d => dayNames.indexOf(d)).filter(idx => idx >= 0);
      if (selectedDayIndexes.length > 0) {
        if (form.recurrence === "weekly") {
          while (cur <= end) {
            if (selectedDayIndexes.includes(cur.getUTCDay())) count++;
            cur.setUTCDate(cur.getUTCDate() + 1);
          }
        } else {
          let cursor = new Date(form.date);
          const seen = new Set();
          while (cursor <= end) {
            selectedDayIndexes.forEach(dow => {
              const d = new Date(cursor);
              const diff = (dow - d.getUTCDay() + 7) % 7;
              d.setUTCDate(d.getUTCDate() + diff);
              if (d >= new Date(form.date) && d <= end) {
                seen.add(d.toISOString().slice(0, 10));
              }
            });
            cursor.setUTCDate(cursor.getUTCDate() + 14);
          }
          count = seen.size;
        }
      } else {
        while (cur <= end) { count++; cur.setUTCDate(cur.getUTCDate() + interval); }
      }
    } else {
      while (cur <= end) { count++; cur.setUTCDate(cur.getUTCDate() + interval); }
    }
  } else {
    while (cur <= end) { count++; cur.setUTCDate(cur.getUTCDate() + 1); }
  }
  return count;
})();

return (
<div>
<div className="form-grid">
<Field label="Client *">
<SelectInput value={form.clientId} onChange={ev => set("clientId", ev.target.value)} disabled={isCompletedLocked}>
<option value="">Select...</option>
{data.clients.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
</SelectInput>
</Field>
<Field label={form.id ? uiText("Employee *") : uiText("Select employees *")}>
{form.id ? (
  <>
  <SelectInput value={form.employeeId} onChange={ev => set("employeeId", ev.target.value)} disabled={isCompletedLocked}>
    <option value="">{uiText("Select...")}</option>
    {data.employees.filter(emp => emp.status === "active").map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
  </SelectInput>
  {selectedClient && selectedEmployee && <div style={{ fontSize: 11, color: cityMatchLabel(selectedEmployee, selectedClient).startsWith("✅") ? CL.green : CL.orange, marginTop: 4 }}>{cityMatchLabel(selectedEmployee, selectedClient)}</div>}
  </>
) : (
  <MultiSelectInput
    value={form.employeeIds || []}
    onChange={(vals) => set("employeeIds", vals)}
    placeholder={uiText("0 Items")}
    options={data.employees
      .filter(emp => emp.status === "active")
      .map(emp => ({ value: emp.id, label: `${emp.name}${emp.cleanerGroup || emp.city ? ` — ${emp.cleanerGroup || emp.city}` : ""}` }))}
  />
)}
{suggestedCleaner && !form.id && (form.employeeIds || []).length === 0 && <div style={{ fontSize: 11, color: CL.green, marginTop: 4 }}>{uiText("Suggested:")} {suggestedCleaner.name} ({suggestedCleaner.cleanerGroup || suggestedCleaner.city || uiText("No group")})</div>}
</Field>
<Field label={form.id ? uiText("Date") : uiText("Date From")}><DatePicker value={form.date} onChange={ev => set("date", ev.target.value)} /></Field>
{!form.id && (
  <Field label={uiText("Date To (optional)")}>
    <DatePicker value={form.dateTo || ""} onChange={ev => set("dateTo", ev.target.value)} />
    {hasDateRange && previewJobCount !== null && (
      <div style={{ fontSize: 11, color: CL.green, marginTop: 4 }}>
        ✓ {previewJobCount} {uiText("job(s) will be created")}
        {(selectedClient?.preferredDays || []).length > 0 && <span style={{ color: CL.muted }}> · {uiText("based on preferred days")}</span>}
      </div>
    )}
  </Field>
)}
<Field label={uiText("Status")}>
<SelectInput value={form.status} onChange={ev => set("status", ev.target.value)} disabled={isCompletedLocked}>
<option value="scheduled">{uiText("Scheduled")}</option><option value="in-progress">{uiText("In Progress")}</option><option value="completed">{uiText("Completed")}</option><option value="cancelled">{uiText("Cancelled")}</option>
</SelectInput>
</Field>
<Field label={uiText("Start")}><TimePicker value={form.startTime} onChange={ev => set("startTime", ev.target.value)} disabled={isCompletedLocked} /></Field>
<Field label={uiText("End")}><TimePicker value={form.endTime} onChange={ev => set("endTime", ev.target.value)} disabled={isCompletedLocked} /></Field>
{!form.id && (
<Field label={uiText("Recurrence")}>
<SelectInput value={form.recurrence} onChange={ev => set("recurrence", ev.target.value)} disabled={isCompletedLocked}>
<option value="none">{hasDateRange ? uiText("Every day") : uiText("One-time")}</option>
<option value="daily">{uiText("Daily (weekends included)")}</option>
<option value="daily-weekdays">{uiText("Daily (weekdays only)")}</option>
<option value="weekly">{uiText("Weekly (12 weeks)")}</option>
<option value="biweekly">{uiText("Bi-weekly (12x)")}</option>
<option value="monthly">{uiText("Monthly (12 months)")}</option>
<option value="2x-weekly">{uiText("2x per week")}</option>
<option value="3x-weekly">{uiText("3x per week")}</option>
<option value="4x-weekly">{uiText("4x per week")}</option>
</SelectInput>
{["weekly","biweekly","2x-weekly","3x-weekly","4x-weekly"].includes(form.recurrence) && (
  <div style={{ marginTop: 8 }}>
    <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{uiText("Select days:")}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day, i) => {
        const shortLabels = [uiText("Mon"),uiText("Tue"),uiText("Wed"),uiText("Thu"),uiText("Fri"),uiText("Sat"),uiText("Sun")];
        const maxDays = form.recurrence === "2x-weekly" ? 2 : form.recurrence === "3x-weekly" ? 3 : form.recurrence === "4x-weekly" ? 4 : 1;
        const selDays = form.recurrenceDays || [];
        const isChecked = selDays.includes(day);
        const canAdd = selDays.length < maxDays || isChecked;
        return (
          <label key={day} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, border: `1px solid ${isChecked ? CL.gold : CL.bd}`, background: isChecked ? CL.gold + "20" : "transparent", cursor: canAdd ? "pointer" : "not-allowed", fontSize: 12, color: isChecked ? CL.gold : CL.text, fontWeight: isChecked ? 600 : 400 }}>
            <input type="checkbox" checked={isChecked} disabled={!canAdd} onChange={() => {
              const current = form.recurrenceDays || [];
              set("recurrenceDays", isChecked ? current.filter(d => d !== day) : [...current, day]);
            }} style={{ display: "none" }} />
            {shortLabels[i]}
          </label>
        );
      })}
    </div>
    {(form.recurrenceDays || []).length === 0 && <div style={{ fontSize: 11, color: CL.orange, marginTop: 4 }}>{uiText("Select days:")}</div>}
  </div>
)}
</Field>
)}
</div>

  {/* Client quick info */}
  {isCompletedLocked && <div style={{ marginBottom: 10, fontSize: 12, color: CL.green }}>{uiText("This job is marked as completed and can no longer be edited.")}</div>}
  {selectedClient && (
    <div style={{ padding: 10, background: CL.s2, borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: CL.gold, marginBottom: 4 }}>{uiText("Client Info")}</div>
      <div style={{ color: CL.muted }}>
        {selectedClient.address}{selectedClient.apartmentFloor ? `, ${selectedClient.apartmentFloor}` : ""}
        {selectedClient.city ? ` · ${selectedClient.postalCode || ""} ${selectedClient.city}` : ""}
      </div>
      {selectedClient.accessCode && <div style={{ color: CL.orange }}>{uiText("Code:")} {selectedClient.accessCode}</div>}
      {selectedClient.keyLocation && <div style={{ color: CL.orange }}>{uiText("Key:")} {selectedClient.keyLocation}</div>}
      {selectedClient.petInfo && <div style={{ color: CL.orange }}>{uiText("Pets:")} {selectedClient.petInfo}</div>}
      {(selectedClient.preferredDays || []).length > 0 && <div style={{ color: CL.dim }}>{uiText("Preferred days:")} {(selectedClient.preferredDays || []).map(d => `${uiText(d.day)}${d.hours ? ` (${d.hours}h)` : ""}`).join(", ")} {selectedClient.preferredTime || ""}</div>}
      {!(selectedClient.preferredDays || []).length && selectedClient.preferredDay && <div style={{ color: CL.dim }}>{uiText("Prefers:")} {uiText(selectedClient.preferredDay)} {selectedClient.preferredTime || ""}</div>}
    </div>
  )}

  <Field label="Notes"><TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} disabled={isCompletedLocked} /></Field>
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 8 }}>
    <div>{form.id && <button style={{ ...btnDng, ...btnSm }} disabled={isCompletedLocked} onClick={() => { onCancel(); onDelete(form.id); }}>{uiText("Delete Job")}</button>}</div>
    <div style={{ display: "flex", gap: 10 }}>
      <button style={btnSec} onClick={onCancel}>{uiText("Cancel")}</button>
      <button style={btnPri} disabled={isCompletedLocked} onClick={() => {
        const hasEmployee = form.id ? !!form.employeeId : ((form.employeeIds || []).length > 0);
        if (form.clientId && hasEmployee) onSave(form);
      }}>{isCompletedLocked ? uiText("Completed") : uiText("Save Job")}</button>
    </div>
  </div>
</div>

);
}

// ==============================================
// TIME CLOCK PAGE
// ==============================================
function TimeClockPage({ data, updateData, showToast }) {
const [validateDate, setValidateDate] = useState(getToday());
const [manualEntry, setManualEntry] = useState({
employeeIds: [],
clientIds: [],
clockInDate: getToday(),
clockInTime: "08:00",
clockOutDate: "",
clockOutTime: "",
notes: "",
});
const [filters, setFilters] = useState({ empIds: [], month: getToday().slice(0, 7) });
const [editEntry, setEditEntry] = useState(null);
const [adjustMap, setAdjustMap] = useState({});

const setManual = (key, value) => setManualEntry(prev => ({ ...prev, [key]: value }));

const doManagerValidate = async (sched, customHours) => {
const workDate = sched.date || validateDate;
const alreadyExists = data.clockEntries.some(c => c.employeeId === sched.employeeId && c.clientId === sched.clientId && toLocalDateKey(c.clockIn) === workDate);
if (alreadyExists) { showToast(uiText("Already validated for today"), "error"); return; }
const plannedH = calcHrs(makeISO(workDate, sched.startTime), makeISO(workDate, sched.endTime));
const validatedH = customHours != null ? customHours : plannedH;
const validatedMinutes = Math.round(validatedH * 60);
const clockIn = makeISO(workDate, sched.startTime);
const clockOutDate = new Date(new Date(clockIn).getTime() + validatedMinutes * 60000);
const clockOut = clockOutDate.toISOString();
const newEntry = {
id: makeId(), employeeId: sched.employeeId, clientId: sched.clientId,
clockIn, clockOut,
notes: customHours != null && customHours !== plannedH ? uiText("Adjusted by manager") : "",
isLate: false, lateMinutes: 0,
scheduledStart: sched.startTime,
validatedByAgent: false,
validatedByManager: true,
plannedHours: plannedH,
};
try {
await createClockEntryInApi(newEntry);
updateData("clockEntries", prev => [...prev, newEntry]);
const schedToSync = (data.schedules || []).find(s => s.id === sched.id && (s.status === "scheduled" || s.status === "in-progress"));
if (schedToSync) syncScheduleToApi({ ...schedToSync, status: "completed" }).catch(console.error);
updateData("schedules", prev => {
let result = updateScheduleStatusForJob(prev, { employeeId: sched.employeeId, clientId: sched.clientId, date: workDate, from: "scheduled", to: "completed" });
if (result === prev) result = updateScheduleStatusForJob(prev, { employeeId: sched.employeeId, clientId: sched.clientId, date: workDate, from: "in-progress", to: "completed" });
return result;
});
setAdjustMap(prev => { const n = { ...prev }; delete n[sched.id]; return n; });
showToast(uiText("Hours validated!"));
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to validate hours", "error");
}
};

const addManualEntry = async () => {
const selectedEmployeeIds = (manualEntry.employeeIds || []).filter(Boolean);
const selectedClientIds = (manualEntry.clientIds || []).filter(Boolean);
if (selectedEmployeeIds.length === 0 || selectedClientIds.length === 0) { showToast("Select employee and client", "error"); return; }
if (!manualEntry.clockInDate || !manualEntry.clockInTime) { showToast("Set clock-in date/time", "error"); return; }

const clockInISO = makeISO(manualEntry.clockInDate, manualEntry.clockInTime);
const hasClockOut = Boolean(manualEntry.clockOutDate && manualEntry.clockOutTime);
const clockOutISO = hasClockOut ? makeISO(manualEntry.clockOutDate, manualEntry.clockOutTime) : null;

if (clockOutISO && new Date(clockOutISO) < new Date(clockInISO)) {
showToast("Clock-out must be after clock-in", "error");
return;
}

const combinations = selectedEmployeeIds.flatMap(employeeId => selectedClientIds.map(clientId => ({ employeeId, clientId })));
const newManualEntries = combinations.map(({ employeeId, clientId }) => ({
  id: makeId(),
  employeeId,
  clientId,
  clockIn: clockInISO,
  clockOut: clockOutISO,
  notes: manualEntry.notes.trim(),
  isLate: false,
  lateMinutes: 0,
  validatedByManager: true,
}));

try {
await Promise.all(newManualEntries.map(createClockEntryInApi));
updateData("clockEntries", prev => [...prev, ...newManualEntries]);
const manualNewStatus = clockOutISO ? "completed" : "in-progress";
newManualEntries.forEach(entry => {
  const manualSchedToSync = (data.schedules || []).find(s => s.employeeId === entry.employeeId && s.clientId === entry.clientId && s.date === manualEntry.clockInDate && s.status === "scheduled");
  if (manualSchedToSync) syncScheduleToApi({ ...manualSchedToSync, status: manualNewStatus }).catch(console.error);
});
updateData("schedules", prev => newManualEntries.reduce((acc, entry) => updateScheduleStatusForJob(acc, {
  employeeId: entry.employeeId,
  clientId: entry.clientId,
  date: manualEntry.clockInDate,
  from: "scheduled",
  to: manualNewStatus,
}), prev));
setManualEntry({
employeeIds: [],
clientIds: [],
clockInDate: getToday(),
clockInTime: "08:00",
clockOutDate: "",
clockOutTime: "",
notes: "",
});
showToast(newManualEntries.length > 1 ? `${newManualEntries.length} entries added` : "Entry added");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to add manual entry", "error");
}
};

const saveEntry = async (entry) => {
try {
await syncClockEntryToApi(entry);
updateData("clockEntries", prev => prev.map(c => c.id === entry.id ? entry : c));
showToast("Updated");
setEditEntry(null);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to update entry", "error");
}
};

const deleteEntry = async (id) => {
try {
const response = await fetch(apiUrl(`/api/clock-entries/${id}`), { method: "DELETE" });
await ensureApiOk(response, "Failed to delete entry");
updateData("clockEntries", prev => prev.filter(c => c.id !== id));
showToast("Deleted", "error");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to delete entry", "error");
}
};

const filteredEntries = data.clockEntries.filter(c => {
if (filters.empIds?.length && !filters.empIds.includes(c.employeeId)) return false;
if (filters.month && !toLocalDateKey(c.clockIn).startsWith(filters.month)) return false;
return c.clockOut;
}).sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));

const activeEmployeeOptions = data.employees.filter(emp => emp.status === "active").map(emp => ({ value: emp.id, label: emp.name }));
const activeClientOptions = data.clients.filter(c => c.status === "active").map(c => ({ value: c.id, label: c.name }));
const employeeFilterOptions = data.employees.map(emp => ({ value: emp.id, label: emp.name }));

const dateScheds = data.schedules.filter(s => s.date === validateDate && s.status !== "cancelled").sort((a, b) => {
const empA = data.employees.find(e => e.id === a.employeeId)?.name || "";
const empB = data.employees.find(e => e.id === b.employeeId)?.name || "";
return empA.localeCompare(empB) || `${a.startTime}`.localeCompare(`${b.startTime}`);
});

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 16 }}>{uiText("Time Clock")}</h1>

  {/* Validate scheduled jobs */}
  <div style={{ ...cardSt, marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: CL.gold, margin: 0 }}>{uiText("Validate Hours")}</h3>
      <DatePicker value={validateDate} onChange={ev => setValidateDate(ev.target.value)} style={{ width: 160 }} />
    </div>
    {dateScheds.length > 0 ? dateScheds.map(sched => {
      const employee = data.employees.find(e => e.id === sched.employeeId);
      const client = data.clients.find(c => c.id === sched.clientId);
      const plannedH = calcHrs(makeISO(sched.date, sched.startTime), makeISO(sched.date, sched.endTime));
      const plannedHours = Math.floor(plannedH);
      const plannedMins = Math.round((plannedH - plannedHours) * 60);
      const isValidated = data.clockEntries.some(c => c.employeeId === sched.employeeId && c.clientId === sched.clientId && toLocalDateKey(c.clockIn) === sched.date);
      const adj = adjustMap[sched.id];
      const isAdjusting = adj != null;
      return (
        <div key={sched.id} style={{ border: `1px solid ${isValidated ? CL.green + "50" : CL.bd}`, borderRadius: 10, padding: "10px 14px", background: CL.s2, marginBottom: 8, borderLeft: `4px solid ${isValidated ? CL.green : CL.gold}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{employee?.name || "?"} <span style={{ color: CL.muted, fontWeight: 400 }}>→</span> {client?.name || "?"}</div>
              <div style={{ fontSize: 12, color: CL.muted, marginTop: 2 }}>{sched.startTime} - {sched.endTime} · {uiText("Planned")}: <strong>{plannedHours}{uiText("h")}{plannedMins > 0 ? `${String(plannedMins).padStart(2, "0")}${uiText("min")}` : ""}</strong></div>
            </div>
            {isValidated && <Badge color={CL.green}>{uiText("Validated")}</Badge>}
          </div>
          {!isValidated && !isAdjusting && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setAdjustMap(prev => ({ ...prev, [sched.id]: { hours: plannedHours, minutes: plannedMins } }))} style={{ ...btnSec, ...btnSm, fontSize: 11 }}>{ICN.edit} {uiText("Modify Hours")}</button>
              <button onClick={() => doManagerValidate(sched)} style={{ ...btnPri, ...btnSm, background: CL.green, fontSize: 12 }}>{ICN.check} {uiText("Validate")}</button>
            </div>
          )}
          {!isValidated && isAdjusting && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${CL.bd}` }}>
              <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{uiText("Adjust hours if needed:")}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <TextInput type="number" min="0" max="23" value={adj.hours} onChange={ev => setAdjustMap(prev => ({ ...prev, [sched.id]: { ...prev[sched.id], hours: ev.target.value } }))} style={{ width: 60, textAlign: "center" }} />
                  <span style={{ color: CL.muted, fontSize: 12 }}>{uiText("h")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <TextInput type="number" min="0" max="59" value={adj.minutes} onChange={ev => setAdjustMap(prev => ({ ...prev, [sched.id]: { ...prev[sched.id], minutes: ev.target.value } }))} style={{ width: 60, textAlign: "center" }} />
                  <span style={{ color: CL.muted, fontSize: 12 }}>{uiText("min")}</span>
                </div>
                <button onClick={() => doManagerValidate(sched, Number(adj.hours || 0) + Number(adj.minutes || 0) / 60)} style={{ ...btnPri, ...btnSm, background: CL.green, fontSize: 12 }}>{ICN.check} {uiText("Validate")}</button>
                <button onClick={() => setAdjustMap(prev => { const n = { ...prev }; delete n[sched.id]; return n; })} style={{ ...btnSec, ...btnSm, fontSize: 11 }}>{uiText("Cancel")}</button>
              </div>
            </div>
          )}
        </div>
      );
    }) : <div style={{ textAlign: "center", padding: 20, color: CL.muted, fontSize: 13 }}>{uiText("No jobs scheduled for today")}</div>}
  </div>

  <div style={{ ...cardSt, marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>{uiText("Owner: Add missed clock-in")}</h3>
    <div className="form-grid" style={{ marginBottom: 8 }}>
      <Field label={uiText("Employee")}>
        <MultiSelectInput
          value={manualEntry.employeeIds}
          onChange={(vals) => setManual("employeeIds", vals)}
          options={activeEmployeeOptions}
          placeholder={uiText("Select...")}
          noResultsLabel="No employees"
          searchThreshold={0}
        />
      </Field>
      <Field label={uiText("Client")}>
        <MultiSelectInput
          value={manualEntry.clientIds}
          onChange={(vals) => setManual("clientIds", vals)}
          options={activeClientOptions}
          placeholder={uiText("Select...")}
          noResultsLabel="No clients"
          searchThreshold={0}
        />
      </Field>
      <Field label={uiText("In Date")}><DatePicker value={manualEntry.clockInDate} onChange={ev => setManual("clockInDate", ev.target.value)} /></Field>
      <Field label={uiText("In Time")}><TimePicker value={manualEntry.clockInTime} onChange={ev => setManual("clockInTime", ev.target.value)} /></Field>
      <Field label={uiText("Out Date (optional)")}><DatePicker value={manualEntry.clockOutDate} onChange={ev => setManual("clockOutDate", ev.target.value)} /></Field>
      <Field label={uiText("Out Time (optional)")}><TimePicker value={manualEntry.clockOutTime} onChange={ev => setManual("clockOutTime", ev.target.value)} /></Field>
    </div>
    <Field label={uiText("Reason / note (optional)")}>
      <TextInput value={manualEntry.notes} onChange={ev => setManual("notes", ev.target.value)} placeholder={uiText("Forgot to clock in, adjusted by owner...")} />
    </Field>
    <button style={{ ...btnPri, background: CL.blue }} onClick={addManualEntry}>{uiText("Add Manual Entry")}</button>
  </div>

  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
    <div style={{ width: 260 }}>
      <SearchableSelectInput
        value={filters.empIds}
        onChange={(vals) => setFilters(f => ({ ...f, empIds: vals }))}
        options={employeeFilterOptions}
        placeholder={uiText("All Employees")}
        multiple
        noResultsLabel="No employees"
      />
    </div>
    <TextInput type="month" value={filters.month} onChange={ev => setFilters(f => ({ ...f, month: ev.target.value }))} style={{ width: 160 }} />
  </div>

  <div style={cardSt} className="tbl-wrap">
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead><tr><th style={thSt}>{uiText("Date")}</th><th style={thSt}>{uiText("Employee")}</th><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("Planned Hours")}</th><th style={thSt}>{uiText("Actual Hours")}</th><th style={thSt}>{uiText("Notes")}</th><th style={thSt}>{uiText("Actions")}</th></tr></thead>
      <tbody>
        {filteredEntries.map(entry => {
          const employee = data.employees.find(e => e.id === entry.employeeId);
          const client = data.clients.find(c => c.id === entry.clientId);
          const hours = calcPayableClockHours(entry, data.schedules, filteredEntries);
          const plannedH = entry.plannedHours != null ? entry.plannedHours : hours;
          return (
            <tr key={entry.id}>
              <td style={tdSt}>{fmtDate(entry.clockIn)}</td>
              <td style={tdSt}>{employee?.name || "-"}</td>
              <td style={tdSt}>{client?.name || "-"}</td>
              <td style={tdSt}>{plannedH.toFixed(2)}h</td>
              <td style={{ ...tdSt, fontWeight: 600 }}>{hours.toFixed(2)}h</td>
              <td style={tdSt}>{entry.notes || "-"}</td>
              <td style={tdSt}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ ...btnSec, ...btnSm }} onClick={() => setEditEntry({ ...entry })}>{ICN.edit}</button>
                  <button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => deleteEntry(entry.id)}>{ICN.trash}</button>
                </div>
              </td>
            </tr>
          );
        })}
        {filteredEntries.length === 0 && <tr><td colSpan={7} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No entries")}</td></tr>}
      </tbody>
    </table>
  </div>

  {editEntry && (
    <ModalBox title={uiText("Edit Entry")} onClose={() => setEditEntry(null)}>
      <TimeEntryForm entry={editEntry} data={data} onSave={saveEntry} onCancel={() => setEditEntry(null)} />
    </ModalBox>
  )}
</div>

);
}

function TimeEntryForm({ entry, data, onSave, onCancel }) {
const clockInDate = entry.clockIn ? toLocalDateKey(entry.clockIn) : getToday();
const clockInTime = entry.clockIn ? entry.clockIn.slice(11, 16) : "08:00";
const actualH = calcHrs(entry.clockIn, entry.clockOut);
const editHours = Math.floor(actualH);
const editMins = Math.round((actualH - editHours) * 60);

const [form, setForm] = useState({ ...entry, clockInDate, clockInTime, editHours, editMins });
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const handleSave = () => {
const totalMinutes = Math.round((Number(form.editHours) || 0) * 60 + (Number(form.editMins) || 0));
const clockIn = makeISO(form.clockInDate, form.clockInTime);
const clockOutDate = new Date(new Date(clockIn).getTime() + totalMinutes * 60000);
const updated = {
...form,
clockIn,
clockOut: clockOutDate.toISOString(),
};
delete updated.clockInDate;
delete updated.clockInTime;
delete updated.editHours;
delete updated.editMins;
onSave(updated);
};

return (
<div>
<div className="form-grid">
<Field label={uiText("Employee")}>
<SelectInput value={form.employeeId} onChange={ev => set("employeeId", ev.target.value)}>
{data.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
</SelectInput>
</Field>
<Field label={uiText("Client")}>
<SelectInput value={form.clientId} onChange={ev => set("clientId", ev.target.value)}>
{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
</SelectInput>
</Field>
<Field label={uiText("Date")}><DatePicker value={form.clockInDate} onChange={ev => set("clockInDate", ev.target.value)} /></Field>
<Field label={uiText("Hours")}>
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
  <TextInput type="number" min="0" max="23" value={form.editHours} onChange={ev => set("editHours", ev.target.value)} style={{ width: 70, textAlign: "center" }} />
  <span style={{ color: CL.muted }}>{uiText("h")}</span>
  <TextInput type="number" min="0" max="59" value={form.editMins} onChange={ev => set("editMins", ev.target.value)} style={{ width: 70, textAlign: "center" }} />
  <span style={{ color: CL.muted }}>{uiText("min")}</span>
</div>
</Field>
</div>
<div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
<button style={btnSec} onClick={onCancel}>{uiText("Cancel")}</button>
<button style={btnPri} onClick={handleSave}>{uiText("Save Hours")}</button>
</div>
</div>
);
}

// ==============================================
// INVOICES PAGE
// ==============================================

function InventoryPage({ data, updateData, showToast }) {
const [productForm, setProductForm] = useState({ name: "", unit: "bottles", stock: 0, minStock: 0, note: "" });
const [deleteProductId, setDeleteProductId] = useState(null);

const products = (data.inventoryProducts || []).sort((a, b) => a.name.localeCompare(b.name));
const requests = (data.productRequests || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const holdings = (data.cleanerProductHoldings || []);

const saveProduct = async () => {
if (!productForm.name.trim()) { showToast(uiText("Product name required"), "error"); return; }
const newProd = { id: makeId(), active: true, ...productForm, name: productForm.name.trim(), stock: Number(productForm.stock) || 0, minStock: Number(productForm.minStock) || 0 };
try {
  const response = await fetch(apiUrl("/api/inventory-products"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProd) });
  await ensureApiOk(response, "Failed to save product");
} catch (err) { showToast("Failed to save product to database", "error"); return; }
updateData("inventoryProducts", (prev = []) => [...prev, newProd]);
setProductForm({ name: "", unit: "bottles", stock: 0, minStock: 0, note: "" });
showToast(uiText("Product added"));
};

const handleDeleteProduct = async (id) => {
try {
  const response = await fetch(apiUrl(`/api/inventory-products/${id}`), { method: "DELETE" });
  await ensureApiOk(response, "Failed to delete product");
} catch (err) { showToast("Failed to delete product from database", "error"); return; }
updateData("inventoryProducts", prev => (prev || []).filter(p => p.id !== id));
setDeleteProductId(null);
showToast(uiText("Product deleted"));
};

const adjustStock = async (id, delta) => {
const product = (data.inventoryProducts || []).find(p => p.id === id);
if (!product) return;
const newStock = Math.max(0, (Number(product.stock) || 0) + delta);
try {
  const response = await fetch(apiUrl(`/api/inventory-products/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, stock: newStock }) });
  await ensureApiOk(response, "Failed to update product stock");
} catch (err) { showToast("Failed to update stock in database", "error"); return; }
updateData("inventoryProducts", prev => (prev || []).map(p => p.id === id ? { ...p, stock: newStock } : p));
};

const setRequestStatus = async (id, status) => {
const req = (data.productRequests || []).find(r => r.id === id);
try {
  const response = await fetch(apiUrl(`/api/product-requests/${id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, approvedQty: req?.approvedQty || 0, deliveredQty: req?.deliveredQty || 0 }) });
  await ensureApiOk(response, "Failed to update request status");
} catch (err) { showToast("Failed to update request status in database", "error"); return; }
updateData("productRequests", prev => (prev || []).map(r => r.id === id ? { ...r, status } : r));
};

const approveRequest = async (req, qty) => {
const approved = Math.max(0, Number(qty) || 0);
try {
  const response = await fetch(apiUrl(`/api/product-requests/${req.id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved", approvedQty: approved, deliveredQty: req.deliveredQty || 0 }) });
  await ensureApiOk(response, "Failed to approve request");
} catch (err) { showToast("Failed to approve request in database", "error"); return; }
updateData("productRequests", prev => (prev || []).map(r => r.id === req.id ? { ...r, status: "approved", approvedQty: approved } : r));
showToast("Request approved");
};

const upsertHolding = async (employeeId, productId, deliveredQty) => {
const prev = data.cleanerProductHoldings || [];
const existing = prev.find(h => h.employeeId === employeeId && h.productId === productId);
if (!existing) {
  const newH = { id: makeId(), employeeId, productId, qtyAssigned: deliveredQty, qtyInHand: deliveredQty, updatedAt: new Date().toISOString() };
  try {
    const response = await fetch(apiUrl("/api/cleaner-product-holdings"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newH) });
    await ensureApiOk(response, "Failed to save cleaner holding");
  } catch (err) { throw new Error("Failed to save cleaner holding"); }
  updateData("cleanerProductHoldings", (h = []) => [...h, newH]);
} else {
  const newQty = (Number(existing.qtyInHand) || 0) + deliveredQty;
  try {
    const response = await fetch(apiUrl(`/api/cleaner-product-holdings/${existing.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qtyInHand: newQty }) });
    await ensureApiOk(response, "Failed to update cleaner holding");
  } catch (err) { throw new Error("Failed to update cleaner holding"); }
  updateData("cleanerProductHoldings", (h = []) => h.map(x => x.id === existing.id ? { ...x, qtyInHand: newQty, updatedAt: new Date().toISOString() } : x));
}
};

const updateHoldingInHand = async (holdingId, qtyInHand) => {
const newQty = Math.max(0, Number(qtyInHand) || 0);
try {
  const response = await fetch(apiUrl(`/api/cleaner-product-holdings/${holdingId}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qtyInHand: newQty }) });
  await ensureApiOk(response, "Failed to update holding");
} catch (err) { showToast("Failed to update holding in database", "error"); return; }
updateData("cleanerProductHoldings", prev => (prev || []).map(h => h.id === holdingId ? { ...h, qtyInHand: newQty, updatedAt: new Date().toISOString() } : h));
};

const deliverRequest = async (req, qty) => {
const delivered = Math.max(0, Number(qty) || 0);
try {
  const response = await fetch(apiUrl(`/api/product-requests/${req.id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "delivered", approvedQty: req.approvedQty || 0, deliveredQty: delivered }) });
  await ensureApiOk(response, "Failed to mark delivery");
} catch (err) { showToast("Failed to mark delivery in database", "error"); return; }
const product = (data.inventoryProducts || []).find(p => p.id === req.productId);
if (product) {
  const newStock = Math.max(0, (Number(product.stock) || 0) - delivered);
  try {
    const response = await fetch(apiUrl(`/api/inventory-products/${req.productId}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, stock: newStock }) });
    await ensureApiOk(response, "Failed to update product stock");
  } catch (err) { showToast("Failed to update product stock in database", "error"); return; }
  updateData("inventoryProducts", prev => (prev || []).map(p => p.id === req.productId ? { ...p, stock: newStock } : p));
}
updateData("productRequests", prev => (prev || []).map(r => r.id === req.id ? { ...r, status: "delivered", deliveredQty: delivered } : r));
await upsertHolding(req.employeeId, req.productId, delivered);
showToast("Products delivered");
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{uiText("Inventory")}</h1>
</div>

<div className="grid-2" style={{ marginBottom: 16 }}>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Add Product")}</h3>
<div className="form-grid">
<Field label="Name"><TextInput value={productForm.name} onChange={ev => setProductForm(v => ({ ...v, name: ev.target.value }))} /></Field>
<Field label="Unit"><TextInput value={productForm.unit} onChange={ev => setProductForm(v => ({ ...v, unit: ev.target.value }))} /></Field>
<Field label="Stock"><TextInput type="number" value={productForm.stock} onChange={ev => setProductForm(v => ({ ...v, stock: ev.target.value }))} /></Field>
<Field label="Min Stock"><TextInput type="number" value={productForm.minStock} onChange={ev => setProductForm(v => ({ ...v, minStock: ev.target.value }))} /></Field>
</div>
<Field label="Note"><TextArea value={productForm.note} onChange={ev => setProductForm(v => ({ ...v, note: ev.target.value }))} /></Field>
<button style={btnPri} onClick={saveProduct}>{ICN.plus} {uiText("Add Product")}</button>
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Usage Overview")}</h3>
{products.map(p => {
const reqs = requests.filter(r => r.productId === p.id);
const requested = reqs.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
const delivered = reqs.reduce((s, r) => s + (Number(r.deliveredQty) || 0), 0);
return <div key={p.id} style={{ padding: "8px 0", borderBottom: `1px solid ${CL.bd}` }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><div><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12, color: CL.muted }}>Stock: {p.stock} {p.unit} · {uiText("Requested:")} {requested} · {uiText("Delivered:")} {delivered}</div></div><div style={{ display: "flex", gap: 4 }}><button style={{ ...btnSec, ...btnSm }} onClick={() => adjustStock(p.id, -1)}>-1</button><button style={{ ...btnSec, ...btnSm }} onClick={() => adjustStock(p.id, 1)}>+1</button><button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => setDeleteProductId(p.id)}>{ICN.trash}</button></div></div></div>;
})}
{products.length === 0 && <p style={{ color: CL.muted }}>{uiText("No products added yet.")}</p>}
</div>
</div>

<div style={{ ...cardSt, marginBottom: 16 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Assigned / In-Hand by Cleaner")}</h3>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{uiText("Cleaner")}</th><th style={thSt}>{uiText("Product")}</th><th style={thSt}>{uiText("Assigned")}</th><th style={thSt}>{uiText("In Hand")}</th><th style={thSt}>{uiText("Update In Hand")}</th></tr></thead>
<tbody>
{holdings.map(h => { const emp = data.employees.find(e => e.id === h.employeeId); const prod = products.find(p => p.id === h.productId) || (data.inventoryProducts || []).find(p => p.id === h.productId); return (
<tr key={h.id}><td style={tdSt}>{emp?.name || "-"}</td><td style={tdSt}>{prod?.name || "-"}</td><td style={tdSt}>{h.qtyAssigned || 0}</td><td style={tdSt}>{h.qtyInHand || 0}</td><td style={tdSt}><div style={{ display: "flex", gap: 4 }}><button style={{ ...btnSec, ...btnSm }} onClick={() => updateHoldingInHand(h.id, (Number(h.qtyInHand)||0) - 1)}>-1</button><button style={{ ...btnSec, ...btnSm }} onClick={() => updateHoldingInHand(h.id, (Number(h.qtyInHand)||0) + 1)}>+1</button></div></td></tr>
); })}
{holdings.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No product assignments yet")}</td></tr>}
</tbody>
</table>
</div>
</div>

<div style={cardSt} className="tbl-wrap">
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Cleaner Product Requests")}</h3>
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{uiText("Cleaner")}</th><th style={thSt}>{uiText("Product")}</th><th style={thSt}>{uiText("Qty")}</th><th style={thSt}>{uiText("Delivery Date & Time")}</th><th style={thSt}>{uiText("Status")}</th><th style={thSt}>{uiText("Actions")}</th></tr></thead>
<tbody>
{requests.map(req => { const emp = data.employees.find(e => e.id === req.employeeId); const prod = products.find(p => p.id === req.productId) || (data.inventoryProducts || []).find(p => p.id === req.productId); return (
<tr key={req.id}><td style={tdSt}>{emp?.name || "-"}</td><td style={tdSt}>{prod?.name || "-"}</td><td style={tdSt}>{req.quantity}</td><td style={tdSt}>{req.deliveryAt ? fmtBoth(req.deliveryAt) : "-"}</td><td style={tdSt}><Badge color={req.status === "delivered" ? CL.green : req.status === "rejected" ? CL.red : req.status === "approved" ? CL.blue : CL.orange}>{uiText(req.status)}</Badge></td><td style={tdSt}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
{req.status === "pending" && <button style={{ ...btnSec, ...btnSm, color: CL.green }} onClick={() => approveRequest(req, req.quantity)}>{ICN.check} {uiText("Approved")}</button>}
{["pending", "approved"].includes(req.status) && <button style={{ ...btnSec, ...btnSm }} onClick={() => deliverRequest(req, req.approvedQty || req.quantity)}>{ICN.doc} {uiText("Deliver")}</button>}
{req.status !== "rejected" && req.status !== "delivered" && <button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => setRequestStatus(req.id, "rejected")}>{ICN.close} {uiText("Reject")}</button>}
</div></td></tr>
); })}
{requests.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No product requests yet")}</td></tr>}
</tbody>
</table>
</div>

{deleteProductId && (
  <ModalBox title={uiText("Delete Product?")} onClose={() => setDeleteProductId(null)}>
    <p style={{ marginBottom: 16 }}>{uiText("Remove this product?")}</p>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <button style={btnSec} onClick={() => setDeleteProductId(null)}>{uiText("Cancel")}</button>
      <button style={btnDng} onClick={() => handleDeleteProduct(deleteProductId)}>{uiText("Delete")}</button>
    </div>
  </ModalBox>
)}
</div>
);
}

function DevisPage({ data, updateData, showToast, devisSeed, setDevisSeed }) {
const { t, lang } = useI18n();
const [modal, setModal] = useState(null);
const [preview, setPreview] = useState(null);
const [quoteForPdf, setQuoteForPdf] = useState(null);
const [quoteEmailDraft, setQuoteEmailDraft] = useState(null);
const [sendingQuoteEmail, setSendingQuoteEmail] = useState(false);
const previewRef = useRef(null);
const hiddenQuoteRef = useRef(null);
const clients = Array.isArray(data?.clients) ? data.clients : [];
const quotes = Array.isArray(data?.quotes) ? data.quotes : [];
const invoices = Array.isArray(data?.invoices) ? data.invoices : [];
const settings = data?.settings || DEFAULTS.settings;

const defaultQuoteColumns = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true };
const defaultVatRate = Number.isFinite(Number(settings?.financeVatRate)) ? Number(settings.financeVatRate) : (Number.isFinite(Number(settings?.defaultVatRate)) ? Number(settings.defaultVatRate) : 17);

const newQuoteDraft = (clientId = "", presetDescription = "Cleaning service") => ({ quoteNumber: quoteNumber(), clientId, date: getToday(), validUntil: "", items: [{ prestationDate: getToday(), description: presetDescription, hours: "", quantity: 1, unitPrice: 0, total: 0 }], pricingMode: "hours", visibleColumns: { ...defaultQuoteColumns }, vatRate: defaultVatRate, subtotal: 0, vatAmount: 0, total: 0, status: "draft", notes: "", paymentTerms: "Quote valid for 30 days.", jobSchedule: { dateFrom: "", dateTo: "", frequency: "one-time", startDate: getToday(), employeeId: "", startTime: "08:00", endTime: "12:00" } });

useEffect(() => {
if (!devisSeed) return;
const seededClientId = typeof devisSeed?.clientId === "string" ? devisSeed.clientId : "";
const seededDescription = typeof devisSeed?.description === "string" && devisSeed.description.trim() ? devisSeed.description.trim() : "Prospect visit quotation";
setModal(newQuoteDraft(seededClientId, seededDescription));
if (setDevisSeed) setDevisSeed(null);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [devisSeed]);

const quoteNumber = (dateStr = getToday()) => {
const [year, month, day] = (dateStr || getToday()).split("-");
const prefix = `DEV-${year || new Date().getFullYear()}-${(month || "01").padStart(2, "0")}-${(day || "01").padStart(2, "0")}-`;
const nums = quotes.map(q => String(q?.quoteNumber || "")).filter(n => n.startsWith(prefix)).map(n => parseInt(n.slice(prefix.length), 10)).filter(n => Number.isFinite(n));
return `${prefix}${nums.length ? Math.max(...nums) + 1 : 1}`;
};

const ensureLib = (src, check) => new Promise((resolve, reject) => {
if (check()) return resolve();
const existing = document.querySelector(`script[src="${src}"]`);
if (existing) {
  if (existing.dataset.loaded === "1") {
    return setTimeout(() => check() ? resolve() : reject(new Error(`Library not available after loading: ${src}`)), 50);
  }
  if (existing.dataset.errored === "1") {
    existing.remove();
  } else {
    const timeout = setTimeout(() => reject(new Error(`Timeout loading library: ${src}`)), 10000);
    existing.addEventListener("load", () => { clearTimeout(timeout); check() ? resolve() : reject(new Error(`Library not available: ${src}`)); });
    existing.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(`Failed to load: ${src}`)); });
    return;
  }
}
const script = document.createElement("script");
script.src = src;
script.async = true;
const timeout = setTimeout(() => reject(new Error(`Timeout loading library: ${src}`)), 10000);
script.onload = () => { clearTimeout(timeout); script.dataset.loaded = "1"; resolve(); };
script.onerror = () => { clearTimeout(timeout); script.dataset.errored = "1"; reject(new Error(`Failed to load: ${src}`)); };
document.body.appendChild(script);
});

const toQuotePreviewShape = (q) => ({ ...q, invoiceNumber: q.quoteNumber, dueDate: q.validUntil });
const waitForPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const waitForRef = (ref, maxMs = 2000) => new Promise((resolve, reject) => {
if (ref.current) return resolve(ref.current);
const start = Date.now();
const check = () => {
  if (ref.current) return resolve(ref.current);
  if (Date.now() - start > maxMs) return reject(new Error("Hidden PDF element not ready in time"));
  requestAnimationFrame(check);
};
requestAnimationFrame(check);
});

const buildPdfFromElement = async (element, fileName, shouldDownload = false) => {
await ensureLib("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", () => Boolean(window.html2canvas));
await ensureLib("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js", () => Boolean(window.jspdf));
const canvas = await window.html2canvas(element, { backgroundColor: "#ffffff", scale: 1.5, useCORS: true });
const { jsPDF } = window.jspdf;
const pdf = new jsPDF("p", "mm", "a4");
const pageWidth = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();
const imgData = canvas.toDataURL("image/jpeg", 0.85);
const imgWidth = pageWidth;
const imgHeight = (canvas.height * imgWidth) / canvas.width;
if (imgHeight <= pageHeight) {
pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
} else {
let y = 0;
while (y < imgHeight) {
pdf.addImage(imgData, "JPEG", 0, -y, imgWidth, imgHeight);
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

const buildQuoteEmailBody = (q, client, template, emailLang) => {
const l = emailLang || lang;
const sig = settings.emailSignature
  ? `\n\n--\n${settings.emailSignature}`
  : `\n\n${l === "fr" ? "Cordialement" : "Best regards"},\n${settings.companyName}\n${settings.companyEmail || ""}${settings.companyPhone ? ` | ${settings.companyPhone}` : ""}`;
const name = client?.contactPerson || client?.name || (l === "fr" ? "Client" : "Customer");
const amount = `€${(q.total || 0).toFixed(2)}`;
const qNum = q.quoteNumber;
const dateStr = fmtDate(q.date);
const validStr = q.validUntil ? fmtDate(q.validUntil) : null;

if (l === "fr") {
  if (template === "followup") {
    return `Bonjour ${name},\n\nNous revenons vers vous concernant notre devis ${qNum} du ${dateStr}.\nMontant : ${amount}${validStr ? `\nValable jusqu'au : ${validStr}` : ""}\n\nN'hésitez pas à nous contacter pour toute question ou pour confirmer votre accord.${sig}`;
  }
  if (template === "reminder") {
    return `Bonjour ${name},\n\nNous vous rappelons que notre devis ${qNum}${validStr ? ` expire le ${validStr}` : " est en attente de votre réponse"}.\nMontant : ${amount}\n\nMerci de nous faire part de votre décision dès que possible.${sig}`;
  }
  // standard
  return `Bonjour ${name},\n\nVeuillez trouver ci-joint notre devis ${qNum}.\nDate : ${dateStr}\nMontant : ${amount}${validStr ? `\nValidité : ${validStr}` : ""}\n\nNous restons disponibles pour toute question ou ajustement.${sig}`;
}

if (template === "followup") {
  return `Hello ${name},\n\nWe are following up on our quote ${qNum} dated ${dateStr}.\nAmount: ${amount}${validStr ? `\nValid until: ${validStr}` : ""}\n\nPlease feel free to contact us for any questions or to confirm your acceptance.${sig}`;
}
if (template === "reminder") {
  return `Hello ${name},\n\nThis is a reminder that our quote ${qNum}${validStr ? ` expires on ${validStr}` : " is awaiting your response"}.\nAmount: ${amount}\n\nKindly let us know your decision at your earliest convenience.${sig}`;
}
return `Dear ${name},\n\nPlease find our quote ${qNum}.\nDate: ${dateStr}\nAmount: ${amount}${validStr ? `\nValid until: ${validStr}` : ""}\n\nDo not hesitate to contact us for any questions or adjustments.${sig}`;
};

const emailQuote = (q) => {
const client = clients.find(c => c.id === q.clientId);
if (!client?.email) { showToast(lang === "fr" ? "Email client manquant" : "Client email missing", "error"); return; }
const template = q.emailTemplate || "standard";
const body = buildQuoteEmailBody(q, client, template, lang);
const subjectMap = lang === "fr"
  ? { standard: `Devis ${q.quoteNumber}`, followup: `Relance devis ${q.quoteNumber}`, reminder: `Rappel — Devis ${q.quoteNumber}` }
  : { standard: `Quote ${q.quoteNumber}`, followup: `Follow-up: Quote ${q.quoteNumber}`, reminder: `Reminder — Quote ${q.quoteNumber}` };
setQuoteEmailDraft({ to: client.email, subject: subjectMap[template] || subjectMap.standard, body, template, q, from: data.settings.companyEmail || "", attachPdf: true });
};

const sendQuoteEmailDraft = async () => {
if (!quoteEmailDraft || sendingQuoteEmail) return;
setSendingQuoteEmail(true);
try {
let pdfAttachments;
if (quoteEmailDraft.attachPdf) {
try {
  const q = quoteEmailDraft.q;
  const currentPreview = preview?.id === q.id ? preview : null;
  let target;
  if (currentPreview) {
    target = previewRef.current;
  } else {
    setQuoteForPdf(toQuotePreviewShape(q));
    target = await waitForRef(hiddenQuoteRef);
  }
  if (target) {
    const pdfBlob = await buildPdfFromElement(target, `${q.quoteNumber || "devis"}.pdf`);
    pdfAttachments = [{ blob: pdfBlob, filename: `${q.quoteNumber || "devis"}.pdf` }];
  }
  if (!currentPreview) setQuoteForPdf(null);
} catch (err) {
  console.error("PDF generation for quote email attachment failed:", err);
  setQuoteForPdf(null);
  showToast(lang === "fr" ? "Le PDF n'a pas pu être généré — l'email sera envoyé sans pièce jointe" : "PDF generation failed — email will be sent without attachment", "error");
}
}
const ok = await sendPlatformEmail({ to: quoteEmailDraft.to, subject: quoteEmailDraft.subject, body: quoteEmailDraft.body, attachments: pdfAttachments }, { showToast, lang });
if (ok) setQuoteEmailDraft(null);
} finally {
  setSendingQuoteEmail(false);
}
};

const sendQuote = (q) => emailQuote(q);

const saveQuote = async (q) => {
const subtotal = (q.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
const vatAmount = Math.round(subtotal * (Number(q.vatRate) || 0) / 100 * 100) / 100;
const hasValidFormat = /^DEV-\d{4}-\d{2}-\d{2}-\d+$/.test(q.quoteNumber || "");
const final = { ...q, quoteNumber: hasValidFormat ? q.quoteNumber : quoteNumber(q.date || getToday()), subtotal, vatAmount, total: subtotal + vatAmount };
try {
if (final.id) {
  const response = await fetch(apiUrl(`/api/quotes/${final.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(final) });
  await ensureApiOk(response, "Unable to update quote");
  updateData("quotes", prev => (prev || []).map(x => x.id === final.id ? final : x));
} else {
  const newQuote = { ...final, id: makeId() };
  const response = await fetch(apiUrl("/api/quotes"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newQuote) });
  await ensureApiOk(response, "Unable to create quote");
  updateData("quotes", prev => [...(prev || []), newQuote]);
}
showToast(final.id ? "Quote updated" : "Quote created");
setModal(null);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to save quote", "error");
}
};

const deleteQuote = async (id) => {
  try {
    const response = await fetch(apiUrl(`/api/quotes/${id}`), { method: "DELETE" });
    await ensureApiOk(response, "Unable to delete quote");
    updateData("quotes", prev => (prev || []).filter(q => q.id !== id));
    showToast("Quote deleted", "error");
  } catch (err) {
    console.error(err);
    showToast(err?.message || "Unable to delete quote", "error");
  }
};

const toInvoiceNum = () => {
const [year, month, day] = getToday().split("-");
const prefix = `LA-${year}-${month}-${day}-`;
const nums = invoices.map(i => String(i.invoiceNumber || "")).filter(n => n.startsWith(prefix)).map(n => parseInt(n.slice(prefix.length), 10)).filter(n => Number.isFinite(n));
return `${prefix}${nums.length ? Math.max(...nums) + 1 : 500}`;
};

const generateScheduleEntries = (clientId, js) => {
const { startDate, dateFrom, dateTo, frequency, employeeId, employeeIds, startTime, endTime } = js || {};
const selectedEmployeeIds = (Array.isArray(employeeIds) && employeeIds.length > 0) ? employeeIds : (employeeId ? [employeeId] : []);
if (!startDate || selectedEmployeeIds.length === 0) return [];
const entries = [];
const endDateStr = dateTo || dateFrom || startDate;
const toDate = d => new Date(d);
const toISO = d => d.toISOString().slice(0, 10);
const addEntry = (d) => selectedEmployeeIds.forEach((assignedEmployeeId) => entries.push({ id: makeId(), date: toISO(d), clientId, employeeId: assignedEmployeeId, startTime: startTime || "08:00", endTime: endTime || "12:00", status: "scheduled", notes: "Généré depuis devis", recurrence: frequency === "one-time" ? "none" : frequency }));
if (frequency === "one-time") {
  addEntry(toDate(startDate));
} else {
  let cur = toDate(startDate);
  const end = toDate(endDateStr);
  while (cur <= end) {
    const weekday = cur.getUTCDay();
    if (frequency !== "daily-weekdays" || (weekday !== 0 && weekday !== 6)) {
      addEntry(new Date(cur));
    }
    if (frequency === "monthly") cur.setUTCMonth(cur.getUTCMonth() + 1);
    else if (frequency === "biweekly") cur.setUTCDate(cur.getUTCDate() + 14);
    else if (frequency === "daily" || frequency === "daily-weekdays") cur.setUTCDate(cur.getUTCDate() + 1);
    else cur.setUTCDate(cur.getUTCDate() + 7);
  }
}
return entries;
};

const convertToInvoice = async (q) => {
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
vatRate: q.vatRate || settings.defaultVatRate,
vatAmount: q.vatAmount || 0,
total: q.total || 0,
status: "draft",
notes: q.notes || "",
paymentTerms: q.paymentTerms || settings.paymentTermsDays || "Payment due within 30 days.",
};
try {
await createInvoiceInApi(invoice);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to save invoice", "error");
return;
}
updateData("invoices", prev => [...prev, invoice]);
try {
  const response = await fetch(apiUrl(`/api/quotes/${q.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...q, status: "converted", convertedInvoiceId: invoice.id }) });
  await ensureApiOk(response, "Unable to update quote status");
} catch (err) {
  console.error(err);
  showToast(err?.message || "Unable to update quote status", "error");
  return;
}
updateData("quotes", prev => (prev || []).map(x => x.id === q.id ? { ...x, status: "converted", convertedInvoiceId: invoice.id } : x));
const js = q.jobSchedule;
if (js && js.startDate && ((Array.isArray(js.employeeIds) && js.employeeIds.length > 0) || js.employeeId)) {
  const newSchedules = generateScheduleEntries(q.clientId, js);
  if (newSchedules.length > 0) {
    try {
      await Promise.all(newSchedules.map(s => createScheduleInApi(s)));
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Unable to save generated schedules", "error");
      return;
    }
    updateData("schedules", prev => [...(prev || []), ...newSchedules]);
    showToast(`Devis converti en facture · ${newSchedules.length} entrée(s) ajoutée(s) au planning`);
    return;
  }
}
showToast("Devis converti en facture");
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
{[...quotes].sort((a,b)=>(b?.date||"").localeCompare(a?.date||"")).map(q => { const client = clients.find(c => c.id === q?.clientId); return (
<tr key={q.id}><td style={tdSt}><strong>{q.quoteNumber}</strong></td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{fmtDate(q.date)}</td><td style={{ ...tdSt, fontWeight: 600 }}>€{(q.total || 0).toFixed(2)}</td><td style={tdSt}><Badge color={q.status === "accepted" || q.status === "converted" ? CL.green : q.status === "rejected" ? CL.red : CL.blue}>{q.status || t("draft")}</Badge></td><td style={tdSt}><div className="action-btn-row" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}><button style={{ ...btnSec, ...btnSm }} onClick={() => setPreview({ ...q, invoiceNumber: q.quoteNumber, dueDate: q.validUntil })}>{t("view")}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...q })}>{ICN.edit}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => downloadQuotePdf(q)}>{ICN.download} PDF</button><button style={{ ...btnSec, ...btnSm }} onClick={() => sendQuote(q)}>{ICN.mail}</button>{q.status !== "converted" && <button style={{ ...btnSec, ...btnSm, color: CL.green }} onClick={() => convertToInvoice(q)}>{lang === "en" ? "To Invoice" : "Vers facture"}</button>}<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => deleteQuote(q.id)}>{ICN.trash}</button></div></td></tr>
); })}
{quotes.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No quotes")}</td></tr>}
</tbody>
</table>
</div>

{preview && <ModalBox title={t("quote") + " — Aperçu"} onClose={() => setPreview(null)} wide><div ref={previewRef}><InvoicePreviewContent invoice={preview} data={data} isQuote={true} /></div><div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}><button style={btnSec} onClick={() => setPreview(null)}>{uiText("Close")}</button><button style={btnPri} onClick={() => downloadQuotePdf(preview)}>{ICN.download} PDF</button><button style={{ ...btnSec, color: CL.blue }} onClick={() => sendQuote(preview)}>{ICN.mail} {t("sendEmail")}</button></div></ModalBox>}
{modal && <ModalBox title={modal.id ? t("editQuote") : t("newQuote")} onClose={() => setModal(null)} wide><QuoteForm quote={{ pricingMode: "hours", visibleColumns: { ...defaultQuoteColumns }, ...modal }} data={data} onSave={saveQuote} onCancel={() => setModal(null)} generateQuoteNumber={quoteNumber} /></ModalBox>}
{quoteForPdf && <div style={{ position: "fixed", left: -10000, top: 0, width: 1200, background: "#fff", zIndex: -1 }}><div ref={hiddenQuoteRef}><InvoicePreviewContent invoice={quoteForPdf} data={data} isQuote={true} /></div></div>}

{quoteEmailDraft && (
<ModalBox title={lang === "fr" ? "Aperçu de l'email — Devis" : "Email Preview — Quote"} onClose={() => setQuoteEmailDraft(null)}>
<div style={{ marginBottom: 14 }}>
  <div className="email-template-btns" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
    {["standard", "followup", "reminder"].map(tpl => (
      <button key={tpl} style={{ ...btnSec, ...btnSm, fontWeight: quoteEmailDraft.template === tpl ? 700 : 400, borderColor: quoteEmailDraft.template === tpl ? CL.gold : CL.bd, color: quoteEmailDraft.template === tpl ? CL.gold : CL.muted }}
        onClick={() => {
          const client = clients.find(c => c.id === quoteEmailDraft.q.clientId);
          const newBody = buildQuoteEmailBody(quoteEmailDraft.q, client, tpl, lang);
          const subjectMap = lang === "fr"
            ? { standard: `Devis ${quoteEmailDraft.q.quoteNumber}`, followup: `Relance devis ${quoteEmailDraft.q.quoteNumber}`, reminder: `Rappel — Devis ${quoteEmailDraft.q.quoteNumber}` }
            : { standard: `Quote ${quoteEmailDraft.q.quoteNumber}`, followup: `Follow-up: Quote ${quoteEmailDraft.q.quoteNumber}`, reminder: `Reminder — Quote ${quoteEmailDraft.q.quoteNumber}` };
          setQuoteEmailDraft(prev => ({ ...prev, template: tpl, body: newBody, subject: subjectMap[tpl] }));
        }}>
        {tpl === "standard" ? (lang === "fr" ? "Standard" : "Standard") : tpl === "followup" ? (lang === "fr" ? "Relance" : "Follow-up") : (lang === "fr" ? "Rappel" : "Reminder")}
      </button>
    ))}
  </div>
  <div style={{ fontSize: 12, color: CL.muted, marginBottom: 4 }}>{lang === "fr" ? "À" : "To"}</div>
  <div style={{ fontWeight: 600, marginBottom: 10, color: CL.text }}>{quoteEmailDraft.to}</div>
  <div style={{ fontSize: 12, color: CL.muted, marginBottom: 4 }}>{lang === "fr" ? "Objet" : "Subject"}</div>
  <input value={quoteEmailDraft.subject} onChange={ev => setQuoteEmailDraft(prev => ({ ...prev, subject: ev.target.value }))} style={{ ...inputSt, width: "100%", marginBottom: 10 }} />
  <div style={{ fontSize: 12, color: CL.muted, marginBottom: 4 }}>{lang === "fr" ? "Corps de l'email" : "Email Body"}</div>
  <textarea className="email-modal-textarea" value={quoteEmailDraft.body} onChange={ev => setQuoteEmailDraft(prev => ({ ...prev, body: ev.target.value }))} style={{ ...inputSt, width: "100%", minHeight: 220, fontFamily: "monospace", fontSize: 13, resize: "vertical", whiteSpace: "pre-wrap" }} />
  <div style={{ fontSize: 11, color: CL.muted, marginTop: 6 }}>{lang === "fr" ? "Expéditeur" : "From"}: {quoteEmailDraft.from}</div>
  <label style={{ fontSize: 12, color: quoteEmailDraft.attachPdf ? "#2e7d32" : CL.muted, marginTop: 8, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
    <input type="checkbox" checked={quoteEmailDraft.attachPdf || false} onChange={e => setQuoteEmailDraft(prev => ({ ...prev, attachPdf: e.target.checked }))} />
    {"\u{1F4CE}"} {lang === "fr" ? "Joindre le PDF devis" : "Attach Quote PDF"}
  </label>
</div>
<div className="email-modal-footer" style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 14, borderTop: `1px solid ${CL.bd}` }}>
  <button style={{ ...btnSec, padding: "10px 24px" }} onClick={() => setQuoteEmailDraft(null)}>{t("cancel")}</button>
  <button style={{ ...btnPri, padding: "10px 28px", opacity: sendingQuoteEmail ? 0.6 : 1 }} onClick={sendQuoteEmailDraft} disabled={sendingQuoteEmail}>{ICN.mail} {sendingQuoteEmail ? (lang === "fr" ? "Envoi…" : "Sending…") : (lang === "fr" ? "Envoyer" : "Send")}</button>
</div>
</ModalBox>
)}
</div>
);
}

function QuoteForm({ quote, data, onSave, onCancel, generateQuoteNumber }) {
const { t } = useI18n();
const defaultColumns = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true };
const defaultJobSchedule = { dateFrom: "", dateTo: "", frequency: "one-time", startDate: "", employeeIds: [], startTime: "08:00", endTime: "12:00" };
const [form, setForm] = useState({ pricingMode: "hours", jobSchedule: { ...defaultJobSchedule }, ...quote, visibleColumns: { ...defaultColumns, ...(quote.visibleColumns || {}) } });
const [globalDescription, setGlobalDescription] = useState("");
const set = (k,v) => setForm(prev => ({ ...prev, [k]: v }));
const setJobSchedule = (k, v) => setForm(prev => ({ ...prev, jobSchedule: { ...(prev.jobSchedule || defaultJobSchedule), [k]: v } }));

const applyDescriptionToAll = () => setForm(prev => ({
  ...prev,
  items: (prev.items || []).map(it => ({ ...it, description: globalDescription })),
}));

const autoQuoteNumber = () => {
  if (!generateQuoteNumber) return;
  set("quoteNumber", generateQuoteNumber());
};

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

const QSectionHeader = ({ label }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: CL.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, marginTop: 28, paddingBottom: 8, borderBottom: `1px solid ${CL.bd}` }}>{label}</div>
);

const itemColTemplate = `${form.visibleColumns?.prestationDate !== false ? "1.2fr " : ""}${form.visibleColumns?.description !== false ? "2.2fr " : ""}${form.visibleColumns?.hours !== false ? ".8fr " : ""}${form.visibleColumns?.quantity !== false ? ".8fr " : ""}${form.visibleColumns?.unitPrice !== false ? "1fr " : ""}${form.visibleColumns?.total !== false ? "1fr " : ""}28px`;
const normalizedFrequency = (() => {
  const freq = form.jobSchedule?.frequency || "one-time";
  if (freq === "daily") return "daily";
  if (freq === "daily-weekdays") return "daily-weekdays";
  return freq;
})();

return (
<div>
  {/* ── Section 1: Core info ── */}
  <QSectionHeader label="Devis — Informations" />
  <div className="form-grid" style={{ gap: 20 }}>
    <Field label={uiText("Quote #")}>
      <div style={{ display: "flex", gap: 8 }}>
        <TextInput value={form.quoteNumber} onChange={ev => set("quoteNumber", ev.target.value)} style={{ flex: 1 }} />
        <button style={{ ...btnSec, padding: "0 14px", whiteSpace: "nowrap" }} onClick={autoQuoteNumber}>{t("auto")}</button>
      </div>
    </Field>
    <Field label="Statut">
      <SelectInput value={form.status || "draft"} onChange={ev => set("status", ev.target.value)}>
        <option value="draft">Brouillon</option>
        <option value="sent">Envoyé</option>
        <option value="accepted">Accepté</option>
        <option value="rejected">Refusé</option>
        <option value="converted">Converti</option>
      </SelectInput>
    </Field>
    <Field label="Client">
      <SelectInput value={form.clientId} onChange={ev => onClientChange(ev.target.value)}>
        <option value="">Sélectionner...</option>
        {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </SelectInput>
    </Field>
    <Field label="Date"><DatePicker value={form.date} onChange={ev => set("date", ev.target.value)} /></Field>
    <Field label="Valide jusqu'au"><DatePicker value={form.validUntil || ""} onChange={ev => set("validUntil", ev.target.value)} /></Field>
    <Field label="TVA %"><TextInput type="number" value={form.vatRate} onChange={ev => set("vatRate", parseFloat(ev.target.value) || 0)} /></Field>
  </div>

  {/* ── Section 2: Pricing & columns ── */}
  <QSectionHeader label="Mode de tarification & colonnes" />
  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 4 }}>
    <div style={{ minWidth: 180 }}>
      <Field label="Mode de tarification">
        <SelectInput value={form.pricingMode || "hours"} onChange={ev => changePricingMode(ev.target.value)}>
          <option value="hours">Par heures</option>
          <option value="subscription">Abonnement</option>
        </SelectInput>
      </Field>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: CL.muted, fontWeight: 500, marginBottom: 8 }}>Colonnes visibles</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "10px 14px", background: CL.bg, borderRadius: 8, border: `1px solid ${CL.bd}` }}>
        {[["prestationDate","Date"],["description","Description"],["hours",uiText("Hours")],["quantity","Quantité"],["unitPrice","Prix unit."],["total","Total"],["tva","TVA"]].map(([col, lbl]) => (
          <label key={col} style={{ fontSize: 12, color: CL.muted, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: form.visibleColumns?.[col] !== false ? CL.gold + "18" : "transparent" }}>
            <input type="checkbox" checked={form.visibleColumns?.[col] !== false} onChange={ev => setForm(prev => ({ ...prev, visibleColumns: { ...(prev.visibleColumns || {}), [col]: ev.target.checked } }))} style={{ accentColor: CL.gold }} /> {lbl}
          </label>
        ))}
      </div>
    </div>
  </div>

  {/* ── Section 2b: Job Schedule ── */}
  <QSectionHeader label="Informations du poste / Planning" />
  <div style={{ background: CL.bg, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: "20px 24px", marginBottom: 6 }}>
    <div className="form-grid" style={{ gap: 20, marginBottom: 16 }}>
      <Field label="Date de début du job">
        <DatePicker value={form.jobSchedule?.startDate || ""} onChange={ev => setJobSchedule("startDate", ev.target.value)} />
      </Field>
      <Field label={uiText("Frequency")}>
        <SelectInput value={normalizedFrequency} onChange={ev => setJobSchedule("frequency", ev.target.value)}>
          <option value="one-time">Une seule fois</option>
          <option value="daily">{uiText("Daily (weekends included)")}</option>
          <option value="daily-weekdays">{uiText("Daily (weekdays only)")}</option>
          <option value="weekly">Chaque semaine</option>
          <option value="biweekly">Toutes les 2 semaines</option>
          <option value="monthly">Chaque mois</option>
        </SelectInput>
      </Field>
      {form.jobSchedule?.frequency !== "one-time" && <>
        <Field label="Période — du">
          <DatePicker value={form.jobSchedule?.dateFrom || ""} onChange={ev => setJobSchedule("dateFrom", ev.target.value)} />
        </Field>
        <Field label="Période — au">
          <DatePicker value={form.jobSchedule?.dateTo || ""} onChange={ev => setJobSchedule("dateTo", ev.target.value)} />
        </Field>
      </>}
      <Field label="Heure début">
        <TextInput type="time" value={form.jobSchedule?.startTime || "08:00"} onChange={ev => setJobSchedule("startTime", ev.target.value)} />
      </Field>
      <Field label="Heure fin">
        <TextInput type="time" value={form.jobSchedule?.endTime || "12:00"} onChange={ev => setJobSchedule("endTime", ev.target.value)} />
      </Field>
      <Field label="Agent(e)s assigné(e)s">
        <SelectInput
          multiple
          size={Math.max(4, Math.min(10, (data.employees || []).length || 4))}
          value={form.jobSchedule?.employeeIds || (form.jobSchedule?.employeeId ? [form.jobSchedule.employeeId] : [])}
          onChange={ev => {
            const nextValue = ev?.target?.value;
            if (Array.isArray(nextValue)) {
              setJobSchedule("employeeIds", nextValue);
              return;
            }
            const selectedOptions = ev?.target?.selectedOptions;
            setJobSchedule("employeeIds", selectedOptions ? Array.from(selectedOptions).map(opt => opt.value) : []);
          }}
          style={{ minHeight: 120 }}
        >
          {(data.employees || []).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </SelectInput>
      </Field>
    </div>
    {((form.jobSchedule?.employeeIds || []).length > 0 || form.jobSchedule?.employeeId) && form.jobSchedule?.startDate && (
      <div style={{ fontSize: 12, color: CL.blue, padding: "8px 12px", background: CL.blue + "14", borderRadius: 8 }}>
        Lors de la conversion en facture, {form.jobSchedule.frequency === "one-time" ? "1 entrée sera" : "les entrées seront"} automatiquement ajoutée(s) au planning.
      </div>
    )}
  </div>

  {/* ── Section 3: Lines ── */}
  <QSectionHeader label="Lignes du devis" />

  {/* Global description bar */}
  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
    <TextInput placeholder="Désignation globale (optionnel)" value={globalDescription} onChange={ev => setGlobalDescription(ev.target.value)} style={{ flex: 1 }} />
    <button style={{ ...btnSec, whiteSpace: "nowrap", padding: "0 16px" }} onClick={applyDescriptionToAll}>Appliquer à toutes les lignes</button>
  </div>

  {/* Lines container */}
  <div style={{ background: CL.bg, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: "16px 20px", marginBottom: 6 }}>
    {/* Column headers */}
    <div style={{ display: "grid", gridTemplateColumns: itemColTemplate, gap: 8, marginBottom: 10, fontSize: 11, color: CL.dim, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
      {form.visibleColumns?.prestationDate !== false && <div>Date</div>}
      {form.visibleColumns?.description !== false && <div>Description</div>}
      {form.visibleColumns?.hours !== false && <div style={{ textAlign: "right" }}>Heures</div>}
      {form.visibleColumns?.quantity !== false && <div style={{ textAlign: "right" }}>Qté</div>}
      {form.visibleColumns?.unitPrice !== false && <div style={{ textAlign: "right" }}>Prix unit.</div>}
      {form.visibleColumns?.total !== false && <div style={{ textAlign: "right" }}>Total</div>}
      <div />
    </div>

    {/* Line items */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
      {(form.items || []).map((it, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: itemColTemplate, gap: 8, alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${CL.bd}` }}>
          {form.visibleColumns?.prestationDate !== false && <DatePicker value={it.prestationDate || ""} onChange={ev => updateItem(idx, "prestationDate", ev.target.value)} />}
          {form.visibleColumns?.description !== false && <TextInput value={it.description || ""} onChange={ev => updateItem(idx, "description", ev.target.value)} placeholder="Description" />}
          {form.visibleColumns?.hours !== false && <TextInput type="number" step="0.25" value={it.hours ?? ""} onChange={ev => updateItem(idx, "hours", ev.target.value === "" ? "" : parseFloat(ev.target.value) || 0)} placeholder="0" style={{ textAlign: "right" }} />}
          {form.visibleColumns?.quantity !== false && <TextInput type="number" step="0.25" value={it.quantity ?? 0} onChange={ev => updateItem(idx, "quantity", parseFloat(ev.target.value) || 0)} placeholder="0" style={{ textAlign: "right" }} />}
          {form.visibleColumns?.unitPrice !== false && <TextInput type="number" step="0.01" value={it.unitPrice} onChange={ev => updateItem(idx, "unitPrice", parseFloat(ev.target.value) || 0)} placeholder="0.00" style={{ textAlign: "right" }} />}
          {form.visibleColumns?.total !== false && <div style={{ textAlign: "right", fontWeight: 600, fontSize: 15, color: CL.text }}>€{Number(it.total || 0).toFixed(2)}</div>}
          <button style={{ background: "none", border: "none", color: CL.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }} onClick={() => setForm(prev => ({ ...prev, items: (prev.items || []).filter((_, j) => j !== idx) }))}>{ICN.close}</button>
        </div>
      ))}
    </div>
    <button style={{ ...btnSec, width: "100%", justifyContent: "center" }} onClick={() => setForm(prev => ({ ...prev, items: [...(prev.items || []), recalcRow({ prestationDate: prev.date, description: globalDescription || "", hours: "", quantity: prev.pricingMode === "hours" ? 0 : 1, unitPrice: 0, total: 0 }, prev.pricingMode)] }))}>+ Ajouter une ligne</button>
  </div>

  {/* Totals */}
  <div style={{ background: CL.bg, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: "16px 20px", marginTop: 16, textAlign: "right" }}>
    <div style={{ fontSize: 13, color: CL.muted, marginBottom: 4 }}>Sous-total : <strong style={{ color: CL.text }}>€{subtotal.toFixed(2)}</strong></div>
    {form.visibleColumns?.tva !== false && <div style={{ fontSize: 13, color: CL.muted, marginBottom: 6 }}>TVA ({form.vatRate}%) : <strong style={{ color: CL.text }}>€{vatAmount.toFixed(2)}</strong></div>}
    <div style={{ fontSize: 22, fontWeight: 700, color: CL.gold, fontFamily: "'Cormorant Garamond', serif" }}>Total : €{(subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount)).toFixed(2)}</div>
  </div>

  {/* ── Section 4: Notes ── */}
  <QSectionHeader label="Notes" />
  <TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} placeholder="Notes internes ou pour le client..." style={{ minHeight: 90 }} />

  {/* Footer buttons */}
  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${CL.bd}` }}>
    <button style={{ ...btnSec, padding: "12px 28px", fontSize: 14 }} onClick={onCancel}>Annuler</button>
    <button style={{ ...btnPri, padding: "12px 32px", fontSize: 14 }} onClick={() => onSave({ ...form, subtotal, vatAmount: form.visibleColumns?.tva === false ? 0 : vatAmount, total: subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount) })}>Enregistrer le devis</button>
  </div>
</div>
);
}

function InvoicesPage({ data, updateData, showToast, emailConfigured = true }) {
const { t, lang } = useI18n();
const [modal, setModal] = useState(null);
const [preview, setPreview] = useState(null);
const [emailDraft, setEmailDraft] = useState(null);
const [filters, setFilters] = useState({ invoiceNumber: "", clientId: "", status: "", dateFrom: "", dateTo: "" });
const [invoiceForPdf, setInvoiceForPdf] = useState(null);
const [sendingEmail, setSendingEmail] = useState(false);
const hiddenInvoiceRef = useRef(null);

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
const sameDayClocks = data.clockEntries.filter(c => c.clientId === s.clientId && c.employeeId === s.employeeId && toLocalDateKey(c.clockIn) === s.date && c.clockOut);
const clockHours = sameDayClocks.reduce((sum, c) => sum + calcPayableClockHours(c, data.schedules, sameDayClocks), 0);
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
.filter(c => c.clientId === clientId && c.clockOut && inRange(toLocalDateKey(c.clockIn)))
.map(c => {
const employee = data.employees.find(e => e.id === c.employeeId);
return {
id: `clock-${c.id}`,
source: "clock",
prestationDate: toLocalDateKey(c.clockIn),
description: `Prestation ${toLocalDateKey(c.clockIn)} (clock ${fmtTime(c.clockIn)}-${fmtTime(c.clockOut)})`,
hours: Math.round(calcPayableClockHours(c, data.schedules, data.clockEntries) * 100) / 100,
employeeName: employee?.name || "Unassigned",
};
})
.filter(r => !existingKeys.has(`${r.prestationDate}-${r.employeeName}`));

return [...scheduleRows, ...manualClockRows].sort((a, b) => `${a.prestationDate}`.localeCompare(b.prestationDate));
};

const handleStatusChange = async (inv, newStatus) => {
try {
const shouldEmail = (newStatus === "sent" || newStatus === "overdue");
const res = await fetch(apiUrl(`/api/invoices/${inv.id}/status`), {
method: "PATCH",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ status: newStatus, skipEmail: shouldEmail }),
});
if (!res.ok) throw new Error("Failed to update status");
updateData("invoices", prev => prev.map(i => i.id === inv.id ? { ...i, status: newStatus } : i));
showToast(lang === "fr" ? "Statut mis à jour" : "Status updated");

if (shouldEmail) {
  const client = data.clients.find(c => c.id === inv.clientId);
  if (!client?.email) return;

  let pdfAttachments;
  try {
    setInvoiceForPdf(inv);
    await waitForPaint();
    const target = hiddenInvoiceRef.current;
    if (target) {
      const pdfBlob = await buildPdfFromElement(target, `${inv.invoiceNumber || "invoice"}.pdf`);
      pdfAttachments = [{ blob: pdfBlob, filename: `${inv.invoiceNumber || "invoice"}.pdf` }];
    }
    setInvoiceForPdf(null);
  } catch (pdfErr) {
    console.error("PDF generation for status-change email failed:", pdfErr);
    setInvoiceForPdf(null);
  }

  const template = newStatus === "overdue" ? "overdue" : "friendly";
  const body = buildEmailBody(inv, client, template, lang);
  const subject = newStatus === "overdue"
    ? (lang === "fr" ? `Relance — Facture ${inv.invoiceNumber}` : `Overdue: Invoice ${inv.invoiceNumber}`)
    : (lang === "fr" ? `Facture ${inv.invoiceNumber} — Lux Angels` : `Invoice ${inv.invoiceNumber} — Lux Angels`);

  await sendPlatformEmail({ to: client.email, subject, body, attachments: pdfAttachments }, { showToast, lang });
}
} catch (err) {
console.error(err);
showToast(lang === "fr" ? "Impossible de mettre à jour le statut" : "Unable to update status", "error");
}
};

const handleSave = async (inv) => {
const subtotal = (inv.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
const vatAmount = Math.round(subtotal * (Number(inv.vatRate) || 0) / 100 * 100) / 100;
const hasValidFormat = /^LA-\d{4}-\d{2}-\d{2}-\d+$/.test(inv.invoiceNumber || "");
const final = { ...inv, invoiceNumber: hasValidFormat ? inv.invoiceNumber : nextInvoiceNum(inv.date || getToday()), subtotal, vatAmount, total: subtotal + vatAmount };
try {
if (final.id) {
await syncInvoiceToApi(final);
updateData("invoices", prev => prev.map(i => i.id === final.id ? final : i));
} else {
const newInv = { ...final, id: makeId() };
await createInvoiceInApi(newInv);
updateData("invoices", prev => [...prev, newInv]);
}
showToast(final.id ? "Updated" : "Created");
setModal(null);
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to save invoice", "error");
}
};

const handleDelete = async (id) => {
try {
await deleteInvoiceFromApi(id);
updateData("invoices", prev => prev.filter(i => i.id !== id));
showToast("Deleted", "error");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to delete invoice", "error");
}
};

const previewRef = useRef(null);

const ensureLib = (src, check) => new Promise((resolve, reject) => {
if (check()) return resolve();
const existing = document.querySelector(`script[src="${src}"]`);
if (existing) {
  if (existing.dataset.loaded === "1") {
    return setTimeout(() => check() ? resolve() : reject(new Error(`Library not available after loading: ${src}`)), 50);
  }
  if (existing.dataset.errored === "1") {
    existing.remove();
  } else {
    const timeout = setTimeout(() => reject(new Error(`Timeout loading library: ${src}`)), 10000);
    existing.addEventListener("load", () => { clearTimeout(timeout); check() ? resolve() : reject(new Error(`Library not available: ${src}`)); });
    existing.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(`Failed to load: ${src}`)); });
    return;
  }
}
const script = document.createElement("script");
script.src = src;
script.async = true;
const timeout = setTimeout(() => reject(new Error(`Timeout loading library: ${src}`)), 10000);
script.onload = () => { clearTimeout(timeout); script.dataset.loaded = "1"; resolve(); };
script.onerror = () => { clearTimeout(timeout); script.dataset.errored = "1"; reject(new Error(`Failed to load: ${src}`)); };
document.body.appendChild(script);
});

const waitForPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const waitForRef = (ref, maxMs = 2000) => new Promise((resolve, reject) => {
if (ref.current) return resolve(ref.current);
const start = Date.now();
const check = () => {
  if (ref.current) return resolve(ref.current);
  if (Date.now() - start > maxMs) return reject(new Error("Hidden PDF element not ready in time"));
  requestAnimationFrame(check);
};
requestAnimationFrame(check);
});

const buildPdfFromElement = async (element, fileName, shouldDownload = false) => {
await ensureLib("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", () => Boolean(window.html2canvas));
await ensureLib("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js", () => Boolean(window.jspdf));
const canvas = await window.html2canvas(element, { backgroundColor: "#ffffff", scale: 1.5, useCORS: true });
const { jsPDF } = window.jspdf;
const pdf = new jsPDF("p", "mm", "a4");
const pageWidth = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();
const imgData = canvas.toDataURL("image/jpeg", 0.85);
const imgWidth = pageWidth;
const imgHeight = (canvas.height * imgWidth) / canvas.width;
if (imgHeight <= pageHeight) {
  pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
} else {
  let y = 0;
  while (y < imgHeight) {
    pdf.addImage(imgData, "JPEG", 0, -y, imgWidth, imgHeight);
    y += pageHeight;
    if (y < imgHeight) pdf.addPage();
  }
}
if (shouldDownload) { pdf.save(fileName); return null; }
return pdf.output("blob");
};

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

const buildEmailBody = (inv, client, template, emailLang) => {
const l = emailLang || lang;
const sig = data.settings.emailSignature
  ? `\n\n--\n${data.settings.emailSignature}`
  : `\n\n${l === "fr" ? "Cordialement" : "Best regards"},\n${data.settings.companyName}\n${data.settings.companyEmail || ""}${data.settings.companyPhone ? ` | ${data.settings.companyPhone}` : ""}`;
const name = client.contactPerson || client.name;
const amount = `€${(inv.total || 0).toFixed(2)}`;
const invNum = inv.invoiceNumber;
const dateStr = fmtDate(inv.date);
const dueStr = inv.dueDate ? fmtDate(inv.dueDate) : null;

if (l === "fr") {
  if (template === "friendly") {
    return `Bonjour ${name},\n\nVeuillez trouver ci-joint votre facture ${invNum} pour les services de nettoyage du ${dateStr}.\nMontant dû : ${amount}${dueStr ? `\nDate d'échéance : ${dueStr}` : ""}\n\nN'hésitez pas à nous contacter si vous avez des questions.${sig}`;
  }
  if (template === "thank_you") {
    return `Chère/Cher ${name},\n\nNous vous remercions de votre confiance envers ${data.settings.companyName || "Lux Angels Cleaning"} !\n\nVeuillez trouver ci-joint la facture ${invNum} du ${dateStr}.\nTotal : ${amount}\n\nNous vous remercions et restons à votre disposition pour toute question.${sig}`;
  }
  if (template === "overdue") {
    return `Chère/Cher ${name},\n\nNous vous rappelons que la facture ${invNum} du ${dateStr} est toujours en attente de règlement.\nMontant restant dû : ${amount}${dueStr ? `\nDate d'échéance dépassée : ${dueStr}` : ""}\n\nNous vous prions de bien vouloir procéder au paiement dans les meilleurs délais. Contactez-nous si vous avez déjà effectué ce virement.${sig}`;
  }
  return `Chère/Cher ${name},\n\nVeuillez trouver ci-joint les détails de votre facture :\n\nFacture : ${invNum}\nDate : ${dateStr}${dueStr ? `\nÉchéance : ${dueStr}` : ""}\nTotal : ${amount}\n\nNous restons disponibles pour toute question.${sig}`;
}

if (template === "friendly") {
  return `Hello ${name},\n\nPlease find your invoice ${invNum} for cleaning services on ${dateStr}.\nAmount due: ${amount}${dueStr ? `\nDue date: ${dueStr}` : ""}\n\nFeel free to reach out if you have any questions.${sig}`;
}
if (template === "thank_you") {
  return `Dear ${name},\n\nThank you for choosing ${data.settings.companyName || "Lux Angels Cleaning"}!\n\nPlease find attached invoice ${invNum} dated ${dateStr}.\nTotal: ${amount}\n\nWe appreciate your trust and look forward to serving you again.${sig}`;
}
if (template === "overdue") {
  return `Dear ${name},\n\nThis is a reminder that invoice ${invNum} dated ${dateStr} is now overdue.\nOutstanding amount: ${amount}${dueStr ? `\nDue date: ${dueStr}` : ""}\n\nPlease arrange payment at your earliest convenience. Contact us if you have already settled this invoice.${sig}`;
}
return `Dear ${name},\n\nInvoice: ${invNum}\nDate: ${dateStr}${dueStr ? `\nDue date: ${dueStr}` : ""}\nTotal: ${amount}\n\nPlease find your invoice details above. Do not hesitate to contact us for any questions.${sig}`;
};

const emailInvoice = (inv) => {
const client = data.clients.find(c => c.id === inv.clientId);
if (!client?.email) { showToast(lang === "fr" ? "Email client manquant" : "Client email missing", "error"); return; }
const template = inv.emailTemplate || "standard";
const body = buildEmailBody(inv, client, template, lang);
const subjectMap = lang === "fr"
  ? { standard: `Facture ${inv.invoiceNumber}`, friendly: `Facture ${inv.invoiceNumber}`, thank_you: `Merci — Facture ${inv.invoiceNumber}`, overdue: `Relance — Facture ${inv.invoiceNumber}` }
  : { standard: `Invoice ${inv.invoiceNumber}`, friendly: `Invoice ${inv.invoiceNumber}`, thank_you: `Thank you — Invoice ${inv.invoiceNumber}`, overdue: `Overdue: Invoice ${inv.invoiceNumber}` };
setEmailDraft({ to: client.email, subject: subjectMap[template] || subjectMap.standard, body, template, inv, from: data.settings.companyEmail || "", attachPdf: true });
};

const sendEmailDraft = async () => {
if (!emailDraft || sendingEmail) return;
setSendingEmail(true);
try {
let pdfAttachments;
if (emailDraft.attachPdf) {
try {
  const inv = emailDraft.inv;
  const currentPreview = preview?.id === inv.id ? preview : null;
  let target;
  if (currentPreview) {
    target = previewRef.current;
  } else {
    setInvoiceForPdf(inv);
    target = await waitForRef(hiddenInvoiceRef);
  }
  if (target) {
    const pdfBlob = await buildPdfFromElement(target, `${inv.invoiceNumber || "invoice"}.pdf`);
    pdfAttachments = [{ blob: pdfBlob, filename: `${inv.invoiceNumber || "invoice"}.pdf` }];
  }
  if (!currentPreview) setInvoiceForPdf(null);
} catch (err) {
  console.error("PDF generation for invoice email attachment failed:", err);
  setInvoiceForPdf(null);
  showToast(lang === "fr" ? "Le PDF n'a pas pu être généré — l'email sera envoyé sans pièce jointe" : "PDF generation failed — email will be sent without attachment", "error");
}
}
const ok = await sendPlatformEmail({ to: emailDraft.to, subject: emailDraft.subject, body: emailDraft.body, attachments: pdfAttachments }, { showToast, lang });
if (ok) setEmailDraft(null);
} finally {
  setSendingEmail(false);
}
};

const filteredInvoices = data.invoices
.filter(inv => {
  if (filters.invoiceNumber && !String(inv.invoiceNumber || "").toLowerCase().includes(filters.invoiceNumber.toLowerCase())) return false;
  if (filters.clientId && inv.clientId !== filters.clientId) return false;
  if (filters.status && effectiveInvoiceStatus(inv) !== filters.status) return false;
  if (filters.dateFrom && (inv.date || "") < filters.dateFrom) return false;
  if (filters.dateTo && (inv.date || "") > filters.dateTo) return false;
  return true;
})
.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

const hasFilters = filters.invoiceNumber || filters.clientId || filters.status || filters.dateFrom || filters.dateTo;

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{t("invoices")}</h1>
<button style={btnPri} onClick={() => setModal({ clientId: "", date: getToday(), dueDate: "", invoiceNumber: nextInvoiceNum(), items: [{ prestationDate: getToday(), description: "", hours: "", quantity: 1, unitPrice: 0, total: 0 }], visibleColumns: { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true }, subtotal: 0, vatRate: Number(data.settings.financeVatRate ?? data.settings.defaultVatRate ?? 17), vatAmount: 0, total: 0, status: "draft", notes: "", paymentTerms: data.settings.paymentTermsDays || "Payment due within 30 days.", emailTemplate: "standard", zohoEmail: data.settings.companyEmail || "" })}>{ICN.plus} {t("newInvoice")}</button>
</div>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "flex-end" }}>
<input
  placeholder={lang === "fr" ? "N° facture…" : "Invoice #…"}
  value={filters.invoiceNumber}
  onChange={e => setFilters(f => ({ ...f, invoiceNumber: e.target.value }))}
  style={{ ...inputSt, width: 140, fontSize: 13 }}
/>
<SelectInput
  value={filters.clientId}
  onChange={e => setFilters(f => ({ ...f, clientId: e.target.value }))}
  style={{ ...inputSt, width: 180, fontSize: 13 }}
>
  <option value="">{lang === "fr" ? "Tous les clients" : "All clients"}</option>
  {[...data.clients].sort((a, b) => (a.name || "").localeCompare(b.name || "")).map(c => (
    <option key={c.id} value={c.id}>{c.name}</option>
  ))}
</SelectInput>
<SelectInput
  value={filters.status}
  onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
  style={{ ...inputSt, width: 140, fontSize: 13 }}
>
  <option value="">{lang === "fr" ? "Tous les statuts" : "All statuses"}</option>
  <option value="draft">{lang === "fr" ? "Brouillon" : "Draft"}</option>
  <option value="sent">{lang === "fr" ? "Envoyée" : "Sent"}</option>
  <option value="paid">{lang === "fr" ? "Payée" : "Paid"}</option>
  <option value="overdue">{lang === "fr" ? "En retard" : "Overdue"}</option>
</SelectInput>
<input
  type="date"
  value={filters.dateFrom}
  onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
  style={{ ...inputSt, width: 150, fontSize: 13 }}
  title={lang === "fr" ? "Date de début" : "Date from"}
/>
<input
  type="date"
  value={filters.dateTo}
  onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
  style={{ ...inputSt, width: 150, fontSize: 13 }}
  title={lang === "fr" ? "Date de fin" : "Date to"}
/>
{hasFilters && (
  <button style={{ ...btnSec, fontSize: 13 }} onClick={() => setFilters({ invoiceNumber: "", clientId: "", status: "", dateFrom: "", dateTo: "" })}>
    {lang === "fr" ? "Effacer" : "Clear"}
  </button>
)}
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>#</th><th style={thSt}>{t("client")}</th><th style={thSt}>{t("date")}</th><th style={thSt}>{t("total")}</th><th style={thSt}>{t("status")}</th><th style={thSt}>{t("actions")}</th></tr></thead>
<tbody>
{filteredInvoices.map(inv => { const client = data.clients.find(c => c.id === inv.clientId); const effStatus = effectiveInvoiceStatus(inv); return (
<tr key={inv.id}>
  <td style={tdSt}><strong>{inv.invoiceNumber}</strong></td>
  <td style={tdSt}>{client?.name || "-"}</td>
  <td style={tdSt}>
    {fmtDate(inv.date)}
    {inv.dueDate ? <div style={{ fontSize: 11, color: effStatus === "overdue" ? CL.red : CL.muted }}>{lang === "fr" ? "Échéance:" : "Due:"} {fmtDate(inv.dueDate)}</div> : null}
  </td>
  <td style={{ ...tdSt, fontWeight: 600 }}>€{(inv.total || 0).toFixed(2)}</td>
  <td style={tdSt}>
    {(() => {
      const statusColor = effStatus === "paid" ? CL.green : effStatus === "overdue" ? CL.red : effStatus === "sent" ? CL.blue : CL.muted;
      return (
        <SelectInput value={effStatus} onChange={e => handleStatusChange(inv, e.target.value)} style={{ minWidth: 130, height: 32, fontSize: 12, borderRadius: 20, border: `1.5px solid ${statusColor}`, color: statusColor }}>
          <option value="draft">{lang === "fr" ? "Brouillon" : "Draft"}</option>
          <option value="sent">{lang === "fr" ? "Envoyée" : "Sent"}</option>
          <option value="paid">{lang === "fr" ? "Payée ✓" : "Paid ✓"}</option>
          <option value="overdue">{lang === "fr" ? "En retard" : "Overdue"}</option>
        </SelectInput>
      );
    })()}
  </td>
  <td style={tdSt}>
    <div className="action-btn-row" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      <button style={{ ...btnSec, ...btnSm }} onClick={() => setPreview(inv)}>{t("view")}</button>
      <button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...inv })}>{ICN.edit}</button>
      <button style={{ ...btnSec, ...btnSm }} onClick={() => emailInvoice(inv)}>{ICN.mail}</button>
      <button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => handleDelete(inv.id)}>{ICN.trash}</button>
    </div>
  </td>
</tr>
); })}
{filteredInvoices.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{hasFilters ? (lang === "fr" ? "Aucune facture trouvée" : "No invoices match filters") : uiText("No invoices")}</td></tr>}
</tbody>
</table>
</div>

{invoiceForPdf && <div style={{ position: "fixed", left: -10000, top: 0, width: 1200, background: "#fff", zIndex: -1 }}><div ref={hiddenInvoiceRef}><InvoicePreviewContent invoice={invoiceForPdf} data={data} /></div></div>}

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

{emailDraft && (
<ModalBox title={lang === "fr" ? "Aperçu de l'email" : "Email Preview"} onClose={() => setEmailDraft(null)}>
<div style={{ marginBottom: 14 }}>
  <div className="email-template-btns" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
    {["standard","friendly","thank_you","overdue"].map(tpl => (
      <button key={tpl} style={{ ...btnSec, ...btnSm, fontWeight: emailDraft.template === tpl ? 700 : 400, borderColor: emailDraft.template === tpl ? CL.gold : CL.bd, color: emailDraft.template === tpl ? CL.gold : CL.muted }}
        onClick={() => {
          const client = data.clients.find(c => c.id === emailDraft.inv.clientId);
          const newBody = buildEmailBody(emailDraft.inv, client, tpl, lang);
          const subjectMap = lang === "fr"
            ? { standard: `Facture ${emailDraft.inv.invoiceNumber}`, friendly: `Facture ${emailDraft.inv.invoiceNumber}`, thank_you: `Merci — Facture ${emailDraft.inv.invoiceNumber}`, overdue: `Relance — Facture ${emailDraft.inv.invoiceNumber}` }
            : { standard: `Invoice ${emailDraft.inv.invoiceNumber}`, friendly: `Invoice ${emailDraft.inv.invoiceNumber}`, thank_you: `Thank you — Invoice ${emailDraft.inv.invoiceNumber}`, overdue: `Overdue: Invoice ${emailDraft.inv.invoiceNumber}` };
          setEmailDraft(prev => ({ ...prev, template: tpl, body: newBody, subject: subjectMap[tpl] }));
        }}>
        {tpl === "standard" ? (lang === "fr" ? "Standard" : "Standard") : tpl === "friendly" ? (lang === "fr" ? "Amical" : "Friendly") : tpl === "thank_you" ? (lang === "fr" ? "Merci" : "Thank You") : (lang === "fr" ? "Relance" : "Overdue")}
      </button>
    ))}
  </div>
  <div style={{ fontSize: 12, color: CL.muted, marginBottom: 4 }}>{lang === "fr" ? "À" : "To"}</div>
  <div style={{ fontWeight: 600, marginBottom: 10, color: CL.text }}>{emailDraft.to}</div>
  <div style={{ fontSize: 12, color: CL.muted, marginBottom: 4 }}>{lang === "fr" ? "Objet" : "Subject"}</div>
  <input value={emailDraft.subject} onChange={ev => setEmailDraft(prev => ({ ...prev, subject: ev.target.value }))} style={{ ...inputSt, width: "100%", marginBottom: 10 }} />
  <div style={{ fontSize: 12, color: CL.muted, marginBottom: 4 }}>{lang === "fr" ? "Corps de l'email" : "Email Body"}</div>
  <textarea className="email-modal-textarea" value={emailDraft.body} onChange={ev => setEmailDraft(prev => ({ ...prev, body: ev.target.value }))} style={{ ...inputSt, width: "100%", minHeight: 220, fontFamily: "monospace", fontSize: 13, resize: "vertical", whiteSpace: "pre-wrap" }} />
  <div style={{ fontSize: 11, color: CL.muted, marginTop: 6 }}>{lang === "fr" ? "Expéditeur" : "From"}: {emailDraft.from}</div>
  <label style={{ fontSize: 12, color: emailDraft.attachPdf ? "#2e7d32" : CL.muted, marginTop: 8, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
    <input type="checkbox" checked={emailDraft.attachPdf || false} onChange={e => setEmailDraft(prev => ({ ...prev, attachPdf: e.target.checked }))} />
    {"\u{1F4CE}"} {lang === "fr" ? "Joindre le PDF facture" : "Attach Invoice PDF"}
  </label>
</div>
<div className="email-modal-footer" style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 14, borderTop: `1px solid ${CL.bd}` }}>
  <button style={{ ...btnSec, padding: "10px 24px" }} onClick={() => setEmailDraft(null)}>{t("cancel")}</button>
  <button style={{ ...btnPri, padding: "10px 28px", opacity: sendingEmail ? 0.6 : 1 }} onClick={sendEmailDraft} disabled={sendingEmail}>{ICN.mail} {sendingEmail ? (lang === "fr" ? "Envoi…" : "Sending…") : (lang === "fr" ? "Envoyer" : "Send")}</button>
</div>
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
setScheduleLoadMessage(uiText("No services found for this period."));
return;
}
const unitPrice = Number(defaultUnitPrice || 0);
const nextItems = prestations.map(p => {
const quantity = p.hours && p.hours > 0 ? Math.round(p.hours * 100) / 100 : 1;
return { prestationDate: p.prestationDate, description: "", hours: p.hours ? Math.round(p.hours * 100) / 100 : "", quantity, unitPrice, total: Math.round(quantity * unitPrice * 100) / 100 };
});
setForm(prev => ({ ...prev, items: nextItems }));
setScheduleLoadMessage(nextItems.length ? uiText("Services loaded from latest schedule.") : uiText("No services found for this period."));
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

const SectionHeader = ({ label }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: CL.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, marginTop: 28, paddingBottom: 8, borderBottom: `1px solid ${CL.bd}` }}>{label}</div>
);

return (
<div>
  {/* ── Section 1: Core info ── */}
  <SectionHeader label={t("invoice") + " — Informations"} />
  <div className="form-grid" style={{ gap: 20 }}>
    <Field label={`${t("invoice")} #`}>
      <div style={{ display: "flex", gap: 8 }}>
        <TextInput value={form.invoiceNumber} onChange={ev => set("invoiceNumber", ev.target.value)} style={{ flex: 1 }} />
        <button style={{ ...btnSec, padding: "0 16px", whiteSpace: "nowrap" }} onClick={() => set("invoiceNumber", nextInvoiceNum(form.date || getToday()))}>{t("auto")}</button>
      </div>
    </Field>
    <Field label={t("status")}>
      <SelectInput value={form.status} onChange={ev => set("status", ev.target.value)}>
        <option value="draft">{t("draft")}</option>
        <option value="sent">{t("sent")}</option>
        <option value="paid">{t("paid")}</option>
        <option value="overdue">{t("overdue")}</option>
      </SelectInput>
    </Field>
    <Field label={t("client")}>
      <SelectInput value={form.clientId} onChange={ev => onClientChange(ev.target.value)}>
        <option value="">{t("select")}</option>
        {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </SelectInput>
    </Field>
    <Field label={t("invoiceDate")}>
      <DatePicker value={form.date} onChange={ev => { const v = ev.target.value; set("date", v); if (!form.invoiceNumber || /^LA-\d{4}-\d{2}-\d{2}-\d+$/.test(form.invoiceNumber)) set("invoiceNumber", nextInvoiceNum(v)); }} />
    </Field>
    <Field label="TVA %">
      <TextInput type="number" value={form.vatRate} onChange={ev => set("vatRate", parseFloat(ev.target.value) || 0)} />
    </Field>
    <Field label="Due">
      <DatePicker value={form.dueDate || ""} onChange={ev => set("dueDate", ev.target.value)} />
    </Field>
  </div>

  {/* ── Section 2: Billing period ── */}
  <SectionHeader label={uiText("Billing period")} />
  <div style={{ background: CL.bg, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: "20px 24px", marginBottom: 6 }}>
    <div className="form-grid" style={{ gap: 20, marginBottom: 16 }}>
      <Field label={uiText("Start date")}><DatePicker value={form.billingStart || ""} onChange={ev => set("billingStart", ev.target.value)} /></Field>
      <Field label={uiText("End date")}><DatePicker value={form.billingEnd || ""} onChange={ev => set("billingEnd", ev.target.value)} /></Field>
    </div>
    <button style={{ ...btnPri, width: "100%", justifyContent: "center", marginBottom: 14 }} onClick={loadPrestationsFromRange} disabled={!form.clientId}>
      {uiText("Load services from schedule")}
    </button>
    <div style={{ fontSize: 12, color: CL.dim, marginBottom: 10 }}>{uiText("Services loaded from latest schedule.")}</div>
    <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
      {prestations.map(p => (
        <button key={p.id} style={{ ...btnSec, width: "100%", display: "flex", justifyContent: "space-between", padding: "10px 14px", textAlign: "left" }} onClick={() => addPrestation(p)}>
          <span>{fmtDate(p.prestationDate)} · {p.employeeName} · {p.description}</span>
          <span style={{ color: CL.gold, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{p.hours ? `${p.hours.toFixed(2)}h` : ""}</span>
        </button>
      ))}
      {prestations.length === 0 && <div style={{ fontSize: 12, color: CL.dim, padding: "6px 2px" }}>{uiText("No services found for this period.")}</div>}
    </div>
    {scheduleLoadMessage && <div style={{ fontSize: 12, color: CL.blue, marginTop: 8 }}>{scheduleLoadMessage}</div>}
  </div>

  {/* ── Section 3: Line items ── */}
  <SectionHeader label={uiText("Invoice lines")} />

  {/* Visible columns toggle */}
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, padding: "10px 14px", background: CL.bg, borderRadius: 8, border: `1px solid ${CL.bd}` }}>
    <span style={{ fontSize: 11, color: CL.dim, fontWeight: 600, marginRight: 4, alignSelf: "center" }}>{uiText("Columns:")}</span>
    {[["prestationDate",uiText("Date")],["description",uiText("Description")],["hours",uiText("Hours")],["quantity",uiText("Qty")],["unitPrice",uiText("Unit price")],["total",uiText("Total")],["tva","TVA"]].map(([col, lbl]) => (
      <label key={col} style={{ fontSize: 12, color: CL.muted, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: form.visibleColumns?.[col] !== false ? CL.gold + "18" : "transparent" }}>
        <input type="checkbox" checked={form.visibleColumns?.[col] !== false} onChange={ev => setForm(prev => ({ ...prev, visibleColumns: { ...(prev.visibleColumns || {}), [col]: ev.target.checked } }))} style={{ accentColor: CL.gold }} /> {lbl}
      </label>
    ))}
  </div>

  {/* Global description bar */}
  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
    <TextInput placeholder={uiText("Global description (optional)")} value={globalDescription} onChange={ev => setGlobalDescription(ev.target.value)} style={{ flex: 1 }} />
    <button style={{ ...btnSec, whiteSpace: "nowrap", padding: "0 16px" }} onClick={applyDescriptionToAll}>{uiText("Apply to all lines")}</button>
  </div>

  {/* Column headers */}
  <div style={{ display: "grid", gridTemplateColumns: `${form.visibleColumns?.prestationDate !== false ? "1.2fr " : ""}${form.visibleColumns?.description !== false ? "2.2fr " : ""}${form.visibleColumns?.hours !== false ? ".8fr " : ""}${form.visibleColumns?.quantity !== false ? ".8fr " : ""}${form.visibleColumns?.unitPrice !== false ? "1fr " : ""}${form.visibleColumns?.total !== false ? "1fr " : ""}28px`, gap: 8, marginBottom: 8, fontSize: 11, color: CL.dim, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
    {form.visibleColumns?.prestationDate !== false && <div>{uiText("Date")}</div>}
    {form.visibleColumns?.description !== false && <div>{uiText("Description")}</div>}
    {form.visibleColumns?.hours !== false && <div style={{ textAlign: "right" }}>{uiText("Hours")}</div>}
    {form.visibleColumns?.quantity !== false && <div style={{ textAlign: "right" }}>{uiText("Qty")}</div>}
    {form.visibleColumns?.unitPrice !== false && <div style={{ textAlign: "right" }}>{uiText("Unit price")}</div>}
    {form.visibleColumns?.total !== false && <div style={{ textAlign: "right" }}>{uiText("Total")}</div>}
    <div />
  </div>

  {/* Line items */}
  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
    {(form.items || []).map((item, idx) => (
      <div key={idx} style={{ display: "grid", gridTemplateColumns: `${form.visibleColumns?.prestationDate !== false ? "1.2fr " : ""}${form.visibleColumns?.description !== false ? "2.2fr " : ""}${form.visibleColumns?.hours !== false ? ".8fr " : ""}${form.visibleColumns?.quantity !== false ? ".8fr " : ""}${form.visibleColumns?.unitPrice !== false ? "1fr " : ""}${form.visibleColumns?.total !== false ? "1fr " : ""}28px`, gap: 8, alignItems: "center" }}>
        {form.visibleColumns?.prestationDate !== false && <DatePicker value={item.prestationDate || ""} onChange={ev => updateItem(idx, "prestationDate", ev.target.value)} />}
        {form.visibleColumns?.description !== false && <TextInput placeholder="Description" value={item.description || ""} onChange={ev => updateItem(idx, "description", ev.target.value)} />}
        {form.visibleColumns?.hours !== false && <TextInput type="number" step="0.25" placeholder="0" value={item.hours ?? ""} onChange={ev => { const h = ev.target.value; updateItem(idx, "hours", h === "" ? "" : parseFloat(h) || 0); updateItem(idx, "quantity", h === "" ? 1 : parseFloat(h) || 0); }} style={{ textAlign: "right" }} />}
        {form.visibleColumns?.quantity !== false && <TextInput type="number" step="0.25" placeholder="0" value={item.quantity ?? 0} onChange={ev => updateItem(idx, "quantity", parseFloat(ev.target.value) || 0)} style={{ textAlign: "right" }} />}
        {form.visibleColumns?.unitPrice !== false && <TextInput type="number" step="0.01" placeholder="0.00" value={item.unitPrice} onChange={ev => updateItem(idx, "unitPrice", parseFloat(ev.target.value) || 0)} style={{ textAlign: "right" }} />}
        {form.visibleColumns?.total !== false && <div style={{ textAlign: "right", fontWeight: 600, fontSize: 15, color: CL.text }}>€{Number(item.total || 0).toFixed(2)}</div>}
        <button style={{ background: "none", border: "none", color: CL.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }} onClick={() => setForm(prev => ({ ...prev, items: (prev.items || []).filter((_, j) => j !== idx) }))}>{ICN.close}</button>
      </div>
    ))}
  </div>
  <button style={{ ...btnSec, width: "100%", justifyContent: "center", marginBottom: 4 }} onClick={() => setForm(prev => ({ ...prev, items: [...(prev.items || []), { prestationDate: prev.date, description: "", hours: "", quantity: 1, unitPrice: defaultUnitPrice || 0, total: defaultUnitPrice || 0 }] }))}>+ Ajouter une ligne</button>

  {/* Totals */}
  <div style={{ background: CL.bg, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: "16px 20px", marginTop: 16, textAlign: "right" }}>
    <div style={{ fontSize: 13, color: CL.muted, marginBottom: 4 }}>Sous-total : <strong style={{ color: CL.text }}>€{subtotal.toFixed(2)}</strong></div>
    {form.visibleColumns?.tva !== false && <div style={{ fontSize: 13, color: CL.muted, marginBottom: 6 }}>TVA ({form.vatRate}%) : <strong style={{ color: CL.text }}>€{vatAmount.toFixed(2)}</strong></div>}
    <div style={{ fontSize: 22, fontWeight: 700, color: CL.gold, fontFamily: "'Cormorant Garamond', serif" }}>Total : €{(subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount)).toFixed(2)}</div>
  </div>

  {/* ── Section 4: Email & Terms ── */}
  <SectionHeader label="Email & Conditions" />
  <div className="form-grid" style={{ gap: 20 }}>
    <Field label="Email expéditeur (optionnel)"><TextInput value={form.zohoEmail || ""} onChange={ev => set("zohoEmail", ev.target.value)} placeholder="name@yourcompany.com" /></Field>
    <Field label={uiText("Email template")}><SelectInput value={form.emailTemplate || "standard"} onChange={ev => set("emailTemplate", ev.target.value)}><option value="standard">{uiText("Standard")}</option><option value="friendly">{uiText("Friendly reminder")}</option><option value="thank_you">{uiText("Thank you")}</option><option value="overdue">{uiText("Overdue notice")}</option></SelectInput></Field>
  </div>
  <Field label="Conditions de paiement"><TextInput value={form.paymentTerms || ""} onChange={ev => set("paymentTerms", ev.target.value)} /></Field>

  {/* Footer buttons */}
  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${CL.bd}` }}>
    <button style={{ ...btnSec, padding: "12px 28px", fontSize: 14 }} onClick={onCancel}>{t("cancel")}</button>
    <button style={{ ...btnPri, padding: "12px 32px", fontSize: 14 }} onClick={() => form.clientId && onSave({ ...form, subtotal, vatAmount: form.visibleColumns?.tva === false ? 0 : vatAmount, total: subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount) })}>{t("save")}</button>
  </div>
</div>
);
}

function InvoicePreviewContent({ invoice, data, isQuote = false }) {
const client = data.clients.find(c => c.id === invoice.clientId);
const settings = data.settings;
const cols = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true, ...(invoice.visibleColumns || {}) };
const companyDisplay = settings.companyName || "Lux Angels Cleaning";
const docLabel = isQuote ? "DEVIS" : "FACTURE";
return (
<div style={{ background: "#fff", color: "#1a1a1a", padding: 36, borderRadius: 8, fontFamily: "'Outfit', sans-serif" }}>
{/* Header */}
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    {settings.companyLogo && <img src={settings.companyLogo} alt="logo" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />}
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", margin: 0, letterSpacing: "0.01em" }}>{companyDisplay}</h1>
      <div style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.7 }}>
        {settings.companyAddress}<br />
        {settings.companyEmail}<br />
        {settings.companyPhone}<br />
        TVA: {settings.vatNumber}
      </div>
    </div>
  </div>
  <div style={{ textAlign: "right" }}>
    <h2 style={{ fontSize: 22, color: "#333", margin: 0, fontWeight: 700, letterSpacing: "0.05em" }}>{docLabel}</h2>
    <div style={{ fontSize: 12, color: "#666", marginTop: 6, lineHeight: 1.7 }}>
      <strong>{invoice.invoiceNumber}</strong><br />
      Date: {fmtDate(invoice.date)}
      {invoice.dueDate && <><br />Échéance: {fmtDate(invoice.dueDate)}</>}
    </div>
  </div>
</div>

{/* Client block */}
<div style={{ marginBottom: 20, padding: 14, background: "#f8f8f8", borderRadius: 8 }}>
  <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", marginBottom: 4, fontWeight: 600, letterSpacing: "0.08em" }}>Client</div>
  <div style={{ fontWeight: 600, fontSize: 14 }}>{client?.name}</div>
  {client?.address && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{client.address}{client?.apartmentFloor ? `, ${client.apartmentFloor}` : ""}</div>}
  {(client?.postalCode || client?.city || client?.country) && <div style={{ fontSize: 12, color: "#666" }}>{client?.postalCode ? `${client.postalCode} ` : ""}{client?.city || ""}{client?.country ? `, ${client.country}` : ""}</div>}
  {client?.email && <div style={{ fontSize: 12, color: "#666" }}>{client.email}</div>}
</div>

{/* Items table */}
<div style={{ marginBottom: 8, fontWeight: 600, color: "#35526b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description des prestations</div>
<div style={{ overflowX: "auto" }}>
  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
    <thead>
      <tr style={{ borderBottom: "2px solid #C9A84C" }}>
        <th style={{ textAlign: "left", padding: "6px 4px 6px 0", fontSize: 10, color: "#999", fontWeight: 600 }}>Ref</th>
        {cols.prestationDate && <th style={{ textAlign: "left", padding: "6px 4px", fontSize: 10, color: "#999", fontWeight: 600 }}>Date</th>}
        {cols.description && <th style={{ textAlign: "left", padding: "6px 4px", fontSize: 10, color: "#999", fontWeight: 600 }}>Désignation</th>}
        {cols.quantity && <th style={{ textAlign: "right", padding: "6px 4px", fontSize: 10, color: "#999", fontWeight: 600 }}>Quantité</th>}
        {cols.hours && <th style={{ textAlign: "right", padding: "6px 4px", fontSize: 10, color: "#999", fontWeight: 600 }}>Heures</th>}
        {cols.unitPrice && <th style={{ textAlign: "right", padding: "6px 4px", fontSize: 10, color: "#999", fontWeight: 600 }}>PU</th>}
        {cols.total && <th style={{ textAlign: "right", padding: "6px 0 6px 4px", fontSize: 10, color: "#999", fontWeight: 600 }}>Montant HT</th>}
      </tr>
    </thead>
    <tbody>
      {(invoice.items || []).map((item, idx) => (
        <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
          <td style={{ padding: "8px 4px 8px 0", fontSize: 12, color: "#555" }}>{idx + 1}</td>
          {cols.prestationDate && <td style={{ padding: "8px 4px", fontSize: 12 }}>{fmtDate(item.prestationDate)}</td>}
          {cols.description && <td style={{ padding: "8px 4px", fontSize: 12 }}>{item.description}</td>}
          {cols.quantity && <td style={{ padding: "8px 4px", textAlign: "right", fontSize: 12 }}>{Number(item.quantity || 0).toFixed(2)}</td>}
          {cols.hours && <td style={{ padding: "8px 4px", textAlign: "right", fontSize: 12 }}>{item.hours === "" || item.hours == null ? "" : Number(item.hours).toFixed(2)}</td>}
          {cols.unitPrice && <td style={{ padding: "8px 4px", textAlign: "right", fontSize: 12 }}>€{Number(item.unitPrice || 0).toFixed(2)}</td>}
          {cols.total && <td style={{ padding: "8px 0 8px 4px", textAlign: "right", fontSize: 12, fontWeight: 600 }}>€{Number(item.total || 0).toFixed(2)}</td>}
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Totals */}
<div style={{ textAlign: "right", marginBottom: 20, borderTop: "1px solid #eee", paddingTop: 12 }}>
  <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>TOTAL HT: <strong>€{(invoice.subtotal || 0).toFixed(2)}</strong></div>
  {cols.tva !== false && <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>TVA ({invoice.vatRate}%): <strong>€{(invoice.vatAmount || 0).toFixed(2)}</strong></div>}
  <div style={{ fontSize: 22, fontWeight: 700, color: "#C9A84C", marginTop: 8, fontFamily: "'Cormorant Garamond', serif" }}>TOTAL TTC: €{(invoice.total || 0).toFixed(2)}</div>
</div>

{/* Payment terms + IBAN (only on invoices) */}
<div style={{ padding: 14, background: "#f8f8f8", borderRadius: 8, fontSize: 11, color: "#666", marginBottom: 28 }}>
  <div style={{ marginBottom: isQuote ? 0 : 4 }}><strong>Conditions de paiement :</strong> {invoice.paymentTerms || (isQuote ? "Devis valable 30 jours." : "Paiement comptant.")}</div>
  {!isQuote && <div><strong>IBAN:</strong> {settings.bankIban}</div>}
</div>

{/* Signatures */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16, gap: 24, flexWrap: "wrap" }}>
  {/* Client signature */}
  <div style={{ flex: 1, minWidth: 200 }}>
    <div style={{ fontSize: 11, color: "#555", marginBottom: 32 }}>Bon pour Accord — Signature client :</div>
    <div style={{ borderTop: "1px solid #aaa", paddingTop: 4, fontSize: 11, color: "#666", width: 220 }}>Nom & Signature du client</div>
  </div>
  {/* Company signature */}
  <div style={{ flex: 1, minWidth: 200, textAlign: "right" }}>
    <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Signature autorisée :</div>
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#C9A84C", fontWeight: 700, fontStyle: "italic", marginBottom: 2 }}>{companyDisplay}</div>
    <div style={{ borderTop: "1px solid #C9A84C", paddingTop: 4, fontSize: 10, color: "#999", display: "inline-block", marginTop: 4 }}>Direction — {companyDisplay} S.à r.l.</div>
  </div>
</div>

{/* Legal footer text from settings */}
{settings.invoiceFooterText && (
  <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 9, color: "#999", lineHeight: 1.6, textAlign: "center", whiteSpace: "pre-line" }}>
    {settings.invoiceFooterText}
  </div>
)}
</div>
);
}

// ==============================================
// PAYSLIPS PAGE
// ==============================================
function PayslipsPage({ data, updateData, showToast, auth }) {
const [preview, setPreview] = useState(null);
const [rangeStart, setRangeStart] = useState(`${getToday().slice(0, 7)}-01`);
const [rangeEnd, setRangeEnd] = useState(getToday());
const [selectedEmployees, setSelectedEmployees] = useState([]);

if (auth?.role !== "owner") return <div style={cardSt}>{t("Payroll access is restricted.")}</div>;

const activeEmployees = data.employees.filter(emp => emp.status === "active");
const employeeOptions = activeEmployees.map(emp => ({ value: emp.id, label: emp.name }));

const collectEntries = (employeeId, startDate, endDate) => (
  data.clockEntries
    .filter(entry => {
      if (entry.employeeId !== employeeId || !entry.clockOut) return false;
      const day = toLocalDateKey(entry.clockIn);
      return day && day >= startDate && day <= endDate;
    })
    .sort((a, b) => new Date(a.clockIn) - new Date(b.clockIn))
);

const buildBreakdown = (entries) => entries.map(entry => {
  const client = data.clients.find(c => c.id === entry.clientId);
  const hours = calcPayableClockHours(entry, data.schedules, entries);
  return {
    date: toLocalDateKey(entry.clockIn) || "",
    from: fmtTime(entry.clockIn),
    to: fmtTime(entry.clockOut),
    clockIn: entry.clockIn,
    clockOut: entry.clockOut,
    clientId: entry.clientId || "",
    clientName: client?.name || "—",
    hours: Math.round(hours * 100) / 100,
  };
});

const getAuditLines = (ps) => {
  if (Array.isArray(ps.hourBreakdown) && ps.hourBreakdown.length) return ps.hourBreakdown;
  const start = ps.periodStart || `${ps.month}-01`;
  const end = ps.periodEnd || `${ps.month}-31`;
  return buildBreakdown(collectEntries(ps.employeeId, start, end));
};

const downloadPayslipFile = (ps) => {
  const employee = data.employees.find(e => e.id === ps.employeeId);
  const auditLines = getAuditLines(ps);
  const periodLabel = `${ps.periodStart || `${ps.month}-01`} to ${ps.periodEnd || `${ps.month}-31`}`;
  const lines = [
    "LUX ANGELS CLEANING - PAYSLIP",
    `Payslip: ${ps.payslipNumber}`,
    `Employee: ${employee?.name || "Unknown"}`,
    `Period: ${periodLabel}`,
    "",
    `Total Hours: ${ps.totalHours}h`,
    `Hourly Rate: €${(ps.hourlyRate || 0).toFixed(2)}`,
    `Gross Pay: €${(ps.grossPay || 0).toFixed(2)}`,
    "",
    "Detailed Hours Audit",
    "Date | From | To | Client | Hours",
    ...auditLines.map(item => `${item.date} | ${item.from} | ${item.to} | ${item.clientName} | ${item.hours}h`)
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${ps.payslipNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

const generatePayslips = async (downloadAfter = false) => {
  if (!rangeStart || !rangeEnd) { showToast("Select a time range", "error"); return; }
  if (rangeEnd < rangeStart) { showToast("End date must be after start date", "error"); return; }
  const employeesToGenerate = selectedEmployees.length
    ? activeEmployees.filter(emp => selectedEmployees.includes(emp.id))
    : activeEmployees;
  if (employeesToGenerate.length === 0) { showToast("Select at least one employee", "error"); return; }

  const existingPayslipByEmployeeAndPeriod = new Map(
    data.payslips
      .filter(ps => (ps.periodStart || "") === rangeStart && (ps.periodEnd || "") === rangeEnd)
      .map(ps => [`${ps.employeeId}-${rangeStart}-${rangeEnd}`, ps])
  );
  const usedNumbers = new Set(data.payslips.map(ps => ps.payslipNumber));
  const nextPayslipNumber = (emp) => {
    const base = `PS-${rangeStart.replaceAll("-", "")}-${rangeEnd.replaceAll("-", "")}-${emp.name.slice(0, 3).toUpperCase()}`;
    if (!usedNumbers.has(base)) {
      usedNumbers.add(base);
      return base;
    }
    let suffix = 2;
    let candidate = `${base}-${suffix}`;
    while (usedNumbers.has(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    usedNumbers.add(candidate);
    return candidate;
  };

  const payslips = employeesToGenerate.map(emp => {
    const entries = collectEntries(emp.id, rangeStart, rangeEnd);
    const totalH = entries.reduce((sum, ce) => sum + calcPayableClockHours(ce, data.schedules, entries), 0);
    const gross = Math.round(totalH * (emp.hourlyRate || 0) * 100) / 100;
    const existing = existingPayslipByEmployeeAndPeriod.get(`${emp.id}-${rangeStart}-${rangeEnd}`);
    return {
      id: existing?.id || makeId(),
      employeeId: emp.id,
      month: rangeStart.slice(0, 7),
      periodStart: rangeStart,
      periodEnd: rangeEnd,
      totalHours: Math.round(totalH * 100) / 100,
      hourlyRate: emp.hourlyRate || 0,
      grossPay: gross,
      status: existing?.status || "draft",
      createdAt: existing?.createdAt || new Date().toISOString(),
      hourBreakdown: buildBreakdown(entries),
      payslipNumber: existing?.payslipNumber || nextPayslipNumber(emp),
    };
  });
  try {
    await Promise.all(payslips.map(ps => syncPayslipToApi(ps)));
    updateData("payslips", prev => {
      const indexById = new Map(prev.map((p, index) => [p.id, index]));
      const merged = [...prev];
      payslips.forEach(ps => {
        const existingIndex = indexById.get(ps.id);
        if (typeof existingIndex === "number") merged[existingIndex] = ps;
        else merged.push(ps);
      });
      return merged;
    });
    if (downloadAfter) payslips.forEach(downloadPayslipFile);
    showToast(`${payslips.length} generated`);
  } catch (err) {
    console.error(err);
    showToast(err?.message || "Unable to generate payslips", "error");
  }
};

const deleteSinglePayslip = async (id) => {
const ps = data.payslips.find(p => p.id === id);
if (!ps) return;
const ok = window.confirm(`Delete payslip ${ps.payslipNumber}?`);
if (!ok) return;
try {
await deletePayslipFromApi(id);
updateData("payslips", prev => prev.filter(p => p.id !== id));
showToast("Payslip deleted");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to delete payslip", "error");
}
};

const markPaid = async (id) => {
const ps = data.payslips.find(p => p.id === id);
if (!ps) return;
try {
await syncPayslipToApi({ ...ps, status: "paid" });
updateData("payslips", prev => prev.map(p => p.id === id ? { ...p, status: "paid" } : p));
showToast("Marked paid");
} catch (err) {
console.error(err);
showToast(err?.message || "Unable to update payslip", "error");
}
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>Payslips</h1>
<div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: 10, borderRadius: 12, border: `1px solid ${CL.bd}`, background: CL.sf }}>
  <div>
    <label style={{ display: "block", fontSize: 11, color: CL.muted, marginBottom: 4 }}>From</label>
    <TextInput type="date" value={rangeStart} onChange={ev => setRangeStart(ev.target.value)} style={{ width: 165 }} />
  </div>
  <div>
    <label style={{ display: "block", fontSize: 11, color: CL.muted, marginBottom: 4 }}>To</label>
    <TextInput type="date" value={rangeEnd} onChange={ev => setRangeEnd(ev.target.value)} style={{ width: 165 }} />
  </div>
  <div>
    <label style={{ display: "block", fontSize: 11, color: CL.muted, marginBottom: 4 }}>Employees</label>
    <MultiSelectInput
      options={employeeOptions}
      value={selectedEmployees}
      onChange={setSelectedEmployees}
      placeholder="All active employees"
      style={{ width: 260 }}
    />
  </div>
  <button style={btnPri} onClick={() => generatePayslips(false)}>{ICN.plus} Generate</button>
  <button style={btnSec} onClick={() => generatePayslips(true)}>{ICN.download} Generate + Download</button>
</div>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>#</th><th style={thSt}>Employee</th><th style={thSt}>Period</th><th style={thSt}>Hours</th><th style={thSt}>Gross</th><th style={thSt}>Status</th><th style={thSt}>Actions</th></tr></thead>
<tbody>
{data.payslips.sort((a, b) => b.month.localeCompare(a.month)).map(ps => {
const employee = data.employees.find(e => e.id === ps.employeeId);
return (
<tr key={ps.id}>
<td style={tdSt}><strong>{ps.payslipNumber}</strong></td>
<td style={tdSt}>{employee?.name || "-"}</td>
<td style={tdSt}>{ps.periodStart && ps.periodEnd ? `${ps.periodStart} → ${ps.periodEnd}` : ps.month}</td>
<td style={tdSt}>{ps.totalHours}h</td>
<td style={{ ...tdSt, fontWeight: 600 }}>€{ps.grossPay?.toFixed(2)}</td>
<td style={tdSt}><Badge color={ps.status === "paid" ? CL.green : CL.muted}>{ps.status}</Badge></td>
<td style={tdSt}>
<div style={{ display: "flex", gap: 4 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setPreview(ps)}>View</button>
<button style={{ ...btnSec, ...btnSm }} onClick={() => downloadPayslipFile(ps)}>{ICN.download}</button>
<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => deleteSinglePayslip(ps.id)}>{ICN.trash}</button>
{ps.status !== "paid" && <button style={{ ...btnSec, ...btnSm, color: CL.green }} onClick={() => markPaid(ps.id)}>{ICN.check}</button>}
</div>
</td>
</tr>
);
})}
{data.payslips.length === 0 && <tr><td colSpan={7} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No payslips")}</td></tr>}
</tbody>
</table>
</div>

  {preview && (
    <ModalBox title="" onClose={() => setPreview(null)}>
      {(() => {
        const employee = data.employees.find(e => e.id === preview.employeeId);
        const settings = data.settings;
        const auditLines = getAuditLines(preview);
        return (
          <div style={{ background: "#fff", color: "#1a1a1a", padding: 28, borderRadius: 8, fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>{settings.companyName || "Lux Angels Cleaning"}</h1>
                <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{settings.companyAddress}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ fontSize: 18, color: "#333", margin: 0, fontWeight: 700, letterSpacing: "0.05em" }}>FICHE DE PAIE</h2>
                <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
                  {preview.payslipNumber}<br />
                  {(preview.periodStart && preview.periodEnd) ? `${preview.periodStart} → ${preview.periodEnd}` : preview.month}
                </div>
              </div>
            </div>
            <div style={{ padding: 12, background: "#f8f8f8", borderRadius: 8, marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Employé</div>
              <div style={{ fontWeight: 600 }}>{employee?.name}</div>
              <div style={{ fontSize: 11, color: "#666" }}>{employee?.role} · N° SS: {employee?.socialSecNumber || "N/A"}</div>
              {employee?.bankIban && <div style={{ fontSize: 11, color: "#666" }}>IBAN: {employee.bankIban}</div>}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "7px 0", color: "#666", fontSize: 13 }}>Heures travaillées</td><td style={{ padding: "7px 0", textAlign: "right", fontWeight: 600 }}>{preview.totalHours}h</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "7px 0", color: "#666", fontSize: 13 }}>Taux horaire</td><td style={{ padding: "7px 0", textAlign: "right" }}>€{preview.hourlyRate?.toFixed(2)}/h</td></tr>
                <tr style={{ borderBottom: "2px solid #C9A84C" }}><td style={{ padding: "7px 0", fontWeight: 600, fontSize: 13 }}>Salaire brut</td><td style={{ padding: "7px 0", textAlign: "right", fontWeight: 600 }}>€{preview.grossPay?.toFixed(2)}</td></tr>
                <tr><td style={{ padding: "10px 0", fontSize: 18, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>TOTAL BRUT</td><td style={{ padding: "10px 0", textAlign: "right", fontSize: 18, fontWeight: 700, color: "#C9A84C" }}>€{preview.grossPay?.toFixed(2)}</td></tr>
              </tbody>
            </table>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ margin: "0 0 8px", color: "#444", fontSize: 13, textTransform: "uppercase", letterSpacing: ".05em" }}>Detailed hours audit</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #e6e6e6", padding: "6px 0", color: "#777" }}>Date</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #e6e6e6", padding: "6px 0", color: "#777" }}>From</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #e6e6e6", padding: "6px 0", color: "#777" }}>To</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #e6e6e6", padding: "6px 0", color: "#777" }}>Client</th>
                    <th style={{ textAlign: "right", borderBottom: "1px solid #e6e6e6", padding: "6px 0", color: "#777" }}>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLines.map((line, idx) => (
                    <tr key={`${line.clockIn || line.date}-${idx}`}>
                      <td style={{ padding: "6px 0" }}>{line.date ? fmtDate(line.date) : "—"}</td>
                      <td style={{ padding: "6px 0" }}>{line.from || "—"}</td>
                      <td style={{ padding: "6px 0" }}>{line.to || "—"}</td>
                      <td style={{ padding: "6px 0" }}>{line.clientName || "—"}</td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>{line.hours ? `${line.hours}h` : "—"}</td>
                    </tr>
                  ))}
                  {auditLines.length === 0 && (
                    <tr><td colSpan={5} style={{ color: "#777", padding: "8px 0" }}>No detailed hour lines available for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 9, color: "#999", textAlign: "center", marginBottom: 24 }}>Document à titre indicatif — brut uniquement.</div>
            {/* Signature */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Signature de l'employeur :</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#C9A84C", fontWeight: 700, fontStyle: "italic", marginBottom: 2 }}>{settings.companyName || "Lux Angels Cleaning"}</div>
                <div style={{ borderTop: "1px solid #C9A84C", paddingTop: 4, fontSize: 10, color: "#999", display: "inline-block" }}>Direction — {settings.companyName || "Lux Angels Cleaning"} S.à r.l.</div>
              </div>
            </div>
          </div>
        );
      })()}
      <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
        <button style={btnSec} onClick={() => setPreview(null)}>{uiText("Close")}</button>
        <button style={btnPri} onClick={() => downloadPayslipFile(preview)}>{ICN.download} Download</button>
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
const [form, setForm] = useState({ clientId: "", visitDate: getToday(), visitTime: "10:00", address: "", notes: "", status: "planned", photos: [] });
const [filterClient, setFilterClient] = useState("");
const [viewVisit, setViewVisit] = useState(null);
const [uploadingPhoto, setUploadingPhoto] = useState(false);
const allVisits = (data.prospectVisits || []).slice().sort((a, b) => `${b.visitDate} ${b.visitTime}`.localeCompare(`${a.visitDate} ${a.visitTime}`));
const visits = filterClient ? allVisits.filter(v => v.clientId === filterClient || (v.clientName && data.clients.find(c => c.id === filterClient)?.name?.toLowerCase() === v.clientName?.toLowerCase())) : allVisits;
const prospects = data.clients.filter(c => c.status === "prospect" || c.status === "active");
const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

const handlePhotoUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast(uiText("File too large (max 5MB)"), "error"); return; }
  setUploadingPhoto(true);
  const reader = new FileReader();
  reader.onload = (ev) => {
    setForm(prev => ({ ...prev, photos: [...(prev.photos || []), { name: file.name, data: ev.target.result, type: file.type }] }));
    setUploadingPhoto(false);
  };
  reader.onerror = () => { setUploadingPhoto(false); };
  reader.readAsDataURL(file);
};

const saveVisit = async () => {
if (!form.clientId || !form.visitDate) { showToast(uiText("Select client and date"), "error"); return; }
const client = data.clients.find(c => c.id === form.clientId);
if (!client) { showToast(uiText("Select client and date"), "error"); return; }
const payload = { ...form, id: makeId(), createdAt: new Date().toISOString(), address: (form.address || client.address || "").trim(), clientName: client.name || "" };
try {
  const response = await fetch(apiUrl("/api/prospect-visits"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, visitDate: payload.visitDate }) });
  await ensureApiOk(response, "Failed to save visit");
} catch (err) { showToast("Failed to save visit to database", "error"); return; }
updateData("prospectVisits", prev => [payload, ...(prev || [])]);
setForm({ clientId: "", visitDate: getToday(), visitTime: "10:00", address: "", notes: "", status: "planned", photos: [] });
showToast(uiText("Visit added"));
};

const markStatus = async (id, status) => {
  try {
    const response = await fetch(apiUrl(`/api/prospect-visits/${id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await ensureApiOk(response, "Failed to update visit");
  } catch (err) { showToast("Failed to update visit in database", "error"); return; }
  updateData("prospectVisits", prev => (prev || []).map(v => v.id === id ? { ...v, status, updatedAt: new Date().toISOString() } : v));
};
const removeVisit = async (id) => {
  try {
    const response = await fetch(apiUrl(`/api/prospect-visits/${id}`), { method: "DELETE" });
    await ensureApiOk(response, "Failed to delete visit");
  } catch (err) { showToast("Failed to delete visit from database", "error"); return; }
  updateData("prospectVisits", prev => (prev || []).filter(v => v.id !== id));
};

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 16 }}>{t("visitationSchedule")}</h1>
<div style={{ ...cardSt, marginBottom: 14 }}>
  <div className="form-grid">
    <Field label={uiText("Client")}>
      <SelectInput value={form.clientId} onChange={ev => setForm(v => ({ ...v, clientId: ev.target.value, address: data.clients.find(c => c.id === ev.target.value)?.address || "" }))}>
        <option value="">{uiText("Select...")}</option>
        {prospects.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </SelectInput>
    </Field>
    <Field label="Address"><TextInput value={form.address || ""} onChange={ev => set("address", ev.target.value)} placeholder={uiText("Visit address")} /></Field>
    <Field label="Visit date"><DatePicker value={form.visitDate} onChange={ev => set("visitDate", ev.target.value)} /></Field>
    <Field label="Visit time"><TimePicker value={form.visitTime} onChange={ev => set("visitTime", ev.target.value)} /></Field>
  </div>
  <Field label="Notes"><TextArea value={form.notes} onChange={ev => set("notes", ev.target.value)} placeholder={uiText("Scope, apartment access, expectations...")} /></Field>
  <Field label={uiText("Site Photos (optional)")}>
    <div style={{ border: `2px dashed ${CL.bd}`, borderRadius: 10, padding: 16, background: CL.s2 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: (form.photos || []).length > 0 ? 10 : 0 }}>
        {(form.photos || []).map((ph, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img src={ph.data} alt={ph.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, border: `1px solid ${CL.bd}` }} />
            <button onClick={() => set("photos", (form.photos || []).filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, background: CL.red, color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        ))}
      </div>
      <label style={{ ...btnSec, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
        {uploadingPhoto ? <span>⏳ {uiText("Loading...")}</span> : <><span>📷</span> {uiText("Add Photo")}</>}
        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} disabled={uploadingPhoto} />
      </label>
    </div>
  </Field>
  <button style={btnPri} onClick={saveVisit}>{ICN.plus} {uiText("Add Visit")}</button>
</div>

<div style={{ ...cardSt, marginBottom: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
  <div style={{ fontSize: 13, color: CL.muted, fontWeight: 600 }}>{uiText("Filter by client")} :</div>
  <SelectInput value={filterClient} onChange={ev => setFilterClient(ev.target.value)} style={{ width: 220 }}>
    <option value="">{uiText("All clients")}</option>
    {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
  </SelectInput>
  {filterClient && <button style={{ ...btnSec, ...btnSm }} onClick={() => setFilterClient("")}>{uiText("Reset")}</button>}
</div>

<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{uiText("Date")}</th><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("Address")}</th><th style={thSt}>{uiText("Notes")}</th><th style={thSt}>{uiText("Status")}</th><th style={thSt}>{uiText("Actions")}</th></tr></thead>
<tbody>
{visits.map(v => { const client = data.clients.find(c => c.id === v.clientId); const displayName = v.clientName || client?.name || "-"; const photoCount = (v.photos || []).length; return <tr key={v.id}><td style={tdSt}>{fmtDate(v.visitDate)} {v.visitTime || ""}</td><td style={tdSt}>{displayName}</td><td style={tdSt}><a href={mapsUrl(v.address || client?.address || "")} target="_blank" rel="noreferrer" style={{ color: CL.blue, textDecoration: "underline" }}>{v.address || client?.address || "-"}</a></td><td style={tdSt}><span style={{ maxWidth: 180, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.notes || "-"}</span>{photoCount > 0 && <span style={{ fontSize: 11, color: CL.gold }}>📷 {photoCount}</span>}</td><td style={tdSt}><Badge color={v.status === "done" ? CL.green : v.status === "cancelled" ? CL.red : CL.orange}>{uiText(v.status)}</Badge></td><td style={tdSt}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button style={{ ...btnSec, ...btnSm, color: CL.blue }} onClick={() => setViewVisit(v)} title={uiText("View details")}>{uiText("View")}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => markStatus(v.id, "done")}>{uiText("Done")}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => { setDevisSeed?.({ clientId: v.clientId, description: `Quote after visit on ${v.visitDate}` }); setSection?.("devis"); }}>{uiText("Create Devis")}</button><button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => removeVisit(v.id)}>{uiText("Delete")}</button></div></td></tr>; })}
{visits.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No visits scheduled yet")}</td></tr>}
</tbody>
</table>
</div>

{viewVisit && (() => {
  const client = data.clients.find(c => c.id === viewVisit.clientId);
  const visitClientName = viewVisit.clientName || client?.name || "-";
  return (
    <ModalBox title={`${uiText("Visit")} — ${visitClientName} · ${fmtDate(viewVisit.visitDate)}`} onClose={() => setViewVisit(null)}>
      <div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: CL.muted, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>{uiText("Address")}</div>
          <div style={{ fontSize: 14, color: CL.text }}>{viewVisit.address || client?.address || "-"}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: CL.muted, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>{uiText("Status")}</div>
          <Badge color={viewVisit.status === "done" ? CL.green : viewVisit.status === "cancelled" ? CL.red : CL.orange}>{uiText(viewVisit.status)}</Badge>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: CL.muted, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>{uiText("Notes")}</div>
          <div style={{ fontSize: 14, color: CL.text, whiteSpace: "pre-wrap", background: CL.s2, borderRadius: 8, padding: 10 }}>{viewVisit.notes || <span style={{ color: CL.muted }}>—</span>}</div>
        </div>
        {(viewVisit.photos || []).length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: CL.muted, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>{uiText("Photos")} ({viewVisit.photos.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {viewVisit.photos.map((ph, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={ph.data} alt={ph.name} style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 10, border: `2px solid ${CL.bd}`, cursor: "pointer" }} onClick={() => window.open(ph.data, "_blank")} />
                  <div style={{ fontSize: 10, color: CL.muted, marginTop: 3, textAlign: "center", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ph.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {(viewVisit.photos || []).length === 0 && (
          <div style={{ color: CL.muted, fontSize: 13 }}>📷 {uiText("No photos for this visit")}</div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button style={btnSec} onClick={() => setViewVisit(null)}>{uiText("Close")}</button>
        </div>
      </div>
    </ModalBox>
  );
})()}
</div>
);
}

function HistoryPage({ data, updateData }) {
const { t } = useI18n();
const [clientFilter, setClientFilter] = useState("");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const [prestationFilter, setPrestationFilter] = useState("");
const [searched, setSearched] = useState(false);

const allStatuses = [...new Set((data.schedules || []).map(j => j.status).filter(Boolean))];

const applyFilters = () => setSearched(true);
const resetFilters = () => { setClientFilter(""); setDateFrom(""); setDateTo(""); setPrestationFilter(""); setSearched(false); };

const uploads = (data.photoUploads || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const jobs = (data.schedules || []).slice().sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));

const filteredJobs = !searched ? [] : jobs.filter(j => {
  if (clientFilter && j.clientId !== clientFilter) return false;
  if (dateFrom && j.date < dateFrom) return false;
  if (dateTo && j.date > dateTo) return false;
  if (prestationFilter && j.status !== prestationFilter) return false;
  return true;
});

const filteredUploads = !searched ? [] : uploads.filter(u => {
  const uploadDate = (u.createdAt || "").slice(0, 10);
  if (clientFilter && u.clientId !== clientFilter) return false;
  if (dateFrom && uploadDate < dateFrom) return false;
  if (dateTo && uploadDate > dateTo) return false;
  return true;
});

const markAllSeen = async () => {
  try {
    const response = await fetch(apiUrl("/api/photo-uploads/seen"), { method: "PATCH" });
    await ensureApiOk(response, "Failed to update photo state");
  } catch (err) { showToast("Failed to update photo state in database", "error"); return; }
  updateData("photoUploads", prev => (prev || []).map(u => ({ ...u, seenByOwner: true })));
};

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
  <h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{t("historyImages")}</h1>
  <button style={btnSec} onClick={markAllSeen}>{uiText("Mark images seen")}</button>
</div>

<div style={{ ...cardSt, marginBottom: 16, padding: 16 }}>
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
    <div>
      <div style={{ fontSize: 11, color: CL.muted, marginBottom: 4 }}>{uiText("Client")}</div>
      <SelectInput value={clientFilter} onChange={ev => setClientFilter(ev.target.value)} style={{ width: 200 }}>
        <option value="">{uiText("All clients")}</option>
        {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </SelectInput>
    </div>
    <div>
      <div style={{ fontSize: 11, color: CL.muted, marginBottom: 4 }}>{uiText("From")}</div>
      <DatePicker value={dateFrom} onChange={ev => setDateFrom(ev.target.value)} style={{ width: 180 }} />
    </div>
    <div>
      <div style={{ fontSize: 11, color: CL.muted, marginBottom: 4 }}>{uiText("To")}</div>
      <DatePicker value={dateTo} onChange={ev => setDateTo(ev.target.value)} style={{ width: 180 }} />
    </div>
    <div>
      <div style={{ fontSize: 11, color: CL.muted, marginBottom: 4 }}>{uiText("Prestation")}</div>
      <SelectInput value={prestationFilter} onChange={ev => setPrestationFilter(ev.target.value)} style={{ width: 160 }}>
        <option value="">{uiText("All")}</option>
        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
      </SelectInput>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      <button style={{ ...btnPri, background: CL.gold }} onClick={applyFilters}>{uiText("Search")}</button>
      {searched && <button style={btnSec} onClick={resetFilters}>{uiText("Reset")}</button>}
    </div>
  </div>
</div>

{!searched && (
  <div style={{ ...cardSt, textAlign: "center", padding: 40, color: CL.muted }}>
    {uiText("Use the filters above and click Search to load history.")}
  </div>
)}

{searched && (
<div className="grid-2">
  <div style={cardSt}>
    <h3 style={{ marginBottom: 10, color: CL.gold }}>{uiText("Job history")} {filteredJobs.length > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: CL.muted }}>({filteredJobs.length})</span>}</h3>
    {filteredJobs.slice(0, 200).map(j => { const c = data.clients.find(x => x.id === j.clientId); const e = data.employees.find(x => x.id === j.employeeId); return <div key={j.id} style={{ borderBottom: `1px solid ${CL.bd}`, padding: "8px 0" }}><div style={{ fontWeight: 600 }}>{fmtDate(j.date)} · {j.startTime}-{j.endTime}</div><div style={{ fontSize: 12, color: CL.muted }}>{c?.name || "-"} · {e?.name || "-"}</div><Badge color={scheduleStatusColor(j.status)}>{j.status}</Badge></div>; })}
    {filteredJobs.length === 0 && <div style={{ color: CL.muted }}>{uiText("No jobs")}</div>}
    {filteredJobs.length > 200 && <div style={{ fontSize: 12, color: CL.muted, marginTop: 8 }}>{uiText("Showing first 200 results. Refine your filters to narrow down.")}</div>}
  </div>
  <div style={cardSt}>
    <h3 style={{ marginBottom: 10, color: CL.gold }}>{uiText("Image history")} {filteredUploads.length > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: CL.muted }}>({filteredUploads.length})</span>}</h3>
    {filteredUploads.slice(0, 200).map(u => { const c = data.clients.find(x => x.id === u.clientId); const e = data.employees.find(x => x.id === u.employeeId); return <div key={u.id} style={{ borderBottom: `1px solid ${CL.bd}`, padding: "8px 0" }}><div style={{ fontWeight: 600 }}>{c?.name || uiText("Unknown client")} · {uiText(u.type || "issue")}</div><div style={{ fontSize: 12, color: CL.muted }}>{fmtBoth(u.createdAt)} · {e?.name || "-"}</div>{u.imageData && <img src={u.imageData} alt={u.fileName} style={{ width: "100%", maxWidth: 260, marginTop: 6, borderRadius: 8, border: `1px solid ${CL.bd}` }} />}</div>; })}
    {filteredUploads.length === 0 && <div style={{ color: CL.muted }}>{uiText("No images")}</div>}
    {filteredUploads.length > 200 && <div style={{ fontSize: 12, color: CL.muted, marginTop: 8 }}>{uiText("Showing first 200 results. Refine your filters to narrow down.")}</div>}
  </div>
</div>
)}
</div>
);
}

function LeaveManagementPage({ data, updateData, showToast }) {
const [employeeFilter, setEmployeeFilter] = useState("");
const [yearFilter, setYearFilter] = useState(getToday().slice(0, 4));
const [reviewNote, setReviewNote] = useState({});
const [counterQuery, setCounterQuery] = useState("");
const [counterPage, setCounterPage] = useState(1);
const [counterPageSize, setCounterPageSize] = useState(25);

const requests = (data.timeOffRequests || [])
.filter(r => (!employeeFilter || r.employeeId === employeeFilter) && (!yearFilter || (r.startDate || "").startsWith(yearFilter)))
.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const pendingCount = requests.filter(r => r.status === "pending").length;
const approvedCount = requests.filter(r => r.status === "approved").length;
const rejectedCount = requests.filter(r => r.status === "rejected").length;

const reviewRequest = async (id, status) => {
const note = (reviewNote[id] || "").trim();
try {
  const response = await fetch(apiUrl(`/api/time-off-requests/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reviewedBy: "owner", reviewNote: note }),
  });
  await ensureApiOk(response, "Failed to review leave request");
} catch (err) { showToast("Failed to review leave request in database", "error"); return; }
updateData("timeOffRequests", prev => prev.map(r => r.id === id ? {
  ...r, status, reviewedAt: new Date().toISOString(), reviewedBy: "owner", reviewNote: note,
} : r));
setReviewNote(prev => ({ ...prev, [id]: "" }));
showToast(status === "approved" ? "Leave approved" : "Leave rejected", status === "approved" ? "success" : "error");
};

const summaryRows = data.employees
  .filter(emp => emp.status === "active")
  .map(emp => ({ emp, ...getLeaveSummary(data, emp.id, yearFilter) }))
  .filter(row => !employeeFilter || row.emp.id === employeeFilter)
  .filter(row => !counterQuery.trim() || row.emp.name.toLowerCase().includes(counterQuery.trim().toLowerCase()))
  .sort((a, b) => (a.emp.name || "").localeCompare(b.emp.name || "", "fr", { sensitivity: "base" }));

const totalSummaryRows = summaryRows.length;
const totalCounterPages = Math.max(1, Math.ceil(totalSummaryRows / counterPageSize));
const safeCounterPage = Math.min(counterPage, totalCounterPages);
const pagedSummaryRows = summaryRows.slice((safeCounterPage - 1) * counterPageSize, safeCounterPage * counterPageSize);
const rangeStart = totalSummaryRows === 0 ? 0 : (safeCounterPage - 1) * counterPageSize + 1;
const rangeEnd = Math.min(totalSummaryRows, safeCounterPage * counterPageSize);

useEffect(() => {
  setCounterPage(1);
}, [employeeFilter, yearFilter, counterQuery, counterPageSize]);

useEffect(() => {
  if (counterPage > totalCounterPages) setCounterPage(totalCounterPages);
}, [counterPage, totalCounterPages]);

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{uiText("Congés")}</h1>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<SelectInput value={employeeFilter} onChange={ev => setEmployeeFilter(ev.target.value)} style={{ width: 180 }}>
<option value="">{uiText("All Cleaners")}</option>
{data.employees.filter(e => e.status === "active").map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
</SelectInput>
<TextInput type="number" value={yearFilter} onChange={ev => setYearFilter(ev.target.value)} style={{ width: 110 }} />
</div>
</div>

<div className="stat-row" style={{ marginBottom: 16 }}>
<StatCard label={uiText("Pending")} value={pendingCount} icon={ICN.clock} color={CL.orange} />
<StatCard label={uiText("Approved")} value={approvedCount} icon={ICN.check} color={CL.green} />
<StatCard label={uiText("Rejected")} value={rejectedCount} icon={ICN.close} color={CL.red} />
</div>

<div style={{ ...cardSt, marginBottom: 16 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Holiday Counter")}</h3>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
  <TextInput
    value={counterQuery}
    onChange={ev => setCounterQuery(ev.target.value)}
    placeholder={uiText("Search cleaner by name")}
    style={{ minWidth: 220, flex: "1 1 220px" }}
  />
  <SelectInput value={String(counterPageSize)} onChange={ev => setCounterPageSize(Number(ev.target.value) || 25)} style={{ width: 120 }}>
    <option value="10">10 / page</option>
    <option value="25">25 / page</option>
    <option value="50">50 / page</option>
    <option value="100">100 / page</option>
  </SelectInput>
</div>
<div style={{ fontSize: 12, color: CL.muted, marginBottom: 10 }}>
  {rangeStart}-{rangeEnd} / {totalSummaryRows}
</div>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{uiText("Cleaner")}</th><th style={thSt}>{uiText("Allowance")}</th><th style={thSt}>{uiText("Approved")}</th><th style={thSt}>{uiText("Pending")}</th><th style={thSt}>{uiText("Remaining")}</th></tr></thead>
<tbody>
{pagedSummaryRows.map(row => <tr key={row.emp.id}><td style={{ ...tdSt, paddingTop: 8, paddingBottom: 8 }}>{row.emp.name}</td><td style={{ ...tdSt, paddingTop: 8, paddingBottom: 8 }}><TextInput type="number" min={0} value={row.emp.leaveAllowance ?? 26} onChange={ev => updateData("employees", prev => prev.map(e => e.id === row.emp.id ? { ...e, leaveAllowance: Math.max(0, parseInt(ev.target.value || "0", 10) || 0) } : e))} style={{ width: 84, padding: "6px 8px" }} /></td><td style={{ ...tdSt, paddingTop: 8, paddingBottom: 8 }}>{row.approvedDays}d</td><td style={{ ...tdSt, paddingTop: 8, paddingBottom: 8 }}>{row.pendingDays}d</td><td style={{ ...tdSt, paddingTop: 8, paddingBottom: 8, fontWeight: 700, color: row.remaining > 5 ? CL.green : CL.orange }}>{row.remaining}d</td></tr>)}
{pagedSummaryRows.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No active cleaners")}</td></tr>}
</tbody>
</table>
</div>
{totalCounterPages > 1 && (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
    <button style={{ ...btnSec, ...btnSm }} onClick={() => setCounterPage(p => Math.max(1, p - 1))} disabled={safeCounterPage <= 1}>
      {uiText("Back")}
    </button>
    <div style={{ alignSelf: "center", color: CL.muted, fontSize: 12 }}>
      {safeCounterPage} / {totalCounterPages}
    </div>
    <button style={{ ...btnSec, ...btnSm }} onClick={() => setCounterPage(p => Math.min(totalCounterPages, p + 1))} disabled={safeCounterPage >= totalCounterPages}>
      {uiText("Next")}
    </button>
  </div>
)}
</div>

<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.gold }}>{uiText("Time-off Requests")}</h3>
{requests.map(req => {
const employee = data.employees.find(e => e.id === req.employeeId);
const days = req.requestedDays || leaveDaysInclusive(req.startDate, req.endDate);
return (
<div key={req.id} style={{ padding: "12px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
<div>
<div style={{ fontWeight: 600 }}>{employee?.name || uiText("Unknown")} · {fmtDate(req.startDate)} - {fmtDate(req.endDate)} ({days}d)</div>
<div style={{ fontSize: 12, color: CL.muted }}>{req.leaveType === "maladie" ? uiText("Sick Leave") : uiText("Leave")}{req.reason ? ` · ${req.reason}` : ""}</div>
<div style={{ fontSize: 11, color: CL.dim }}>{uiText("Requested")} {fmtBoth(req.createdAt)}</div>
{req.reviewedAt && <div style={{ fontSize: 11, color: CL.dim }}>{uiText("Reviewed")} {fmtBoth(req.reviewedAt)} {req.reviewNote ? `· ${req.reviewNote}` : ""}</div>}
</div>
<Badge color={req.status === "approved" ? CL.green : req.status === "rejected" ? CL.red : CL.orange}>{req.status}</Badge>
</div>
{req.status === "pending" && (
<div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
<TextInput value={reviewNote[req.id] || ""} onChange={ev => setReviewNote(v => ({ ...v, [req.id]: ev.target.value }))} placeholder="Optional comment" style={{ minWidth: 220, flex: 1 }} />
<button style={{ ...btnPri, ...btnSm, background: CL.green }} onClick={() => reviewRequest(req.id, "approved")}>{ICN.check} {uiText("Approve")}</button>
<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => reviewRequest(req.id, "rejected")}>{ICN.close} {uiText("Reject")}</button>
</div>
)}
</div>
);
})}
{requests.length === 0 && <p style={{ color: CL.muted, textAlign: "center" }}>{uiText("No leave requests found.")}</p>}
</div>
</div>
);
}

// ==============================================
// COMMUNICATION HUB PAGE  (Reminders + Communication Flows — unified)
// ==============================================
function CommunicationHubPage({ data, updateData, showToast }) {
const { t, lang } = useI18n();
const settings = data?.settings || DEFAULTS.settings;

// ── Main tab ──────────────────────────────────────
const [mainTab, setMainTab] = useState("reminders");

// ── Send / Reminders state ────────────────────────
const [channel, setChannel] = useState("zoho");
const [workflowType, setWorkflowType] = useState("all");
const [selectedOnly, setSelectedOnly] = useState(false);
const [selectedClientIds, setSelectedClientIds] = useState([]);
const [clientSearch, setClientSearch] = useState("");
const [showClientPicker, setShowClientPicker] = useState(false);

// ── Campaign state ────────────────────────────────
const [campaignFrequency, setCampaignFrequency] = useState("weekly");
const [campaignChannel, setCampaignChannel] = useState("zoho");
const [campaignSubject, setCampaignSubject] = useState(lang === "fr" ? "Actualités Lux Angels" : "Lux Angels update");
const [campaignBody, setCampaignBody] = useState(lang === "fr" ? "Bonjour, voici notre communication périodique de la part de Lux Angels Cleaning." : "Hello, this is your scheduled client communication from Lux Angels.");

// ── Notification rules state ──────────────────────
const [audienceTab, setAudienceTab] = useState("owner_manager");
const [ownerManagerChannels, setOwnerManagerChannels] = useState(settings.communicationOwnerManagerChannels || DEFAULTS.settings.communicationOwnerManagerChannels);
const [ownerManagerEvents, setOwnerManagerEvents] = useState(settings.communicationOwnerManagerEvents || DEFAULTS.settings.communicationOwnerManagerEvents);
const [cleanerChannels, setCleanerChannels] = useState(settings.communicationCleanerChannels || DEFAULTS.settings.communicationCleanerChannels);
const [cleanerEvents, setCleanerEvents] = useState(settings.communicationCleanerEvents || DEFAULTS.settings.communicationCleanerEvents);
const [clientChannels, setClientChannels] = useState(settings.communicationClientChannels || DEFAULTS.settings.communicationClientChannels);
const [clientEvents, setClientEvents] = useState(settings.communicationClientEvents || DEFAULTS.settings.communicationClientEvents);

// ── Data helpers ──────────────────────────────────
const schedulesList = Array.isArray(data?.schedules) ? data.schedules.filter(s => s && typeof s === "object") : [];
const timeOffRequests = Array.isArray(data?.timeOffRequests) ? data.timeOffRequests.filter(r => r && typeof r === "object") : [];

const clients = (data.clients || []).filter(c => c.status === "active");
const selectedClients = clients.filter(c => selectedClientIds.includes(c.id));
const normalizedSearch = clientSearch.trim().toLowerCase();
const visibleClients = normalizedSearch
  ? clients.filter(c => {
      const haystack = `${c.name || ""} ${c.contactPerson || ""} ${c.email || ""} ${c.phone || ""} ${c.phoneMobile || ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    })
  : clients;

const toggleClient = (id) => setSelectedClientIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

const firstEnabledChannel = useCallback((channels = {}, fallback = "zoho") => {
  const order = ["zoho", "sms", "whatsapp"];
  return order.find(mode => channels?.[mode]) || fallback;
}, []);

useEffect(() => {
  setOwnerManagerChannels(settings.communicationOwnerManagerChannels || DEFAULTS.settings.communicationOwnerManagerChannels);
  setOwnerManagerEvents(settings.communicationOwnerManagerEvents || DEFAULTS.settings.communicationOwnerManagerEvents);
  setCleanerChannels(settings.communicationCleanerChannels || DEFAULTS.settings.communicationCleanerChannels);
  setCleanerEvents(settings.communicationCleanerEvents || DEFAULTS.settings.communicationCleanerEvents);
  setClientChannels(settings.communicationClientChannels || DEFAULTS.settings.communicationClientChannels);
  setClientEvents(settings.communicationClientEvents || DEFAULTS.settings.communicationClientEvents);
}, [
  settings.communicationOwnerManagerChannels,
  settings.communicationOwnerManagerEvents,
  settings.communicationCleanerChannels,
  settings.communicationCleanerEvents,
  settings.communicationClientChannels,
  settings.communicationClientEvents,
]);

useEffect(() => {
  if (audienceTab === "clients") {
    setChannel(firstEnabledChannel(clientChannels, "email"));
  }
}, [audienceTab, clientChannels, firstEnabledChannel]);

const openWhatsApp = ({ phone, message }) => {
if (!phone) { showToast(uiText("Client phone missing"), "error"); return false; }
const cleaned = String(phone).replace(/[^\d+]/g, "").replace(/^00/, "+");
window.open(`https://wa.me/${cleaned.replace("+", "")}?text=${encodeURIComponent(message)}`, "_blank");
return true;
};

const buildBusinessWhatsAppReminder = (client, body) => {
  const contact = client.phoneMobile || client.phone || client.email || uiText("No contact");
  return `${uiText("Client")}: ${client.name}
${uiText("Contact")}: ${contact}
${uiText("Channel")}: WhatsApp

${body}`;
};

const sendPlatformSMS = async ({ to, body }) => {
if (!to) { showToast(uiText("Client phone missing"), "error"); return false; }
try {
const response = await fetch(apiUrl('/api/notifications/sms'), {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ to, body }),
});
if (!response.ok) {
const errPayload = await response.json().catch(() => ({}));
throw new Error(errPayload.error || 'Unable to send SMS');
}
return true;
} catch (err) {
console.error(err);
const fallbackSmsError = !err?.message || /load failed|failed to fetch/i.test(err.message);
showToast(fallbackSmsError ? uiText("Unable to send SMS") : err.message, "error");
return false;
}
};

const sendPlatformWhatsApp = async ({ to, body }) => {
if (!to) { showToast(uiText("Client phone missing"), "error"); return false; }
try {
const response = await fetch(apiUrl('/api/notifications/whatsapp'), {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ to, body }),
});
if (!response.ok) {
const errPayload = await response.json().catch(() => ({}));
throw new Error(errPayload.error || 'Unable to send WhatsApp');
}
return true;
} catch (err) {
console.error(err);
const fallbackWhatsappError = !err?.message || /load failed|failed to fetch/i.test(err.message);
showToast(fallbackWhatsappError ? uiText("Unable to send WhatsApp") : err.message, "error");
return false;
}
};

const sendDocumentEmail = async ({ type, documentId, template, emailLang }) => {
try {
const response = await fetch(apiUrl('/api/notifications/send-document'), {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ type, documentId, template, emailLang }),
});
if (!response.ok) {
const errPayload = await response.json().catch(() => ({}));
throw new Error(errPayload.error || 'Unable to send email');
}
showToast(lang === "fr" ? "Email envoyé" : "Email sent", "success");
return true;
} catch (err) {
console.error(err);
const fallbackError = !err?.message || /load failed|failed to fetch/i.test(err.message);
showToast(fallbackError ? uiText("Unable to send email") : err.message, "error");
return false;
}
};

const openZohoCompose = ({ to, subject, body }) => {
if (!to) { showToast(uiText("Client email missing"), "error"); return false; }
const url = `https://mail.zoho.com/zm/#compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`;
window.open(url, '_blank');
return true;
};

const dispatch = async (mode, payload, client) => {
if (mode === "whatsapp") {
  const targetPhone = client.phoneMobile || client.phone;
  const sent = await sendPlatformWhatsApp({ to: targetPhone, body: payload.body });
  if (sent) return true;
  const businessWhatsApp = String(data.settings.companyWhatsApp || "").trim();
  if (businessWhatsApp && targetPhone) {
    return openWhatsApp({ phone: businessWhatsApp, message: buildBusinessWhatsAppReminder(client, payload.body) });
  }
  return openWhatsApp({ phone: targetPhone, message: payload.body });
}
if (mode === "sms") return sendPlatformSMS({ to: client.phoneMobile || client.phone, body: payload.body });
if (mode === "zoho") {
  const sent = await sendPlatformEmail({ to: client.email, subject: payload.subject, body: payload.body }, { showToast, lang });
  if (sent) return true;
  return openZohoCompose({ to: client.email, subject: payload.subject, body: payload.body });
}
const sent = await sendPlatformEmail({ to: client.email, subject: payload.subject, body: payload.body }, { showToast, lang });
if (sent) return true;
return openZohoCompose({ to: client.email, subject: payload.subject, body: payload.body });
};

// ── Signature builder (shared) ────────────────────
const buildSig = () => data.settings.emailSignature
  ? `\n\n--\n${data.settings.emailSignature}`
  : `\n\n${lang === "fr" ? "Cordialement" : "Best regards"},\n${data.settings.companyName}${data.settings.companyEmail ? `\n${data.settings.companyEmail}` : ""}${data.settings.companyPhone ? ` | ${data.settings.companyPhone}` : ""}`;

// ── Reminder builders ─────────────────────────────
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const upcomingShiftReminders = (data.schedules || [])
.filter(s => s.date === tomorrow && s.status !== "cancelled")
.map(sched => {
const client = (data.clients || []).find(c => c.id === sched.clientId);
const employee = (data.employees || []).find(e => e.id === sched.employeeId);
if (!client) return null;
return {
id: `shift-${sched.id}`,
kind: "work",
client,
title: `${uiText("Upcoming shift reminder")} · ${client.name}`,
details: `${fmtDate(sched.date)} ${sched.startTime}-${sched.endTime} · ${employee?.name || uiText("Unassigned")}`,
buildPayload: () => {
const sig = buildSig();
const cname = client.contactPerson || client.name;
return lang === "fr" ? {
  to: client.email,
  subject: `Rappel de rendez-vous — ${fmtDate(sched.date)}`,
  body: `Bonjour ${cname},\n\nNous vous rappelons votre rendez-vous de nettoyage :\nDate : ${fmtDate(sched.date)}\nHoraire : ${sched.startTime}–${sched.endTime}\nAgent : ${employee?.name || "À définir"}${sig}`,
} : {
  to: client.email,
  subject: `Appointment reminder — ${fmtDate(sched.date)}`,
  body: `Hello ${cname},\n\nThis is a reminder for your upcoming cleaning appointment:\nDate: ${fmtDate(sched.date)}\nTime: ${sched.startTime}–${sched.endTime}\nCleaner: ${employee?.name || "TBA"}${sig}`,
};},
};
}).filter(Boolean);

const invoiceSentReminders = (data.invoices || [])
.filter(inv => inv.status === "sent")
.map(inv => {
const client = (data.clients || []).find(c => c.id === inv.clientId);
if (!client) return null;
return {
id: `invoice-${inv.id}`,
kind: "followup",
client,
title: `${uiText("Invoice sent notification")} · ${client.name}`,
details: `${inv.invoiceNumber} · ${fmtDate(inv.date)} · €${(inv.total || 0).toFixed(2)}`,
buildPayload: () => {
const sig = buildSig();
const cname = client.contactPerson || client.name;
return lang === "fr" ? {
  to: client.email,
  subject: `Facture ${inv.invoiceNumber} transmise`,
  body: `Bonjour ${cname},\n\nNous vous informons que votre facture ${inv.invoiceNumber} vous a été transmise.\nMontant : €${(inv.total || 0).toFixed(2)}\nDate : ${fmtDate(inv.date)}${sig}`,
} : {
  to: client.email,
  subject: `Invoice ${inv.invoiceNumber} sent`,
  body: `Hello ${cname},\n\nYour invoice ${inv.invoiceNumber} has been sent to you.\nAmount: €${(inv.total || 0).toFixed(2)}\nDate: ${fmtDate(inv.date)}${sig}`,
};},
};
}).filter(Boolean);

const paymentFollowUpReminders = (data.invoices || [])
.filter(inv => ["sent", "overdue"].includes(inv.status) && inv.dueDate && inv.dueDate < getToday())
.map(inv => {
const client = (data.clients || []).find(c => c.id === inv.clientId);
if (!client) return null;
return {
id: `pay-${inv.id}`,
kind: "followup",
client,
title: `${uiText("Payment follow-up")} · ${client.name}`,
details: `${inv.invoiceNumber} ${uiText("due")} ${fmtDate(inv.dueDate)} · €${(inv.total || 0).toFixed(2)}`,
buildPayload: () => {
const sig = buildSig();
const cname = client.contactPerson || client.name;
return lang === "fr" ? {
  to: client.email,
  subject: `Relance paiement — ${inv.invoiceNumber}`,
  body: `Bonjour ${cname},\n\nNous vous contactons concernant la facture ${inv.invoiceNumber} toujours en attente de règlement.\nDate d'échéance : ${fmtDate(inv.dueDate)}\nMontant dû : €${(inv.total || 0).toFixed(2)}\n\nMerci de nous confirmer si ce paiement a déjà été effectué.${sig}`,
} : {
  to: client.email,
  subject: `Payment follow-up — ${inv.invoiceNumber}`,
  body: `Hello ${cname},\n\nThis is a friendly follow-up regarding invoice ${inv.invoiceNumber}.\nDue date: ${fmtDate(inv.dueDate)}\nOutstanding amount: €${(inv.total || 0).toFixed(2)}\n\nPlease let us know if payment has already been made.${sig}`,
};},
};
}).filter(Boolean);

const workflows = [...upcomingShiftReminders, ...invoiceSentReminders, ...paymentFollowUpReminders];
const filtered = workflows.filter(w => (workflowType === "all" || w.kind === workflowType) && (!selectedOnly || selectedClientIds.includes(w.client.id)));

const sendReminder = async (rem) => {
const payload = rem.buildPayload();
const ok = await dispatch(channel, payload, rem.client);
if (ok) showToast(`${uiText("Reminder opened via")} ${channel}`);
};

const sendCampaign = async () => {
const recipients = clients.filter(c => selectedClientIds.includes(c.id));
if (!recipients.length) { showToast(uiText("Select at least one client for campaign"), "error"); return; }
const sig = data.settings.emailSignature
  ? `

--
${data.settings.emailSignature}`
  : `

${lang === "fr" ? "Cordialement" : "Best regards"},
${data.settings.companyName}${data.settings.companyEmail ? `
${data.settings.companyEmail}` : ""}${data.settings.companyPhone ? ` | ${data.settings.companyPhone}` : ""}`;
let sentCount = 0;
for (const client of recipients) {
const greeting = lang === "fr" ? `Bonjour ${client.contactPerson || client.name},` : `Hello ${client.contactPerson || client.name},`;
const payload = {
to: client.email,
subject: campaignSubject,
body: `${greeting}

${campaignBody}${sig}`,
};
const ok = await dispatch(campaignChannel, payload, client);
if (ok) sentCount += 1;
}
showToast(`${uiText("Campaign opened for")} ${sentCount} ${uiText("client(s)")}`);
};

// ── Save notification settings ────────────────────
const saveCommunicationSettings = async ({ silent = false } = {}) => {
  const patch = {
    communicationChannel: channel,
    communicationOwnerManagerChannels: ownerManagerChannels,
    communicationOwnerManagerEvents: ownerManagerEvents,
    communicationCleanerChannels: cleanerChannels,
    communicationCleanerEvents: cleanerEvents,
    communicationClientChannels: clientChannels,
    communicationClientEvents: clientEvents,
  };
  try {
    const nextSettings = normalizeSettingsPayload({ ...(settings || {}), ...patch }, settings || DEFAULTS.settings);
    const response = await fetch(apiUrl('/api/settings'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextSettings),
    });
    if (!response.ok) throw new Error(uiText("Failed to save communication settings"));
    updateData("settings", prev => normalizeSettingsPayload({ ...(prev || {}), ...patch }, prev || DEFAULTS.settings));
    if (!silent) showToast(uiText("Communication settings saved"));
    return true;
  } catch (err) {
    console.error(err);
    if (!silent) showToast(uiText("Failed to save communication settings"), "error");
    return false;
  }
};

// ── Notification rules definitions ────────────────
const channelModes = [
  { id: "zoho", label: uiText("Email") },
  { id: "sms", label: uiText("SMS") },
  { id: "whatsapp", label: uiText("WhatsApp") },
];
const ownerManagerEventDefs = [
  { id: "clockInOut", label: lang === "fr" ? "Validation des heures" : "Validate hours" },
  { id: "lateArrival", label: lang === "fr" ? "Employé en retard" : "Employee late" },
  { id: "timeOffRequest", label: lang === "fr" ? "Demande de congé" : "Time off request" },
  { id: "timeOffApproval", label: lang === "fr" ? "Validation de congé" : "Time off approved / rejected" },
  { id: "scheduleChange", label: lang === "fr" ? "Changement de planning" : "Schedule update" },
  { id: "invoiceOverdue", label: lang === "fr" ? "Facture en retard" : "Overdue invoice" },
];
const cleanerEventDefs = [
  { id: "jobReminder", label: lang === "fr" ? "Rappel d'intervention" : "Job reminder" },
  { id: "jobRescheduled", label: lang === "fr" ? "Intervention replanifiée" : "Job rescheduled" },
  { id: "lateAlert", label: lang === "fr" ? "Alerte retard" : "Late alert" },
  { id: "vacationApproval", label: lang === "fr" ? "Validation congé" : "Vacation approval" },
  { id: "vacationRequestStatus", label: lang === "fr" ? "Statut demande congé" : "Vacation request status" },
];
const clientEventDefs = [
  { id: "jobCompleted", label: lang === "fr" ? "Intervention terminée" : "Job completed" },
  { id: "jobReminder", label: lang === "fr" ? "Rappel de passage" : "Upcoming visit reminder" },
  { id: "jobRescheduled", label: lang === "fr" ? "Rendez-vous replanifié" : "Rescheduled visit" },
  { id: "invoiceSent", label: lang === "fr" ? "Facture envoyée" : "Invoice sent" },
  { id: "paymentReceived", label: lang === "fr" ? "Paiement reçu" : "Payment received" },
];

const toggleMapValue = (setter, key) => setter(prev => ({ ...(prev || {}), [key]: !prev?.[key] }));
const activeCount = (obj = {}) => Object.values(obj).filter(Boolean).length;

const pendingLeaveCount = timeOffRequests.filter(req => req.status === "pending").length;
const lateTodayCount = schedulesList.filter(s => s.date === getToday() && s.status === "scheduled").length;
const completedTodayCount = schedulesList.filter(s => s.date === getToday() && s.status === "completed").length;
const rescheduledCount = schedulesList.filter(s => s.status === "cancelled" || s.status === "rescheduled").length;

// ── UI helpers ────────────────────────────────────
const statChip = { padding: "6px 10px", borderRadius: 999, border: `1px solid ${CL.line}`, fontSize: 12, color: CL.muted, background: CL.s2 };

const providerChip = (label, configured) => (
  <div style={{ ...cardSt, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <strong style={{ fontSize: 13 }}>{label}</strong>
    <Badge color={configured ? CL.green : CL.orange}>{configured ? uiText("Active") : uiText("Pending")}</Badge>
  </div>
);

const renderAudienceConfigurator = ({ title, description, channelsState, onToggleChannel, eventDefs, eventsState, onToggleEvent, helperText }) => (
  <div style={{ ...cardSt }}>
    <h3 style={{ fontSize: 15, color: CL.gold, marginTop: 0, marginBottom: 4 }}>{title}</h3>
    <div style={{ color: CL.muted, fontSize: 13, marginBottom: 10 }}>{description}</div>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{lang === "fr" ? "Canaux actifs" : "Active channels"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
        {channelModes.map(mode => (
          <label key={mode.id} style={{ ...inputSt, display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={!!channelsState?.[mode.id]} onChange={() => onToggleChannel(mode.id)} />
            <span>{mode.label}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{lang === "fr" ? "Déclencheurs de notification" : "Notification triggers"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 8 }}>
        {eventDefs.map(item => (
          <label key={item.id} style={{ ...inputSt, display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={!!eventsState?.[item.id]} onChange={() => onToggleEvent(item.id)} />
            <span style={{ fontSize: 13 }}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
    {helperText ? <div style={{ color: CL.dim, fontSize: 12, marginTop: 10 }}>{helperText}</div> : null}
  </div>
);

// ── RENDER ────────────────────────────────────────
return (
<div>
  {/* Page header */}
  <h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 4 }}>
    {lang === "fr" ? "Centre de communications" : "Communication Center"}
  </h1>
  <p style={{ color: CL.muted, marginBottom: 16, fontSize: 13 }}>
    {lang === "fr"
      ? "Envoyez des rappels, gérez vos campagnes et configurez vos notifications automatiques."
      : "Send reminders, manage campaigns, and configure automatic notifications — all in one place."}
  </p>

  {/* Channel status bar */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 18 }}>
    {providerChip(uiText("Email"), true)}
    {providerChip(uiText("SMS"), !!settings.companyPhone)}
    {providerChip(uiText("WhatsApp"), !!settings.companyWhatsApp)}
  </div>

  {/* Main tabs */}
  <FormTabs
    tabs={[
      { id: "reminders", label: lang === "fr" ? "Rappels" : "Reminders" },
      { id: "campaigns", label: lang === "fr" ? "Campagnes" : "Campaigns" },
      { id: "rules", label: lang === "fr" ? "Règles de notification" : "Notification Rules" },
    ]}
    active={mainTab}
    onChange={setMainTab}
  />

  {/* ── REMINDERS TAB ── */}
  {mainTab === "reminders" && (
    <div>
      {/* Client selection */}
      <div style={{ ...cardSt, marginBottom: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: CL.gold }}>{uiText("Recipient Selection")}</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={statChip}>{uiText("Active Clients")} {clients.length}</div>
            <div style={statChip}>{uiText("Selected")} {selectedClientIds.length}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{uiText("Client search")}</div>
            <TextInput placeholder={uiText("Search by name, contact, email or phone")} value={clientSearch} onChange={ev => setClientSearch(ev.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 8, flexWrap: "wrap" }}>
            <button style={{ ...btnSec, ...btnSm }} onClick={() => setSelectedClientIds(clients.map(c => c.id))}>{uiText("Select all")}</button>
            <button style={{ ...btnSec, ...btnSm }} onClick={() => setSelectedClientIds([])}>{uiText("Clear")}</button>
            <button style={{ ...btnSec, ...btnSm }} onClick={() => setShowClientPicker(v => !v)}>{showClientPicker ? uiText("Hide clients") : uiText("Show clients")}</button>
          </div>
        </div>
        <label style={{ fontSize: 12, color: CL.muted, display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <input type="checkbox" checked={selectedOnly} onChange={ev => setSelectedOnly(ev.target.checked)} />
          {uiText("Restrict reminders to selected clients only")}
        </label>
        {showClientPicker && (
          <div style={{ marginTop: 10, border: `1px solid ${CL.line}`, borderRadius: 10, maxHeight: 210, overflow: "auto", padding: 8, background: CL.white }}>
            {visibleClients.length === 0 ? <div style={{ fontSize: 12, color: CL.muted }}>{uiText("No clients match this search.")}</div> : visibleClients.map(c => (
              <label key={c.id} style={{ fontSize: 12, color: CL.text, display: "flex", gap: 8, alignItems: "center", padding: "5px 4px", borderBottom: `1px solid ${CL.s2}` }}>
                <input type="checkbox" checked={selectedClientIds.includes(c.id)} onChange={() => toggleClient(c.id)} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{c.name}</div>
                  <div style={{ color: CL.muted, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{c.email || c.phone || c.phoneMobile || uiText("No contact")}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        {selectedClients.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedClients.slice(0, 20).map(c => <span key={c.id} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 999, background: CL.s2, color: CL.blue }}>{c.name}</span>)}
            {selectedClients.length > 20 && <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 999, background: CL.s2, color: CL.muted }}>+{selectedClients.length - 20} {uiText("more")}</span>}
          </div>
        )}
      </div>

      {/* Workflow + channel filter */}
      <div style={{ ...cardSt, marginBottom: 12, padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8, alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{uiText("Workflow")}</div>
          <SelectInput value={workflowType} onChange={ev => setWorkflowType(ev.target.value)}>
            <option value="all">{uiText("All workflows")}</option>
            <option value="work">{uiText("Work reminders / upcoming shifts")}</option>
            <option value="followup">{uiText("Business follow-up")}</option>
          </SelectInput>
        </div>
        <div>
          <div style={{ fontSize: 12, color: CL.muted, marginBottom: 6 }}>{uiText("Channel")}</div>
          <SelectInput value={channel} onChange={ev => setChannel(ev.target.value)}>
            <option value="zoho">{uiText("Email")}</option>
            <option value="sms">{uiText("SMS")}</option>
            <option value="whatsapp">{uiText("WhatsApp")}</option>
          </SelectInput>
        </div>
        <div style={{ ...statChip, textAlign: "center" }}>{uiText("Ready reminders:")} {filtered.length}</div>
      </div>

      {/* Reminder list */}
      {filtered.length === 0
        ? <div style={{ ...cardSt, textAlign: "center", padding: 26, color: CL.muted }}>{uiText("No reminders ready for this filter.")}</div>
        : (
          <div style={{ ...cardSt, padding: 0, overflow: "hidden" }}>
            <div style={{ maxHeight: 420, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1, background: CL.s2 }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10, color: CL.muted, borderBottom: `1px solid ${CL.line}` }}>{uiText("Client")}</th>
                    <th style={{ textAlign: "left", padding: 10, color: CL.muted, borderBottom: `1px solid ${CL.line}` }}>{uiText("Workflow")}</th>
                    <th style={{ textAlign: "left", padding: 10, color: CL.muted, borderBottom: `1px solid ${CL.line}` }}>{uiText("Details")}</th>
                    <th style={{ textAlign: "right", padding: 10, color: CL.muted, borderBottom: `1px solid ${CL.line}` }}>{uiText("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(rem => (
                    <tr key={rem.id}>
                      <td style={{ padding: 10, borderBottom: `1px solid ${CL.s2}` }}>
                        <div style={{ fontWeight: 600 }}>{rem.client.name}</div>
                        <div style={{ fontSize: 12, color: CL.dim }}>{rem.client.email || rem.client.phone || rem.client.phoneMobile || uiText("No contact")}</div>
                      </td>
                      <td style={{ padding: 10, borderBottom: `1px solid ${CL.s2}` }}>
                        <div style={{ fontWeight: 600 }}>{rem.title}</div>
                      </td>
                      <td style={{ padding: 10, borderBottom: `1px solid ${CL.s2}`, color: CL.muted }}>{rem.details}</td>
                      <td style={{ padding: 10, borderBottom: `1px solid ${CL.s2}`, textAlign: "right" }}>
                        <button style={{ ...btnPri, ...btnSm }} onClick={() => sendReminder(rem)}>{ICN.mail} {uiText("Send")}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  )}

  {/* ── CAMPAIGNS TAB ── */}
  {mainTab === "campaigns" && (
    <div style={{ ...cardSt }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: CL.gold }}>
        {lang === "fr" ? "Campagnes marketing" : "Marketing Campaigns"}
      </h3>
      <p style={{ color: CL.muted, fontSize: 13, marginBottom: 14 }}>
        {lang === "fr"
          ? "Sélectionnez vos clients dans l'onglet Rappels, puis composez et envoyez votre campagne."
          : "Select clients in the Reminders tab, then compose and send your campaign here."}
      </p>
      <div style={{ ...inputSt, background: CL.s2, marginBottom: 14, fontSize: 13 }}>
        <strong>{uiText("Selected")}:</strong> {selectedClientIds.length} {lang === "fr" ? "client(s) sélectionné(s)" : "client(s) selected"}
        {selectedClientIds.length === 0 && (
          <span style={{ color: CL.orange, marginLeft: 10 }}>
            {lang === "fr" ? "← Sélectionnez des clients dans l'onglet Rappels" : "← Select clients in the Reminders tab first"}
          </span>
        )}
      </div>
      <div className="form-grid">
        <Field label={uiText("Frequency")}>
          <SelectInput value={campaignFrequency} onChange={ev => setCampaignFrequency(ev.target.value)}>
            <option value="weekly">{uiText("Weekly")}</option>
            <option value="monthly">{uiText("Monthly")}</option>
          </SelectInput>
        </Field>
        <Field label={uiText("Channel")}>
          <SelectInput value={campaignChannel} onChange={ev => setCampaignChannel(ev.target.value)}>
            <option value="zoho">{uiText("Email")}</option>
            <option value="sms">{uiText("SMS")}</option>
            <option value="whatsapp">{uiText("WhatsApp")}</option>
          </SelectInput>
        </Field>
      </div>
      <Field label={uiText("Campaign subject")}><TextInput value={campaignSubject} onChange={ev => setCampaignSubject(ev.target.value)} /></Field>
      <Field label={uiText("Campaign content")}><TextArea value={campaignBody} onChange={ev => setCampaignBody(ev.target.value)} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={btnPri} onClick={sendCampaign}>{ICN.mail} {uiText("Send Campaign to Selected Clients")}</button>
      </div>
    </div>
  )}

  {/* ── NOTIFICATION RULES TAB ── */}
  {mainTab === "rules" && (
    <div>
      <div style={{ ...cardSt, marginBottom: 12 }}>
        <p style={{ color: CL.muted, fontSize: 13, marginBottom: 14 }}>
          {lang === "fr"
            ? "Définissez qui reçoit quoi et sur quel canal. Ces règles s'appliquent aux notifications automatiques."
            : "Define who gets notified, for what events, and via which channel. These rules apply to automatic notifications."}
        </p>
        <FormTabs
          tabs={[
            { id: "owner_manager", label: lang === "fr" ? "Owner & Manager" : "Owner & Manager" },
            { id: "cleaners", label: lang === "fr" ? "Cleaners" : "Cleaners" },
            { id: "clients", label: lang === "fr" ? "Clients" : "Clients" },
          ]}
          active={audienceTab}
          onChange={setAudienceTab}
        />
        {audienceTab === "owner_manager" && renderAudienceConfigurator({
          title: lang === "fr" ? "Owner & Manager" : "Owner & Manager",
          description: lang === "fr"
            ? "Configurez WhatsApp / Email / SMS pour les alertes d'exploitation et de supervision."
            : "Configure WhatsApp / Email / SMS for operational and supervision alerts.",
          channelsState: ownerManagerChannels,
          onToggleChannel: (key) => toggleMapValue(setOwnerManagerChannels, key),
          eventDefs: ownerManagerEventDefs,
          eventsState: ownerManagerEvents,
          onToggleEvent: (key) => toggleMapValue(setOwnerManagerEvents, key),
          helperText: lang === "fr"
            ? `Aujourd'hui: ${lateTodayCount} interventions planifiées, ${pendingLeaveCount} demandes de congé en attente.`
            : `Today: ${lateTodayCount} scheduled jobs, ${pendingLeaveCount} pending leave requests.`,
        })}
        {audienceTab === "cleaners" && renderAudienceConfigurator({
          title: lang === "fr" ? "Cleaners" : "Cleaners",
          description: lang === "fr"
            ? "Le propriétaire active les notifications de terrain envoyées aux agents."
            : "Owner controls field notifications sent to cleaners.",
          channelsState: cleanerChannels,
          onToggleChannel: (key) => toggleMapValue(setCleanerChannels, key),
          eventDefs: cleanerEventDefs,
          eventsState: cleanerEvents,
          onToggleEvent: (key) => toggleMapValue(setCleanerEvents, key),
          helperText: lang === "fr"
            ? `Connecté au planning: ${lateTodayCount} interventions du jour et ${rescheduledCount} changements détectés.`
            : `Connected to schedule data: ${lateTodayCount} jobs today and ${rescheduledCount} schedule changes.`,
        })}
        {audienceTab === "clients" && renderAudienceConfigurator({
          title: lang === "fr" ? "Clients" : "Clients",
          description: lang === "fr"
            ? "Activez les communications clients après passage, replanification et suivi facturation."
            : "Enable client communications for completion, rescheduling and billing updates.",
          channelsState: clientChannels,
          onToggleChannel: (key) => {
            toggleMapValue(setClientChannels, key);
            setChannel(firstEnabledChannel({ ...(clientChannels || {}), [key]: !clientChannels?.[key] }, channel));
          },
          eventDefs: clientEventDefs,
          eventsState: clientEvents,
          onToggleEvent: (key) => toggleMapValue(setClientEvents, key),
          helperText: lang === "fr"
            ? `Connecté aux interventions: ${completedTodayCount} terminées aujourd'hui.`
            : `Connected to operations: ${completedTodayCount} jobs completed today.`,
        })}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8, marginTop: 12 }}>
          <div style={{ ...inputSt, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: CL.muted }}>{lang === "fr" ? "Owner/Manager actifs" : "Owner/Manager active"}</div>
            <div style={{ fontWeight: 700, color: CL.gold }}>{activeCount(ownerManagerEvents)} {lang === "fr" ? "événements" : "events"}</div>
          </div>
          <div style={{ ...inputSt, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: CL.muted }}>{lang === "fr" ? "Cleaners actifs" : "Cleaners active"}</div>
            <div style={{ fontWeight: 700, color: CL.gold }}>{activeCount(cleanerEvents)} {lang === "fr" ? "événements" : "events"}</div>
          </div>
          <div style={{ ...inputSt, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: CL.muted }}>{lang === "fr" ? "Clients actifs" : "Clients active"}</div>
            <div style={{ fontWeight: 700, color: CL.gold }}>{activeCount(clientEvents)} {lang === "fr" ? "événements" : "events"}</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={btnPri} onClick={() => { void saveCommunicationSettings(); }}>{uiText("Save communication settings")}</button>
      </div>
    </div>
  )}
</div>
);
}

// ==============================================
// REPORTS PAGE
// ==============================================
function ReportsPage({ data }) {
const [month, setMonth] = useState(getToday().slice(0, 7));
const monthEntries = data.clockEntries.filter(c => c.clockOut && toLocalDateKey(c.clockIn).startsWith(month));

const empSummary = data.employees.filter(emp => emp.status === "active").map(emp => {
const entries = monthEntries.filter(c => c.employeeId === emp.id);
const totalH = entries.reduce((sum, ce) => sum + calcPayableClockHours(ce, data.schedules, entries), 0);
return { ...emp, totalH: Math.round(totalH * 100) / 100, cost: Math.round(totalH * emp.hourlyRate * 100) / 100 };
}).filter(e => e.totalH > 0);

const clientSummary = data.clients.filter(c => c.status === "active").map(client => {
const entries = monthEntries.filter(c => c.clientId === client.id);
const totalH = entries.reduce((sum, ce) => sum + calcPayableClockHours(ce, data.schedules, entries), 0);
const revenue = client.billingType === "fixed" ? Number(client.priceFixed) : totalH * Number(client.pricePerHour);
const invoiced = data.invoices.filter(inv => inv.clientId === client.id && inv.date?.startsWith(month)).reduce((sum, inv) => sum + (inv.total || 0), 0);
return { ...client, totalH: Math.round(totalH * 100) / 100, revenue: Math.round(revenue * 100) / 100, invoiced: Math.round(invoiced * 100) / 100 };
}).filter(c => c.totalH > 0 || c.invoiced > 0);

const totalRevenue = clientSummary.reduce((sum, c) => sum + c.revenue, 0);
const totalCost = empSummary.reduce((sum, e) => sum + e.cost, 0);
const totalHours = empSummary.reduce((sum, e) => sum + e.totalH, 0);
const profit = totalRevenue - totalCost;
const margin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;

return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold }}>{uiText("Reports")}</h1>
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
  <TextInput type="month" value={month} onChange={ev => setMonth(ev.target.value)} style={{ width: 160 }} />
  <button className="no-print" style={{ ...btnSec, ...btnSm }} onClick={() => window.print()} title="Print report">{ICN.download} Print</button>
</div>
</div>
<div className="stat-row" style={{ marginBottom: 22 }}>
<StatCard label={uiText("Hours")} value={`${totalHours.toFixed(1)}h`} icon={ICN.clock} color={CL.blue} />
<StatCard label={uiText("Revenue")} value={`€${totalRevenue.toFixed(2)}`} icon={ICN.chart} color={CL.green} />
<StatCard label={uiText("Labour")} value={`€${totalCost.toFixed(2)}`} icon={ICN.team} color={CL.red} />
<StatCard label={uiText("Profit")} value={`€${profit.toFixed(2)}`} icon={ICN.check} color={profit >= 0 ? CL.green : CL.red} />
<StatCard label="Margin" value={`${margin.toFixed(1)}%`} icon={ICN.chart} color={margin >= 30 ? CL.green : margin >= 0 ? CL.orange : CL.red} />
</div>
<div className="grid-2">
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Employee Hours")}</h3>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Employee</th><th style={thSt}>Hours</th><th style={thSt}>Rate</th><th style={thSt}>Cost</th></tr></thead>
<tbody>
{empSummary.length === 0
  ? <tr><td colSpan={4} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No clock entries for this month</td></tr>
  : empSummary.sort((a, b) => b.totalH - a.totalH).map(emp => <tr key={emp.id}><td style={tdSt}>{emp.name}</td><td style={tdSt}>{emp.totalH}h</td><td style={tdSt}>€{Number(emp.hourlyRate).toFixed(2)}/hr</td><td style={{ ...tdSt, fontWeight: 600 }}>€{emp.cost.toFixed(2)}</td></tr>)
}
{empSummary.length > 0 && <tr><td style={{ ...tdSt, fontWeight: 700, color: CL.gold }}>Total</td><td style={{ ...tdSt, fontWeight: 700 }}>{totalHours.toFixed(2)}h</td><td style={tdSt}></td><td style={{ ...tdSt, fontWeight: 700, color: CL.red }}>€{totalCost.toFixed(2)}</td></tr>}
</tbody>
</table>
</div>
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Client Revenue")}</h3>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>Client</th><th style={thSt}>Hours</th><th style={thSt}>Est. Revenue</th><th style={thSt}>Invoiced</th></tr></thead>
<tbody>
{clientSummary.length === 0
  ? <tr><td colSpan={4} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>No activity for this month</td></tr>
  : clientSummary.sort((a, b) => b.revenue - a.revenue).map(cl => <tr key={cl.id}><td style={tdSt}>{cl.name}</td><td style={tdSt}>{cl.totalH}h</td><td style={tdSt}>€{cl.revenue.toFixed(2)}</td><td style={{ ...tdSt, color: cl.invoiced >= cl.revenue ? CL.green : CL.orange, fontWeight: 600 }}>€{cl.invoiced.toFixed(2)}</td></tr>)
}
{clientSummary.length > 0 && <tr><td style={{ ...tdSt, fontWeight: 700, color: CL.gold }}>Total</td><td style={tdSt}></td><td style={{ ...tdSt, fontWeight: 700, color: CL.green }}>€{totalRevenue.toFixed(2)}</td><td style={{ ...tdSt, fontWeight: 700 }}>€{clientSummary.reduce((s, c) => s + c.invoiced, 0).toFixed(2)}</td></tr>}
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
try { await exportExcel(data); showToast(uiText("Exported!")); }
catch (err) { console.error(err); showToast(uiText("Failed"), "error"); }
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
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 5 }}>{uiText("Excel Database")}</h1>
<p style={{ color: CL.muted, marginBottom: 20 }}>{uiText("Full backup/restore with structured 8-sheet Excel file.")}</p>
<div className="grid-2" style={{ marginBottom: 20 }}>
<div style={{ ...cardSt, textAlign: "center", padding: 28 }}>
<div style={{ width: 56, height: 56, borderRadius: 16, background: CL.green + "15", display: "flex", alignItems: "center", justifyContent: "center", color: CL.green, margin: "0 auto 12px" }}>{ICN.download}</div>
<h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CL.green, marginBottom: 6 }}>{uiText("Export Database")}</h3>
<p style={{ color: CL.muted, fontSize: 12, marginBottom: 14 }}>8 sheets: Employees, Clients, Schedule, Time Clock, Invoices, Payslips, Settings, Summary</p>
<button style={{ ...btnPri, background: CL.green, justifyContent: "center", width: "100%" }} onClick={doExport}>{exporting ? uiText("Exporting...") : uiText("Export .xlsx")}</button>
</div>
<div style={{ ...cardSt, textAlign: "center", padding: 28 }}>
<div style={{ width: 56, height: 56, borderRadius: 16, background: CL.blue + "15", display: "flex", alignItems: "center", justifyContent: "center", color: CL.blue, margin: "0 auto 12px" }}>{ICN.excel}</div>
<h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CL.blue, marginBottom: 6 }}>{uiText("Import Database")}</h3>
<p style={{ color: CL.muted, fontSize: 12, marginBottom: 14 }}>{uiText("Upload a previously exported Excel file to restore all data.")}</p>
<input type="file" accept=".xlsx,.xls" ref={fileRef} onChange={doImport} style={{ display: "none" }} />
<button style={{ ...btnPri, background: CL.blue, justifyContent: "center", width: "100%" }} onClick={() => fileRef.current?.click()}>{uiText("Import .xlsx")}</button>
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
// PASSWORD RESET TAB
// ==============================================
function PasswordResetTab({ data, showToast, ownerUsername, managerUsername }) {
  const [ownerNewPin, setOwnerNewPin] = useState("");
  const [managerNewPin, setManagerNewPin] = useState("");
  const [empPins, setEmpPins] = useState({});
  const [saving, setSaving] = useState({});

  const employees = (data.employees || []).filter(e => e.status !== "inactive");

  const resetOwnerPin = async () => {
    const pin = ownerNewPin.trim();
    if (!pin) { showToast("Enter a new PIN for the owner", "error"); return; }
    setSaving(s => ({ ...s, owner: true }));
    try {
      await fetch(apiUrl("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerPin: pin }),
      });
      showToast("Owner PIN updated successfully", "success");
      setOwnerNewPin("");
    } catch (err) {
      showToast("Failed to update owner PIN", "error");
    } finally {
      setSaving(s => ({ ...s, owner: false }));
    }
  };

  const resetManagerPin = async () => {
    const pin = managerNewPin.trim();
    if (!pin) { showToast("Enter a new PIN for the manager", "error"); return; }
    setSaving(s => ({ ...s, manager: true }));
    try {
      await fetch(apiUrl("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerPin: pin }),
      });
      showToast("Manager PIN updated successfully", "success");
      setManagerNewPin("");
    } catch (err) {
      showToast("Failed to update manager PIN", "error");
    } finally {
      setSaving(s => ({ ...s, manager: false }));
    }
  };

  const resetEmployeePin = async (emp) => {
    const pin = (empPins[emp.id] || "").trim();
    if (!pin) { showToast(`Enter a new PIN for ${emp.name}`, "error"); return; }
    setSaving(s => ({ ...s, [emp.id]: true }));
    try {
      const res = await fetch(apiUrl(`/api/auth/admin-reset-password`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: emp.id, newPin: pin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || `Failed to reset PIN for ${emp.name}`, "error");
        return;
      }
      showToast(`PIN reset for ${emp.name}`, "success");
      setEmpPins(p => ({ ...p, [emp.id]: "" }));
    } catch (err) {
      showToast(`Failed to reset PIN for ${emp.name}`, "error");
    } finally {
      setSaving(s => ({ ...s, [emp.id]: false }));
    }
  };

  return (
    <div style={{ marginTop: 14 }}>
      <h3 style={{ color: CL.gold, marginTop: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}>Password & PIN Reset</h3>
      <p style={{ color: CL.muted, marginBottom: 18, fontSize: 13 }}>Reset access credentials for any user. Changes take effect immediately on the next login.</p>

      {/* Owner */}
      <div style={{ ...cardSt, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>👑</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Owner</div>
            <div style={{ fontSize: 12, color: CL.muted }}>{ownerUsername || "owner"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Field label="New PIN / Password">
            <TextInput
              type="password"
              value={ownerNewPin}
              onChange={ev => setOwnerNewPin(ev.target.value)}
              placeholder="Enter new PIN"
              style={{ maxWidth: 260 }}
            />
          </Field>
          <button style={{ ...btnPri, marginBottom: 10 }} onClick={resetOwnerPin} disabled={saving.owner}>
            {saving.owner ? "Saving…" : "🔑 Reset PIN"}
          </button>
        </div>
      </div>

      {/* Manager */}
      <div style={{ ...cardSt, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🧑‍💼</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Manager</div>
            <div style={{ fontSize: 12, color: CL.muted }}>{managerUsername || "manager"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Field label="New PIN / Password">
            <TextInput
              type="password"
              value={managerNewPin}
              onChange={ev => setManagerNewPin(ev.target.value)}
              placeholder="Enter new PIN"
              style={{ maxWidth: 260 }}
            />
          </Field>
          <button style={{ ...btnPri, marginBottom: 10 }} onClick={resetManagerPin} disabled={saving.manager}>
            {saving.manager ? "Saving…" : "🔑 Reset PIN"}
          </button>
        </div>
      </div>

      {/* Employees / Cleaners */}
      <div style={{ ...cardSt }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🧹 Agents / Cleaners</div>
        {employees.length === 0 && <div style={{ color: CL.muted, fontSize: 13 }}>No active employees found.</div>}
        <div style={{ display: "grid", gap: 12 }}>
          {employees.map(emp => (
            <div key={emp.id} style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "12px 14px", background: CL.s2, border: `1px solid ${CL.bd}`, borderRadius: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 160, flex: "0 0 auto" }}>
                <div style={{ fontWeight: 600 }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: CL.muted }}>{emp.role || "Agent"} · {emp.email || "no email"}</div>
              </div>
              <Field label="New PIN / Password" style={{ flex: 1, minWidth: 180 }}>
                <TextInput
                  type="password"
                  value={empPins[emp.id] || ""}
                  onChange={ev => setEmpPins(p => ({ ...p, [emp.id]: ev.target.value }))}
                  placeholder="Enter new PIN"
                />
              </Field>
              <button
                style={{ ...btnPri, marginBottom: 10, flexShrink: 0 }}
                onClick={() => resetEmployeePin(emp)}
                disabled={saving[emp.id]}
              >
                {saving[emp.id] ? "Saving…" : "🔑 Reset"}
              </button>
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
function SettingsPage({ data, updateData, setData, showToast, auth }) {
const [activeTab, setActiveTab] = useState("company");
const [form, setForm] = useState(data.settings);
const [ownerUsername, setOwnerUsername] = useState(data.ownerUsername || "");
const [ownerPin, setOwnerPin] = useState(data.ownerPin || "");
const [managerUsername, setManagerUsername] = useState(data.managerUsername || "");
const [managerPin, setManagerPin] = useState(data.managerPin || "");
const [newRoleName, setNewRoleName] = useState("");
const [saveBanner, setSaveBanner] = useState("");
const [errors, setErrors] = useState({});
const [isWipingData, setIsWipingData] = useState(false);
const [userSearch, setUserSearch] = useState("");
const [usersShowAll, setUsersShowAll] = useState(false);

useEffect(() => {
  setForm(data.settings);
  setOwnerUsername(data.ownerUsername || "");
  setOwnerPin(data.ownerPin || "");
  setManagerUsername(data.managerUsername || "");
  setManagerPin(data.managerPin || "");
}, [data.settings, data.ownerUsername, data.ownerPin, data.managerUsername, data.managerPin]);

const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
const parseNum = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const validate = () => {
  const e = {};
  if (!String(form.companyName || "").trim()) e.companyName = "Company name is required";
  if (form.companyEmail && !/^\S+@\S+\.\S+$/.test(form.companyEmail)) e.companyEmail = "Enter a valid email";
  if (form.defaultVatRate < 0 || form.defaultVatRate > 100) e.defaultVatRate = "VAT must be between 0 and 100";
  if (form.financeVatRate < 0 || form.financeVatRate > 100) e.financeVatRate = "VAT must be between 0 and 100";
  if (form.latePaymentPenalty < 0 || form.latePaymentPenalty > 100) e.latePaymentPenalty = "Penalty must be between 0 and 100";
  if (parseNum(form.defaultHourlyRate, 0) < 0) e.defaultHourlyRate = "Hourly rate must be positive";
  if (form.maxJobsPerEmployeePerDay !== undefined && form.maxJobsPerEmployeePerDay !== "" && parseNum(form.maxJobsPerEmployeePerDay, 1) < 1) e.maxJobsPerEmployeePerDay = "Minimum is 1 job";
  if (parseNum(form.lateToleranceMinutes, 0) < 0) e.lateToleranceMinutes = "Cannot be negative";
  if (parseNum(form.minStockThreshold, 0) < 0) e.minStockThreshold = "Cannot be negative";
  if (form.autoClockOutAfterHours !== undefined && form.autoClockOutAfterHours !== "" && parseNum(form.autoClockOutAfterHours, 1) < 1) e.autoClockOutAfterHours = "Minimum 1 hour";
  if (!String(form.defaultCurrency || "").trim()) e.defaultCurrency = "Currency is required";
  if (form.defaultLanguage && !["FR", "EN"].includes(form.defaultLanguage)) e.defaultLanguage = "Choose FR or EN";
  if (form.timeFormat && !["24h", "12h"].includes(form.timeFormat)) e.timeFormat = "Choose a valid time format";
  setErrors(e);
  return Object.keys(e).length === 0;
};

const persistSettings = async () => {
  if (!validate()) {
    showToast(uiText("Please fix validation errors"), "error");
    return false;
  }

  const normalized = {
    ...form,
    defaultVatRate: parseNum(form.financeVatRate ?? form.defaultVatRate, parseNum(form.defaultVatRate, 17)),
    financeVatRate: parseNum(form.financeVatRate ?? form.defaultVatRate, 17),
    customRoles: form.customRoles || [],
    rolePermissions: form.rolePermissions || {},
  };

  updateData("settings", normalized);
  setData(prev => ({
    ...prev,
    ownerUsername: ownerUsername.trim(),
    ownerPin: ownerPin.trim(),
    managerUsername: managerUsername.trim().toLowerCase(),
    managerPin: managerPin.trim(),
  }));

  try {
    await fetch(apiUrl("/api/settings"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...normalized,
        ownerUsername: ownerUsername.trim(),
        ownerPin: ownerPin.trim(),
        managerUsername: managerUsername.trim().toLowerCase(),
        managerPin: managerPin.trim(),
        customRoles: JSON.stringify(normalized.customRoles || []),
        publicHolidays: JSON.stringify(normalized.publicHolidays || []),
        rolePermissions: JSON.stringify(normalized.rolePermissions || {}),
      }),
    });
  } catch (err) {
    console.error(err);
  }

  setSaveBanner(uiText("Changes saved successfully."));
  showToast(uiText("Settings updated"), "success");
  setTimeout(() => setSaveBanner(""), 2200);
  return true;
};

const wipeAllData = async () => {
  if (auth?.role !== "owner" || isWipingData) return;
  if (!window.confirm(uiText("This action is irreversible. Continue?"))) return;
  const confirmation = window.prompt(uiText("Type WIPE to confirm full deletion"), "");
  if ((confirmation || "").trim().toUpperCase() !== "WIPE") {
    showToast(uiText("Type WIPE to proceed."), "error");
    return;
  }

  const wipedSnapshot = {
    ...DEFAULTS,
    ownerUsername: (data.ownerUsername || "").trim(),
    ownerPin: (data.ownerPin || "").trim(),
    managerUsername: (data.managerUsername || "").trim().toLowerCase(),
    managerPin: (data.managerPin || "").trim(),
    settings: normalizeSettingsPayload(DEFAULTS.settings, DEFAULTS.settings),
    employeePins: {},
    employeeUsernames: {},
  };

  setIsWipingData(true);
  try {
    setData(wipedSnapshot);
    await syncImportedDataToDb(wipedSnapshot);
    showToast(uiText("All data deleted successfully"), "success");
  } catch (err) {
    console.error(err);
    showToast(uiText("Failed to wipe data"), "error");
  } finally {
    setIsWipingData(false);
  }
};

const onLogoUpload = (file) => {
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast(uiText("Please upload an image file"), "error"); return; }
  const reader = new FileReader();
  reader.onload = () => setField("companyLogo", reader.result);
  reader.readAsDataURL(file);
};

const users = (data.employees || []).map(u => ({ id: u.id, name: u.name, role: u.role || "Agent", status: u.status || "active" }));
const builtinRoles = ["Admin", "Manager", "Agent"];
const roles = [...builtinRoles, ...(form.customRoles || [])];
const permissionDefs = [
  "View clients", "Edit clients", "Access planning", "Modify planning", "Access invoices", "Create invoices", "View salaries", "Manage stock", "Access reports",
];

const setRolePermission = (role, permission, checked) => {
  const current = form.rolePermissions || {};
  const rolePerms = new Set(current[role] || []);
  if (checked) rolePerms.add(permission); else rolePerms.delete(permission);
  setField("rolePermissions", { ...current, [role]: Array.from(rolePerms) });
};

const tabs = [
  { id: "company", label: "Company" },
  { id: "team", label: "Team" },
  { id: "finance", label: "Finance" },
  { id: "planning", label: "Planning" },
  { id: "operations", label: "Operations" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "system", label: "System" },
  ...(auth?.role === "owner" ? [{ id: "danger", label: "Zone rouge" }] : []),
];

return (
<div>
  <h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 10 }}>{uiText("Settings Control Panel")}</h1>
  <p style={{ color: CL.muted, marginBottom: 14 }}>{uiText("Configure company identity, access rights, finance, planning, time tracking, stock and system behavior.")}</p>
  <FormTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

  {saveBanner && <div style={{ marginTop: 12, marginBottom: 12, padding: "10px 12px", borderRadius: 8, border: `1px solid ${CL.green}`, background: `${CL.green}15`, color: CL.green, fontSize: 13 }}>{saveBanner}</div>}

  {activeTab === "company" && <div style={{ ...cardSt, marginTop: 14 }}>
    <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Business identity")}</h3>
    <div className="grid-2">
      <div>
        <Field label="Company Name"><TextInput value={form.companyName || ""} onChange={ev => setField("companyName", ev.target.value)} /></Field>
        {errors.companyName && <div style={{ color: CL.red, fontSize: 12, marginTop: -8, marginBottom: 10 }}>{uiText(errors.companyName)}</div>}
        <Field label="Address"><TextInput value={form.companyAddress || ""} onChange={ev => setField("companyAddress", ev.target.value)} /></Field>
        <Field label="Phone"><TextInput value={form.companyPhone || ""} onChange={ev => setField("companyPhone", ev.target.value)} /></Field>
        <Field label="Email"><TextInput value={form.companyEmail || ""} onChange={ev => setField("companyEmail", ev.target.value)} /></Field>
        {errors.companyEmail && <div style={{ color: CL.red, fontSize: 12, marginTop: -8, marginBottom: 10 }}>{uiText(errors.companyEmail)}</div>}
        <Field label="VAT Number"><TextInput value={form.vatNumber || ""} onChange={ev => setField("vatNumber", ev.target.value)} /></Field>
        <Field label="Default Currency (€)"><TextInput value={form.defaultCurrency || "EUR"} onChange={ev => setField("defaultCurrency", ev.target.value)} /></Field>
        <Field label="Bank IBAN"><TextInput value={form.bankIban || ""} onChange={ev => setField("bankIban", ev.target.value)} placeholder="LU..." /></Field>
        <Field label="Logo upload"><input type="file" accept="image/*" onChange={ev => onLogoUpload(ev.target.files?.[0])} style={{ ...inputSt, padding: 8 }} /></Field>
      </div>
      <div>
        <div style={{ ...cardSt, padding: 16 }}>
          <div style={{ fontSize: 12, color: CL.muted, marginBottom: 8 }}>{uiText("Invoice header preview (live)")}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {form.companyLogo ? <img src={form.companyLogo} alt="logo" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", border: `1px solid ${CL.bd}` }} /> : <div style={{ width: 56, height: 56, borderRadius: 8, border: `1px dashed ${CL.bd}`, display: "grid", placeItems: "center", color: CL.muted, fontSize: 11 }}>{uiText("Logo")}</div>}
            <div>
              <div style={{ fontWeight: 700 }}>{form.companyName || uiText("Company")}</div>
              <div style={{ fontSize: 12, color: CL.muted }}>{form.companyAddress || uiText("Address")}</div>
              <div style={{ fontSize: 12, color: CL.muted }}>{form.companyEmail || uiText("Email")} · {form.companyPhone || uiText("Phone")}</div>
            </div>
          </div>
        </div>
        <Field label="Editable footer (legal text)">
          <textarea value={form.invoiceFooterText || ""} onChange={ev => setField("invoiceFooterText", ev.target.value)} placeholder={uiText("Legal footer for invoices")} style={{ ...inputSt, minHeight: 110, resize: "vertical" }} />
        </Field>
      </div>
    </div>
    <button style={btnPri} onClick={persistSettings}>{ICN.check} {uiText("Save changes")}</button>
  </div>}

  {activeTab === "team" && <div style={{ ...cardSt, marginTop: 14 }}>
    <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Users & permissions")}</h3>
    <div style={{ ...cardSt, padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>{uiText("Users")}</div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <TextInput
          placeholder={uiText("Search users...")}
          value={userSearch}
          onChange={ev => { setUserSearch(ev.target.value); setUsersShowAll(false); }}
          style={{ paddingLeft: 34 }}
        />
        <span style={{ position: "absolute", left: 10, top: 10, color: CL.muted }}>{ICN.search}</span>
      </div>
      {(() => {
        const filtered = users.filter(u => {
          const q = userSearch.toLowerCase();
          return !q || u.name.toLowerCase().includes(q) || (u.role || "").toLowerCase().includes(q) || (u.status || "").toLowerCase().includes(q);
        });
        const VISIBLE = 5;
        const shown = usersShowAll ? filtered : filtered.slice(0, VISIBLE);
        return (
          <div>
            <div style={{ display: "grid", gap: 8, maxHeight: usersShowAll ? "none" : `${VISIBLE * 54}px`, overflowY: usersShowAll ? "visible" : "auto" }}>
              {shown.map(u => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: CL.s2, border: `1px solid ${CL.bd}`, borderRadius: 8, padding: "8px 10px" }}>
                  <div><strong>{u.name}</strong> · {u.role} · <span style={{ color: u.status === "active" ? CL.green : CL.red }}>{u.status}</span></div>
                  <button style={btnDng} onClick={async () => {
                    if (!window.confirm(`${uiText("Delete this user?")} (${u.name})`)) return;
                    try {
                      await deleteEmployeeFromApi(u.id);
                      setData(prev => ({ ...prev, employees: (prev.employees || []).filter(emp => emp.id !== u.id) }));
                      showToast(uiText("User deleted"), "success");
                    } catch (err) {
                      showToast(err.message || "Error", "error");
                    }
                  }}>{uiText("Delete")}</button>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ fontSize: 12, color: CL.muted }}>{uiText("No users yet. Add users from the Employees tab.")}</div>}
            </div>
            {filtered.length > VISIBLE && (
              <button style={{ ...btnSec, marginTop: 8, fontSize: 12 }} onClick={() => setUsersShowAll(v => !v)}>
                {usersShowAll ? uiText("Show less") : `${uiText("Show more")} (${filtered.length - VISIBLE})`}
              </button>
            )}
          </div>
        );
      })()}
    </div>

    <div style={{ ...cardSt, padding: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{uiText("Roles & permissions")}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <TextInput value={newRoleName} placeholder="Add new role" onChange={ev => setNewRoleName(ev.target.value)} style={{ maxWidth: 280 }} />
        <button style={btnPri} onClick={() => {
          const role = newRoleName.trim();
          if (!role) return;
          if (roles.includes(role)) { showToast(uiText("Role already exists"), "error"); return; }
          setField("customRoles", [...(form.customRoles || []), role]);
          setNewRoleName("");
        }}>Add role</button>
      </div>
      {roles.map(role => <div key={role} style={{ marginBottom: 12, border: `1px solid ${CL.bd}`, borderRadius: 10, padding: 10, background: CL.s2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <strong>{role}</strong>
          {!builtinRoles.includes(role) && <button style={btnDng} onClick={() => {
            if (!window.confirm(`Delete role ${role}?`)) return;
            setField("customRoles", (form.customRoles || []).filter(r => r !== role));
            const rp = { ...(form.rolePermissions || {}) };
            delete rp[role];
            setField("rolePermissions", rp);
          }}>{uiText("Delete")}</button>}
        </div>
        <div className="grid-3">
          {permissionDefs.map(perm => {
            const checked = (form.rolePermissions?.[role] || []).includes(perm);
            return <label key={perm} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}><input type="checkbox" checked={checked} onChange={ev => setRolePermission(role, perm, ev.target.checked)} />{perm}</label>;
          })}
        </div>
      </div>)}
    </div>
    <div style={{ marginTop: 12 }}><button style={btnPri} onClick={persistSettings}>{ICN.check} {uiText("Save changes")}</button></div>
  </div>}

  {activeTab === "finance" && <div style={{ ...cardSt, marginTop: 14 }}>
    <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Financial rules")}</h3>
    <div className="grid-2">
      <Field label="Default hourly rate"><TextInput type="number" value={form.defaultHourlyRate || 0} onChange={ev => setField("defaultHourlyRate", parseNum(ev.target.value, 0))} /></Field>
      <Field label="VAT rate (%)"><TextInput type="number" value={form.financeVatRate ?? form.defaultVatRate ?? 17} onChange={ev => setField("financeVatRate", parseNum(ev.target.value, 0))} /></Field>
      <Field label="Invoice prefix"><TextInput value={form.invoicePrefix || "LA-YYYY-XXX"} onChange={ev => setField("invoicePrefix", ev.target.value)} /></Field>
      <Field label="Payment terms"><TextInput value={form.paymentTermsDays || "30 days"} onChange={ev => setField("paymentTermsDays", ev.target.value)} /></Field>
      <Field label="Late payment penalty (%)"><TextInput type="number" value={form.latePaymentPenalty || 0} onChange={ev => setField("latePaymentPenalty", parseNum(ev.target.value, 0))} /></Field>
      <Field label="Auto mark overdue after X days"><TextInput type="number" value={form.autoMarkOverdueDays || 0} onChange={ev => setField("autoMarkOverdueDays", parseNum(ev.target.value, 0))} /></Field>
      <Field label="Currency format"><TextInput value={form.currencyFormat || "€ 1,234.56"} onChange={ev => setField("currencyFormat", ev.target.value)} /></Field>
    </div>
    <button style={btnPri} onClick={persistSettings}>{ICN.check} {uiText("Save changes")}</button>
  </div>}

  {activeTab === "planning" && <div style={{ ...cardSt, marginTop: 14 }}>
    <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Planning behavior")}</h3>
    <div className="grid-2">
      <Field label="Default job duration"><TextInput value={form.defaultJobDuration || "2h"} onChange={ev => setField("defaultJobDuration", ev.target.value)} /></Field>
      <Field label="Working hours (start / end)"><div style={{ display: "flex", gap: 8 }}><TextInput type="time" value={form.workingHoursStart || "08:00"} onChange={ev => setField("workingHoursStart", ev.target.value)} /><TextInput type="time" value={form.workingHoursEnd || "18:00"} onChange={ev => setField("workingHoursEnd", ev.target.value)} /></div></Field>
      <Field label="Max jobs per employee per day"><TextInput type="number" value={form.maxJobsPerEmployeePerDay || 3} onChange={ev => setField("maxJobsPerEmployeePerDay", parseNum(ev.target.value, 1))} /></Field>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}><input type="checkbox" checked={!!form.allowOverlappingJobs} onChange={ev => setField("allowOverlappingJobs", ev.target.checked)} />{uiText("Allow overlapping jobs")}</label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}><input type="checkbox" checked={!!form.autoAssignEmployee} onChange={ev => setField("autoAssignEmployee", ev.target.checked)} />{uiText("Auto-assign employee")}</label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}><input type="checkbox" checked={!!form.groupByLocationSuggestion} onChange={ev => setField("groupByLocationSuggestion", ev.target.checked)} />{uiText("Suggest grouping by location")}</label>
    </div>
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${CL.bd}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{uiText("Public holidays shown in planning")}</div>
      <div className="grid-2">
        {LUX_PUBLIC_HOLIDAY_KEYS.map((holidayKey) => {
          const selected = Array.isArray(form.publicHolidays) ? form.publicHolidays : [];
          const checked = selected.length === 0 ? true : selected.includes(holidayKey);
          return (
            <label key={holidayKey} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(ev) => {
                  const current = Array.isArray(form.publicHolidays) ? [...form.publicHolidays] : [...LUX_PUBLIC_HOLIDAY_KEYS];
                  const nextSet = new Set(current.length > 0 ? current : LUX_PUBLIC_HOLIDAY_KEYS);
                  if (ev.target.checked) nextSet.add(holidayKey);
                  else nextSet.delete(holidayKey);
                  setField("publicHolidays", Array.from(nextSet));
                }}
              />
              <span>{getLuxHolidayLabel(holidayKey, loadLang())}</span>
            </label>
          );
        })}
      </div>
      {Array.isArray(form.publicHolidays) && form.publicHolidays.length === 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: CL.orange }}>{uiText("No public holiday selected")}</div>
      )}
    </div>
    <button style={btnPri} onClick={persistSettings}>{ICN.check} {uiText("Save changes")}</button>
  </div>}

  {activeTab === "operations" && <div style={{ marginTop: 14 }}>
    <div style={{ ...cardSt, marginBottom: 14 }}>
      <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Time tracking")}</h3>
      <div className="grid-2">
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={!!form.allowManualEntry} onChange={ev => setField("allowManualEntry", ev.target.checked)} />{uiText("Allow manual entry")}</label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={!!form.requireReasonManualEdits} onChange={ev => setField("requireReasonManualEdits", ev.target.checked)} />{uiText("Require reason for manual edits")}</label>
        <Field label="Late tolerance (minutes)"><TextInput type="number" value={form.lateToleranceMinutes || 0} onChange={ev => setField("lateToleranceMinutes", parseNum(ev.target.value, 0))} /></Field>
        <Field label="Auto clock-out after X hours"><TextInput type="number" value={form.autoClockOutAfterHours || 10} onChange={ev => setField("autoClockOutAfterHours", parseNum(ev.target.value, 1))} /></Field>
      </div>
    </div>
    <div style={{ ...cardSt }}>
      <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Stock")}</h3>
      <div className="grid-2">
        <Field label="Default unit"><TextInput value={form.defaultStockUnit || "bottles"} onChange={ev => setField("defaultStockUnit", ev.target.value)} /></Field>
        <Field label="Minimum stock threshold"><TextInput type="number" value={form.minStockThreshold || 5} onChange={ev => setField("minStockThreshold", parseNum(ev.target.value, 0))} /></Field>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={!!form.enableStockAlerts} onChange={ev => setField("enableStockAlerts", ev.target.checked)} />{uiText("Enable stock alerts")}</label>
      </div>
    </div>
    <button style={{ ...btnPri, marginTop: 14 }} onClick={persistSettings}>{ICN.check} {uiText("Save changes")}</button>
  </div>}

  {activeTab === "notifications" && <div style={{ ...cardSt, marginTop: 14 }}>
    <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Notifications")}</h3>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: CL.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{uiText("WhatsApp")}</div>
      <Field label="Business WhatsApp number (for reminder drafts)">
        <TextInput value={form.companyWhatsApp || ""} onChange={ev => setField("companyWhatsApp", ev.target.value)} placeholder="+352..." />
      </Field>
      <div style={{ fontSize: 12, color: CL.muted, marginTop: -6 }}>
        {uiText("WhatsApp Business API requires backend Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM.")}
      </div>
    </div>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: CL.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{uiText("Email provider")}</div>
      <Field label="Provider">
        <SelectInput value={form.emailProvider || ""} onChange={ev => setField("emailProvider", ev.target.value)}>
          <option value="">-- {uiText("Select provider")} --</option>
          <option value="smtp">SMTP</option>
          <option value="zeptomail">ZeptoMail</option>
          <option value="resend">Resend</option>
        </SelectInput>
      </Field>

      {form.emailProvider === "smtp" && <>
        <div className="grid-2">
          <Field label="SMTP Host">
            <TextInput value={form.smtpHost || ""} onChange={ev => setField("smtpHost", ev.target.value)} placeholder="mail.infomaniak.com" />
          </Field>
          <Field label="SMTP Port">
            <TextInput value={form.smtpPort || "465"} onChange={ev => setField("smtpPort", ev.target.value)} placeholder="465" />
          </Field>
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
          <input type="checkbox" checked={form.smtpSecure !== false && form.smtpSecure !== "false"} onChange={ev => setField("smtpSecure", ev.target.checked)} />
          {uiText("Use TLS/SSL (secure)")}
        </label>
        <div className="grid-2">
          <Field label="SMTP Username">
            <TextInput value={form.smtpUser || ""} onChange={ev => setField("smtpUser", ev.target.value)} placeholder="user@domain.com" />
          </Field>
          <Field label="SMTP Password">
            <TextInput type="password" value={form.smtpPass || ""} onChange={ev => setField("smtpPass", ev.target.value)} placeholder="••••••••" />
          </Field>
        </div>
      </>}

      {form.emailProvider === "zeptomail" && <>
        <Field label="ZeptoMail API Token">
          <TextInput type="password" value={form.zeptoApiToken || ""} onChange={ev => setField("zeptoApiToken", ev.target.value)} placeholder="Zoho-enczapikey ..." />
        </Field>
        <div className="grid-2">
          <Field label="API URL">
            <TextInput value={form.zeptoApiUrl || "https://api.zeptomail.eu/v1.1/email"} onChange={ev => setField("zeptoApiUrl", ev.target.value)} />
          </Field>
          <Field label="From address">
            <TextInput value={form.zeptoFromAddress || ""} onChange={ev => setField("zeptoFromAddress", ev.target.value)} placeholder="noreply@yourdomain.com" />
          </Field>
        </div>
      </>}

      {form.emailProvider === "resend" && <>
        <div className="grid-2">
          <Field label="Resend API Key">
            <TextInput type="password" value={form.resendApiKey || ""} onChange={ev => setField("resendApiKey", ev.target.value)} placeholder="re_..." />
          </Field>
          <Field label="From address">
            <TextInput value={form.resendFrom || ""} onChange={ev => setField("resendFrom", ev.target.value)} placeholder="noreply@yourdomain.com" />
          </Field>
        </div>
      </>}
    </div>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: CL.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{uiText("Email signature")}</div>
      <textarea value={form.emailSignature || ""} onChange={ev => setField("emailSignature", ev.target.value)} placeholder={uiText("Your email signature...")} style={{ ...inputSt, minHeight: 80, resize: "vertical" }} />
    </div>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: CL.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{uiText("Email alerts")}</div>
      <div className="grid-2">
        {[
          ["notifLateEmployees", "Late employees"],
          ["notifNewInvoices", "New invoices"],
          ["notifOverdueInvoices", "Overdue invoices"],
          ["notifLowStock", "Low stock"],
          ["notifPushEnabled", "Push notifications (future)"],
        ].map(([key, label]) => <label key={key} style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={!!form[key]} onChange={ev => setField(key, ev.target.checked)} />{uiText(label)}</label>)}
      </div>
    </div>
    <button style={btnPri} onClick={persistSettings}>{ICN.check} {uiText("Save changes")}</button>
  </div>}

  {activeTab === "security" && <div style={{ marginTop: 14 }}>
    <div style={{ ...cardSt, marginBottom: 14 }}>
      <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Account credentials")}</h3>
      <div className="grid-2">
        <Field label="Owner username"><TextInput value={ownerUsername} onChange={ev => setOwnerUsername(ev.target.value)} /></Field>
        <Field label="Owner PIN"><TextInput maxLength={24} value={ownerPin} onChange={ev => setOwnerPin(ev.target.value)} /></Field>
        <Field label="Manager username"><TextInput value={managerUsername} onChange={ev => setManagerUsername(ev.target.value)} /></Field>
        <Field label="Manager PIN"><TextInput maxLength={24} value={managerPin} onChange={ev => setManagerPin(ev.target.value)} /></Field>
      </div>
      <button style={{ ...btnPri, marginTop: 4 }} onClick={persistSettings}>{ICN.check} {uiText("Save credentials")}</button>
    </div>
    <PasswordResetTab data={data} showToast={showToast} ownerUsername={ownerUsername} managerUsername={managerUsername} />
  </div>}

  {activeTab === "system" && <div style={{ ...cardSt, marginTop: 14 }}>
    <h3 style={{ color: CL.gold, marginTop: 0 }}>{uiText("Display & locale")}</h3>
    <div className="grid-2">
      <Field label="Default language"><SelectInput value={form.defaultLanguage || "FR"} onChange={ev => setField("defaultLanguage", ev.target.value)}><option value="FR">FR</option><option value="EN">EN</option></SelectInput></Field>
      <Field label="Date format"><SelectInput value={form.dateFormat || "DD/MM/YYYY"} onChange={ev => setField("dateFormat", ev.target.value)}><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option></SelectInput></Field>
      <Field label="Time format"><SelectInput value={form.timeFormat || "24h"} onChange={ev => setField("timeFormat", ev.target.value)}><option value="24h">24h</option><option value="12h">12h</option></SelectInput></Field>
      <Field label="Theme"><SelectInput value={form.theme || "dark"} onChange={ev => setField("theme", ev.target.value)}><option value="dark">{uiText("Dark")}</option><option value="light">{uiText("Light")}</option></SelectInput></Field>
    </div>
    <button style={btnPri} onClick={persistSettings}>{ICN.check} {uiText("Save changes")}</button>
  </div>}

  {activeTab === "danger" && auth?.role === "owner" && <div style={{ ...cardSt, marginTop: 14, border: `1px solid ${CL.red}`, background: `${CL.red}08` }}>
    <h3 style={{ color: CL.red, marginTop: 0 }}>{uiText("Owner only danger zone")}</h3>
    <p style={{ color: CL.muted, fontSize: 13, marginTop: 0 }}>{uiText("Permanently delete all business data from the app and database.")}</p>
    <button style={{ ...btnDng, opacity: isWipingData ? 0.7 : 1 }} onClick={wipeAllData} disabled={isWipingData}>
      {isWipingData ? uiText("Wiping data...") : uiText("Wipe all data")}
    </button>
  </div>}
</div>
);
}

// ==============================================
// DOWNLOAD APP PAGE
// ==============================================
function DownloadAppPage({ onInstallApp }) {
  const { t } = useI18n();
  return (
    <div>
      <h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 8 }}>{t("downloadApp")}</h1>
      <p style={{ color: CL.muted, marginBottom: 12 }}>{t("installIntro")}</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button style={{ ...btnPri, background: CL.gold }} onClick={() => onInstallApp("ios")}>{ICN.download} {t("installOnIphone")}</button>
        <button style={{ ...btnPri, background: CL.green }} onClick={() => onInstallApp("android")}>{ICN.download} {t("installOnAndroid")}</button>
      </div>
      <div style={{ ...cardSt, maxWidth: 760 }}>
        <p style={{ margin: "0 0 8px", color: CL.text }}>{t("installAndroidFallback")}</p>
        <p style={{ margin: 0, color: CL.text }}>{t("installIosHint")}</p>
      </div>
    </div>
  );
}

// ==============================================
// EXPENSES PAGE
// ==============================================
function ExpensesPage({ data, updateData, showToast }) {
  const [viewMonth, setViewMonth] = useState(() => getToday().slice(0, 7));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [showPayModal, setShowPayModal] = useState(null);
  const [viewReceipt, setViewReceipt] = useState(null);

  const expenses = data.expenses || [];
  const activeExpenses = expenses.filter(e => e.isActive !== false);

  const prevMonth = () => {
    const [y, m] = viewMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const nextMonth = () => {
    const [y, m] = viewMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const todayStr = getToday();
  const todayDay = new Date().getDate();
  const isCurrentMonth = viewMonth === todayStr.slice(0, 7);

  const getPayment = (expense) => (expense.payments || []).find(p => p.month === viewMonth);
  const isPaid = (expense) => !!getPayment(expense);
  const isOverdue = (expense) => isCurrentMonth && !isPaid(expense) && expense.dueDay < todayDay;
  const isDueToday = (expense) => isCurrentMonth && !isPaid(expense) && expense.dueDay === todayDay;
  const isDueSoon = (expense) => isCurrentMonth && !isPaid(expense) && expense.dueDay > todayDay && expense.dueDay <= todayDay + 3;

  const totalMonthly = activeExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const paidTotal = activeExpenses.filter(e => isPaid(e)).reduce((s, e) => {
    const pay = getPayment(e);
    return s + (pay?.amount || e.amount || 0);
  }, 0);
  const outstanding = totalMonthly - paidTotal;
  const overdueCount = activeExpenses.filter(e => isOverdue(e)).length;
  const paidCount = activeExpenses.filter(e => isPaid(e)).length;

  const getStatusColor = (exp) => {
    if (isPaid(exp)) return CL.green;
    if (isOverdue(exp)) return CL.red;
    if (isDueToday(exp)) return CL.orange;
    if (isDueSoon(exp)) return CL.goldLight;
    return CL.muted;
  };
  const getStatusLabel = (exp) => {
    if (isPaid(exp)) return uiText("Paid");
    if (isOverdue(exp)) return uiText("Overdue");
    if (isDueToday(exp)) return uiText("Due Today");
    if (isDueSoon(exp)) return uiText("Due Soon");
    return uiText("Pending");
  };

  const deleteExpense = async (id) => {
    if (!confirm(uiText("Delete this expense? All payment history will be lost."))) return;
    try {
      const response = await fetch(apiUrl(`/api/expenses/${id}`), { method: "DELETE" });
      await ensureApiOk(response, "Failed to delete expense");
    } catch (err) { showToast("Failed to delete expense from database", "error"); return; }
    updateData("expenses", prev => (prev || []).filter(e => e.id !== id));
    showToast(uiText("Expense deleted"), "success");
  };

  const markUnpaid = async (expense) => {
    const updated = { ...expense, payments: (expense.payments || []).filter(p => p.month !== viewMonth) };
    try {
      const response = await fetch(apiUrl(`/api/expenses/${expense.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      await ensureApiOk(response, "Failed to update expense");
    } catch (err) { showToast("Failed to update expense in database", "error"); return; }
    updateData("expenses", prev => (prev || []).map(e => e.id === expense.id ? updated : e));
    showToast(uiText("Marked as unpaid"), "success");
  };

  const fmtMonthLabel = (m) => {
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1, 1)
      .toLocaleDateString(localeForLang(CURRENT_LANG), { month: "long", year: "numeric" });
  };

  const CATEGORIES = ["Rent", "Utilities", "Insurance", "Software / Subscriptions", "Supplies", "Salaries", "Taxes", "Marketing", "Transport", "Other"];
  const PAYMENT_METHODS = ["Bank Transfer", "Direct Debit", "Credit Card", "Cash", "Standing Order"];

  const CATEGORY_COLORS = {
    "Rent": CL.gold, "Utilities": CL.blue, "Insurance": CL.green,
    "Software / Subscriptions": "#9B6EF3", "Supplies": CL.orange,
    "Salaries": "#F06292", "Taxes": CL.red, "Marketing": "#26C6DA",
    "Transport": "#66BB6A", "Other": CL.muted,
  };

  const getExpenseScheduleLabel = (expense) => {
    const freq = expense.frequency || "monthly";
    const start = expense.startDate ? fmtDate(expense.startDate) : null;
    const end = expense.endDate ? fmtDate(expense.endDate) : null;
    const freqLabel = uiText(
      freq === "weekly" ? "Weekly" :
      freq === "biweekly" ? "Every 2 weeks" :
      freq === "quarterly" ? "Quarterly" :
      freq === "yearly" ? "Yearly" : "Monthly"
    );
    if (start && end) return `${freqLabel} · ${start} → ${end}`;
    if (start) return `${freqLabel} · ${uiText("from")} ${start}`;
    return `${freqLabel} · ${uiText("Day")} ${expense.dueDay || 1}`;
  };

  const sortedExpenses = [...activeExpenses].sort((a, b) => {
    const aUrgent = (isOverdue(a) || isDueToday(a)) ? 0 : isDueSoon(a) ? 1 : isPaid(a) ? 3 : 2;
    const bUrgent = (isOverdue(b) || isDueToday(b)) ? 0 : isDueSoon(b) ? 1 : isPaid(b) ? 3 : 2;
    return aUrgent - bUrgent || a.dueDay - b.dueDay;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            {ICN.wallet} {uiText("Expenses")}
          </h1>
          <p style={{ color: CL.muted, fontSize: 13 }}>{uiText("Track and manage your monthly business expenses")}</p>
        </div>
        <button style={btnPri} onClick={() => { setEditExpense(null); setShowAddModal(true); }}>
          {ICN.plus} {uiText("Add Expense")}
        </button>
      </div>

      {/* Month Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button style={{ ...btnSec, ...btnSm, padding: "7px 14px", fontSize: 18, lineHeight: 1 }} onClick={prevMonth}>‹</button>
        <div style={{ fontSize: 16, fontWeight: 600, color: CL.text, minWidth: 180, textAlign: "center", fontFamily: "'Cormorant Garamond', serif" }}>{fmtMonthLabel(viewMonth)}</div>
        <button style={{ ...btnSec, ...btnSm, padding: "7px 14px", fontSize: 18, lineHeight: 1 }} onClick={nextMonth}>›</button>
        {!isCurrentMonth && (
          <button style={{ ...btnSec, ...btnSm }} onClick={() => setViewMonth(getToday().slice(0, 7))}>
            {uiText("Current Month")}
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="stat-row" style={{ marginBottom: 20 }}>
        <StatCard label={uiText("Monthly Budget")} value={`€${totalMonthly.toFixed(2)}`} icon={ICN.wallet} color={CL.gold} />
        <StatCard label={uiText("Paid This Month")} value={`€${paidTotal.toFixed(2)}`} icon={ICN.check} color={CL.green} />
        <StatCard label={uiText("Outstanding")} value={`€${Math.max(0, outstanding).toFixed(2)}`} icon={ICN.pay} color={outstanding > 0 ? CL.orange : CL.green} />
        <StatCard label={uiText("Expenses")} value={`${paidCount}/${activeExpenses.length} ${uiText("paid")}`} icon={ICN.receipt} color={CL.blue} />
      </div>

      {/* Progress Bar */}
      {totalMonthly > 0 && (
        <div style={{ ...cardSt, marginBottom: 18, padding: "16px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: CL.muted, fontWeight: 500 }}>{uiText("Payment Progress")} — {fmtMonthLabel(viewMonth)}</span>
            <span style={{ color: CL.text, fontWeight: 700 }}>{paidCount}/{activeExpenses.length} {uiText("paid")} · {totalMonthly > 0 ? Math.round((paidTotal / totalMonthly) * 100) : 0}%</span>
          </div>
          <div style={{ height: 10, background: CL.bd, borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, totalMonthly > 0 ? (paidTotal / totalMonthly) * 100 : 0)}%`, background: paidTotal >= totalMonthly ? CL.green : CL.gold, borderRadius: 5, transition: "width .4s ease" }} />
          </div>
          {overdueCount > 0 && isCurrentMonth && (
            <div style={{ marginTop: 8, fontSize: 12, color: CL.red, fontWeight: 600 }}>
              ⚠️ {overdueCount} {uiText(overdueCount > 1 ? "expenses are overdue" : "expense is overdue")} — {uiText("action required")}
            </div>
          )}
        </div>
      )}

      {/* Urgent Alerts Banner */}
      {isCurrentMonth && (overdueCount > 0 || activeExpenses.some(e => isDueToday(e)) || activeExpenses.some(e => isDueSoon(e))) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {activeExpenses.filter(e => isOverdue(e)).map(e => (
            <div key={e.id} style={{ background: CL.red + "20", border: `1px solid ${CL.red}50`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: CL.red, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 900 }}>!</span>
              {e.name} · €{(e.amount || 0).toFixed(2)} · {uiText("overdue since day")} {e.dueDay}
            </div>
          ))}
          {activeExpenses.filter(e => isDueToday(e)).map(e => (
            <div key={e.id} style={{ background: CL.orange + "20", border: `1px solid ${CL.orange}50`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: CL.orange, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 900 }}>!</span>
              {e.name} · €{(e.amount || 0).toFixed(2)} · {uiText("due today")}
            </div>
          ))}
          {activeExpenses.filter(e => isDueSoon(e)).map(e => (
            <div key={e.id} style={{ background: CL.gold + "15", border: `1px solid ${CL.gold}40`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: CL.goldLight, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              📅 {e.name} · €{(e.amount || 0).toFixed(2)} · {uiText("due in")} {e.dueDay - todayDay} {uiText(e.dueDay - todayDay === 1 ? "day" : "days")}
            </div>
          ))}
        </div>
      )}

      {/* Expenses Table */}
      <div style={cardSt}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: CL.gold, fontFamily: "'Cormorant Garamond', serif" }}>
            {uiText("Expense List")} <span style={{ color: CL.muted, fontWeight: 400, fontSize: 13 }}>({activeExpenses.length})</span>
          </h3>
          <div style={{ fontSize: 11, color: CL.dim }}>{uiText("Sorted by urgency · overdue first")}</div>
        </div>

        {activeExpenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: CL.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{uiText("No expenses defined yet")}</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>{uiText("Add your monthly expenses — rent, utilities, subscriptions — to track payments.")}</div>
            <button style={btnPri} onClick={() => setShowAddModal(true)}>{ICN.plus} {uiText("Add First Expense")}</button>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thSt}>{uiText("Expense")}</th>
                  <th style={thSt}>{uiText("Category")}</th>
                  <th style={thSt}>{uiText("Amount")}</th>
                  <th style={thSt}>{uiText("Frequency / Dates")}</th>
                  <th style={thSt}>{uiText("Status")}</th>
                  <th style={thSt}>{uiText("Receipt")}</th>
                  <th style={thSt}>{uiText("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map(exp => {
                  const payment = getPayment(exp);
                  const paid = !!payment;
                  const overdue = isOverdue(exp);
                  const dueToday = isDueToday(exp);
                  const dueSoon = isDueSoon(exp);
                  const catColor = CATEGORY_COLORS[exp.category] || CL.muted;
                  const rowBg = overdue ? CL.red + "08" : dueToday ? CL.orange + "08" : "transparent";
                  return (
                    <tr key={exp.id} style={{ background: rowBg }}>
                      <td style={tdSt}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{exp.name}</div>
                        {exp.paymentMethod && <div style={{ fontSize: 11, color: CL.muted, marginTop: 1 }}>🏦 {exp.paymentMethod}</div>}
                        {exp.notes && <div style={{ fontSize: 11, color: CL.dim, marginTop: 1, fontStyle: "italic" }}>{exp.notes}</div>}
                      </td>
                      <td style={tdSt}><Badge color={catColor}>{exp.category || "Other"}</Badge></td>
                      <td style={{ ...tdSt, fontWeight: 700, fontSize: 16, color: CL.text }}>€{(exp.amount || 0).toFixed(2)}</td>
                      <td style={tdSt}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{getExpenseScheduleLabel(exp)}</div>
                        {payment?.paidDate && <div style={{ fontSize: 11, color: CL.green, marginTop: 1 }}>✓ {fmtDate(payment.paidDate)}</div>}
                        {payment?.amount && payment.amount !== exp.amount && <div style={{ fontSize: 11, color: CL.muted }}>€{payment.amount.toFixed(2)} {uiText("paid")}</div>}
                      </td>
                      <td style={tdSt}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Badge color={getStatusColor(exp)}>{getStatusLabel(exp)}</Badge>
                          {(overdue || dueToday) && !paid && (
                            <span style={{ color: CL.red, fontWeight: 900, fontSize: 16, marginLeft: 2 }}>!</span>
                          )}
                        </div>
                      </td>
                      <td style={tdSt}>
                        {payment?.receipt ? (
                          <button style={{ ...btnSec, ...btnSm, color: CL.green, borderColor: CL.green + "50" }} onClick={() => setViewReceipt(payment.receipt)}>
                            📎 {uiText("View")}
                          </button>
                        ) : (
                          <span style={{ color: CL.dim, fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={tdSt}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {!paid ? (
                            <button style={{ ...btnPri, ...btnSm, background: overdue || dueToday ? CL.orange : CL.gold }} onClick={() => setShowPayModal(exp)}>
                              {ICN.check} {uiText("Pay")}
                            </button>
                          ) : (
                            <button style={{ ...btnSec, ...btnSm, fontSize: 12 }} onClick={() => markUnpaid(exp)}>
                              ↩ {uiText("Undo")}
                            </button>
                          )}
                          <button style={{ ...btnSec, ...btnSm }} onClick={() => { setEditExpense(exp); setShowAddModal(true); }} title={uiText("Edit")}>
                            {ICN.edit}
                          </button>
                          <button style={{ ...btnDng, ...btnSm }} onClick={() => deleteExpense(exp.id)} title={uiText("Delete")}>
                            {ICN.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: CL.s2 }}>
                  <td colSpan={2} style={{ ...tdSt, fontWeight: 700, color: CL.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", border: "none" }}>{uiText("MONTHLY TOTAL")}</td>
                  <td style={{ ...tdSt, fontWeight: 800, fontSize: 17, color: CL.gold, border: "none" }}>€{totalMonthly.toFixed(2)}</td>
                  <td colSpan={4} style={{ ...tdSt, fontSize: 13, border: "none" }}>
                    <span style={{ color: CL.green, fontWeight: 700 }}>€{paidTotal.toFixed(2)} {uiText("paid")}</span>
                    <span style={{ color: CL.muted, margin: "0 8px" }}>·</span>
                    <span style={{ color: outstanding > 0 ? CL.orange : CL.green, fontWeight: 700 }}>€{Math.max(0, outstanding).toFixed(2)} {uiText("remaining")}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Inactive expenses section */}
      {expenses.filter(e => e.isActive === false).length > 0 && (
        <div style={{ ...cardSt, marginTop: 14, opacity: 0.7 }}>
          <h4 style={{ fontSize: 13, color: CL.muted, marginBottom: 10 }}>{uiText("Inactive Expenses")} ({expenses.filter(e => e.isActive === false).length})</h4>
          {expenses.filter(e => e.isActive === false).map(exp => (
            <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${CL.bd}` }}>
              <div style={{ fontSize: 13, color: CL.dim }}>{exp.name} · €{(exp.amount || 0).toFixed(2)}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ ...btnSec, ...btnSm, fontSize: 11 }} onClick={() => { setEditExpense(exp); setShowAddModal(true); }}>{uiText("Edit / Reactivate")}</button>
                <button style={{ ...btnDng, ...btnSm }} onClick={() => deleteExpense(exp.id)}>{ICN.trash}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ExpenseFormModal
          expense={editExpense}
          categories={CATEGORIES}
          paymentMethods={PAYMENT_METHODS}
          categoryColors={CATEGORY_COLORS}
          onSave={async (exp) => {
            if (editExpense) {
              try {
                const response = await fetch(apiUrl(`/api/expenses/${exp.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(exp) });
                await ensureApiOk(response, "Failed to update expense");
              } catch (err) { showToast("Failed to import expense update to database", "error"); return; }
              updateData("expenses", prev => (prev || []).map(e => e.id === exp.id ? exp : e));
              showToast(uiText("Expense updated"), "success");
            } else {
              try {
                const response = await fetch(apiUrl("/api/expenses"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(exp) });
                await ensureApiOk(response, "Failed to create expense");
              } catch (err) { showToast("Failed to import expense to database", "error"); return; }
              updateData("expenses", prev => [...(prev || []), exp]);
              showToast(uiText("Expense added"), "success");
            }
            setShowAddModal(false);
            setEditExpense(null);
          }}
          onClose={() => { setShowAddModal(false); setEditExpense(null); }}
        />
      )}

      {/* Mark Paid Modal */}
      {showPayModal && (
        <MarkPaidModal
          expense={showPayModal}
          viewMonth={viewMonth}
          onSave={async (payment) => {
            const exp = (data.expenses || []).find(e => e.id === showPayModal.id);
            if (exp) {
              const updated = { ...exp, payments: [...(exp.payments || []).filter(p => p.month !== viewMonth), payment] };
              try {
                const response = await fetch(apiUrl(`/api/expenses/${exp.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
                await ensureApiOk(response, "Failed to update expense payment");
              } catch (err) { showToast("Failed to sync imported expense to database", "error"); return; }
            }
            updateData("expenses", prev => (prev || []).map(e =>
              e.id === showPayModal.id
                ? { ...e, payments: [...(e.payments || []).filter(p => p.month !== viewMonth), payment] }
                : e
            ));
            showToast(uiText("Payment recorded ✓"), "success");
            setShowPayModal(null);
          }}
          onClose={() => setShowPayModal(null)}
        />
      )}

      {/* View Receipt Modal */}
      {viewReceipt && (
        <ModalBox title="Receipt" onClose={() => setViewReceipt(null)}>
          <div style={{ textAlign: "center" }}>
            {viewReceipt.type?.startsWith("image") ? (
              <img src={viewReceipt.data} alt="receipt" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12 }} />
            ) : (
              <div style={{ padding: "30px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div style={{ color: CL.text, marginBottom: 16, fontSize: 14 }}>{viewReceipt.name}</div>
                <a href={viewReceipt.data} download={viewReceipt.name} style={{ ...btnPri, textDecoration: "none" }}>
                  {ICN.download} {uiText("Download File")}
                </a>
              </div>
            )}
            <div style={{ color: CL.muted, fontSize: 12, marginTop: 8 }}>{viewReceipt.name}</div>
          </div>
        </ModalBox>
      )}
    </div>
  );
}

function ExpenseFormModal({ expense, categories, paymentMethods, categoryColors, onSave, onClose }) {
  const [name, setName] = useState(expense?.name || "");
  const [category, setCategory] = useState(expense?.category || "Other");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [frequency, setFrequency] = useState(expense?.frequency || "monthly");
  const [startDate, setStartDate] = useState(
    expense?.startDate
      || `${getToday().slice(0, 8)}${String(Number(expense?.dueDay) || 1).padStart(2, "0")}`
  );
  const [endDate, setEndDate] = useState(expense?.endDate || "");
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod || "Bank Transfer");
  const [notes, setNotes] = useState(expense?.notes || "");
  const [isActive, setIsActive] = useState(expense?.isActive !== false);

  const handleSave = () => {
    if (!name.trim()) { alert(uiText("Expense name is required")); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { alert(uiText("Please enter a valid amount greater than 0")); return; }
    if (!startDate) { alert(uiText("Please choose a start date")); return; }
    if (endDate && endDate < startDate) { alert(uiText("End date must be after start date")); return; }
    const day = Number(startDate.slice(8, 10)) || Number(expense?.dueDay) || 1;
    onSave({
      id: expense?.id || makeId(),
      name: name.trim(),
      category,
      amount: amt,
      dueDay: day,
      frequency,
      startDate,
      endDate: endDate || "",
      paymentMethod,
      notes: notes.trim(),
      isActive,
      payments: expense?.payments || [],
      createdAt: expense?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <ModalBox title={expense ? "Edit Expense" : "Add Expense"} onClose={onClose}>
      <div>
        <div className="form-grid">
          <Field label="Expense Name *">
            <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Office Rent, Internet, Insurance" />
          </Field>
          <Field label="Category">
            <SelectInput value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </SelectInput>
          </Field>
          <Field label="Monthly Amount (€) *">
            <TextInput type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" />
          </Field>
          <Field label="Frequency *">
            <SelectInput value={frequency} onChange={e => setFrequency(e.target.value)}>
              <option value="monthly">{uiText("Monthly")}</option>
              <option value="weekly">{uiText("Weekly")}</option>
              <option value="biweekly">{uiText("Every 2 weeks")}</option>
              <option value="quarterly">{uiText("Quarterly")}</option>
              <option value="yearly">{uiText("Yearly")}</option>
            </SelectInput>
          </Field>
          <Field label="Start Date *">
            <TextInput type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </Field>
          <Field label="End Date (optional)">
            <TextInput type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || undefined} />
          </Field>
          <Field label="Payment Method">
            <SelectInput value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </SelectInput>
          </Field>
          <Field label="Status">
            <div style={{ display: "flex", alignItems: "center", height: 46, gap: 10 }}>
              <input type="checkbox" id="exp-active-chk" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: CL.gold }} />
              <label htmlFor="exp-active-chk" style={{ color: CL.text, fontSize: 14, cursor: "pointer" }}>
                {uiText("Active")} — {uiText("include in monthly budget & reminders")}
              </label>
            </div>
          </Field>
        </div>
        <Field label="Notes / Reference">
          <TextArea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Vendor name, contract reference, account number..." />
        </Field>
        {category && (
          <div style={{ ...cardSt, background: CL.s2, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <Badge color={categoryColors[category] || CL.muted}>{category}</Badge>
            {amount && !isNaN(parseFloat(amount)) && (
              <span style={{ color: CL.muted, fontSize: 13 }}>
                <strong style={{ color: CL.gold }}>{uiText(
                  frequency === "weekly" ? "Weekly" :
                  frequency === "biweekly" ? "Every 2 weeks" :
                  frequency === "quarterly" ? "Quarterly" :
                  frequency === "yearly" ? "Yearly" : "Monthly"
                )}</strong>
                {startDate ? <> · {uiText("from")} <strong style={{ color: CL.gold }}>{fmtDate(startDate)}</strong></> : null}
                {endDate ? <> → <strong style={{ color: CL.gold }}>{fmtDate(endDate)}</strong></> : null}
                {" · "}
                <strong style={{ color: CL.gold }}>€{parseFloat(amount).toFixed(2)}</strong>/mo
              </span>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={btnSec} onClick={onClose}>{ICN.close} {uiText("Cancel")}</button>
          <button style={btnPri} onClick={handleSave}>{ICN.check} {uiText("Save Expense")}</button>
        </div>
      </div>
    </ModalBox>
  );
}

function MarkPaidModal({ expense, viewMonth, onSave, onClose }) {
  const [paidDate, setPaidDate] = useState(getToday());
  const [amount, setAmount] = useState(expense.amount?.toFixed(2) || "");
  const [notes, setNotes] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert(uiText("File is too large. Maximum size is 5MB.")); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReceipt({ name: file.name, data: ev.target.result, type: file.type });
      setUploading(false);
    };
    reader.onerror = () => { setUploading(false); alert(uiText("Failed to read file")); };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { alert(uiText("Please enter a valid amount")); return; }
    if (!paidDate) { alert(uiText("Please select a payment date")); return; }
    onSave({
      id: makeId(),
      month: viewMonth,
      paidDate,
      amount: amt,
      notes: notes.trim(),
      receipt: receipt || null,
    });
  };

  const [mo, yr] = [viewMonth.slice(5, 7), viewMonth.slice(0, 4)];
  const monthLabel = new Date(Number(yr), Number(mo) - 1, 1)
    .toLocaleDateString(localeForLang(CURRENT_LANG), { month: "long", year: "numeric" });

  return (
    <ModalBox title={`Record Payment · ${expense.name}`} onClose={onClose}>
      <div>
        {/* Expense summary card */}
        <div style={{ background: CL.s2, borderRadius: 12, padding: "16px 20px", marginBottom: 20, border: `1px solid ${CL.bd}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: CL.muted, marginBottom: 2 }}>{uiText("Expense")}</div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{expense.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: CL.muted, marginBottom: 2 }}>{uiText("Expected Amount")}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: CL.gold }}>€{(expense.amount || 0).toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: CL.muted, marginBottom: 2 }}>{uiText("Period")}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{monthLabel}</div>
            </div>
            <Badge color={CL.blue}>{expense.category}</Badge>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Payment Date *">
            <DatePicker value={paidDate} onChange={e => setPaidDate(e.target.value)} />
          </Field>
          <Field label="Amount Paid (€) *">
            <TextInput type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" />
          </Field>
        </div>

        <Field label="Reference / Notes">
          <TextArea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Transaction ID, bank reference, invoice number..." />
        </Field>

        <Field label="Receipt / Invoice (optional)">
          <div style={{ border: `2px dashed ${receipt ? CL.green : CL.bd}`, borderRadius: 10, padding: "20px", textAlign: "center", background: CL.s2, transition: "border-color .2s" }}>
            {receipt ? (
              <div>
                <div style={{ fontSize: 13, color: CL.green, marginBottom: 8, fontWeight: 600 }}>✓ {receipt.name}</div>
                {receipt.type?.startsWith("image") && (
                  <img src={receipt.data} alt="preview" style={{ maxHeight: 150, borderRadius: 8, marginBottom: 10, border: `1px solid ${CL.bd}` }} />
                )}
                <div>
                  <button style={{ ...btnSec, ...btnSm }} onClick={() => setReceipt(null)}>✕ {uiText("Remove")}</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📎</div>
                <div style={{ color: CL.muted, fontSize: 12, marginBottom: 12 }}>
                  {uiText("Attach receipt, invoice, or bank confirmation")}
                  <br />
                  <span style={{ color: CL.dim }}>JPG, PNG, PDF · max 5MB</span>
                </div>
                <label style={{ ...btnSec, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {uploading ? <span>⏳ {uiText("Loading...")}</span> : <><span>📁</span> {uiText("Choose File")}</>}
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} disabled={uploading} />
                </label>
              </div>
            )}
          </div>
        </Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <button style={btnSec} onClick={onClose}>{ICN.close} {uiText("Cancel")}</button>
          <button style={{ ...btnPri, background: CL.green }} onClick={handleSave}>{ICN.check} {uiText("Confirm Payment")}</button>
        </div>
      </div>
    </ModalBox>
  );
}
