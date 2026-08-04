import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const StudentLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl p-10">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          Student Login
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Login using your Enrollment Number
        </p>

        <Input
          label="Enrollment Number"
          placeholder="Enter Enrollment Number"
        />

        <Button onClick={() => navigate("/verify-otp")}>Send OTP</Button>
      </div>
    </div>
  );
};

export default StudentLogin;
