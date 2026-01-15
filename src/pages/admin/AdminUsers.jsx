import { useEffect, useState, useCallback } from "react";
import { getUsers, createUser, updateUserStatus } from "../../api/admin.api";
import { Card, Input, Button, Select } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STUDENT");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  useEffect(() => {
    useEffect(() => {
      // eslint-disable-next-line
      fetchUsers();
    }, [fetchUsers]);
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({ phone_number: phone, role });
      setPhone("");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  };

  const toggleUser = async (id, currentStatus) => {
    try {
      await updateUserStatus(id, !currentStatus);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-24 px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            User <span className="text-neon">Management</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Create User Form */}
            <div className="lg:col-span-1">
              <Card title="Add New User">
                <form onSubmit={handleCreateUser}>
                  <Input
                    label="Phone Number"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <Select
                    label="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                  </Select>

                  <Button type="submit" variant="primary" className="mt-2">
                    Create User
                  </Button>
                </form>
              </Card>
            </div>

            {/* Users Table */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/50">
                        <th className="p-4 text-gray-400 font-medium">Phone</th>
                        <th className="p-4 text-gray-400 font-medium">Role</th>
                        <th className="p-4 text-gray-400 font-medium">Status</th>
                        <th className="p-4 text-gray-400 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                          <td className="p-4 text-white font-mono">{u.phone_number}</td>
                          <td className="p-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${u.role === 'ADMIN' ? 'bg-purple-900 text-purple-200' :
                              u.role === 'INSTRUCTOR' ? 'bg-blue-900 text-blue-200' :
                                'bg-zinc-800 text-gray-300'
                              }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${u.is_active ? 'bg-neon shadow-[0_0_8px_#00ff9d]' : 'bg-red-500'
                              }`}></span>
                            <span className="text-gray-300 text-sm">
                              {u.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => toggleUser(u.id, u.is_active)}
                              className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${u.is_active
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900"
                                : "bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-900"
                                }`}
                            >
                              {u.is_active ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-500">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
