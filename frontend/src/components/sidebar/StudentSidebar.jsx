import { Link } from "react-router-dom";

const StudentSidebar = () => {
  return (
    <div className="w-64 h-screen bg-indigo-600 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">EduConnect</h1>

      <nav className="flex flex-col gap-3">
        <Link
          to="/student/dashboard"
          className="p-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Dashboard
        </Link>

        <Link
          to="/student/profile"
          className="p-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Profile
        </Link>

        <Link
          to="/student/attendance"
          className="p-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Attendance
        </Link>

        <Link
          to="/student/assignments"
          className="p-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Assignments
        </Link>

        <Link
          to="/student/quiz"
          className="p-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Quiz
        </Link>
      </nav>
    </div>
  );
};

export default StudentSidebar;
