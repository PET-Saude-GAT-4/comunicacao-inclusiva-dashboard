"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function Login() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Entrar
      </h1>

      <input
        className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-xxl my-xs bg-surface-secondary rounded-lg"
        type="email"
        name="email"
        placeholder="Email"
      />
      {state?.errors?.email && (
        <p className="text-error text-sm text-red-500">
          {state.errors.email[0]}
        </p>
      )}

      <input
        className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-xxl my-xs bg-surface-secondary rounded-lg"
        type="password"
        name="password"
        placeholder="Senha"
      />
      {state?.errors?.password && (
        <p className="text-error text-sm text-red-500">
          {state.errors.password[0]}
        </p>
      )}

      {state?.message && (
        <p className="text-error text-sm text-center text-red-500">
          {state.message}
        </p>
      )}

      <div className="text-center flex flex-col">
        <Link
          href="/reset-password"
          className="text-body text-text-on-primary text-sm hover:underline"
        >
          Esqueceu a senha?
        </Link>
        <Link
          href="/sign-up"
          className="text-body text-text-on-primary text-sm hover:underline"
        >
          Não tem uma conta ainda? Solicite cadastro!
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-primary-dark text-white px-lg py-sm my-md rounded-lg disabled:opacity-50"
      >
        {pending ? "Entrando..." : "Login"}
      </button>
    </form>
  );
}
