import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Interceptor to add Authorization token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("educonnect_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Endpoints
export const authApi = {
  sendStudentOtp: async (enrollmentNo) => {
    const response = await api.post("/auth/student/send-otp", { enrollmentNo }, { timeout: 30000 });
    return response.data;
  },
  resendStudentOtp: async (enrollmentNo) => {
    const response = await api.post("/auth/student/resend-otp", { enrollmentNo }, { timeout: 30000 });
    return response.data;
  },
  verifyStudentOtp: async (enrollmentNo, otp) => {
    const response = await api.post("/auth/student/verify-otp", { enrollmentNo, otp });
    if (response.data.token) {
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", JSON.stringify(response.data));
    }
    return response.data;
  },
  teacherLogin: async (email, password) => {
    const response = await api.post("/auth/teacher/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", JSON.stringify(response.data));
    }
    return response.data;
  },
  adminLogin: async (email, password) => {
    const response = await api.post("/auth/admin/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", JSON.stringify(response.data));
    }
    return response.data;
  },
};

// Student Endpoints
export const studentApi = {
  getDashboard: async (enrollmentNo) => {
    const response = await api.get(`/student/dashboard?enrollmentNo=${enrollmentNo || ""}`);
    return response.data;
  },
  getAttendance: async (enrollmentNo) => {
    const response = await api.get(`/student/attendance?enrollmentNo=${enrollmentNo || ""}`);
    return response.data;
  },
  getAssignments: async (enrollmentNo) => {
    const response = await api.get(`/student/assignments?enrollmentNo=${enrollmentNo || ""}`);
    return response.data;
  },
  getResults: async (enrollmentNo) => {
    const response = await api.get(`/student/results?enrollmentNo=${enrollmentNo || ""}`);
    return response.data;
  },
  getProfile: async (enrollmentNo) => {
    const response = await api.get(`/student/profile?enrollmentNo=${enrollmentNo || ""}`);
    return response.data;
  },
};

// Teacher Endpoints
export const teacherApi = {
  getDashboard: async (teacherId) => {
    const response = await api.get(`/teacher/dashboard?teacherId=${teacherId || ""}`);
    return response.data;
  },
  markAttendance: async (attendanceData) => {
    const response = await api.post("/teacher/attendance/mark", attendanceData);
    return response.data;
  },
  getPendingGrades: async (teacherId) => {
    const response = await api.get(`/teacher/grades?teacherId=${teacherId || ""}`);
    return response.data;
  },
};

// Admin Endpoints
export const adminApi = {
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/admin/profile");
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put("/admin/profile", profileData);
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
  },
  getCourses: async () => {
    const response = await api.get("/admin/courses");
    return response.data;
  },
  createCourse: async (courseData) => {
    const response = await api.post("/admin/courses", courseData);
    return response.data;
  },
};

export default api;
