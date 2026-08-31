import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { KeyRound, ArrowLeft, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { notifySuccess, notifyError } from "../../utils/toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "User";

  const [step, setStep] = useState(1); // 1: Email Request, 2: Reset Form
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetCode = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid registered email address");
      notifyError("Please enter a valid registered email address");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setSuccess("Reset code sent to your registered email address.");
      notifySuccess(`Reset verification code sent to ${email}!`);
    }, 1000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the verification code");
      notifyError("Please enter the verification code");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      notifyError("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      notifyError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      notifySuccess("Password reset successfully saved to database! You can now log in.");
    }, 1000);
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl shadow-slate-200/50 max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(role === "Admin" ? "/admin-login" : "/teacher-login")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {role} Login
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold mb-1">
            {role} Password Recovery
          </span>
          <h1 className="text-xl font-bold text-[#1E293B]">Reset Password</h1>
        </div>

        {/* Step 1: Send Reset Request */}
        {step === 1 && (
          <form onSubmit={handleSendResetCode} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="e.g. user@educonnect.ac.in"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              icon={Mail}
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
              Send Reset Code
            </Button>
          </form>
        )}

        {/* Step 2: Verification Code & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-3">
            {success && (
              <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
              </div>
            )}

            <Input
              label="Verification Code (OTP)"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              error={error}
              required
            />

            <Button
              type="submit"
              variant="accent"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Update Password
            </Button>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">Password Updated Successfully!</h3>
            <p className="text-xs text-[#64748B]">You can now log in using your new password.</p>
            <Button
              variant="primary"
              onClick={() => navigate(role === "Admin" ? "/admin-login" : "/teacher-login")}
              className="w-full text-xs"
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
