// M3 — yes/no toggle, amount, optional comment. Surfaces 400 (funds) / 409 (closed).
import { useState } from "react";

import { ApiError } from "../../lib/api";
import { usePlaceBet } from "../../lib/queries";
import type { Position } from "../../lib/types";

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
      // 400 insufficient funds / 409 market closed are surfaced via placeBet.error below.
      if (!(err instanceof ApiError)) throw err;
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white p-3">
      <div className="flex gap-2">
        {(["yes", "no"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPosition(p)}
            className={`flex-1 rounded-lg border py-1.5 text-sm ${
              position === p ? "border-indigo-500 bg-indigo-50" : ""
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="rounded border p-2 text-sm"
      />
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional trash talk"
        className="rounded border p-2 text-sm"
      />
      <button
        onClick={submit}
        disabled={placeBet.isPending}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Place bet
      </button>
      {placeBet.error instanceof ApiError && (
        <p className="text-sm text-red-500">{placeBet.error.detail}</p>
      )}
    </div>
  );
}
