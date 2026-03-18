# Full Application Audit (Frontend + Backend + DB)

Date: 2026-03-18
Scope: `frontend/`, `backend/`, SQL schema, runtime build checks.

## Executive Summary

The app is functional and builds successfully, but there are **critical security and operational gaps**:

1. API routes are largely unauthenticated/unauthorized (any caller can read/write business data).
2. Credentials/PIN expectations are inconsistent between docs and seeded DB values.
3. Frontend API failover logic is partial, causing potential data sync failures if primary API base is down.
4. Password verification can throw in edge cases with malformed stored hashes.
5. Frontend bundle size and duplicated translation keys indicate maintainability/performance issues.

---

## Findings

### 1) Missing API authorization on core CRUD routes (Critical)
Most sensitive routes (`/api/employees`, `/api/clients`, `/api/schedules`, etc.) execute directly with no auth middleware or role checks.

**Impact:** Anyone who can hit the API origin can potentially read/modify/delete data.

**Recommendation:** Add authentication (JWT/session) and role-based authorization middleware before all protected routes.

### 2) Credentials mismatch between README and seeded settings (High)
README says default owner PIN is `1234`, but DB seed sets owner PIN to `LuxAngels@2025` and manager PIN to `Manager@2025`.

**Impact:** Login failures, support overhead, confusion during onboarding/reset.

**Recommendation:** Align README with schema defaults OR change schema defaults to match README.

### 3) Data sync risk: preferences and initial DB load rely on first API candidate only (High)
`saveLang/saveTheme` and startup data load use `API_BASE_CANDIDATES[0]` directly instead of trying all candidates.

**Impact:** If first endpoint is unreachable/misconfigured, preference writes and initial data hydration fail; app appears out-of-sync with DB.

**Recommendation:** Reuse the same resilient fallback strategy used in login (`tryFetch/getWarmBase`) for all reads/writes.

### 4) Password verification robustness issue (Medium)
`verifyPassword` uses `timingSafeEqual` without validating equal-length buffers, which can throw if stored hash is malformed.

**Impact:** A corrupted or non-standard hash can trigger 500 errors at login instead of clean invalid-credentials behavior.

**Recommendation:** Validate expected hash format/length and return `false` safely before `timingSafeEqual`.

### 5) Translation object has many duplicate keys (Low)
Frontend build reports numerous duplicate object keys.

**Impact:** Silent key shadowing, unpredictable translation values, harder maintenance.

**Recommendation:** Split i18n dictionaries into module files and add lint/check step for duplicate keys.

### 6) Large single frontend bundle (Low)
Build warns main chunk is ~1.4MB minified.

**Impact:** Slower initial load on mobile/poor networks.

**Recommendation:** Code-split large sections (dashboard modules, PDF/export logic, reports).

---

## What is Missing (Architecture/Operational)

- Proper auth + role authorization middleware across API.
- Automated tests (backend route tests, frontend smoke tests).
- Linting/static checks in CI.
- Database migrations strategy (currently schema + inline migration blocks).
- Monitoring/audit logs for destructive operations.

---

## Validation Performed

- Installed backend dependencies.
- Installed frontend dependencies.
- Production build for frontend.
- Syntax check for backend server file.

