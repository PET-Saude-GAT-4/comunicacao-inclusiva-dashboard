import { MdExpandMore } from "react-icons/md";
import DropdownMenu from "@/components/DropdownMenu/DropdownMenu";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  id: string;
  label?: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

// Picks one value from a list, using the same menu as KebabButton. The
// trigger is styled like Input so the two sit together in a form.
function Dropdown<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}: DropdownProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-text-on-primary" htmlFor={id}>
          {label}
        </label>
      )}
      <DropdownMenu
        fullWidth
        align="left"
        options={options.map((option) => ({
          label: option.label,
          onClick: () => onChange(option.value),
          active: option.value === value,
        }))}
        renderTrigger={({ open, toggle }) => (
          <button
            id={id}
            type="button"
            onClick={toggle}
            disabled={disabled}
            aria-haspopup="true"
            aria-expanded={open}
            className="flex w-full items-center justify-between gap-sm focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-lg bg-gray-100 outline-1 outline-gray-200 rounded-md disabled:opacity-50 hover:cursor-pointer"
          >
            <span>{selected?.label}</span>
            <MdExpandMore
              size={20}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      />
    </div>
  );
}

export default Dropdown;
