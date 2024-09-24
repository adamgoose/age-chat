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
import { HistoryContext } from "./HistoryContext";
import { useNavigate, useSearchParams } from "react-router-dom";

export type PeerContextData = {
  peer?: Peer;
  peerOpen: boolean;
  conn?: DataConnection;
  connOpen: boolean;
};

export const PeerContext = createContext({} as PeerContextData);

export const PeerContextProvider = (props: PropsWithChildren<object>) => {
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const age = useContext(AgeContext);
  const history = useContext(HistoryContext);

  const peerRef = useRef<Peer | undefined>();
  const [peerOpen, setPeerOpen] = useState(false);
  const connRef = useRef<DataConnection | undefined>();
  const [connOpen, setConnOpen] = useState(false);

  useEffect(() => {
    const handleConnection = (conn: DataConnection) => {
      conn.on("open", () => {
        console.log("[conn] Opened");
        setConnOpen(true);

        navigate(
          { pathname: "/" + conn.peer, search: search.toString() },
          { replace: true },
        );

        history.pushEvent({
          type: "connection_open",
          from: conn.peer,
          mnemonic: window.mnemonic(age.keyPair.current.publicKey, conn.peer)
            .output,
        });
      });
      conn.on("close", () => {
        console.log("[conn] Closed");
        setConnOpen(false);
        age.setRecipient(undefined);

        history.pushEvent({
          type: "connection_close",
          from: conn.peer,
        });
      });
      conn.on("data", (data) => {
        console.log("[conn] Data Received", data);

        const d = data as Record<string, unknown>;
        if (d.type == "message") {
          history.pushEvent({
            type: "message",
            from: conn.peer,
            message: age.decrypt(d.message as string)!,
          });
        } else if (d.type == "file") {
          history.pushEvent({
            type: "file",
            from: conn.peer,
            filename: d.filename as string,
            size: d.size as number,
            mime: d.mime as string,
            decrypted: window.decryptBinary(
              age.keyPair.current.privateKey,
              d.encrypted as Uint8Array,
            ),
          });
        }
      });
      connRef.current = conn;
    };

    if (!peerRef.current) {
      const peer = new Peer(age.keyPair.current.publicKey);
      peer.on("open", (id) => {
        console.log("[peer] Connected:", id);
        setPeerOpen(true);

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
  }, [navigate, search, age, history]);

  window.addEventListener("beforeunload", () => {
    if (connRef.current) {
      connRef.current.close();
      connRef.current = undefined;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = undefined;
    }
  });

  return (
    <PeerContext.Provider
      value={{
        peer: peerRef.current,
        peerOpen,
        conn: connRef.current,
        connOpen,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
