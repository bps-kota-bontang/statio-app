import { useState } from "react";

interface BadgeProps {
  label: string;
  copyable?: boolean;
  className?: string;
  onClick?: () => Promise<void> | void;
  setClipboard?: (text: string) => Promise<void>;
  onCopy?: () => Promise<string | undefined>;
}

const Badge = ({
  label,
  copyable = true,
  className,
  onClick,
  onCopy,
}: BadgeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 800);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClick = async () => {
    if (onClick) {
      onClick(); // jalankan handler custom
      return;
    }

    if (!copyable) return;

    if (onCopy) {
      const textToCopy = await onCopy();
      if (textToCopy) {
        await handleCopy(textToCopy);
      } else {
        alert("Failed to copy.");
      }
      return;
    }

    await handleCopy(label);
  };

  return (
    <span
      onClick={handleClick}
      className={`relative inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded select-none transition-colors ${
        copyable ? "cursor-pointer hover:bg-gray-300" : ""
      } ${className}`}
      title={copyable ? "Click to copy" : undefined}
    >
      <span>{label}</span>

      {/* Badge popup untuk copy */}
      {copyable && (
        <span
          className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-green-200 text-green-800 p-1 rounded-md shadow-md 
          transition-all duration-300 ease-out pointer-events-none
          ${copied ? "opacity-100 -translate-y-1" : "opacity-0 -translate-y-2"}
          z-50`}
        >
          Copied!
        </span>
      )}
    </span>
  );
};

export default Badge;
