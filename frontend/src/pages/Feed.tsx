// M2 — Feed: list posts + PostComposer (text + optional image via uploadFile).
import { usePosts } from "../lib/queries";
import { UserBadge } from "../components/UserBadge";
import { PostComposer } from "./components/PostComposer";

export default function Feed() {
  const { data: posts, isLoading, error } = usePosts();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Feed</h1>
      <PostComposer />

      {isLoading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-500">Failed to load posts.</p>}
      {posts?.length === 0 && <p className="text-gray-400">No posts yet.</p>}

      <ul className="flex flex-col gap-3">
        {posts?.map((post) => (
          <li key={post.id} className="rounded-lg border bg-white p-3">
            <UserBadge user={post.author} />
            <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt="" className="mt-2 max-h-80 rounded-lg" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
