import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import { authApi } from "../../services/api";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const enrollmentNo = location.state?.enrollmentNo || "2024MCA001";
  const maskedEmail = location.state?.maskedEmail || "mau***al.gmail.com";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef([]);

  // Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (error) setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (idx < 6) newOtp[idx] = digit;
    });
    setOtp(newOtp);
    if (digits.length > 0) {
      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);
    setError("");

    try {
      const res = await authApi.resendStudentOtp(enrollmentNo);
      setResendMessage(res.message || "A fresh 6-digit OTP code has been dispatched to your email inbox!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP. Please wait before trying again.";
      setError(msg);
    }
    setTimeout(() => setResendMessage(""), 5000);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Please enter all 6 digits of the OTP code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await authApi.verifyStudentOtp(enrollmentNo, fullOtp);
      setIsLoading(false);
      if (res.success) {
        navigate("/student/dashboard");
      } else {
        setError(res.message || "Invalid OTP code entered");
      }
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || "Invalid or expired OTP code. Please check your email inbox.";
      setError(errMsg);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl shadow-slate-200/50">
        {/* Back Link */}
        <button
          onClick={() => navigate("/student-login")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Change Enrollment No.
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] text-xs font-bold mb-2">
            Verify OTP Code
          </span>

          <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
            Dispatched for <span className="font-bold text-[#1E293B]">{enrollmentNo}</span> ({maskedEmail})
          </p>
        </div>

        {/* Feedback Alert */}
        {resendMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{resendMessage}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify}>
          <div className="flex justify-between items-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`
                  w-12 h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all
                  bg-[#F8FAFC] text-[#1E293B]
                  ${digit ? "border-[#2563EB] bg-white ring-2 ring-[#2563EB]/20 text-[#2563EB]" : "border-[#E2E8F0]"}
                  focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/30
                `}
              />
            ))}
          </div>

          {error && <p className="text-xs text-[#EF4444] font-medium text-center mb-4">{error}</p>}

          <Button
            type="submit"
            variant="secondary"
            isLoading={isLoading}
            className="w-full"
          >
            Verify OTP
          </Button>
        </form>

        {/* Resend OTP Counter & Action */}
        <div className="mt-6 text-center text-xs">
          {canResend ? (
            <button
              onClick={handleResendOTP}
              className="inline-flex items-center gap-1.5 text-[#2563EB] font-semibold hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Code
            </button>
          ) : (
            <span className="text-[#64748B]">
              Resend code in <strong className="text-[#1E293B] font-mono">{timer}s</strong>
            </span>
          )}
        </div>

        {/* Demo Hint */}
        {/* <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          <p className="font-semibold text-[#1E293B]">Demo OTP Code:</p>
          <code className="bg-[#F8FAFC] text-[#14B8A6] px-2 py-0.5 rounded font-mono border border-[#E2E8F0] text-[11px] inline-block mt-1">
            1 2 3 4 5 6
          </code>
        </div> */}
      </div>
    </AuthLayout>
  );
};

export default OTPVerification;
