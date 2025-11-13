import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import TableViewer from "@/component/tables/detail/TableViewer";
import Tab from "@/component/ui/Tab";
import { useTableApi } from "@/service/table";
import Error from "@/component/ui/Error";
import Loading from "@/component/ui/Loading";
import { Pencil, Check, X } from "lucide-react";
import Input from "@/component/ui/Input";

const TableDetailPage = () => {
  const { useTable, updateTableName, useTableMissingFacts } = useTableApi();
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
      {/* Editable Name Section */}
      <div className="flex items-center gap-2 mb-4">
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
