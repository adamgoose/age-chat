import Peer, { DataConnection } from "peerjs";
import { useContext, useEffect, useRef, useState } from "react";
import { AgeContext } from "./age/AgeContext";

function App() {
  const age = useContext(AgeContext);

  const peerRef = useRef<Peer | undefined>();
  const connRef = useRef<DataConnection | undefined>();
  const [mnemonic, setMnemonic] = useState<string | undefined>();
  const [otherId, setOtherId] = useState<string>(
    window.location.pathname.substring(1),
  );

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    {
      message: string;
    }[]
  >([]);

  const handleData = (data: unknown) => {
    console.log("received data", data);

    if (typeof data === "object") {
      const body = data as { output: string };

      setMessages((messages) => [
        {
          message: window.decrypt(age.privateKey!, body.output).output,
        },
        ...messages,
      ]);
    }
  };

  useEffect(() => {
    if (!age.publicKey) return;

    // Only initialize the Peer instance once
    if (!peerRef.current) {
      peerRef.current = new Peer(age.publicKey);

      peerRef.current.on("open", (id) => {
        console.log("Peer ID:", id);

        if (otherId) {
          const conn = peerRef.current!.connect(otherId);
          conn.on("data", handleData);
          connRef.current = conn;
          setMnemonic(window.mnemonic(age.publicKey!, otherId).output);
        }
      });

      // Handle incoming connections or data if necessary
      peerRef.current.on("connection", (conn) => {
        console.log("Incoming Connection:", conn.peer);
        conn.on("data", handleData);

        setOtherId(conn.peer);
        connRef.current = conn;
        setMnemonic(window.mnemonic(age.publicKey!, conn.peer).output);
      });
    }

    // Cleanup: destroy Peer connection on component unmount
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = undefined;
      }
    };
  }, [otherId, age.publicKey]);

  const url = `${window.location.protocol}//${window.location.host}/${age.publicKey}`;

  return (
    <div>
      <div>
        Send someone here:&nbsp;
        <a href={url}>{url}</a>
      </div>
      <div>Peer ID: {otherId}</div>
      <div>Mnemonic: {mnemonic}</div>
      {mnemonic && (
        <div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <button
            onClick={() => {
              connRef.current?.send(window.encrypt(otherId, message));
              setMessages((messages) => [{ message }, ...messages]);
              setMessage("");
            }}
          >
            Send
          </button>
        </div>
      )}
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{message.message}</li>
        ))}
      </ul>
      {/* <div className="App">{JSON.stringify(messages, undefined, 4)}</div> */}
    </div>
  );
}

export default App;
