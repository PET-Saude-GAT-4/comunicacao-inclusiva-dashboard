"use client";

import { useEffect } from "react";
import { MdClose } from "react-icons/md";

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-surface-primary outline-2 outline-outline-common rounded-lg p-lg min-w-96 max-w-lg w-full mx-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-common pb-sm mb-md">
          <p className="text-text-on-primary text-heading">{title}</p>
          <button
            className="px-sm py-sm rounded-sm bg-transparent outline-1 outline-surface-secondary hover:bg-surface-secondary hover:cursor-pointer transition-colors"
            onClick={onClose}
          >
            <MdClose size={24} className="text-surface-secondary-dark" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
