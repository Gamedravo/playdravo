import { Router } from "express";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

const router = Router();

const FIREBASE_API_KEY = "AIzaSyDSGAiHaQnDwPJILJBUCySQOs-WuCSTXG0";

async function verifyFirebaseToken(idToken: string): Promise<{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
} | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.users?.[0];
    if (!user) return null;
    return {
      uid: user.localId,
      email: user.email || null,
      displayName: user.displayName || null,
      photoUrl: user.photoUrl || null,
    };
  } catch {
    return null;
  }
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
    res.json({ ok: true });
  } catch (err) {
    console.error("Firebase auth error:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
});

export default router;
