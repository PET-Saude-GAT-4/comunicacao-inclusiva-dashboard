"use client";

import { useActionState } from "react";
import { register } from "@/services/auth";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Link from "next/link";

export default function Register() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Solicitar Registro
      </h1>
      <Input
        type="email"
        name="email"
        placeholder="Email"
        error={state?.errors?.email?.[0]}
      />
      <Input
        type="password"
        name="password"
        placeholder="Senha"
        error={state?.errors?.password?.[0]}
      />
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirme sua senha"
        error={state?.errors?.confirmPassword?.[0]}
      />
      {state?.message && (
        <p className="text-sm text-center text-red-500">{state.message}</p>
      )}
      <div className="text-center flex flex-col">
        <Link
          href="/login"
          className="text-body text-text-on-primary text-sm underline"
        >
          Já tem uma conta? Faça login!
        </Link>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Solicitando..." : "Solicitar Registro"}
      </Button>
    </form>
  );
}
