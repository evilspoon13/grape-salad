// M4 — VoiceThread: a root memo + its replies; reply by recording with parent_id set.
import { useParams } from "react-router-dom";

import { useVoiceThread } from "../lib/queries";
import { AudioPlayer } from "../components/AudioPlayer";
import { UserBadge } from "../components/UserBadge";
import { Recorder } from "./components/Recorder";

export default function VoiceThread() {
  const { id = "" } = useParams();
  const { data: thread, isLoading, error } = useVoiceThread(id);

  if (isLoading) return <p className="text-gray-400">Loading…</p>;
  if (error || !thread) return <p className="text-red-500">Failed to load thread.</p>;

  const memos = [thread.root, ...thread.replies];

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Thread</h1>
      <ul className="flex flex-col gap-3">
        {memos.map((memo, i) => (
          <li
            key={memo.id}
            className={`rounded-lg border bg-white p-3 ${i > 0 ? "ml-6" : ""}`}
          >
            <UserBadge user={memo.author} />
            <div className="mt-2">
              <AudioPlayer src={memo.audio_url} />
            </div>
          </li>
        ))}
      </ul>

      <h2 className="font-semibold">Reply</h2>
      <Recorder parentId={thread.root.id} />
    </section>
  );
}
