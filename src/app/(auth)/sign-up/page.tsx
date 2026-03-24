import Link from "next/link";

export default function Register() {
  return (
    <div className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Solicitar Registro
      </h1>

      <div className="flex flex-col">
        <label className="text-text-on-primary" htmlFor="">
          Digite seu e-mail:
        </label>
        <input
          className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-xxl my-xs bg-surface-secondary rounded-lg"
          type="email"
          placeholder="Email"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-text-on-primary">Digite sua senha:</label>
        <input
          className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-xxl my-xs bg-surface-secondary rounded-lg"
          type="password"
          placeholder="Senha"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-text-on-primary">Digite sua senha novamente:</label>
        <input
          className="focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-xxl my-xs bg-surface-secondary rounded-lg"
          type="password"
          placeholder="Confirme sua senha"
        />
      </div>

      <button className="bg-primary-dark text-white px-lg py-sm my-md rounded-lg">
        Login
      </button>
    </div>
  );
}
