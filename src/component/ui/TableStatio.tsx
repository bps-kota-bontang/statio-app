import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";
import "handsontable/styles/ht-theme-horizon.css";
import "handsontable/styles/ht-theme-classic.css";
import "@/style/table-statio.css";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import HotTable, { type HotTableRef } from "@handsontable/react-wrapper";
import { registerAllModules } from "handsontable/registry";
import type { CellChange, CellValue, RowObject } from "handsontable/common";
import numbro from "numbro";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import idID from "numbro/languages/id";
import { buildDataWithAggregate, formattedNumber } from "@/utils/table";
import type { Aggregate } from "@/type/aggregate";

interface TableStatioProps {
  data: RowObject[];
  isLocked?: boolean;
  rowHeaders: string[];
  colHeaders: string[];
  parentRows?: Set<string>;
  aggregate: Aggregate;
  rowAggregates?: Array<Aggregate>;
  colAggregates?: Array<Aggregate>;
  needsColAggregate?: boolean;
  onChange?: (cells: CellChange[] | null) => void;
  locale?: "id" | "en";
}

registerAllModules();
numbro.registerLanguage(idID);

export const TOTAL_KEY = "Total";

/**
 * Determine aggregate header text based on aggregate types
 * If all aggregates are the same, return appropriate header (Total/Rata-Rata/Minimum/Maximum)
 * If aggregates vary, return empty string
 */
function getAggregateHeader(aggregates: Array<Aggregate> | undefined): string {
  if (!aggregates || aggregates.length === 0) return "";

  const nonNullAggregates = aggregates.filter((agg) => agg !== null);
  if (nonNullAggregates.length === 0) return "";

  // Check if all non-null aggregates are the same
  const firstAggregate = nonNullAggregates[0];
  const allSame = nonNullAggregates.every((agg) => agg === firstAggregate);

  if (!allSame) return ""; // Bervariasi, no header

  // Sama semua, gunakan header yang sesuai
  if (firstAggregate === "sum") return "Total";
  if (firstAggregate === "avg") return "Rata-Rata";
  if (firstAggregate === "min") return "Minimum";
  if (firstAggregate === "max") return "Maximum";

  return "";
}

/**
 * Hitung rowHeaderWidth secara presisi menggunakan canvas
 * @param headers array of string (row headers)
 * @param font optional font string (default sama dengan HotTable)
 * @param padding tambahan padding (default 20px)
 * @returns number (width in px)
 */
function calculateRowHeaderWidthPrecise(
  headers: string[],
  font: string = "14px Arial",
  padding: number = 20
): number {
  if (!headers || headers.length === 0) return 100;

  // buat canvas sementara
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 100;

  context.font = font;

  const maxWidth = headers.reduce((max, text) => {
    const width = context.measureText(text).width;
    return Math.max(max, width);
  }, 0);

  return Math.ceil(maxWidth + padding);
}

export interface TableStatioHandle {
  getData: () => Promise<{
    cells: CellValue[];
    rows: Array<number | string>;
    columns: Array<number | string>;
  } | null>;
}

