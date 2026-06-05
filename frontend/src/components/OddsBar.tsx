// Visual yes/no split from implied_odds. Falls back to 50/50 on an empty market.
import type { ImpliedOdds } from "../lib/types";

export function OddsBar({ odds }: { odds: ImpliedOdds }) {
  const yes = odds.yes ?? 0.5;
  const yesPct = Math.round(yes * 100);

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-gray-200">
        <div className="bg-green-500" style={{ width: `${yesPct}%` }} />
        <div className="bg-red-400" style={{ width: `${100 - yesPct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>Yes {yesPct}%</span>
        <span>No {100 - yesPct}%</span>
      </div>
    </div>
  );
}
