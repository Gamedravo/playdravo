import { Router, type RequestHandler } from "express";
import { db } from "../db";
import {
  users, gameStats, gameRatings, gameMods, gameRequests,
  bugReports, contactMessages, gameReports, chatMessages
} from "../../shared/models/auth";
import { eq, desc, and, sql } from "drizzle-orm";
import { isAuthenticated } from "../replit_integrations/auth/index";

const router = Router();

// ─── User Profile ──────────────────────────────────────────────────────────────

router.patch("/user/profile", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.body._userId;
    const allowed = [
      "displayName", "usernameSet", "accentColor", "isDarkMode",
      "favorites", "playHistory", "preferredCategories", "gamerPersona",
      "xp", "level", "username"
    ];
    const updates: Record<string, any> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    const [user] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    res.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ─── Game Stats ────────────────────────────────────────────────────────────────

router.post("/games/:gameId/play", async (req, res) => {
  try {
    const { gameId } = req.params;
    await db.insert(gameStats)
      .values({ id: gameId, plays: 1 })
      .onConflictDoUpdate({
        target: gameStats.id,
        set: { plays: sql`${gameStats.plays} + 1`, updatedAt: new Date() }
      });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error incrementing plays:", error);
    res.status(500).json({ message: "Failed to update plays" });
  }
});

router.get("/games/stats", async (_req, res) => {
  try {
    const stats = await db.select().from(gameStats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching game stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ─── Game Ratings ──────────────────────────────────────────────────────────────

router.get("/games/:gameId/rating", isAuthenticated, async (req: any, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user?.claims?.sub;
    const [rating] = await db.select()
      .from(gameRatings)
      .where(and(eq(gameRatings.gameId, gameId), eq(gameRatings.userId, userId)));
    res.json(rating || null);
  } catch (error) {
    console.error("Error fetching rating:", error);
    res.status(500).json({ message: "Failed to fetch rating" });
  }
});

router.post("/games/:gameId/rate", isAuthenticated, async (req: any, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user?.claims?.sub;
    const { value } = req.body;

    if (typeof value !== "number" || value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    // Get current stats
    const [stats] = await db.select().from(gameStats).where(eq(gameStats.id, gameId));
    const [existingRating] = await db.select()
      .from(gameRatings)
      .where(and(eq(gameRatings.gameId, gameId), eq(gameRatings.userId, userId)));

    let oldRatingCount = stats?.ratingCount || 0;
    let oldTotalRating = stats?.totalRating || 0;
    let newRatingCount = oldRatingCount;
    let newTotalRating = oldTotalRating;

    if (existingRating) {
      newTotalRating = oldTotalRating - existingRating.value + value;
      await db.update(gameRatings)
        .set({ value })
        .where(and(eq(gameRatings.gameId, gameId), eq(gameRatings.userId, userId)));
    } else {
      newRatingCount = oldRatingCount + 1;
      newTotalRating = oldTotalRating + value;
      await db.insert(gameRatings).values({ gameId, userId, value });
    }

    const newAverageRating = newRatingCount > 0 ? parseFloat((newTotalRating / newRatingCount).toFixed(1)) : 0;

    await db.insert(gameStats)
      .values({ id: gameId, rating: newAverageRating, ratingCount: newRatingCount, totalRating: newTotalRating })
      .onConflictDoUpdate({
        target: gameStats.id,
        set: { rating: newAverageRating, ratingCount: newRatingCount, totalRating: newTotalRating, updatedAt: new Date() }
      });

    res.json({ rating: newAverageRating, ratingCount: newRatingCount, userRating: value });
  } catch (error) {
    console.error("Error rating game:", error);
    res.status(500).json({ message: "Failed to submit rating" });
  }
});

// ─── Game Mods ─────────────────────────────────────────────────────────────────

router.get("/games/:gameId/mods", async (req, res) => {
  try {
    const { gameId } = req.params;
    const mods = await db.select().from(gameMods)
      .where(eq(gameMods.gameId, gameId))
      .orderBy(desc(gameMods.downloads));
    res.json(mods);
  } catch (error) {
    console.error("Error fetching mods:", error);
    res.status(500).json({ message: "Failed to fetch mods" });
  }
});

router.post("/games/:gameId/mods", isAuthenticated, async (req: any, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user?.claims?.sub;
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
    const { title, description, version } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

    const modId = Math.random().toString(36).substr(2, 9);
    const [mod] = await db.insert(gameMods).values({
      gameId,
      title: title.trim(),
      description: description?.trim() || "",
      author: userRecord?.displayName || userRecord?.username || "Anonymous",
      authorId: userId,
      version: version || "v1.0.0",
      downloads: 0,
      rating: 5.0,
      thumbnail: `https://picsum.photos/seed/${modId}/200/200`,
    }).returning();
    res.json(mod);
  } catch (error) {
    console.error("Error creating mod:", error);
    res.status(500).json({ message: "Failed to create mod" });
  }
});

// ─── Game Requests ─────────────────────────────────────────────────────────────

router.get("/game-requests", async (_req, res) => {
  try {
    const requests = await db.select().from(gameRequests).orderBy(desc(gameRequests.createdAt)).limit(50);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching game requests:", error);
    res.status(500).json({ message: "Failed to fetch game requests" });
  }
});

router.post("/game-requests", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
    const { gameName, description, link } = req.body;
    if (!gameName?.trim()) return res.status(400).json({ message: "Game name is required" });

    const [request] = await db.insert(gameRequests).values({
      userId,
      userEmail: userRecord?.email || "",
      displayName: userRecord?.displayName || userRecord?.username || "Anonymous Player",
      gameName: gameName.trim(),
      description: description?.trim() || "",
      link: link?.trim() || null,
      status: "pending",
      votes: 0,
    }).returning();
    res.json(request);
  } catch (error) {
    console.error("Error creating game request:", error);
    res.status(500).json({ message: "Failed to submit game request" });
  }
});

router.post("/game-requests/:id/vote", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const [request] = await db.update(gameRequests)
      .set({ votes: sql`${gameRequests.votes} + 1` })
      .where(eq(gameRequests.id, id))
      .returning();
    res.json(request);
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ message: "Failed to record vote" });
  }
});

