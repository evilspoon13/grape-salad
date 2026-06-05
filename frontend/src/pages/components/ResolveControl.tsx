import { useState } from "react";

import { useResolveMarket } from "../../lib/queries";
import type { Outcome } from "../../lib/types";

export function ResolveControl({ marketId }: { marketId: string }) {
  const [pending, setPending] = useState<Outcome | null>(null);
  const resolve = useResolveMarket(marketId);

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Resolve market</p>
      <p className="mt-1 text-amber-800">
        Anyone can resolve an open market, and payouts happen immediately.
      </p>
      {pending ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="font-medium">Confirm outcome: {pending.toUpperCase()}?</span>
          <button
            onClick={() => resolve.mutate({ outcome: pending })}
            disabled={resolve.isPending}
            className="inline-flex items-center justify-center rounded-md bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
          >
            {resolve.isPending ? "Resolving..." : "Confirm"}
          </button>
          <button onClick={() => setPending(null)} className="btn-secondary">
            Cancel
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button onClick={() => setPending("yes")} className="btn-secondary">
            Resolve yes
          </button>
          <button onClick={() => setPending("no")} className="btn-secondary">
            Resolve no
          </button>
        </div>
      )}
    </div>
  );
}
