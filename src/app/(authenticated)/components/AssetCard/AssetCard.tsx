import Badge from "@/components/Badge/Badge";
import CopyableUuid from "@/components/CopyableUuid/CopyableUuid";
import KebabButton from "@/components/KebabButton/KebabButton";
import Image from "next/image";
import { MdImage, MdPerson } from "react-icons/md";

export type AssetCardImage = {
  src: string;
  // Captions the image when the card shows two, e.g. "Pictograma".
  label: string;
};

export type AssetCardBadge = {
  text: string;
  // Neutral marks an absence, e.g. a pictogram that belongs to no term.
  neutral?: boolean;
};

type Props = {
  title: string;
  uuid: string;
  createdAt: string;
  authorEmail: string | null;
  // One image for a pictogram or a SignWriting; two for a term, which is
  // made of both.
  images: [AssetCardImage] | [AssetCardImage, AssetCardImage];
  badge?: AssetCardBadge;
  onSelect: () => void;
  onDelete: () => void;
  isSelected: boolean;
};

function SingleImage({ image, alt }: { image: AssetCardImage; alt: string }) {
  return (
    <div
      className={`relative flex items-center justify-center w-24 h-24 shrink-0 rounded-md overflow-hidden ${
        image.src
          ? "bg-white border border-outline-common"
          : "bg-surface-secondary-dark text-white"
      }`}
    >
      {image.src ? (
        <Image
          src={image.src}
          alt={alt}
          width={96}
          height={96}
          className="absolute inset-0 w-full h-full p-xs object-contain"
        />
      ) : (
        <MdImage size={48} />
      )}
    </div>
  );
}

function ImagePair({ images }: { images: AssetCardImage[] }) {
  return (
    <div className="grid grid-cols-2 w-full rounded-md border border-outline-common divide-x divide-outline-common overflow-hidden">
      {images.map((image) => (
        <figure
          key={image.label}
          className="flex flex-col items-center gap-xs p-sm min-w-0"
        >
          {/* The image is taken out of flow so a tall one cannot stretch the
              square past its aspect ratio; object-contain shrinks it and
              leaves white space around it instead. */}
          <div className="relative flex items-center justify-center w-full aspect-square bg-white">
            {image.src ? (
              <Image
                src={image.src}
                alt={image.label}
                width={96}
                height={96}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <MdImage size={48} className="text-text-on-primary-variant" />
            )}
          </div>
          <figcaption className="text-xs text-text-on-primary-variant truncate">
            {image.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// A card for the parts terms are made of (pictograms, SignWritings) and for
// terms themselves, which show both parts side by side.
export default function AssetCard({
  title,
  uuid,
  createdAt,
  authorEmail,
  images,
  badge,
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
          {images.length === 1 ? (
            <SingleImage image={images[0]} alt={title} />
          ) : (
            <ImagePair images={images} />
          )}
          <div className="flex flex-col items-center gap-1 min-w-0 w-full">
            <h3 className="text-body-emph font-semibold truncate text-center w-full">
              {title}
            </h3>
            {badge && (
              <Badge
                variant={badge.neutral ? "neutral" : "success"}
                title={badge.text}
                className="inline-block max-w-full truncate"
              >
                {badge.text}
              </Badge>
            )}
            <div className="flex justify-center">
              <CopyableUuid uuid={uuid} />
            </div>
          </div>
        </div>
      </div>
      <hr className="border-t border-outline-common" />
      <div className="flex flex-col gap-xs items-center text-body">
        <span className="font-bold">Data de Criação</span>
        <span>{new Date(createdAt).toLocaleDateString("pt-BR")}</span>
      </div>
      <div className="flex items-center justify-center gap-sm min-w-0 text-body">
        <MdPerson className="text-gray-400 shrink-0" size={18} />
        <p className="truncate" title={authorEmail ?? "Desconhecido"}>
          {authorEmail ?? "Desconhecido"}
        </p>
      </div>
    </div>
  );
}
