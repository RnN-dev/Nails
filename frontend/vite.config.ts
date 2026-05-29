import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

type DevPhoto = {
  id: string;
  title: string;
  category: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

const devPhotos: DevPhoto[] = [];

function loadRootEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), "..", ".env");

  if (!existsSync(envPath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");
    });
    req.on("end", () => {
      try {
        resolveBody(body ? (JSON.parse(body) as Record<string, unknown>) : {});
      } catch (error) {
        rejectBody(error);
      }
    });
    req.on("error", rejectBody);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function verifyDevAuth(req: IncomingMessage, secret: string): boolean {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  try {
    jwt.verify(authorization.slice("Bearer ".length), secret);
    return true;
  } catch {
    return false;
  }
}

async function handleDevAuth(req: IncomingMessage, res: ServerResponse, env: Record<string, string>): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readBody(req);
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const adminEmail = env.ADMIN_EMAIL?.toLowerCase();
  const passwordHash = env.ADMIN_PASSWORD_HASH;
  const jwtSecret = env.JWT_SECRET;

  if (!adminEmail || !passwordHash || !jwtSecret) {
    sendJson(res, 500, { error: "Local admin env is not configured" });
    return;
  }

  const valid = email === adminEmail && (await bcrypt.compare(password, passwordHash));

  if (!valid) {
    sendJson(res, 401, { error: "Invalid email or password" });
    return;
  }

  sendJson(res, 200, {
    token: jwt.sign({ sub: email, role: "admin" }, jwtSecret, { expiresIn: "8h", issuer: "aline-studio-dev" }),
    expiresIn: 28800
  });
}

async function handleDevPhotos(req: IncomingMessage, res: ServerResponse, env: Record<string, string>): Promise<void> {
  const jwtSecret = env.JWT_SECRET;
  const path = req.url?.split("?")[0] ?? "/";
  const id = path.split("/").filter(Boolean)[0];

  if (req.method === "GET" && path === "/") {
    sendJson(res, 200, { photos: devPhotos });
    return;
  }

  if (!jwtSecret || !verifyDevAuth(req, jwtSecret)) {
    sendJson(res, 401, { error: "Missing or invalid token" });
    return;
  }

  if (req.method === "POST" && path === "/") {
    const body = await readBody(req);
    const image = typeof body.image === "string" ? body.image : "";
    const mimeMatch = image.match(/^data:(image\/(?:jpeg|png|webp));base64,/);

    if (!mimeMatch) {
      sendJson(res, 415, { error: "Only JPG, PNG or WEBP images are accepted" });
      return;
    }

    const photo: DevPhoto = {
      id: crypto.randomUUID(),
      title: typeof body.title === "string" ? body.title.slice(0, 80) : "Nail design",
      category: typeof body.category === "string" ? body.category.slice(0, 40) : "Nail Art",
      filename: typeof body.filename === "string" ? body.filename.slice(0, 120) : "nail-design",
      mimeType: mimeMatch[1],
      size: Buffer.byteLength(image),
      url: image,
      createdAt: new Date().toISOString()
    };

    devPhotos.unshift(photo);
    sendJson(res, 201, photo);
    return;
  }

  if (req.method === "PATCH" && id) {
    const body = await readBody(req);
    const photo = devPhotos.find((item) => item.id === id);

    if (!photo) {
      sendJson(res, 404, { error: "Photo not found" });
      return;
    }

    photo.title = typeof body.title === "string" ? body.title.slice(0, 80) : photo.title;
    photo.category = typeof body.category === "string" ? body.category.slice(0, 40) : photo.category;
    sendJson(res, 200, photo);
    return;
  }

  if (req.method === "DELETE" && id) {
    const index = devPhotos.findIndex((item) => item.id === id);

    if (index === -1) {
      sendJson(res, 404, { error: "Photo not found" });
      return;
    }

    devPhotos.splice(index, 1);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "aline-studio-local-api",
      configureServer(server) {
        const env = loadRootEnv();

        server.middlewares.use("/api/auth", (req, res) => {
          void handleDevAuth(req, res, env).catch(() => sendJson(res, 400, { error: "Auth request failed" }));
        });
        server.middlewares.use("/api/photos", (req, res) => {
          void handleDevPhotos(req, res, env).catch(() => sendJson(res, 400, { error: "Photo request failed" }));
        });
      }
    }
  ],
  server: {
    port: 5173
  }
});
