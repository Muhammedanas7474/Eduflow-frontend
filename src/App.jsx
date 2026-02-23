import AppRoutes from "./routes/AppRoutes";
import { WebSocketProvider } from "./context/WebSocketContext";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
import { requestForToken, onMessageListener } from "./firebase";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Step 1: Check authentication first
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Step 2: Only run Firebase AFTER user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      requestForToken();

      onMessageListener()
        .then((payload) => {
          console.log("Message received in App:", payload);
          alert(
            payload.notification?.title +
              " - " +
              payload.notification?.body
          );
        })
        .catch((err) => console.log("failed: ", err));
    }
  }, [isAuthenticated]);

  return (
    <WebSocketProvider>
      <AppRoutes />
    </WebSocketProvider>
  );
}

export default App;
