import { BadgeDollarSign, CircleUserRound } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <nav className="sticky bg-white top-0 flex flex-col w-full border-b p-4 z-50">
      <div className="flex justify-between self-center max-w-[1200px] w-full">
        <Link href="/dashboard" className="flex gap-2 items-center text-lg font-semibold">
          <BadgeDollarSign className="w-6 h-6" />
          CoinMe
        </Link>
        <div className="flex text-lg gap-1">
          {/* Usuario */}
          <CircleUserRound className="text-gray w-6 h-6" />
        </div>
      </div>
    </nav>
  );
}
