// Visual yes/no split from implied_odds. Falls back to 50/50 on an empty market.
import type { ImpliedOdds } from "../lib/types";

export function OddsBar({ odds }: { odds: ImpliedOdds }) {
  const yes = odds.yes ?? 0.5;
  const yesPct = Math.round(yes * 100);

  return (
    <div>
      <div className="flex h-5 overflow-hidden rounded-md border-2 border-slate-950 bg-slate-200 shadow-[3px_3px_0_#0f1028]">
        <div className="bg-[#35e58f]" style={{ width: `${yesPct}%` }} />
        <div className="bg-[#ff4f8b]" style={{ width: `${100 - yesPct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-black uppercase text-slate-700">
        <span>Yes {yesPct}%</span>
        <span>No {100 - yesPct}%</span>
      </div>
    </div>
  );
}
