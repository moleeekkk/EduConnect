import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
const OTPVerification = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[420px]">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          Verify OTP
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Enter the OTP sent to your registered email.
        </p>

        <input
          type="text"
          maxLength="6"
          placeholder="Enter 6-digit OTP"
          className="w-full border rounded-lg p-3 text-center text-2xl tracking-[10px] outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <Button onClick={() => navigate("/student/dashboard")}>
          Verify OTP
        </Button>

        <button className="w-full mt-3 text-indigo-600 hover:underline">
          Resend OTP
        </button>

        <button
          onClick={() => navigate("/student-login")}
          className="w-full mt-6 text-gray-600 hover:underline"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
