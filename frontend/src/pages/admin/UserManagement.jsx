import React, { useState } from "react";
import { Users, Search, Plus, Filter, ArrowLeft, Shield, GraduationCap, School, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newRole, setNewRole] = useState("Student");
  const [newName, setNewName] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");

  const [usersList, setUsersList] = useState([
    { id: "2024MCA001", name: "Alex Johnson", role: "Student", department: "Computer Applications", status: "Active" },
    { id: "2024MCA002", name: "Beatrix Kiddo", role: "Student", department: "Computer Applications", status: "Active" },
    { id: "FAC-8092", name: "Dr. Sarah Jenkins", role: "Teacher", department: "Computer Science", status: "Active" },
    { id: "FAC-7721", name: "Prof. Michael Vance", role: "Teacher", department: "Information Technology", status: "Active" },
    { id: "ADM-001", name: "Super Administrator", role: "Admin", department: "IT & Systems", status: "Active" },
  ]);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "student") return matchesSearch && u.role === "Student";
    if (activeTab === "teacher") return matchesSearch && u.role === "Teacher";
    return matchesSearch;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newName || !newIdentifier) return;

    const newUser = {
      id: newIdentifier,
      name: newName,
      role: newRole,
      department: newRole === "Student" ? "Computer Applications" : "Computer Science",
      status: "Active",
    };

    setUsersList([newUser, ...usersList]);
    setShowAddModal(false);
    setNewName("");
    setNewIdentifier("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/admin/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1E293B]">Institutional Directory & Users</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 ml-7">
            Manage student enrollment profiles, faculty credentials, and system access rights.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={Plus}
          className="text-xs"
        >
          Add New User
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b md:border-b-0 pb-2 md:pb-0 border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
            }`}
          >
            All Accounts ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab("student")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "student"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
            }`}
          >
            Students ({usersList.filter((u) => u.role === "Student").length})
          </button>
          <button
            onClick={() => setActiveTab("teacher")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "teacher"
                ? "bg-[#14B8A6] text-white shadow-sm"
                : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
            }`}
          >
            Faculty ({usersList.filter((u) => u.role === "Teacher").length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <th className="py-3.5 px-5">ID / Enrollment</th>
                <th className="py-3.5 px-5">User Name</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#1E293B]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-[#2563EB]">{user.id}</td>
                  <td className="py-4 px-5 font-bold">{user.name}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        user.role === "Student"
                          ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20"
                          : user.role === "Teacher"
                          ? "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20"
                          : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[#64748B]">{user.department}</td>
                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button className="p-1 text-[#64748B] hover:text-[#2563EB] mr-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-[#64748B] hover:text-[#EF4444]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#E2E8F0] shadow-2xl">
            <h2 className="text-xl font-bold text-[#1E293B] mb-1">Create Institutional Account</h2>
            <p className="text-xs text-[#64748B] mb-6">Register a new Student or Faculty member into EduConnect.</p>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">Account Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] outline-none"
                >
                  <option value="Student">Student (Enrollment & OTP Auth)</option>
                  <option value="Teacher">Teacher (Email & Password Auth)</option>
                </select>
              </div>

              <Input
                label="Full Name"
                placeholder="e.g. Samuel Jackson"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />

              <Input
                label={newRole === "Student" ? "Enrollment Number" : "Faculty Employee ID"}
                placeholder={newRole === "Student" ? "e.g. 2024MCA010" : "e.g. FAC-9901"}
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                required
              />

              <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="text-xs">
                  Register User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
