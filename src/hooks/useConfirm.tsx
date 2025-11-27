import { useState } from "react";
import Modal from "@/component/ui/Modal";
import Button from "@/component/ui/Button";

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => Promise<void>) | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = ({
    title,
    message,
    onConfirm,
  }: {
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setTitle(title);
    setMessage(message);
    setError(null); // clear previous error
    setOnConfirm(() => async () => await onConfirm());
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!onConfirm) return;

    try {
      setLoading(true);
      await onConfirm();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (!loading) {
      setIsOpen(false);
      setError(null); // clear on close
    }
  };

  const ConfirmDialog = () => (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-600">{message}</p>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={closeModal}
          >
            No
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? "Loading..." : "Yes"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { ask, ConfirmDialog };
};
