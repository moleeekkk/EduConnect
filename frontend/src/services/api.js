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

// Helper for read queries (safe fallback)
const handleRequest = async (requestFn, fallbackValue = []) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.warn("API Query fallback:", error.message);
    return fallbackValue;
  }
};

// Helper for data mutations (creates, updates, deletes, submissions) to propagate errors
const handleMutationRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.error("API Mutation Error:", error);
    throw error;
  }
};

// Auth Endpoints
export const authApi = {
  sendStudentOtp: async (enrollmentNo) => {
    const response = await api.post("/auth/student/send-otp", { enrollmentNo, enrollment_no: enrollmentNo });
    return response.data;
  },
  verifyStudentOtp: async (enrollmentNo, otp) => {
    const response = await api.post("/auth/student/verify-otp", { enrollmentNo, enrollment_no: enrollmentNo, otp });
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
  sendPasswordResetCode: async (email, role) => {
    const response = await api.post("/auth/forgot-password/send-code", { email, role });
    return response.data;
  },
  resetPassword: async (email, code, newPassword) => {
    const response = await api.post("/auth/forgot-password/reset", { email, code, newPassword, new_password: newPassword });
    return response.data;
  },
};

// Student Endpoints
export const studentApi = {
  getDashboard: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/dashboard${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
  getAttendance: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/attendance${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
  getAssignments: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/assignments${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
  submitAssignment: (assignmentId, data) =>
    handleMutationRequest(() => api.post(`/student/assignments/${assignmentId}/submit`, data)),
  getResults: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/results${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
  getMarksheet: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/marksheet${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
  getProfile: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/profile${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
  updateProfile: (data) =>
    handleMutationRequest(() => api.put("/student/profile", data)),
  getLeaveRequests: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/leave-requests${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
  submitLeaveRequest: (data) =>
    handleMutationRequest(() => api.post("/student/leave-requests", data)),
  getDoubts: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/doubts${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
  askDoubt: (data) =>
    handleMutationRequest(() => api.post("/student/doubts", data)),
  getStudyMaterials: () =>
    handleRequest(() => api.get("/student/study-materials"), []),
  getQuizzes: () =>
    handleRequest(() => api.get("/student/quizzes"), []),
  getWeeklyTests: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/weekly-tests${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
  getTimetable: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/timetable${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
  getSyllabus: () =>
    handleRequest(() => api.get("/student/syllabus"), []),
  getDigitalID: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/digital-id${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
};

// Teacher Endpoints
export const teacherApi = {
  getDashboard: (teacherId) =>
    handleRequest(() => api.get(`/teacher/dashboard${teacherId ? `?teacherId=${teacherId}` : ""}`), {}),
  markAttendance: (attendanceData) =>
    handleMutationRequest(() => api.post("/teacher/attendance/mark", attendanceData)),
  getStudents: () =>
    handleRequest(() => api.get("/teacher/students"), []),
  getDepartments: () =>
    handleRequest(() => api.get("/teacher/departments"), []),
  getSemesters: () =>
    handleRequest(() => api.get("/teacher/semesters"), []),
  getAssignedSubjects: (identifier) =>
    handleRequest(() => api.get(`/teacher/assigned-subjects${identifier ? `?email=${encodeURIComponent(identifier)}&teacherId=${encodeURIComponent(identifier)}` : ""}`), []),
  getAssignments: (identifier) =>
    handleRequest(() => api.get(`/teacher/assignments${identifier ? `?email=${encodeURIComponent(identifier)}&teacherId=${encodeURIComponent(identifier)}` : ""}`), []),
  createAssignment: (data) =>
    handleMutationRequest(() => api.post("/teacher/assignments", data)),
  updateAssignment: (id, data) =>
    handleMutationRequest(() => api.put(`/teacher/assignments/${id}`, data)),
  deleteAssignment: (id) =>
    handleMutationRequest(() => api.delete(`/teacher/assignments/${id}`)),
  getAssignmentSubmissions: (assignmentId) =>
    handleRequest(() => api.get(`/teacher/assignments/${assignmentId}/submissions`), []),
  gradeSubmission: (submissionId, data) =>
    handleMutationRequest(() => api.post(`/teacher/submissions/${submissionId}/grade`, data)),
  getPendingGrades: (teacherId) =>
    handleRequest(() => api.get(`/teacher/grades${teacherId ? `?teacherId=${teacherId}` : ""}`), []),
  submitGrades: (data) =>
    handleMutationRequest(() => api.post("/teacher/grades", data)),
  getLeaveRequests: () =>
    handleRequest(() => api.get("/teacher/leave-requests"), []),
  updateLeaveStatus: (id, status) =>
    handleMutationRequest(() => api.put(`/teacher/leave-requests/${id}`, { status })),
  getDoubts: () =>
    handleRequest(() => api.get("/teacher/doubts"), []),
  replyDoubt: (id, reply) =>
    handleMutationRequest(() => api.post(`/teacher/doubts/${id}/reply`, { reply })),
  getStudyMaterials: () =>
    handleRequest(() => api.get("/teacher/study-materials"), []),
  uploadStudyMaterial: (data) =>
    handleMutationRequest(() => api.post("/teacher/study-materials", data)),
  getQuizzes: () =>
    handleRequest(() => api.get("/teacher/quizzes"), []),
  createQuiz: (data) =>
    handleMutationRequest(() => api.post("/teacher/quizzes", data)),
  getWeeklyTests: () =>
    handleRequest(() => api.get("/teacher/weekly-tests"), []),
  createWeeklyTest: (data) =>
    handleMutationRequest(() => api.post("/teacher/weekly-tests", data)),
  updateWeeklyTest: (id, data) =>
    handleMutationRequest(() => api.put(`/teacher/weekly-tests/${id}`, data)),
  deleteWeeklyTest: (id) =>
    handleMutationRequest(() => api.delete(`/teacher/weekly-tests/${id}`)),
  getWeeklyTestResults: (testId) =>
    handleRequest(() => api.get(`/teacher/weekly-tests/${testId}/results`), []),
  saveWeeklyTestResults: (testId, data) =>
    handleMutationRequest(() => api.post(`/teacher/weekly-tests/${testId}/results`, data)),
  getProfile: (identifier) =>
    handleRequest(() => api.get(`/teacher/profile${identifier ? `?email=${encodeURIComponent(identifier)}&teacherId=${encodeURIComponent(identifier)}` : ""}`), {}),
  updateProfile: (data) =>
    handleMutationRequest(() => api.put("/teacher/profile", data)),
  sendParentEmail: (data) =>
    handleMutationRequest(() => api.post("/teacher/parent-email", data)),
};

// Admin Endpoints
export const adminApi = {
  getDashboard: () =>
    handleRequest(() => api.get("/admin/dashboard"), {}),
  getUsers: () =>
    handleRequest(() => api.get("/admin/users"), []),
  createUser: (userData) =>
    handleMutationRequest(() => api.post("/admin/users", userData)),
  updateUser: (id, userData) =>
    handleMutationRequest(() => api.put(`/admin/users/${id}`, userData)),
  deleteUser: (id) =>
    handleMutationRequest(() => api.delete(`/admin/users/${id}`)),
  getCourses: () =>
    handleRequest(() => api.get("/admin/courses"), []),
  createCourse: (courseData) =>
    handleMutationRequest(() => api.post("/admin/courses", courseData)),
  getInstitutes: () =>
    handleRequest(() => api.get("/admin/institutes"), []),
  createInstitute: (data) =>
    handleMutationRequest(() => api.post("/admin/institutes", data)),
  updateInstitute: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/institutes/${id}`, data)),
  deleteInstitute: (id) =>
    handleMutationRequest(() => api.delete(`/admin/institutes/${id}`)),
  getDepartments: () =>
    handleRequest(() => api.get("/admin/departments"), []),
  createDepartment: (data) =>
    handleMutationRequest(() => api.post("/admin/departments", data)),
  updateDepartment: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/departments/${id}`, data)),
  deleteDepartment: (id) =>
    handleMutationRequest(() => api.delete(`/admin/departments/${id}`)),
  getPrograms: () =>
    handleRequest(() => api.get("/admin/programs"), []),
  createProgram: (data) =>
    handleMutationRequest(() => api.post("/admin/programs", data)),
  updateProgram: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/programs/${id}`, data)),
  deleteProgram: (id) =>
    handleMutationRequest(() => api.delete(`/admin/programs/${id}`)),
  getSemesters: () =>
    handleRequest(() => api.get("/admin/semesters"), []),
  createSemester: (data) =>
    handleMutationRequest(() => api.post("/admin/semesters", data)),
  updateSemester: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/semesters/${id}`, data)),
  deleteSemester: (id) =>
    handleMutationRequest(() => api.delete(`/admin/semesters/${id}`)),
  toggleSemesterStatus: (id) =>
    handleMutationRequest(() => api.patch(`/admin/semesters/${id}/toggle-status`)),
  getSubjects: () =>
    handleRequest(() => api.get("/admin/subjects"), []),
  createSubject: (data) =>
    handleMutationRequest(() => api.post("/admin/subjects", data)),
  updateSubject: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/subjects/${id}`, data)),
  deleteSubject: (id) =>
    handleMutationRequest(() => api.delete(`/admin/subjects/${id}`)),
  getTeacherSubjects: () =>
    handleRequest(() => api.get("/admin/teacher-subjects"), []),
  assignTeacherSubject: (data) =>
    handleMutationRequest(() => api.post("/admin/teacher-subjects", data)),
  toggleTeacherSubject: (teacherId, subjectId) =>
    handleMutationRequest(() =>
      api.post("/admin/teacher-subjects/toggle", {
        teacher_id: teacherId,
        subject_id: subjectId,
      })
    ),
  deleteTeacherSubject: (id) =>
    handleMutationRequest(() => api.delete(`/admin/teacher-subjects/${id}`)),
  getReports: () =>
    handleRequest(() => api.get("/admin/reports"), {}),
  getProfile: () =>
    handleRequest(() => api.get("/admin/profile"), {}),
  getSystemSettings: () =>
    handleRequest(() => api.get("/admin/settings"), {}),
  updateSystemSettings: (data) =>
    handleMutationRequest(() => api.put("/admin/settings", data)),
  getBatches: () =>
    handleRequest(() => api.get("/admin/batches"), []),
  createBatch: (data) =>
    handleMutationRequest(() => api.post("/admin/batches", data)),
  updateBatch: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/batches/${id}`, data)),
  deleteBatch: (id) =>
    handleMutationRequest(() => api.delete(`/admin/batches/${id}`)),
  toggleBatchStatus: (id) =>
    handleMutationRequest(() => api.patch(`/admin/batches/${id}/toggle-status`)),
  getFaculty: () =>
    handleRequest(() => api.get("/admin/teachers"), []),
  createFaculty: (data) =>
    handleMutationRequest(() => api.post("/admin/teachers", data)),
  updateFaculty: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/teachers/${id}`, data)),
  deleteFaculty: (id) =>
    handleMutationRequest(() => api.delete(`/admin/teachers/${id}`)),
  getStudents: () =>
    handleRequest(() => api.get("/admin/students"), []),
  createStudent: (data) =>
    handleMutationRequest(() => api.post("/admin/students", data)),
  updateStudent: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/students/${id}`, data)),
  deleteStudent: (id) =>
    handleMutationRequest(() => api.delete(`/admin/students/${id}`)),
};

export default api;
