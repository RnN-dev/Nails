import jwt from "jsonwebtoken";
import { getEnv, jsonResponse } from "./http";

type AdminClaims = {
  sub: string;
  role: "admin";
  exp: number;
};

function isAdminClaims(value: string | jwt.JwtPayload): value is AdminClaims {
  return (
    typeof value !== "string" &&
    typeof value.sub === "string" &&
    value.role === "admin" &&
    typeof value.exp === "number"
  );
}

export function verifyAdminRequest(req: Request): AdminClaims | Response {
  const secret = getEnv("JWT_SECRET");
  const header = req.headers.get("authorization");

  if (!secret || secret.length < 32) {
    return jsonResponse(req, { error: "Server auth is not configured" }, 500);
  }

  if (!header?.startsWith("Bearer ")) {
    return jsonResponse(req, { error: "Missing authorization token" }, 401);
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, secret);

    if (!isAdminClaims(decoded)) {
      return jsonResponse(req, { error: "Invalid authorization token" }, 401);
    }

    return decoded;
  } catch {
    return jsonResponse(req, { error: "Expired or invalid authorization token" }, 401);
  }
}
