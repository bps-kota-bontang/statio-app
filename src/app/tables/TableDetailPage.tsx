import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router";
import TableViewer from "@/component/tables/TableViewer";
import Tab from "@/component/ui/Tab";
import { useTableApi } from "@/service/table";
import Error from "@/component/ui/Error";
import Loading from "@/component/ui/Loading";
import { Pencil, Check, X, Save } from "lucide-react";
import Input from "@/component/ui/Input";
import type { StatioContextType } from "@/component/layout/StatioLayout";
import Button from "@/component/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { trackTableView } from "@/utils/analytics";
import TableAction from "@/component/tables/TableAction";
import { getIsLocked } from "@/utils/table";

const TableDetailPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { user } = useAuth();

  const { useTable, updateTableName, useTableInsightFacts, updateTableNotes } =
    useTableApi();
  const { id } = useParams<{ id: string }>();
  const lastYear = new Date().getFullYear() - 1;
  const [searchParams, setSearchParams] = useSearchParams();
  const yearParam = searchParams.get("year");

  const years = useMemo(
    () => Array.from({ length: 4 }, (_, i) => lastYear - i),
    [lastYear],
  );

  const { data, isLoading, error, mutate } = useTable(
    id,
    yearParam ? Number(yearParam) : null,
  );

  useEffect(() => {
    const pageTitle = data?.data.name
      ? `${data.data.name} | Statio`
      : "Table Detail | Statio";
    document.title = pageTitle;
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Tables", href: "/tables" },
      { label: data?.data.name },
    ]);
  }, [setBreadcrumbs, data?.data.name]);

  useEffect(() => {
    if (data?.data.name && id) {
      trackTableView(id, data.data.name);
    }
  }, [data?.data.name, id]);

  const { data: insightFacts, mutate: mutateInsightFacts } =
    useTableInsightFacts(id, Math.min(...years), Math.max(...years));

  const sortedDimensions = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data.dimensions].sort(
      (a, b) => (b.values?.length || 0) - (a.values?.length || 0),
    );
  }, [data?.data]);

  const originalDimensions = useMemo(() => {
    if (!data?.data) return [];

    return data.data.dimensions;
  }, [data?.data]);

  const isAdmin = user?.roles.includes("admin");
  const isViewer = user?.roles.includes("viewer");

  const isLocked = getIsLocked({ isAdmin, isViewer, data: data?.data });

  const noteDisabled = isLocked || isViewer;

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(data?.data?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState<string>(); // ✅ preload notes if exist
  const [noteStatus, setNoteStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle"); // ✅ for note saving state

  useEffect(() => {
    setNotes(data?.data.notes || ""); // ✅ preload notes if exist
  }, [data?.data.notes]);

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
    if (type === "facts") mutateInsightFacts();
  };

  const handleNotesChange = (v: string) => setNotes(v);

  // ✅ Save notes to backend
  const handleSaveNote = async () => {
    if (!notes?.trim()) return;
    setNoteStatus("saving");
    try {
      await updateTableNotes(id, { notes });
      setNoteStatus("saved");
      setTimeout(() => setNoteStatus("idle"), 2000);
      mutate();
    } catch {
      setNoteStatus("error");
      setTimeout(() => setNoteStatus("idle"), 3000);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Left — Name editable */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Input
                value={newName}
                onChange={setNewName}
                onEnter={handleSaveName}
                className="w-full sm:max-w-lg"
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
              <h3 className="text-xl font-semibold">
                {data.data.name} ({data.data.indicator.unit})
              </h3>
              <button
                disabled={data.data.is_locked}
                onClick={() => {
                  setIsEditing(true);
                  setNewName(data.data.name);
                }}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-500 disabled:cursor-not-allowed"
              >
                <Pencil size={16} />
              </button>
            </>
          )}
        </div>

        {/* Right — Status & Action Button */}
        <TableAction
          className="w-full sm:w-auto"
          table={data.data}
          onAction={() => mutate()}
        />
      </div>

      {sortedDimensions.length > 0 && (
        <Tab
          items={years}
          selected={yearParam ? Number(yearParam) : lastYear}
          onSelect={handleYearSelect}
          badges={
            insightFacts?.data
              ? Object.fromEntries(
                  insightFacts?.data?.data.map((d) => [d.year, d.missing]),
                )
              : {}
          }
        />
      )}

      <TableViewer
        id={id}
        isLocked={isLocked}
        year={yearParam ? Number(yearParam) : lastYear}
        table={{
          ...data.data,
          dimensions: isAdmin ? originalDimensions : sortedDimensions,
        }}
        onRevalidate={handleRevalidate}
        years={years}
      />

      {/* 📝 Notes + Save */}
      <div className="mt-4 flex gap-4 flex-col">
        <textarea
          className={`w-full h-32 p-3 rounded-lg font-mono text-xs ${
            data.data.is_locked
              ? "bg-gray-200 opacity-60 cursor-not-allowed"
              : "bg-gray-100"
          }`}
          placeholder="Jika ada catatan khusus terkait data pada tabel ini, silakan tuliskan di sini ya..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          disabled={noteDisabled}
        />

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveNote}
            disabled={noteStatus === "saving" || noteDisabled}
            className={`flex items-center gap-2 shadow-lg backdrop-blur-xl border ${
              noteDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Save className="w-4 h-4" />
            {noteStatus === "saving" ? "Menyimpan..." : "Simpan Catatan"}
          </Button>

          {noteStatus === "saved" && !data.data.is_locked && (
            <span className="text-sm text-green-600">Catatan tersimpan ✓</span>
          )}

          {noteStatus === "error" && !data.data.is_locked && (
            <span className="text-sm text-red-600">
              Gagal menyimpan catatan
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDetailPage;
