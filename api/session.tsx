import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Client } from "./client";
import { ClientError } from "./client";
import { useClient } from "./context";
import { useRouter } from "next/navigation";

export interface Session<Token> {
  token?: SessionToken<Token>;

  isAuth: boolean;
  requestRefresh: boolean;

  init: (
    token: string,
    read?: (() => void) | undefined,
    tokenParams?: Partial<Token>,
  ) => void;
  logout: () => void;
  reloadToken: () => void;
}

export interface SessionToken<Token> {
  raw: string;
  payload: Token;
}

const Context = createContext<Session<unknown>>({
  init: () => {
    throw new Error("SessionContext not initialized");
  },
  logout: () => {
    throw new Error("SessionContext not initialized");
  },
  reloadToken: () => {
    throw new Error("SessionContext not initialized");
  },
  isAuth: false,
  requestRefresh: false,
});

export interface SessionRenewCheckerProps<Token> {
  tokenTtl: number;

  getClaims: (token?: SessionToken<Token>) => { iat: number; exp: number };
  refreshFn: (oldToken?: SessionToken<Token>) => Promise<string>;
  onTokenExpired?: () => void;
}

function SessionRenewChecker<Token>({
  children,
  tokenTtl,
  refreshFn,
  getClaims,
  onTokenExpired,
}: {
  children?: JSX.Element;
} & SessionRenewCheckerProps<Token>) {
  const session = useSession<Token>();

  const handleTokenRenewCheck = useCallback(async () => {
    const claims = getClaims(session.token);

    if (claims.iat && claims.exp) {
      // if expires in less than a week
      const delta = claims.exp * 1000 - Date.now();
      if (delta < tokenTtl || session.requestRefresh) {
        try {
          const newToken = await refreshFn(session.token);

          session.init(newToken);
        } catch (err) {
          if (err instanceof ClientError) {
            if (err.httpCode === 401) {
              session.logout();
              onTokenExpired?.();
            }
          }
        }
      }
    }
  }, [tokenTtl, getClaims, onTokenExpired, refreshFn, session]);

  useEffect(() => {
    void handleTokenRenewCheck().then();
  }, [handleTokenRenewCheck, session.requestRefresh]);

  return <> {children} </>;
}

export function SessionContext<Token>({
  children,
  tokenName,
  decodeToken,
  refreshProps,
}: {
  children: JSX.Element;
  tokenName: string;
  decodeToken?: (client: Client, token: string) => Promise<Token>;
  refreshProps: SessionRenewCheckerProps<Token>;
}) {
  const { client } = useClient();

  const [token, setToken] = useState<SessionToken<Token>>();
  const [loaded, setLoaded] = useState(false);
  const [requestRefresh, setRequestRefresh] = useState(false);

  const logout = () => {
    setToken(undefined);
    localStorage.removeItem(tokenName);
  };

  const init = (
    newToken: string,
    read: (() => void) | undefined,
    tokenParams?: Partial<Token>,
  ) => {
    const f = async () => {
      if (decodeToken) {
        try {
          const token = await decodeToken(client, newToken);

          const completeToken = { ...tokenParams, ...token };

          setToken({
            raw: newToken,
            payload: completeToken,
          });

          localStorage.setItem(
            `${tokenName}_state`,
            JSON.stringify(completeToken),
          );
        } catch (err) {
          setToken(undefined);
          localStorage.removeItem(tokenName);
          localStorage.removeItem(`${tokenName}_state`);
          throw err;
        }
      } else {
        setToken({
          raw: newToken,
          payload: {} as Token,
        });
      }

      setRequestRefresh(false);

      client.setToken(newToken);
      localStorage.setItem(tokenName, newToken);
    };

    void f().then(read);
  };

  useEffect(() => {
    const localToken = localStorage.getItem(tokenName);
    const localTokenState = localStorage.getItem(`${tokenName}_state`);

    if (localToken) {
      init(
        localToken,
        () => {
          setLoaded(true);
        },
        localTokenState ? JSON.parse(localTokenState) : undefined,
      );
    } else {
      setLoaded(true);
    }

    return () => {
      setLoaded(false);
    };
  }, [tokenName]);

  const reloadToken = () => {
    setRequestRefresh(true);
  };

  // as this session provider belongs to the project
  // we can inject launchdarkly here

  return (
    <Context.Provider
      value={{
        token,
        init,
        logout,
        requestRefresh,
        reloadToken,
        isAuth: Boolean(token),
      }}
    >
      {loaded ? (
        <SessionRenewChecker {...refreshProps}>{children}</SessionRenewChecker>
      ) : (
        []
      )}
    </Context.Provider>
  );
}

export function useSession<Token>() {
  return useContext(Context) as Session<Token>;
}

export function useAssertSession<Token>() {
  const session = useSession<Token>();

  return session as Session<Token> & {
    token: Token;
  };
}
