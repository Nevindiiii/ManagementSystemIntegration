import React from 'react';
import useAuthUsers from '@/hooks/useAuthUsers';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AuthUsersPage() {
  const { data, isLoading, error } = useAuthUsers(1, 50);
  const users = data?.users || [];
  const navigate = useNavigate();

  if (isLoading) return <div className="p-4">Loading auth users...</div>;
  if (error)
    return <div className="p-4 text-red-600">Error loading auth users</div>;

  return (
    <div className="ms-container">
      <div className="ms-header flex items-center justify-between">
        <h2>Auth Users</h2>
        <div>
          <Button onClick={() => navigate('/dashboard')}>Back</Button>
        </div>
      </div>

      <div className="mt-4 overflow-auto">
        <table className="min-w-full border bg-white">
          <thead>
            <tr className="text-left">
              <th className="border p-2">#</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any, idx: number) => (
              <tr key={u.id || idx} className="odd:bg-gray-50 even:bg-white">
                <td className="border p-2">{idx + 1}</td>
                <td className="border p-2">{u.name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2">
                  {new Date(u.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
