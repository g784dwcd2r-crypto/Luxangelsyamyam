

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import ExcelJS from "exceljs";

/* ===========================================================
LUX ANGELS CLEANING - Management System v3 (Bug-free) 
=========================================================== */

// -- Persistence --
const STORE_KEY = "lux-angels-v3";
const LANG_KEY = "lux-angels-lang";
const THEME_KEY = "lux-angels-theme";
const loadStore = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } };
const saveStore = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {} };
const loadLang = () => {
try { return localStorage.getItem(LANG_KEY) || "fr"; } catch { return "fr"; }
};
const saveLang = (lang) => { try { localStorage.setItem(LANG_KEY, lang); } catch {} };
const loadTheme = () => { try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; } };
const saveTheme = (t) => { try { localStorage.setItem(THEME_KEY, t); } catch {} };

const I18N = {
fr: {
language: "Langue", french: "Français", english: "Anglais", login: "Connexion", welcome: "Bienvenue", selectRole: "Rôle", pin: "Code PIN", loginBtn: "Se connecter",
dashboard: "Tableau de bord", employees: "Employés", clients: "Clients", schedule: "Planning", timeclock: "Pointage", inventory: "Stock", devis: "Devis", invoices: "Factures", payslips: "Fiches de paie", expenses: "Dépenses", conges: "Congés", reminders: "Rappels", reports: "Rapports", database: "Base Excel", settings: "Paramètres",
newQuote: "Nouveau devis", editQuote: "Modifier devis", newInvoice: "Nouvelle facture", editInvoice: "Modifier facture", save: "Enregistrer", cancel: "Annuler", actions: "Actions", status: "Statut", client: "Client", date: "Date", amount: "Montant", view: "Voir", sendEmail: "Envoyer email", draft: "Brouillon", sent: "Envoyée", paid: "Payée", overdue: "En retard", auto: "Auto", select: "Sélectionner...", prestationDate: "Date de prestation",
invoice: "Facture", quote: "Devis", dueDate: "Date échéance", notes: "Notes", total: "Total", subtotal: "Sous-total", vat: "TVA", item: "Ligne", qty: "Qté", unitPrice: "Prix unitaire", description: "Description",
managementSystem: "Système de gestion", ownerAccess: "Accès propriétaire", ownerAccessDesc: "Tableau de gestion complet", cleanerAccess: "Accès agent", cleanerAccessDesc: "Planning, heures, pointage et congés",
back: "Retour", ownerLogin: "Connexion propriétaire", cleanerLogin: "Connexion agent", yourName: "Votre nom", choose: "Choisir...", logout: "Déconnexion", visitation: "Visites", history: "Historique", downloadApp: "Télécharger l'application", ownerPortal: "Portail propriétaire", managerPortal: "Portail manager", visitationSchedule: "Planning des visites", historyImages: "Historique & images", installIntro: "Installez cette app directement depuis votre navigateur (sans App Store / Play Store).", installOnIphone: "Installer sur iPhone", installOnAndroid: "Installer sur Android", installAndroidFallback: "Si rien ne se passe: menu ⋮ du navigateur > Installer l'application / Ajouter à l'écran d'accueil.", installIosHint: "Sur iPhone: bouton Partager (□↑) > Sur l'écran d'accueil.",
mySchedule: "Mon planning", clockInOut: "Pointage entrée/sortie", photoUploads: "Photos", products: "Produits", upcomingJobs: "Interventions à venir", noUpcomingJobs: "Aucune intervention à venir"
},
en: {
language: "Language", french: "French", english: "English", login: "Login", welcome: "Welcome", selectRole: "Role", pin: "PIN", loginBtn: "Sign in",
dashboard: "Dashboard", employees: "Employees", clients: "Clients", schedule: "Schedule", timeclock: "Time Clock", inventory: "Inventory", devis: "Quotes", invoices: "Invoices", payslips: "Payslips", expenses: "Expenses", conges: "Leave", reminders: "Reminders", reports: "Reports", database: "Excel DB", settings: "Settings",
newQuote: "New quote", editQuote: "Edit quote", newInvoice: "New invoice", editInvoice: "Edit invoice", save: "Save", cancel: "Cancel", actions: "Actions", status: "Status", client: "Client", date: "Date", amount: "Amount", view: "View", sendEmail: "Send email", draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", auto: "Auto", select: "Select...", prestationDate: "Service date",
invoice: "Invoice", quote: "Quote", dueDate: "Due date", notes: "Notes", total: "Total", subtotal: "Subtotal", vat: "VAT", item: "Item", qty: "Qty", unitPrice: "Unit price", description: "Description",
managementSystem: "Management System", ownerAccess: "Owner Access", ownerAccessDesc: "Full management dashboard", cleanerAccess: "Cleaner Access", cleanerAccessDesc: "Schedule, hours, clock & time-off",
back: "Back", ownerLogin: "Owner Login", cleanerLogin: "Cleaner Login", yourName: "Your Name", choose: "Choose...", logout: "Logout", visitation: "Visitation", history: "History", downloadApp: "Download App", ownerPortal: "Owner Portal", managerPortal: "Manager Portal", visitationSchedule: "Visitation Schedule", historyImages: "History & Images", installIntro: "Install this app directly from your browser (no App Store / Play Store needed).", installOnIphone: "Install on iPhone", installOnAndroid: "Install on Android", installAndroidFallback: "If nothing happens: browser menu ⋮ > Install app / Add to Home screen.", installIosHint: "On iPhone: Share button (□↑) > Add to Home Screen.",
mySchedule: "My Schedule", clockInOut: "Clock In/Out", photoUploads: "Photo Uploads", products: "Products", upcomingJobs: "Upcoming Jobs", noUpcomingJobs: "No upcoming jobs"
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
"Reminder opened via": "Rappel ouvert via",
"Select at least one client for campaign": "Sélectionnez au moins un client pour la campagne",
"Campaign opened for": "Campagne ouverte pour",
"client(s)": "client(s)",
"Operational reminders + business follow-up + marketing communication workflows.": "Rappels opérationnels + suivi commercial + workflows de communication marketing.",
"Recipient Selection": "Sélection des destinataires",
"Select all": "Tout sélectionner",
"Clear": "Effacer",
"Restrict reminders to selected clients only": "Limiter les rappels aux clients sélectionnés uniquement",
"All workflows": "Tous les workflows",
"Work reminders / upcoming shifts": "Rappels d'interventions / prestations à venir",
"Business follow-up": "Suivi commercial",
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
"Emergency": "Urgence",
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
"OTHER:": "AUTRES :",
"My Hours": "Mes heures",
"Days": "Jours",
"Clocked In": "Pointé",
"Clock In →": "Pointer →",
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
"Public Holidays": "Jours Fériés",
"Select public holidays that apply": "Sélectionnez les jours fériés applicables",
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
};

const uiText = (text) => {
if (CURRENT_LANG !== "fr") return text;
if (typeof text !== "string") return text;
return UI_FR[text] || text;
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
ownerUsername: "LuxAdmin", ownerPin: "LuxAngels@2025",
managerUsername: "manager", managerPin: "Manager@2025",
employeePins: {}, employeeUsernames: {},
settings: {
companyName: "Lux Angels Cleaning",
companyAddress: "12 Rue de la Liberté, L-1930 Luxembourg",
companyEmail: "info@luxangels.lu",
companyPhone: "+352 123 456",
vatNumber: "LU12345678",
bankIban: "LU12 3456 7890 1234 5678",
defaultVatRate: 17,
publicHolidays: [],
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
const normalizeCity = (value = "") => String(value || "").trim().toLowerCase();
const cityMatchLabel = (employee, client) => {
const empCity = normalizeCity(employee?.city);
const clientCity = normalizeCity(client?.city);
if (!employee || !client || !clientCity || !empCity) return "City check unavailable";
return empCity === clientCity ? "✅ Cleaner is in client city" : "⚠️ Cleaner is outside client city";
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
  ...(pin !== undefined ? { pin } : {}),
});

// Fire-and-forget API sync — errors are non-fatal (localStorage is primary store)
const syncEmployeeToApi = async (emp, pin, username) => {
  try {
    const payload = toApiEmployee(emp, pin, username);
    await fetch(apiUrl(`/api/employees/${emp.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // If PUT returns 404 the employee doesn't exist in the DB yet — create it
  } catch { /* non-fatal */ }
};

const createEmployeeInApi = async (emp, pin, username) => {
  try {
    const payload = toApiEmployee(emp, pin, username);
    await fetch(apiUrl("/api/employees"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch { /* non-fatal */ }
};

const syncEmployeePinToApi = async (id, pin) => {
  try {
    await fetch(apiUrl(`/api/employees/${id}/pin`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
  } catch { /* non-fatal */ }
};

const deleteEmployeeFromApi = async (id) => {
  try {
    await fetch(apiUrl(`/api/employees/${id}`), { method: "DELETE" });
  } catch { /* non-fatal */ }
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
const THEMES = {
dark: {
  bg: "#0C0F16", sf: "#151922", s2: "#1C2130", bd: "#2C3348",
  gold: "#D4A843", goldDark: "#B08C2F", goldLight: "#F0D78C",
  blue: "#4A9FD9", green: "#3EC47E", red: "#D95454", orange: "#E89840",
  text: "#E4E6ED", muted: "#838AA3", dim: "#525976", white: "#FFF",
},
light: {
  bg: "#F4F1EA", sf: "#FFFFFF", s2: "#EDE9DF", bd: "#D4C9B0",
  gold: "#B8860B", goldDark: "#8B6914", goldLight: "#D4A843",
  blue: "#1565C0", green: "#2E7D32", red: "#C62828", orange: "#E65100",
  text: "#1A1A1A", muted: "#5C5C5C", dim: "#888888", white: "#FFF",
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
wallet: <SvgIcon paths={<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></>} />,
receipt: <SvgIcon paths={<><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></>} />,
};

// -- UI Components --
const ModalBox = ({ title, onClose, children, wide }) => (

  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={onClose}>
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
const SelectInput = ({ children, ...props }) => <select {...props} style={{ ...inputSt, appearance: "auto", color: CL.text, colorScheme: "dark", ...(props.style || {}) }}>{children}</select>;
const TextArea = (props) => <textarea {...props} placeholder={uiText(props.placeholder)} style={{ ...inputSt, height: "auto", minHeight: 80, padding: "12px 16px", resize: "vertical", ...(props.style || {}) }} />;
const Badge = ({ children, color = CL.gold }) => <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: color + "20", color }}>{uiText(children)}</span>;
const StatCard = ({ label, value, icon, color = CL.gold }) => (

  <div style={{ ...cardSt, display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 160 }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
    <div><div style={{ fontSize: 12, color: CL.muted, marginBottom: 2 }}>{uiText(label)}</div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div></div>
  </div>
);
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
    onClick={() => { setOpen(o => !o); if (value) { const d = new Date(value + "T00:00:00"); setViewDate({ year: d.getFullYear(), month: d.getMonth() }); } }}
    style={{ ...inputSt, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
  >
    <span style={{ color: displayValue ? CL.text : CL.dim }}>{displayValue || (placeholder || (lang === "en" ? "Pick a date..." : "Choisir une date..."))}</span>
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={CL.muted} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  </div>
  {open && (
    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 3000, background: CL.sf, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: 12, width: 280, boxShadow: "0 8px 32px rgba(0,0,0,.35)" }}>
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

addSheet("Employees", data.employees.map(emp => ({ ID: emp.id, Name: emp.name, Username: data.employeeUsernames?.[emp.id] || "", Email: emp.email, Phone: emp.phone, Mobile: emp.phoneMobile || "", Role: emp.role, "Rate": emp.hourlyRate, Address: emp.address, City: emp.city || "", Zip: emp.postalCode || "", Country: emp.country || "", "Start": emp.startDate, Status: emp.status, Contract: emp.contractType || "", IBAN: emp.bankIban || "", SSN: emp.socialSecNumber || "", DOB: emp.dateOfBirth || "", Nationality: emp.nationality || "", Languages: emp.languages || "", Transport: emp.transport || "", "WorkPermit": emp.workPermit || "", "EmergName": emp.emergencyName || "", "EmergPhone": emp.emergencyPhone || "", Password: data.employeePins?.[emp.id] || "0000", LeaveAllowance: emp.leaveAllowance ?? 26, Group: emp.cleanerGroup || "", HiringStage: emp.hiringStage || "hired", Notes: emp.notes || "" })),
["ID","Name","Username","Email","Phone","Mobile","Role","Rate","Address","City","Zip","Country","Start","Status","Contract","IBAN","SSN","DOB","Nationality","Languages","Transport","WorkPermit","EmergName","EmergPhone","Password","LeaveAllowance","Group","HiringStage","Notes"]);

addSheet("Clients", data.clients.map(cl => ({ ID: cl.id, Name: cl.name, Contact: cl.contactPerson || "", Email: cl.email, Phone: cl.phone, Mobile: cl.phoneMobile || "", Address: cl.address, "Apt": cl.apartmentFloor || "", City: cl.city || "", Zip: cl.postalCode || "", Country: cl.country || "", Type: cl.type, Freq: cl.cleaningFrequency, Billing: cl.billingType, "Hourly": cl.pricePerHour || 0, "Fixed": cl.priceFixed || 0, Status: cl.status, Lang: cl.language || "", "Code": cl.accessCode || "", "KeyLoc": cl.keyLocation || "", Parking: cl.parkingInfo || "", Pets: cl.petInfo || "", "PrefDay": cl.preferredDay || "", "PrefTime": cl.preferredTime || "", "ContStart": cl.contractStart || "", "ContEnd": cl.contractEnd || "", "SqM": cl.squareMeters || "", "TaxID": cl.taxId || "", "Instructions": cl.specialInstructions || "", PreferredCleaners: (cl.preferredCleanerIds || []).join("|"), Notes: cl.notes || "" })),
["ID","Name","Contact","Email","Phone","Mobile","Address","Apt","City","Zip","Country","Type","Freq","Billing","Hourly","Fixed","Status","Lang","Code","KeyLoc","Parking","Pets","PrefDay","PrefTime","ContStart","ContEnd","SqM","TaxID","Instructions","PreferredCleaners","Notes"]);

addSheet("Schedule", data.schedules.map(sc => { const cl = data.clients.find(c => c.id === sc.clientId); const em = data.employees.find(e => e.id === sc.employeeId); return { ID: sc.id, Date: sc.date, Client: cl?.name || "", CliID: sc.clientId, Employee: em?.name || "", EmpID: sc.employeeId, Start: sc.startTime, End: sc.endTime, Status: sc.status, Notes: sc.notes || "" }; }),
["ID","Date","Client","CliID","Employee","EmpID","Start","End","Status","Notes"]);

addSheet("TimeClock", data.clockEntries.map(ce => { const em = data.employees.find(e => e.id === ce.employeeId); const cl = data.clients.find(c => c.id === ce.clientId); const h = calcHrs(ce.clockIn, ce.clockOut); return { ID: ce.id, Employee: em?.name || "", EmpID: ce.employeeId, Client: cl?.name || "", CliID: ce.clientId, In: ce.clockIn || "", Out: ce.clockOut || "", Hours: ce.clockOut ? h : "Active", Late: ce.isLate ? "yes" : "no", LateMins: ce.lateMinutes || 0, Note: ce.notes || "", Rate: em?.hourlyRate || 0, Cost: ce.clockOut ? Math.round(h * (em?.hourlyRate || 0) * 100) / 100 : "" }; }),
["ID","Employee","EmpID","Client","CliID","In","Out",uiText("Hours"),"Rate","Cost"]);

const invRows = [];
data.invoices.forEach(inv => { const cl = data.clients.find(c => c.id === inv.clientId); (inv.items || [{}]).forEach((item, idx) => { invRows.push({ "Inv": inv.invoiceNumber, Date: inv.date, Due: inv.dueDate || "", Client: cl?.name || "", CliID: inv.clientId, Status: inv.status, Item: item.description || "", Qty: item.quantity || "", Price: item.unitPrice || "", LineTotal: item.total || "", Sub: idx === 0 ? inv.subtotal : "", "VAT%": idx === 0 ? inv.vatRate : "", VAT: idx === 0 ? inv.vatAmount : "", Total: idx === 0 ? inv.total : "", Notes: idx === 0 ? (inv.notes || "") : "" }); }); });
addSheet("Invoices", invRows, ["Inv","Date","Due","Client","CliID","Status","Item","Qty","Price","LineTotal","Sub","VAT%","VAT","Total","Notes"]);

addSheet("Payslips", data.payslips.map(ps => { const em = data.employees.find(e => e.id === ps.employeeId); return { Num: ps.payslipNumber, Employee: em?.name || "", EmpID: ps.employeeId, Month: ps.month, Hours: ps.totalHours, Rate: ps.hourlyRate, Gross: ps.grossPay, Social: ps.socialCharges, Tax: ps.taxEstimate, Net: ps.netPay, Status: ps.status }; }),
["Num","Employee","EmpID","Month",uiText("Hours"),"Rate","Gross","Social","Tax","Net","Status"]);

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
}), ["Month", uiText("Hours"), "Labor", uiText("Revenue"), uiText("Profit")]);

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

  const emps = sheet("Employees").filter(r => r.ID && r.Name).map(r => ({ id: r.ID, name: r.Name, email: r.Email || "", phone: r.Phone || "", phoneMobile: r.Mobile || "", role: r.Role || "Cleaner", hourlyRate: parseFloat(r.Rate) || 15, address: r.Address || "", city: r.City || "", postalCode: r.Zip || "", country: r.Country || "Luxembourg", startDate: r.Start || getToday(), status: r.Status || "active", contractType: r.Contract || "CDI", bankIban: r.IBAN || "", socialSecNumber: r.SSN || "", dateOfBirth: r.DOB || "", nationality: r.Nationality || "", languages: r.Languages || "", transport: r.Transport || "", workPermit: r.WorkPermit || "", emergencyName: r.EmergName || "", emergencyPhone: r.EmergPhone || "", leaveAllowance: parseInt(r.LeaveAllowance || "26", 10) || 26, cleanerGroup: r.Group || "", hiringStage: r.HiringStage || "hired", notes: r.Notes || "" }));
  const pins = {}; sheet("Employees").filter(r => r.ID).forEach(r => { pins[r.ID] = String(r.Password || r.PIN || "0000"); });
  const employeeUsernames = {}; sheet("Employees").filter(r => r.ID && r.Username).forEach(r => { employeeUsernames[r.ID] = String(r.Username); });

  const clients = sheet("Clients").filter(r => r.ID && r.Name).map(r => ({ id: r.ID, name: r.Name, contactPerson: r.Contact || "", email: r.Email || "", phone: r.Phone || "", phoneMobile: r.Mobile || "", address: r.Address || "", apartmentFloor: r.Apt || "", city: r.City || "", postalCode: r.Zip || "", country: r.Country || "Luxembourg", type: r.Type || "Residential", cleaningFrequency: r.Freq || "Weekly", billingType: r.Billing || "hourly", pricePerHour: parseFloat(r.Hourly) || 35, priceFixed: parseFloat(r.Fixed) || 0, status: r.Status || "active", language: r.Lang || "FR", accessCode: r.Code || "", keyLocation: r.KeyLoc || "", parkingInfo: r.Parking || "", petInfo: r.Pets || "", preferredDay: r.PrefDay || "", preferredTime: r.PrefTime || "", contractStart: r.ContStart || "", contractEnd: r.ContEnd || "", squareMeters: r.SqM || "", taxId: r.TaxID || "", specialInstructions: r.Instructions || "", preferredCleanerIds: String(r.PreferredCleaners || "").split("|").map(v => v.trim()).filter(Boolean), notes: r.Notes || "" }));

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
  input[type="date"], input[type="time"], input[type="month"], input[type="datetime-local"] { color-scheme: ${INIT_THEME === "dark" ? "dark" : "light"}; }
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator,
  input[type="month"]::-webkit-calendar-picker-indicator,
  input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: ${INIT_THEME === "dark" ? "invert(0.95)" : "none"}; cursor: pointer; }
  input[type="date"], input[type="time"], input[type="month"], input[type="datetime-local"], input[type="number"], input[type="text"], input[type="email"], input[type="password"], input[type="tel"], select { height: 46px !important; padding: 0 16px !important; line-height: 46px; }
  textarea { padding: 12px 16px !important; height: auto !important; min-height: 80px; }
  @media print { .no-print { display: none !important; } }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: end; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-row { display: flex; gap: 16px; flex-wrap: wrap; }
.sched-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-layout { display: flex; gap: 22px; flex-wrap: wrap; }
.cal-main { flex: 1 1 600px; min-width: 0; }
.cal-side { flex: 0 0 280px; min-width: 240px; }
.tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.tbl-wrap table { min-width: 680px; }
.modal-normal { width: 820px; max-width: 96vw; max-height: 92vh; padding: 36px !important; }
.modal-wide { width: 1100px; max-width: 96vw; max-height: 92vh; padding: 42px !important; }
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
CURRENT_LANG = lang; // sync before any child render
useEffect(() => { saveLang(lang); }, [lang]);
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
const _expCurrentMonth = getToday().slice(0, 7);
const _expTodayDay = new Date().getDate();
const dueOrOverdueExpenses = (data.expenses || []).filter(exp => {
  if (exp.isActive === false) return false;
  const paid = (exp.payments || []).some(p => p.month === _expCurrentMonth);
  return !paid && exp.dueDay <= _expTodayDay;
}).length;

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
{ id: "expenses", label: t("expenses"), icon: ICN.wallet, hasAlert: dueOrOverdueExpenses > 0 },
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
case "expenses": return <ExpensesPage {...props} />;
case "conges": return <LeaveManagementPage {...props} />;
case "history": return <HistoryPage {...props} />;
case "reminders": return <RemindersPage data={data} showToast={showToast} />;
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
// LOGIN SCREEN
// ==============================================
function LoginScreen({ data, onAuth }) {
const { lang, t } = useI18n();
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);


const loginWithServer = async ({ user, pass }) => {
  if (!API_BASE_CANDIDATES.length) return { status: "unreachable" };
  // Keep login responsive while still handling Render cold starts.
  const REQUEST_TIMEOUT_MS = 8000;
  const WARMUP_TIMEOUT_MS = 10000;
  let reachedServer = false;

  const attempts = [
    { role: "owner", username: user, employeeId: user },
    { role: "manager", employeeId: user },
    { role: "cleaner", employeeId: user },
  ];

  const tryFetch = async (baseUrl, payload) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(apiUrl("/api/auth/pin-login", baseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, pin: pass }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  };

  const tryWarmup = async (baseUrl) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WARMUP_TIMEOUT_MS);
    try {
      const res = await fetch(apiUrl("/api/health/db", baseUrl), {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  };

  for (const baseUrl of API_BASE_CANDIDATES) {
    const isWarm = await tryWarmup(baseUrl);
    if (!isWarm) continue;

    for (const payload of attempts) {
      const res = await tryFetch(baseUrl, payload);
      if (!res) continue;

      reachedServer = true;
      if (!res.ok) continue;
      let body = null;
      try { body = await res.json(); } catch { continue; }

      if (body?.success && body?.role === "owner") {
        onAuth({ role: "owner" });
        return { status: "success" };
      }
      if (body?.success && body?.role === "manager") {
        onAuth({ role: "manager" });
        return { status: "success" };
      }
      if (body?.success && body?.role === "cleaner" && body?.employeeId) {
        onAuth({ role: "cleaner", employeeId: body.employeeId });
        return { status: "success" };
      }
    }
  }

  return { status: reachedServer ? "invalid" : "unreachable" };
};

const doLogin = async () => {
const rawUser = String(username || "").trim();
const pass = String(password || "").trim();
if (!rawUser || !pass) { setError(lang === "en" ? "Enter username and password" : "Saisissez identifiant et mot de passe"); return; }
setIsSubmitting(true);
setError("");

try {
  const serverLogin = await loginWithServer({ user: rawUser, pass });
  if (serverLogin.status === "success") return;

  if (serverLogin.status === "unreachable") {
    setError(lang === "en"
      ? "Server is starting up — please wait 30 seconds and try again."
      : "Le serveur démarre — attendez 30 secondes et réessayez.");
    return;
  }

  if (serverLogin.status === "invalid") {
    setError(lang === "en" ? "Incorrect username or password" : "Identifiant ou mot de passe incorrect");
    return;
  }
} catch {
  setError(lang === "en" ? "Connection error. Please try again." : "Erreur de connexion. Veuillez réessayer.");
} finally {
  setIsSubmitting(false);
}
};

return (
<div style={{ minHeight: "100vh", background: CL.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }}>
<style>{globalCSS}</style>
<div style={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}><LanguageSwitcher /></div>
<div style={{ animation: "fadeIn .5s ease", width: 420, maxWidth: "95vw", padding: "0 16px" }}>
<div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${CL.gold}, ${CL.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32, fontWeight: 700, color: CL.bg, fontFamily: "'Cormorant Garamond', serif" }}>LAC</div>

<div style={{ ...cardSt, textAlign: "left", padding: 24 }}>
  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.gold, fontSize: 22, marginBottom: 14 }}>Secure Sign-In</h3>
  <Field label="Username or email">
    <TextInput value={username} onChange={ev => { setUsername(ev.target.value); setError(""); }} placeholder="username or email" onKeyDown={ev => ev.key === "Enter" && doLogin()} />
  </Field>

  <Field label="Password">
    <TextInput type="password" maxLength={24} value={password} onChange={ev => { setPassword(ev.target.value); setError(""); }} placeholder="••••••" onKeyDown={ev => ev.key === "Enter" && doLogin()} />
  </Field>

  {error && <div style={{ color: CL.red, fontSize: 13, marginBottom: 10, textAlign: "center" }}>{error}</div>}
  <button disabled={isSubmitting} onClick={() => void doLogin()} style={{ ...btnPri, width: "100%", justifyContent: "center", background: CL.gold, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>{isSubmitting ? (lang === "en" ? "Connecting…" : "Connexion en cours…") : t("loginBtn")}</button>
  {isSubmitting && <p style={{ marginTop: 6, fontSize: 11, color: CL.muted, textAlign: "center" }}>{lang === "en" ? "Server may need a moment to wake up — please wait…" : "Le serveur démarre, merci de patienter…"}</p>}
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
if (!timeOffForm.startDate || !timeOffForm.endDate) { showToast(uiText("Select start and end dates"), "error"); return; }
if (timeOffForm.endDate < timeOffForm.startDate) { showToast(uiText("End date must be after start date"), "error"); return; }
const requestedDays = leaveDaysInclusive(timeOffForm.startDate, timeOffForm.endDate);
if (!requestedDays) { showToast(uiText("Invalid leave dates"), "error"); return; }
if (requestedDays > leaveSummary.remaining) { showToast(uiText("Request exceeds remaining leave balance"), "error"); return; }
updateData("timeOffRequests", (prev = []) => [...prev, {
id: makeId(), employeeId: auth.employeeId, ...timeOffForm,
requestedDays,
reason: timeOffForm.reason.trim(), status: "pending", createdAt: new Date().toISOString(),
reviewedAt: null, reviewedBy: null, reviewNote: "",
}]);
setTimeOffForm({ startDate: "", endDate: "", reason: "", leaveType: "conge" });
showToast(uiText("Leave request sent"));
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
{ id: "timeoff", label: t("conges"), icon: ICN.cal, hasAlert: hasPendingTimeOffRequest },
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
<Badge color={sched.date === getToday() ? CL.green : CL.blue}>{sched.date === getToday() ? uiText("Today") : fmtDate(sched.date)}</Badge>
<Badge color={scheduleStatusColor(sched.status)}>{uiText(sched.status)}</Badge>
</div>
</div>
);
})
}
</div>
)}

    {tab === "clock" && (
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22, marginBottom: 14 }}>{t("clockInOut")}</h2>
        {activeClock ? (
          <div style={{ ...cardSt, borderColor: CL.green, textAlign: "center", marginBottom: 18 }}>
            <div style={{ color: CL.green, marginBottom: 4 }}>{ICN.clock}</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: CL.green }}>{uiText("Clocked In")}</div>
            <div style={{ color: CL.muted }}>Since {fmtBoth(activeClock.clockIn)} at {data.clients.find(c => c.id === activeClock.clientId)?.name || "?"}</div>
            <button onClick={doClockOut} style={{ ...btnPri, background: CL.red, marginTop: 12 }}>{uiText("Clock Out Now")}</button>
          </div>
        ) : (
          <div style={cardSt}>
            <p style={{ color: CL.muted, marginBottom: 12 }}>{uiText("Select client to clock in:")}</p>
            <Field label={uiText("Clock-in note (optional)")}>
              <TextArea value={clockInNote} onChange={ev => setClockInNote(ev.target.value)} placeholder={uiText("Late reason, traffic, access issues...")} />
            </Field>
            {(() => {
              const todayJobs = data.schedules.filter(sc => sc.date === getToday() && sc.employeeId === auth.employeeId && sc.status !== "cancelled");
              const todayClientIds = todayJobs.map(sc => sc.clientId);
              const todayClients = data.clients.filter(c => todayClientIds.includes(c.id));
              const otherClients = data.clients.filter(c => c.status === "active" && !todayClientIds.includes(c.id));
              return (
                <>
                  {todayClients.length > 0 && <div style={{ fontSize: 11, color: CL.green, fontWeight: 600, marginBottom: 5 }}>{uiText("TODAY'S CLIENTS:")}</div>}
                  {todayClients.map(client => (
                    <button key={client.id} onClick={() => doClockIn(client.id)} style={{ ...cardSt, width: "100%", padding: "12px 16px", marginBottom: 5, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", borderColor: CL.green + "60" }}>
                      <div><div style={{ fontWeight: 600 }}>{client.name}</div><div style={{ fontSize: 11, color: CL.muted }}>{client.address} {client.address && <a href={mapsUrl(`${client.address} ${client.postalCode || ""} ${client.city || ""}`)} target="_blank" rel="noreferrer" onClick={ev => ev.stopPropagation()} style={{ color: CL.blue, marginLeft: 6, textDecoration: "underline" }}>{uiText("Map")}</a>}</div></div>
                      <span style={{ color: CL.green, fontWeight: 600, fontSize: 13 }}>{uiText("Clock In →")}</span>
                    </button>
                  ))}
                  {otherClients.length > 0 && <div style={{ fontSize: 11, color: CL.muted, fontWeight: 600, margin: "10px 0 5px" }}>{uiText("OTHER:")}</div>}
                  {otherClients.map(client => (
                    <button key={client.id} onClick={() => doClockIn(client.id)} style={{ ...cardSt, width: "100%", padding: "10px 16px", marginBottom: 5, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                      <div><div style={{ fontWeight: 600 }}>{client.name}</div><div style={{ fontSize: 11, color: CL.muted }}>{client.address} {client.address && <a href={mapsUrl(`${client.address} ${client.postalCode || ""} ${client.city || ""}`)} target="_blank" rel="noreferrer" onClick={ev => ev.stopPropagation()} style={{ color: CL.blue, marginLeft: 6, textDecoration: "underline" }}>{uiText("Map")}</a>}</div></div>
                      <span style={{ color: CL.blue, fontSize: 13 }}>{uiText("Clock In →")}</span>
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
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: CL.blue, fontSize: 22 }}>{uiText("My Hours")}</h2>
          <TextInput type="month" value={monthFilter} onChange={ev => setMonthFilter(ev.target.value)} style={{ width: 160 }} />
        </div>
        <div className="stat-row" style={{ marginBottom: 18 }}>
          <StatCard label={uiText("Hours")} value={`${monthHours.toFixed(1)}h`} icon={ICN.clock} color={CL.blue} />
          <StatCard label={uiText("Days")} value={monthClocks.length} icon={ICN.cal} color={CL.green} />
        </div>
        <div style={cardSt} className="tbl-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr><th style={thSt}>{uiText("Date")}</th><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("In")}</th><th style={thSt}>{uiText("Out")}</th><th style={thSt}>{uiText("Hours")}</th></tr></thead>
            <tbody>
              {monthClocks.map(clk => { const client = data.clients.find(c => c.id === clk.clientId); return (
                <tr key={clk.id}><td style={tdSt}>{fmtDate(clk.clockIn)}</td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{fmtTime(clk.clockIn)}</td><td style={tdSt}>{fmtTime(clk.clockOut)}</td><td style={{ ...tdSt, fontWeight: 600 }}>{calcHrs(clk.clockIn, clk.clockOut).toFixed(2)}h</td></tr>
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
          <p style={{ fontSize: 12, color: activeClock ? CL.green : CL.orange, marginBottom: 12 }}>
            {activeClock
              ? `Clocked in at ${data.clients.find(c => c.id === activeClock.clientId)?.name || "this job"}. Photos will be saved to this active job.`
              : "You must clock in before uploading job photos."}
          </p>
          <Field label={uiText("Photo type")}>
            <SelectInput value={uploadType} onChange={ev => setUploadType(ev.target.value)} disabled={!activeClock}>
              <option value="before">{uiText("Before")}</option>
              <option value="after">{uiText("After")}</option>
              <option value="issue">{uiText("Issue / Damage Proof")}</option>
            </SelectInput>
          </Field>
          <Field label={uiText("Upload cleaning photo")}>
            <TextInput type="file" accept="image/*" disabled={!activeClock} onChange={ev => onUploadPhoto(ev.target.files?.[0])} />
          </Field>
          <Field label={uiText("Optional note")}>
            <TextArea value={uploadNote} onChange={ev => setUploadNote(ev.target.value)} disabled={!activeClock} placeholder={uiText("Add context for this photo")} />
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
                <div style={{ fontSize: 12, color: CL.muted }}>Requested {fmtBoth(req.createdAt)}{req.deliveryAt ? ` · Delivery ${fmtBoth(req.deliveryAt)}` : ""}</div>
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
  </div>
</div>

);
}

// ==============================================
// DASHBOARD
// ==============================================
function DashboardPage({ data, auth }) {
const todayStr = getToday();
const next7Days = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
const todayScheds = data.schedules.filter(s => s.date === todayStr && s.status !== "cancelled");
const tomorrowStr = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const tomorrowScheds = data.schedules.filter(s => s.date === tomorrowStr && s.status !== "cancelled");
const activeClocks = data.clockEntries.filter(c => !c.clockOut);
const activeEmployees = data.employees.filter(e => e.status === "active").length;
const monthStr = todayStr.slice(0, 7);
const monthRev = data.invoices.filter(inv => inv.date?.startsWith(monthStr)).reduce((sum, inv) => sum + (inv.total || 0), 0);
const unpaidTotal = data.invoices.filter(inv => inv.status === "sent" || inv.status === "overdue").reduce((sum, inv) => sum + (inv.total || 0), 0);
const overdueInvoices = data.invoices.filter(inv => inv.status === "overdue");
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
<StatCard label={uiText("Clocked In")} value={activeClocks.length} icon={ICN.clock} color={CL.green} />
<StatCard label={uiText("Active Staff")} value={`${activeEmployees}/${data.employees.length}`} icon={ICN.team} color={CL.gold} />
{auth?.role !== "manager" && <StatCard label={uiText("Month Rev")} value={`€${monthRev.toFixed(0)}`} icon={ICN.chart} color={CL.goldLight} />}
{auth?.role !== "manager" && unpaidTotal > 0 && <StatCard label={uiText("Unpaid")} value={`€${unpaidTotal.toFixed(0)}`} icon={ICN.pay} color={CL.red} />}
</div>
<div className="grid-2">
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Today's Schedule")} ({todayScheds.length})</h3>
{todayScheds.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>{uiText("No jobs scheduled today")}</p> :
todayScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
const clockInfo = data.clockEntries.find(c => c.employeeId === sched.employeeId && c.clientId === sched.clientId && c.clockIn?.slice(0, 10) === sched.date);
return (
<div key={sched.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between", gap: 8 }}>
<div>
<div style={{ fontWeight: 600, fontSize: 13 }}>{client?.name || "Unassigned"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{employee?.name || "—"} · {sched.startTime}–{sched.endTime}</div>
{clockInfo?.isLate && <div style={{ fontSize: 11, color: CL.orange, fontWeight: 600 }}>Late by {clockInfo.lateMinutes || 0} min</div>}
</div>
<Badge color={scheduleStatusColor(sched.status)}>{sched.status}</Badge>
</div>
);
})
}
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Tomorrow")} ({tomorrowScheds.length})</h3>
{tomorrowScheds.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>{uiText("Nothing scheduled")}</p> :
tomorrowScheds.map(sched => {
const client = data.clients.find(c => c.id === sched.clientId);
const employee = data.employees.find(e => e.id === sched.employeeId);
return (
<div key={sched.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ fontWeight: 600, fontSize: 13 }}>{client?.name || "Unassigned"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>{employee?.name || "—"} · {sched.startTime}–{sched.endTime}</div>
</div>
);
})
}
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.green }}>{uiText("Active Clocks")} ({activeClocks.length})</h3>
{activeClocks.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>{uiText("No one clocked in right now")}</p> :
activeClocks.map(clk => {
const employee = data.employees.find(e => e.id === clk.employeeId);
const client = data.clients.find(c => c.id === clk.clientId);
const elapsed = Math.round((Date.now() - new Date(clk.clockIn)) / 60000);
return (
<div key={clk.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}` }}>
<div style={{ fontWeight: 600, fontSize: 13 }}>{employee?.name || "?"}</div>
<div style={{ fontSize: 11, color: CL.muted }}>At {client?.name || "?"} · since {fmtTime(clk.clockIn)}</div>
<div style={{ fontSize: 11, color: CL.green }}>{elapsed}m elapsed</div>
</div>
);
})
}
</div>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Next 7 Days")} ({next7Scheds.length})</h3>
{next7Scheds.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>{uiText("Nothing upcoming")}</p> :
next7Scheds.slice(0, 6).map(sched => {
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
})
}
{next7Scheds.length > 6 && <p style={{ fontSize: 11, color: CL.muted, marginTop: 6 }}>+{next7Scheds.length - 6} more</p>}
</div>
{auth?.role !== "manager" && <div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Recent Invoices")}</h3>
{data.invoices.length === 0 ? <p style={{ color: CL.muted, fontSize: 13 }}>{uiText("No invoices yet")}</p> : data.invoices.slice(-5).reverse().map(inv => {
const client = data.clients.find(c => c.id === inv.clientId);
return (
<div key={inv.id} style={{ padding: "7px 0", borderBottom: `1px solid ${CL.bd}`, display: "flex", justifyContent: "space-between" }}>
<div><div style={{ fontWeight: 600, fontSize: 13 }}>{inv.invoiceNumber}</div><div style={{ fontSize: 11, color: CL.muted }}>{client?.name}</div></div>
<div style={{ textAlign: "right" }}><div style={{ fontWeight: 600 }}>€{(inv.total || 0).toFixed(2)}</div><Badge color={inv.status === "paid" ? CL.green : inv.status === "overdue" ? CL.red : CL.muted}>{inv.status}</Badge></div>
</div>
);
})}
</div>}
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
role: "Cleaner", hourlyRate: 15, startDate: getToday(), status: "active", notes: "", bankIban: "", socialSecNumber: "",
pin: "0000", dateOfBirth: "", nationality: "", contractType: "CDI", workPermit: "", emergencyName: "", emergencyPhone: "",
username: "",
languages: "", transport: "", leaveAllowance: 26, cleanerGroup: "", hiringStage: "hired",
};

