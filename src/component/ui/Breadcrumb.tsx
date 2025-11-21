import { Link } from "react-router";
import type { BreadcrumbItem } from "@/type/breadcrumb";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="text-sm mb-4">
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
              {item.label == null ? (
                <div className="absolute top-0 left-0 h-full w-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton" />
              ) : item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={`hover:underline hover:text-gray-900 ${textClass}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={textClass}>{item.label}</span>
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