const TableStatio = forwardRef<TableStatioHandle, TableStatioProps>(
  (
    {
      data,
      isLocked,
      rowHeaders,
      colHeaders,
      parentRows,
      aggregate,
      rowAggregates,
      colAggregates,
      needsColAggregate = false,
      onChange,
      locale = "id",
    },
    ref
  ) => {
    const hotRef = useRef<HotTableRef>(null);

    // Convert parent row names to indices
    const parentRowIndices = useMemo(() => {
      if (!parentRows || parentRows.size === 0) return undefined;
      const indices = new Set<number>();
      rowHeaders.forEach((rowName, index) => {
        if (parentRows.has(rowName)) {
          indices.add(index);
        }
      });
      return indices.size > 0 ? indices : undefined;
    }, [parentRows, rowHeaders]);

    const [tableData, setTableData] = useState(
      buildDataWithAggregate(
        data,
        rowHeaders.length,
        colHeaders.length,
        aggregate,
        rowAggregates,
        parentRowIndices,
        colHeaders,
        colAggregates,
        needsColAggregate
      )
    );

    const numericFormat = useMemo(() => {
      if (locale === "id") {
        return {
          pattern: "0,0",
          culture: "id-ID",
        };
      } else {
        return {
          pattern: "0,0",
          culture: "en-US",
        };
      }
    }, [locale]);

    useImperativeHandle(ref, () => ({
      getData: async () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return null;

        const valid = await new Promise<boolean>((resolve) => {
          hot.validateCells((v) => resolve(v));
        });

        if (!valid) {
          alert(
            "Beberapa cell tidak valid. Silakan perbaiki sebelum menyimpan."
          );
          return null;
        }

        return {
          cells: hot.getData() ?? [],
          rows: hot.getRowHeader() ?? [],
          columns: hot.getColHeader() ?? [],
        };
      },
    }));

    useEffect(() => {
      const handleResize = () => {
        hotRef.current?.hotInstance?.refreshDimensions();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    useEffect(() => {
      setTableData(
        buildDataWithAggregate(
          data,
          rowHeaders.length,
          colHeaders.length,
          aggregate,
          rowAggregates,
          parentRowIndices,
          colHeaders,
          colAggregates,
          needsColAggregate
        )
      );
    }, [
      colHeaders,
      data,
      aggregate,
      rowAggregates,
      rowHeaders,
      parentRowIndices,
      colAggregates,
      needsColAggregate,
    ]);

    const handleAfterChange = (
      changes: CellChange[] | null,
      source: string
    ) => {
      if (!changes || source === "loadData") return;

      const newData = [...tableData];

      changes.forEach(([row, col, , newValue]) => {
        const colKey = col as string; // karena Handsontable memberi string
        const colIndex = colHeaders.indexOf(colKey);

        if (row < newData.length - 1 && colIndex >= 0) {
          (newData[row] as Record<string, number | null>)[colKey] =
            formattedNumber(newValue, locale);
        }
      });

      const newBuildData = buildDataWithAggregate(
        newData,
        rowHeaders.length,
        colHeaders.length,
        aggregate,
        rowAggregates,
        parentRowIndices,
        colHeaders,
        colAggregates,
        needsColAggregate
      );

      setTableData(newBuildData);

      if (onChange) onChange(changes);
    };

    // Determine extra row headers for aggregate row
    const extraRowHeaders = useMemo(() => {
      const shouldCreateBottomRow =
        rowHeaders.length > 1 &&
        (aggregate ||
          (rowAggregates && rowAggregates.some((agg) => agg !== null)));

      if (shouldCreateBottomRow) {
        const aggregateHeader = getAggregateHeader(rowAggregates);
        return [...rowHeaders, aggregateHeader];
      }
      return rowHeaders;
    }, [rowHeaders, aggregate, rowAggregates]);

    // Determine extra col headers for aggregate column
    const extraColHeaders = useMemo(() => {
      if (
        needsColAggregate &&
        colAggregates &&
        colAggregates.some((agg) => agg !== null)
      ) {
        const aggregateHeader = getAggregateHeader(colAggregates);
        return [...colHeaders, aggregateHeader];
      }
      return colHeaders;
    }, [colHeaders, needsColAggregate, colAggregates]);

    const rowHeaderWidth = useMemo(
      () => calculateRowHeaderWidthPrecise(extraRowHeaders, "14px Arial", 40),
      [extraRowHeaders]
    );

    // Custom row header renderer to make parent rows and total row bold
    const afterGetRowHeader = (row: number, TH: HTMLTableCellElement) => {
      const isParentRow = parentRowIndices && parentRowIndices.has(row);
      const hasAggregate =
        aggregate ||
        (rowAggregates && rowAggregates.some((agg) => agg !== null));
      const isTotalRow = row === extraRowHeaders.length - 1 && hasAggregate;

      if (isParentRow || isTotalRow) {
        TH.style.fontWeight = "700";
        TH.style.backgroundColor = isParentRow ? "#f9fafb" : "#f3f4f6";
        TH.style.textAlign = "center";
      }
    };

    return (
      <div className="my-4">
        <HotTable
          ref={hotRef}
          height={"auto"} // set table height to auto
          stretchH="all" // make table width 100%
          data={tableData}
          themeName="ht-theme-main"
          colHeaders={extraColHeaders}
          rowHeaders={extraRowHeaders}
          afterGetRowHeader={afterGetRowHeader}
          maxCols={extraColHeaders.length} // prevent to add new columns
          maxRows={extraRowHeaders.length} // prevent to add new rows
          fixedColumnsLeft={0}
          rowHeaderWidth={rowHeaderWidth} // set row header width
          navigableHeaders={false} // prevent navigating headers
          tabNavigation={true} // enable tab navigation or arrow keys
          columnSorting={false}
          multiColumnSorting={false}
          filters={false}
          contextMenu={false}
          columns={(index) => {
            return {
              data: index < colHeaders.length ? colHeaders[index] : TOTAL_KEY,
              type: "numeric",
              numericFormat: numericFormat,
            };
          }}
          cells={(row, col) => {
            const lastRow = extraRowHeaders.length - 1;
            const lastCol = extraColHeaders.length - 1;
            const onlyOneCol = colHeaders.length === 1;
            const onlyOneRow = rowHeaders.length === 1;
            const hasAggregate =
              aggregate ||
              (rowAggregates && rowAggregates.some((agg) => agg !== null));

            // Check if current row is a parent row
            const isParentRow = parentRowIndices && parentRowIndices.has(row);
            const isTotalRow = row === lastRow && hasAggregate;
            const isTotalCol = col === lastCol && needsColAggregate;

            // Total column - make bold and readonly
            if (!onlyOneRow && isTotalCol && !isTotalRow) {
              return {
                copyPaste: false,
                readOnly: true,
                className: "htBold total-cell",
              };
            }

            // Total row - make bold and readonly
            if (!onlyOneCol && !onlyOneRow && isTotalRow && !isTotalCol) {
              return {
                copyPaste: false,
                readOnly: true,
                className: "htBold total-cell",
              };
            }

            // Grand total cell (bottom-right corner)
            if (isTotalRow && isTotalCol) {
              return {
                copyPaste: false,
                readOnly: true,
                className: "htBold total-cell",
              };
            }

            // Kasus khusus: hanya 1 kolom dengan aggregate row
            if (onlyOneCol && row === lastRow && hasAggregate)
              return {
                copyPaste: false,
                readOnly: true,
                className: "htBold total-cell",
              };

            // Parent rows should be bold and readonly
            if (isParentRow) {
              return {
                readOnly: true,
                className: "htBold parent-row",
              };
            }

            return { readOnly: isLocked };
          }}
          wordWrap={true}
          autoWrapCol={true}
          autoWrapRow={true}
          dropdownMenu={false}
          autoColumnSize={true}
          autoRowSize={true}
          manualColumnResize={false}
          manualRowResize={false}
          manualRowMove={false}
          className="htCenter z-0"
          licenseKey="non-commercial-and-evaluation"
          afterChange={handleAfterChange}
        />
      </div>
    );
  }
);

export default TableStatio;
