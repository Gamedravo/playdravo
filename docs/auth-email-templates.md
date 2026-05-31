# GameDravo — Firebase Auth Email Templates

Configure these in **Firebase Console → Authentication → Templates** before enabling production email flows.

## Sender domain

| Field | Value |
|-------|--------|
| From name | GameDravo |
| From address | `noreply@gamedravo.com` |
| Reply-to | `support@gamedravo.com` |

Add SPF/DKIM records for `gamedravo.com` in your DNS provider and verify the domain in Firebase.

## Templates

### Email address verification

- **Subject:** Verify your GameDravo account
- **Action URL:** `https://gamedravo.com/` (or current origin via `getAuthActionCodeSettings()`)
- **Support footer:** Questions? Contact [support@gamedravo.com](mailto:support@gamedravo.com)

### Password reset

- **Subject:** Reset your GameDravo password
- **Action URL:** `https://gamedravo.com/`
- **Support footer:** Didn't request this? Contact [support@gamedravo.com](mailto:support@gamedravo.com)

### Email address change / account recovery

- **Subject:** Recover your GameDravo account
- **Reply-to:** `support@gamedravo.com`

## Code integration

The app uses `getAuthActionCodeSettings()` from `src/lib/authEmailConfig.ts` for:

- Password reset (`LoginModal` → Forgot Password)
- Future: `sendEmailVerification`, account recovery flows

Ensure `gamedravo.com` and `www.gamedravo.com` are in **Authentication → Settings → Authorized domains**.
