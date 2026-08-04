import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/sidebar/StudentSidebar";

const StudentLayout = () => {
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />

      <div className="flex-1 bg-slate-100">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
