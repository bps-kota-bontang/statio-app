import Modal from "@/component/ui/Modal";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import { Label } from "@/component/ui/Label";
import { useState, useEffect } from "react";
import type { TableList } from "@/type/table";

interface MappingModalProps {
  isOpen: boolean;
  table: TableList | null;
  onClose: () => void;
  onSubmit: (data: MappingFormData) => void;
}

export interface MappingFormData {
  websiteTableId: string;
  websiteSubjectId: string;
  websiteLink: string;
}

const MappingModal = ({
  isOpen,
  table,
  onClose,
  onSubmit,
}: MappingModalProps) => {
  const [websiteTableId, setWebsiteTableId] = useState("");
  const [websiteSubjectId, setWebsiteSubjectId] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  // Update form fields when modal opens or table changes
  useEffect(() => {
    if (isOpen && table) {
      setWebsiteTableId(table.website_table_id || "");
      setWebsiteSubjectId(table.website_subject_id || "");
      setWebsiteLink(table.website_link || "");
    }
  }, [isOpen, table]);

  const handleSubmit = () => {
    onSubmit({
      websiteTableId,
      websiteSubjectId,
      websiteLink,
    });

    // Reset form
    setWebsiteTableId("");
    setWebsiteSubjectId("");
    setWebsiteLink("");
  };

  const handleClose = () => {
    // Reset form on close
    setWebsiteTableId("");
    setWebsiteSubjectId("");
    setWebsiteLink("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Mapping Table</h2>

        {table?.name && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900">
              Table: {table.name}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="websiteTableId">Website Table ID</Label>
            <Input
              id="websiteTableId"
              type="text"
              value={websiteTableId}
              onChange={setWebsiteTableId}
              placeholder="Enter website table ID (optional)"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="websiteSubjectId">Website Subject ID</Label>
            <Input
              id="websiteSubjectId"
              type="text"
              value={websiteSubjectId}
              onChange={setWebsiteSubjectId}
              placeholder="Enter website subject ID (optional)"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="websiteLink">Website Link</Label>
            <Input
              id="websiteLink"
              type="text"
              value={websiteLink}
              onChange={setWebsiteLink}
              placeholder="Enter website link (optional)"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </Modal>
  );
};

export default MappingModal;
