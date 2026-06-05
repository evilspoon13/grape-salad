import { useState } from "react";

import { Card } from "../../components/ui";
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
    <Card>
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold text-slate-950">Start a market</h2>
          <p className="text-sm text-slate-500">Keep the question specific enough to settle.</p>
        </div>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Will Ty hit the gym 3x this week?"
          className="field"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional settlement details"
          className="field"
        />
        <button
          onClick={submit}
          disabled={createMarket.isPending || !question.trim()}
          className="btn-primary self-start sm:self-end"
        >
          {createMarket.isPending ? "Creating..." : "Create market"}
        </button>
      </div>
    </Card>
  );
}
