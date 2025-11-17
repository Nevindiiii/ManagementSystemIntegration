import { User } from '@/components/data-table/columns';
import RowsPerPageSelect from '@/components/customUi/rows-per-page-select';
import { usePostStore } from '@/store/postStore';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUserQueries';
import React from 'react';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/customUi/pagination';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/form/add-post-form';
import TableColumnsDropdown from '@/components/data-table/table-columns-dropdown';
import UsersTable from './tables/table-columns/users-table';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import DeleteAlert from '@/components/customUi/delete-alert';

type Props = {
  data?: User[];
  onAddData?: (data: User) => void;
};

export default function NewlyAddedUsersTable({ data, onAddData }: Props) {
  const { newPosts, removePost } = usePostStore();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const { data: response, isLoading, error } = useUsers(currentPage, pageSize);
  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();
  
  const [addOpen, setAddOpen] = React.useState(false);
  
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Handle query errors with toast notifications
  React.useEffect(() => {
    if (error) {
      console.error('Users query error:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to fetch users';
      toast.error(`Error loading users: ${errorMessage}`);
    }
  }, [error]);

  const [table, setTable] = React.useState<any | null>(null);
  
  const backendUsers = response?.users || [];
  const pagination = response?.pagination;

  // Get selected rows
  const selectedRows = table?.getSelectedRowModel?.()?.rows || [];
  const selectedCount = selectedRows.length;

  // Bulk delete handler
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedUsers = selectedRows.map((row: any) => row.original).filter((user: any) => user && user.id);
      
      if (selectedUsers.length === 0) {
        toast.error('No valid users selected');
        setIsDeleting(false);
        return;
      }
      
      // Delete each user
      for (const user of selectedUsers) {
        try {
          await deleteUserMutation.mutateAsync(user.id);
        } catch (error) {
          console.error(`Failed to delete user ${user.id}:`, error);
          removePost(user.id);
        }
      }
      
      toast.success(`Successfully deleted ${selectedUsers.length} user(s)`);
      table?.resetRowSelection?.();
      setDeleteOpen(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Failed to delete some users');
    } finally {
      setIsDeleting(false);
    }
  };

  const getColumn = React.useCallback(
    (id: string) => {
      if (!table) return undefined;
      if (typeof table.getColumn === 'function') return table.getColumn(id);
      if (table.table && typeof table.table.getColumn === 'function')
        return table.table.getColumn(id);
      return undefined;
    },
    [table]
  );

  const handleAdd = async (userData: User) => {
    if (onAddData) return onAddData(userData);
    
    try {
      console.log('Sending user data to backend:', userData);
      const newUser = await createUserMutation.mutateAsync(userData);
      console.log('User saved successfully to database:', newUser);
      // Go to page 1 to see the newly added user
      setCurrentPage(1);
      return newUser;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      
      // Extract error message from backend response
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create user';
      const errorDetails = error?.response?.data?.errors || [];
      const missingFields = error?.response?.data?.missingFields || [];
      
      // Show detailed error message
      if (missingFields.length > 0) {
        toast.error(`Missing fields: ${missingFields.join(', ')}`);
      } else if (errorDetails.length > 0) {
        toast.error(`Validation error: ${errorDetails.join(', ')}`);
      } else {
        toast.error(errorMsg);
      }
      
      throw error;
    }
  };

  // Combine backend data with local store data
  const allUsers = React.useMemo(() => {
    if (data) return data;
    
    const backend = backendUsers || [];
    const local = newPosts || [];
    
    // If we have backend data, prioritize it and only add local items that don't exist in backend
    if (backend.length > 0) {
      const backendIds = new Set(backend.map(user => user.id));
      const uniqueLocal = local.filter(user => !backendIds.has(user.id));
      return [...backend, ...uniqueLocal];
    }
    
    // If no backend data, show local only
    return local;
  }, [data, backendUsers, newPosts]);

  // Calculate the next available ID - fetch from all users, not just current page
  const getNextId = React.useCallback(() => {
    // Use total count from pagination to generate next ID
    if (pagination?.totalUsers) {
      return pagination.totalUsers + 1;
    }
    
    if (!allUsers || allUsers.length === 0) return 1;
    
    // Get all existing IDs and sort them
    const existingIds = allUsers
      .map(user => user.id || 0)
      .filter(id => id > 0)
      .sort((a, b) => a - b);
    
    if (existingIds.length === 0) return 1;
    
    // Return max + 1
    return Math.max(...existingIds) + 1;
  }, [allUsers, pagination]);

  if (isLoading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error loading users: {error.message}</div>;
  }

  return (
    <div className="ms-container">
      <div className="ms-header">
        <h2>Users</h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Filter names..."
          value={(getColumn('firstName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            getColumn('firstName')?.setFilterValue?.(event.target.value)
          }
          className="max-w-sm"
        />

        <div className="flex gap-3">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedCount})
            </Button>
          )}
          <TableColumnsDropdown table={table} />
          <Button 
            onClick={() => setAddOpen(true)}
            disabled={createUserMutation.isPending}
            className="bg-black text-white hover:bg-gray-800"
          >
            {createUserMutation.isPending ? 'Adding...' : 'Add User'}
          </Button>
        </div>
      </div>

      <UserForm
        open={addOpen}
        onOpenChange={setAddOpen}
        nextId={getNextId()}
        onSubmit={async (d) => {
          try {
            await handleAdd(d as User);
            setAddOpen(false);
           
          } catch (error) {
            // Error handling - could show error message
            console.error('Error creating user:', error);
          }
        }}
      />

      <DeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={`${selectedCount} user(s)`}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
      />

      <UsersTable
        data={allUsers}
        onTableChange={setTable}
      />

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <RowsPerPageSelect
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
            className="h-8 w-[70px]"
          />
        </div>
        <DataTablePagination
          pageIndex={currentPage - 1}
          pageCount={pagination?.totalPages || 1}
          onPageChange={(page) => setCurrentPage(page + 1)}
          showPageJump={true}
        />
      </div>
    </div>
  );
}
