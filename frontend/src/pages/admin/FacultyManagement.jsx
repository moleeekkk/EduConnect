import React, { useState, useEffect } from "react";
import { School, Plus, Edit, Trash2, Eye, Calendar, Phone, Mail, MapPin, X, Search, RotateCcw, Loader2 } from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { adminApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";


const FacultyManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // View Details Modal State
  const [viewTeacher, setViewTeacher] = useState(null);

  // Teacher Form Modal State
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    faculty_id: "",
    first_name: "",
    last_name: "",
    surname: "",
    email: "",
    mobile: "",
    gender: "Male",
    date_of_birth: "",
    address: "",
    qualification: "",
    designation: "",
    experience: "",
    joining_date: "",
    profile_photo: "",
    is_active: true,
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.getFaculty();
      if (Array.isArray(res)) {
        setTeachers(res);
      } else {
        console.warn("getFaculty returned non-array:", res);
        setTeachers([]);
      }
    } catch (err) {
      console.error("Faculty management load error:", err);
      setErrorMessage("Failed to load faculty list from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenTeacherAdd = () => {
    setEditTeacher(null);
    setErrorMessage(null);
    setTeacherForm({
      faculty_id: "",
      first_name: "",
      last_name: "",
      surname: "",
      email: "",
      mobile: "",
      gender: "Male",
      date_of_birth: "",
      address: "",
      qualification: "",
      designation: "",
      experience: "",
      joining_date: "",
      profile_photo: "",
      is_active: true,
    });
    setShowTeacherModal(true);
  };

  const handleOpenTeacherEdit = (t) => {
    setEditTeacher(t);
    setErrorMessage(null);
    const facId = t.faculty_id || t.facultyId || "";
    setTeacherForm({
      faculty_id: facId,
      first_name: t.first_name || t.firstName || "",
      last_name: t.last_name || t.lastName || "",
      surname: t.surname || "",
      email: t.email || "",
      mobile: t.mobile || "",
      gender: t.gender || "Male",
      date_of_birth: t.date_of_birth || t.dateOfBirth || "",
      address: t.address || "",
      qualification: t.qualification || "",
      designation: t.designation || "",
      experience: t.experience !== undefined && t.experience !== null ? t.experience : "",
      joining_date: t.joining_date || t.joiningDate || "",
      profile_photo: t.profile_photo || t.profilePhoto || "",
      is_active: t.is_active !== undefined ? t.is_active : (t.isActive !== undefined ? t.isActive : true),
    });
    setShowTeacherModal(true);
  };

  const handleConfirmDeleteTeacher = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    setErrorMessage(null);
    try {
      await adminApi.deleteFaculty(deletingUser.id);
      notifySuccess(`Faculty member '${deletingUser.name || "record"}' deleted successfully!`);
      await fetchTeachers();
    } catch (err) {
      console.error("Delete teacher error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to delete teacher record.";
      setErrorMessage(msg);
      notifyError(`Failed to delete faculty member: ${msg}`);
    } finally {
      setDeleting(false);
      setDeletingUser(null);
    }
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const inputFacId = (teacherForm.faculty_id || "").trim();
      const generatedFacId = inputFacId !== ""
        ? inputFacId
        : `FAC${Math.floor(10000 + Math.random() * 90000)}`;

      const payload = {
        faculty_id: generatedFacId,
        facultyId: generatedFacId,
        first_name: teacherForm.first_name ? teacherForm.first_name.trim() : "Faculty",
        last_name: teacherForm.last_name ? teacherForm.last_name.trim() : "",
        surname: teacherForm.surname ? teacherForm.surname.trim() : "",
        email: teacherForm.email ? teacherForm.email.trim() : `teacher${Math.floor(1000 + Math.random() * 9000)}@educonnect.ac.in`,
        mobile: teacherForm.mobile ? teacherForm.mobile.trim() : "",
        gender: teacherForm.gender || "Male",
        designation: teacherForm.designation ? teacherForm.designation.trim() : "Assistant Professor",
        qualification: teacherForm.qualification ? teacherForm.qualification.trim() : "",
        experience: teacherForm.experience !== "" && teacherForm.experience !== null ? parseInt(teacherForm.experience) : 0,
        joining_date: teacherForm.joining_date && teacherForm.joining_date.trim() !== "" ? teacherForm.joining_date : null,
        date_of_birth: teacherForm.date_of_birth && teacherForm.date_of_birth.trim() !== "" ? teacherForm.date_of_birth : null,
        address: teacherForm.address ? teacherForm.address.trim() : "",
        profile_photo: teacherForm.profile_photo && teacherForm.profile_photo.trim() !== "" ? teacherForm.profile_photo : null,
        is_active: Boolean(teacherForm.is_active),
      };

      if (editTeacher) {
        const id = editTeacher.teacher_id || editTeacher.teacherId || editTeacher.id;
        payload.teacher_id = id;
        payload.teacherId = id;
        const updated = await adminApi.updateFaculty(id, payload);
        if (updated && (updated.teacher_id || updated.teacherId || updated.id)) {
          setTeachers((prev) => prev.map((t) => ((t.teacher_id || t.teacherId || t.id) === id ? updated : t)));
        }
        notifySuccess(`Faculty member '${payload.first_name} ${payload.last_name}' updated successfully!`);
      } else {
        const created = await adminApi.createFaculty(payload);
        if (created && (created.teacher_id || created.teacherId || created.id)) {
          setTeachers((prev) => [created, ...prev]);
        }
        notifySuccess(`Faculty member '${payload.first_name} ${payload.last_name}' added successfully to database!`);
      }

      await fetchTeachers();
      setShowTeacherModal(false);
    } catch (err) {
      console.error("Save teacher error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to save teacher record.";
      setErrorMessage(msg);
      notifyError(`Failed to save faculty member: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${t.first_name || t.firstName || ""} ${t.last_name || t.lastName || ""}`.toLowerCase();
    const facId = (t.faculty_id || t.facultyId || "").toString().toLowerCase();
    const email = (t.email || "").toLowerCase();
    const desig = (t.designation || "").toLowerCase();
    return fullName.includes(q) || facId.includes(q) || email.includes(q) || desig.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Teacher Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={handleOpenTeacherAdd}
            className="text-xs"
          >
            Add Faculty
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search faculty by name, faculty ID, email, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder-[#64748B] outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 bg-[#14B8A6]/10 text-[#14B8A6] rounded-xl text-xs font-extrabold border border-[#14B8A6]/20">
            {filteredTeachers.length} Faculty Members
          </div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="p-3.5">Faculty ID</th>
                <th className="p-3.5">Faculty Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Experience</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#14B8A6]" />
                      <span>Fetching faculty records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#64748B] font-medium">
                    No faculty records found in database. Click <strong className="text-[#14B8A6]">"Add Faculty"</strong> to create a new teacher record.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => {
                  const teacherId = t.teacher_id || t.teacherId || t.id;
                  const fName = (t.first_name || t.firstName || "Faculty").trim();
                  const sName = (t.surname || "").trim();
                  const lName = (t.last_name || t.lastName || "").trim();
                  const listingName = sName ? `${fName} ${sName}` : (lName ? `${fName} ${lName}` : fName);
                  const facId = t.faculty_id || t.facultyId || "N/A";

                  return (
                    <tr key={teacherId || facId} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#14B8A6]">{facId}</td>
                      <td className="p-3.5 font-semibold text-[#1E293B]">{listingName}</td>
                      <td className="p-3.5 text-[#64748B]">{t.email}</td>
                      <td className="p-3.5">{t.mobile || "N/A"}</td>
                      <td className="p-3.5 font-medium">{t.designation || "N/A"}</td>
                      <td className="p-3.5 text-[#64748B]">{t.experience !== undefined && t.experience !== null ? `${t.experience} Years` : "N/A"}</td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewTeacher(t)}
                            className="p-1.5 hover:bg-[#2563EB]/10 rounded-lg text-[#2563EB] transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenTeacherEdit(t)}
                            className="p-1.5 hover:bg-[#14B8A6]/10 rounded-lg text-[#14B8A6] transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingUser({ id: teacherId, name: listingName })}
                            className="p-1.5 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors cursor-pointer"
                            title="Delete Faculty"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Teacher Details Modal */}
      {viewTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <School className="w-5 h-5 text-[#14B8A6]" />
                Faculty Information Sheet
              </h3>
              <button
                onClick={() => setViewTeacher(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 space-y-4 text-xs grow">
              {(() => {
                const fName = (viewTeacher.first_name || viewTeacher.firstName || "").trim();
                const lName = (viewTeacher.last_name || viewTeacher.lastName || "").trim();
                const sName = (viewTeacher.surname || "").trim();
                const fullName = [fName, lName, sName].filter(Boolean).join(" ") || "Faculty Member";
                const isActive = viewTeacher.is_active !== undefined ? viewTeacher.is_active : (viewTeacher.isActive !== undefined ? viewTeacher.isActive : true);
                const photo = viewTeacher.profile_photo || viewTeacher.profilePhoto;

                return (
                  <div className="space-y-4">
                    {/* Profile Card Summary Banner */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-[#14B8A6]/5 rounded-xl border border-[#14B8A6]/20">
                      {photo ? (
                        <img
                          src={photo}
                          alt={fullName}
                          className="w-20 h-20 rounded-full object-cover border-2 border-[#14B8A6] shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#14B8A6]/20 border-2 border-[#14B8A6] flex items-center justify-center text-[#14B8A6] font-extrabold text-2xl shrink-0">
                          {fName.charAt(0)}{sName ? sName.charAt(0) : (lName ? lName.charAt(0) : "F")}
                        </div>
                      )}
                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h4 className="text-lg font-extrabold text-[#1E293B]">
                            {fullName}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" : "bg-gray-200 text-gray-600"}`}>
                            {isActive ? "● Active Faculty" : "● Inactive"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#64748B]">
                          <span className="font-mono text-[#14B8A6] font-bold bg-[#14B8A6]/10 px-2 py-0.5 rounded border border-[#14B8A6]/20">
                            ID: {viewTeacher.faculty_id || viewTeacher.facultyId || "N/A"}
                          </span>
                          <span className="font-semibold text-[#1E293B]">
                            {viewTeacher.designation || "Faculty Member"}
                          </span>
                          {viewTeacher.qualification && (
                            <span className="text-[#2563EB] font-medium">
                              • {viewTeacher.qualification}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Contact & Personal */}
                      <div className="space-y-3">
                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] font-bold block uppercase flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[#2563EB]" /> Email Address
                          </span>
                          <p className="font-semibold text-[#2563EB] text-xs pt-1">{viewTeacher.email || "N/A"}</p>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] font-bold block uppercase flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#14B8A6]" /> Mobile Number
                          </span>
                          <p className="font-mono font-bold text-[#1E293B] text-xs pt-1">{viewTeacher.mobile || "N/A"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] font-bold block uppercase">Gender</span>
                            <p className="font-bold text-[#1E293B] text-xs pt-1">{viewTeacher.gender || "N/A"}</p>
                          </div>
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] font-bold block uppercase flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#64748B]" /> Date of Birth
                            </span>
                            <p className="font-semibold text-[#1E293B] text-xs pt-1">{viewTeacher.date_of_birth || viewTeacher.dateOfBirth || "N/A"}</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] font-bold block uppercase flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Residential Address
                          </span>
                          <p className="font-medium text-[#1E293B] text-xs pt-1 leading-relaxed">{viewTeacher.address || "N/A"}</p>
                        </div>
                      </div>

                      {/* Professional & Academic */}
                      <div className="space-y-3">
                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] font-bold block uppercase flex items-center gap-1">
                            <School className="w-3.5 h-3.5 text-[#14B8A6]" /> Designation
                          </span>
                          <p className="font-bold text-[#1E293B] text-xs pt-1">{viewTeacher.designation || "N/A"}</p>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] font-bold block uppercase">Qualification</span>
                          <p className="font-bold text-[#2563EB] text-xs pt-1">{viewTeacher.qualification || "N/A"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] font-bold block uppercase">Experience</span>
                            <p className="font-bold text-[#1E293B] text-xs pt-1">
                              {viewTeacher.experience !== undefined && viewTeacher.experience !== null && viewTeacher.experience !== ""
                                ? `${viewTeacher.experience} Years`
                                : "N/A"}
                            </p>
                          </div>
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] font-bold block uppercase flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#14B8A6]" /> Joining Date
                            </span>
                            <p className="font-semibold text-[#1E293B] text-xs pt-1">{viewTeacher.joining_date || viewTeacher.joiningDate || "N/A"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] font-bold block uppercase">Created At</span>
                            <p className="font-mono text-[11px] text-[#64748B] pt-1">
                              {viewTeacher.created_at || viewTeacher.createdAt
                                ? new Date(viewTeacher.created_at || viewTeacher.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "N/A"}
                            </p>
                          </div>
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#64748B] font-bold block uppercase">Updated At</span>
                            <p className="font-mono text-[11px] text-[#64748B] pt-1">
                              {viewTeacher.updated_at || viewTeacher.updatedAt
                                ? new Date(viewTeacher.updated_at || viewTeacher.updatedAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-[#E2E8F0] shrink-0">
              <Button variant="outline" size="sm" onClick={() => setViewTeacher(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 my-auto max-h-[90vh] flex flex-col animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[#1E293B]">
                {editTeacher ? "Edit Complete Faculty Information" : "Add New Teacher Record"}
              </h3>
              <button
                onClick={() => setShowTeacherModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTeacher} className="flex flex-col grow overflow-hidden space-y-4">
              <div className="overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs grow">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Faculty ID</label>
                  <input
                    type="text"
                    placeholder="FAC101"
                    value={teacherForm.faculty_id}
                    onChange={(e) => setTeacherForm({ ...teacherForm, faculty_id: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono font-bold "
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">First Name</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={teacherForm.first_name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={teacherForm.last_name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, last_name: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Surname</label>
                  <input
                    type="text"
                    placeholder="Surname"
                    value={teacherForm.surname}
                    onChange={(e) => setTeacherForm({ ...teacherForm, surname: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Email</label>
                  <input
                    type="text"
                    placeholder="faculty@educonnect.ac.in"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={teacherForm.mobile}
                    onChange={(e) => setTeacherForm({ ...teacherForm, mobile: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Assistant Professor"
                    value={teacherForm.designation}
                    onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D. in Computer Science"
                    value={teacherForm.qualification}
                    onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Experience in Years</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Years of experience"
                    value={teacherForm.experience}
                    onChange={(e) => setTeacherForm({ ...teacherForm, experience: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Joining Date</label>
                  <input
                    type="date"
                    value={teacherForm.joining_date}
                    onChange={(e) => setTeacherForm({ ...teacherForm, joining_date: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Date of Birth</label>
                  <input
                    type="date"
                    value={teacherForm.date_of_birth}
                    onChange={(e) => setTeacherForm({ ...teacherForm, date_of_birth: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">Gender</label>
                  <select
                    value={teacherForm.gender}
                    onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[#64748B] font-semibold">Upload Profile Photo or Image URL</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Paste image URL (optional)"
                      value={teacherForm.profile_photo || ""}
                      onChange={(e) => setTeacherForm({ ...teacherForm, profile_photo: e.target.value })}
                      className="flex-1 w-full p-2 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg text-xs"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTeacherForm({ ...teacherForm, profile_photo: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full sm:w-auto p-1.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg text-xs"
                    />
                    {teacherForm.profile_photo && (
                      <img
                        src={teacherForm.profile_photo}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                      />
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#64748B] mb-1 font-semibold">Residential Address</label>
                  <textarea
                    rows={2}
                    placeholder="Faculty address"
                    value={teacherForm.address}
                    onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="teacher_active"
                    checked={teacherForm.is_active}
                    onChange={(e) => setTeacherForm({ ...teacherForm, is_active: e.target.checked })}
                    className="rounded border-[#E2E8F0] text-[#14B8A6] focus:ring-[#14B8A6]"
                  />
                  <label htmlFor="teacher_active" className="text-xs font-bold text-[#1E293B] cursor-pointer">
                    Faculty Active Status
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0] shrink-0">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowTeacherModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" disabled={saving}>
                  {saving ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Record...</span>
                    </div>
                  ) : (
                    "Save Teacher Record"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDeleteTeacher}
        title="Delete Faculty Record"
        message={`Are you sure you want to delete faculty member "${deletingUser?.name || 'this record'}"? This action cannot be undone.`}
        confirmText="Delete Record"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default FacultyManagement;
export { FacultyManagement as AdminFacultyManagement };
