import type { StatioContextType } from "@/component/layout/StatioLayout";
import Badge from "@/component/ui/Badge";
import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import AlertModal from "@/component/ui/AlertModal";
import CreateUserForm from "@/component/users/CreateUserForm";
import EditUserForm from "@/component/users/EditUserForm";
import { useDataTable } from "@/hooks/useDataTable";
import { useOrganizationApi } from "@/service/organization";
import { useUserApi } from "@/service/user";
import type { CreateUserRequest, UpdateUserRequest, User } from "@/type/user";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";

const UsersPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard", href: "/" }, { label: "Users" }]);
  }, [setBreadcrumbs]);

  const { useOrganizations } = useOrganizationApi();
  const { data: organizations } = useOrganizations();
  const { useUsers, createUser, updateUser, deleteUser } = useUserApi();

  const table = useDataTable<User>();

  const { data, isLoading, mutate } = useUsers(table);

  // Modal create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Modal edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTableID, setEditingTableID] = useState<string | null>(null);
  // Modal delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTableID, setDeletingTableID] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setEditingTableID(null);
  };

  const openEdit = useCallback((id: string) => {
    setEditingTableID(id);
    setIsEditOpen(true);
  }, []);

  const openDelete = useCallback((id: string) => {
    setDeletingTableID(id);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteUser = async () => {
    if (!deletingTableID) return;

    try {
      setIsDeleting(true);
      await deleteUser(deletingTableID);
      setIsDeleteOpen(false);
      setDeletingTableID(null);
      mutate();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      await createUser(data);
      setIsCreateOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      return false;
    }
  };

  const handleEditUser = async (id: string, data: UpdateUserRequest) => {
    try {
      await updateUser(id, data);
      handleCloseEditModal();
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  };

  const columns = useMemo<Column<User>[]>(
    () => [
      {
        key: "no",
        label: "No",
        sortable: true,
        render: (_, no) => no, // custom render nomor urut
      },
      {
        key: "username",
        label: "Username",
        sortable: true,
      },
      {
        key: "email",
        label: "Email",
        sortable: true,
      },
      {
        key: "roles",
        label: "Roles",
        filterOptions: [
          { label: "Admin", value: "admin" },
          { label: "Operator", value: "operator" },
        ],
        sortable: false,
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.roles && row.roles.length > 0 ? (
              row.roles.map((role) => <Badge key={role} label={role} />)
            ) : (
              <span className="text-sm text-gray-500">No roles</span>
            )}
          </div>
        ),
      },
      {
        key: "organization_id",
        label: "Organization",
        sortable: true,
        filterOptions:
          organizations?.data.map((org) => {
            return { label: org.name, value: org.id };
          }) || [],
        render: (user) => user.organization?.name || "-",
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => openEdit(row.id)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => openDelete(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [openDelete, openEdit, organizations?.data]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <DataTable
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              <Plus className="w-5 h-5 mr-2" />
              New User
            </Button>
          </div>
        }
        data={data?.data || []}
        meta={data?.meta}
        columns={columns}
        isLoading={isLoading}
        {...table}
      />

      {/* Modal Create */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        closeOutside={false}
      >
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        closeOutside={false}
      >
        {editingTableID && (
          <EditUserForm
            userID={editingTableID}
            onSubmit={handleEditUser}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>

      {/* Modal Delete */}
      <AlertModal
        isOpen={isDeleteOpen}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteUser}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
      />
    </div>
  );
};

export default UsersPage;
