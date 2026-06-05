import { Link, useParams } from "react-router-dom";

import { AudioPlayer } from "../components/AudioPlayer";
import { UserBadge } from "../components/UserBadge";
import { Card, ErrorState, LoadingState, formatDate } from "../components/ui";
import { useVoiceThread } from "../lib/queries";
import { Recorder } from "./components/Recorder";

export default function VoiceThread() {
  const { id = "" } = useParams();
  const { data: thread, isLoading, error } = useVoiceThread(id);

  if (isLoading) return <LoadingState label="Loading thread..." />;
  if (error || !thread) return <ErrorState label="Failed to load thread." />;

  const memos = [thread.root, ...thread.replies];

  return (
    <section className="flex flex-col gap-5">
      <Link to="/voice" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
        Back to voice memos
      </Link>
      <div>
        <p className="inline-flex rounded-md border-2 border-slate-950 bg-cyan-300 px-2 py-1 text-xs font-black uppercase text-slate-950 shadow-[3px_3px_0_#0f1028]">
          Voice thread
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase leading-none text-white drop-shadow-[3px_3px_0_#0f1028] sm:text-4xl">
          {memos.length === 1 ? "1 memo" : `${memos.length} memos`}
        </h1>
      </div>

      <ul className="flex flex-col gap-3">
        {memos.map((memo, i) => (
          <li key={memo.id} className={i > 0 ? "pl-5 sm:pl-10" : ""}>
            <Card>
              <div className="flex items-center gap-3">
                <UserBadge user={memo.author} />
                <span
                  className={`pill ${i === 0 ? "bg-[#ffe14d] text-slate-950" : "bg-[#35e58f] text-slate-950"}`}
                >
                  {i === 0 ? "root" : "reply"}
                </span>
                <time className="ml-auto text-xs font-medium text-slate-400">
                  {formatDate(memo.created_at)}
                </time>
              </div>
              <div className="mt-3">
                <AudioPlayer src={memo.audio_url} />
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Recorder parentId={thread.root.id} />
    </section>
  );
}
