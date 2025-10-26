import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Initialize demo users
async function initializeDemoUsers() {
  const adminExists = await kv.get("user:admin@alumni.edu");
  if (!adminExists) {
    await kv.set("user:admin@alumni.edu", {
      id: "admin-1",
      email: "admin@alumni.edu",
      password: "admin123", // In production, use hashed passwords
      name: "Admin User",
      role: "admin",
      class: "2010",
      major: "Computer Science",
      company: "Alumni Portal Inc.",
      position: "System Administrator",
      location: "Boston, MA",
      industries: ["Technology", "Education"],
    });
  }

  const userExists = await kv.get("user:user@alumni.edu");
  if (!userExists) {
    await kv.set("user:user@alumni.edu", {
      id: "user-1",
      email: "user@alumni.edu",
      password: "user123",
      name: "Regular User",
      role: "user",
      class: "2018",
      major: "Business",
      company: "Startup Co",
      position: "Product Manager",
      location: "New York, NY",
      industries: ["Business", "Technology"],
    });
  }
}

// Initialize on startup
initializeDemoUsers();

// Middleware to check authentication
async function requireAuth(c: any, next: any) {
  const sessionToken = c.req.header("X-Session-Token");
  if (!sessionToken) {
    return c.json({ message: "Unauthorized - No session token provided" }, 401);
  }

  const session = await kv.get(`session:${sessionToken}`);

  if (!session) {
    return c.json({ message: "Invalid or expired session" }, 401);
  }

  c.set("user", session);
  await next();
}

// Middleware to check moderator/admin role
async function requireModerator(c: any, next: any) {
  const user = c.get("user");
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return c.json({ message: "Forbidden - Moderator access required" }, 403);
  }
  await next();
}

// Health check endpoint
app.get("/make-server-d96042de/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth routes
app.post("/make-server-d96042de/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const user = await kv.get(`user:${email}`);
    if (!user || user.password !== password) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    // Create session token
    const token = crypto.randomUUID();
    await kv.set(`session:${token}`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      class: user.class,
      major: user.major,
      company: user.company,
      position: user.position,
      location: user.location,
      industries: user.industries,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return c.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ message: "Login failed" }, 500);
  }
});

app.post("/make-server-d96042de/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ message: "User already exists" }, 400);
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      role: "user",
    };

    await kv.set(`user:${email}`, newUser);

    // Create session token
    const token = crypto.randomUUID();
    await kv.set(`session:${token}`, {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return c.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ message: "Signup failed" }, 500);
  }
});

app.get("/make-server-d96042de/auth/verify", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

app.put("/make-server-d96042de/auth/profile", requireAuth, async (c) => {
  try {
    const user = c.get("user");
    const updates = await c.req.json();

    const existingUser = await kv.get(`user:${user.email}`);
    if (!existingUser) {
      return c.json({ message: "User not found" }, 404);
    }

    const updatedUser = {
      ...existingUser,
      ...updates,
      email: existingUser.email, // Don't allow email changes
      role: existingUser.role, // Don't allow role changes
      password: existingUser.password, // Don't allow password changes via this endpoint
    };

    await kv.set(`user:${user.email}`, updatedUser);

    // Update session
    const sessionToken = c.req.header("X-Session-Token");
    const { password: _, ...userWithoutPassword } = updatedUser;
    await kv.set(`session:${sessionToken}`, userWithoutPassword);

    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Profile update error:", error);
    return c.json({ message: "Update failed" }, 500);
  }
});

// Admin routes
app.get(
  "/make-server-d96042de/admin/data",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      // Get all data from KV store
      const eventsData = await kv.getByPrefix("event:");
      const jobsData = await kv.getByPrefix("job:");
      const newsData = await kv.getByPrefix("news:");
      const usersData = await kv.getByPrefix("user:");

      // Extract just the value from each object
      const events = eventsData.map((item: any) => item.value);
      const jobs = jobsData.map((item: any) => item.value);
      const news = newsData.map((item: any) => item.value);

      const users = usersData.map((item: any) => {
        const { password: _, ...userWithoutPassword } = item.value;
        return userWithoutPassword;
      });

      return c.json({
        events: eventsData || [],
        jobs: jobsData || [],
        news: newsData || [],
        users: users || [],
      });
    } catch (error) {
      console.error("Admin data fetch error:", error);
      return c.json({ message: "Failed to fetch data" }, 500);
    }
  }
);

