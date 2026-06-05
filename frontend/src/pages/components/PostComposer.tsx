import { useState } from "react";

import { uploadFile } from "../../lib/api";
import { useCreatePost } from "../../lib/queries";
import { Card } from "../../components/ui";

export function PostComposer() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createPost = useCreatePost();

  async function submit() {
    if (!content.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const image_url = file ? await uploadFile(file, "image") : null;
      await createPost.mutateAsync({ content, image_url });
      setContent("");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post your update.");
    } finally {
      setUploading(false);
    }
  }

  const disabled = uploading || createPost.isPending || !content.trim();

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What happened this week?"
          className="field min-h-28 resize-none"
          rows={4}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-slate-600">
            <span className="sr-only">Add image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm font-bold text-slate-600 file:mr-3 file:rounded-md file:border-2 file:border-slate-950 file:bg-cyan-200 file:px-3 file:py-2 file:text-sm file:font-black file:uppercase file:text-slate-950 hover:file:bg-cyan-100"
            />
          </label>
          <button onClick={submit} disabled={disabled} className="btn-primary sm:ml-auto">
            {uploading ? "Posting..." : "Post update"}
          </button>
        </div>
        {file && <p className="text-xs text-slate-500">Attached: {file.name}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Card>
  );
}
