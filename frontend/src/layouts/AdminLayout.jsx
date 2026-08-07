import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar role="Admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar role="Admin" userName="Administrator System" userDetail="Super Admin • IT Division" />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
