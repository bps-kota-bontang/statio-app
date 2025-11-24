"use client";

import { ChevronUp, ChevronDown, Filter, Search, X } from "lucide-react";
import { DropdownPortal } from "@/component/ui/DropdownPortal";
import { useRef, useState, useEffect, createRef } from "react";
import type { PaginationMeta } from "@/type/response";

export type FilterOption =
  | string
  | {
      label: string;
      value: string;
    };

export type Column<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterOptions?: FilterOption[];
  filterIncludeEmpty?: boolean;
  render?: (row: T, no: number, index: number) => React.ReactNode;
};

function createRenderRow<T extends object>(
  columns: Column<T>[],
  selectable?: boolean
) {
  return (row: T, no: number, index: number) => (
    <>
      {columns.map((col, i) => {
        let value: React.ReactNode;

        if (col.render) {
          value = col.render(row, no, index);
        } else if (col.key in row) {
          const raw = (row as Record<string, unknown>)[col.key as string];
          value = (raw as React.ReactNode) ?? "-";
        } else {
          value = "-";
        }

        return (
          <td
            key={i}
            className={`py-2 text-sm ${
              i === 0 && selectable ? "pl-0 pr-4" : "px-4"
            }`}
          >
            {value}
          </td>
        );
      })}
    </>
  );
}

export type DataTableProps<
  T extends { id?: string | number }, // 👈 Tambah constraint
  F extends Record<string, string[]>
> = {
  data: T[];
  meta?: PaginationMeta;
  columns: Column<T>[];
  perPageOptions?: number[];
  maxPageButtons?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  filters?: F;
  isLoading?: boolean;
  selectable?: boolean; // 👈 aktifkan fitur selectable
  selectedKeys?: (string | number)[];
  getRowId?: (row: T) => string | number;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  onPerPageChange?: (v: number) => void;
  onPageChange?: (p: number) => void;
  onSort?: (key: keyof T) => void;
  onSearchChange?: (v: string) => void;
  onFilterChange?: <K extends keyof F>(
    key: K,
    value: string | string[]
  ) => void;
  actions?: React.ReactNode;
};

export default function DataTable<
  T extends { id?: string | number },
  F extends Record<string, string[]>
