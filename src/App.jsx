import AppRoutes from "./routes/AppRoutes";
import { WebSocketProvider } from "./context/WebSocketContext";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
import { requestForToken, onMessageListener } from "./firebase";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    requestForToken();

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        console.log("Message received in App:", payload);
      })
      .catch((err) => console.log("failed: ", err));
  }, [dispatch]);

  return (
    <WebSocketProvider>
      <AppRoutes />
    </WebSocketProvider>
  );
}

export default App;
