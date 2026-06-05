// M3 — create a market (question + optional description).
import { useState } from "react";

import { useCreateMarket } from "../../lib/queries";

export function CreateMarketForm() {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const createMarket = useCreateMarket();

  async function submit() {
    if (!question.trim()) return;
    await createMarket.mutateAsync({ question, description: description || null });
    setQuestion("");
    setDescription("");
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white p-3">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Will Jake hit the gym 3x this week?"
        className="rounded border p-2 text-sm"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional: settlement details"
        className="rounded border p-2 text-sm"
      />
      <button
        onClick={submit}
        disabled={createMarket.isPending}
        className="self-end rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Create market
      </button>
    </div>
  );
}
