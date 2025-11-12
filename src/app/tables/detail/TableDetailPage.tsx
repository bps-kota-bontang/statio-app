import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import TableViewer from "@/component/tables/detail/TableViewer";
import Tab from "@/component/ui/Tab";
import { useTableApi } from "@/service/table";
import Error from "@/component/ui/Error";
import Loading from "@/component/ui/Loading";

const TableDetailPage = () => {
  const { useTable } = useTableApi();
  const { id } = useParams<{ id: string }>();
  const lastYear = new Date().getFullYear() - 1;
  const [searchParams, setSearchParams] = useSearchParams();
  const yearParam = searchParams.get("year");

  // Fetch table data based on ID and year parameter (if present)
  const { data, isLoading, error, mutate } = useTable(
    id,
    yearParam ? Number(yearParam) : null
  );

  const years = useMemo(
    () => Array.from({ length: 4 }, (_, i) => lastYear - i),
    [lastYear]
  );

  // Ensure longest dimensions as rows, for better UX
  const sortedDimensions = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data.dimensions].sort(
      (a, b) => (b.values?.length || 0) - (a.values?.length || 0)
    );
  }, [data?.data]);

  if (!id) return <Error message="Table ID is missing." />;
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data?.data) return <Error message="Table not found." />;

  const handleYearSelect = (year: number) => {
    setSearchParams({ year: year.toString() });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{data.data.name}</h3>
      {sortedDimensions.length > 0 && (
        <Tab
          items={years}
          selected={yearParam ? Number(yearParam) : lastYear}
          onSelect={handleYearSelect}
        />
      )}
      <TableViewer
        id={id}
        year={yearParam ? Number(yearParam) : lastYear}
        table={{ ...data.data, dimensions: sortedDimensions }}
        onRevalidate={() => mutate()}
        years={years}
      />
    </div>
  );
};

export default TableDetailPage;
