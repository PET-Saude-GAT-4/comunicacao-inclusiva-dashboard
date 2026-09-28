"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "@/services/auth";
import { resendInvitation } from "@/services/invitations";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";

export default function Login() {
  const [state, action, pending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resentOk, setResentOk] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    await resendInvitation(email);
    setResending(false);
    setResentOk(true);
  };

  return (
    <form action={action} className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Entrar
      </h1>
      <Input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={state?.errors?.email?.[0]}
      />
      <Input
        type="password"
        name="password"
        placeholder="Senha"
        error={state?.errors?.password?.[0]}
      />

      {state?.message === "ACCOUNT_NOT_CONFIRMED" ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex flex-col items-center gap-1">
          <p className="text-amber-800 font-medium text-center">
            Conta ainda não confirmada.
          </p>
          <p className="text-amber-700 text-xs text-center">
            Verifique seu e-mail para o link de convite.
          </p>
          {resentOk ? (
            <p className="text-green-700 text-xs text-center font-medium mt-1">
              Novo convite enviado para {email}!
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="mt-2 text-xs text-amber-900 underline hover:text-amber-700 font-medium cursor-pointer disabled:opacity-50"
            >
              {resending ? "Enviando..." : "Reenviar convite"}
            </button>
          )}
        </div>
      ) : state?.message ? (
        <p className="text-sm text-center text-red-500">{state.message}</p>
      ) : null}

      <div className="text-center flex flex-col">
        <Link
          href="/reset-password"
          className="text-body text-text-on-primary text-sm underline"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Login"}
      </Button>
    </form>
  );
}
