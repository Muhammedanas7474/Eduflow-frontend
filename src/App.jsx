import AppRoutes from "./routes/AppRoutes";
import { WebSocketProvider } from "./context/WebSocketContext";

function App() {
  return (
    <WebSocketProvider>
      <AppRoutes />
    </WebSocketProvider>
  );
}

export default App;
