import { Link } from "react-router-dom";

import { AudioPlayer } from "../components/AudioPlayer";
import { UserBadge } from "../components/UserBadge";
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, formatDate } from "../components/ui";
import { useVoiceMemos } from "../lib/queries";
import { Recorder } from "./components/Recorder";

export default function Voice() {
  const { data: memos, isLoading, error } = useVoiceMemos();

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Async audio" title="Voice memos" />
      <Recorder parentId={null} />

      {isLoading && <LoadingState label="Loading voice memos..." />}
      {error && <ErrorState label="Failed to load voice memos." />}
      {memos?.length === 0 && (
        <EmptyState title="No memos yet" body="Record the first one and start a thread." />
      )}

      <ul className="grid gap-3">
        {memos?.map((memo) => (
          <li key={memo.id}>
            <Card>
              <div className="flex items-center gap-3">
                <UserBadge user={memo.author} />
                <time className="ml-auto text-xs font-medium text-slate-400">
                  {formatDate(memo.created_at)}
                </time>
              </div>
              <div className="mt-3">
                <AudioPlayer src={memo.audio_url} />
              </div>
              <Link
                to={`/voice/${memo.id}`}
                className="btn-secondary mt-3"
              >
                {memo.reply_count === 1 ? "1 reply" : `${memo.reply_count} replies`}
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
