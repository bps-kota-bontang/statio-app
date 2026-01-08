import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Tab from "@/component/ui/Tab";
import ProfileTab from "@/component/profile/ProfileTab";
import SecurityTab from "@/component/profile/SecurityTab";
import { Mail, Building2, Shield, CheckCircle2 } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"Profile" | "Security">("Profile");

  return (
    <div className="space-y-4">
      {/* Header with Avatar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {user?.username || "User"}
            </h1>
            {user?.email && (
              <p className="text-gray-600 flex items-center gap-1.5 mt-0.5 text-sm">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                <Building2 className="w-3 h-3" />
                {user?.organization?.name || "No Organization"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                <Shield className="w-3 h-3" />
                {user?.roles?.join(", ") || "No Roles"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation and Content */}
      <div className="p-2 flex flex-col overflow-hidden">
        {/* Tab Header */}
        <div>
          <Tab
            items={["Profile", "Security"] as const}
            selected={activeTab}
            onSelect={setActiveTab}
            className="gap-1"
          />
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "Profile" && <ProfileTab />}
          {activeTab === "Security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
