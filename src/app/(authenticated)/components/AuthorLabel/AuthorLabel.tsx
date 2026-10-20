import { MdPerson } from "react-icons/md";

export default function AuthorLabel({ email }: { email: string | null }) {
  return (
    <div className="flex items-center gap-sm">
      <MdPerson className="text-gray-400" size={18} />
      <p>{email ?? "Desconhecido"}</p>
    </div>
  );
}