>({
  data,
  meta,
  columns,
  perPageOptions = [5, 10, 20, 50, 100, 250, 500, 1000],
  maxPageButtons = 5,
  selectable = false, // 👈 default off
  selectedKeys,
  getRowId,
  onSelectionChange,
  perPage,
  sortBy,
  sortOrder,
  searchTerm,
  filters,
  isLoading,
  onPerPageChange,
  onPageChange,
  onSort,
  onSearchChange,
  onFilterChange,
  actions,
}: DataTableProps<T, F>) {
  const [internalSelected, setInternalSelected] = useState<(string | number)[]>(
    []
  );
  const renderRow = createRenderRow(columns, selectable);
  const selected = selectedKeys ?? internalSelected;
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selected.length > 0 && selected.length < data.length;
    }
  }, [selected, data.length]);

  const toggleRow = (id: string | number) => {
    const exists = selected.includes(id);
    const next = exists ? selected.filter((v) => v !== id) : [...selected, id];
    if (!selectedKeys) setInternalSelected(next);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    if (selected.length === data.length) {
      setInternalSelected([]);
      onSelectionChange?.([]);
    } else {
      const allIds = data.map((row) => (getRowId ? getRowId(row) : row.id!));
      setInternalSelected(allIds);
      onSelectionChange?.(allIds);
    }
  };
  const dropdownRefs = useRef<
    Record<string, React.RefObject<HTMLDivElement | null>>
  >({});

  useEffect(() => {
    columns.forEach((c) => {
      const key = String(c.key);
      if (!dropdownRefs.current[key])
        dropdownRefs.current[key] = createRef<HTMLDivElement>();
    });
  }, [columns]);

  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const isFilterActive = (key: string) => filters && filters[key]?.length > 0;

  const toggleDropdown = (key: string) => {
    const ref = dropdownRefs.current[key]?.current;
    if (ref) setAnchorRect(ref.getBoundingClientRect());
    setDropdownOpen((p) => ({ ...p, [key]: !p[key] }));
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".filter-dropdown")) return;
      Object.keys(dropdownRefs.current).forEach((k) => {
        if (!dropdownRefs.current[k]?.current?.contains(e.target as Node)) {
          setDropdownOpen((prev) => ({ ...prev, [k]: false }));
        }
      });
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // === SORT ICON ===
  const icon = (field: string) =>
    sortBy !== field ? null : sortOrder === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );

  // === PAGINATION BUTTONS ===
  const half = Math.floor(maxPageButtons / 2);
  let start = Math.max((meta?.page ?? 1) - half, 1);
  const end = Math.min(start + maxPageButtons - 1, meta?.pages ?? 1);
  if (end - start < maxPageButtons - 1)
    start = Math.max(end - maxPageButtons + 1, 1);
  const pages = [...Array(end - start + 1)].map((_, i) => start + i);

  // === TABLE RENDER ===
  return (
    <div className="space-y-3">
      {/* === SEARCH & ACTION BAR === */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
        <div>{actions}</div>
        {onSearchChange && (
          <div className="relative w-full ml-auto sm:w-64">
            <input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-8 py-1.5 border border-gray-300 rounded w-full text-sm"
            />
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* === TABLE === */}
      <div className="overflow-auto border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {selectable && (
                <th className="px-4 py-2 w-9">
                  <div className="flex items-center justify-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      onChange={toggleAll}
                      checked={
                        selected.length === data.length && data.length > 0
                      }
                    />
                  </div>
                </th>
              )}
              {columns.map((c, i) => (
                <th
                  key={String(c.key)}
                  className={`py-2 text-left text-sm font-medium text-gray-700 ${
                    i === 0 && selectable ? "pl-0 pr-4" : "px-4"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span
                      className={c.sortable ? "cursor-pointer" : ""}
                      onClick={() => c.sortable && onSort?.(c.key as keyof T)}
                    >
                      {c.label} {c.sortable && icon(String(c.key))}
                    </span>

                    {c.filterOptions && filters && (
                      <div
                        className="relative"
                        ref={dropdownRefs.current[c.key as string]}
                      >
                        <button onClick={() => toggleDropdown(c.key as string)}>
                          <Filter
                            className={`w-4 h-4 ${
                              isFilterActive(c.key as string)
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                          {isFilterActive(c.key as string) && (
                            <span className="absolute -top-1 -right-1 text-[10px] min-w-3.5 h-3.5 px-1 flex items-center justify-center rounded-full bg-blue-600 text-white">
                              {filters?.[c.key as string]?.length}
                            </span>
                          )}
                        </button>

                        {dropdownOpen[c.key as string] && anchorRect && (
                          <DropdownPortal anchorRect={anchorRect}>
                            <div className="filter-dropdown bg-white border border-gray-200 rounded shadow p-2 max-h-56 overflow-auto w-48">
                              {/* === SEARCH BOX === */}
                              <input
                                type="text"
                                value={filterSearch[c.key as string] ?? ""}
                                onChange={(e) =>
                                  setFilterSearch((prev) => ({
                                    ...prev,
                                    [c.key as string]: e.target.value,
                                  }))
                                }
                                placeholder="Search options..."
                                className="w-full mb-2 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                              {/* Actions */}
                              <div className="flex justify-between mb-1 text-xs">
                                <button
                                  type="button"
                                  className="text-blue-600 hover:underline"
                                  onClick={() => {
                                    if (onFilterChange) {
                                      const allOptions = [
                                        "__NULL__",
                                        ...(c.filterOptions?.map((opt) =>
                                          typeof opt === "string"
                                            ? opt
                                            : opt.value
                                        ) || []),
                                      ];
                                      onFilterChange(
                                        c.key as string,
                                        allOptions
                                      );
                                    }
                                  }}
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  className="text-red-600 hover:underline"
                                  onClick={() => {
                                    if (onFilterChange) {
                                      (
                                        filters?.[c.key as string] || []
                                      ).forEach((opt) =>
                                        onFilterChange(c.key as keyof F, opt)
                                      );
                                    }
                                  }}
                                >
                                  Clear
                                </button>
                              </div>

                              {/* Kosong option — default muncul kecuali filterIncludeEmpty = false */}
                              {c.filterIncludeEmpty !== false && (
                                <label className="flex items-center gap-2 text-sm py-1">
                                  <input
                                    type="checkbox"
                                    checked={
                                      filters?.[c.key as string]?.includes(
                                        "__NULL__"
                                      ) ?? false
                                    }
                                    onChange={() =>
                                      onFilterChange?.(
                                        c.key as keyof F,
                                        "__NULL__"
                                      )
                                    }
                                  />
                                  (Kosong)
                                </label>
                              )}

                              {/* Filter options */}
                              {c.filterOptions
                                .filter((opt) => {
                                  const option =
                                    typeof opt === "string"
                                      ? { label: opt, value: opt }
                                      : opt;
                                  const term = (
                                    filterSearch[c.key as string] || ""
                                  ).toLowerCase();
                                  return option.label
                                    .toLowerCase()
                                    .includes(term);
                                })
                                .map((opt) => {
                                  const option =
                                    typeof opt === "string"
                                      ? { label: opt, value: opt }
                                      : opt;

                                  return (
                                    <label
                                      key={option.value}
                                      className="flex items-center gap-2 text-sm py-1"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          filters?.[c.key as string]?.includes(
                                            option.value
                                          ) ?? false
                                        }
                                        onChange={() =>
                                          onFilterChange?.(
                                            c.key as keyof F,
                                            option.value
                                          )
                                        }
                                      />
                                      {option.label}
                                    </label>
                                  );
                                })}
                            </div>
                          </DropdownPortal>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* === BODY === */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              Array(perPage || 5)
                .fill(0)
                .map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {columns.map((col, colIdx) => (
                      <td key={String(col.key)} className="px-4 py-2">
                        <div
                          className={`h-4 bg-gray-200 rounded relative overflow-hidden ${
                            colIdx % 2 === 0 ? "w-3/4" : "w-1/2"
                          }`}
                        >
                          <div className="absolute top-0 left-0 h-full w-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton"></div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
            ) : data.length ? (
              data.map((row, index) => {
                const page = meta?.page ?? 1;
                const perPageCount = meta?.per_page ?? perPage ?? 10;
                const no = index + 1 + (page - 1) * perPageCount;
                const id = getRowId ? getRowId(row) : row.id!;
                const isSelected = selected.includes(id);

                return (
                  <tr
                    key={String(id)}
                    className={`hover:bg-gray-50 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-2 w-9">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                          />
                        </div>
                      </td>
                    )}
                    {renderRow(row, no, index)}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === PAGINATION === */}
      {meta && onPageChange && (
        <div className="mt-2 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 space-y-2 sm:space-y-0">
          <div className="flex items-center gap-2">
            <select
              value={perPage}
              onChange={(e) => onPerPageChange?.(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {perPageOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>
              Showing {data.length} of {meta.total} items (Page {meta.page} of{" "}
              {meta.pages})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={meta.page === 1}
              onClick={() => onPageChange(1)}
              className="px-2 bg-gray-200 rounded"
            >
              First
            </button>
            <button
              disabled={meta.page === 1}
              onClick={() => onPageChange(meta.page - 1)}
              className="px-2 bg-gray-200 rounded"
            >
              Prev
            </button>

            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-2 rounded ${
                  p === meta.page ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={meta.page === meta.pages}
              onClick={() => onPageChange(meta.page + 1)}
              className="px-2 bg-gray-200 rounded"
            >
              Next
            </button>
            <button
              disabled={meta.page === meta.pages}
              onClick={() => onPageChange(meta.pages)}
              className="px-2 bg-gray-200 rounded"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
