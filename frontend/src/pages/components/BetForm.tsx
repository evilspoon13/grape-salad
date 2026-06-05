import { useState } from "react";

import { ApiError } from "../../lib/api";
import { usePlaceBet } from "../../lib/queries";
import type { Position } from "../../lib/types";
import { Card } from "../../components/ui";

export function BetForm({ marketId }: { marketId: string }) {
  const [position, setPosition] = useState<Position>("yes");
  const [amount, setAmount] = useState(10);
  const [comment, setComment] = useState("");
  const placeBet = usePlaceBet(marketId);

  async function submit() {
    try {
      await placeBet.mutateAsync({ position, amount, comment: comment || null });
      setComment("");
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-slate-950">Place a bet</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["yes", "no"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold capitalize transition ${
                position === p
                  ? p === "yes"
                    ? "border-slate-950 bg-[#35e58f] text-slate-950 shadow-[3px_3px_0_#0f1028]"
                    : "border-slate-950 bg-[#ff4f8b] text-white shadow-[3px_3px_0_#0f1028]"
                  : "border-slate-950 bg-white text-slate-950 hover:bg-cyan-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <label className="text-sm font-medium text-slate-600">
            Amount
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="field mt-1"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Comment
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional trash talk"
              className="field mt-1"
            />
          </label>
        </div>
        <button
          onClick={submit}
          disabled={placeBet.isPending || amount < 1}
          className="btn-primary self-start"
        >
          {placeBet.isPending ? "Placing..." : "Place bet"}
        </button>
        {placeBet.error instanceof ApiError && (
          <p className="text-sm font-medium text-rose-600">{placeBet.error.detail}</p>
        )}
      </div>
    </Card>
  );
}
