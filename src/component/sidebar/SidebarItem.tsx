import { NavLink, useLocation } from "react-router";
import type { MenuItem } from "@/type/menu";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SidebarItemProps {
  item: MenuItem;
  collapsed?: boolean;
  level?: number; // untuk indentasi submenu
}

const SidebarItem = ({
  item,
  collapsed = false,
  level = 0,
}: SidebarItemProps) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const location = useLocation();

  const childrenRef = useRef<HTMLUListElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  // Update maxHeight agar animasi smooth
  useEffect(() => {
    if (childrenRef.current) {
      setMaxHeight(open ? `${childrenRef.current.scrollHeight}px` : "0px");
    }
  }, [open, childrenRef.current?.scrollHeight]);

  // Open submenu jika salah satu child aktif
  useEffect(() => {
    if (hasChildren) {
      const childActive = item.children!.some(
        (child) => child.href && location.pathname.startsWith(child.href)
      );
      if (childActive) setOpen(true);
    }
  }, [location.pathname, item.children, hasChildren]);

  const handleClick = () => {
    if (hasChildren) setOpen(!open);
  };

  return (
    <li>
      <div
        className={`flex items-center gap-2 rounded-md transition-all duration-200 cursor-pointer ${
          collapsed ? "justify-center" : "justify-start"
        }`}
        onClick={handleClick}
      >
        {item.href ? (
          <NavLink
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 w-full rounded-md transition-all duration-200
               ${
                 isActive
                   ? "bg-primary text-primary font-semibold"
                   : "text-default hover:bg-primary hover:text-primary"
               }`
            }
          >
            {item.icon}
            {!collapsed && <span className="text-md">{item.title}</span>}
          </NavLink>
        ) : (
          <div className="flex items-center gap-3 p-2 w-full rounded-md text-default hover:bg-primary hover:text-primary transition-all duration-200">
            {item.icon}
            {!collapsed && <span className="text-md">{item.title}</span>}
          </div>
        )}

        {!collapsed && hasChildren && (
          <span
            className={`ml-auto transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </span>
        )}
      </div>

      {/* Animated children */}
      {hasChildren && !collapsed && (
        <ul
          ref={childrenRef}
          style={{ maxHeight }}
          className="overflow-hidden pl-9 my-1 space-y-1 transition-all duration-300 ease-in-out"
        >
          {item.children!.map((child) => (
            <SidebarItem
              key={child.href || child.title}
              item={child}
              collapsed={collapsed}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarItem;
