import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router";
import TableViewer from "@/component/tables/detail/TableViewer";
import Tab from "@/component/ui/Tab";
import { useTableApi } from "@/service/table";
import Error from "@/component/ui/Error";
import Loading from "@/component/ui/Loading";
import { Pencil, Check, X, Lock, RotateCcw } from "lucide-react";
import Input from "@/component/ui/Input";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const TableDetailPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

  const {
    useTable,
    updateTableName,
    useTableMissingFacts,
    submitTable,
    finalizeTable,
    revertTable,
  } = useTableApi();
  const { id } = useParams<{ id: string }>();
  const lastYear = new Date().getFullYear() - 1;
  const [searchParams, setSearchParams] = useSearchParams();
  const yearParam = searchParams.get("year");

  const years = useMemo(
    () => Array.from({ length: 4 }, (_, i) => lastYear - i),
    [lastYear]
  );

  const { data, isLoading, error, mutate } = useTable(
    id,
    yearParam ? Number(yearParam) : null
  );

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Tables", href: "/tables" },
      { label: data?.data.name || "Table Detail" },
    ]);
  }, [setBreadcrumbs, data?.data.name]);

  const { data: missingFacts, mutate: mutateMissingFacts } =
    useTableMissingFacts(id, Math.min(...years), Math.max(...years));

  const sortedDimensions = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data.dimensions].sort(
      (a, b) => (b.values?.length || 0) - (a.values?.length || 0)
    );
  }, [data?.data]);

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(data?.data?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  if (!id) return <Error message="Table ID is missing." />;
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data?.data) return <Error message="Table not found." />;

  const handleYearSelect = (year: number) => {
    setSearchParams({ year: year.toString() });
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === data.data.name) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      await updateTableName(id, {
        name: newName.trim(),
      });
      await mutate();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevalidate = (type: string) => {
    mutate();
    if (type === "facts") mutateMissingFacts();
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        {/* Left — Name editable */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                value={newName}
                onChange={setNewName}
                onEnter={handleSaveName}
                className="w-full max-w-lg"
                disabled={isSaving}
              />
              <button
                onClick={handleSaveName}
                disabled={isSaving}
                className="text-green-600 hover:text-green-800"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  setNewName(data.data.name);
                  setIsEditing(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold">{data.data.name}</h3>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setNewName(data.data.name);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Pencil size={16} />
              </button>
            </>
          )}
        </div>

        {/* Right — Status & Action Button */}
        <div>
          {/* Untuk user: masa input berakhir -> badge */}
          {data.data.status === "draft" && data.data.is_locked && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 border border-gray-300 font-medium text-sm shadow-sm">
              <Lock size={16} /> Masa Input Berakhir
            </div>
          )}

          {/* User: Submit untuk Review */}
          {data.data.status === "draft" && !data.data.is_locked && (
            <button
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await submitTable(id); // API baru
                  await mutate();
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="
        flex items-center gap-2 px-4 py-2 rounded-xl
        border border-blue-400 text-blue-700 bg-blue-50
        hover:bg-blue-100 font-medium text-sm transition shadow-sm
        disabled:opacity-50
      "
            >
              {isSubmitting ? (
                <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              ) : (
                <Check size={16} />
              )}
              Submit untuk Review
            </button>
          )}

          {/* Supervisor Actions (status: submitted) */}
          {data.data.status === "submitted" && (
            <div className="flex items-center gap-3">
              {/* Kembalikan ke Draft */}
              <button
                onClick={async () => {
                  setIsReverting(true);
                  try {
                    await revertTable(id); // API revert
                    await mutate();
                  } finally {
                    setIsReverting(false);
                  }
                }}
                disabled={isReverting}
                className="
        flex items-center gap-2 px-4 py-2 rounded-xl
        border border-red-400 text-red-700 bg-red-50
        hover:bg-red-100 font-medium text-sm transition shadow-sm
        disabled:opacity-50
      "
              >
                {isReverting ? (
                  <span className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                ) : (
                  <RotateCcw size={16} />
                )}
                Kembalikan
              </button>

              {/* Finalisasi */}
              <button
                onClick={async () => {
                  setIsFinalizing(true);
                  try {
                    await finalizeTable(id);
                    await mutate();
                  } finally {
                    setIsFinalizing(false);
                  }
                }}
                disabled={isFinalizing}
                className="
        flex items-center gap-2 px-4 py-2 rounded-xl
        border border-yellow-400 text-yellow-700 bg-yellow-50
        hover:bg-yellow-100 font-medium text-sm transition shadow-sm
        disabled:opacity-50
      "
              >
                {isFinalizing ? (
                  <span className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                ) : (
                  <Lock size={16} />
                )}
                Finalisasi
              </button>
            </div>
          )}

          {/* Final */}
          {data.data.status === "finalized" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-400 font-medium text-sm shadow-sm">
              <Lock size={16} /> Sudah Difinalisasi
            </div>
          )}
        </div>
      </div>

      {sortedDimensions.length > 0 && (
        <Tab
          items={years}
          selected={yearParam ? Number(yearParam) : lastYear}
          onSelect={handleYearSelect}
          badges={
            missingFacts?.data
              ? Object.fromEntries(
                  missingFacts?.data?.data.map((d) => [d.year, d.missing])
                )
              : {}
          }
        />
      )}

      <TableViewer
        id={id}
        year={yearParam ? Number(yearParam) : lastYear}
        table={{ ...data.data, dimensions: sortedDimensions }}
        onRevalidate={handleRevalidate}
        years={years}
      />
    </div>
  );
};

export default TableDetailPage;
