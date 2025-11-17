import { DataTablePagination } from '@/components/customUi/pagination';
import RowsPerPageSelect from '@/components/customUi/rows-per-page-select';
import React from 'react';
import { columns, User } from '@/components/data-table/columns';
import { productColumns } from '@/pages/pageB/tables/table-columns/product-columns';
import { useProducts } from '@/hooks/useProductQueries';
import { Input } from '@/components/ui/input';
import TableColumnsDropdown from '@/components/data-table/table-columns-dropdown';
import { DataTable } from '@/components/data-table/data-table';

type Props = {
  data?: User[];
};

export default function UsersTable({ data }: Props) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  
  const skip = (currentPage - 1) * pageSize;
  const { data: productsResponse } = useProducts(skip, pageSize);
  const [table, setTable] = React.useState<any | null>(null);

  const productsData = productsResponse?.products || [];
  const totalProducts = productsResponse?.total || 0;
  const totalPages = Math.ceil(totalProducts / pageSize);
  
  const actualData = productsData ?? data ?? [];

  // helper to support both the raw TanStack table instance and the
  // wrapper API object we pass from DataTable (which contains a `table` field).

  const getColumn = React.useCallback(
    (id: string) => {
      if (!table || !actualData.length) return undefined;
      if (typeof table.getColumn === 'function') return table.getColumn(id);
      if (table.table && typeof table.table.getColumn === 'function')
        return table.table.getColumn(id);
      return undefined;
    },
    [table, actualData.length]
  );

  // Build a lightweight columns array for the dropdown and a toggle handler
  const dropdownColumns = React.useMemo(() => {
    if (!table || !actualData.length) return [];
    const currentColumns = productsData.length > 0 ? productColumns : columns;
    return currentColumns.map((col: any) => {
      const id = col.id ?? col.accessorKey;
      const label = typeof col.header === 'string' ? col.header : id;
      return { id, label, isVisible: true };
    });
  }, [columns, productColumns, table, actualData.length, productsData.length]);

  const handleToggleColumn = React.useCallback(
    (id: string, visible: boolean) => {
      // Prefer the table API if available
      const col = getColumn(id);
      if (col?.toggleVisibility) {
        col.toggleVisibility(visible);
        return;
      }

      // Fallback to setColumnVisibility if provided on the table wrapper
      if (table?.setColumnVisibility) {
        table.setColumnVisibility(id, visible);
        return;
      }
      if (table?.table?.setColumnVisibility) {
        table.table.setColumnVisibility(id, visible);
        return;
      }
    },
    [table, getColumn]
  );

  return (
    <div className="ms-container">
      <div className="ms-header">
        <h2>Products</h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        {table && (
          <Input
            placeholder={productsData.length > 0 ? "Filter products..." : "Filter names..."}
            value={(getColumn(productsData.length > 0 ? 'title' : 'firstName')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              getColumn(productsData.length > 0 ? 'title' : 'firstName')?.setFilterValue?.(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        {table && dropdownColumns.length > 0 && (
          <TableColumnsDropdown
            columns={dropdownColumns}
            onToggleColumn={handleToggleColumn}
          />
        )}
      </div>

      <DataTable
        columns={productsData ? productColumns : columns as any}
        data={actualData as any}
        onTableChange={setTable}
        columnHeaders={{
          name: "Name",
          username: "Username",
          phone: "Phone",
          email: "Email",
          id: "ID",
          website: "Website",
          title: "Product Title",
          brand: "Brand",
          category: "Category",
          price: "Price",
          rating: "Rating",
          stock: "Stock"
        }}
        hiddenColumns={["id"]}
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
          pageCount={totalPages}
          onPageChange={(page) => setCurrentPage(page + 1)}
          showPageJump={true}
        />
      </div>
    </div>
  );
}
