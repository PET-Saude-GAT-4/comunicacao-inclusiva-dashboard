"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { acceptInvitation } from "@/services/invitations";

function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="flex flex-col gap-4 w-full px-xxl py-xxl text-center">
        <h1 className="text-title text-text-on-primary font-bold my-md">
          Convite Inválido
        </h1>
        <p className="text-sm text-text-on-primary">
          O link de convite é inválido ou não possui um token.
        </p>
        <div className="text-center flex flex-col mt-2">
          <Link
            href="/login"
            className="text-body text-text-on-primary text-sm underline"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return <AcceptInvitationContent token={token} />;
}

function AcceptInvitationContent({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    acceptInvitation.bind(null, token),
    undefined,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4 w-full px-xxl py-xxl text-center">
        <h1 className="text-title text-text-on-primary font-bold my-md">
          Conta Ativada!
        </h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          {state.message || "Sua conta foi ativada com sucesso!"}
        </div>
        <p className="text-sm text-text-on-primary mt-2">
          Agora você já pode acessar a plataforma.
        </p>
        <Link
          href="/login"
          className="bg-primary-dark text-white hover:bg-primary px-lg py-sm my-md rounded-lg text-center hover:opacity-75 transition-colors"
        >
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Definir Senha
      </h1>
      <p className="text-sm text-text-on-primary text-center -mt-2 mb-2">
        Crie uma senha de acesso para ativar a sua conta.
      </p>

      <Input
        type="password"
        name="password"
        placeholder="Nova Senha"
        error={state?.errors?.password?.[0]}
      />
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirme a nova senha"
        error={state?.errors?.confirmPassword?.[0]}
      />

      {state?.message && !state?.success && (
        <p className="text-sm text-center text-red-500">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Ativando..." : "Ativar Conta"}
      </Button>

      <div className="text-center flex flex-col">
        <Link
          href="/login"
          className="text-body text-text-on-primary text-sm underline"
        >
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-xxl text-center text-text-on-primary">
          Carregando...
        </div>
      }
    >
      <AcceptInvitationForm />
    </Suspense>
  );
}
