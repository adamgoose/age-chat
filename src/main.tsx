import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LoadWasm } from "./wasm/index.tsx";
import { AgeContextProvider } from "./contexts/AgeContext.tsx";
import { PeerContextProvider } from "./contexts/PeerContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoadWasm>
      <AgeContextProvider>
        <PeerContextProvider>
          <App />
        </PeerContextProvider>
      </AgeContextProvider>
    </LoadWasm>
  </StrictMode>,
);
