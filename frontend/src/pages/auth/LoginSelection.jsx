import React from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, School, ShieldCheck, ArrowRight, Smartphone, Mail, ShieldAlert } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import logoImg from "../../assets/logo/logo.png";

const LoginSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "student",
      title: "Student Portal",
      description: "Access course materials, view attendance, assignments, and exam results.",
      icon: GraduationCap,
      badge: "Enrollment & OTP",
      badgeStyle: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20",
      accentBorder: "hover:border-[#2563EB] hover:shadow-blue-500/10",
      buttonVariant: "primary",
      iconBg: "bg-[#2563EB]/10 text-[#2563EB]",
      loginPath: "/student-login",
      authMethod: "Enrollment Number + OTP",
      authIcon: Smartphone,
    },
    {
      id: "teacher",
      title: "Teacher Portal",
      description: "Manage classes, record student attendance, grade submissions, and post notices.",
      icon: School,
      badge: "Faculty Login",
      badgeStyle: "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20",
      accentBorder: "hover:border-[#14B8A6] hover:shadow-teal-500/10",
      buttonVariant: "secondary",
      iconBg: "bg-[#14B8A6]/10 text-[#14B8A6]",
      loginPath: "/teacher-login",
      authMethod: "Email + Password",
      authIcon: Mail,
    },
    {
      id: "admin",
      title: "Admin Portal",
      description: "System governance, user enrollment directory, reports, and administrative tools.",
      icon: ShieldCheck,
      badge: "System Admin",
      badgeStyle: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
      accentBorder: "hover:border-[#F59E0B] hover:shadow-amber-500/10",
      buttonVariant: "accent",
      iconBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
      loginPath: "/admin-login",
      authMethod: "Email + Password",
      authIcon: ShieldAlert,
    },
  ];

  return (
    <AuthLayout containerWidth="max-w-5xl">
      <div className="py-2">
        {/* Brand Header Banner */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm mb-4">
            <img
              src={logoImg}
              alt="EduConnect Official Logo"
              className="h-20 sm:h-24 w-auto object-contain mx-auto"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Educational Management System
          </h1>
          <p className="text-[#64748B] text-sm sm:text-base max-w-md mx-auto mt-2 font-medium">
            Select your assigned role portal to proceed to secure login
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const AuthIcon = role.authIcon;
            return (
              <div
                key={role.id}
                onClick={() => navigate(role.loginPath)}
                className={`
                  bg-white rounded-3xl p-7 border border-[#E2E8F0] shadow-sm hover:shadow-xl
                  transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden
                  ${role.accentBorder}
                `}
              >
                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-4 rounded-2xl ${role.iconBg} transition-transform group-hover:scale-110 duration-200`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${role.badgeStyle}`}>
                      {role.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xl font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors mb-2">
                    {role.title}
                  </h2>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                    {role.description}
                  </p>

                  {/* Auth Method Pill */}
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-6 flex items-center gap-2.5">
                    <AuthIcon className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#1E293B]">{role.authMethod}</span>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  variant={role.buttonVariant}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(role.loginPath);
                  }}
                  icon={ArrowRight}
                  className="w-full text-xs font-bold py-3 group-hover:shadow-md"
                >
                  Sign In as {role.id.charAt(0).toUpperCase() + role.id.slice(1)}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-[#64748B] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            Encrypted 256-bit Secure Portal • Academic Session 2026
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginSelection;
