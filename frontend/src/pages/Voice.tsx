// M4 — Voice: list root memos with AudioPlayer + a Recorder to post a new root memo.
import { Link } from "react-router-dom";

import { useVoiceMemos } from "../lib/queries";
import { AudioPlayer } from "../components/AudioPlayer";
import { UserBadge } from "../components/UserBadge";
import { Recorder } from "./components/Recorder";

export default function Voice() {
  const { data: memos, isLoading, error } = useVoiceMemos();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Voice memos</h1>
      <Recorder parentId={null} />

      {isLoading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-500">Failed to load memos.</p>}

      <ul className="flex flex-col gap-3">
        {memos?.map((memo) => (
          <li key={memo.id} className="rounded-lg border bg-white p-3">
            <UserBadge user={memo.author} />
            <div className="mt-2">
              <AudioPlayer src={memo.audio_url} />
            </div>
            <Link
              to={`/voice/${memo.id}`}
              className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
            >
              {memo.reply_count} replies
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
