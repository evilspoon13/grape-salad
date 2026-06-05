import { useRef, useState } from "react";

import { uploadFile } from "../../lib/api";
import { useCreateVoiceMemo } from "../../lib/queries";

export function Recorder({ parentId }: { parentId: string | null }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const createMemo = useCreateVoiceMemo();

  async function start() {
    setError(null);
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError("Recording is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = handleStop;
      recorder.start();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setRecording(true);
    } catch {
      setError("Could not access your microphone.");
    }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that memo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="party-card bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-slate-950">
            {parentId ? "Record a reply" : "Record a voice memo"}
          </p>
          <p className="text-sm text-slate-500">
            {recording ? "Recording now. Stop when you are done." : "Audio uploads after you stop."}
          </p>
        </div>
        {recording ? (
          <button
            onClick={stop}
            className="inline-flex items-center justify-center rounded-md border-2 border-slate-950 bg-[#ff4f8b] px-4 py-2 text-sm font-black uppercase text-white shadow-[4px_4px_0_#0f1028] hover:-translate-y-0.5 sm:ml-auto"
          >
            Stop recording
          </button>
        ) : (
          <button onClick={start} disabled={busy} className="btn-primary sm:ml-auto">
            {busy ? "Uploading..." : "Start recording"}
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}
