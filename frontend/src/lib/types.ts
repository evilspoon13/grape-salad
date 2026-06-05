// Hand-written mirror of the backend API Contract (see ../../../BACKEND_PLAN.md).
// You can replace this with generated types: `npm run gen:api` -> src/lib/api-types.ts.

export type UUID = string;

export interface UserRef {
  id: UUID;
  display_name: string;
  avatar_url: string | null;
}

export interface Profile {
  id: UUID;
  display_name: string;
  avatar_url: string | null;
  coin_balance: number;
}

export interface Post {
  id: UUID;
  author: UserRef;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface VoiceMemo {
  id: UUID;
  author: UserRef;
  audio_url: string;
  duration_seconds: number | null;
  reply_count: number;
  created_at: string;
}

export interface VoiceThread {
  root: VoiceMemo;
  replies: VoiceMemo[];
}

export type MarketStatus = "open" | "resolved";
export type Outcome = "yes" | "no";
export type Position = "yes" | "no";

export interface Pools {
  yes: number;
  no: number;
  total: number;
}

export interface ImpliedOdds {
  yes: number | null;
  no: number | null;
}

export interface Bet {
  id: UUID;
  user: UserRef;
  position: Position;
  amount: number;
  comment: string | null;
  created_at: string;
}

export interface MarketSummary {
  id: UUID;
  question: string;
  description: string | null;
  status: MarketStatus;
  outcome: Outcome | null;
  creator: UserRef;
  pools: Pools;
  implied_odds: ImpliedOdds;
  bet_count: number;
  created_at: string;
}

export interface MarketDetail extends MarketSummary {
  resolved_by: UUID | null;
  resolved_at: string | null;
  bets: Bet[];
}

export interface Digest {
  id: UUID;
  period_start: string;
  period_end: string;
  content: string;
  created_at: string;
}

export interface SignedUpload {
  upload_url: string;
  public_url: string;
}
