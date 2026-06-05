// M3 — coin balances leaderboard from GET /api/profiles.
import { useProfiles } from "../../lib/queries";

export function Leaderboard() {
  const { data: profiles } = useProfiles();
  const ranked = [...(profiles ?? [])].sort((a, b) => b.coin_balance - a.coin_balance);

  if (ranked.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white p-3">
      <h2 className="mb-2 text-sm font-semibold text-gray-500">Leaderboard</h2>
      <ol className="flex flex-col gap-1 text-sm">
        {ranked.map((p, i) => (
          <li key={p.id} className="flex justify-between">
            <span>
              {i + 1}. {p.display_name}
            </span>
            <span>{p.coin_balance} 🪙</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
