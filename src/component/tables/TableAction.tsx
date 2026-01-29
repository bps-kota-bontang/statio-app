import { useAuth } from "@/hooks/useAuth";
import { useTableApi } from "@/service/table";
import type { Table } from "@/type/table";
import {
  trackTableFinalize,
  trackTableRevert,
  trackTableSubmit,
  trackTableUnfinalize,
} from "@/utils/analytics";
import { Lock, RotateCcw, Check } from "lucide-react";
import { useState } from "react";

interface TableActionProps {
  table: Table;
  onAction: () => void;
  className?: string;
}

const TableAction = ({ table, onAction, className }: TableActionProps) => {
  const { submitTable, finalizeTable, revertTable, unfinalizeTable } =
    useTableApi();
  const { user } = useAuth();

  const isViewer = user?.roles?.includes("viewer");

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isUnfinalizing, setIsUnfinalizing] = useState(false);

  if (isViewer) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Masa Input Berakhir */}
      {table.status === "draft" && table.is_locked && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 border border-gray-300 font-medium text-sm shadow-sm w-full sm:w-auto">
          <Lock size={16} /> Masa Input Berakhir
        </div>
      )}

      {/* Submit untuk Review */}
      {table.status === "draft" && !table.is_locked && (
        <button
          onClick={async () => {
            setIsSubmitting(true);
            try {
              await submitTable(table.id);
              trackTableSubmit(table.id, table.name);
              onAction();
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium text-sm transition shadow-sm disabled:opacity-50 w-full sm:w-auto"
        >
          {isSubmitting ? (
            <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : (
            <Check size={16} />
          )}
          Submit
        </button>
      )}

      {/* Supervisor Actions */}
      {table.status === "submitted" && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Kembalikan */}
          <button
            onClick={async () => {
              setIsReverting(true);
              try {
                await revertTable(table.id);
                trackTableRevert(table.id, table.name);
                onAction();
              } finally {
                setIsReverting(false);
              }
            }}
            disabled={isReverting}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-400 text-red-700 bg-red-50 hover:bg-red-100 font-medium text-sm transition shadow-sm disabled:opacity-50 w-full sm:w-auto"
          >
            {isReverting ? (
              <span className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
            ) : (
              <RotateCcw size={16} />
            )}
            Kembalikan
          </button>

          {/* Finalisasi */}
          {user?.roles?.includes("admin") && (
            <button
              onClick={async () => {
                setIsFinalizing(true);
                try {
                  await finalizeTable(table.id);
                  trackTableFinalize(table.id, table.name);
                  onAction();
                } finally {
                  setIsFinalizing(false);
                }
              }}
              disabled={isFinalizing}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 font-medium text-sm transition shadow-sm disabled:opacity-50 w-full sm:w-auto"
            >
              {isFinalizing ? (
                <span className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
              ) : (
                <Lock size={16} />
              )}
              Finalisasi
            </button>
          )}
        </div>
      )}

      {/* Final */}
      {table.status === "finalized" && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={async () => {
              setIsUnfinalizing(true);
              try {
                await unfinalizeTable(table.id);
                trackTableUnfinalize(table.id, table.name);
                onAction();
              } finally {
                setIsUnfinalizing(false);
              }
            }}
            disabled={isUnfinalizing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-400 text-red-700 bg-red-50 hover:bg-red-100 font-medium text-sm transition shadow-sm disabled:opacity-50 w-full sm:w-auto"
          >
            {isUnfinalizing ? (
              <span className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
            ) : (
              <RotateCcw size={16} />
            )}
            Batalkan Finalisasi
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-400 font-medium text-sm shadow-sm w-full sm:w-auto">
            <Lock size={16} /> Sudah Difinalisasi
          </div>
        </div>
      )}
    </div>
  );
};

export default TableAction;
