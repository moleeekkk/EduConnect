import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { authApi } from "../../services/api";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanNo = enrollmentNo.trim().toUpperCase();
    if (!cleanNo) {
      setError("Please enter your registered Enrollment Number or Email");
      return;
    }

    if (cleanNo.length < 4) {
      setError("Enrollment Number must be at least 4 characters long");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.sendStudentOtp(cleanNo);
      setIsLoading(false);
      if (res && res.success === false) {
        setError(res.message || "Failed to send OTP code.");
        return;
      }
      navigate("/verify-otp", {
        state: {
          enrollmentNo: res.identifier || cleanNo,
          maskedPhone: res.maskedPhone || "+91 98*** **421",
          maskedEmail: res.maskedEmail || "mau***al@gmail.com",
        },
      });
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || "Failed to send OTP code. Please check your connection.";
      setError(errMsg);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl shadow-slate-200/50">
        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Role Selection
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold mb-2">
            Student Portal
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Enrollment Number or Email"
            placeholder="e.g. 2024MCA001 or email..."
            value={enrollmentNo}
            onChange={(e) => {
              setEnrollmentNo(e.target.value.toUpperCase());
              if (error) setError("");
            }}
            icon={KeyRound}
            error={error}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={ArrowRight}
            className="w-full"
          >
            Send Real OTP Code
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default StudentLogin;
