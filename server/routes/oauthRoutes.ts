import { Router } from "express";
import { randomBytes } from "crypto";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    oauthState?: string;
  }
}

const router = Router();

function getBaseUrl(req: any): string {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.hostname;
  return `${proto}://${host}`;
}

async function upsertOAuthUser(params: {
  oauthId: string;
  provider: string;
  email: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
}): Promise<string> {
  const { oauthId, provider, email, displayName, profileImageUrl } = params;
  const id = `${provider}_${oauthId}`;
  const fallbackName = displayName || (email ? email.split("@")[0] : "Player");

  const [existing] = await db.select().from(users).where(eq(users.id, id));

  if (existing) {
    await db.update(users).set({
      ...(displayName ? { displayName } : {}),
      ...(profileImageUrl ? { profileImageUrl } : {}),
      updatedAt: new Date(),
    }).where(eq(users.id, id));
  } else {
    let insertEmail = email;
    if (email) {
      const [emailConflict] = await db.select().from(users).where(eq(users.email, email));
      if (emailConflict) insertEmail = null;
    }

    await db.insert(users).values({
      id,
      email: insertEmail,
      displayName: fallbackName,
      firstName: fallbackName,
      profileImageUrl: profileImageUrl || null,
    });
  }

  return id;
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

router.get("/github", (req: any, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.redirect("/?oauth_error=" + encodeURIComponent("GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your environment variables."));
  }

  const state = randomBytes(16).toString("hex");
  req.session.oauthState = state;
  req.session.save(() => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${getBaseUrl(req)}/api/auth/github/callback`,
      scope: "read:user user:email",
      state,
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  });
});

router.get("/github/callback", async (req: any, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) return res.redirect(`/?oauth_error=${encodeURIComponent(String(error))}`);
    if (!code || state !== req.session.oauthState) {
      return res.redirect("/?oauth_error=" + encodeURIComponent("OAuth state mismatch. Please try again."));
    }
    req.session.oauthState = undefined;

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${getBaseUrl(req)}/api/auth/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json() as any;
    if (tokenData.error || !tokenData.access_token) {
      return res.redirect(`/?oauth_error=${encodeURIComponent(tokenData.error_description || tokenData.error || "Token exchange failed")}`);
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/json",
    };

    const [userRes, emailsRes] = await Promise.all([
      fetch("https://api.github.com/user", { headers }),
      fetch("https://api.github.com/user/emails", { headers }),
    ]);
    const ghUser = await userRes.json() as any;
    const emailList = await emailsRes.json() as any;

    const primaryEmail: string | null =
      ghUser.email ||
      (Array.isArray(emailList)
        ? (emailList.find((e: any) => e.primary && e.verified)?.email ?? null)
        : null);

    const userId = await upsertOAuthUser({
      oauthId: String(ghUser.id),
      provider: "github",
      email: primaryEmail,
      displayName: ghUser.name || ghUser.login || null,
      profileImageUrl: ghUser.avatar_url || null,
    });

    req.session.emailUserId = userId;
    req.session.save((err) => {
      if (err) return res.redirect("/?oauth_error=" + encodeURIComponent("Session could not be saved"));
      res.redirect("/");
    });
  } catch (err) {
    console.error("[OAuth] GitHub callback error:", err);
    res.redirect("/?oauth_error=" + encodeURIComponent("GitHub sign-in failed. Please try again."));
  }
});

// ─── Microsoft ────────────────────────────────────────────────────────────────

router.get("/microsoft", (req: any, res) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!clientId) {
    return res.redirect("/?oauth_error=" + encodeURIComponent("Microsoft OAuth is not configured. Add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET to your environment variables."));
  }

  const state = randomBytes(16).toString("hex");
  req.session.oauthState = state;
  req.session.save(() => {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: `${getBaseUrl(req)}/api/auth/microsoft/callback`,
      scope: "openid email profile User.Read",
      state,
      response_mode: "query",
    });
    res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`);
  });
});

router.get("/microsoft/callback", async (req: any, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) return res.redirect(`/?oauth_error=${encodeURIComponent(String(error_description || error))}`);
    if (!code || state !== req.session.oauthState) {
      return res.redirect("/?oauth_error=" + encodeURIComponent("OAuth state mismatch. Please try again."));
    }
    req.session.oauthState = undefined;

    const tokenParams = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code: code as string,
      redirect_uri: `${getBaseUrl(req)}/api/auth/microsoft/callback`,
      grant_type: "authorization_code",
      scope: "openid email profile User.Read",
    });

    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams,
    });
    const tokenData = await tokenRes.json() as any;
    if (tokenData.error || !tokenData.access_token) {
      return res.redirect(`/?oauth_error=${encodeURIComponent(tokenData.error_description || tokenData.error || "Token exchange failed")}`);
    }

    const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/json" },
    });
    const profile = await profileRes.json() as any;

    const email: string | null = profile.mail || profile.userPrincipalName || null;

    const userId = await upsertOAuthUser({
      oauthId: profile.id || String(Date.now()),
      provider: "microsoft",
      email,
      displayName: profile.displayName || null,
      profileImageUrl: null,
    });

    req.session.emailUserId = userId;
    req.session.save((err) => {
      if (err) return res.redirect("/?oauth_error=" + encodeURIComponent("Session could not be saved"));
      res.redirect("/");
    });
  } catch (err) {
    console.error("[OAuth] Microsoft callback error:", err);
    res.redirect("/?oauth_error=" + encodeURIComponent("Microsoft sign-in failed. Please try again."));
  }
});

// ─── Google ───────────────────────────────────────────────────────────────────

router.get("/google", (req: any, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.redirect("/?oauth_error=" + encodeURIComponent("Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables."));
  }

  const state = randomBytes(16).toString("hex");
  req.session.oauthState = state;
  req.session.save(() => {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: `${getBaseUrl(req)}/api/auth/google/callback`,
      scope: "openid email profile",
      state,
      access_type: "online",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });
});

router.get("/google/callback", async (req: any, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) return res.redirect(`/?oauth_error=${encodeURIComponent(String(error))}`);
    if (!code || state !== req.session.oauthState) {
      return res.redirect("/?oauth_error=" + encodeURIComponent("OAuth state mismatch. Please try again."));
    }
    req.session.oauthState = undefined;

    const tokenParams = new URLSearchParams({
      code: code as string,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${getBaseUrl(req)}/api/auth/google/callback`,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams,
    });
    const tokenData = await tokenRes.json() as any;
    if (tokenData.error || !tokenData.access_token) {
      return res.redirect(`/?oauth_error=${encodeURIComponent(tokenData.error_description || tokenData.error || "Token exchange failed")}`);
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json() as any;

    const userId = await upsertOAuthUser({
      oauthId: profile.id || String(Date.now()),
      provider: "google",
      email: profile.email || null,
      displayName: profile.name || null,
      profileImageUrl: profile.picture || null,
    });

    req.session.emailUserId = userId;
    req.session.save((err) => {
      if (err) return res.redirect("/?oauth_error=" + encodeURIComponent("Session could not be saved"));
      res.redirect("/");
    });
  } catch (err) {
    console.error("[OAuth] Google callback error:", err);
    res.redirect("/?oauth_error=" + encodeURIComponent("Google sign-in failed. Please try again."));
  }
});

export default router;
