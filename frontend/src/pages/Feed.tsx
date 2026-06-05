import { UserBadge } from "../components/UserBadge";
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, formatDate } from "../components/ui";
import { usePosts } from "../lib/queries";
import { PostComposer } from "./components/PostComposer";

export default function Feed() {
  const { data: posts, isLoading, error } = usePosts();

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Group feed" title="What everyone is up to" />
      <PostComposer />

      {isLoading && <LoadingState label="Loading posts..." />}
      {error && <ErrorState label="Failed to load posts." />}
      {posts?.length === 0 && (
        <EmptyState title="No updates yet" body="Post the first note for this week's digest." />
      )}

      <ul className="grid gap-3">
        {posts?.map((post) => (
          <li key={post.id}>
            <Card>
              <div className="flex items-center gap-3">
                <UserBadge user={post.author} />
                <time className="ml-auto text-xs font-medium text-slate-400">
                  {formatDate(post.created_at)}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {post.content}
              </p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt=""
                  className="mt-3 max-h-96 w-full rounded-md object-cover"
                />
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
