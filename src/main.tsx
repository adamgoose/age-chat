import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LoadWasm } from "./wasm/index.tsx";
import { AgeContextProvider } from "./age/AgeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoadWasm>
      <AgeContextProvider>
        <App />
      </AgeContextProvider>
    </LoadWasm>
  </StrictMode>,
);
