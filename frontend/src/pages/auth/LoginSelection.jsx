import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const LoginSelection = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px]">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          EduConnect
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Select Your Role to Login
        </p>

        <Button onClick={() => navigate("/student-login")}>
          Student Login
        </Button>

        <Button variant="success" className="mt-4">
          Teacher Login
        </Button>

        <Button variant="danger" className="mt-4">
          Admin Login
        </Button>
      </div>
    </div>
  );
};

export default LoginSelection;
