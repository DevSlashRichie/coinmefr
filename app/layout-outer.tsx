"use client";

import { ClientContext } from "../api/context";
import { SessionContext } from "../api/session";
import { Toaster, toast } from "react-hot-toast";
import * as jose from "jose";
import { UserSession } from "@/api/usecase";

export function LayoutOuter({ children }: { children: React.ReactNode }) {
  return (
    <ClientContext
      host={process.env.NEXT_PUBLIC_API_HOST || "https://battleclass.fly.dev"}
    >
      <SessionContext
        decodeToken={async (_client, token) => {
          try {
            const claims = jose.decodeJwt(token) as UserSession;

            return claims;
          } catch (err) {
            toast.error(String(err));
          }
        }}
        refreshProps={{
          tokenTtl: 1000,
          getClaims: (token) => ({
            exp: token?.payload?.exp ?? 0,
            iat: token?.payload?.iat ?? 0,
          }),
          refreshFn: async (old) => {
            if (!old) return "";

            return old.raw;
          },
        }}
        tokenName="coinme_tk"
      >
        <>
          <Toaster position="bottom-center" />
          {children}
        </>
      </SessionContext>
    </ClientContext>
  );
}
