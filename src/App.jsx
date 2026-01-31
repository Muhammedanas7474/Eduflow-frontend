import AppRoutes from "./routes/AppRoutes";
import { WebSocketProvider } from "./context/WebSocketContext";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <WebSocketProvider>
      <AppRoutes />
    </WebSocketProvider>
  );
}

export default App;
