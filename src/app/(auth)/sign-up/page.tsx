import Input from "@/components/Input";
import Button from "@/components/Button";

export default function Register() {
  return (
    <div className="flex flex-col gap-4 w-full px-xxl py-xxl">
      <h1 className="text-title text-text-on-primary font-bold text-center my-md">
        Solicitar Registro
      </h1>
      <Input
        id="email"
        type="email"
        label="Digite seu e-mail:"
        placeholder="Email"
      />
      <Input
        id="password"
        type="password"
        label="Digite sua senha:"
        placeholder="Senha"
      />
      <Input
        id="confirm-password"
        type="password"
        label="Digite sua senha novamente:"
        placeholder="Confirme sua senha"
      />
      <Button type="submit">Solicitar Registro</Button>
    </div>
  );
}
