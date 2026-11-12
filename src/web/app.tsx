import { BrowserRouter, Route, Routes } from "react-router";
import { useSession } from "./data/queries.ts";
import { PinScreen } from "./features/auth/pin-screen.tsx";
import { HomeScreen } from "./features/home/home-screen.tsx";
import { PlayersScreen } from "./features/players/players-screen.tsx";

export function App() {
  const session = useSession();
  if (session.isPending) return null;
  if (!session.data?.authenticated) return <PinScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/players" element={<PlayersScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
