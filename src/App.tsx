import { useContext, useState } from "react";
import { AgeContext } from "./contexts/AgeContext";
import { PeerContext } from "./contexts/PeerContext";

function App() {
  const age = useContext(AgeContext);
  const peer = useContext(PeerContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  peer.setOnMessage((message) => {
    setMessages((messages) => [message, ...messages]);
  });

  const url = `${window.location.protocol}//${window.location.host}/${age.keyPair.current.publicKey}?anonymous`;

  return (
    <div>
      <div>
        Send someone here:&nbsp;
        <a href={url}>{url}</a>
      </div>
      <div>Peer ID: {age.recipient}</div>
      <div>Mnemonic: {age.mnemonic}</div>
      <div>PeerOpen: {peer.peerOpen ? "yes" : "no"}</div>
      <div>ConnOpen: {peer.connOpen ? "yes" : "no"}</div>
      {window.location.search != "?anonymous" && (
        <>
          <button
            onClick={() => {
              age.saveLocalKeys();
              window.location.reload();
            }}
          >
            Save Local Keys
          </button>
          <button
            onClick={() => {
              age.clearLocalKeys();
              window.location.reload();
            }}
          >
            Clear Local Keys
          </button>
        </>
      )}
      {peer.connOpen && (
        <div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <button
            disabled={!message}
            onClick={() => {
              if (!message) return;
              peer.conn?.send(age.encrypt(message));
              setMessages((messages) => [message, ...messages]);
              setMessage("");
            }}
          >
            Send
          </button>
        </div>
      )}
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
