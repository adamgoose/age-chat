import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { LoadWasm } from "./wasm";
import { HistoryContextProvider } from "./contexts/HistoryContext";
import { AgeContextProvider } from "./contexts/AgeContext";
import { PeerContextProvider } from "./contexts/PeerContext";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "./components/ui/tooltip";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AgeContextProvider>
        <HistoryContextProvider>
          <PeerContextProvider>
            <Outlet />
          </PeerContextProvider>
        </HistoryContextProvider>
      </AgeContextProvider>
    ),
    children: [
      {
        path: "/:recipient?",
        element: <App />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <LoadWasm>
          <RouterProvider router={router} />
        </LoadWasm>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
