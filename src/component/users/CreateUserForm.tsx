"use client";

import { useCallback, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import type { CreateUserRequest } from "@/type/user";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import Select from "@/component/ui/Select";
import { useOrganizationApi } from "@/service/organization";

interface CreateUserFormProps {
  onSubmit?: (data: CreateUserRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const CreateUserForm = ({ onSubmit, onCancel }: CreateUserFormProps) => {
  const { useOrganizations } = useOrganizationApi();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [inviteToken, setInviteToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: organizations } = useOrganizations();

  const { errors, validate } = useRequiredFields<CreateUserRequest>();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const isValid = validate(
        {
          username,
          email,
          password,
          roles,
          organization_id: organizationId,
          invite_token: inviteToken,
        },
        [
          "username",
          "email",
          "password",
          "roles",
          "organization_id",
          "invite_token",
        ]
      );

      if (!isValid) return;

      setIsSubmitting(true);
      const success = await onSubmit({
        username,
        email,
        password,
        roles,
        organization_id: organizationId,
        invite_token: inviteToken,
      });
      setIsSubmitting(false);
      if (success) {
        setUsername("");
        setEmail("");
        setPassword("");
        setOrganizationId("");
        setInviteToken("");
        setRoles([]);
      }
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
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Username */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Username</label>
        <Input
          value={username}
          onChange={setUsername}
          type="text"
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
          onSelect={setEmail}
          placeholder="Contoh: user@example.com"
        />
        <p className="text-xs text-gray-500 mt-1">Masukkan email pengguna.</p>
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Password</label>
        <Input
          value={password}
          onChange={setPassword}
          type="password"
          placeholder="Masukkan password"
        />
        <p className="text-xs text-gray-500 mt-1">
          Masukkan password pengguna.
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
          maximumSelection={2}
          value={roles}
          onChange={setRoles}
          multiple={true}
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
            organizations?.data.map((organization) => ({
              value: organization.id,
              label: organization.name,
            })) ?? []
          }
          value={organizationId ?? ""}
          onChange={setOrganizationId}
        />
        <p className="text-xs text-gray-500 mt-1">Pilih organisasi pengguna.</p>
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
            value={inviteToken}
            onChange={setInviteToken}
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
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
