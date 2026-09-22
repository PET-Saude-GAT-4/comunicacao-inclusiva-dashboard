import Badge from "@/components/Badge/Badge";
import KebabButton from "@/components/KebabButton/KebabButton";
import type { UserOutput } from "@/types/user";
import { MdPerson, MdContentCopy } from "react-icons/md";

type Props = {
  user: UserOutput;
  onSelect: () => void;
  onDelete: () => void;
  isSelected: boolean;
};

export default function UserCard({
  user,
  onSelect,
  onDelete,
  isSelected,
}: Props) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(String(user.id));
  };

  return (
    <div
      onClick={onSelect}
      className={`flex flex-col gap-5 p-5 bg-white rounded-lg border border-outline-common shadow-sm text-text-on-primary transition-all duration-200 ${
        isSelected ? "scale-95 opacity-50" : ""
      }`}
    >
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
              <span className="truncate max-w-27.5">
                {String(user.id).slice(0, 8)}...
              </span>
              <MdContentCopy size={14} />
            </button>
            <Badge variant="neutral">{user.role.name}</Badge>
          </div>
        </div>
        <div onClick={(event) => event.stopPropagation()}>
          <KebabButton
            options={[
              {
                label: isSelected ? "Desselecionar" : "Selecionar",
                onClick: onSelect,
              },
              { label: "Excluir", onClick: onDelete, danger: true },
            ]}
            align="right"
          />
        </div>
      </div>
      <hr className="border-t border-outline-common my-1" />
      <div className="flex flex-col gap-1">
        <span className="font-bold">Data Ingresso</span>
        <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  );
}
