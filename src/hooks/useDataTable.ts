"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";

// membuat object default filters dari array key string/number
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

  const pageFromUrl = Number(searchParams.get("page") ?? 1);

  // Cast semua key ke string supaya sesuai dengan createDefaultFilters
  const stringKeys = keys.map((k) => k.toString());

  const initialFilters = createDefaultFilters(stringKeys);

  const [filters, setFilters] =
    useState<Record<string, string[]>>(initialFilters);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">();

  const onPageChange = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      navigate({ search: params.toString() }, { replace: true });
    },
    [navigate, searchParams]
  );

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const onSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      onPageChange(1);
    },
    [onPageChange]
  );

  const onSort = useCallback(
    (field: string) => {
      setSortBy((prev) => {
        if (prev === field) {
          setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        } else {
          setSortOrder("asc");
        }
        return field;
      });
      onPageChange(1);
    },
    [onPageChange]
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
      onPageChange(1);
    },
    [onPageChange]
  );

  return {
    page: pageFromUrl,
    perPage,
    search,
    searchTerm,
    sortBy,
    sortOrder,
    filters,
    onPageChange,
    onPerPageChange: setPerPage,
    onSearchChange,
    onSort,
    onFilterChange,
  };
}
