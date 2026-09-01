import CopyableUuid from "@/components/CopyableUuid/CopyableUuid";
import type { PictogramOutput } from "@/types/pictogram";
import Image from "next/image";
import { MdMoreVert, MdImage } from "react-icons/md";

type Props = {
  pictogram: PictogramOutput;
};

export default function PictogramCard({ pictogram }: Props) {
  return (
    <div className="flex flex-col gap-5 p-5 bg-white rounded-lg border border-outline-common shadow-sm text-text-on-primary">
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center gap-5 min-w-0">
          <div className="flex items-center justify-center w-16 h-16 shrink-0 rounded-lg bg-surface-secondary-dark text-white overflow-hidden">
            {pictogram.fileUrl ? (
              <Image
                src={pictogram.fileUrl}
                alt={pictogram.description}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdImage size={32} />
            )}
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <h3 className="text-body-emph font-semibold truncate">
              {pictogram.description ?? "Pictogram"}
            </h3>
            <CopyableUuid uuid={pictogram.uuid} />
          </div>
        </div>
        <button
          type="button"
          className="text-gray-600 hover:text-gray-900 shrink-0"
        >
          <MdMoreVert size={24} />
        </button>
      </div>
      <hr className="border-t border-outline-common my-1" />
      <div className="flex flex-col gap-1">
        <span className="font-bold">Data de Criação</span>
        <span>{pictogram.createdAt}</span>
      </div>
    </div>
  );
}
