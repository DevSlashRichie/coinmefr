/* eslint-disable camelcase -- yes */
import type { Client as _Client } from "./client";
import { BaseAction } from "./client";
import { useClient as _useClient } from "./context";
import { z } from "zod";

export const LoginCheck = z.object({
  id: z
    .string({
      message: "El nombre de usuario es requerido",
    })
    .min(1),
  password: z
    .string({
      message: "La contraseña es requerida",
    })
    .min(1),
});

const CreateLoanZod = z.object({
  description: z.string().min(1),
  borrower: z.object({
    type: z.enum(["user", "business"]),
    id: z.string(),
  }),
  principalAmount: z.number().positive(),
  interestRate: z.number().min(0).max(1),
  termMonths: z.number().positive().int(),
  startDate: z.coerce.date(),
  paymentFrequency: z.enum(["weekly", "biweekly", "monthly"]),
});

export type CreateLoanType = z.infer<typeof CreateLoanZod>;

export type LoginCheckType = z.infer<typeof LoginCheck>;

export interface User {
  _id: string;
  phone: string;
  email?: string;

  admin?: boolean;

  name?: string;
  birthday?: Date;
  gender?: string;
}

export interface UserSession {
  aud: "coinme";
  data: {
    isAdmin: boolean;
    name: string;
  };
  exp: number;
  iat: number;
  iss: "coinme";
  nbf: number;
  sub: string;
}

export const CreateTransactionZod = z.object({
  owner: z.object({
    type: z.enum(["user", "business"]),
    id: z.string(),
  }),
  amount: z.number().min(0),
  description: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(["income", "withdrawal"]),
});

export type CreateTransactionType = z.infer<typeof CreateTransactionZod>;

export interface Transaction {
  _id: string;
  owner: {
    type: "user" | "business";
    id: string;
  };
  amount: number;
  description: string;
  category: string;
  createdBy: string;
  type: "income" | "withdrawal";
  createdAt: string;
}

const CreateSecurityZod = z.object({
  owner: z.object({
    type: z.enum(["user", "business"]),
    id: z.string(),
  }),
  name: z.string().min(1),

  cost: z.number().min(1),
  amount: z.number().min(1),

  interestRate: z.number().min(0).max(1), // Between 0 and 1 (0% to 100%)
  startDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
  paymentFrequency: z.enum(["monthly", "quarterly", "annually"]),
  createdBy: z.string(),
});

export type CreateSecurityType = z.infer<typeof CreateSecurityZod>;

export interface Security {
  _id: string;
  owner: {
    type: "user" | "business";
    id: string;
  };
  name: string;

  cost: number; // Purchase price of the security
  amount: number; // Number of securities purchased

  interestRate: number; // Annual interest rate as decimal (e.g., 0.05 for 5%)
  startDate: string; // When the investment begins
  maturityDate: string | null; // When the investment ends
  paymentFrequency: "monthly" | "quarterly" | "annually"; // How often interest is paid
  status: "active" | "matured" | "cancelled";
  createdBy: string;
  createdAt: string;
}

export interface Loan {
  _id: string;
  borrower: {
    type: "user" | "business";
    id: string;
  };
  principalAmount: number; // Original loan amount
  interestRate: number; // Annual interest rate as decimal
  termMonths: number; // Loan duration in months
  startDate: string;
  endDate: string; // Calculated from startDate + termMonths
  paymentFrequency: "weekly" | "biweekly" | "monthly";
  paymentAmount: number; // Calculated monthly payment amount
  status: "pending" | "active" | "paid" | "defaulted" | "rejected";
  remainingBalance: number; // Current amount still owed
  nextPaymentDue: string;
  paymentHistory: {
    date: string;
    amount: number;
    type: "principal" | "interest";
  }[];
  createdBy: string;
  createdAt: string;
  description: string;
}

export class Client {
  constructor(private readonly client: _Client) {}

  get auth() {
    return new (class extends BaseAction {
      login(data: LoginCheckType) {
        const { operation } = this.client.prepare<{
          token: string;
        }>(this.endpoint + "/login", "POST", data, undefined, {
          route: "auth",
        });

        return operation;
      }

      register(data: {
        phone: string;
        password: string;
        name: string;
        email: string;
      }) {
        const { operation } = this.client.prepare(
          this.endpoint + "/create",
          "POST",
          data,
          undefined,
          {
            route: "auth",
          },
        );

        return operation;
      }
    })(this.client, "/");
  }

  get transactions() {
    return new (class extends BaseAction {
      createTransaction(data: CreateTransactionType) {
        const { operation } = this.client.prepare<{
          transactionId: string;
        }>(this.endpoint, "POST", data);

        return operation;
      }

      getBalance(data: { ownerType: "user"; ownerId: string }) {
        const { operation } = this.client.prepare<{
          balance: number;
        }>(
          this.endpoint + "/owner/:ownerType/:ownerId/balance",
          "GET",
          undefined,
          data,
        );

        return operation;
      }

      getTransactions(data: { ownerType: "user"; ownerId: string }) {
        const { operation } = this.client.prepare<Transaction[]>(
          this.endpoint + "/owner/:ownerType/:ownerId/transactions",
          "GET",
          undefined,
          data,
        );

        return operation;
      }
    })(this.client, "/transaction");
  }

  get investment() {
    return new (class extends BaseAction {
      createInvestment(data: CreateSecurityType) {
        const { operation } = this.client.prepare<{
          investmentId: string;
        }>(this.endpoint, "POST", data);

        return operation;
      }

      getInvestments(data: { ownerType: "user"; ownerId: string }) {
        const { operation } = this.client.prepare<Security[]>(
          this.endpoint + "/owner/:ownerType/:ownerId/securities",
          "GET",
          undefined,
          data,
        );

        return operation;
      }

      getEarnings(securityId: string) {
        const { operation } = this.client.prepare<{
          totalInterest: number;
          nextPaymentDate: Date | null;
          remainingPayments: number | null;
        }>(this.endpoint + "/:securityId/earnings", "GET", undefined, {
          securityId,
        });

        return operation;
      }

      getEarningsToDate(data: { securityId: string; date: string }) {
        const { operation } = this.client.prepare<{
          totalInterest: number;
          nextPaymentDate: Date | null;
          remainingPayments: number | null;
        }>(this.endpoint + "/:securityId/earnings/:date", "GET", undefined, {
          securityId: data.securityId,
          date: data.date,
        });

        return operation;
      }
    })(this.client, "/security");
  }

  get loans() {
    return new (class extends BaseAction {
      getLoans(data: { ownerType: "user"; ownerId: string }) {
        const { operation } = this.client.prepare<Loan[]>(
          this.endpoint + "/borrower/:borrowerType/:borrowerId",
          "GET",
          undefined,
          {
            borrowerType: data.ownerType,
            borrowerId: data.ownerId,
          },
        );

        return operation;
      }

      createLoan(data: CreateLoanType) {
        const { operation } = this.client.prepare<{
          loanId: string;
        }>(this.endpoint, "POST", data);

        return operation;
      }
    })(this.client, "/loan");
  }
}

export function useClient(
  scope: "user" | "admin" | "auth" | "public" = "admin",
) {
  const { client: _client, setHeader } = _useClient(scope);
  const client = new Client(_client);

  return { client, setHeader };
}

export function createClientFromClient(client: _Client) {
  const c = new Client(client);
  return c;
}
