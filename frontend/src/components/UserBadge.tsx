import type { Profile, UserRef } from "../lib/types";

export function UserBadge({ user }: { user: UserRef | Profile }) {
  return (
    <span className="inline-flex items-center gap-2">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
          {user.display_name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-sm font-medium">{user.display_name}</span>
    </span>
  );
}
