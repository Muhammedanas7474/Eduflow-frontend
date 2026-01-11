import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUserStatus,
} from "../../api/admin.api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STUDENT");

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await createUser({
      phone_number: phone,
      role,
    });
    setPhone("");
    fetchUsers();
  };

  const toggleUser = async (id, currentStatus) => {
    await updateUserStatus(id, !currentStatus);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Admin – User Management
        </h2>

        {/* Create user */}
        <form onSubmit={handleCreateUser} className="flex gap-2 mb-6">
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <select
            className="border px-3 py-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Create
          </button>
        </form>

        {/* Users table */}
        <table className="w-full border">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2">Role</th>
              <th className="p-2">Active</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.phone_number}</td>
                <td className="p-2 text-center">{u.role}</td>
                <td className="p-2 text-center">
                  {u.is_active ? "Yes" : "No"}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      toggleUser(u.id, u.is_active)
                    }
                    className={`px-3 py-1 rounded text-white ${
                      u.is_active
                        ? "bg-red-600"
                        : "bg-green-600"
                    }`}
                  >
                    {u.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
