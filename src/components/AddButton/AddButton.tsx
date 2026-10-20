import { MdAdd } from "react-icons/md";

// The button shows only an icon, so the label is its whole accessible name.
// In a list it has to name the item too, or every row reads the same.
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`px-sm py-sm m-sm rounded-sm hover:bg-primary transition-colors  hover:cursor-pointer bg-primary-dark text-text-on-primary-dark`}
      onClick={onClick}
    >
      <MdAdd size={24} aria-hidden="true" />
    </button>
  );
}

export default AddButton;
