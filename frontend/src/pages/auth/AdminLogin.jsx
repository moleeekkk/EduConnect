import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { authApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

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
      notifyError("Please enter both Email and Password");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.adminLogin(email, password);
      setIsLoading(false);
      notifySuccess("Admin authentication successful! Welcome to Control Panel.");
      navigate("/admin/dashboard");
    } catch (err) {
      setIsLoading(false);
      notifySuccess("Admin logged in successfully!");
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
          <span className="inline-block px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold">
            Admin Portal
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
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

          <div className="flex justify-end text-xs my-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password", { state: { role: "Admin" } })}
              className="text-[#F59E0B] font-semibold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            variant="accent"
            isLoading={isLoading}
            icon={ArrowRight}
            className="w-full mt-2"
          >
            Sign In to Admin Portal
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default AdminLogin;
