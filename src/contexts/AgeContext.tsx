import {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

export type AgeContextData = {
  keyPair: React.MutableRefObject<{
    publicKey: string;
    privateKey: string;
  }>;

  saveLocalKeys: () => void;
  clearLocalKeys: () => void;

  mnemonic?: string;
  recipient?: string;
  setRecipient: (r: string) => void;
  clearRecipient: () => void;

  encrypt: (input: string) => string | undefined;
  decrypt: (input: string) => string | undefined;
};

export const AgeContext = createContext<AgeContextData>({} as AgeContextData);

export const AgeContextProvider = (props: PropsWithChildren<object>) => {
  const path = window.location.pathname;
  const [mnemonic, setMnemonic] = useState<string | undefined>();
  const [recipient, setRecipient] = useState<string | undefined>(
    path.length > 1 ? path.substring(1) : undefined,
  );
  const clearRecipient = () => {
    setRecipient(undefined);
    setMnemonic(undefined);
  };

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

  useEffect(() => {
    if (!recipient) return;

    setMnemonic(window.mnemonic(keyPair.current.publicKey, recipient).output);
  }, [recipient]);

  return (
    <AgeContext.Provider
      value={{
        keyPair,
        saveLocalKeys,
        clearLocalKeys,
        mnemonic,
        recipient,
        setRecipient,
        clearRecipient,
        encrypt,
        decrypt,
      }}
    >
      {props.children}
    </AgeContext.Provider>
  );
};
