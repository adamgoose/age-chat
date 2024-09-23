import { createContext, PropsWithChildren, useRef } from "react";

export type AgeContextData = {
  publicKey?: string;
  privateKey?: string;
};

export const AgeContext = createContext<AgeContextData>({});

export const AgeContextProvider = (props: PropsWithChildren<object>) => {
  const credRef = useRef<AgeContextData>(window.generateX25519Identity());

  return (
    <AgeContext.Provider value={credRef.current}>
      {props.children}
    </AgeContext.Provider>
  );
};
