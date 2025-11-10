"use client";

import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

interface InputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (val: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onEnter?: () => void;
  disabled?: boolean;
  required?: boolean;
  type?: string;
}

const Input = ({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder,
  className,
  inputClassName,
  onEnter,
  disabled,
  required,
  type = "text",
}: InputProps) => {
  const [filtered, setFiltered] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (val) {
      const filteredSuggestions = suggestions.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      );
      setFiltered(filteredSuggestions);
      setShow(filteredSuggestions.length > 0);
    } else {
      setShow(false);
    }
  };

  const handleSelect = (val: string) => {
    onSelect?.(val);
    setShow(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEnter) onEnter();
      else if (filtered.length > 0) handleSelect(filtered[0]);
    }
  };

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        required={required}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition ${inputClassName}`}
      />
      {show && (
        <ul className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md max-h-40 overflow-auto shadow-sm">
          {filtered.map((s) => (
            <li
              key={s}
              className="px-3 py-1 text-sm hover:bg-blue-100 cursor-pointer"
              onClick={() => handleSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Input;
