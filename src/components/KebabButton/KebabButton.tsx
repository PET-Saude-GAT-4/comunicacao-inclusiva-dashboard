import { useState, useRef, useEffect } from "react";
import { MdMoreVert } from "react-icons/md";

interface MenuOption {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface KebabMenuProps {
  options: MenuOption[];
  align?: "left" | "right";
}

function KebabMenu({ options, align = "right" }: KebabMenuProps) {
  const [open, setOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-100"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MdMoreVert size={20} />
      </button>

      {open && (
        <div
          className={`absolute overflow-hidden mt-2 w-40 font-semibold bg-surface-secondary outline-1 outline-gray-100 rounded-md shadow-lg z-10 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="menu"
        >
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              role="menuitem"
              disabled={opt.disabled}
              onClick={() => {
                opt.onClick();
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-body hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                opt.danger ? "text-red-600" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default KebabMenu;
