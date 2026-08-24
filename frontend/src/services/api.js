import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
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

const handleRequest = async (requestFn, fallbackValue = []) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.warn("API Call fallback:", error.message);
    return fallbackValue;
  }
};

// Auth Endpoints
export const authApi = {
  sendStudentOtp: async (enrollmentNo) => {
    const response = await api.post("/auth/student/send-otp", { enrollmentNo });
    return response.data;
  },
  verifyStudentOtp: async (enrollmentNo, otp) => {
    const response = await api.post("/auth/student/verify-otp", { enrollmentNo, otp });
    if (response.data?.token) {
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", JSON.stringify(response.data));
    }
    return response.data;
  },
  teacherLogin: async (email, password) => {
    const response = await api.post("/auth/teacher/login", { email, password });
    if (response.data?.token) {
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", JSON.stringify(response.data));
    }
    return response.data;
  },
  adminLogin: async (email, password) => {
    const response = await api.post("/auth/admin/login", { email, password });
    if (response.data?.token) {
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", JSON.stringify(response.data));
    }
    return response.data;
  },
};

// Student Endpoints
export const studentApi = {
  getDashboard: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/dashboard?enrollmentNo=${enrollmentNo || "2024MCA001"}`), {}),
  getAttendance: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/attendance?enrollmentNo=${enrollmentNo || "2024MCA001"}`), []),
  getAssignments: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/assignments?enrollmentNo=${enrollmentNo || "2024MCA001"}`), []),
  submitAssignment: (assignmentId, data) =>
    handleRequest(() => api.post(`/student/assignments/${assignmentId}/submit`, data), { success: true }),
  getResults: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/results?enrollmentNo=${enrollmentNo || "2024MCA001"}`), {}),
  getMarksheet: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/marksheet?enrollmentNo=${enrollmentNo || "2024MCA001"}`), {}),
  getProfile: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/profile?enrollmentNo=${enrollmentNo || "2024MCA001"}`), {}),
  getLeaveRequests: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/leave-requests?enrollmentNo=${enrollmentNo || "2024MCA001"}`), []),
  submitLeaveRequest: (data) =>
    handleRequest(() => api.post("/student/leave-requests", data), { success: true }),
  getDoubts: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/doubts?enrollmentNo=${enrollmentNo || "2024MCA001"}`), []),
  askDoubt: (data) =>
    handleRequest(() => api.post("/student/doubts", data), { success: true }),
  getStudyMaterials: () =>
    handleRequest(() => api.get("/student/study-materials"), []),
  getOldQuestionPapers: () =>
    handleRequest(() => api.get("/student/question-papers"), []),
  getQuizzes: () =>
    handleRequest(() => api.get("/student/quizzes"), []),
  getWeeklyTests: () =>
    handleRequest(() => api.get("/student/weekly-tests"), []),
  getTimetable: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/timetable?enrollmentNo=${enrollmentNo || "2024MCA001"}`), []),
  getSyllabus: () =>
    handleRequest(() => api.get("/student/syllabus"), []),
  getDigitalID: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/digital-id?enrollmentNo=${enrollmentNo || "2024MCA001"}`), {}),
};

// Teacher Endpoints
export const teacherApi = {
  getDashboard: (teacherId) =>
    handleRequest(() => api.get(`/teacher/dashboard?teacherId=${teacherId || "teach-demo-id"}`), {}),
  markAttendance: (attendanceData) =>
    handleRequest(() => api.post("/teacher/attendance/mark", attendanceData), { success: true }),
  getStudents: () =>
    handleRequest(() => api.get("/teacher/students"), []),
  getAssignments: (teacherId) =>
    handleRequest(() => api.get(`/teacher/assignments?teacherId=${teacherId || "teach-demo-id"}`), []),
  createAssignment: (data) =>
    handleRequest(() => api.post("/teacher/assignments", data), { success: true }),
  getPendingGrades: (teacherId) =>
    handleRequest(() => api.get(`/teacher/grades?teacherId=${teacherId || "teach-demo-id"}`), []),
  submitGrades: (data) =>
    handleRequest(() => api.post("/teacher/grades", data), { success: true }),
  getLeaveRequests: () =>
    handleRequest(() => api.get("/teacher/leave-requests"), []),
  updateLeaveStatus: (id, status) =>
    handleRequest(() => api.put(`/teacher/leave-requests/${id}`, { status }), { success: true }),
  getDoubts: () =>
    handleRequest(() => api.get("/teacher/doubts"), []),
  replyDoubt: (id, reply) =>
    handleRequest(() => api.post(`/teacher/doubts/${id}/reply`, { reply }), { success: true }),
  getStudyMaterials: () =>
    handleRequest(() => api.get("/teacher/study-materials"), []),
  uploadStudyMaterial: (data) =>
    handleRequest(() => api.post("/teacher/study-materials", data), { success: true }),
  getOldQuestionPapers: () =>
    handleRequest(() => api.get("/teacher/question-papers"), []),
  getQuizzes: () =>
    handleRequest(() => api.get("/teacher/quizzes"), []),
  createQuiz: (data) =>
    handleRequest(() => api.post("/teacher/quizzes", data), { success: true }),
  getWeeklyTests: () =>
    handleRequest(() => api.get("/teacher/weekly-tests"), []),
  createWeeklyTest: (data) =>
    handleRequest(() => api.post("/teacher/weekly-tests", data), { success: true }),
  getProfile: (teacherId) =>
    handleRequest(() => api.get(`/teacher/profile?teacherId=${teacherId || "teach-demo-id"}`), {}),
  sendParentEmail: (data) =>
    handleRequest(() => api.post("/teacher/parent-email", data), { success: true }),
};

