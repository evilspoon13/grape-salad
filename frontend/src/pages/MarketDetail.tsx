import { Link, useParams } from "react-router-dom";

import { OddsBar } from "../components/OddsBar";
import { UserBadge } from "../components/UserBadge";
import { Card, EmptyState, ErrorState, LoadingState, formatDate } from "../components/ui";
import { useMarket } from "../lib/queries";
import { BetForm } from "./components/BetForm";
import { ResolveControl } from "./components/ResolveControl";

export default function MarketDetail() {
  const { id = "" } = useParams();
  const { data: market, isLoading, error } = useMarket(id);

  if (isLoading) return <LoadingState label="Loading market..." />;
  if (error || !market) return <ErrorState label="Failed to load market." />;

  return (
    <section className="flex flex-col gap-5">
      <Link to="/markets" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
        Back to markets
      </Link>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                <UserBadge user={market.creator} />
                <span>opened {formatDate(market.created_at)}</span>
              </div>
              <h1 className="text-2xl font-bold leading-tight text-slate-950">{market.question}</h1>
              {market.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{market.description}</p>
              )}
            </div>
            <span
              className={`pill sm:ml-auto ${
                market.status === "open"
                  ? "bg-[#35e58f] text-slate-950"
                  : "bg-slate-200 text-slate-950"
              }`}
            >
              {market.status}
            </span>
          </div>

          <OddsBar odds={market.implied_odds} />
          <div className="grid gap-2 sm:grid-cols-3">
            <PoolStat label="Yes pool" value={market.pools.yes} tone="yes" />
            <PoolStat label="No pool" value={market.pools.no} tone="no" />
            <PoolStat label="Total staked" value={market.pools.total} tone="total" />
          </div>
        </div>
      </Card>

      {market.status === "open" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <BetForm marketId={market.id} />
          <ResolveControl marketId={market.id} />
        </div>
      ) : (
        <Card className="bg-[#ffe14d]">
          <p className="text-sm font-black uppercase text-slate-700">Resolved outcome</p>
          <p className="mt-1 text-2xl font-black uppercase text-slate-950">{market.outcome}</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-950">Bets</h2>
        {market.bets.length === 0 && (
          <EmptyState title="No bets yet" body="Be the first person to take a side." />
        )}
        <ul className="grid gap-2">
          {market.bets.map((bet) => (
            <li key={bet.id}>
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <UserBadge user={bet.user} />
                  <span
                    className={`pill ${
                      bet.position === "yes"
                        ? "bg-[#35e58f] text-slate-950"
                        : "bg-[#ff4f8b] text-white"
                    }`}
                  >
                    {bet.position}
                  </span>
                  <span className="ml-auto text-sm font-bold text-slate-800">
                    {bet.amount.toLocaleString()} coins
                  </span>
                </div>
                {bet.comment && <p className="mt-2 text-sm text-slate-500">{bet.comment}</p>}
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PoolStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "yes" | "no" | "total";
}) {
  const toneClass =
    tone === "yes"
      ? "border-2 border-slate-950 bg-[#35e58f] text-slate-950"
      : tone === "no"
        ? "border-2 border-slate-950 bg-[#ff4f8b] text-white"
        : "border-2 border-slate-950 bg-[#ffe14d] text-slate-950";

  return (
    <div className={`rounded-md px-3 py-2 ${toneClass}`}>
      <p className="text-xs font-black uppercase opacity-75">{label}</p>
      <p className="mt-1 text-lg font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
