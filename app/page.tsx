"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "@/api/session";
import { LoginCheck, UserSession } from "@/api/usecase";
import { useClient } from "@/api/usecase";
import { ZodError } from "zod";

export default function Component() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const [register, setRegister] = useState(false);

  const router = useRouter();

  // get queyrparamters

  const query = useSearchParams();

  const session = useSession<UserSession>();
  const { client } = useClient();

  useEffect(() => {
    const islogout = query.has("logout");
    if (session.isAuth && !islogout) {
      router.push("/dashboard");
    }

    if (islogout) {
      session.logout();
      router.push("/");
    }
  }, []);

  const handleLogin = () => {
    const login = async () => {
      const data = await LoginCheck.parseAsync({
        id: email,
        password,
      });

      // eslint-disable-next-line camelcase -- ?
      const { token } = await client.auth.login(data).submit();

      // eslint-disable-next-line camelcase -- ?
      session.init(token);

      router.push("/dashboard");
    };

    const registerFn = async () => {
      await client.auth
        .register({
          name,
          phone,
          email,
          password,
        })
        .submit();

      await login();
    };

    const f = async () => {
      if (register) {
        await registerFn();
      } else {
        await login();
      }
    };

    void toast.promise(f(), {
      error: (e) => {
        if (e instanceof ZodError) {
          return String(Object.values(e.flatten().fieldErrors)[0]);
        }
        return String(e);
      },
      loading: "Cargando...",
      success: "Listo!",
    });
  };

  return (
    <div className="flex flex-col w-full items-center min-h-screen bg-white px-4 py-2">
      {/* Main Content */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div className="space-y-6 py-12 w-full max-w-[800px]">
          <h1 className="text-4xl font-semibold">Inicio de Sesión</h1>

          <div className="space-y-4">
            {register && (
              <>
                <div className="space-y-2">
                  <label className="text-gray-600">Nombre</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-gray-300 h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-600">Teléfono</label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border-gray-300 h-14"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-gray-600">Correo</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-gray-300 h-14"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-600">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border-gray-300 h-14"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center flex flex-col gap-2">
            <Button
              className="w-full h-14 rounded-full bg-[#A7E96B] hover:bg-[#96D85E] text-black text-lg font-medium"
              type="submit"
            >
              {register ? "Registrarse" : "Iniciar Sesión"}
            </Button>

            {!register && (
              <button
                className="underline"
                type="button"
                onClick={() => {
                  setRegister(true);
                }}
              >
                Registrarse
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
