import { useState } from "react";
import { useUserApi } from "@/service/user";
import Input from "@/component/ui/Input";
import Button from "@/component/ui/Button";
import { Label } from "@/component/ui/Label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Lock, KeyRound } from "lucide-react";
import type { UpdatePasswordRequest } from "@/type/user";

const SecurityTab = () => {
  const { changePassword } = useUserApi();
  const { user } = useAuth();
  const { toast } = useToast();

  const hasPassword = user?.has_password ?? true;

  const [passwordData, setPasswordData] = useState<UpdatePasswordRequest>({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Jika user tidak memiliki password, jangan kirim old_password
      const payload: UpdatePasswordRequest = hasPassword
        ? passwordData
        : {
            new_password: passwordData.new_password,
            confirm_password: passwordData.confirm_password,
          };

      await changePassword(payload);
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-gray-900 mb-0.5">
          <Lock className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-semibold">Security Settings</h2>
        </div>
        <p className="text-gray-600 text-xs">
          {hasPassword
            ? "Keep your account secure by changing your password"
            : "Set up a password for your account"}
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        {hasPassword && (
          <div className="space-y-1.5">
            <Label
              htmlFor="old_password"
              className="flex items-center gap-1.5 text-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-gray-500" />
              Old Password
            </Label>
            <Input
              id="old_password"
              type="password"
              value={passwordData.old_password || ""}
              onChange={(val) =>
                setPasswordData({
                  ...passwordData,
                  old_password: val,
                })
              }
              placeholder="••••••••"
              inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
              required
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label
            htmlFor="new_password"
            className="flex items-center gap-1.5 text-sm"
          >
            <Lock className="w-3.5 h-3.5 text-gray-500" />
            New Password
          </Label>
          <Input
            id="new_password"
            type="password"
            value={passwordData.new_password}
            onChange={(val) =>
              setPasswordData({
                ...passwordData,
                new_password: val,
              })
            }
            placeholder="••••••••"
            inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirm_password"
            className="flex items-center gap-1.5 text-sm"
          >
            <Lock className="w-3.5 h-3.5 text-gray-500" />
            Confirm New Password
          </Label>
          <Input
            id="confirm_password"
            type="password"
            value={passwordData.confirm_password}
            onChange={(val) =>
              setPasswordData({
                ...passwordData,
                confirm_password: val,
              })
            }
            placeholder="••••••••"
            inputClassName="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600! hover:bg-blue-700! text-white! py-2.5! font-medium! shadow-md! hover:shadow-lg! transition-all text-sm"
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-3.5 w-3.5" />
              Update Password
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default SecurityTab;
