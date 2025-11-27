"use client";

import { useSearchParams, useNavigate } from "react-router";
import { useCallback, useState } from "react";

export function createDefaultFilters(keys: (string | number)[]) {
  return keys.reduce((acc, key) => {
    acc[key.toString()] = [];
    return acc;
  }, {} as Record<string, string[]>);
}

export function useDataTable<T extends object>(
  keys: (keyof T | string)[] = []
) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stringKeys = keys.map((k) => k.toString());
  const initialFilters = createDefaultFilters(stringKeys);

  const [filters, setFilters] =
    useState<Record<string, string[]>>(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ SELECTION STATE
  const [selectedIDs, setSelectedIDs] = useState<(string | number)[]>([]);

  const onSelectionChange = useCallback((ids: (string | number)[]) => {
    setSelectedIDs(ids);
  }, []);
  const clearSelection = useCallback(() => setSelectedIDs([]), []);

  const updateQuery = useCallback(
    (cb: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      cb(params);
      navigate({ search: params.toString() }, { replace: true });
    },
    [navigate, searchParams]
  );

  // === READ FROM QUERY ===
  const page = Number(searchParams.get("page") ?? "1");
  const perPage = Number(searchParams.get("per_page") ?? "10");
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sort_by") ?? undefined;
  const sortOrder =
    (searchParams.get("sort_order") as "asc" | "desc") ?? undefined;

  // === WRITE TO QUERY ===

  const onPageChange = useCallback(
    (p: number) => {
      updateQuery((params) => {
        params.set("page", String(p));
      });
    },
    [updateQuery]
  );

  const onPerPageChange = useCallback(
    (v: number) => {
      updateQuery((params) => {
        params.set("per_page", String(v));
        params.set("page", "1");
      });
    },
    [updateQuery]
  );

  const onSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      updateQuery((params) => {
        params.set("search", value);
        params.set("page", "1");
      });
    },
    [updateQuery]
  );

  const onSort = useCallback(
    (field: string) => {
      updateQuery((params) => {
        const currentField = params.get("sort_by");
        const currentOrder = params.get("sort_order") as "asc" | "desc";

        if (currentField === field) {
          params.set("sort_order", currentOrder === "asc" ? "desc" : "asc");
        } else {
          params.set("sort_by", field);
          params.set("sort_order", "asc");
        }
        params.set("page", "1");
      });
    },
    [updateQuery]
  );

  const onFilterChange = useCallback(
    (key: string, value: string | string[]) => {
      setFilters((prev) => {
        const newArr = Array.isArray(value)
          ? value
          : (() => {
              const prevArr = prev[key] ?? [];
              return prevArr.includes(value)
                ? prevArr.filter((v) => v !== value)
                : [...prevArr, value];
            })();

        return {
          ...prev,
          [key]: newArr,
        };
      });
      updateQuery((params) => {
        params.set("page", "1");
      });
    },
    [updateQuery]
  );

  return {
    page,
    perPage,
    search,
    searchTerm,
    sortBy,
    sortOrder,
    filters,
    selectedIDs, // ✅ expose selected
    clearSelection, // ✅ useful after assign
    onSelectionChange, // ✅ pass to DataTable
    onPageChange,
    onPerPageChange,
    onSearchChange,
    onSort,
    onFilterChange,
  };
}
