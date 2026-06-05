// In-memory mock backend implementing the full API contract (see ../../FRONTEND_PLAN.md).
// Enabled by VITE_USE_MOCKS=true. Lets the frontend be built and demoed with no backend:
// state lives for the page session and resets on reload. Money math mirrors the backend's
// parimutuel rules so betting/resolving actually moves balances.

import { ApiError } from "../lib/errors";
import type {
  Bet,
  Digest,
  MarketDetail,
  MarketSummary,
  Outcome,
  Position,
  Post,
  Profile,
  UserRef,
  VoiceMemo,
  VoiceThread,
} from "../lib/types";

const uid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

// ---- Seed data ------------------------------------------------------------
// Stable ids so a hard-coded localStorage user survives nicely during dev.
const profiles: Profile[] = [
  { id: "11111111-1111-1111-1111-111111111111", display_name: "Maya", avatar_url: null, coin_balance: 1000 },
  { id: "22222222-2222-2222-2222-222222222222", display_name: "Jake", avatar_url: null, coin_balance: 1000 },
  { id: "33333333-3333-3333-3333-333333333333", display_name: "Sam", avatar_url: null, coin_balance: 1000 },
  { id: "44444444-4444-4444-4444-444444444444", display_name: "Priya", avatar_url: null, coin_balance: 1000 },
];

interface RawPost {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}
interface RawMemo {
  id: string;
  author_id: string;
  audio_url: string;
  duration_seconds: number | null;
  parent_id: string | null;
  created_at: string;
}
interface RawMarket {
  id: string;
  creator_id: string;
  question: string;
  description: string | null;
  status: "open" | "resolved";
  outcome: Outcome | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}
interface RawBet {
  id: string;
  market_id: string;
  user_id: string;
  position: Position;
  amount: number;
  comment: string | null;
  created_at: string;
}

const posts: RawPost[] = [
  {
    id: uid(),
    author_id: profiles[0].id,
    content: "Moved into the new place in Austin. The AC is a lie.",
    image_url: null,
    created_at: nowIso(),
  },
];
const memos: RawMemo[] = [];
const markets: RawMarket[] = [
  {
    id: uid(),
    creator_id: profiles[0].id,
    question: "Will Jake hit the gym 3x this week?",
    description: "settles Sunday",
    status: "open",
    outcome: null,
    resolved_by: null,
    resolved_at: null,
    created_at: nowIso(),
  },
];
const bets: RawBet[] = [];
const digests: Digest[] = [];

// ---- Helpers --------------------------------------------------------------
function profile(id: string): Profile {
  const p = profiles.find((x) => x.id === id);
  if (!p) throw new ApiError(400, "Unknown X-User-Id");
  return p;
}
function userRef(id: string): UserRef {
  const p = profile(id);
  return { id: p.id, display_name: p.display_name, avatar_url: p.avatar_url };
}
function requireUser(userId: string | null): string {
  if (!userId) throw new ApiError(400, "Unknown X-User-Id");
  profile(userId); // validates
  return userId;
}

function pools(marketId: string) {
  const ms = bets.filter((b) => b.market_id === marketId);
  const yes = ms.filter((b) => b.position === "yes").reduce((s, b) => s + b.amount, 0);
  const no = ms.filter((b) => b.position === "no").reduce((s, b) => s + b.amount, 0);
  return { yes, no, total: yes + no };
}
function impliedOdds(p: { yes: number; no: number; total: number }) {
  if (p.total === 0) return { yes: null, no: null };
  return { yes: p.yes / p.total, no: p.no / p.total };
}

function marketSummary(m: RawMarket): MarketSummary {
  const p = pools(m.id);
  return {
    id: m.id,
    question: m.question,
    description: m.description,
    status: m.status,
    outcome: m.outcome,
    creator: userRef(m.creator_id),
    pools: p,
    implied_odds: impliedOdds(p),
    bet_count: bets.filter((b) => b.market_id === m.id).length,
    created_at: m.created_at,
  };
}
function betOut(b: RawBet): Bet {
  return {
    id: b.id,
    user: userRef(b.user_id),
    position: b.position,
    amount: b.amount,
    comment: b.comment,
    created_at: b.created_at,
  };
}
function marketDetail(m: RawMarket): MarketDetail {
  return {
    ...marketSummary(m),
    resolved_by: m.resolved_by,
    resolved_at: m.resolved_at,
    bets: bets.filter((b) => b.market_id === m.id).map(betOut),
  };
}
function memoOut(m: RawMemo): VoiceMemo {
  return {
    id: m.id,
    author: userRef(m.author_id),
    audio_url: m.audio_url,
    duration_seconds: m.duration_seconds,
    reply_count: memos.filter((x) => x.parent_id === m.id).length,
    created_at: m.created_at,
  };
}

function findMarket(id: string): RawMarket {
  const m = markets.find((x) => x.id === id);
  if (!m) throw new ApiError(404, "Market not found");
  return m;
}

// ---- Money ops (mirror backend transactional rules) -----------------------
function placeBet(userId: string, marketId: string, body: { position: Position; amount: number; comment: string | null }) {
  const me = profile(userId);
  const m = findMarket(marketId);
  if (m.status !== "open") throw new ApiError(409, "Market is not open");
  if (body.amount <= 0) throw new ApiError(400, "Amount must be positive");
  if (me.coin_balance < body.amount) throw new ApiError(400, "Insufficient funds");
  me.coin_balance -= body.amount; // escrow
  bets.push({
    id: uid(),
    market_id: marketId,
    user_id: userId,
    position: body.position,
    amount: body.amount,
    comment: body.comment,
    created_at: nowIso(),
  });
  return marketDetail(m);
}

