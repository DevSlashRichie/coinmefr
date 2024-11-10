"use client";

import {
  ArrowLeft,
  BarChart2,
  Building2,
  ChartNoAxesCombined,
  Plus,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Graphs } from "@/components/graphs";
import { Header } from "@/components/header";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { Client, useClient, UserSession } from "@/api/usecase";
import { useAssertSession, useSession } from "@/api/session";
import toast from "react-hot-toast";
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  NeoModal,
} from "@/components/modal";
import { Input } from "@/components/ui/input";
import big from "js-big-decimal";

function LoanModal({
  open,
  onClose,
  allow,
}: {
  open: boolean;
  onClose: () => void;
  allow: boolean;
}) {
  const session = useAssertSession<UserSession>();
  const { client } = useClient();
  const [picked, setPicked] = useState("");

  const handleAskForLoan = (per: boolean) => {
    const personal = async () => {
      void client.loans
        .createLoan({
          interestRate: 0.7721,
          paymentFrequency: "monthly",
          startDate: new Date(),
          borrower: {
            type: "user",
            id: session.token.payload.sub,
          },
          termMonths: 12,
          principalAmount: 1000000,
          description: "Préstamo personal",
        })
        .submit();

      await client.transactions
        .createTransaction({
          type: "income",
          amount: 1000000,
          owner: {
            type: "user",
            id: session.token.payload.sub,
          },
          description: "Préstamo personal",
          category: "loan",
        })
        .submit();
    };

    const investment = async () => {
      const investments = await client.investment
        .getInvestments({
          ownerType: "user",
          ownerId: session.token.payload.sub,
        })
        .submit();

      const allInvestmentsTotal = investments.reduce(
        (acc, investment) => acc + investment.amount,
        0,
      );

      const amount = Math.floor(allInvestmentsTotal * 0.8);

      await client.loans
        .createLoan({
          interestRate: 0,
          paymentFrequency: "monthly",
          startDate: new Date(),
          borrower: {
            type: "user",
            id: session.token.payload.sub,
          },
          termMonths: 1,
          principalAmount: amount,
          description: "Préstamo de inversión",
        })
        .submit();

      await client.transactions
        .createTransaction({
          type: "income",
          amount: amount,
          owner: {
            type: "user",
            id: session.token.payload.sub,
          },
          description: "Préstamo de inversión",
          category: "loan",
        })
        .submit();
    };

    const f = async () => {
      if (per) {
        await personal();
      } else {
        await investment();
      }

      onClose();
    };

    void toast.promise(f(), {
      error: String,
      loading: "Cargando...",
      success: "Listo!",
    });
  };

  return (
    <NeoModal open={open} onClose={onClose}>
      <ModalBody>
        <ModalHeader label="Solicitar un Préstamo" onClose={onClose} />
        <div className="p-5 flex flex-col gap-5 text-center w-full">
          <div className="flex flex-col gap-3 w-full">
            <div className="text-gray-500 hidden">
              No tienes préstamos disponibles...
            </div>

            <button
              className={`transition-all  text-left flex flex-col gap-2 w-full border border-gray-500 p-4 rounded-lg ${picked === "personal" ? "bg-[#F0F9E8]" : "hover:bg-gray-100"}`}
              onClick={() => {
                setPicked("personal");
              }}
            >
              <div className="text-2xl">
                Tienes un <i>prestamito</i> de{" "}
                <span className="text-3xl font-bold bg-[#A7E96B] rounded-xl p-1">
                  $10,000 MXN
                </span>{" "}
                <div className="text-gray-600 text-sm">
                  Gracias a tu buen historial crediticio e inversiónes que has
                  realizado con nosotros
                </div>
              </div>
              <div className="text-sm bg-gray-100 p-3 rounded-xl w-full">
                <div className="text-gray-700">Plazo</div>
                <div className="font-bold">12 mensualidades de $1,000 MXN</div>
                <div className="text-gray-600">
                  Costo Anual Total de la oferta 77.21% sin IVA.
                </div>
              </div>
            </button>

            {allow ? (
              <button
                className={`transition-all text-left flex flex-col gap-2 w-full border border-gray-500 p-4 rounded-lg
${picked === "investment" ? "bg-[#F0F9E8]" : " hover:bg-gray-100"}
`}
                onClick={() => {
                  setPicked("investment");
                }}
              >
                <div className="text-2xl">
                  Puedes acceder hasta un{" "}
                  <span className="text-3xl font-bold bg-[#A7E96B] rounded-xl p-1">
                    80%
                  </span>{" "}
                  de tus inversiones como préstamo.
                  <div className="text-gray-600 text-sm">
                    Utiliza nuestro dinero en lugar del tuyo y haz que tu dinero
                    siga creciendo.
                  </div>
                </div>
                <div className="text-sm bg-gray-100 p-3 rounded-xl">
                  <div className="text-gray-700">Plazo</div>
                  <div className="font-bold">
                    30 dias para pagar tu préstamo y no pagarás intereses.
                  </div>
                  <div className="text-gray-600">
                    Costo Anual Total de la oferta 0% sin IVA.
                    <br />
                    Después de 30 días, de no pagar, tus interés generados por
                    tus inversiones se cobrarán como interés hasta que pagues tu
                    préstamo.
                  </div>
                </div>
              </button>
            ) : null}
          </div>
        </div>
        <ModalFooter>
          <div className="ml-auto">
            <button
              className={`px-4 py-1 rounded-xl whitespace-nowrap bg-[#A7E96B] text-black hover:bg-[#98db5a] transition-all`}
              onClick={() => {
                if (picked === "personal") {
                  handleAskForLoan(true);
                } else if (picked === "investment") {
                  handleAskForLoan(false);
                }
              }}
            >
              Solicitar
            </button>
          </div>
        </ModalFooter>
      </ModalBody>
    </NeoModal>
  );
}

