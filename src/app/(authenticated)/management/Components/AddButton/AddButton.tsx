import { MdAdd } from "react-icons/md";

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className={`px-sm py-sm m-sm rounded-sm hover:bg-primary transition-colors  hover:cursor-pointer bg-primary-dark text-text-on-primary-dark`}
      onClick={onClick}
    >
      <MdAdd size={24} />
    </button>
  );
}

export default AddButton;
