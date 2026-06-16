import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-primary px-md">
      <div className="relative z-10 flex w-full max-w-fit flex-col items-center gap-md rounded-xl bg-surface-primary px-xxl py-xxl text-center shadow-xl">
        <Image src="/images/logo.png" alt="Logo" width={48} height={48} />
        <div className="flex flex-col items-center gap-sm">
          <p className="text-[96px] font-bold leading-none text-primary-dark">
            404
          </p>
          <span className="h-1 w-10 rounded-full bg-primary" />
        </div>
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading font-bold text-text-on-primary">
            Página não encontrada
          </h1>
          <p className="text-body text-text-on-primary-variant">
            A página que você procura não existe ou você não tem permissão para
            acessá-la.
          </p>
        </div>
        <Link
          href="/"
          className="mt-sm w-fit flex items-center justify-center gap-sm rounded-full bg-primary-dark px-lg py-sm text-body-emph text-white transition-colors hover:bg-primary"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
