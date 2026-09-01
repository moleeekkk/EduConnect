import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { School, ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { authApi } from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/toast";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("maulikdabhiofficial@gmail.com");
  const [password, setPassword] = useState("maulik123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      const msg = "Please enter both Email Address and Password";
      setError(msg);
      // notifyError(msg);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.teacherLogin(cleanEmail, cleanPassword);
      setIsLoading(false);
      if (res && res.success !== false) {
        localStorage.setItem("educonnect_user", JSON.stringify(res));
        notifySuccess(`Teacher login successful! Welcome back, ${res.name || "Faculty"}.`);
        navigate("/teacher/dashboard");
      } else {
        const errorMsg = res?.message || "Invalid email address or password. Please enter correct credentials.";
        setError(errorMsg);
        notifyError(errorMsg);
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Teacher login error:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      const errorMsg = serverMsg || "Invalid email address or password. Please enter correct credentials.";
      setError(errorMsg);
      notifyError(errorMsg);
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
          <span className="inline-block px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] text-xs font-bold">
            Teacher Portal
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
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

          <div className="flex justify-end text-xs my-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password", { state: { role: "Teacher" } })}
              className="text-[#14B8A6] font-semibold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            variant="secondary"
            isLoading={isLoading}
            icon={ArrowRight}
            className="w-full mt-2"
          >
            Sign In to Teacher Portal
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default TeacherLogin;