// Admin Endpoints
export const adminApi = {
  getDashboard: () =>
    handleRequest(() => api.get("/admin/dashboard"), {}),
  getUsers: () =>
    handleRequest(() => api.get("/admin/users"), []),
  createUser: (userData) =>
    handleRequest(() => api.post("/admin/users", userData), {}),
  createStudent: (studentData) =>
    handleRequest(() => api.post("/admin/students", studentData), {}),
  updateStudent: (id, studentData) =>
    handleRequest(() => api.put(`/admin/students/${id}`, studentData), {}),
  deleteStudent: (id) =>
    handleRequest(() => api.delete(`/admin/students/${id}`), { success: true }),
  updateUser: (id, userData) =>
    handleRequest(() => api.put(`/admin/users/${id}`, userData), {}),
  deleteUser: (id) =>
    handleRequest(() => api.delete(`/admin/users/${id}`), { success: true }),
  getCourses: () =>
    handleRequest(() => api.get("/admin/courses"), []),
  createCourse: (courseData) =>
    handleRequest(() => api.post("/admin/courses", courseData), {}),
  getInstitutes: () =>
    handleRequest(() => api.get("/admin/institutes"), []),
  createInstitute: (data) =>
    handleRequest(() => api.post("/admin/institutes", data), {}),
  updateInstitute: (id, data) =>
    handleRequest(() => api.put(`/admin/institutes/${id}`, data), {}),
  deleteInstitute: (id) =>
    handleRequest(() => api.delete(`/admin/institutes/${id}`), { success: true }),
  getDepartments: () =>
    handleRequest(() => api.get("/admin/departments"), []),
  createDepartment: (data) =>
    handleRequest(() => api.post("/admin/departments", data), {}),
  updateDepartment: (id, data) =>
    handleRequest(() => api.put(`/admin/departments/${id}`, data), {}),
  deleteDepartment: (id) =>
    handleRequest(() => api.delete(`/admin/departments/${id}`), { success: true }),
  getPrograms: () =>
    handleRequest(() => api.get("/admin/departments"), []),
  createProgram: (data) =>
    handleRequest(() => api.post("/admin/departments", data), {}),
  updateProgram: (id, data) =>
    handleRequest(() => api.put(`/admin/departments/${id}`, data), {}),
  deleteProgram: (id) =>
    handleRequest(() => api.delete(`/admin/departments/${id}`), { success: true }),
  getSemesters: () =>
    handleRequest(() => api.get("/admin/semesters"), []),
  createSemester: (data) =>
    handleRequest(() => api.post("/admin/semesters", data), {}),
  updateSemester: (id, data) =>
    handleRequest(() => api.put(`/admin/semesters/${id}`, data), {}),
  deleteSemester: (id) =>
    handleRequest(() => api.delete(`/admin/semesters/${id}`), { success: true }),
  toggleSemesterStatus: (id) =>
    handleRequest(() => api.patch(`/admin/semesters/${id}/toggle-status`), {}),
  getSubjects: () =>
    handleRequest(() => api.get("/admin/subjects"), []),
  createSubject: (data) =>
    handleRequest(() => api.post("/admin/subjects", data), {}),
  getReports: () =>
    handleRequest(() => api.get("/admin/reports"), {}),
  getProfile: () =>
    handleRequest(() => api.get("/admin/profile"), {}),
  getSystemSettings: () =>
    handleRequest(() => api.get("/admin/settings"), {}),
  updateSystemSettings: (data) =>
    handleRequest(() => api.put("/admin/settings", data), { success: true }),
  getBatches: () =>
    handleRequest(() => api.get("/admin/batches"), []),
  createBatch: (data) =>
    handleRequest(() => api.post("/admin/batches", data), {}),
  updateBatch: (id, data) =>
    handleRequest(() => api.put(`/admin/batches/${id}`, data), {}),
  deleteBatch: (id) =>
    handleRequest(() => api.delete(`/admin/batches/${id}`), { success: true }),
  toggleBatchStatus: (id) =>
    handleRequest(() => api.patch(`/admin/batches/${id}/toggle-status`), {}),
  getFaculty: () =>
    handleRequest(() => api.get("/admin/teachers"), []),
  createFaculty: (data) =>
    handleRequest(() => api.post("/admin/teachers", data), {}),
  updateFaculty: (id, data) =>
    handleRequest(() => api.put(`/admin/teachers/${id}`, data), {}),
  deleteFaculty: (id) =>
    handleRequest(() => api.delete(`/admin/teachers/${id}`), { success: true }),
  getStudents: () =>
    handleRequest(() => api.get("/admin/students"), []),
  createStudent: (data) =>
    handleRequest(() => api.post("/admin/students", data), {}),
  updateStudent: (id, data) =>
    handleRequest(() => api.put(`/admin/students/${id}`, data), {}),
  deleteStudent: (id) =>
    handleRequest(() => api.delete(`/admin/students/${id}`), { success: true }),
};

export default api;

