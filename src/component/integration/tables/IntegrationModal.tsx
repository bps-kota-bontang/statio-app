import Modal from "@/component/ui/Modal";
import Button from "@/component/ui/Button";

interface IntegrationModalProps {
  isOpen: boolean;
  tableCount: number;
  tableName?: string | null;
  availableYears: number[];
  selectedYear: number | null;
  onClose: () => void;
  onYearChange: (year: number) => void;
  onExport: () => void;
}

const IntegrationModal = ({
  isOpen,
  tableCount,
  tableName,
  availableYears,
  selectedYear,
  onClose,
  onYearChange,
  onExport,
}: IntegrationModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Select the year for exporting {tableCount} selected {tableCount === 1 ? 'table' : 'tables'}
        </p>
        {tableName && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900">Table: {tableName}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={selectedYear || ""}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onExport}>Export</Button>
        </div>
      </div>
    </Modal>
  );
};

export default IntegrationModal;
