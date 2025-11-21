import { Link, useNavigate } from "react-router";
import type { BreadcrumbItem } from "@/type/breadcrumb";
import { ArrowLeft } from "lucide-react";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onBack?: () => void;
}

const Breadcrumb = ({ items, onBack }: BreadcrumbProps) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  const handleBack = () => {
    if (onBack) return onBack();

    // Cari item sebelumnya yang punya href
    for (let i = items.length - 2; i >= 0; i--) {
      const candidate = items[i];
      if (candidate.href) {
        return navigate(candidate.href);
      }
    }

    // Jika tidak ada href sama sekali → fallback
    navigate(-1);
  };

  const showBack = items.length > 1; // ⬅️ hanya tampil jika item > 1

  return (
    <nav className="text-sm mb-4 flex items-center gap-3">
      {/* Back Button (only if items > 1) */}
      {showBack && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
        </button>
      )}

      {/* Breadcrumb Items */}
      <ol className="flex items-center gap-2 text-gray-600">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          const textClass =
            item.highlight === false
              ? "text-gray-600 font-normal"
              : isLast
              ? "font-semibold text-gray-900"
              : "text-gray-700";

          return (
            <li key={i} className="flex items-center gap-2 relative">
              {item.label ? (
                item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className={`hover:underline hover:text-gray-900 ${textClass}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={textClass}>{item.label}</span>
                )
              ) : (
                <div className="bg-gray-200 rounded relative overflow-hidden h-4 w-20 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton" />
              )}

              {!isLast && <span>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
