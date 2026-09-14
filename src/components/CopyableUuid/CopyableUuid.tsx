import { MdContentCopy } from "react-icons/md";

type Props = {
  uuid: string;
  truncateLength?: number;
};

export default function CopyableUuid({ uuid, truncateLength = 8 }: Props) {
  const handleCopyId = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigator.clipboard.writeText(uuid);
  };

  return (
    <button
      type="button"
      onClick={handleCopyId}
      className="flex items-center gap-1 px-2 py-1 rounded-sm border bg-surface-primary border-outline-common text-sm text-gray-500 w-fit hover:bg-surface-secondary transition-colors hover:text-gray-900 hover:cursor-copy"
    >
      <span className="truncate max-w-[110px]">
        {uuid.slice(0, truncateLength)}...
      </span>
      <MdContentCopy size={14} />
    </button>
  );
}
