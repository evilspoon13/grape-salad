// "Who are you?" picker — shown on first load before an identity is chosen (M1).
import { useProfiles } from "../lib/queries";
import { useUser } from "../context/user";
import { UserBadge } from "./UserBadge";

export function UserPicker() {
  const { setUserId } = useUser();
  const { data: profiles, isLoading, error } = useProfiles();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Who are you?</h1>
      <p className="text-sm text-gray-500">Pick your profile. No password — this is a friend group.</p>

      {isLoading && <p className="text-gray-400">Loading profiles…</p>}
      {error && <p className="text-red-500">Couldn't load profiles. Is the backend running?</p>}

      <ul className="flex flex-col gap-2">
        {profiles?.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => setUserId(p.id)}
              className="flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left hover:border-indigo-400"
            >
              <UserBadge user={p} />
              <span className="ml-auto text-sm text-gray-400">{p.coin_balance} 🪙</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
