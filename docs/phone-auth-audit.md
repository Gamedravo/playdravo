# Phone Authentication Audit Report

**Date:** May 31, 2026  
**Project:** PlayDravo / GameDravo  
**Firebase project:** `gen-lang-client-0866749554`

---

## Audit checklist (10 items)

| # | Requirement | Before | After | Status |
|---|-------------|--------|-------|--------|
| 1 | RecaptchaVerifier initialized before `signInWithPhoneNumber()` | Created but **no `render()`** | `getRecaptchaVerifier()` awaits **`render()`** before OTP | **Fixed** |
| 2 | Invisible reCAPTCHA container in DOM | `#recaptcha-container` inside phone form only | Same ID, always mounted when phone UI open, `min-h-[1px]` | **Verified** |
| 3 | `recaptchaVerifier.render()` succeeds | **Never called** | Awaited; widget ID logged in debug mode | **Fixed** |
| 4 | App Check not blocking Phone Auth | No App Check in codebase | Still none — not a blocker | **Pass** |
| 5 | E.164 format (+351…) | Raw input passed to Firebase | `toE164()` — default **+351** for PT mobiles | **Fixed** |
| 6 | Log exact Firebase error code | Generic toast only | `console.error` + debug panel + phone-specific toasts | **Fixed** |
| 7 | Single RecaptchaVerifier instance | `window.recaptchaVerifier` without guard | Singleton via `getRecaptchaVerifier()` + `clearRecaptchaVerifier()` | **Fixed** |
| 8 | `gamedravo.com` authorized in Firebase | **Cannot verify from code** | Checklist below — **manual Console step required** | **Action needed** |
| 9 | Firebase test phone numbers | Not documented | See [Test phone setup](#test-phone-setup) | **Documented** |
| 10 | Visible debug logs | None | Dev + `localStorage` debug panel in LoginModal | **Fixed** |

---

## Root cause (production failures)

The previous flow in `LoginModal.tsx`:

```typescript
window.recaptchaVerifier = setupRecaptcha('recaptcha-container');
await signInWithPhone(phoneNumber, window.recaptchaVerifier);
```

**Problems:**
1. **`render()` was never called** — Firebase modular SDK requires `await verifier.render()` before `signInWithPhoneNumber`.
2. **No E.164 normalization** — numbers like `912345678` or `351912345678` were sent as-is → `auth/invalid-phone-number`.
3. **Errors not logged with `code`** — hard to diagnose `auth/captcha-check-failed` vs `auth/unauthorized-domain`.

---

## Implementation (new module)

**`src/lib/phoneAuth.ts`**

| Function | Purpose |
|----------|---------|
| `toE164(raw)` | Normalize to `+351912345678` |
| `getRecaptchaVerifier()` | Singleton + `render()` |
| `sendPhoneOtp(raw, onState?)` | E.164 → reCAPTCHA → `signInWithPhoneNumber` |
| `verifyPhoneOtp(confirmation, otp)` | OTP confirm with logging |
| `clearRecaptchaVerifier()` | Tear down singleton |
| `prewarmRecaptcha()` | Pre-render when phone tab opens |
| `phoneAuthLog()` / `logFirebasePhoneError()` | Debug + error codes |

**`LoginModal.tsx`**
- Pre-warms reCAPTCHA 100ms after phone method selected
- Debug panel when `import.meta.env.DEV` **or** `localStorage.setItem('playdravo_phone_auth_debug', '1')`
- Shows: reCAPTCHA state, phone flow state, E.164, last Firebase code, current hostname

---

## App Check (item 4)

Searched entire repo: **no** `initializeAppCheck`, `ReCaptchaV3Provider`, or App Check imports.

Phone Auth is **not** blocked by App Check in this project.

If App Check is enabled later in Firebase Console without client SDK registration, Phone Auth would fail with token errors — enable App Check in client before enforcing.

---

## Authorized domains (item 8)

**Cannot be verified from repository** — must confirm in:

[Firebase Console](https://console.firebase.google.com/) → **Authentication** → **Settings** → **Authorized domains**

Add if missing:

| Domain | Purpose |
|--------|---------|
| `gamedravo.com` | Production |
| `www.gamedravo.com` | Production www |
| `playdravo.com` | Alternate brand |
| `www.playdravo.com` | Alternate www |
| `localhost` | Local dev |
| `127.0.0.1` | Local dev |
| `gen-lang-client-0866749554.firebaseapp.com` | Firebase hosting default |

**Symptom if missing:** `auth/unauthorized-domain` or `auth/captcha-check-failed`

Current runtime hostname is logged in the phone auth debug panel.

Also enable **Phone** provider: Authentication → Sign-in method → Phone → Enable.

### SMS region policy (common cause of `auth/operation-not-allowed`)

If Phone is enabled but users in Portugal (+351) still see **"Phone sign-in is not enabled"**, the real cause is often **SMS region policy**:

Firebase Console → **Authentication** → **Settings** → **SMS region policy**

- Allow **Portugal (PT)** or use **Allow all regions** for production
- Without Blaze billing, production SMS to real numbers will also fail

---

## Production fix (May 31, 2026)

1. **reCAPTCHA container moved to `document.body`** via `PhoneRecaptchaPortal` — was clipped inside `overflow-hidden` login modal
2. **Firebase project logged** on every phone OTP attempt (`Firebase Project ID`, `Auth Domain`)
3. **Errors show actual `error.code` + `error.message`** instead of generic "not enabled"
4. **Runtime authorized-domain check** via Identity Toolkit API
5. **Diagnostic logs** (always on OTP start): Phone Auth Started, reCAPTCHA Initialized, OTP Request Sent/Failed

Enable verbose debug: `localStorage.setItem('playdravo_phone_auth_debug', '1')`

---

## Test phone setup (item 9)

Firebase Console → Authentication → Sign-in method → Phone → **Phone numbers for testing**

Example configuration:

| Phone number (E.164) | Verification code |
|---------------------|-------------------|
| +351 910 000 001 | 123456 |
| +1 650 555 3434 | 654321 |

Test numbers:
- Do not consume SMS quota
- Work with reCAPTCHA in test mode
- Use exact E.164 in the app input (or local `912000001` → auto `+351912000001`)

---

## Enable debug mode (item 10)

**Development:** debug panel shows automatically.

**Production QA:** in browser DevTools console:

```javascript
localStorage.setItem('playdravo_phone_auth_debug', '1');
// reload, open Login → Phone
```

**Console log prefix:** `[PlayDravo Phone Auth · recaptcha|phone|firebase]`

**Firebase errors always log:**

```
[PlayDravo Phone Auth · firebase] signInWithPhoneNumber failed { code, message, name }
```

---

## Common Firebase error codes

| Code | Meaning | Fix |
|------|---------|-----|
| `auth/invalid-phone-number` | Bad E.164 | Use `+3519xxxxxxxx` format |
| `auth/captcha-check-failed` | reCAPTCHA failed | Check domain authorized, render() success |
| `auth/quota-exceeded` | SMS limit | Use test numbers or upgrade plan |
| `auth/too-many-requests` | Rate limited | Wait, use test numbers |
| `auth/unauthorized-domain` | Domain not whitelisted | Add `gamedravo.com` in Console |
| `auth/operation-not-allowed` | Phone provider disabled **OR SMS region blocked** | Enable Phone in Console; allow PT (+351) in **SMS region policy**; upgrade to Blaze |
| `auth/invalid-verification-code` | Wrong OTP | Re-enter code |
| `auth/code-expired` | OTP expired | Resend OTP |

---

## E.164 normalization examples

| User input | Normalized |
|------------|------------|
| `912 345 678` | `+351912345678` |
| `351912345678` | `+351912345678` |
| `+351912345678` | `+351912345678` |
| `00351912345678` | `+351912345678` |
| `5551234567` (10 digits) | `+15551234567` |

Default country code: **351** (Portugal). Override by passing full international `+` prefix.

---

## Manual QA script

1. Enable debug: `localStorage.setItem('playdravo_phone_auth_debug', '1')`
2. Open Login modal → **Continue with Phone**
3. Confirm debug panel: `reCAPTCHA: rendered` (after ~100ms)
4. Enter test number `910000001` → preview shows `+351910000001`
5. Send OTP → console shows `signInWithPhoneNumber succeeded`
6. Enter test code `123456` → login succeeds
7. On failure → note **Last Firebase code** in debug panel

---

## Files changed

- `src/lib/phoneAuth.ts` — new phone + reCAPTCHA module
- `src/lib/authErrors.ts` — phone-specific errors + code logging
- `src/components/LoginModal.tsx` — integrated module + debug UI
- `src/firebase.ts` — removed broken `setupRecaptcha` / raw `signInWithPhone`
- `docs/phone-auth-audit.md` — this report
