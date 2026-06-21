import { Router } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    emailUserId?: string;
  }
}

const router = Router();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [hash, salt] = stored.split(".");
  if (!hash || !salt) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const supplied = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuf, supplied);
}

router.post("/register", async (req: any, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await hashPassword(password);
    const displayName = username?.trim() || email.split("@")[0];

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        displayName,
        username: username?.trim() || null,
        usernameSet: !!username?.trim(),
        firstName: displayName,
      })
      .returning();

    req.session.emailUserId = user.id;
    res.json({ ok: true, user: sanitize(user) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req: any, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.emailUserId = user.id;
    res.json({ ok: true, user: sanitize(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req: any, res) => {
  req.session.emailUserId = undefined;
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/me", async (req: any, res) => {
  try {
    const userId = req.session?.emailUserId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      req.session.emailUserId = undefined;
      return res.status(401).json({ message: "User not found" });
    }
    res.json(sanitize(user));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

function sanitize(user: any) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export default router;
