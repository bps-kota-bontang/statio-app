import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void; // bisa dipanggil dari parent
  children: ReactNode;
  closeOutside?: boolean; // deprecated
}

const Modal = ({
  isOpen,
  onClose,
  children,
  closeOutside = true,
}: ModalProps) => {
  // Disable scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center transition-opacity duration-200 opacity-100"
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      onClick={closeOutside ? onClose : undefined} // kontrol overlay click
    >
      <div
        className="bg-white border border-gray-300 rounded-lg shadow-xl p-6 w-11/12 max-w-lg mt-20 transform transition-all duration-200 scale-100 opacity-100 relative"
        onClick={(e) => e.stopPropagation()} // cegah close saat klik di dalam modal
      >
        {/* Tombol close pojok kanan */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
