// M3 — Markets: list of cards (OddsBar, status, pools), CreateMarketForm, leaderboard.
import { Link } from "react-router-dom";

import { useMarkets } from "../lib/queries";
import { OddsBar } from "../components/OddsBar";
import { CreateMarketForm } from "./components/CreateMarketForm";
import { Leaderboard } from "./components/Leaderboard";

export default function Markets() {
  const { data: markets, isLoading, error } = useMarkets("all");

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Markets</h1>
      <Leaderboard />
      <CreateMarketForm />

      {isLoading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-500">Failed to load markets.</p>}

      <ul className="flex flex-col gap-3">
        {markets?.map((m) => (
          <li key={m.id} className="rounded-lg border bg-white p-3">
            <Link to={`/markets/${m.id}`} className="font-medium hover:underline">
              {m.question}
            </Link>
            <div className="mt-1 text-xs uppercase text-gray-400">{m.status}</div>
            <div className="mt-2">
              <OddsBar odds={m.implied_odds} />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {m.pools.total} 🪙 staked · {m.bet_count} bets
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
