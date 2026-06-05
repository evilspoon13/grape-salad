// M4 — capture audio in-browser via MediaRecorder, upload, then POST /api/voice-memos.
import { useRef, useState } from "react";

import { uploadFile } from "../../lib/api";
import { useCreateVoiceMemo } from "../../lib/queries";

export function Recorder({ parentId }: { parentId: string | null }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const createMemo = useCreateVoiceMemo();

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = handleStop;
    recorder.start();
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    setRecording(true);
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  async function handleStop() {
    setBusy(true);
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const duration_seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      const audio_url = await uploadFile(blob, "audio");
      await createMemo.mutateAsync({ audio_url, duration_seconds, parent_id: parentId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <button onClick={stop} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">
          ⏹ Stop
        </button>
      ) : (
        <button
          onClick={start}
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Uploading…" : "🎙 Record"}
        </button>
      )}
    </div>
  );
}
