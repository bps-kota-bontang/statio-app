// components/ui/Select.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface BaseSelectProps {
  options: Option[];
  placeholder?: string;
  multiple?: boolean;
}

type SingleSelectProps = BaseSelectProps & {
  multiple?: false;
  maximumSelection?: never;
  value?: string;
  onChange: (value: string) => void;
};

type MultiSelectProps = BaseSelectProps & {
  multiple: true;
  maximumSelection?: number;
  value?: string[];
  onChange: (value: string[]) => void;
};

type SelectProps = SingleSelectProps | MultiSelectProps;

const Select = ({
  options,
  value,
  onChange,
  placeholder = "-- Select --",
  multiple = false,
  maximumSelection = 10,
}: SelectProps) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter(
      (opt) =>
        (!multiple || !(value as string[] | undefined)?.includes(opt.value)) &&
        opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, value, multiple]);

  const selectedLabel = !multiple
    ? options.find((opt) => opt.value === value)?.label || ""
    : "";

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (val: string) => {
    if (!multiple) {
      (onChange as (v: string) => void)(val);
      setIsOpen(false);
    } else {
      const currentValue = (value as string[]) || [];

      // Cek maximumSelection
      if (!currentValue.includes(val)) {
        if (maximumSelection && currentValue.length >= maximumSelection) {
          return; // Tidak menambah lagi
        }
        (onChange as (v: string[]) => void)([...currentValue, val]);
      } else {
        (onChange as (v: string[]) => void)(
          currentValue.filter((v) => v !== val)
        );
      }
    }
    setSearch("");
  };

  const displayValues = multiple ? (value as string[] | undefined) || [] : [];

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="border border-gray-300 rounded px-2 py-1 cursor-pointer flex flex-wrap items-center min-h-9.5 relative"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex flex-wrap flex-1 gap-1">
          {!multiple && <span>{selectedLabel || placeholder}</span>}

          {multiple && displayValues.length === 0 && (
            <span className="text-gray-400">{placeholder}</span>
          )}

          {multiple &&
            displayValues.map((val) => {
              const label = options.find((opt) => opt.value === val)?.label;
              return (
                <span
                  key={val}
                  className="flex items-center bg-gray-200 rounded px-2 py-0.5 text-sm"
                >
                  {label}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(val);
                    }}
                  />
                </span>
              );
            })}
        </div>

        {/* Chevron tetap di kanan, center secara vertikal */}
        <div className="flex items-center ml-2">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-60 overflow-auto">
          <input
            type="text"
            className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul>
            <ul>
              {filteredOptions.map((opt) => {
                const isDisabled =
                  multiple &&
                  maximumSelection &&
                  displayValues.length >= maximumSelection &&
                  !displayValues.includes(opt.value);

                return (
                  <li
                    key={opt.value}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      isDisabled
                        ? "text-gray-400 cursor-not-allowed hover:bg-white"
                        : ""
                    }`}
                    onClick={() => !isDisabled && toggleOption(opt.value)}
                  >
                    {opt.label}
                  </li>
                );
              })}
              {filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-gray-400">No options found</li>
              )}
            </ul>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
