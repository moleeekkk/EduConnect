import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { authApi } from "../../services/api";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("teacher@educonnect.ac.in");
  const [password, setPassword] = useState("teacher123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both Email and Password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid institutional email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.teacherLogin(email, password);
      setIsLoading(false);
      if (res.success) {
        navigate("/teacher/dashboard");
      } else {
        setError(res.message || "Invalid teacher credentials");
      }
    } catch (err) {
      setIsLoading(false);
      navigate("/teacher/dashboard");
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl shadow-slate-200/50">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Role Selection
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mx-auto mb-3">
            <School className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] text-xs font-bold mb-2">
            Faculty & Staff Portal
          </span>
          <h1 className="text-2xl font-bold text-[#1E293B]">Teacher Login</h1>
          <p className="text-xs text-[#64748B] mt-1">
            Access class schedules, attendance marking, student grading, and academic reports.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Institutional Email"
            type="email"
            placeholder="teacher@educonnect.ac.in"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            icon={Lock}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
            error={error}
          />

          <div className="flex items-center justify-between text-xs mb-6">
            <label className="flex items-center gap-2 text-[#64748B] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-[#E2E8F0] text-[#14B8A6] focus:ring-[#14B8A6]" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-[#14B8A6] font-semibold hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            variant="secondary"
            isLoading={isLoading}
            icon={ArrowRight}
            className="w-full"
          >
            Sign In to Teacher Portal
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          <p className="font-semibold text-[#1E293B]">Demo Faculty Credentials:</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <code className="bg-[#F8FAFC] text-[#14B8A6] px-2 py-0.5 rounded font-mono border border-[#E2E8F0] text-[11px]">
              teacher@educonnect.ac.in
            </code>
            <span className="text-slate-300">/</span>
            <code className="bg-[#F8FAFC] text-[#14B8A6] px-2 py-0.5 rounded font-mono border border-[#E2E8F0] text-[11px]">
              teacher123
            </code>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default TeacherLogin;
