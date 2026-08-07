import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo/logo.png";

const AuthLayout = ({ children, showBadge = true, containerWidth = "max-w-md" }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#14B8A6]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="EduConnect Logo"
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {showBadge && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-xs text-xs font-medium text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            System Status: <span className="text-[#1E293B] font-semibold">Operational</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-2">
        <div className={`w-full ${containerWidth}`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center z-10 text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#E2E8F0]">
        <p>© {new Date().getFullYear()} EduConnect Educational Management System. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[#64748B]">
          <a href="#" className="hover:text-[#2563EB] transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-[#2563EB] transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-[#2563EB] transition-colors">Help Desk</a>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
