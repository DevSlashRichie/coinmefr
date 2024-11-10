'use client';

import Navbar from '@/components/navbar';
import { ArrowLeft, ArrowLeftRight, BarChart2, Building2, ChartNoAxesCombined, HandCoins, Plus } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { Graphs } from '@/components/graphs';
import { Header } from '@/components/header';
import { FloatingChatbot } from '@/components/floating-chatbot';

export default function Component() {
  const [balance, setBalance] = useState(14532.65);
  const [transactions] = useState([
    { id: 1, type: 'add', description: 'Depósito de nómina', amount: 5000, status: 'Added' },
    { id: 2, type: 'send', description: 'Pago de renta', amount: -1200, status: 'Sent' },
    { id: 3, type: 'loan', description: 'Préstamo recibido', amount: +12000, status: 'Converted' },
    { id: 4, type: 'add', description: 'Retorno de inversión', amount: 250, status: 'Added' },
  ]);

  return (
    <main className="relative">
      {/* Header */}
      <Header />
      <div className="flex flex-col min-h-screen bg-white gap-24 py-24">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#A7E96B] rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>Saldo total</div>
          <div className="text-4xl font-bold mb-2">${balance.toLocaleString()}</div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0F9E8] rounded-full">
            <span className="w-2 h-2 bg-[#A7E96B] rounded-full"></span>
            <span className="text-sm">Disponible</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full items-center">
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4 max-w-[800px] font-semibold">
            <button className="flex flex-col items-center bg-gray-100 hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square">
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image src="/images/dashboard/add.png" alt="Agregar" fill className="object-cover rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-6 h-6" />
                <span className="text-sm">Agregar</span>
              </div>
            </button>
            <button className="flex flex-col items-center bg-gray-100 hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square">
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image src="/images/dashboard/send.png" alt="Enviar" fill className="object-cover rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-6 h-6 rotate-[135deg]" />
                <span className="text-sm">Enviar</span>
              </div>
            </button>
            <button className="flex flex-col items-center bg-gray-100 hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square">
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image src="/images/dashboard/invest.png" alt="Invertir" fill className="object-cover rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <ChartNoAxesCombined className="w-6 h-6" />
                <span className="text-sm">Invertir</span>
              </div>
            </button>
            <button className="flex flex-col items-center bg-gray-100 hover:bg-[#A7E96B]/40 transition-colors rounded-3xl p-8 !aspect-square">
              <div className="relative w-full max-w-24 aspect-square mb-2">
                <Image src="/images/dashboard/loan.png" alt="Préstamos" fill className="object-cover rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-6 h-6" />
                <span className="text-sm">Préstamos</span>
              </div>
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="w-full max-w-[800px] self-center">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transacciones</h2>
            <button className="font-semibold underline">Ver todo</button>
          </div>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F0F9E8] rounded-full flex items-center justify-center">
                    {transaction.type === 'add' && <Plus className="w-5 h-5" />}
                    {transaction.type === 'send' && <ArrowLeft className="w-5 h-5 rotate-[135deg]" />}
                    {transaction.type === 'convert' && <ArrowLeftRight className="w-5 h-5" />}
                    {transaction.type === 'loan' && <HandCoins className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.status}</div>
                  </div>
                </div>
                <div className={`font-medium ${transaction.amount > 0 ? /* 'text-[#A7E96B]' */ '' : ''}`}>
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.amount.toLocaleString()} MXN
                </div>
              </div>
            ))}
          </div>
        </div>
        <Graphs />
        {/* Floating chat interface */}
        <FloatingChatbot />
        {/* Navbar */}
        <Navbar selected="Home" />
      </div>
    </main>
  );
}