function resolveMarket(userId: string, marketId: string, outcome: Outcome) {
  const m = findMarket(marketId);
  if (m.status === "resolved") throw new ApiError(409, "Market already resolved");
  const p = pools(marketId);
  const winningPool = outcome === "yes" ? p.yes : p.no;
  const marketBets = bets.filter((b) => b.market_id === marketId);

  if (winningPool === 0) {
    // Nobody bet the winning side -> refund every stake (void the market cleanly).
    for (const b of marketBets) profile(b.user_id).coin_balance += b.amount;
  } else {
    for (const b of marketBets.filter((b) => b.position === outcome)) {
      profile(b.user_id).coin_balance += Math.floor((b.amount * p.total) / winningPool);
    }
  }
  m.status = "resolved";
  m.outcome = outcome;
  m.resolved_by = userId;
  m.resolved_at = nowIso();
  return marketDetail(m);
}

// ---- Router ---------------------------------------------------------------
// `body` is whatever the caller passed to api(); handlers narrow it with `as`.
export async function mockApi<T>(method: string, path: string, body: unknown, userId: string | null): Promise<T> {
  await new Promise((r) => setTimeout(r, 120)); // tiny latency so loading states show
  const url = path.split("?")[0];
  const query = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
  const seg = url.split("/").filter(Boolean); // e.g. ["api","markets","<id>","bets"]

  const route = `${method} ${url}`;

  // Profiles
  if (route === "GET /api/profiles") return profiles as T;
  if (method === "GET" && seg[1] === "profiles" && seg.length === 3) return profile(seg[2]) as T;
  if (method === "POST" && seg[1] === "profiles" && seg[3] === "grant") {
    const p = profile(seg[2]);
    p.coin_balance += Number((body as { amount: number }).amount);
    return p as T;
  }

  // Posts
  if (route === "GET /api/posts") {
    return [...posts]
      .reverse()
      .map<Post>((p) => ({
        id: p.id,
        author: userRef(p.author_id),
        content: p.content,
        image_url: p.image_url,
        created_at: p.created_at,
      })) as T;
  }
  if (route === "POST /api/posts") {
    const me = requireUser(userId);
    const b = body as { content: string; image_url: string | null };
    const raw: RawPost = { id: uid(), author_id: me, content: b.content, image_url: b.image_url, created_at: nowIso() };
    posts.push(raw);
    return { id: raw.id, author: userRef(me), content: raw.content, image_url: raw.image_url, created_at: raw.created_at } as T;
  }

  // Voice memos
  if (route === "GET /api/voice-memos") {
    return memos.filter((m) => m.parent_id === null).reverse().map(memoOut) as T;
  }
  if (method === "GET" && seg[1] === "voice-memos" && seg[3] === "thread") {
    const root = memos.find((m) => m.id === seg[2]);
    if (!root) throw new ApiError(404, "Memo not found");
    const thread: VoiceThread = {
      root: memoOut(root),
      replies: memos.filter((m) => m.parent_id === root.id).map(memoOut),
    };
    return thread as T;
  }
  if (route === "POST /api/voice-memos") {
    const me = requireUser(userId);
    const b = body as { audio_url: string; duration_seconds: number | null; parent_id: string | null };
    const raw: RawMemo = { id: uid(), author_id: me, audio_url: b.audio_url, duration_seconds: b.duration_seconds, parent_id: b.parent_id, created_at: nowIso() };
    memos.push(raw);
    return memoOut(raw) as T;
  }

  // Markets & betting
  if (route === "GET /api/markets") {
    const status = query.get("status") ?? "open";
    return markets
      .filter((m) => status === "all" || m.status === status)
      .reverse()
      .map(marketSummary) as T;
  }
  if (method === "GET" && seg[1] === "markets" && seg.length === 3) return marketDetail(findMarket(seg[2])) as T;
  if (route === "POST /api/markets") {
    const me = requireUser(userId);
    const b = body as { question: string; description: string | null };
    const raw: RawMarket = {
      id: uid(),
      creator_id: me,
      question: b.question,
      description: b.description,
      status: "open",
      outcome: null,
      resolved_by: null,
      resolved_at: null,
      created_at: nowIso(),
    };
    markets.push(raw);
    return marketDetail(raw) as T;
  }
  if (method === "POST" && seg[1] === "markets" && seg[3] === "bets") {
    return placeBet(requireUser(userId), seg[2], body as { position: Position; amount: number; comment: string | null }) as T;
  }
  if (method === "POST" && seg[1] === "markets" && seg[3] === "resolve") {
    return resolveMarket(requireUser(userId), seg[2], (body as { outcome: Outcome }).outcome) as T;
  }

  // Uploads (handled in api.ts uploadFile; this is here for completeness)
  if (route === "POST /api/uploads/sign") {
    return { upload_url: "mock://upload", public_url: "mock://public" } as T;
  }

  // Digest
  if (route === "POST /api/digests/generate") {
    const recent = posts.slice(-10).map((p) => `- **${profile(p.author_id).display_name}**: ${p.content}`).join("\n");
    const d: Digest = {
      id: uid(),
      period_start: new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
      content: `# This Week in the Group Chat\n\n_(mock digest — the real one is an Anthropic call)_\n\n${recent || "_Quiet week._"}`,
      created_at: nowIso(),
    };
    digests.push(d);
    return d as T;
  }
  if (route === "GET /api/digests") return [...digests].reverse() as T;
  if (method === "GET" && seg[1] === "digests" && seg.length === 3) {
    const d = digests.find((x) => x.id === seg[2]);
    if (!d) throw new ApiError(404, "Digest not found");
    return d as T;
  }

  throw new ApiError(404, `Mock: no handler for ${route}`);
}
