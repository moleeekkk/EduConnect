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
  getMyAssignedSubjects: async (teacherId) => {
    const response = await api.get(`/teacher/my-subjects?teacherId=${teacherId || ""}`);
    return response.data;
  },
  getApplicableStudentsForAllocation: async (allocationId) => {
    const response = await api.get(`/teacher/allocations/${allocationId}/students`);
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

  // Teacher Management
  getTeachers: async (params) => {
    const query = new URLSearchParams(params || {}).toString();
    const response = await api.get(`/admin/teachers${query ? "?" + query : ""}`);
    return response.data;
  },
  getTeacherById: async (id) => {
    const response = await api.get(`/admin/teachers/${id}`);
    return response.data;
  },
  createTeacher: async (teacherData) => {
    const response = await api.post("/admin/teachers", teacherData);
    return response.data;
  },
  updateTeacher: async (id, teacherData) => {
    const response = await api.put(`/admin/teachers/${id}`, teacherData);
    return response.data;
  },
  patchTeacherStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/teachers/${id}/status`, { is_active: isActive });
    return response.data;
  },
  deleteTeacher: async (id) => {
    const response = await api.delete(`/admin/teachers/${id}`);
    return response.data;
  },

  // Students Management
  getStudents: async (params) => {
    const query = new URLSearchParams(params || {}).toString();
    const response = await api.get(`/admin/students${query ? "?" + query : ""}`);
    return response.data;
  },
  getStudentById: async (id) => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },
  createStudent: async (studentData) => {
    const response = await api.post("/admin/students", studentData);
    return response.data;
  },
  updateStudent: async (id, studentData) => {
    const response = await api.put(`/admin/students/${id}`, studentData);
    return response.data;
  },
  patchStudentStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/students/${id}/status`, { is_active: isActive });
    return response.data;
  },
  deleteStudent: async (id) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },

  // Institutes
  getInstitutes: async () => {
    const response = await api.get("/admin/institutes");
    return response.data;
  },
  createInstitute: async (data) => {
    const response = await api.post("/admin/institutes", data);
    return response.data;
  },
  updateInstitute: async (id, data) => {
    const response = await api.put(`/admin/institutes/${id}`, data);
    return response.data;
  },
  deleteInstitute: async (id) => {
    const response = await api.delete(`/admin/institutes/${id}`);
    return response.data;
  },

  // Programs / Departments
  getPrograms: async () => {
    const response = await api.get("/admin/programs");
    return response.data;
  },
  createProgram: async (data) => {
    const response = await api.post("/admin/programs", data);
    return response.data;
  },
  updateProgram: async (id, data) => {
    const response = await api.put(`/admin/programs/${id}`, data);
    return response.data;
  },
  deleteProgram: async (id) => {
    const response = await api.delete(`/admin/programs/${id}`);
    return response.data;
  },

  // Semesters
  getSemesters: async (programId) => {
    const response = await api.get(`/admin/semesters?programId=${programId}`);
    return response.data;
  },
  createSemester: async (data) => {
    const response = await api.post("/admin/semesters", data);
    return response.data;
  },
  deleteSemester: async (id) => {
    const response = await api.delete(`/admin/semesters/${id}`);
    return response.data;
  },

  // Courses / Subjects
  getCourses: async () => {
    const response = await api.get("/admin/courses");
    return response.data;
  },
  createCourse: async (courseData) => {
    const response = await api.post("/admin/courses", courseData);
    return response.data;
  },
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/admin/courses/${id}`, courseData);
    return response.data;
  },
  deleteCourse: async (id) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // Teacher Allocations
  getTeacherAllocations: async (params) => {
    const query = new URLSearchParams(params || {}).toString();
    const response = await api.get(`/admin/teacher-allocations${query ? "?" + query : ""}`);
    return response.data;
  },
  createTeacherAllocation: async (data) => {
    const response = await api.post("/admin/teacher-allocations", data);
    return response.data;
  },
  deleteTeacherAllocation: async (id) => {
    const response = await api.delete(`/admin/teacher-allocations/${id}`);
    return response.data;
  },
};

export default api;

