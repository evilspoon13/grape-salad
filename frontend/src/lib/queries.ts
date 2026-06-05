// TanStack Query hooks, one per endpoint. Use these everywhere — avoid hand-rolled
// fetch + useEffect. Until a backend endpoint is implemented, you can mock the response
// here and swap to the real `api(...)` call later.

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./api";
import type {
  Bet,
  Digest,
  MarketDetail,
  MarketSummary,
  Post,
  Profile,
  UUID,
  VoiceMemo,
  VoiceThread,
} from "./types";

// ---- Profiles -------------------------------------------------------------
export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    // picker runs before a user is chosen, so don't require the header here.
    queryFn: () => api<Profile[]>("/api/profiles", { requireUser: false }),
  });
}

export function useProfile(id: UUID) {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: () => api<Profile>(`/api/profiles/${id}`, { requireUser: false }),
  });
}

// ---- Posts ----------------------------------------------------------------
export function usePosts(limit = 50) {
  return useQuery({
    queryKey: ["posts", limit],
    queryFn: () => api<Post[]>(`/api/posts?limit=${limit}`, { requireUser: false }),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { content: string; image_url: string | null }) =>
      api<Post>("/api/posts", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

// ---- Voice memos ----------------------------------------------------------
export function useVoiceMemos() {
  return useQuery({
    queryKey: ["voice-memos"],
    queryFn: () => api<VoiceMemo[]>("/api/voice-memos", { requireUser: false }),
  });
}

export function useVoiceThread(id: UUID) {
  return useQuery({
    queryKey: ["voice-memos", id, "thread"],
    queryFn: () => api<VoiceThread>(`/api/voice-memos/${id}/thread`, { requireUser: false }),
  });
}

export function useCreateVoiceMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      audio_url: string;
      duration_seconds: number | null;
      parent_id: UUID | null;
    }) => api<VoiceMemo>("/api/voice-memos", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voice-memos"] }),
  });
}

// ---- Markets & betting ----------------------------------------------------
export function useMarkets(status: "open" | "resolved" | "all" = "open") {
  return useQuery({
    queryKey: ["markets", status],
    queryFn: () =>
      api<MarketSummary[]>(`/api/markets?status=${status}`, { requireUser: false }),
  });
}

export function useMarket(id: UUID) {
  return useQuery({
    queryKey: ["markets", id],
    queryFn: () => api<MarketDetail>(`/api/markets/${id}`, { requireUser: false }),
  });
}

export function useCreateMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { question: string; description: string | null }) =>
      api<MarketDetail>("/api/markets", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["markets"] }),
  });
}

export function usePlaceBet(marketId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { position: Bet["position"]; amount: number; comment: string | null }) =>
      api<MarketDetail>(`/api/markets/${marketId}/bets`, { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
      qc.invalidateQueries({ queryKey: ["profiles"] }); // balances changed
    },
  });
}

export function useResolveMarket(marketId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { outcome: "yes" | "no" }) =>
      api<MarketDetail>(`/api/markets/${marketId}/resolve`, { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
      qc.invalidateQueries({ queryKey: ["profiles"] }); // payouts changed balances
    },
  });
}

// ---- Digest ---------------------------------------------------------------
export function useDigests() {
  return useQuery({
    queryKey: ["digests"],
    queryFn: () => api<Digest[]>("/api/digests", { requireUser: false }),
  });
}

export function useDigest(id: UUID) {
  return useQuery({
    queryKey: ["digests", id],
    queryFn: () => api<Digest>(`/api/digests/${id}`, { requireUser: false }),
  });
}

export function useGenerateDigest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { period_start: string | null; period_end: string | null }) =>
      api<Digest>("/api/digests/generate", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digests"] }),
  });
}
