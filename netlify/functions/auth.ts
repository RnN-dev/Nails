import type { Config, Context } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cleanText, getEnv, jsonResponse, optionsResponse, readJsonObject } from "./utils/http";

export default async function auth(req: Request, _context: Context): Promise<Response> {
  if (req.method === "OPTIONS") {
    return optionsResponse(req);
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }

  try {
    const body = await readJsonObject(req);
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const adminEmail = getEnv("ADMIN_EMAIL")?.toLowerCase();
    const passwordHash = getEnv("ADMIN_PASSWORD_HASH");
    const jwtSecret = getEnv("JWT_SECRET");

    if (!adminEmail || !passwordHash || !jwtSecret || jwtSecret.length < 32) {
      return jsonResponse(req, { error: "Admin authentication is not configured" }, 500);
    }

    if (!email || !password || email !== adminEmail) {
      return jsonResponse(req, { error: "Invalid email or password" }, 401);
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);

    if (!isValidPassword) {
      return jsonResponse(req, { error: "Invalid email or password" }, 401);
    }

    const token = jwt.sign({ sub: email, role: "admin" }, jwtSecret, {
      expiresIn: "8h",
      issuer: "studio-luminail"
    });

    return jsonResponse(req, { token, expiresIn: 28800 });
  } catch {
    return jsonResponse(req, { error: "Invalid request" }, 400);
  }
}

export const config: Config = {
  path: "/api/auth"
};
