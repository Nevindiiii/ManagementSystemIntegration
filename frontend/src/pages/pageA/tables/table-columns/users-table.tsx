import { columns, User } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';

type Props = {
  data: User[];
  onTableChange?: (table: any) => void;
};

export default function UsersTable({ data, onTableChange }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onTableChange={onTableChange}
      // Column customization props
      
      columnOrder={['select', 'id', 'firstName', 'phone', 'age', 'birthDate', 'actions']}
      columnWidths={{
        'select': 50,
        'id': 80,
        'firstName': 280,
        'phone': 140,
        'age': 120,
        'birthDate': 120,
        'actions': 120
      }}
      columnHeaders={{
        'firstName': 'User',
        'phone': 'Phone',
        'birthDate': 'Birth Date',
        'age': 'Age',
        'actions': 'Actions'
      }}
      // Visual customization props
      striped={true}
      hoverable={true}
      size="md"
      border={true}
      rounded={true}
      showSuccessAlert={true}
      emptyMessage="No users found."
      className="mt-4"
      tableClassName="min-w-full"
    />
  );
}
