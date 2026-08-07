import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

const StudentLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar role="Student" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar role="Student" userName="Alex Johnson" userDetail="Enrollment: 2024MCA001" />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
