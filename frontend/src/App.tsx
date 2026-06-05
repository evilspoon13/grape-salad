import { NavLink, Navigate, Route, Routes } from "react-router-dom";

import { UserPicker } from "./components/UserPicker";
import { AppHeader } from "./components/AppHeader";
import { useUser } from "./context/user";
import Feed from "./pages/Feed";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import Voice from "./pages/Voice";
import VoiceThread from "./pages/VoiceThread";
import Digest from "./pages/Digest";
import NewsLab from "./pages/NewsLab";

const NAV = [
  { to: "/feed", label: "Feed" },
  { to: "/markets", label: "Markets" },
  { to: "/news-lab", label: "News Lab" },
  { to: "/voice", label: "Voice" },
  { to: "/digest", label: "Digest" },
];

export default function App() {
  const { userId } = useUser();

  // No identity yet -> force the "Who are you?" picker before anything else.
  if (!userId) return <UserPicker />;

  return (
    <div className="min-h-screen text-slate-900">
      <AppHeader />
      <div className="border-y-4 border-slate-950 bg-[#ff4f8b]">
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md border-2 border-slate-950 px-3 py-2 text-sm font-black uppercase shadow-[3px_3px_0_#0f1028] transition hover:-translate-y-0.5 ${
                  isActive
                    ? "bg-[#ffe14d] text-slate-950"
                    : "bg-white text-slate-950 hover:bg-cyan-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-7">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/markets/:id" element={<MarketDetail />} />
          <Route path="/news-lab" element={<NewsLab />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/voice/:id" element={<VoiceThread />} />
          <Route path="/digest" element={<Digest />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </main>
    </div>
  );
}
