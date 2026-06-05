// Central fetch wrapper: base URL + X-User-Id header on every request.
// Wire identity through here so no call ever forgets the header.

import { SignedUpload } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const USER_ID_KEY = "friends-app:user-id";

export function getStoredUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setStoredUserId(id: string | null): void {
  if (id) localStorage.setItem(USER_ID_KEY, id);
  else localStorage.removeItem(USER_ID_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
    this.name = "ApiError";
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  // Some calls (e.g. listing profiles for the picker) can run before a user is chosen.
  requireUser?: boolean;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, requireUser = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const userId = getStoredUserId();
  if (userId) headers["X-User-Id"] = userId;
  else if (requireUser) throw new ApiError(0, "No current user selected");

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
