import { useState, useCallback, useEffect } from "react";
import Modal from "@/component/ui/Modal";
import Button from "@/component/ui/Button";

interface ExportTableModalProps {
  isOpen: boolean;
  tableName: string;
  availableYears: number[];
  onClose: () => void;
  onExport: (years: string[], format: 'xlsx' | 'xls') => void;
}

const ExportTableModal = ({
  isOpen,
  tableName,
  availableYears,
  onClose,
  onExport,
}: ExportTableModalProps) => {
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'xls'>('xlsx');

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedYears([]);
      setSelectedFormat('xlsx');
    }
  }, [isOpen]);

  const handleToggleYear = useCallback((year: string) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        return prev.filter((y) => y !== year);
      } else {
        return [...prev, year];
      }
    });
  }, []);

  const handleSelectAllYears = useCallback(() => {
    if (selectedYears.length === availableYears.length) {
      setSelectedYears([]);
    } else {
      setSelectedYears(availableYears.map((y) => String(y)));
    }
  }, [availableYears, selectedYears.length]);

  const handleExport = useCallback(() => {
    onExport(selectedYears, selectedFormat);
  }, [selectedYears, selectedFormat, onExport]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-2.5">
        <div>
          <h2 className="text-lg font-semibold">Export Table</h2>
          <p className="text-sm text-gray-600 mt-0.5">{tableName}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Select Years
          </span>
          <button
            onClick={handleSelectAllYears}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectedYears.length === availableYears.length
              ? "Deselect"
              : "Select"}{" "}
            All
          </button>
        </div>

        {/* Grid Year Checkboxes */}
        <div className="grid grid-cols-3 gap-2">
          {availableYears.map((year) => (
            <label
              key={year}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border cursor-pointer text-sm transition-colors ${
                selectedYears.includes(String(year))
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                id={`year-${year}`}
                checked={selectedYears.includes(String(year))}
                onChange={() => handleToggleYear(String(year))}
                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium">{year}</span>
            </label>
          ))}
        </div>

        {selectedYears.length === 0 && (
          <p className="text-xs text-red-600">Select at least one year</p>
        )}

        {/* Format Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Export Format
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="xlsx"
                checked={selectedFormat === 'xlsx'}
                onChange={(e) => setSelectedFormat(e.target.value as 'xlsx' | 'xls')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">XLSX (Excel 2007+)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="xls"
                checked={selectedFormat === 'xls'}
                onChange={(e) => setSelectedFormat(e.target.value as 'xlsx' | 'xls')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">XLS (Legacy)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={selectedYears.length === 0}
          >
            Export ({selectedYears.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportTableModal;
