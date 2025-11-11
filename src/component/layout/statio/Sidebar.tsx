import MenuItem from "@/component/layout/statio/MenuItem";
import { MENU_ITEMS } from "@/constant/menu";
import { useAuth } from "@/context/auth/useAuth";
import { PanelRight, LogOut } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar text-gray-900 shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center p-4 ${
          collapsed ? "justify-center" : "justify-between"
        } border-b border-gray-300`}
      >
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-wide text-gray-800">
            Statio
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <PanelRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Menu Items */}
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

      {/* Footer / Logout */}
      <div className="mt-auto p-4 border-t border-gray-300 flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-500 hover:text-white transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
          {!collapsed && (
            <span className="font-medium tracking-wide">Logout</span>
          )}
        </button>

        {!collapsed && (
          <p className="text-xs text-gray-400 text-center mt-2">
            © 2025 <span className="font-semibold text-gray-700">Statio</span>
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
