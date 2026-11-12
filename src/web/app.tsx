import { BrowserRouter, Route, Routes } from "react-router";
import { useSession } from "./data/queries.ts";
import { PinScreen } from "./features/auth/pin-screen.tsx";
import { HomeScreen } from "./features/home/home-screen.tsx";
import { GameScreen } from "./features/game/game-screen.tsx";
import { PlayersScreen } from "./features/players/players-screen.tsx";
import { SetupScreen } from "./features/setup/setup-screen.tsx";

export function App() {
  const session = useSession();
  if (session.isPending) return null;
  if (!session.data?.authenticated) return <PinScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/players" element={<PlayersScreen />} />
        <Route path="/setup" element={<SetupScreen />} />
        <Route path="/match/:id" element={<GameScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
