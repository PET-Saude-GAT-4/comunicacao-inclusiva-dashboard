import { ReactNode, useEffect, useRef, useState } from "react";

export interface MenuOption {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  // Marks the option that is currently in effect, e.g. a dropdown's value.
  active?: boolean;
}

interface DropdownMenuProps {
  options: MenuOption[];
  align?: "left" | "right";
  // Stretches the menu to the trigger's width instead of a fixed one.
  fullWidth?: boolean;
  renderTrigger: (props: {
    open: boolean;
    toggle: () => void;
  }) => ReactNode;
}

// The menu behind KebabButton and Dropdown: opens from any trigger and
// closes on a choice or a click outside.
function DropdownMenu({
  options,
  align = "right",
  fullWidth = false,
  renderTrigger,
}: DropdownMenuProps) {
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
    <div
      className={`relative ${fullWidth ? "block w-full" : "inline-block"}`}
      ref={menuRef}
    >
      {renderTrigger({ open, toggle: () => setOpen((prev) => !prev) })}

      {/* z-20 keeps the menu above Table's sticky header (z-10), which comes
          later in the page and would otherwise cover it; Modal is z-50. */}
      {open && (
        <div
          className={`absolute overflow-hidden mt-2 font-semibold bg-surface-secondary outline-1 outline-gray-100 rounded-md shadow-lg z-20 ${
            fullWidth ? "w-full" : "w-40"
          } ${align === "right" ? "right-0" : "left-0"}`}
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
              } ${opt.active ? "bg-gray-100" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
