"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import Select from "@/component/ui/Select";
import type { UpdateUserRequest } from "@/type/user";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import { useOrganizationApi } from "@/service/organization";
import { useUserApi } from "@/service/user";
import Loading from "@/component/ui/Loading";
import Error from "@/component/ui/Error";

interface EditUserFormProps {
  userID: string;
  onSubmit?: (id: string, data: UpdateUserRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const EditUserForm = ({ userID, onSubmit, onCancel }: EditUserFormProps) => {
  const { useUser } = useUserApi();
  const { useOrganizations } = useOrganizationApi();

  const { data, isLoading, error } = useUser(userID);

  const { data: organizations } = useOrganizations();
  const { errors, validate } = useRequiredFields<UpdateUserRequest>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [roles, setRoles] = useState<string[]>([]);
  const [inviteToken, setInviteToken] = useState<string | undefined>(undefined);
  const [organizationId, setOrganizationId] = useState<string>("");

  // ✅ Update form values when user data is loaded
  useEffect(() => {
    if (data?.data) {
      setUsername(data.data.username ?? "");
      setEmail(data.data.email ?? "");
      setRoles(data.data.roles?.map((role) => role) ?? []);
      setOrganizationId(data.data.organization_id ?? "");
    }
  }, [data]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const { isValid, data } = validate(
        {
          username,
          email,
          password,
          roles,
          organization_id: organizationId,
          invite_token: inviteToken,
        },
        ["username", "roles"]
      );
      if (!isValid) return;

      setIsSubmitting(true);
      await onSubmit(userID, data);
      setIsSubmitting(false);
    },
    [
      onSubmit,
      validate,
      username,
      email,
      password,
      roles,
      organizationId,
      inviteToken,
      userID,
    ]
  );

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} hideButton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Username */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Username</label>
        <Input
          value={username}
          onChange={setUsername}
          placeholder="Contoh: user123"
        />
        <p className="text-xs text-gray-500 mt-1">
          Masukkan username pengguna.
        </p>
        {errors.username && (
          <p className="text-xs text-red-500">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Email</label>
        <Input
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="Contoh: user@example.com"
        />
        <p className="text-xs text-gray-500 mt-1">Masukkan email pengguna.</p>
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Password</label>
        <Input
          value={password ?? ""}
          onChange={(val) => setPassword(val)}
          type="password"
          placeholder="Masukkan password baru"
        />
        <p className="text-xs text-gray-500 mt-1">
          Masukkan password baru jika ingin mengubahnya.
        </p>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Roles */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Roles</label>
        <Select
          options={[
            { label: "Admin", value: "admin" },
            { label: "Operator", value: "operator" },
          ]}
          value={roles}
          onChange={setRoles}
          multiple
        />
        <p className="text-xs text-gray-500 mt-1">
          Pilih peran pengguna. Dapat memilih lebih dari satu.
        </p>

        {errors.roles && <p className="text-xs text-red-500">{errors.roles}</p>}
      </div>

      {/* Organization */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Organization</label>
        <Select
          options={
            organizations?.data.map((indicator) => ({
              value: indicator.id,
              label: indicator.name,
            })) ?? []
          }
          value={organizationId}
          onChange={setOrganizationId}
        />
        <p className="text-xs text-gray-500 mt-1">
          Pilih organisasi yang bertanggung jawab atas tabel ini.
        </p>
        {errors.organization_id && (
          <p className="text-xs text-red-500">{errors.organization_id}</p>
        )}
      </div>

      {/* Invite Token */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Invite Token</label>
        <div className="flex gap-2 items-center justify-center">
          <Input
            className="flex-1"
            value={inviteToken ?? ""}
            onChange={(val) => setInviteToken(val)}
            placeholder="Masukkan invite token"
            type="password"
          />
          <Button
            type="button"
            onClick={() => {
              const token = crypto.randomUUID();
              setInviteToken(token);
            }}
            variant="secondary"
          >
            Generate
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Masukkan invite token jika ada.
        </p>
        {errors.invite_token && (
          <p className="text-xs text-red-500">{errors.invite_token}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-3">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
