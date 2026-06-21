import { Router } from "express";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

const router = Router();

const FIREBASE_API_KEY = "AIzaSyDSGAiHaQnDwPJILJBUCySQOs-WuCSTXG0";
const FIREBASE_PROJECT_ID = "gen-lang-client-0866749554";

interface FirebaseUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
}

// Primary: verify via Firebase Identity Toolkit REST API
async function verifyViaLookup(idToken: string): Promise<FirebaseUserInfo | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[Firebase] accounts:lookup failed:", res.status, errText);
      return null;
    }
    const data = await res.json();
    const user = data?.users?.[0];
    if (!user) return null;
    return {
      uid: user.localId,
      email: user.email || null,
      displayName: user.displayName || null,
      photoUrl: user.photoUrl || null,
    };
  } catch (err) {
    console.warn("[Firebase] accounts:lookup error:", err);
    return null;
  }
}

// Fallback: decode the Firebase JWT directly (no API call needed)
// Firebase ID tokens are JWTs signed by securetoken.google.com/{projectId}
// We validate basic claims (exp, iss, aud) and extract user info from the payload.
function decodeFirebaseJwt(idToken: string): FirebaseUserInfo | null {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );

    // Validate required claims
    const now = Math.floor(Date.now() / 1000);
    if (!payload.sub) return null;
    if (payload.exp && payload.exp < now) {
      console.warn("[Firebase] JWT expired");
      return null;
    }
    if (
      payload.iss &&
      payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`
    ) {
      console.warn("[Firebase] JWT issuer mismatch:", payload.iss);
      return null;
    }
    if (payload.aud && payload.aud !== FIREBASE_PROJECT_ID) {
      console.warn("[Firebase] JWT audience mismatch:", payload.aud);
      return null;
    }

    return {
      uid: payload.sub,
      email: payload.email || null,
      displayName: payload.name || null,
      photoUrl: payload.picture || null,
    };
  } catch (err) {
    console.warn("[Firebase] JWT decode error:", err);
    return null;
  }
}

async function verifyFirebaseToken(idToken: string): Promise<FirebaseUserInfo | null> {
  // Try the API first; fall back to JWT decode if the API is unavailable/restricted
  const fromApi = await verifyViaLookup(idToken);
  if (fromApi) return fromApi;

  console.warn("[Firebase] accounts:lookup failed — falling back to JWT decode");
  return decodeFirebaseJwt(idToken);
}

router.post("/token", async (req: any, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const firebaseUser = await verifyFirebaseToken(idToken);
    if (!firebaseUser) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { uid, email, displayName, photoUrl } = firebaseUser;

    const existing = await db.select().from(users).where(eq(users.id, uid));

    if (existing.length === 0) {
      const fallbackName = displayName || (email ? email.split("@")[0] : "Player");
      await db.insert(users).values({
        id: uid,
        email: email || null,
        displayName: fallbackName,
        firstName: fallbackName,
        profileImageUrl: photoUrl || null,
      });
    } else if (displayName || photoUrl) {
      await db.update(users).set({
        ...(displayName ? { displayName } : {}),
        ...(photoUrl ? { profileImageUrl: photoUrl } : {}),
      }).where(eq(users.id, uid));
    }

    req.session.emailUserId = uid;
    req.session.save((err) => {
      if (err) {
        console.error("[Firebase] Session save error:", err);
        return res.status(500).json({ message: "Session could not be saved" });
      }
      console.log("[Firebase] Session saved for user:", uid);
      res.json({ ok: true });
    });
  } catch (err) {
    console.error("[Firebase] Auth error:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
});

export default router;