const handleSave = (empData) => {
const { pin: empPin, username: empUsername, ...empFields } = empData;
const pinValue = empPin || "0000";
if (empData.id) {
updateData("employees", prev => prev.map(e => e.id === empData.id ? empFields : e));
updateData("employeePins", prev => ({ ...prev, [empData.id]: pinValue }));
updateData("employeeUsernames", prev => ({ ...prev, [empData.id]: String(empUsername || "").trim().toLowerCase() }));
// Sync to backend so cleaner login works on all browsers/devices
syncEmployeeToApi(empFields, pinValue, String(empUsername || "").trim().toLowerCase());
syncEmployeePinToApi(empData.id, pinValue);
showToast("Employee updated");
} else {
const newId = makeId();
const newEmp = { ...empFields, id: newId };
updateData("employees", prev => [...prev, newEmp]);
updateData("employeePins", prev => ({ ...prev, [newId]: pinValue }));
updateData("employeeUsernames", prev => ({ ...prev, [newId]: String(empUsername || "").trim().toLowerCase() }));
// Create in backend so cleaner login works on all browsers/devices
createEmployeeInApi(newEmp, pinValue, String(empUsername || "").trim().toLowerCase());
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
// Remove from backend too
deleteEmployeeFromApi(id);
showToast("Deleted", "error");
setDeleteId(null);
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
  <option value="all">All Locations</option>
  {locationGroups.map(group => <option key={group} value={group}>{group}</option>)}
</SelectInput>
</div>
<div style={cardSt} className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead>
<tr><th style={thSt}>{uiText("Name")}</th><th style={thSt}>Location Group</th><th style={thSt}>{uiText("Role")}</th><th style={thSt}>{uiText("Rate")}</th><th style={thSt}>{uiText("Contact")}</th><th style={thSt}>Stage</th><th style={thSt}>Assigned Clients</th><th style={thSt}>{uiText("Username")}</th><th style={thSt}>{uiText("Password")}</th><th style={thSt}>{uiText("Status")}</th><th style={thSt}>{uiText("Actions")}</th></tr>
</thead>
<tbody>
{filtered.map(emp => (
<tr key={emp.id}>
<td style={tdSt}><div style={{ fontWeight: 600 }}>{emp.name}</div><div style={{ fontSize: 11, color: CL.muted }}>{emp.nationality ? `${emp.nationality} · ` : ""}{emp.languages || ""}</div></td>
<td style={tdSt}><div style={{ fontWeight: 600 }}>{emp.cleanerGroup || emp.city || "-"}</div><div style={{ fontSize: 11, color: CL.muted }}>{emp.city || "No city"}</div></td>
<td style={tdSt}>{emp.role}</td>
<td style={tdSt}>€{Number(emp.hourlyRate).toFixed(2)}/hr</td>
<td style={tdSt}><div style={{ fontSize: 12 }}>{emp.phone}</div><div style={{ fontSize: 11, color: CL.muted }}>{emp.email}</div></td>
<td style={tdSt}><Badge color={(emp.hiringStage || "hired") === "standby" ? CL.orange : CL.green}>{(emp.hiringStage || "hired") === "standby" ? "Standby" : "Hired"}</Badge></td>
<td style={tdSt}>{preferredCountByEmployee[emp.id] || 0}</td>
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
{ id: "basic", label: uiText("Basic Info") },
{ id: "personal", label: uiText("Personal") },
{ id: "work", label: uiText("Work & Pay") },
{ id: "operations", label: "Operations" },
{ id: "emergency", label: uiText("Emergency") },
];

return (
<div>
<FormTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

  {activeTab === "basic" && (
    <div className="form-grid">
      <Field label="Full Name *"><TextInput value={form.name} onChange={ev => set("name", ev.target.value)} /></Field>
      <Field label="Role">
        <SelectInput value={form.role} onChange={ev => set("role", ev.target.value)}>
          <option value="Cleaner">{uiText("Cleaner")}</option><option value="Senior Cleaner">{uiText("Senior Cleaner")}</option><option value="Team Lead">{uiText("Team Lead")}</option><option value="Supervisor">{uiText("Supervisor")}</option>
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
      <Field label="Date of Birth"><DatePicker value={form.dateOfBirth || ""} onChange={ev => set("dateOfBirth", ev.target.value)} /></Field>
      <Field label="Nationality"><TextInput value={form.nationality || ""} onChange={ev => set("nationality", ev.target.value)} placeholder="e.g. Portuguese" /></Field>
      <Field label="Languages"><TextInput value={form.languages || ""} onChange={ev => set("languages", ev.target.value)} placeholder="FR, DE, PT, EN..." /></Field>
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
      <Field label="Hourly Rate (€)"><TextInput type="number" step=".5" value={form.hourlyRate} onChange={ev => set("hourlyRate", parseFloat(ev.target.value) || 0)} /></Field>
      <Field label="Vacation allowance (days/year)"><TextInput type="number" min={0} value={form.leaveAllowance ?? 26} onChange={ev => set("leaveAllowance", Math.max(0, parseInt(ev.target.value || "0", 10) || 0))} /></Field>
      <Field label="Contract Type">
        <SelectInput value={form.contractType || "CDI"} onChange={ev => set("contractType", ev.target.value)}>
          <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Mini-job">{uiText("Mini-job")}</option><option value="Freelance">{uiText("Freelance")}</option><option value="Student">{uiText("Student")}</option>
        </SelectInput>
      </Field>
      <Field label="Start Date"><DatePicker value={form.startDate} onChange={ev => set("startDate", ev.target.value)} /></Field>
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
      <Field label="Cleaner Location Group"><TextInput value={form.cleanerGroup || ""} onChange={ev => set("cleanerGroup", ev.target.value)} placeholder="Luxembourg City Team" /></Field>
      <Field label="Hiring Stage">
        <SelectInput value={form.hiringStage || "hired"} onChange={ev => set("hiringStage", ev.target.value)}>
          <option value="hired">Hired</option>
          <option value="standby">Standby / Potential</option>
        </SelectInput>
      </Field>
      <div style={{ gridColumn: "1/-1", fontSize: 12, color: CL.muted }}>Tip: use Standby for potential cleaners you want to keep in your contact pipeline.</div>
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
    <button style={btnPri} onClick={() => form.name && onSave(form)}>{uiText("Save Employee")}</button>
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
status: "active", accessCode: "", keyLocation: "", parkingInfo: "", petInfo: "", specialInstructions: "", preferredDay: "", preferredTime: "", preferredDays: [],
contractStart: "", contractEnd: "", squareMeters: "", taxId: "", language: "FR", preferredCleanerIds: [],
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
        <SelectInput value={form.cleaningFrequency} onChange={ev => set("cleaningFrequency", ev.target.value)}>
          <option value="One-time">{uiText("One-time")}</option><option value="Weekly">{uiText("Weekly")}</option><option value="Bi-weekly">{uiText("Bi-weekly")}</option><option value="Monthly">{uiText("Monthly")}</option><option value="2x per week">{uiText("2x per week")}</option><option value="3x per week">{uiText("3x per week")}</option><option value="Daily">{uiText("Daily")}</option><option value="Custom">{uiText("Custom")}</option>
        </SelectInput>
      </Field>
      <Field label={uiText("Hours per Session")}>
        <TextInput type="number" step=".5" min="0" value={form.hoursPerSession || ""} onChange={ev => set("hoursPerSession", parseFloat(ev.target.value) || 0)} placeholder="ex: 3" />
      </Field>
      <div style={{ gridColumn: "1/-1" }}>
        <Field label="Preferred Days & Hours">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(day => {
              const preferredDays = form.preferredDays || [];
              const dayPref = preferredDays.find(d => d.day === day);
              const isSelected = !!dayPref;
              return (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 110, cursor: "pointer", userSelect: "none" }}>
                    <input type="checkbox" checked={isSelected} onChange={ev => {
                      const prev = form.preferredDays || [];
                      if (ev.target.checked) {
                        set("preferredDays", [...prev, { day, preferredTime: "" }]);
                      } else {
                        set("preferredDays", prev.filter(d => d.day !== day));
                      }
                    }} style={{ accentColor: CL.gold, width: 15, height: 15, cursor: "pointer" }} />
                    <span style={{ color: isSelected ? CL.text : CL.muted, fontSize: 13, fontWeight: isSelected ? 600 : 400 }}>{uiText(day)}</span>
                  </label>
                  {isSelected && (
                    <TextInput
                      value={dayPref.preferredTime || ""}
                      onChange={ev => {
                        const prev = form.preferredDays || [];
                        set("preferredDays", prev.map(d => d.day === day ? { ...d, preferredTime: ev.target.value } : d));
                      }}
                      placeholder="e.g. 09:00-12:00"
                      style={{ maxWidth: 180 }}
                    />
                  )}
                  {!isSelected && (
                    <span style={{ color: CL.muted, fontSize: 12, fontStyle: "italic" }}>click to select</span>
                  )}
                </div>
              );
            })}
          </div>
        </Field>
      </div>
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
        <div style={{ fontSize: 13, color: CL.gold, marginBottom: 8, fontWeight: 600 }}>Preferred cleaners for auto-assignment</div>
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
// SCHEDULE PAGE - Monthly Calendar
// ==============================================
function SchedulePage({ data, updateData, showToast }) {
const [focusWindow, setFocusWindow] = useState("today");
const [modal, setModal] = useState(null);
const [selectedDate, setSelectedDate] = useState(null);
const [filterEmp, setFilterEmp] = useState("");
const [viewMode, setViewMode] = useState("calendar");
const now = new Date();
const [viewYear, setViewYear] = useState(now.getFullYear());
const [viewMonth, setViewMonth] = useState(now.getMonth());

const emptySchedule = { clientId: "", employeeId: "", date: getToday(), startTime: "08:00", endTime: "12:00", status: "scheduled", notes: "", recurrence: "none" };
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

const focusMeta = {
  today: { label: uiText("Today"), from: todayStr, to: todayStr },
  tomorrow: { label: uiText("Tomorrow"), from: tomorrowStr, to: tomorrowStr },
  nextweek: { label: uiText("Next 7 Days"), from: todayStr, to: nextWeekStr },
};
const focused = focusMeta[focusWindow];
const focusedJobs = (data.schedules || [])
  .filter(s => s.date && s.date >= focused.from && s.date <= focused.to && (!filterEmp || s.employeeId === filterEmp))
  .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

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
</div>
</div>

<div className="stat-row" style={{ marginBottom: 16 }}>
<StatCard label={uiText("This Month")} value={`${monthSchedules.length}`} icon={ICN.cal} color={CL.blue} />
<StatCard label={uiText("In Progress")} value={monthSchedules.filter(s => s.status === "in-progress").length} icon={ICN.clock} color={CL.orange} />
<StatCard label={uiText("Completed")} value={monthSchedules.filter(s => s.status === "completed").length} icon={ICN.check} color={CL.green} />
</div>

<div style={{ ...cardSt, marginBottom: 16 }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
    <h3 style={{ margin: 0, fontSize: 16, color: CL.gold }}>{focused.label} - Close-up ({focusedJobs.length})</h3>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button style={{ ...btnSec, ...btnSm, background: focusWindow === "today" ? CL.blue : "transparent", color: focusWindow === "today" ? CL.white : CL.muted }} onClick={() => { setFocusWindow("today"); goToday(); }}>{uiText("Today")}</button>
      <button style={{ ...btnSec, ...btnSm, background: focusWindow === "tomorrow" ? CL.blue : "transparent", color: focusWindow === "tomorrow" ? CL.white : CL.muted }} onClick={() => { setFocusWindow("tomorrow"); goTomorrow(); }}>{uiText("Tomorrow")}</button>
      <button style={{ ...btnSec, ...btnSm, background: focusWindow === "nextweek" ? CL.blue : "transparent", color: focusWindow === "nextweek" ? CL.white : CL.muted }} onClick={() => { setFocusWindow("nextweek"); goNextWeek(); }}>{uiText("Next Week")}</button>
    </div>
  </div>
  {focusedJobs.length === 0 ? <p style={{ color: CL.muted, margin: 0 }}>{uiText("No jobs in this period.")}</p> : focusedJobs.slice(0, 20).map(job => {
    const client = data.clients.find(c => c.id === job.clientId);
    const employee = data.employees.find(e => e.id === job.employeeId);
    return <div key={job.id} onClick={() => setModal({ ...job })} style={{ border: `1px solid ${CL.bd}`, borderRadius: 8, padding: 10, marginBottom: 8, cursor: "pointer", background: CL.s2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>{fmtDate(job.date)} · {job.startTime}-{job.endTime}</div>
        <Badge color={scheduleStatusColor(job.status)}>{job.status}</Badge>
      </div>
      <div style={{ fontSize: 12, color: CL.text }}>{client?.name || "Unknown client"}</div>
      <div style={{ fontSize: 12, color: CL.muted }}>{uiText("Assigned to:")} {employee?.name || uiText("Unassigned")}</div>
      <div style={{ fontSize: 11, color: cityMatchLabel(employee, client).startsWith("✅") ? CL.green : CL.orange, marginTop: 2 }}>{cityMatchLabel(employee, client)}</div>
      {job.notes ? <div style={{ fontSize: 11, color: CL.dim, marginTop: 3 }}>{uiText("Details:")} {job.notes}</div> : null}
    </div>;
  })}
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
<div style={{ fontSize: 12, color: CL.muted, marginBottom: 10 }}>{uiText("Monthly job list by date (readable after clocking/status changes).")}</div>
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{uiText("Date")}</th><th style={thSt}>{uiText("Time")}</th><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("Cleaner")}</th><th style={thSt}>{uiText("Status")}</th></tr></thead>
<tbody>
{orderedMonthSchedules.map(s => {
const client = data.clients.find(c => c.id === s.clientId);
const employee = data.employees.find(e => e.id === s.employeeId);
return <tr key={s.id} onClick={() => setModal({ ...s })} style={{ cursor: "pointer" }}><td style={tdSt}>{fmtDate(s.date)}</td><td style={tdSt}>{s.startTime} - {s.endTime}</td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}><div>{employee?.name || uiText("Unassigned")}</div><div style={{ fontSize: 11, color: cityMatchLabel(employee, client).startsWith("✅") ? CL.green : CL.orange }}>{cityMatchLabel(employee, client)}</div></td><td style={tdSt}><Badge color={scheduleStatusColor(s.status)}>{uiText(s.status)}</Badge></td></tr>;
})}
{orderedMonthSchedules.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No jobs in this month")}</td></tr>}
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
{suggestedCleaner && !form.employeeId && <div style={{ fontSize: 11, color: CL.green, marginTop: 4 }}>Suggested: {suggestedCleaner.name} ({suggestedCleaner.cleanerGroup || suggestedCleaner.city || "No group"})</div>}
{suggestedCleaner && form.employeeId !== suggestedCleaner.id && <button type="button" style={{ ...btnSec, ...btnSm, marginTop: 6 }} onClick={() => set("employeeId", suggestedCleaner.id)} disabled={isCompletedLocked}>Use suggested cleaner</button>}
{selectedClient && selectedEmployee && <div style={{ fontSize: 11, color: cityMatchLabel(selectedEmployee, selectedClient).startsWith("✅") ? CL.green : CL.orange, marginTop: 4 }}>{cityMatchLabel(selectedEmployee, selectedClient)}</div>}
</Field>
<Field label="Date"><DatePicker value={form.date} onChange={ev => set("date", ev.target.value)} /></Field>
<Field label="Status">
<SelectInput value={form.status} onChange={ev => set("status", ev.target.value)} disabled={isCompletedLocked}>
<option value="scheduled">{uiText("Scheduled")}</option><option value="in-progress">{uiText("In Progress")}</option><option value="completed">{uiText("Completed")}</option><option value="cancelled">{uiText("Cancelled")}</option>
</SelectInput>
</Field>
<Field label="Start"><TextInput type="time" value={form.startTime} onChange={ev => set("startTime", ev.target.value)} disabled={isCompletedLocked} /></Field>
<Field label="End"><TextInput type="time" value={form.endTime} onChange={ev => set("endTime", ev.target.value)} disabled={isCompletedLocked} /></Field>
{!form.id && (
<Field label="Recurrence">
<SelectInput value={form.recurrence} onChange={ev => set("recurrence", ev.target.value)} disabled={isCompletedLocked}>
<option value="none">{uiText("One-time")}</option><option value="daily">{uiText("Daily (weekends included)")}</option><option value="daily-weekdays">{uiText("Daily (weekdays only)")}</option><option value="weekly">{uiText("Weekly (12 weeks)")}</option><option value="biweekly">{uiText("Bi-weekly (12x)")}</option><option value="monthly">{uiText("Monthly (12 months)")}</option>
</SelectInput>
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
      {selectedClient.accessCode && <div style={{ color: CL.orange }}>Code: {selectedClient.accessCode}</div>}
      {selectedClient.keyLocation && <div style={{ color: CL.orange }}>Key: {selectedClient.keyLocation}</div>}
      {selectedClient.petInfo && <div style={{ color: CL.orange }}>Pets: {selectedClient.petInfo}</div>}
      {(selectedClient.preferredDays && selectedClient.preferredDays.length > 0)
        ? selectedClient.preferredDays.map(d => (
            <div key={d.day} style={{ color: CL.dim }}>Prefers: {d.day}{d.preferredTime ? ` · ${d.preferredTime}` : ""}</div>
          ))
        : selectedClient.preferredDay && <div style={{ color: CL.dim }}>Prefers: {selectedClient.preferredDay} {selectedClient.preferredTime || ""}</div>
      }
    </div>
  )}

  <Field label="Notes"><TextArea value={form.notes || ""} onChange={ev => set("notes", ev.target.value)} disabled={isCompletedLocked} /></Field>
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 8 }}>
    <div>{form.id && <button style={{ ...btnDng, ...btnSm }} disabled={isCompletedLocked} onClick={() => { onCancel(); onDelete(form.id); }}>{uiText("Delete Job")}</button>}</div>
    <div style={{ display: "flex", gap: 10 }}>
      <button style={btnSec} onClick={onCancel}>{uiText("Cancel")}</button>
      <button style={btnPri} disabled={isCompletedLocked} onClick={() => form.clientId && form.employeeId && onSave(form)}>{isCompletedLocked ? uiText("Completed") : uiText("Save Job")}</button>
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
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 16 }}>{uiText("Time Clock")}</h1>

  <div style={{ ...cardSt, marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{uiText("Quick Clock In")}</h3>
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <Field label={uiText("Employee")}>
          <SelectInput value={selectedEmp} onChange={ev => setSelectedEmp(ev.target.value)}>
            <option value="">{uiText("Select...")}</option>
            {data.employees.filter(emp => emp.status === "active").map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </SelectInput>
        </Field>
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <Field label={uiText("Client")}>
          <SelectInput value={selectedCli} onChange={ev => setSelectedCli(ev.target.value)}>
            <option value="">{uiText("Select...")}</option>
            {data.clients.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </Field>
      </div>
      <button style={{ ...btnPri, marginBottom: 14, background: CL.green }} onClick={doClockIn}>{uiText("Clock In")}</button>
    </div>
    <Field label={uiText("Clock-in note (optional)")}>
      <TextInput value={clockInNote} onChange={ev => setClockInNote(ev.target.value)} placeholder={uiText("Late reason, traffic, access issue...")} />
    </Field>
    {activeClocks.length > 0 && (
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 12, color: CL.green, fontWeight: 600, marginBottom: 4 }}>{uiText("Active:")}</div>
        {activeClocks.map(clk => {
          const employee = data.employees.find(e => e.id === clk.employeeId);
          const client = data.clients.find(c => c.id === clk.clientId);
          return (
            <div key={clk.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${CL.bd}` }}>
              <span><strong>{employee?.name}</strong> at {client?.name} · {fmtTime(clk.clockIn)} {clk.isLate ? `· Late ${clk.lateMinutes || 0}m` : ""}</span>
              <button style={{ ...btnDng, ...btnSm }} onClick={() => doClockOut(clk.id)}>{uiText("Out")}</button>
            </div>
          );
        })}
      </div>
    )}
  </div>

  <div style={{ ...cardSt, marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.blue }}>{uiText("Owner: Add missed clock-in")}</h3>
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
      <Field label="In Date"><DatePicker value={manualEntry.clockInDate} onChange={ev => setManual("clockInDate", ev.target.value)} /></Field>
      <Field label="In Time"><TextInput type="time" value={manualEntry.clockInTime} onChange={ev => setManual("clockInTime", ev.target.value)} /></Field>
      <Field label="Out Date (optional)"><DatePicker value={manualEntry.clockOutDate} onChange={ev => setManual("clockOutDate", ev.target.value)} /></Field>
      <Field label="Out Time (optional)"><TextInput type="time" value={manualEntry.clockOutTime} onChange={ev => setManual("clockOutTime", ev.target.value)} /></Field>
    </div>
    <Field label="Reason / note (optional)">
      <TextInput value={manualEntry.notes} onChange={ev => setManual("notes", ev.target.value)} placeholder="Forgot to clock in, adjusted by owner..." />
    </Field>
    <button style={{ ...btnPri, background: CL.blue }} onClick={addManualEntry}>{uiText("Add Manual Entry")}</button>
  </div>

  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
    <SelectInput value={filters.emp} onChange={ev => setFilters(f => ({ ...f, emp: ev.target.value }))} style={{ width: 160 }}>
      <option value="">{uiText("All Employees")}</option>
      {data.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
    </SelectInput>
    <TextInput type="month" value={filters.month} onChange={ev => setFilters(f => ({ ...f, month: ev.target.value }))} style={{ width: 160 }} />
  </div>

  <div style={cardSt} className="tbl-wrap">
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead><tr><th style={thSt}>{uiText("Employee")}</th><th style={thSt}>{uiText("Client")}</th><th style={thSt}>{uiText("In")}</th><th style={thSt}>{uiText("Out")}</th><th style={thSt}>{uiText("Late")}</th><th style={thSt}>{uiText("Notes")}</th><th style={thSt}>{uiText("Hours")}</th><th style={thSt}>{uiText("Actions")}</th></tr></thead>
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
              <td style={tdSt}>{entry.clockOut ? fmtBoth(entry.clockOut) : <Badge color={CL.green}>{uiText("Active")}</Badge>}</td>
              <td style={tdSt}>{entry.isLate ? <Badge color={CL.orange}>{uiText("Late")} {entry.lateMinutes || 0}m</Badge> : <Badge color={CL.green}>{uiText("On time")}</Badge>}</td>
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
        {filteredEntries.length === 0 && <tr><td colSpan={8} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No entries")}</td></tr>}
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
<Field label="In Date"><DatePicker value={form.clockInDate} onChange={ev => set("clockInDate", ev.target.value)} /></Field>
<Field label="In Time"><TextInput type="time" value={form.clockInTime} onChange={ev => set("clockInTime", ev.target.value)} /></Field>
<Field label="Out Date"><DatePicker value={form.clockOutDate} onChange={ev => set("clockOutDate", ev.target.value)} /></Field>
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
const [deleteProductId, setDeleteProductId] = useState(null);

const products = (data.inventoryProducts || []).sort((a, b) => a.name.localeCompare(b.name));
const requests = (data.productRequests || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const holdings = (data.cleanerProductHoldings || []);

const saveProduct = () => {
if (!productForm.name.trim()) { showToast(uiText("Product name required"), "error"); return; }
updateData("inventoryProducts", (prev = []) => [...prev, { id: makeId(), active: true, ...productForm, name: productForm.name.trim(), stock: Number(productForm.stock) || 0, minStock: Number(productForm.minStock) || 0 }]);
setProductForm({ name: "", unit: "bottles", stock: 0, minStock: 0, note: "" });
showToast(uiText("Product added"));
};

const handleDeleteProduct = (id) => {
updateData("inventoryProducts", prev => (prev || []).filter(p => p.id !== id));
setDeleteProductId(null);
showToast(uiText("Product deleted"));
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
const previewRef = useRef(null);
const hiddenQuoteRef = useRef(null);

const defaultQuoteColumns = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true };

const newQuoteDraft = (clientId = "", presetDescription = "Cleaning service") => ({ quoteNumber: quoteNumber(), clientId, date: getToday(), validUntil: "", items: [{ prestationDate: getToday(), description: presetDescription, hours: "", quantity: 1, unitPrice: 0, total: 0 }], pricingMode: "hours", visibleColumns: { ...defaultQuoteColumns }, vatRate: data.settings.defaultVatRate, subtotal: 0, vatAmount: 0, total: 0, status: "draft", notes: "", paymentTerms: "Quote valid for 30 days.", jobSchedule: { dateFrom: "", dateTo: "", frequency: "one-time", startDate: getToday(), employeeId: "", startTime: "08:00", endTime: "12:00" } });

useEffect(() => {
if (!devisSeed) return;
setModal(newQuoteDraft(devisSeed.clientId, devisSeed.description || "Prospect visit quotation"));
if (setDevisSeed) setDevisSeed(null);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [devisSeed]);

const quoteNumber = (dateStr = getToday()) => {
const [year, month, day] = (dateStr || getToday()).split("-");
const prefix = `DEV-${year || new Date().getFullYear()}-${(month || "01").padStart(2, "0")}-${(day || "01").padStart(2, "0")}-`;
const nums = (data.quotes || []).map(q => String(q.quoteNumber || "")).filter(n => n.startsWith(prefix)).map(n => parseInt(n.slice(prefix.length), 10)).filter(n => Number.isFinite(n));
return `${prefix}${nums.length ? Math.max(...nums) + 1 : 1}`;
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
const hasValidFormat = /^DEV-\d{4}-\d{2}-\d{2}-\d+$/.test(q.quoteNumber || "");
const final = { ...q, quoteNumber: hasValidFormat ? q.quoteNumber : quoteNumber(q.date || getToday()), subtotal, vatAmount, total: subtotal + vatAmount };
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

const generateScheduleEntries = (clientId, js) => {
const { startDate, dateFrom, dateTo, frequency, employeeId, startTime, endTime } = js || {};
if (!startDate || !employeeId) return [];
const entries = [];
const endDateStr = dateTo || dateFrom || startDate;
const toDate = d => new Date(d + "T00:00:00");
const toISO = d => d.toISOString().slice(0, 10);
const addEntry = (d) => entries.push({ id: makeId(), date: toISO(d), clientId, employeeId, startTime: startTime || "08:00", endTime: endTime || "12:00", status: "scheduled", notes: "Généré depuis devis", recurrence: frequency === "one-time" ? "none" : frequency });
if (frequency === "one-time") {
  addEntry(toDate(startDate));
} else {
  let cur = toDate(startDate);
  const end = toDate(endDateStr);
  while (cur <= end) {
    addEntry(new Date(cur));
    if (frequency === "monthly") { cur.setMonth(cur.getMonth() + 1); }
    else { cur.setDate(cur.getDate() + (frequency === "biweekly" ? 14 : 7)); }
  }
}
return entries;
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
const js = q.jobSchedule;
if (js && js.employeeId && js.startDate) {
  const newSchedules = generateScheduleEntries(q.clientId, js);
  if (newSchedules.length > 0) {
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
{(data.quotes || []).sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(q => { const client = data.clients.find(c => c.id === q.clientId); return (
<tr key={q.id}><td style={tdSt}><strong>{q.quoteNumber}</strong></td><td style={tdSt}>{client?.name || "-"}</td><td style={tdSt}>{fmtDate(q.date)}</td><td style={{ ...tdSt, fontWeight: 600 }}>€{(q.total || 0).toFixed(2)}</td><td style={tdSt}><Badge color={q.status === "accepted" || q.status === "converted" ? CL.green : q.status === "rejected" ? CL.red : CL.blue}>{q.status || t("draft")}</Badge></td><td style={tdSt}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}><button style={{ ...btnSec, ...btnSm }} onClick={() => setPreview({ ...q, invoiceNumber: q.quoteNumber, dueDate: q.validUntil })}>{t("view")}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => setModal({ ...q })}>{ICN.edit}</button><button style={{ ...btnSec, ...btnSm }} onClick={() => downloadQuotePdf(q)}>{ICN.download} PDF</button><button style={{ ...btnSec, ...btnSm }} onClick={() => sendQuote(q)}>{ICN.mail}</button>{q.status !== "converted" && <button style={{ ...btnSec, ...btnSm, color: CL.green }} onClick={() => convertToInvoice(q)}>{lang === "en" ? "To Invoice" : "Vers facture"}</button>}<button style={{ ...btnSec, ...btnSm, color: CL.red }} onClick={() => deleteQuote(q.id)}>{ICN.trash}</button></div></td></tr>
); })}
{(data.quotes || []).length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No quotes")}</td></tr>}
</tbody>
</table>
</div>

{preview && <ModalBox title={t("quote") + " — Aperçu"} onClose={() => setPreview(null)} wide><div ref={previewRef}><InvoicePreviewContent invoice={preview} data={data} isQuote={true} /></div><div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}><button style={btnSec} onClick={() => setPreview(null)}>{uiText("Close")}</button><button style={btnPri} onClick={() => downloadQuotePdf(preview)}>{ICN.download} PDF</button><button style={{ ...btnSec, color: CL.blue }} onClick={() => sendQuote(preview)}>{ICN.mail} {t("sendEmail")}</button></div></ModalBox>}
{modal && <ModalBox title={modal.id ? t("editQuote") : t("newQuote")} onClose={() => setModal(null)} wide><QuoteForm quote={{ pricingMode: "hours", visibleColumns: { ...defaultQuoteColumns }, ...modal }} data={data} onSave={saveQuote} onCancel={() => setModal(null)} generateQuoteNumber={quoteNumber} /></ModalBox>}
{quoteForPdf && <div style={{ position: "fixed", left: -10000, top: 0, width: 1200, background: "#fff", zIndex: -1 }}><div ref={hiddenQuoteRef}><InvoicePreviewContent invoice={quoteForPdf} data={data} isQuote={true} /></div></div>}
</div>
);
}

function QuoteForm({ quote, data, onSave, onCancel, generateQuoteNumber }) {
const defaultColumns = { prestationDate: true, description: true, hours: true, quantity: false, unitPrice: true, total: true, tva: true };
const defaultJobSchedule = { dateFrom: "", dateTo: "", frequency: "one-time", startDate: "", employeeId: "", startTime: "08:00", endTime: "12:00" };
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

return (
<div>
  {/* ── Section 1: Core info ── */}
  <QSectionHeader label="Devis — Informations" />
  <div className="form-grid" style={{ gap: 20 }}>
    <Field label="Quote #">
      <div style={{ display: "flex", gap: 8 }}>
        <TextInput value={form.quoteNumber} onChange={ev => set("quoteNumber", ev.target.value)} style={{ flex: 1 }} />
        <button style={{ ...btnSec, padding: "0 14px", whiteSpace: "nowrap" }} onClick={autoQuoteNumber}>Auto</button>
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
      <Field label="Fréquence">
        <SelectInput value={form.jobSchedule?.frequency || "one-time"} onChange={ev => setJobSchedule("frequency", ev.target.value)}>
          <option value="one-time">Une seule fois</option>
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
      <Field label="Agent(e) assigné(e)">
        <SelectInput value={form.jobSchedule?.employeeId || ""} onChange={ev => setJobSchedule("employeeId", ev.target.value)}>
          <option value="">— Sélectionner —</option>
          {(data.employees || []).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </SelectInput>
      </Field>
    </div>
    {form.jobSchedule?.employeeId && form.jobSchedule?.startDate && (
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
    <button style={{ ...btnPri, padding: "12px 32px", fontSize: 14 }} onClick={() => form.clientId && onSave({ ...form, subtotal, vatAmount: form.visibleColumns?.tva === false ? 0 : vatAmount, total: subtotal + (form.visibleColumns?.tva === false ? 0 : vatAmount) })}>Enregistrer le devis</button>
  </div>
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
{data.invoices.length === 0 && <tr><td colSpan={6} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No invoices")}</td></tr>}
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
    <Field label={t("prestationDate")}>
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
  <SectionHeader label="Période de facturation" />
  <div style={{ background: CL.bg, border: `1px solid ${CL.bd}`, borderRadius: 12, padding: "20px 24px", marginBottom: 6 }}>
    <div className="form-grid" style={{ gap: 20, marginBottom: 16 }}>
      <Field label="Date de début"><DatePicker value={form.billingStart || ""} onChange={ev => set("billingStart", ev.target.value)} /></Field>
      <Field label="Date de fin"><DatePicker value={form.billingEnd || ""} onChange={ev => set("billingEnd", ev.target.value)} /></Field>
    </div>
    <button style={{ ...btnPri, width: "100%", justifyContent: "center", marginBottom: 14 }} onClick={loadPrestationsFromRange} disabled={!form.clientId}>
      Générer les prestations depuis le planning
    </button>
    <div style={{ fontSize: 12, color: CL.dim, marginBottom: 10 }}>Prestations issues du dernier planning pour ce client et cette période</div>
    <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
      {prestations.map(p => (
        <button key={p.id} style={{ ...btnSec, width: "100%", display: "flex", justifyContent: "space-between", padding: "10px 14px", textAlign: "left" }} onClick={() => addPrestation(p)}>
          <span>{fmtDate(p.prestationDate)} · {p.employeeName} · {p.description}</span>
          <span style={{ color: CL.gold, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{p.hours ? `${p.hours.toFixed(2)}h` : ""}</span>
        </button>
      ))}
      {prestations.length === 0 && <div style={{ fontSize: 12, color: CL.dim, padding: "6px 2px" }}>Aucune prestation trouvée pour cette période.</div>}
    </div>
    {scheduleLoadMessage && <div style={{ fontSize: 12, color: CL.blue, marginTop: 8 }}>{scheduleLoadMessage}</div>}
  </div>

  {/* ── Section 3: Line items ── */}
  <SectionHeader label="Lignes de facturation" />

  {/* Visible columns toggle */}
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, padding: "10px 14px", background: CL.bg, borderRadius: 8, border: `1px solid ${CL.bd}` }}>
    <span style={{ fontSize: 11, color: CL.dim, fontWeight: 600, marginRight: 4, alignSelf: "center" }}>Colonnes :</span>
    {[["prestationDate","Date"],["description","Description"],["hours","Heures"],["quantity","Quantité"],["unitPrice","Prix unit."],["total","Total"],["tva","TVA"]].map(([col, lbl]) => (
      <label key={col} style={{ fontSize: 12, color: CL.muted, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: form.visibleColumns?.[col] !== false ? CL.gold + "18" : "transparent" }}>
        <input type="checkbox" checked={form.visibleColumns?.[col] !== false} onChange={ev => setForm(prev => ({ ...prev, visibleColumns: { ...(prev.visibleColumns || {}), [col]: ev.target.checked } }))} style={{ accentColor: CL.gold }} /> {lbl}
      </label>
    ))}
  </div>

  {/* Global description bar */}
  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
    <TextInput placeholder="Désignation globale (optionnel)" value={globalDescription} onChange={ev => setGlobalDescription(ev.target.value)} style={{ flex: 1 }} />
    <button style={{ ...btnSec, whiteSpace: "nowrap", padding: "0 16px" }} onClick={applyDescriptionToAll}>Appliquer à toutes les lignes</button>
  </div>

  {/* Column headers */}
  <div style={{ display: "grid", gridTemplateColumns: `${form.visibleColumns?.prestationDate !== false ? "1.2fr " : ""}${form.visibleColumns?.description !== false ? "2.2fr " : ""}${form.visibleColumns?.hours !== false ? ".8fr " : ""}${form.visibleColumns?.quantity !== false ? ".8fr " : ""}${form.visibleColumns?.unitPrice !== false ? "1fr " : ""}${form.visibleColumns?.total !== false ? "1fr " : ""}28px`, gap: 8, marginBottom: 8, fontSize: 11, color: CL.dim, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
    {form.visibleColumns?.prestationDate !== false && <div>Date</div>}
    {form.visibleColumns?.description !== false && <div>Description</div>}
    {form.visibleColumns?.hours !== false && <div style={{ textAlign: "right" }}>Heures</div>}
    {form.visibleColumns?.quantity !== false && <div style={{ textAlign: "right" }}>Qté</div>}
    {form.visibleColumns?.unitPrice !== false && <div style={{ textAlign: "right" }}>Prix unit.</div>}
    {form.visibleColumns?.total !== false && <div style={{ textAlign: "right" }}>Total</div>}
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
    <Field label={uiText("Email template")}><SelectInput value={form.emailTemplate || "standard"} onChange={ev => set("emailTemplate", ev.target.value)}><option value="standard">{uiText("Standard")}</option><option value="friendly">{uiText("Friendly reminder")}</option></SelectInput></Field>
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
// Always display "Lux Angels Cleaning" as the company name in PDFs
const companyDisplay = "Lux Angels Cleaning";
const docLabel = isQuote ? "DEVIS" : "FACTURE";
return (
<div style={{ background: "#fff", color: "#1a1a1a", padding: 36, borderRadius: 8, fontFamily: "'Outfit', sans-serif" }}>
{/* Header */}
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
  <div>
    <h1 style={{ fontSize: 26, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", margin: 0, letterSpacing: "0.01em" }}>{companyDisplay}</h1>
    <div style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.7 }}>
      {settings.companyAddress}<br />
      {settings.companyEmail}<br />
      {settings.companyPhone}<br />
      TVA: {settings.vatNumber}
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
        {cols.unitPrice && <th style={{ textAlign: "right", padding: "6px 4px", fontSize: 10, color: "#999", fontWeight: 600 }}>PU (€)</th>}
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
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#C9A84C", fontWeight: 700, fontStyle: "italic", marginBottom: 2 }}>Lux Angels Cleaning</div>
    <div style={{ borderTop: "1px solid #C9A84C", paddingTop: 4, fontSize: 10, color: "#999", display: "inline-block", marginTop: 4 }}>Direction — Lux Angels Cleaning S.à r.l.</div>
  </div>
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

if (auth?.role !== "owner") return <div style={cardSt}>{t("Payroll access is restricted.")}</div>;

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
{data.payslips.length === 0 && <tr><td colSpan={7} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No payslips")}</td></tr>}
</tbody>
</table>
</div>

  {preview && (
    <ModalBox title="" onClose={() => setPreview(null)}>
      {(() => {
        const employee = data.employees.find(e => e.id === preview.employeeId);
        const settings = data.settings;
        return (
          <div style={{ background: "#fff", color: "#1a1a1a", padding: 28, borderRadius: 8, fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>Lux Angels Cleaning</h1>
                <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{settings.companyAddress}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ fontSize: 18, color: "#333", margin: 0, fontWeight: 700, letterSpacing: "0.05em" }}>FICHE DE PAIE</h2>
                <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>{preview.payslipNumber}<br />{preview.month}</div>
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
            <div style={{ fontSize: 9, color: "#999", textAlign: "center", marginBottom: 24 }}>Document à titre indicatif — brut uniquement.</div>
            {/* Signature */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Signature de l'employeur :</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#C9A84C", fontWeight: 700, fontStyle: "italic", marginBottom: 2 }}>Lux Angels Cleaning</div>
                <div style={{ borderTop: "1px solid #C9A84C", paddingTop: 4, fontSize: 10, color: "#999", display: "inline-block" }}>Direction — Lux Angels Cleaning S.à r.l.</div>
              </div>
            </div>
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
    <Field label="Visit date"><DatePicker value={form.visitDate} onChange={ev => set("visitDate", ev.target.value)} /></Field>
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

const markAllSeen = () => updateData("photoUploads", prev => (prev || []).map(u => ({ ...u, seenByOwner: true })));

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
<div className="tbl-wrap">
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
<thead><tr><th style={thSt}>{uiText("Cleaner")}</th><th style={thSt}>{uiText("Allowance")}</th><th style={thSt}>{uiText("Approved")}</th><th style={thSt}>{uiText("Pending")}</th><th style={thSt}>{uiText("Remaining")}</th></tr></thead>
<tbody>
{summaryRows.map(row => <tr key={row.emp.id}><td style={tdSt}>{row.emp.name}</td><td style={tdSt}><TextInput type="number" min={0} value={row.emp.leaveAllowance ?? 26} onChange={ev => updateData("employees", prev => prev.map(e => e.id === row.emp.id ? { ...e, leaveAllowance: Math.max(0, parseInt(ev.target.value || "0", 10) || 0) } : e))} style={{ width: 90 }} /></td><td style={tdSt}>{row.approvedDays}d</td><td style={tdSt}>{row.pendingDays}d</td><td style={{ ...tdSt, fontWeight: 700, color: row.remaining > 5 ? CL.green : CL.orange }}>{row.remaining}d</td></tr>)}
{summaryRows.length === 0 && <tr><td colSpan={5} style={{ ...tdSt, textAlign: "center", color: CL.muted }}>{uiText("No active cleaners")}</td></tr>}
</tbody>
</table>
</div>
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
// REMINDERS PAGE
// ==============================================
function RemindersPage({ data, showToast }) {
const { t } = useI18n();
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
if (!to) { showToast(uiText("Client email missing"), "error"); return; }
window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
};
const openWhatsApp = ({ phone, message }) => {
if (!phone) { showToast(uiText("Client phone missing"), "error"); return; }
const cleaned = String(phone).replace(/[^\d+]/g, "").replace(/^00/, "+");
window.open(`https://wa.me/${cleaned.replace("+", "")}?text=${encodeURIComponent(message)}`, "_blank");
};
const openZohoDraft = ({ to, subject, body }) => {
if (!to) { showToast(uiText("Client email missing"), "error"); return; }
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
showToast(`${uiText("Reminder opened via")} ${channel}`);
};

const sendCampaign = () => {
const recipients = clients.filter(c => selectedClientIds.includes(c.id));
if (!recipients.length) { showToast(uiText("Select at least one client for campaign"), "error"); return; }
recipients.forEach((client, idx) => {
const payload = {
to: client.email,
subject: `[${campaignFrequency.toUpperCase()}] ${campaignSubject}`,
body: `Dear ${client.contactPerson || client.name},\n\n${campaignBody}\n\nRegards,\n${data.settings.companyName}`,
};
setTimeout(() => dispatch(campaignChannel, payload, client), idx * 200);
});
showToast(`${uiText("Campaign opened for")} ${recipients.length} ${uiText("client(s)")}`);
};

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 5 }}>{t("reminders")}</h1>
<p style={{ color: CL.muted, marginBottom: 16 }}>{uiText("Operational reminders + business follow-up + marketing communication workflows.")}</p>

<div style={{ ...cardSt, marginBottom: 12 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: CL.gold }}>{uiText("Recipient Selection")}</h3>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setSelectedClientIds(clients.map(c => c.id))}>{uiText("Select all")}</button>
<button style={{ ...btnSec, ...btnSm }} onClick={() => setSelectedClientIds([])}>{uiText("Clear")}</button>
<label style={{ fontSize: 12, color: CL.muted, display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={selectedOnly} onChange={ev => setSelectedOnly(ev.target.checked)} /> {uiText("Restrict reminders to selected clients only")}</label>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 6 }}>
{clients.map(c => <label key={c.id} style={{ fontSize: 12, color: CL.text, display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={selectedClientIds.includes(c.id)} onChange={() => toggleClient(c.id)} /> {c.name}</label>)}
</div>
</div>

<div style={{ ...cardSt, marginBottom: 12, padding: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
<SelectInput value={workflowType} onChange={ev => setWorkflowType(ev.target.value)} style={{ width: 220 }}>
<option value="all">{uiText("All workflows")}</option>
<option value="work">{uiText("Work reminders / upcoming shifts")}</option>
<option value="followup">{uiText("Business follow-up")}</option>
</SelectInput>
<SelectInput value={channel} onChange={ev => setChannel(ev.target.value)} style={{ width: 170 }}>
<option value="email">{uiText("Email")}</option>
<option value="whatsapp">{uiText("WhatsApp")}</option>
<option value="zoho">{uiText("Zoho")}</option>
</SelectInput>
<div style={{ fontSize: 12, color: CL.muted }}>{uiText("Ready reminders:")} {filtered.length}</div>
</div>

{filtered.length === 0 ? <div style={{ ...cardSt, textAlign: "center", padding: 26, color: CL.muted }}>{uiText("No reminders ready for this filter.")}</div> : (
<div>{filtered.map(rem => <div key={rem.id} style={{ ...cardSt, marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}><div><div style={{ fontWeight: 600, fontSize: 15 }}>{rem.title}</div><div style={{ fontSize: 12, color: CL.muted, marginTop: 3 }}>{rem.details}</div><div style={{ fontSize: 12, color: CL.dim, marginTop: 2 }}>{rem.client.email || rem.client.phone || rem.client.phoneMobile || uiText("No contact")}</div></div><button style={btnPri} onClick={() => sendReminder(rem)}>{ICN.mail} {uiText("Send via")} {channel}</button></div></div>)}</div>
)}

<div style={{ ...cardSt, marginTop: 12 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: CL.gold }}>{t("Email Marketing Campaigns")}</h3>
<div className="form-grid">
<Field label={uiText("Frequency")}><SelectInput value={campaignFrequency} onChange={ev => setCampaignFrequency(ev.target.value)}><option value="weekly">{uiText("Weekly")}</option><option value="monthly">{uiText("Monthly")}</option></SelectInput></Field>
<Field label={uiText("Channel")}><SelectInput value={campaignChannel} onChange={ev => setCampaignChannel(ev.target.value)}><option value="email">{uiText("Email")}</option><option value="whatsapp">{uiText("WhatsApp")}</option><option value="zoho">{uiText("Zoho")}</option></SelectInput></Field>
</div>
<Field label={uiText("Campaign subject")}><TextInput value={campaignSubject} onChange={ev => setCampaignSubject(ev.target.value)} /></Field>
<Field label={uiText("Campaign content")}><TextArea value={campaignBody} onChange={ev => setCampaignBody(ev.target.value)} /></Field>
<div style={{ display: "flex", justifyContent: "flex-end" }}><button style={btnPri} onClick={sendCampaign}>{ICN.mail} {uiText("Send Campaign to Selected Clients")}</button></div>
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
}).filter(e => e.totalH > 0);

const clientSummary = data.clients.filter(c => c.status === "active").map(client => {
const entries = monthEntries.filter(c => c.clientId === client.id);
const totalH = entries.reduce((sum, ce) => sum + calcHrs(ce.clockIn, ce.clockOut), 0);
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
// SETTINGS PAGE
// ==============================================
function SettingsPage({ data, updateData, setData, showToast, auth }) {
const [form, setForm] = useState(data.settings);
const [ownerUsername, setOwnerUsername] = useState(data.ownerUsername || "LuxAdmin");
const [pin, setPin] = useState(data.ownerPin || "LuxAngels@2025");
const [managerUsername, setManagerUsername] = useState(data.managerUsername || "manager");
const [managerPin, setManagerPin] = useState(data.managerPin || "Manager@2025");
const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

const handleSave = async () => {
  updateData("settings", form);
  const newOwnerUsername = ownerUsername.trim();
  const newOwnerPin = pin.trim();
  const newManagerUsername = managerUsername.trim().toLowerCase();
  const newManagerPin = managerPin.trim();
  setData(prev => ({ ...prev, ownerUsername: newOwnerUsername, ownerPin: newOwnerPin, managerUsername: newManagerUsername, managerPin: newManagerPin }));

  // Sync credentials and company settings to the backend database so all
  // browsers use the same credentials.
  try {
    await fetch(apiUrl("/api/settings"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerUsername: newOwnerUsername,
        ownerPin: newOwnerPin,
        managerUsername: newManagerUsername,
        managerPin: newManagerPin,
        companyName: form.companyName,
        companyAddress: form.companyAddress,
        companyEmail: form.companyEmail,
        companyPhone: form.companyPhone,
        vatNumber: form.vatNumber,
        bankIban: form.bankIban,
        defaultVatRate: String(form.defaultVatRate),
      }),
    });
    showToast(uiText("Saved") + " — synced to server");
  } catch {
    showToast("Saved locally only — server unreachable. Credentials may not work on other devices until the server is back online.", "error");
  }
};

return (
<div>
<h1 style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: CL.gold, marginBottom: 16 }}>{uiText("Settings")}</h1>
<div style={cardSt}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.gold }}>{uiText("Company Info")}</h3>
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
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.gold }}>{uiText("Access Credentials")}</h3>
<div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
<Field label="Owner Username"><TextInput value={ownerUsername} onChange={ev => setOwnerUsername(ev.target.value)} style={{ width: 260 }} /></Field>
<Field label="Owner Password"><TextInput maxLength={24} value={pin} onChange={ev => setPin(ev.target.value)} style={{ width: 180 }} /></Field>
<Field label="Manager Username"><TextInput value={managerUsername} onChange={ev => setManagerUsername(ev.target.value)} style={{ width: 220 }} /></Field>
<Field label="Manager Password"><TextInput maxLength={24} value={managerPin} onChange={ev => setManagerPin(ev.target.value)} style={{ width: 180 }} /></Field>
</div>
</div>
<div style={{ ...cardSt, marginTop: 14 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: CL.gold }}>{uiText("Public Holidays")}</h3>
<p style={{ fontSize: 12, color: CL.muted, marginBottom: 12 }}>{uiText("Select public holidays that apply")}</p>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
{LU_PUBLIC_HOLIDAYS.map(h => {
  const checked = (form.publicHolidays || []).includes(h);
  return (
    <label key={h} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: CL.text, cursor: "pointer", padding: "6px 10px", borderRadius: 8, background: checked ? CL.gold + "18" : CL.s2, border: `1px solid ${checked ? CL.gold + "55" : CL.bd}`, transition: "background .15s" }}>
      <input type="checkbox" checked={checked} onChange={ev => {
        const prev = form.publicHolidays || [];
        const next = ev.target.checked ? [...prev, h] : prev.filter(x => x !== h);
        set("publicHolidays", next);
      }} style={{ accentColor: CL.gold, width: 15, height: 15 }} />
      {h}
    </label>
  );
})}
</div>
{(form.publicHolidays || []).length > 0 && (
  <div style={{ marginTop: 10, fontSize: 12, color: CL.muted }}>
    {(form.publicHolidays || []).length} jour(s) férie(s) sélectionné(s)
  </div>
)}
</div>
<div style={{ marginTop: 14 }}><button style={btnPri} onClick={handleSave}>{ICN.check} {uiText("Save All")}</button></div>
{auth?.role === "owner" && <div style={{ ...cardSt, marginTop: 14 }}>
<h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: CL.red }}>{uiText("Danger Zone")}</h3>
<button style={btnDng} onClick={() => { if (confirm(uiText("DELETE ALL DATA?"))) { saveStore(DEFAULTS); window.location.reload(); } }}>{uiText("Reset Everything")}</button>
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
    if (isPaid(exp)) return "Paid";
    if (isOverdue(exp)) return "Overdue";
    if (isDueToday(exp)) return "Due Today";
    if (isDueSoon(exp)) return "Due Soon";
    return "Pending";
  };

  const deleteExpense = (id) => {
    if (!confirm(uiText("Delete this expense? All payment history will be lost."))) return;
    updateData("expenses", prev => (prev || []).filter(e => e.id !== id));
    showToast(uiText("Expense deleted"), "success");
  };

  const markUnpaid = (expense) => {
    updateData("expenses", prev => (prev || []).map(e =>
      e.id === expense.id
        ? { ...e, payments: (e.payments || []).filter(p => p.month !== viewMonth) }
        : e
    ));
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
                  <th style={thSt}>{uiText("Due Day")}</th>
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
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{uiText("Day")} {exp.dueDay}</div>
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
          onSave={(exp) => {
            if (editExpense) {
              updateData("expenses", prev => (prev || []).map(e => e.id === exp.id ? exp : e));
              showToast(uiText("Expense updated"), "success");
            } else {
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
          onSave={(payment) => {
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
  const [dueDay, setDueDay] = useState(expense?.dueDay?.toString() || "1");
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod || "Bank Transfer");
  const [notes, setNotes] = useState(expense?.notes || "");
  const [isActive, setIsActive] = useState(expense?.isActive !== false);

  const handleSave = () => {
    if (!name.trim()) { alert(uiText("Expense name is required")); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { alert(uiText("Please enter a valid amount greater than 0")); return; }
    const day = parseInt(dueDay, 10);
    if (isNaN(day) || day < 1 || day > 31) { alert(uiText("Due day must be between 1 and 31")); return; }
    onSave({
      id: expense?.id || makeId(),
      name: name.trim(),
      category,
      amount: amt,
      dueDay: day,
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
          <Field label="Due Day of Month *">
            <SelectInput value={dueDay} onChange={e => setDueDay(e.target.value)}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}{d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"} of each month</option>
              ))}
            </SelectInput>
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
                {uiText("Due on the")} <strong style={{ color: CL.gold }}>{dueDay}{parseInt(dueDay) === 1 ? "st" : parseInt(dueDay) === 2 ? "nd" : parseInt(dueDay) === 3 ? "rd" : "th"}</strong> {uiText("of each month")} · <strong style={{ color: CL.gold }}>€{parseFloat(amount).toFixed(2)}</strong>/mo
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
