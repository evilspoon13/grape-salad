import { Link } from "react-router-dom";

import { OddsBar } from "../components/OddsBar";
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, formatDate } from "../components/ui";
import { useMarkets } from "../lib/queries";
import { CreateMarketForm } from "./components/CreateMarketForm";
import { Leaderboard } from "./components/Leaderboard";

export default function Markets() {
  const { data: markets, isLoading, error } = useMarkets("all");

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <PageHeader eyebrow="Friend futures" title="Markets" />
        <CreateMarketForm />

        {isLoading && <LoadingState label="Loading markets..." />}
        {error && <ErrorState label="Failed to load markets." />}
        {markets?.length === 0 && (
          <EmptyState title="No markets yet" body="Start one with a clear yes or no question." />
        )}

        <ul className="grid gap-3">
          {markets?.map((m) => (
            <li key={m.id}>
              <Card>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/markets/${m.id}`}
                        className="text-base font-bold leading-6 text-slate-950 hover:text-slate-700"
                      >
                        {m.question}
                      </Link>
                      {m.description && (
                        <p className="mt-1 text-sm text-slate-500">{m.description}</p>
                      )}
                    </div>
                    <span
                      className={`pill ml-auto ${
                        m.status === "open"
                          ? "bg-[#35e58f] text-slate-950"
                          : "bg-slate-200 text-slate-950"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <OddsBar odds={m.implied_odds} />
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <span>{m.pools.total.toLocaleString()} coins staked</span>
                    <span>{m.bet_count} bets</span>
                    <span>Opened {formatDate(m.created_at)}</span>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:pt-16">
        <div className="sticky top-4">
          <Leaderboard />
        </div>
      </aside>
    </section>
  );
}
