import { useUser } from "../context/user";
import { useProfiles } from "../lib/queries";
import { ErrorState, LoadingState } from "./ui";
import { UserBadge } from "./UserBadge";

export function UserPicker() {
  const { setUserId } = useUser();
  const { data: profiles, isLoading, error } = useProfiles();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="party-card w-full max-w-lg bg-[#ffe14d] p-5">
        <p className="inline-flex rounded-md border-2 border-slate-950 bg-white px-2 py-1 text-xs font-black uppercase text-slate-950 shadow-[3px_3px_0_#0f1028]">
          Choose your player
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase leading-none text-slate-950">
          Who grabbed the controller?
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-700">
          Pick your profile to post, bet, record, and generate digests as yourself.
        </p>

        <div className="mt-5">
          {isLoading && <LoadingState label="Loading profiles..." />}
          {error && <ErrorState label="Could not load profiles. Try mock mode or start the API." />}

          <ul className="flex flex-col gap-2">
            {profiles?.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setUserId(p.id)}
                  className="flex w-full items-center gap-3 rounded-md border-2 border-slate-950 bg-white px-4 py-3 text-left shadow-[4px_4px_0_#0f1028] transition hover:-translate-y-0.5 hover:bg-cyan-100"
                >
                  <UserBadge user={p} />
                  <span className="ml-auto text-sm font-black uppercase text-slate-950">
                    {p.coin_balance.toLocaleString()} coins
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
