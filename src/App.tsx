import { Button } from "./components/ui/button";
import {
  Cloud,
  CloudOff,
  FileKey2,
  InfoIcon,
  Link,
  MessageCircle,
  Send,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { AgeContext } from "./contexts/AgeContext";
import { useCopyToClipboard } from "react-use";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Input } from "./components/ui/input";
import { HistoryContext } from "./contexts/HistoryContext";
import { PeerContext } from "./contexts/PeerContext";
import { ScrollArea } from "./components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { cn } from "./lib/utils";

export default function App() {
  const age = useContext(AgeContext);
  const peer = useContext(PeerContext);
  const history = useContext(HistoryContext);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [, copyToClipboard] = useCopyToClipboard();
  const [message, setMessage] = useState("");

  const url = `${window.location.protocol}//${window.location.host}/${age.keyPair.current.publicKey}`;

  const sendMessage = () => {
    if (!message) return;

    peer.conn?.send(age.encrypt(message));
    history.pushEvent({
      type: "message",
      from: age.keyPair.current.publicKey,
      message,
    });
    setMessage("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: 99999999,
        behavior: "smooth",
      });
    }
  }, [history.events]);

  return (
    <div className="w-full h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg flex flex-col gap-2">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              copyToClipboard(url);
              toast.success("URL Copied to clipboard");
            }}
          >
            <Link className="mr-2 h-4 w-4" /> Copy Invite URL
          </Button>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    copyToClipboard(age.keyPair.current.publicKey);
                    toast.success("age Public Key copied to clipboard");
                  }}
                >
                  <FileKey2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{age.keyPair.current.publicKey}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  {peer.connOpen ? (
                    <Cloud className="h-4 w-4 text-green-500" />
                  ) : (
                    <CloudOff className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Peer {peer.connOpen ? "Connected" : "Disconnected"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <ScrollArea className="h-[50vh]" viewportRef={scrollRef}>
          <div className="flex flex-col gap-2">
            <div>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Welcome to age-chat!</AlertTitle>
                <AlertDescription>
                  This chat is ephemeral, peer-to-peer, and end-to-end
                  encrypted. Click above to copy the invite link, send it to a
                  friend, and wait for them to connect.
                </AlertDescription>
              </Alert>
            </div>
            {history.events.map((event, i) => (
              <div key={i} className="w-full grid">
                {event.type == "connection_open" && (
                  <Alert>
                    <Cloud className="h-4 w-4" />
                    <AlertTitle>
                      Peer Connected - Verify the mnemonic below with your
                      peer...
                    </AlertTitle>
                    <AlertDescription className="text-gray-500 italic">
                      {event.mnemonic}
                    </AlertDescription>
                  </Alert>
                )}
                {event.type == "connection_close" && (
                  <Alert>
                    <CloudOff className="h-4 w-4" />
                    <AlertTitle>Peer Disconnected</AlertTitle>
                  </Alert>
                )}
                {event.type == "message" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Alert
                        className={cn("cursor-pointer w-auto", {
                          "justify-self-end":
                            event.from == age.keyPair.current.publicKey,
                          "justify-self-start":
                            event.from != age.keyPair.current.publicKey,
                        })}
                        iconAlignment={
                          event.from == age.keyPair.current.publicKey
                            ? "right"
                            : "left"
                        }
                        onClick={() => {
                          copyToClipboard(event.message);
                          toast.success("Message copied to clipboard");
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <AlertTitle>{event.message}</AlertTitle>
                        <AlertDescription className="text-gray-500">
                          {event.from == age.keyPair.current.publicKey &&
                            `me - `}
                          {event.timestamp.toLocaleTimeString()}
                          {event.from != age.keyPair.current.publicKey &&
                            ` - peer`}
                        </AlertDescription>
                      </Alert>
                    </TooltipTrigger>
                    <TooltipContent
                      side={
                        event.from == age.keyPair.current.publicKey
                          ? "left"
                          : "right"
                      }
                    >
                      <p>Click to copy</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex flex-row gap-2">
          <Input
            placeholder="Your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={(e) => {
              if (e.key == "Enter") {
                sendMessage();
              }
            }}
          />
          <Button variant="outline" size="icon" onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
