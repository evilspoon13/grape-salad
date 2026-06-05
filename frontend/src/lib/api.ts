// Central fetch wrapper: base URL + X-User-Id header on every request.
// Wire identity through here so no call ever forgets the header.
//
// When VITE_USE_MOCKS=true, every call is served by the in-memory mock backend
// (src/mocks) instead of the network — so the frontend is fully developable with
// zero backend running. Flip the env var to point at the real FastAPI service.

import { ApiError } from "./errors";
import { SignedUpload } from "./types";

export { ApiError };

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const USER_ID_KEY = "friends-app:user-id";

export function getStoredUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setStoredUserId(id: string | null): void {
  if (id) localStorage.setItem(USER_ID_KEY, id);
  else localStorage.removeItem(USER_ID_KEY);
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  // Some calls (e.g. listing profiles for the picker) can run before a user is chosen.
  requireUser?: boolean;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, requireUser = true } = opts;

  const userId = getStoredUserId();
  if (!userId && requireUser) throw new ApiError(0, "No current user selected");

  if (USE_MOCKS) {
    // Lazy import keeps the mock backend out of the production bundle.
    const { mockApi } = await import("../mocks");
    return mockApi<T>(method, path, body, userId);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userId) headers["X-User-Id"] = userId;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Two-step upload: get a signed URL, PUT the bytes, return the public URL to attach
// to the relevant create call (image_url / audio_url).
export async function uploadFile(file: Blob, kind: "image" | "audio"): Promise<string> {
  if (USE_MOCKS) {
    // No real storage in mock mode: echo the blob back as an object URL so images
    // and audio still render/play locally during frontend dev.
    return URL.createObjectURL(file);
  }

  const { upload_url, public_url } = await api<SignedUpload>("/api/uploads/sign", {
    method: "POST",
    body: { kind, content_type: file.type },
  });
  const put = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new ApiError(put.status, "Upload failed");
  return public_url;
}
