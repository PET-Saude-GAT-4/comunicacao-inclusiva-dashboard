import CopyableUuid from "@/components/CopyableUuid/CopyableUuid";
import type { PictogramOutput } from "@/types/pictogram";
import Image from "next/image";
import { MdMoreVert, MdImage } from "react-icons/md";

type Props = {
  pictogram: PictogramOutput;
};

export default function PictogramCard({ pictogram }: Props) {
  return (
    <div className="flex flex-col gap-3 p-5 bg-white rounded-lg border border-outline-common shadow-sm text-text-on-primary min-w-0">
      <div className="flex w-full justify-end ">
        <button
          type="button"
          className="text-gray-600 hover:text-gray-900 shrink-0"
        >
          <MdMoreVert size={24} />
        </button>
      </div>
      <div className="flex items-start justify-between gap-5">
        <div className="flex flex-col items-center justify-center w-full gap-5 min-w-0">
          <div className="flex items-center justify-center w-32 h-32 shrink-0 rounded-full bg-surface-secondary-dark text-white overflow-hidden">
            {pictogram.fileUrl ? (
              <Image
                src={pictogram.fileUrl}
                alt={pictogram.description}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdImage size={64} />
            )}
          </div>
          <div className="flex flex-col gap-2 min-w-0 w-full">
            <h3 className="text-heading font-semibold truncate text-center">
              {pictogram.description ?? "Pictogram"}
            </h3>
            <div className="flex justify-center">
              <CopyableUuid uuid={pictogram.uuid} />
            </div>
          </div>
        </div>
      </div>
      <hr className="border-t border-outline-common my-1" />
      <div className="flex flex-col gap-1 items-center">
        <span className="font-bold">Data de Criação</span>
        <span>{new Date(pictogram.createdAt).toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  );
}
