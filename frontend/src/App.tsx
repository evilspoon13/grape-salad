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

const NAV = [
  { to: "/feed", label: "Feed" },
  { to: "/markets", label: "Markets" },
  { to: "/voice", label: "Voice" },
  { to: "/digest", label: "Digest" },
];

export default function App() {
  const { userId } = useUser();

  // No identity yet -> force the "Who are you?" picker before anything else.
  if (!userId) return <UserPicker />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AppHeader />
      <nav className="flex gap-4 border-b bg-white px-4 py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-indigo-600" : "text-gray-500"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="mx-auto max-w-2xl p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/markets/:id" element={<MarketDetail />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/voice/:id" element={<VoiceThread />} />
          <Route path="/digest" element={<Digest />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </main>
    </div>
  );
}
