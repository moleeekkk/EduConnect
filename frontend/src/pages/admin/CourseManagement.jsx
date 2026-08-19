import React, { useState, useEffect } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { adminApi } from "../../services/api";
import { mockSubjects } from "../../data/mockData";

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await adminApi.getCourses();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        } else {
          setCourses(
            (mockSubjects || []).map((s) => ({
              code: s.subject_code,
              name: s.subject_name,
              credits: s.credits,
              type: s.credits >= 4 ? "Theory & Practical" : "Theory",
              semester: s.semester_id === "sem-003" ? 3 : s.semester_id === "sem-001" ? 1 : 2,
            }))
          );
        }
      } catch (err) {
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!code || !name) return;

    const newCourse = { code, name, credits: 4, type: "Theory", semester: 3 };

    try {
      await adminApi.createCourse(newCourse);
    } catch (err) {}

    setCourses([newCourse, ...courses]);
    setShowAddModal(false);
    setCode("");
    setName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/admin/dashboard")} className="text-[#64748B] hover:text-[#2563EB]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1E293B]">Course & Curriculum Modules</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 ml-7">
            Manage institutional subjects, credit allocations, and course offerings.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)} icon={Plus} className="text-xs">
          Create Course Module
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses && courses.length > 0 ? (
          courses.map((cls) => (
            <div key={cls.code} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex justify-between items-start hover:border-[#2563EB]">
              <div>
                <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full">
                  {cls.code}
                </span>
                <h3 className="text-base font-bold text-[#1E293B] mt-3">{cls.name}</h3>
                <p className="text-xs text-[#64748B] mt-1">Semester {cls.semester} • {cls.type}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] text-xs font-bold">
                {cls.credits} Credits
              </span>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0] shadow-xs col-span-full">
            No course modules available.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#E2E8F0] shadow-2xl">
            <h2 className="text-xl font-bold text-[#1E293B] mb-1">Create Course Module</h2>

            <form onSubmit={handleAddCourse} className="space-y-4">
              <Input label="Course Code" placeholder="e.g. Code..." value={code} onChange={(e) => setCode(e.target.value)} required />
              <Input label="Course Name" placeholder="e.g. Name..." value={name} onChange={(e) => setName(e.target.value)} required />

              <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="text-xs">Cancel</Button>
                <Button type="submit" variant="primary" className="text-xs">Save Course to DB</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
