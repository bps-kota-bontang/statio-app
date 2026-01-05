import SidebarItem from "@/component/sidebar/SidebarItem";
import { MENU_ITEMS } from "@/constant/menu";
import { COPYRIGHT_YEAR } from "@/constant/dates";
import { useAuth } from "@/hooks/useAuth";
import { PanelRight, LogOut } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const Sidebar = ({
  collapsed: externalCollapsed,
  onToggleCollapsed,
}: SidebarProps) => {
  const { logout, user } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const collapsed = externalCollapsed ?? internalCollapsed;

  const handleLogout = async () => {
    await logout();
  };

  const handleToggleCollapsed = () => {
    if (onToggleCollapsed) {
      onToggleCollapsed();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
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
          onClick={handleToggleCollapsed}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors hidden md:block"
        >
          <PanelRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-4">
          {MENU_ITEMS.filter((item) => {
            // Jika menu tidak punya batasan roles → tampil untuk semua
            if (!item.roles) return true;

            // Jika user tidak punya roles → sembunyikan menu
            if (!user?.roles || user.roles.length === 0) return false;

            // Tampilkan jika ada salah satu role user cocok dengan role menu
            return item.roles.some((r) => user.roles.includes(r));
          }).map((item) => (
            <SidebarItem
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
            © {COPYRIGHT_YEAR} <span className="font-semibold text-gray-700">Statio</span>
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
