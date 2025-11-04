import MenuItem from "@/component/layout/statio/MenuItem";
import { MENU_ITEMS } from "@/constant/menu";
import { PanelRight } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar text-gray-900 shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Sidebar header */}
      <div
        className={`flex items-center p-4 ${
          collapsed ? "justify-center" : "justify-between"
        } border-b border-gray-300`}
      >
        {!collapsed && <h1 className="text-lg font-semibold">Statio</h1>}
        <PanelRight
          className="cursor-pointer text-gray-500 hover:text-white transition-colors w-5 h-5 mb-1"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-4">
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.href || item.title}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 text-sm text-gray-400 border-t border-gray-300">
        {!collapsed && <>© 2025 Statio</>}
      </div>
    </aside>
  );
};

export default Sidebar;
