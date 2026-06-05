// M5 — Digest: list past digests, a Generate button (loading state), render markdown.
import { useState } from "react";
import Markdown from "react-markdown";

import { useDigests, useGenerateDigest } from "../lib/queries";

export default function Digest() {
  const { data: digests, isLoading } = useDigests();
  const generate = useGenerateDigest();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Digest</h1>
        <button
          onClick={() => generate.mutate({ period_start: null, period_end: null })}
          disabled={generate.isPending}
          className="ml-auto rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {generate.isPending ? "Generating… (takes a few seconds)" : "Generate this week"}
        </button>
      </div>

      {isLoading && <p className="text-gray-400">Loading…</p>}
      {digests?.length === 0 && <p className="text-gray-400">No digests yet.</p>}

      <ul className="flex flex-col gap-3">
        {digests?.map((d) => (
          <li key={d.id} className="rounded-lg border bg-white p-3">
            <button
              onClick={() => setOpenId(openId === d.id ? null : d.id)}
              className="text-sm font-medium text-indigo-600"
            >
              {d.period_start} → {d.period_end}
            </button>
            {openId === d.id && (
              <div className="prose prose-sm mt-2 max-w-none">
                <Markdown>{d.content}</Markdown>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
