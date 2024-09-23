import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AgeContext } from "./AgeContext";
import Peer, { DataConnection } from "peerjs";

export type PeerContextData = {
  peer?: Peer;
  peerOpen: boolean;
  conn?: DataConnection;
  connOpen: boolean;
  setOnMessage: (onMessage: (data: string) => void) => void;
};

export const PeerContext = createContext({} as PeerContextData);

export const PeerContextProvider = (props: PropsWithChildren<object>) => {
  const age = useContext(AgeContext);

  const peerRef = useRef<Peer | undefined>();
  const [peerOpen, setPeerOpen] = useState(false);
  const connRef = useRef<DataConnection | undefined>();
  const [connOpen, setConnOpen] = useState(false);

  const onMessage = useRef<(data: string) => void>(() => { });
  const setOnMessage = (h: (data: string) => void) => {
    onMessage.current = h;
  };

  useEffect(() => {
    const handleConnection = (conn: DataConnection) => {
      conn.on("open", () => {
        console.log("[conn] Opened");
        setConnOpen(true);
      });
      conn.on("close", () => {
        console.log("[conn] Closed");
        setConnOpen(false);
        age.clearRecipient();
      });
      conn.on("data", (data) => {
        console.log("[conn] Data Received", data);
        onMessage.current(age.decrypt(data as string)!);
      });
      connRef.current = conn;
    };

    if (!peerRef.current) {
      const peer = new Peer(age.keyPair.current.publicKey);
      peer.on("open", (id) => {
        console.log("[peer] Connected:", id);
        setPeerOpen(true);

        // TODO:consider connecting to the target recipient
        if (age.recipient) {
          console.log("Opening connection to peer:", age.recipient);
          const conn = peer.connect(age.recipient);
          handleConnection(conn);
        }
      });
      peer.on("disconnected", () => {
        console.log("[peer] Disconnected");
        setPeerOpen(false);
      });
      peer.on("close", () => {
        console.log("[peer] Closed");
        setPeerOpen(false);
      });
      peer.on("connection", (conn) => {
        console.log("[peer] New Inbound Connection:", conn.peer);
        age.setRecipient(conn.peer);
        handleConnection(conn);
      });

      peerRef.current = peer;
    }

    return () => {
      if (peerRef.current) {
        // peerRef.current.destroy();
        // peerRef.current = undefined;
      }
    };
  }, [age]);

  return (
    <PeerContext.Provider
      value={{
        peer: peerRef.current,
        peerOpen,
        conn: connRef.current,
        connOpen,
        setOnMessage,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
