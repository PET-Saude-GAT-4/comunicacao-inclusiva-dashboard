"use client";

import Link from "next/link";
import { use, useActionState, useState } from "react";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { confirmPasswordReset, requestPasswordReset } from "@/services/auth";
import { RequestPasswordResetFormState } from "@/types/auth";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = use(searchParams);
  const token = firstParam(params.token);

  return token ? <ConfirmStep token={token} /> : <RequestStep />;
}

function RequestStep() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: RequestPasswordResetFormState, formData: FormData) => {
      const result = await requestPasswordReset(prev, formData);
      if (result?.success) {
        setSubmitted(true);
      }
      return result;
    },
    undefined,
  );

  if (state?.success && submitted) {
    return (
      <div className="flex flex-col gap-4 w-full px-xxl py-xxl text-center">
        <h1 className="text-title text-text-on-primary font-bold my-md">
          Recuperação Solicitada
        </h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 text-center">
          Se houver uma conta associada a este e-mail, você receberá um link de
          recuperação em instantes. Verifique sua caixa de entrada.
        </div>
        <div className="text-center flex flex-col gap-2 mt-2">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-body text-text-on-primary text-sm underline cursor-pointer"
          >
            Tentar outro e-mail
          </button>
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

  return (
    <form action={action} className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Recuperar Senha
      </h1>
      <p className="text-sm text-text-on-primary text-center -mt-2 mb-2">
        Informe o e-mail da sua conta para receber as instruções de recuperação.
      </p>

      <Input
        id="reset-email"
        type="email"
        name="email"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={state?.errors?.email?.[0]}
      />

      {state?.message && (
        <p className="text-sm text-center text-red-500">{state.message}</p>
      )}

      <Button id="reset-request-submit" type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar instruções"}
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

function ConfirmStep({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    confirmPasswordReset,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <input type="hidden" name="token" value={token} />

      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Redefinir Senha
      </h1>
      <p className="text-sm text-text-on-primary text-center -mt-2 mb-2">
        Escolha uma nova senha para sua conta.
      </p>

      {state?.errors?.token?.[0] && (
        <p className="text-sm text-center text-red-500">
          {state.errors.token[0]}
        </p>
      )}

      <Input
        id="reset-confirm-password"
        type="password"
        name="password"
        placeholder="Nova senha"
        autoComplete="new-password"
        error={state?.errors?.password?.[0]}
      />
      <Input
        id="reset-confirm-password-confirmation"
        type="password"
        name="confirmPassword"
        placeholder="Confirme a nova senha"
        autoComplete="new-password"
        error={state?.errors?.confirmPassword?.[0]}
      />

      {state?.invalidToken ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex flex-col items-center gap-1">
          <p className="text-amber-800 font-medium text-center">
            {state.message}
          </p>
          <Link
            id="reset-request-new-link"
            href="/reset-password"
            className="mt-1 text-xs text-amber-900 underline hover:text-amber-700 font-medium cursor-pointer"
          >
            Solicitar novo link de recuperação
          </Link>
        </div>
      ) : state?.message ? (
        <p className="text-sm text-center text-red-500">{state.message}</p>
      ) : null}

      <Button id="reset-confirm-submit" type="submit" disabled={pending}>
        {pending ? "Redefinindo..." : "Redefinir senha"}
      </Button>

      <div className="text-center flex flex-col gap-1">
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
