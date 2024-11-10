import { useSession } from "@/api/session";
import { UserSession } from "@/api/usecase";
import { BadgeDollarSign, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Header() {
  const session = useSession<UserSession>();
  const router = useRouter();

  useEffect(() => {
    if (!session.isAuth) {
      router.push("/");
    }
  }, []);

  return (
    <nav className="sticky bg-white top-0 flex flex-col w-full border-b p-4 z-50">
      <div className="flex justify-between self-center max-w-[1200px] w-full">
        <Link
          href="/dashboard"
          className="flex gap-2 items-center text-lg font-semibold"
        >
          <BadgeDollarSign className="w-6 h-6" />
          CoinMe
        </Link>
        <div className="flex text-lg gap-1 items-center">
          {/* Usuario */}
          <CircleUserRound className="text-gray w-6 h-6" />{" "}
          <div>{session.token?.payload.data.name}</div>
          <button
            type="button"
            className="text-sm hover:text-red-300 transition-all"
            onClick={() => {
              router.push("/?logout=true");
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
