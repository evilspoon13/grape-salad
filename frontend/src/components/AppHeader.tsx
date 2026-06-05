import { useUser } from "../context/user";
import { useProfile } from "../lib/queries";
import { UserBadge } from "./UserBadge";

export function AppHeader() {
  const { userId, setUserId } = useUser();
  const { data: me } = useProfile(userId!);

  return (
    <header className="border-b-4 border-slate-950 bg-[#00d1ff]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <div>
          <p className="text-2xl font-black uppercase leading-none text-slate-950 drop-shadow-[2px_2px_0_#fff]">
            Friends App
          </p>
          <p className="text-xs font-black uppercase text-slate-800">
            Feed, bets, voice, recap. Chaos with receipts.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {me && (
            <div className="hidden items-center gap-3 rounded-md border-2 border-slate-950 bg-white px-3 py-2 shadow-[4px_4px_0_#0f1028] sm:flex">
              <UserBadge user={me} />
              <span className="text-sm font-black uppercase text-slate-950">
                {me.coin_balance.toLocaleString()} coins
              </span>
            </div>
          )}
          <button onClick={() => setUserId(null)} className="btn-secondary">
            Switch
          </button>
        </div>
      </div>
    </header>
  );
}
