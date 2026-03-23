import Link from "next/link";

export default function Login() {

  return (
    <div className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Entrar
      </h1>

      <input
        className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-xxl my-xs bg-surface-secondary rounded-lg"
        type="email"
        placeholder="Email"
      />

      <input
        className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-xxl my-xs bg-surface-secondary rounded-lg"
        type="password"
        placeholder="Senha"
      />

      <div className="text-center flex flex-col">
        <Link href="/reset-password" className="text-body text-text-on-primary text-sm hover:underline">
          Esqueceu a senha?
        </Link>
        <Link href="/sign-up" className="text-body text-text-on-primary text-sm hover:underline">
          Não tem uma conta ainda? Solicite cadastro!
        </Link>
      </div>

      <button className="bg-primary-dark text-white px-lg py-sm my-md rounded-lg">
        Login
      </button>
    </div>
  );
}
