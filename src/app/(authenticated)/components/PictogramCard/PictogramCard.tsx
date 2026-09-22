import CopyableUuid from "@/components/CopyableUuid/CopyableUuid";
import KebabButton from "@/components/KebabButton/KebabButton";
import type { PictogramOutput } from "@/types/pictogram";
import Image from "next/image";
import { MdImage } from "react-icons/md";

type Props = {
  pictogram: PictogramOutput;
  onSelect: () => void;
  onDelete: () => void;
  isSelected: boolean;
};

export default function PictogramCard({
  pictogram,
  onSelect,
  onDelete,
  isSelected,
}: Props) {
  return (
    <div
      onClick={onSelect}
      className={`flex flex-col gap-2 p-3 bg-white rounded-md border border-outline-common shadow-sm text-text-on-primary min-w-0 transition-all duration-200 ${
        isSelected ? "scale-95 opacity-50" : ""
      }`}
    >
      <div
        className="flex w-full justify-end"
        onClick={(event) => event.stopPropagation()}
      >
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-center justify-center w-full gap-3 min-w-0">
          <div className="flex items-center justify-center w-24 h-24 shrink-0 rounded-full bg-surface-secondary-dark text-white overflow-hidden">
            {pictogram.fileUrl ? (
              <Image
                src={pictogram.fileUrl}
                alt={pictogram.description}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdImage size={48} />
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0 w-full">
            <h3 className="text-body-emph font-semibold truncate text-center">
              {pictogram.description ?? "Pictogram"}
            </h3>
            <div className="flex justify-center">
              <CopyableUuid uuid={pictogram.uuid} />
            </div>
          </div>
        </div>
      </div>
      <hr className="border-t border-outline-common" />
      <div className="flex flex-col gap-xs items-center text-body">
        <span className="font-bold">Data de Criação</span>
        <span>{new Date(pictogram.createdAt).toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  );
}
