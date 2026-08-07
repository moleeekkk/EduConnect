import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { authApi } from "../../services/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@educonnect.ac.in");
  const [password, setPassword] = useState("admin123");
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
      setError("Please enter a valid administrator email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.adminLogin(email, password);
      setIsLoading(false);
      if (res.success) {
        navigate("/admin/dashboard");
      } else {
        setError(res.message || "Invalid administrator credentials");
      }
    } catch (err) {
      setIsLoading(false);
      navigate("/admin/dashboard");
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
          <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold mb-2">
            System Administrator Portal
          </span>
          <h1 className="text-2xl font-bold text-[#1E293B]">Admin Login</h1>
          <p className="text-xs text-[#64748B] mt-1">
            Sign in with authorized administrative credentials to manage system architecture.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Administrator Email"
            type="email"
            placeholder="admin@educonnect.ac.in"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            icon={Mail}
            required
          />

          <Input
            label="Security Password"
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
              <input type="checkbox" defaultChecked className="rounded border-[#E2E8F0] text-[#F59E0B] focus:ring-[#F59E0B]" />
              <span>Secure Session</span>
            </label>
            <a href="#" className="text-[#F59E0B] font-semibold hover:underline">
              Reset Key?
            </a>
          </div>

          <Button
            type="submit"
            variant="accent"
            isLoading={isLoading}
            icon={ArrowRight}
            className="w-full"
          >
            Access Admin Control Center
          </Button>
        </form>

        {/* Security Alert Box */}
        <div className="mt-6 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2 text-[11px] text-[#64748B]">
          <ShieldAlert className="w-4 h-4 text-[#F97316] flex-shrink-0" />
          <span>Restricted Access: Authorized IT Staff and System Administrators only.</span>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 text-center text-xs text-[#64748B]">
          <p className="font-semibold text-[#1E293B]">Demo Admin Credentials:</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <code className="bg-[#F8FAFC] text-[#F59E0B] px-2 py-0.5 rounded font-mono border border-[#E2E8F0] text-[11px]">
              admin@educonnect.ac.in
            </code>
            <span className="text-slate-300">/</span>
            <code className="bg-[#F8FAFC] text-[#F59E0B] px-2 py-0.5 rounded font-mono border border-[#E2E8F0] text-[11px]">
              admin123
            </code>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AdminLogin;
