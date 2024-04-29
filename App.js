import { UserProvider } from "./app/state/contexts/UserContext";
import Main from "./Main";

export default function App() {
  return (
    <UserProvider>
      <Main />
    </UserProvider>
  );
}
