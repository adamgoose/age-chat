import { createContext, PropsWithChildren, useState } from "react";

export type HistoryContextData = {
  events: HistoryEventWithTimestamp[];
  pushEvent: (event: HistoryEvent) => void;
};

export type HistoryEvent =
  | MessageEvent
  | ConnectionOpenEvent
  | ConnectionCloseEvent;

export type HistoryEventWithTimestamp = HistoryEvent & {
  timestamp: Date;
};

export type MessageEvent = {
  type: "message";
  from: string;
  message: string;
};

export type ConnectionOpenEvent = {
  type: "connection_open";
  from: string;
  mnemonic: string;
};

export type ConnectionCloseEvent = {
  type: "connection_close";
  from: string;
};

export const HistoryContext = createContext({} as HistoryContextData);

export const HistoryContextProvider = (props: PropsWithChildren<object>) => {
  const [events, setEvents] = useState<HistoryEventWithTimestamp[]>([]);

  const pushEvent = (event: HistoryEvent) => {
    setEvents((events) => [
      ...events,
      {
        ...event,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <HistoryContext.Provider
      value={{
        events,
        pushEvent,
      }}
    >
      {props.children}
    </HistoryContext.Provider>
  );
};
