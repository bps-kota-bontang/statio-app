import React from "react";

interface SwitchProps {
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center gap-2 select-none text-sm font-medium ${
        disabled
          ? "cursor-not-allowed text-gray-400"
          : "cursor-pointer text-gray-700"
      } ${className}`}
    >
      {label && <span>{label}</span>}
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          checked ? "bg-green-500/80" : "bg-gray-300/60"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
};

export default Switch;
