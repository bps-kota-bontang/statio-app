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
import { buildDataWithTotals, formattedNumber } from "@/utils/table";

interface TableStatioProps {
  data: RowObject[];
  isLocked?: boolean;
  rowHeaders: string[];
  colHeaders: string[];
  parentRows?: Set<string>;
  dimensionCount: number;
  onChange?: (cells: CellChange[] | null) => void;
  locale?: "id" | "en";
}

registerAllModules();
numbro.registerLanguage(idID);

export const TOTAL_KEY = "Total";

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
      dimensionCount,
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
      buildDataWithTotals(
        data,
        rowHeaders.length,
        colHeaders.length,
        dimensionCount,
        parentRowIndices
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
        buildDataWithTotals(
          data,
          rowHeaders.length,
          colHeaders.length,
          dimensionCount,
          parentRowIndices
        )
      );
    }, [colHeaders.length, data, dimensionCount, rowHeaders, parentRowIndices]);

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

      const newBuildData = buildDataWithTotals(
        newData,
        rowHeaders.length,
        colHeaders.length,
        dimensionCount,
        parentRowIndices
      );

      setTableData(newBuildData);

      if (onChange) onChange(changes);
    };

    const extraColHeaders = useMemo(() => {
      if (colHeaders.length !== 1) {
        return [...colHeaders, TOTAL_KEY];
      }
      return colHeaders;
    }, [colHeaders]);

    const extraRowHeaders = useMemo(() => {
      if (rowHeaders.length !== 1) {
        return [...rowHeaders, TOTAL_KEY];
      }
      return rowHeaders;
    }, [rowHeaders]);

    const rowHeaderWidth = useMemo(
      () => calculateRowHeaderWidthPrecise(extraRowHeaders, "14px Arial", 40),
      [extraRowHeaders]
    );

    // Custom row header renderer to make parent rows and total row bold
    const afterGetRowHeader = (row: number, TH: HTMLTableCellElement) => {
      const isParentRow = parentRowIndices && parentRowIndices.has(row);
      const isTotalRow = row === extraRowHeaders.length - 1;

      if (isParentRow || isTotalRow) {
        TH.style.fontWeight = "700";
        TH.style.backgroundColor = isParentRow ? "#f9fafb" : "#f3f4f6";
        TH.style.textAlign = "center";
      }
    };

    // Custom column header renderer to make Total column bold
    const afterGetColHeader = (col: number, TH: HTMLTableCellElement) => {
      const isTotalCol = col === extraColHeaders.length - 1;
      const colHeader = extraColHeaders[col];

      if (isTotalCol || colHeader === TOTAL_KEY) {
        TH.style.fontWeight = "700";
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
          afterGetColHeader={afterGetColHeader}
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
              data: extraColHeaders[index],
              type: "numeric",
              numericFormat: numericFormat,
            };
          }}
          cells={(row, col) => {
            const lastRow = extraRowHeaders.length - 1;
            const lastCol = extraColHeaders.length - 1;
            const onlyOneCol = colHeaders.length === 1;
            const onlyOneRow = rowHeaders.length === 1;

            // Check if current row is a parent row
            const isParentRow = parentRowIndices && parentRowIndices.has(row);
            const isTotalRow = row === lastRow;
            const isTotalCol = col === lastCol;

            // Kasus khusus: hanya 1 kolom
            if (onlyOneCol && row === lastRow)
              return { copyPaste: false, readOnly: true, className: "htBold" };

            // Kasus khusus: hanya 1 baris
            if (onlyOneRow && col === lastCol)
              return { copyPaste: false, readOnly: true, className: "htBold" };

            // Total row or total column - make bold
            if (!onlyOneCol && !onlyOneRow && (isTotalRow || isTotalCol)) {
              return { copyPaste: false, readOnly: true, className: "htBold" };
            }

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
