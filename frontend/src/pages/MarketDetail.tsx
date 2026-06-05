// M3 — MarketDetail: odds, BetForm, bets list, Resolve control (confirm dialog).
import { useParams } from "react-router-dom";

import { useMarket } from "../lib/queries";
import { OddsBar } from "../components/OddsBar";
import { UserBadge } from "../components/UserBadge";
import { BetForm } from "./components/BetForm";
import { ResolveControl } from "./components/ResolveControl";

export default function MarketDetail() {
  const { id = "" } = useParams();
  const { data: market, isLoading, error } = useMarket(id);

  if (isLoading) return <p className="text-gray-400">Loading…</p>;
  if (error || !market) return <p className="text-red-500">Failed to load market.</p>;

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold">{market.question}</h1>
        {market.description && <p className="text-gray-500">{market.description}</p>}
      </header>

      <OddsBar odds={market.implied_odds} />
      <div className="text-sm text-gray-500">
        {market.pools.yes} 🪙 yes · {market.pools.no} 🪙 no · {market.pools.total} total
      </div>

      {market.status === "open" ? (
        <>
          <BetForm marketId={market.id} />
          <ResolveControl marketId={market.id} />
        </>
      ) : (
        <div className="rounded-lg bg-gray-100 p-3 text-sm">
          Resolved — outcome: <strong>{market.outcome}</strong>
        </div>
      )}

      <h2 className="font-semibold">Bets</h2>
      <ul className="flex flex-col gap-2">
        {market.bets.map((bet) => (
          <li key={bet.id} className="rounded-lg border bg-white p-2 text-sm">
            <div className="flex items-center gap-2">
              <UserBadge user={bet.user} />
              <span className={bet.position === "yes" ? "text-green-600" : "text-red-500"}>
                {bet.position}
              </span>
              <span className="ml-auto">{bet.amount} 🪙</span>
            </div>
            {bet.comment && <p className="mt-1 text-gray-500">{bet.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
