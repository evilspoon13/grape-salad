import type { Profile, UserRef } from "../lib/types";

export function UserBadge({ user }: { user: UserRef | Profile }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt=""
          className="h-8 w-8 rounded-full border-2 border-slate-950 object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-950 bg-[#ff4f8b] text-xs font-black text-white">
          {user.display_name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="truncate text-sm font-black text-slate-950">{user.display_name}</span>
    </span>
  );
}
