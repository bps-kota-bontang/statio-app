import { useCallback, useEffect, useMemo } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router";
import Tab from "@/component/ui/Tab";
import { useTableApi } from "@/service/table";
import Error from "@/component/ui/Error";
import Loading from "@/component/ui/Loading";
import type { StatioContextType } from "@/component/layout/StatioLayout";
import TableReviewer from "@/component/analysis/TableReviewer";
import TableAction from "@/component/tables/TableAction";
import { useAuth } from "@/hooks/useAuth";

const TableDetailReviewPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { user } = useAuth();
  const { useTable, useTableInsightFacts } = useTableApi();
  const { id } = useParams<{ id: string }>();
  const currentYear = new Date().getFullYear();
  const [searchParams, setSearchParams] = useSearchParams();
  const yearParam = searchParams.get("year");

  const isAdmin = user?.roles.includes("admin");

  const years = useMemo(
    () => Array.from({ length: 4 }, (_, i) => currentYear - i),
    [currentYear],
  );

  const { data, isLoading, error, mutate } = useTable(
    id,
    yearParam ? Number(yearParam) : null,
  );

  useEffect(() => {
    const pageTitle = data?.data.name
      ? `${data.data.name} - Review | Statio`
      : "Table Review | Statio";
    document.title = pageTitle;
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Analysis", href: "/analysis" },
      { label: data?.data.name },
    ]);
  }, [setBreadcrumbs, data?.data.name]);

  const { data: insightFacts } = useTableInsightFacts(
    id,
    Math.min(...years),
    Math.max(...years),
  );

  const sortedDimensions = useMemo(() => {
    if (!data?.data?.dimensions) return [];
    return [...data.data.dimensions].sort(
      (a, b) => (b.values?.length ?? 0) - (a.values?.length ?? 0),
    );
  }, [data?.data?.dimensions]);

  const originalDimensions = useMemo(() => {
    if (!data?.data) return [];

    return data.data.dimensions;
  }, [data?.data]);

  const handleYearSelect = useCallback(
    (year: number) => {
      setSearchParams({ year: year.toString() });
    },
    [setSearchParams],
  );

  if (!id) return <Error message="Table ID is missing." />;
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data?.data) return <Error message="Table not found." />;

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Left — Name editable */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xl font-semibold">
            {data.data.name} ({data.data.indicator.unit})
          </h3>
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
          selected={yearParam ? Number(yearParam) : currentYear}
          onSelect={handleYearSelect}
          badges={
            insightFacts?.data
              ? Object.fromEntries(
                  insightFacts?.data?.data.map((d) => [
                    d.year,
                    d.missing + d.outlier + d.revision,
                  ]),
                )
              : {}
          }
        />
      )}

      <TableReviewer
        table={{
          ...data.data,
          dimensions: isAdmin ? originalDimensions : sortedDimensions,
        }}
        years={years}
      />

      {/* 📝 Notes + Save */}
      <div className="mt-4 flex gap-4 flex-col">
        <textarea
          className={`w-full h-32 p-3 rounded-lg font-mono text-xs bg-gray-200 opacity-60 cursor-not-allowed`}
          placeholder="Jika ada catatan khusus terkait data pada tabel ini, silakan tuliskan di sini ya..."
          value={data.data.notes || ""}
          readOnly
        />
      </div>
    </div>
  );
};

export default TableDetailReviewPage;