// Admin: update request status / read
router.patch("/game-requests/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, read } = req.body;
    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (read !== undefined) updates.read = read;
    const [request] = await db.update(gameRequests).set(updates).where(eq(gameRequests.id, id)).returning();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to update game request" });
  }
});

router.delete("/game-requests/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.delete(gameRequests).where(eq(gameRequests.id, id));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete game request" });
  }
});

// ─── Bug Reports ───────────────────────────────────────────────────────────────

router.post("/bug-reports", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { gameName, description, email } = req.body;
    if (!description?.trim()) return res.status(400).json({ message: "Description is required" });

    const [report] = await db.insert(bugReports).values({
      userId: userId || null,
      email: email?.trim() || null,
      gameName: gameName?.trim() || null,
      description: description.trim(),
    }).returning();
    res.json(report);
  } catch (error) {
    console.error("Error creating bug report:", error);
    res.status(500).json({ message: "Failed to submit bug report" });
  }
});

router.get("/bug-reports", isAuthenticated, async (_req, res) => {
  try {
    const reports = await db.select().from(bugReports).orderBy(desc(bugReports.createdAt));
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bug reports" });
  }
});

router.patch("/bug-reports/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    const [report] = await db.update(bugReports).set({ read }).where(eq(bugReports.id, id)).returning();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to update bug report" });
  }
});

router.delete("/bug-reports/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.delete(bugReports).where(eq(bugReports.id, id));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete bug report" });
  }
});

// ─── Contact Messages ──────────────────────────────────────────────────────────

router.post("/contact-messages", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { subject, message, email } = req.body;
    if (!subject?.trim() || !message?.trim()) return res.status(400).json({ message: "Subject and message are required" });

    const [msg] = await db.insert(contactMessages).values({
      userId: userId || null,
      email: email?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
    }).returning();
    res.json(msg);
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(500).json({ message: "Failed to submit message" });
  }
});

router.get("/contact-messages", isAuthenticated, async (_req, res) => {
  try {
    const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

router.patch("/contact-messages/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    const [msg] = await db.update(contactMessages).set({ read }).where(eq(contactMessages.id, id)).returning();
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: "Failed to update message" });
  }
});

router.delete("/contact-messages/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message" });
  }
});

// ─── Game Issue Reports ────────────────────────────────────────────────────────

router.post("/game-reports", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { gameId, gameTitle, reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: "Reason is required" });

    const [report] = await db.insert(gameReports).values({
      gameId,
      gameTitle: gameTitle || null,
      userId,
      reason: reason.trim(),
      status: "pending",
    }).returning();
    res.json(report);
  } catch (error) {
    console.error("Error creating game report:", error);
    res.status(500).json({ message: "Failed to submit report" });
  }
});

// ─── Chat Messages ─────────────────────────────────────────────────────────────

router.get("/chat", isAuthenticated, async (_req, res) => {
  try {
    const messages = await db.select().from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);
    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
});

router.post("/chat", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Text is required" });

    const [msg] = await db.insert(chatMessages).values({
      userId,
      displayName: userRecord?.displayName || userRecord?.username || "Anonymous",
      text: text.trim(),
    }).returning();
    res.json(msg);
  } catch (error) {
    console.error("Error sending chat:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;
