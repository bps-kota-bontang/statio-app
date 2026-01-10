import { useCallback } from "react";
import Modal from "@/component/ui/Modal";
import Button from "@/component/ui/Button";

interface Dimension {
  id: string;
  name: string;
}

interface DimensionSelectionModalProps {
  isOpen: boolean;
  dimensions: Dimension[];
  selectedDimensionIds: string[];
  onToggleDimension: (dimensionId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const DimensionSelectionModal = ({
  isOpen,
  dimensions,
  selectedDimensionIds,
  onToggleDimension,
  onConfirm,
  onCancel,
}: DimensionSelectionModalProps) => {
  const handleConfirm = useCallback(() => {
    if (selectedDimensionIds.length > 0) {
      onConfirm();
    }
  }, [selectedDimensionIds.length, onConfirm]);

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Select Dimensions to Aggregate
        </h2>
        <div className="space-y-2 mb-6">
          {dimensions.map((dim) => (
            <label
              key={dim.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={selectedDimensionIds.includes(dim.id)}
                onChange={() => onToggleDimension(dim.id)}
                className="w-4 h-4"
              />
              <span>{dim.name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedDimensionIds.length === 0}
          >
            Generate ({selectedDimensionIds.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DimensionSelectionModal;
