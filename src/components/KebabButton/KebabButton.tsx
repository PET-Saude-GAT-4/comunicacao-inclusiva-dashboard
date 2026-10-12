import { MdMoreVert } from "react-icons/md";
import DropdownMenu, { MenuOption } from "@/components/DropdownMenu/DropdownMenu";

interface KebabMenuProps {
  options: MenuOption[];
  align?: "left" | "right";
}

function KebabMenu({ options, align = "right" }: KebabMenuProps) {
  return (
    <DropdownMenu
      options={options}
      align={align}
      renderTrigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <MdMoreVert size={20} />
        </button>
      )}
    />
  );
}

export default KebabMenu;
