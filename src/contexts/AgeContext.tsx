import { createContext, PropsWithChildren, useRef, useState } from "react";

export type AgeContextData = {
  keyPair: React.MutableRefObject<{
    publicKey: string;
    privateKey: string;
  }>;

  saveLocalKeys: () => void;
  clearLocalKeys: () => void;

  recipient?: string;
  setRecipient: (r: string | undefined) => void;

  encrypt: (input: string) => string | undefined;
  decrypt: (input: string) => string | undefined;
};

export const AgeContext = createContext<AgeContextData>({} as AgeContextData);

export const AgeContextProvider = (props: PropsWithChildren<object>) => {
  const path = window.location.pathname;
  const [recipient, setRecipient] = useState<string | undefined>(
    path.length > 1 ? path.substring(1) : undefined,
  );

  const keyPair = useRef(
    (() => {
      const saved = window.localStorage.getItem("age.keypair");
      if (!saved || window.location.search == "?anonymous") {
        return window.generateX25519Identity();
      }

      return JSON.parse(saved);
    })(),
  );

  const encrypt = (input: string) => {
    if (!recipient) {
      return;
    }
    return window.encrypt(recipient, input).output;
  };

  const decrypt = (input: string) => {
    return window.decrypt(keyPair.current.privateKey, input).output;
  };

  const saveLocalKeys = () => {
    window.localStorage.setItem("age.keypair", JSON.stringify(keyPair.current));
  };

  const clearLocalKeys = () => {
    window.localStorage.removeItem("age.keypair");
  };

  return (
    <AgeContext.Provider
      value={{
        keyPair,
        saveLocalKeys,
        clearLocalKeys,
        recipient,
        setRecipient,
        encrypt,
        decrypt,
      }}
    >
      {props.children}
    </AgeContext.Provider>
  );
};
