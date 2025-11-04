import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import TableViewer from "@/app/tables/detail/TableViewer";
import Tab from "@/component/ui/Tab";
import { useTable } from "@/service/table";

const TableDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const currentYear = new Date().getFullYear();
  const [searchParams, setSearchParams] = useSearchParams();
  const yearParam = Number(searchParams.get("year")) || currentYear;

  const { data, isLoading, error, mutate } = useTable(id, yearParam);

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - i),
    [currentYear]
  );

  if (!id) return <div>Table ID is missing</div>;
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading table data.</div>;
  if (!data?.data) return <div>No data available.</div>;

  const handleYearSelect = (year: number) => {
    setSearchParams({ year: year.toString() });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{data.data.name}</h3>
      <Tab items={years} selected={yearParam} onSelect={handleYearSelect} />
      <TableViewer
        id={id}
        year={yearParam}
        table={data.data}
        onRevalidate={() => mutate()}
      />
    </div>
  );
};

export default TableDetailPage;
