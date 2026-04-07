import { IconType } from "react-icons";

function TabButton({
  active,
  icon: Icon,
  onClick,
}: {
  icon: IconType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`px-sm py-sm m-sm rounded-sm  ${active ? "bg-primary-dark" : "bg-transparent outline-1 outline-surface-secondary hover:bg-surface-secondary hover:cursor-pointer transition-colors"}`}
      onClick={onClick}
    >
      <Icon
        size={24}
        className={`${active ? "text-text-on-primary-dark" : "text-surface-secondary-dark" }`}
      />
    </button>
  );
}

export default TabButton;
