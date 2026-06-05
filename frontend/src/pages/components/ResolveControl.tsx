// M3 — anyone can resolve, and it pays everyone out, so require a confirm step.
import { useState } from "react";

import { useResolveMarket } from "../../lib/queries";
import type { Outcome } from "../../lib/types";

export function ResolveControl({ marketId }: { marketId: string }) {
  const [pending, setPending] = useState<Outcome | null>(null);
  const resolve = useResolveMarket(marketId);

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
      <p className="font-medium">Resolve this market (anyone can — pays everyone out)</p>
      {pending ? (
        <div className="mt-2 flex items-center gap-2">
          <span>Confirm outcome “{pending}”?</span>
          <button
            onClick={() => resolve.mutate({ outcome: pending })}
            className="rounded bg-amber-600 px-2 py-1 text-white"
          >
            Confirm
          </button>
          <button onClick={() => setPending(null)} className="px-2 py-1">
            Cancel
          </button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <button onClick={() => setPending("yes")} className="rounded border px-2 py-1">
            Resolve YES
          </button>
          <button onClick={() => setPending("no")} className="rounded border px-2 py-1">
            Resolve NO
          </button>
        </div>
      )}
    </div>
  );
}
