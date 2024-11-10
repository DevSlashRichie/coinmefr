"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Client } from "./client";

export interface ClientSchema {
  _client?: Client;
  token?: string;
  tokenMetadata?: {
    iat: number;
    exp: number;
  };

  setToken: (token: string) => void;
  setHeader: (key: string, value: string) => void;
}

const Context = createContext<ClientSchema>({
  setToken: () => {
    throw new Error("ClientContext not initialized");
  },
  setHeader: () => {
    throw new Error("ClientContext not initialized");
  },
});

export function ClientContext({
  children,
  host,
}: {
  children: JSX.Element;
  host?: string;
}) {
  const [client, setClient] = useState<Client>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!host) throw new Error("Host not provided");

    setClient(new Client(host));
    setLoaded(true);

    return () => {
      setClient(undefined);
      setLoaded(false);
    };
  }, [host]);

  if (!host) {
    throw new Error("Host not provided");
  }

  return (
    <Context.Provider
      value={{
        _client: client,
        setToken: (token: string) => {
          if (client) {
            client.setToken(token);
          }
        },
        setHeader: (key: string, value: string) => {
          if (client) {
            client.addHeader(key, value);
          }
        },
      }}
    >
      <>{loaded ? children : null}</>
    </Context.Provider>
  );
}

export function useClient(
  scope: "user" | "admin" | "auth" | "public" = "admin",
): {
  client: Client;
  setHeader: (key: string, value: string) => void;
} {
  const { _client, setHeader } = useContext(Context);

  if (!_client) {
    throw new Error("API Client not initialized");
  }

  if (scope !== _client.scope) {
    const client = Object.assign(
      Object.create(Object.getPrototypeOf(_client)),
      _client,
    );
    client.setScope(scope);
    return { client, setHeader };
  }

  return { client: _client, setHeader };
}