app.delete(
  "/make-server-d96042de/admin/:type/:id",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      const type = c.req.param("type");
      const id = c.req.param("id");

      console.log("=== DELETE START ===");
      console.log("Type:", type);
      console.log("ID:", id);

      // Remove the 's' to get singular form for key prefix
      const prefix = type.slice(0, -1);
      const key = `${prefix}:${id}`;

      console.log("Key to delete:", key);

      // Check if the item exists first
      console.log("Checking if item exists...");
      const existing = await kv.get(key);
      console.log("Server: Found existing item:", existing);

      if (!existing) {
        console.log("Item not found!");
        return c.json({ message: "Item not found" }, 404);
      }

      console.log("Attempting to delete...");
      // Try to delete
      await kv.del(key);
      console.log("Server: Delete command completed");

      // Verify deletion by trying to read the key again
      console.log("Verifying deletion...");
      const verifyDelete = await kv.get(key);
      console.log("Server: Verification read after delete:", verifyDelete);

      await kv.del(`${prefix}:${id}`);
      if (verifyDelete !== null && verifyDelete !== undefined) {
        console.log("DELETE FAILED - Item still exists!");
        return c.json({ message: "Delete verification failed" }, 500);
      }
      console.log("=== DELETE SUCCESS ===");
      return c.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error);
      return c.json({ message: "Delete failed" }, 500);
    }
  }
);

// Public routes for fetching events, jobs, and news
app.get("/make-server-d96042de/events", async (c) => {
  try {
    const eventsData = await kv.getByPrefix("event:");
    const events = eventsData.map((item: any) => item.value);

    return c.json({ events: events || [] });
  } catch (error) {
    console.error("Events fetch error:", error);
    return c.json({ message: "Failed to fetch events" }, 500);
  }
});

app.get("/make-server-d96042de/jobs", async (c) => {
  try {
    const jobsData = await kv.getByPrefix("job:");
    const jobs = jobsData.map((item: any) => item.value);

    return c.json({ jobs: jobs || [] });
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return c.json({ message: "Failed to fetch jobs" }, 500);
  }
});

app.get("/make-server-d96042de/news", async (c) => {
  try {
    const newsData = await kv.getByPrefix("news:");
    const news = newsData.map((item: any) => item.value);

    return c.json({ news: news || [] });
  } catch (error) {
    console.error("News fetch error:", error);
    return c.json({ message: "Failed to fetch news" }, 500);
  }
});

// Alumni directory endpoint
app.get("/make-server-d96042de/alumni", async (c) => {
  try {
    const usersData = await kv.getByPrefix("user:");
    const users = usersData.map((item: any) => item.value);

    // Remove password from all users
    const alumni = users.map((user: any) => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return c.json({ alumni: alumni || [] });
  } catch (error) {
    console.error("Alumni fetch error:", error);
    return c.json({ message: "Failed to fetch alumni" }, 500);
  }
});

// Admin routes for creating and updating content
app.post(
  "/make-server-d96042de/admin/events",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      const eventData = await c.req.json();
      const id = crypto.randomUUID();
      const event = {
        id,
        ...eventData,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`event:${id}`, event);
      return c.json({ event });
    } catch (error) {
      console.error("Event creation error:", error);
      return c.json({ message: "Failed to create event" }, 500);
    }
  }
);

app.put(
  "/make-server-d96042de/admin/events/:id",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      const existing = await kv.get(`event:${id}`);

      if (!existing) {
        return c.json({ message: "Event not found" }, 404);
      }

      const updated = {
        ...existing,
        ...updates,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(`event:${id}`, updated);
      return c.json({ event: updated });
    } catch (error) {
      console.error("Event update error:", error);
      return c.json({ message: "Failed to update event" }, 500);
    }
  }
);

app.post(
  "/make-server-d96042de/admin/jobs",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      const jobData = await c.req.json();
      const id = crypto.randomUUID();
      const job = {
        id,
        ...jobData,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`job:${id}`, job);
      return c.json({ job });
    } catch (error) {
      console.error("Job creation error:", error);
      return c.json({ message: "Failed to create job" }, 500);
    }
  }
);

app.put(
  "/make-server-d96042de/admin/jobs/:id",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      const existing = await kv.get(`job:${id}`);

      if (!existing) {
        return c.json({ message: "Job not found" }, 404);
      }

      const updated = {
        ...existing,
        ...updates,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(`job:${id}`, updated);
      return c.json({ job: updated });
    } catch (error) {
      console.error("Job update error:", error);
      return c.json({ message: "Failed to update job" }, 500);
    }
  }
);

app.post(
  "/make-server-d96042de/admin/news",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      const newsData = await c.req.json();
      const id = crypto.randomUUID();
      const article = {
        id,
        ...newsData,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`news:${id}`, article);
      return c.json({ article });
    } catch (error) {
      console.error("News creation error:", error);
      return c.json({ message: "Failed to create news article" }, 500);
    }
  }
);

app.put(
  "/make-server-d96042de/admin/news/:id",
  requireAuth,
  requireModerator,
  async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      const existing = await kv.get(`news:${id}`);

      if (!existing) {
        return c.json({ message: "News article not found" }, 404);
      }

      const updated = {
        ...existing,
        ...updates,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(`news:${id}`, updated);
      return c.json({ article: updated });
    } catch (error) {
      console.error("News update error:", error);
      return c.json({ message: "Failed to update news article" }, 500);
    }
  }
);

Deno.serve(app.fetch);
