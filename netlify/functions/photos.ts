import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import {
  cleanText,
  corsHeaders,
  jsonResponse,
  optionsResponse,
  readJsonObject,
  safeFilePart
} from "./utils/http";
import { verifyAdminRequest } from "./utils/auth-middleware";

type MimeType = "image/jpeg" | "image/png" | "image/webp";

type PhotoRecord = {
  id: string;
  title: string;
  category: string;
  filename: string;
  mimeType: MimeType;
  size: number;
  blobKey: string;
  url: string;
  createdAt: string;
};

const INDEX_KEY = "photos/index.json";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function createId(): string {
  return crypto.randomUUID();
}

async function loadIndex(): Promise<PhotoRecord[]> {
  const store = getStore("nail-studio-photos");
  const value = (await store.get(INDEX_KEY, { type: "json" })) as PhotoRecord[] | null;

  return Array.isArray(value) ? value : [];
}

async function saveIndex(records: PhotoRecord[]): Promise<void> {
  const store = getStore("nail-studio-photos");
  await store.setJSON(INDEX_KEY, records);
}

function detectMime(buffer: Buffer): MimeType | null {
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function extensionFromMime(mimeType: MimeType): string {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  return "webp";
}

function parseBase64Image(value: unknown): Buffer | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.includes(",") ? value.split(",").at(-1) ?? "" : value;
  const buffer = Buffer.from(normalized, "base64");

  return buffer.length > 0 ? buffer : null;
}

async function handleList(req: Request): Promise<Response> {
  const records = await loadIndex();

  return jsonResponse(req, {
    photos: records
      .map(({ blobKey: _blobKey, ...publicRecord }) => publicRecord)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  });
}

async function handleImage(req: Request, id: string): Promise<Response> {
  const records = await loadIndex();
  const record = records.find((item) => item.id === id);

  if (!record) {
    return jsonResponse(req, { error: "Photo not found" }, 404);
  }

  const store = getStore("nail-studio-photos");
  const image = await store.get(record.blobKey, { type: "arrayBuffer" });

  if (!image) {
    return jsonResponse(req, { error: "Photo binary not found" }, 404);
  }

  return new Response(image, {
    status: 200,
    headers: {
      ...corsHeaders(req),
      "Content-Type": record.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

async function handleCreate(req: Request): Promise<Response> {
  const auth = verifyAdminRequest(req);

  if (auth instanceof Response) {
    return auth;
  }

  const body = await readJsonObject(req);
  const title = cleanText(body.title, 80) || "Nail design";
  const category = cleanText(body.category, 40) || "Nail Art";
  const originalName = safeFilePart(cleanText(body.filename, 120) || "nail-design");
  const buffer = parseBase64Image(body.image);

  if (!buffer) {
    return jsonResponse(req, { error: "Image payload is required" }, 400);
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    return jsonResponse(req, { error: "Image exceeds the 5MB limit" }, 413);
  }

  const mimeType = detectMime(buffer);

  if (!mimeType) {
    return jsonResponse(req, { error: "Only valid JPG, PNG or WEBP images are accepted" }, 415);
  }

  const id = createId();
  const filename = `${originalName || "nail-design"}-${id}.${extensionFromMime(mimeType)}`;
  const blobKey = `photos/${filename}`;
  const createdAt = new Date().toISOString();
  const record: PhotoRecord = {
    id,
    title,
    category,
    filename,
    mimeType,
    size: buffer.length,
    blobKey,
    url: `/api/photos/${id}/image`,
    createdAt
  };

  const store = getStore("nail-studio-photos");
  const imageData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

  await store.set(blobKey, imageData, {
    metadata: {
      contentType: mimeType
    }
  });

  const records = await loadIndex();
  await saveIndex([record, ...records]);

  const { blobKey: _blobKey, ...publicRecord } = record;
  return jsonResponse(req, publicRecord, 201);
}

async function handleUpdate(req: Request, id: string): Promise<Response> {
  const auth = verifyAdminRequest(req);

  if (auth instanceof Response) {
    return auth;
  }

  const body = await readJsonObject(req);
  const records = await loadIndex();
  const index = records.findIndex((item) => item.id === id);

  if (index === -1) {
    return jsonResponse(req, { error: "Photo not found" }, 404);
  }

  records[index] = {
    ...records[index],
    title: cleanText(body.title, 80) || records[index].title,
    category: cleanText(body.category, 40) || records[index].category
  };

  await saveIndex(records);

  const { blobKey: _blobKey, ...publicRecord } = records[index];
  return jsonResponse(req, publicRecord);
}

async function handleDelete(req: Request, id: string): Promise<Response> {
  const auth = verifyAdminRequest(req);

  if (auth instanceof Response) {
    return auth;
  }

  const records = await loadIndex();
  const target = records.find((item) => item.id === id);

  if (!target) {
    return jsonResponse(req, { error: "Photo not found" }, 404);
  }

  const store = getStore("nail-studio-photos");
  await store.delete(target.blobKey);
  await saveIndex(records.filter((item) => item.id !== id));

  return jsonResponse(req, { ok: true });
}

export default async function photos(req: Request, context: Context): Promise<Response> {
  if (req.method === "OPTIONS") {
    return optionsResponse(req);
  }

  const id = context.params.id;
  const isImageRoute = new URL(req.url).pathname.endsWith("/image");

  try {
    if (req.method === "GET" && id && isImageRoute) {
      return handleImage(req, id);
    }

    if (req.method === "GET" && !id) {
      return handleList(req);
    }

    if (req.method === "POST" && !id) {
      return handleCreate(req);
    }

    if (req.method === "PATCH" && id) {
      return handleUpdate(req, id);
    }

    if (req.method === "DELETE" && id) {
      return handleDelete(req, id);
    }

    return jsonResponse(req, { error: "Method not allowed" }, 405);
  } catch {
    return jsonResponse(req, { error: "Photo request failed" }, 400);
  }
}

export const config: Config = {
  path: ["/api/photos", "/api/photos/:id", "/api/photos/:id/image"]
};
