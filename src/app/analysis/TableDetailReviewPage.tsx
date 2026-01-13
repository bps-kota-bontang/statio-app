import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router";
import Tab from "@/component/ui/Tab";
import { useTableApi } from "@/service/table";
import Error from "@/component/ui/Error";
import Loading from "@/component/ui/Loading";
import { Check, Lock, RotateCcw } from "lucide-react";
import type { StatioContextType } from "@/component/layout/StatioLayout";
import TableReviewer from "@/component/analysis/TableReviewer";
import { useAuth } from "@/hooks/useAuth";
import { trackTableUnfinalize } from "@/utils/analytics";

const TableDetailReviewPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { user } = useAuth();

  const {
    useTable,
    useTableInsightFacts,
    submitTable,
    finalizeTable,
    revertTable,
    unfinalizeTable,
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
    Math.max(...years)
  );

  const sortedDimensions = useMemo(() => {
    if (!data?.data?.dimensions) return [];
    return [...data.data.dimensions].sort(
      (a, b) => (b.values?.length ?? 0) - (a.values?.length ?? 0)
    );
  }, [data?.data?.dimensions]);

  const handleYearSelect = useCallback(
    (year: number) => {
      setSearchParams({ year: year.toString() });
    },
    [setSearchParams]
  );

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnfinalizing, setIsUnfinalizing] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

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
          <h3 className="text-xl font-semibold">{data.data.name}</h3>
        </div>

        {/* Right — Status & Action Button */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {/* Masa Input Berakhir */}
          {data.data.status === "draft" && data.data.is_locked && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 border border-gray-300 font-medium text-sm shadow-sm w-full sm:w-auto">
              <Lock size={16} /> Masa Input Berakhir
            </div>
          )}
          {/* Submit untuk Review */}
          {data.data.status === "draft" && !data.data.is_locked && (
            <button
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await submitTable(id);
                  await mutate();
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
              Submit untuk Review
            </button>
          )}

          {data.data.status === "submitted" && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Kembalikan */}
              <button
                onClick={async () => {
                  setIsReverting(true);
                  try {
                    await revertTable(id);
                    await mutate();
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
                      await finalizeTable(id);
                      await mutate();
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
          {data.data.status === "finalized" && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={async () => {
                  setIsUnfinalizing(true);
                  try {
                    await unfinalizeTable(id);
                    trackTableUnfinalize(id, data.data.name);
                    await mutate();
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
      </div>

      {sortedDimensions.length > 0 && (
        <Tab
          items={years}
          selected={yearParam ? Number(yearParam) : lastYear}
          onSelect={handleYearSelect}
          badges={
            insightFacts?.data
              ? Object.fromEntries(
                  insightFacts?.data?.data.map((d) => [
                    d.year,
                    d.missing + d.outlier + d.revision,
                  ])
                )
              : {}
          }
        />
      )}

      <TableReviewer
        table={{ ...data.data, dimensions: sortedDimensions }}
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
