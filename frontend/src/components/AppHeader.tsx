// Top header: current user + coin balance + switch-user.
import { useProfile } from "../lib/queries";
import { useUser } from "../context/user";
import { UserBadge } from "./UserBadge";

export function AppHeader() {
  const { userId, setUserId } = useUser();
  const { data: me } = useProfile(userId!);

  return (
    <header className="flex items-center gap-3 border-b bg-white px-4 py-3">
      <span className="font-bold">Friends App</span>
      <div className="ml-auto flex items-center gap-3">
        {me && (
          <>
            <UserBadge user={me} />
            <span className="text-sm text-gray-500">{me.coin_balance} 🪙</span>
          </>
        )}
        <button
          onClick={() => setUserId(null)}
          className="text-sm text-indigo-600 hover:underline"
        >
          Switch
        </button>
      </div>
    </header>
  );
}
