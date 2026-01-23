import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store/store";
import setupAxiosInterceptors from "./api/setupAxios";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastContext";
import "./index.css";

setupAxiosInterceptors(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
