// pages/auth/Users.tsx
import UsersList from "@/components/UserList"; // Using absolute import for easier path management

export default function UsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">User List</h1>
      <UsersList /> {/* This will render your list of users */}
    </div>
  );
}
