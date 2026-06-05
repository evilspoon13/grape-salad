import { Card } from "../../components/ui";
import { UserBadge } from "../../components/UserBadge";
import { useProfiles } from "../../lib/queries";

export function Leaderboard() {
  const { data: profiles } = useProfiles();
  const ranked = [...(profiles ?? [])].sort((a, b) => b.coin_balance - a.coin_balance);

  if (ranked.length === 0) return null;

  return (
    <Card>
      <h2 className="text-sm font-black uppercase text-slate-700">
        Coin leaderboard
      </h2>
      <ol className="mt-3 flex flex-col gap-2">
        {ranked.map((p, i) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-slate-950 bg-[#ffe14d] text-xs font-black text-slate-950 shadow-[2px_2px_0_#0f1028]">
              {i + 1}
            </span>
            <UserBadge user={p} />
            <span className="ml-auto text-sm font-black text-slate-950">
              {p.coin_balance.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
