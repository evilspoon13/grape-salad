import { useState } from "react";
import Markdown from "react-markdown";

import { Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { useDigests, useGenerateDigest } from "../lib/queries";

export default function Digest() {
  const { data: digests, isLoading, error } = useDigests();
  const generate = useGenerateDigest();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Weekly recap" title="Digest">
        <button
          onClick={() => generate.mutate({ period_start: null, period_end: null })}
          disabled={generate.isPending}
          className="btn-primary"
        >
          {generate.isPending ? "Generating..." : "Generate this week"}
        </button>
      </PageHeader>

      {generate.isPending && (
        <Card className="bg-[#00d1ff]">
          <p className="font-black uppercase text-slate-950">Writing the digest...</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            This can take a few seconds when the real backend is connected.
          </p>
        </Card>
      )}
      {generate.error && (
        <Card className="bg-[#ff4f8b]">
          <p className="text-sm font-black uppercase text-white">Could not generate a digest.</p>
        </Card>
      )}

      {isLoading && <LoadingState label="Loading digests..." />}
      {error && (
        <Card className="bg-[#ff4f8b]">
          <p className="text-sm font-black uppercase text-white">Failed to load digests.</p>
        </Card>
      )}
      {digests?.length === 0 && (
        <EmptyState title="No digests yet" body="Generate one after the group has posted updates." />
      )}

      <ul className="grid gap-3">
        {digests?.map((d) => (
          <li key={d.id}>
            <Card>
              <button
                onClick={() => setOpenId(openId === d.id ? null : d.id)}
                className="flex w-full items-center gap-3 text-left"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-950">
                    {d.period_start} to {d.period_end}
                  </span>
                  <span className="block text-xs text-slate-500">Tap to read the recap</span>
                </span>
                <span className="ml-auto text-sm font-semibold text-slate-500">
                  {openId === d.id ? "Close" : "Open"}
                </span>
              </button>
              {openId === d.id && (
                <div className="prose prose-slate prose-sm mt-4 max-w-none border-t-4 border-slate-950 pt-4">
                  <Markdown>{d.content}</Markdown>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
