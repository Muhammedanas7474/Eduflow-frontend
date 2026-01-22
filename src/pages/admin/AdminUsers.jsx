import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, createNewUser, toggleUser } from "../../store/slices/adminSlice";

// Components
import { Card, Input, Button, Select } from "../../components/UIComponents";

// Icons (Inline SVGs for dependency-free usage)
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
  MoreVertical: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
};

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, status } = useSelector((state) => state.admin);

  // Local State
  const [activeTab, setActiveTab] = useState("STUDENT");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create User Form State
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState("STUDENT");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  // Derived State
  const filteredUsers = users.filter(u => {
    const matchesTab = u.role === activeTab;
    const matchesSearch = u.phone_number?.includes(searchTerm) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const studentCount = users.filter(u => u.role === "STUDENT").length;
  const instructorCount = users.filter(u => u.role === "INSTRUCTOR").length;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await dispatch(createNewUser({ phone_number: newUserPhone, role: newUserRole })).unwrap();
      setNewUserPhone("");
      setIsModalOpen(false); // Close modal on success
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await dispatch(toggleUser({ id, status: !currentStatus })).unwrap();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
          <p className="text-gray-400 text-sm">Manage, filter, and monitor all platform participants from a central view.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-neon hover:bg-neon/90 text-black px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Icons.Plus />
          Add New User
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex gap-6">
        <button
          onClick={() => setActiveTab("STUDENT")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "STUDENT" ? "border-neon text-neon" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          Students
          <span className="bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-gray-300">{studentCount}</span>
        </button>
        <button
          onClick={() => setActiveTab("INSTRUCTOR")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "INSTRUCTOR" ? "border-neon text-neon" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          Instructors
          <span className="bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-gray-300">{instructorCount}</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search by phone, email, or ID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors placeholder-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-gray-300 hover:text-white hover:border-zinc-700 transition-colors">
            <Icons.Filter />
          </button>
          <select className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:border-neon">
            <option>Status: All</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/60 border-b border-zinc-800">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name/ID</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrollment</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-neon font-bold border border-zinc-700">
                        {u.phone_number?.slice(0, 2) || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-white">User {u.id}</div>
                        <div className="text-xs text-gray-500">ID: #{String(u.id).slice(0, 6)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300 text-sm font-mono">{u.phone_number}</div>
                    <div className="text-xs text-gray-500">{u.email || "No email"}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                      ${u.role === 'ADMIN' ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50' :
                        u.role === 'INSTRUCTOR' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                          'bg-zinc-800 text-gray-400 border border-zinc-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-400">
                      {/* Placeholder for enrollment info */}
                      --
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border cursor-pointer
                      ${u.is_active
                        ? 'bg-green-900/20 text-green-400 border-green-900/40'
                        : 'bg-red-900/20 text-red-400 border-red-900/40'}`}
                      onClick={() => toggleUserStatus(u.id, u.is_active)}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {u.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
                      <Icons.MoreVertical />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Static Mock) */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between text-sm text-gray-500">
          <div>Showing {filteredUsers.length > 0 ? 1 : 0}-{filteredUsers.length} of {filteredUsers.length} users</div>
          <div className="flex gap-2">
            <button disabled className="p-1 rounded bg-zinc-800 text-gray-600 cursor-not-allowed"><Icons.ChevronLeft /></button>
            <button disabled className="p-1 rounded bg-zinc-800 text-gray-600 cursor-not-allowed"><Icons.ChevronRight /></button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Add New User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                label="Phone Number"
                placeholder="e.g. 9876543210"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                required
              />
              <Select
                label="Role"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
              </Select>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