function InvestmentGainCalculator({
  client,
  securityId,
}: {
  securityId: string;
  client: Client;
}) {
  const [d, setD] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate());
    today.setHours(0, 0, 0, 0);

    return today;
  });

  const { data: earings, isLoading } = client.investment.useSwr((f) =>
    f.getEarningsToDate({
      securityId,
      date: d.toISOString(),
    }),
  )();

  return (
    <div className="flex justify-between">
      <div className="flex gap-1 items-center">
        <div>Rendimiento estimado</div>

        <input
          type="date"
          value={d.toISOString().split("T")[0]}
          onChange={(e) => {
            setD(new Date(e.target.value));
          }}
          className="text-sm border rounded-lg"
        />
      </div>
      <div className="flex">
        <div className="bg-[#F0F9E8] px-2 rounded-lg">
          {isLoading ? (
            "..."
          ) : (
            <>
              +
              {((earings?.totalInterest || 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {" MXN"}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Component() {
  const [invModal, setInvModal] = useState(false);
  const [loanModal, setLoanModal] = useState(false);

  const session = useAssertSession<UserSession>();
  const { client } = useClient();

  const [amountInvest, setAmountInvest] = useState(0);

  const {
    data: balance,
    mutate: mutateBalance,
    isLoading: balanceLoading,
  } = client.transactions.useSwr((f) =>
    f.getBalance({ ownerType: "user", ownerId: session.token.payload.sub }),
  )();

  const { data: transactions } = client.transactions.useSwr((f) =>
    f.getTransactions({
      ownerType: "user",
      ownerId: session.token.payload.sub,
    }),
  )();

  const { data: investments } = client.investment.useSwr((f) =>
    f.getInvestments({
      ownerType: "user",
      ownerId: session.token.payload.sub,
    }),
  )();

  const { data: loans } = client.loans.useSwr((f) =>
    f.getLoans({
      ownerType: "user",
      ownerId: session.token.payload.sub,
    }),
  )();

  function handleAddMoney() {
    const f = async () => {
      // random amount between 1000 and 5000

      const amount = Math.floor(Math.random() * 4000) + 1000;

      await client.transactions
        .createTransaction({
          type: "income",
          amount: amount * 100,
          owner: {
            type: "user",
            id: session.token.payload.sub,
          },
          category: "spei",
          description: "Depósito de nómina",
        })
        .submit();

      mutateBalance();
    };

    void toast.promise(f(), {
      error: String,
      loading: "Cargando...",
      success: "Listo!",
    });
  }

  const handleCreateInvestment = async (
    amount: number,
    dias: number,
    interestRate: number,
  ) => {
    const f = async () => {
      await client.transactions
        .createTransaction({
          type: "withdrawal",
          amount: amount * 100,
          owner: {
            type: "user",
            id: session.token.payload.sub,
          },
          category: "inversion",
          description: "Inversión a " + dias + " días",
        })
        .submit();

      const txn = await client.investment
        .createInvestment({
          name: "Inversión a " + dias + " días",
          amount: amount * 100,
          owner: {
            type: "user",
            id: session.token.payload.sub,
          },
          createdBy: session.token.payload.sub,
          cost: 1,
          interestRate,
          startDate: new Date(),
          maturityDate: new Date(
            new Date().getTime() + dias * 24 * 60 * 60 * 1000,
          ),
          paymentFrequency: "annually",
        })
        .submit();
    };

    void toast.promise(f(), {
      error: String,
      loading: "Cargando...",
      success: "Listo!",
    });
  };

  return (
    <main className="relative">
      <LoanModal
        open={loanModal}
        onClose={() => setLoanModal(false)}
        allow={Boolean(investments?.length)}
      />

      <NeoModal
        open={invModal}
        onClose={() => setInvModal(false)}
        afterClose={() => {
          setAmountInvest(0);
        }}
      >
        <ModalBody>
          <ModalHeader
            label="Iniciar una Inversión"
            onClose={() => setInvModal(false)}
          />
          <div className="p-5 flex flex-col gap-5 text-center">
            <div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-left pl-1">
                  Cantidad a invertir{" "}
                </span>
                <Input
                  placeholder="$0.00"
                  type="number"
                  min={10}
                  onChange={(e) => setAmountInvest(parseFloat(e.target.value))}
                  value={amountInvest}
                />
              </div>
            </div>
            <div className="flex gap-5">
              <button
                className="flex flex-col w-full items-center bg-[#F4F5F2] hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-4 gap-1 text-center"
                onClick={() => {
                  handleCreateInvestment(amountInvest, 28, 0.101);
                }}
              >
                <div className="relative w-24 h-24 aspect-square mb-2">
                  <Image
                    src="/images/money.png"
                    alt="Enviar"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <b>Congelar 28 días</b>
                  <br />
                  <span className="bg-[#A7E96B] rounded-lg px-1">
                    10.10%
                  </span>{" "}
                  de interés
                </div>
              </button>

              <button
                className="flex flex-col w-full items-center bg-[#F4F5F2] hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-4 gap-1 text-center"
                onClick={() => {
                  handleCreateInvestment(amountInvest, 90, 0.1048);
                }}
              >
                <div className="relative w-24 h-24 aspect-square mb-2">
                  <Image
                    src="/images/money.png"
                    alt="Enviar"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <b>Congelar 90 días</b>
                  <br />
                  <span className="bg-[#A7E96B] rounded-lg px-1">
                    10.48%
                  </span>{" "}
                  de interés
                </div>
              </button>

              <button
                className="flex flex-col w-full items-center bg-[#F4F5F2] hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-4 gap-1 text-center"
                onClick={() => {
                  handleCreateInvestment(amountInvest, 180, 0.1053);
                }}
              >
                <div className="relative w-24 h-24 aspect-square mb-2">
                  <Image
                    src="/images/money.png"
                    alt="Enviar"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <b>Congelar 180 días</b>
                  <br />
                  <span className="bg-[#A7E96B] rounded-lg px-1">
                    10.53%
                  </span>{" "}
                  de interés
                </div>
              </button>
            </div>
          </div>
        </ModalBody>
      </NeoModal>

      {/* Header */}
      <Header />
      <div className="flex flex-col min-h-screen bg-white gap-12 py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#A7E96B] rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>Saldo Liquido</div>
          <div className="text-4xl font-bold mb-2">
            ${balanceLoading ? "..." : ""}
            {((balance?.balance ?? 0) / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0F9E8] rounded-full">
            <span className="w-2 h-2 bg-[#A7E96B] rounded-full"></span>
            <span className="flex gap-1 text-sm">
              Creciendo al 2.7% <ChartNoAxesCombined className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full items-center">
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4 max-w-[800px] font-semibold">
            <button
              className="flex flex-col items-center bg-[#F4F5F2] hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square"
              onClick={() => {
                handleAddMoney();
              }}
            >
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image
                  src="/images/dashboard/add.png"
                  alt="Agregar"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-6 h-6" />
                <span className="text-sm">Agregar</span>
              </div>
            </button>
            <button className="flex flex-col items-center bg-[#F4F5F2] hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square">
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image
                  src="/images/dashboard/send.png"
                  alt="Enviar"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-6 h-6 rotate-[135deg]" />
                <span className="text-sm">Enviar</span>
              </div>
            </button>

            <button className="flex flex-col items-center bg-[#F4F5F2] hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square">
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image
                  src="/images/dashboard/invest.png"
                  alt="Invertir"
                  fill
                  className="object-cover rounded-lg"
                  onClick={() => setInvModal(true)}
                />
              </div>
              <div className="flex items-center gap-2">
                <ChartNoAxesCombined className="w-6 h-6" />
                <span className="text-sm">Invertir</span>
              </div>
            </button>
            <button
              className="flex flex-col items-center bg-[#F4F5F2] hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square"
              onClick={() => {
                setLoanModal(true);
              }}
            >
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image
                  src="/images/dashboard/loan.png"
                  alt="Préstamos"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-6 h-6" />
                <span className="text-sm">Préstamos</span>
              </div>
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="w-full max-w-[800px] self-center px-10 md:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transacciones</h2>
          </div>
          <div className="space-y-4 overflow-auto max-h-[400px]">
            {(transactions ?? []).map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center
${transaction.type === "income" ? "bg-[#F0F9E8]" : "bg-[#f9e9e8]"}
`}
                  >
                    {transaction.type === "income" && (
                      <Plus className="w-5 h-5" />
                    )}
                    {transaction.type === "withdrawal" && (
                      <ArrowLeft className="w-5 h-5 rotate-[135deg]" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}{" "}
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-medium ${transaction.amount > 0 ? /* 'text-[#A7E96B]' */ "" : ""}`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {(transaction.amount / 100).toLocaleString()} MXN
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investments */}
        <div className="w-full max-w-[800px] self-center px-10 md:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Inversiones</h2>
          </div>
          <div className="space-y-4 overflow-auto max-h-[400px]">
            {!investments?.length ? (
              <div className="text-gray-500">No tienes inversiones.</div>
            ) : (
              <>
                {investments?.map((investment) => (
                  <div className="border p-4 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between font-bold">
                      <div>
                        {investment.name}
                        {" al "}
                        <span className="bg-[#F0F9E8] rounded px-1">
                          {String(
                            new big(investment.interestRate)
                              .multiply(new big(100))
                              .getValue(),
                          )}
                          %
                        </span>
                      </div>
                      <div>
                        {(
                          (investment.amount * investment.cost) /
                          100
                        ).toLocaleString()}{" "}
                        MXN
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        Vencimiento el{" "}
                        <div>
                          {investment.maturityDate
                            ? Intl.DateTimeFormat("es-MX", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }).format(new Date(investment.maturityDate))
                            : null}
                        </div>
                      </div>

                      <InvestmentGainCalculator
                        securityId={investment._id}
                        client={client}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Loans */}
        <div className="w-full max-w-[800px] self-center px-10 md:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Prestamos</h2>
          </div>
          <div className="space-y-4 overflow-auto max-h-[400px]">
            {!loans?.length ? (
              <div className="text-gray-500">No tienes prestamos.</div>
            ) : (
              <>
                {loans?.map((loan) => (
                  <div className="border p-4 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between font-bold">
                      <div>
                        {loan.description}
                        {" al "}
                        <span className="bg-[#F0F9E8] rounded px-1">
                          {String(
                            new big(loan.interestRate)
                              .multiply(new big(100))
                              .getValue(),
                          )}
                          %
                        </span>
                      </div>
                      <div>MXN</div>
                    </div>
                    <div className="flex justify-between">
                      Vencimiento el{" "}
                      <div>
                        {loan.endDate
                          ? Intl.DateTimeFormat("es-MX", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }).format(new Date(loan.endDate))
                          : null}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div>Pago Mensual</div>
                      <div>
                        {(loan.paymentAmount / 100).toLocaleString()} MXN
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div>Plazo</div>
                      <div>{loan.termMonths} meses</div>
                    </div>

                    <div className="flex justify-between">
                      <div>Cantidad a pagar pendiente</div>
                      <div>
                        {(loan.remainingBalance / 100).toLocaleString()} MXN
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <Graphs />
        {/* Floating chat interface */}
        <FloatingChatbot
          data={{
            transactions: transactions?.map((t) => ({
              ...t,
              amount: t.amount / 100,
            })),
            investments: investments?.map((i) => ({
              ...i,
              cost: undefined,
              amount: undefined,
              totalCost: (i.amount * i.cost) / 100,
            })),
            loans: loans?.map((l) => ({
              ...l,
              paymentAmount: l.paymentAmount / 100,
              remainingBalance: l.remainingBalance / 100,
              principalAmount: l.principalAmount / 100,
            })),
            balance: (balance?.balance ?? 0) / 100,
            userName: session.token.payload.data.name,
          }}
        />
      </div>
    </main>
  );
}
