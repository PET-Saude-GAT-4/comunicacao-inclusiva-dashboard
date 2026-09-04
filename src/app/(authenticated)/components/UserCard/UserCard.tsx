import Badge from "@/components/Badge/Badge";
import type { UserOutput } from "@/types/user";
import { MdMoreVert, MdPerson, MdContentCopy } from "react-icons/md";

type Props = {
  user: UserOutput;
};

export default function UserCard({ user }: Props) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(String(user.id));
  };

  return (
    <div className="flex flex-col gap-5 p-5 bg-white rounded-lg border border-outline-common shadow-sm text-text-on-primary">
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center gap-5 min-w-0">
          <div className="flex items-center justify-center w-16 h-16 shrink-0 rounded-full bg-surface-secondary-dark text-white">
            <MdPerson size={32} />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <h3 className="text-body-emph font-semibold truncate">
              {user.email ?? "email"}
            </h3>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1 px-2 py-1 rounded border border-outline-common text-sm text-gray-500 w-fit"
            >
              <span className="truncate max-w-[110px]">
                {String(user.id).slice(0, 8)}...
              </span>
              <MdContentCopy size={14} />
            </button>
            <Badge variant="neutral">{user.role.name}</Badge>
          </div>
        </div>
        <button type="button" className="text-gray-600 hover:text-gray-900 shrink-0">
          <MdMoreVert size={24} />
        </button>
      </div>
      <hr className="border-t border-outline-common my-1" />
      <div className="flex flex-col gap-1">
        <span className="font-bold">Data Ingresso</span>
        <span>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  );
}