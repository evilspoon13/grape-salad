// M2 — textarea + optional image upload, then POST /api/posts.
import { useState } from "react";

import { uploadFile } from "../../lib/api";
import { useCreatePost } from "../../lib/queries";

export function PostComposer() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const createPost = useCreatePost();

  async function submit() {
    if (!content.trim()) return;
    setUploading(true);
    try {
      const image_url = file ? await uploadFile(file, "image") : null;
      await createPost.mutateAsync({ content, image_url });
      setContent("");
      setFile(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white p-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's the update?"
        className="w-full resize-none rounded border p-2 text-sm"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          onClick={submit}
          disabled={uploading || createPost.isPending}
          className="ml-auto rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {uploading ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}
