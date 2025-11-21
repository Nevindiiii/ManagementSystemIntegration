// useAppTable.ts
import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";

export function useAppTable<TData>(data: TData[], columns: ColumnDef<TData, any>[], initialVisibility?: VisibilityState) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility || {});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const memoData = useMemo(() => data, [data]);
  const memoCols = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data: memoData,
    columns: memoCols,
    // set a sensible default pagination state so controls work immediately
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    enableHiding: true,
  });

  return { table, sorting, columnFilters, columnVisibility, rowSelection, setSorting, setColumnFilters, setColumnVisibility, setRowSelection };
}
