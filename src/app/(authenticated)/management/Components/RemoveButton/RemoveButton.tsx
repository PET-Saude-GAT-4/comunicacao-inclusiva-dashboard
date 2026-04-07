import { MdDelete } from "react-icons/md";

function RemoveButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`px-sm py-sm m-sm rounded-sm   ${active ? "bg-error-primary text-text-on-primary-dark hover:bg-error-secondary transition-colors hover:cursor-pointer" : "bg-transparent outline-1 outline-surface-secondary text-text-on-primary hover:cursor-not-allowed"}`}
      onClick={onClick}
    >
      <MdDelete size={24} />
    </button>
  );
}

export default RemoveButton;
