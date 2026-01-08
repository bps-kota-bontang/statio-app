import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/component/ui/Input";
import Button from "@/component/ui/Button";
import { Label } from "@/component/ui/Label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  Mail,
  Building2,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { useUserApi } from "@/service/user";
import type { UpdateEmailRequest } from "@/type/user";
const ProfileTab = () => {
  const { user, setUser } = useAuth();
  const { updateProfile } = useUserApi();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UpdateEmailRequest>({
    email: user?.email || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const response = await updateProfile(profileData);
      setUser(response.data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-gray-900 mb-0.5">
          <User className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-semibold">Profile Information</h2>
        </div>
        <p className="text-gray-600 text-xs">Update your personal details</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="flex items-center gap-1.5 text-sm">
            <Mail className="w-3.5 h-3.5 text-gray-500" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={profileData.email || ""}
            onChange={(val) => setProfileData({ ...profileData, email: val })}
            placeholder="Enter email"
            inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Read-only Information
          </p>
          <div className="space-y-3">
            <div>
              <Label className="flex items-center gap-1.5 text-sm mb-1.5">
                <User className="w-3.5 h-3.5 text-gray-500" />
                Username
              </Label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {user?.username || "-"}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1.5 text-sm mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                Organization
              </Label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {user?.organization?.name || "-"}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1.5 text-sm mb-1.5">
                <Shield className="w-3.5 h-3.5 text-gray-500" />
                Roles
              </Label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {user?.roles?.join(", ") || "-"}
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600! hover:bg-blue-700! text-white! py-2.5! font-medium! shadow-md! hover:shadow-lg! transition-all text-sm"
          disabled={isUpdatingProfile}
        >
          {isUpdatingProfile ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Update Profile
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProfileTab;
