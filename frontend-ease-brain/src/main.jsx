import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { store } from "./app/store";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import { DarkModeProvider } from "@/context/DarkModeContext";
import routes from "./app/router";
import queryClient from "./lib/queryClient";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthProvider>
          <DarkModeProvider>
            <RouterProvider router={routes} />
            <Toaster position="top-right" />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </DarkModeProvider>
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>
);
