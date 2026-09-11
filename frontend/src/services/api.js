import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Helpers for multi-role, multi-tab session storage
export const getAuthToken = () => {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) {
    return (
      sessionStorage.getItem("educonnect_token_admin") ||
      sessionStorage.getItem("educonnect_token") ||
      localStorage.getItem("educonnect_token_admin") ||
      localStorage.getItem("educonnect_token")
    );
  }
  if (path.startsWith("/teacher")) {
    return (
      sessionStorage.getItem("educonnect_token_teacher") ||
      sessionStorage.getItem("educonnect_token") ||
      localStorage.getItem("educonnect_token_teacher") ||
      localStorage.getItem("educonnect_token")
    );
  }
  if (path.startsWith("/student")) {
    return (
      sessionStorage.getItem("educonnect_token_student") ||
      sessionStorage.getItem("educonnect_token") ||
      localStorage.getItem("educonnect_token_student") ||
      localStorage.getItem("educonnect_token")
    );
  }
  return (
    sessionStorage.getItem("educonnect_token") ||
    localStorage.getItem("educonnect_token")
  );
};

export const getAuthUser = () => {
  const path = window.location.pathname;
  let userStr = null;
  if (path.startsWith("/admin")) {
    userStr =
      sessionStorage.getItem("educonnect_user_admin") ||
      sessionStorage.getItem("educonnect_user") ||
      localStorage.getItem("educonnect_user_admin") ||
      localStorage.getItem("educonnect_user");
  } else if (path.startsWith("/teacher")) {
    userStr =
      sessionStorage.getItem("educonnect_user_teacher") ||
      sessionStorage.getItem("educonnect_user") ||
      localStorage.getItem("educonnect_user_teacher") ||
      localStorage.getItem("educonnect_user");
  } else if (path.startsWith("/student")) {
    userStr =
      sessionStorage.getItem("educonnect_user_student") ||
      sessionStorage.getItem("educonnect_user") ||
      localStorage.getItem("educonnect_user_student") ||
      localStorage.getItem("educonnect_user");
  } else {
    userStr =
      sessionStorage.getItem("educonnect_user") ||
      localStorage.getItem("educonnect_user");
  }

  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Interceptor to add Authorization token if present
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized errors and clear session per role
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith("/admin")) {
        sessionStorage.removeItem("educonnect_token_admin");
        sessionStorage.removeItem("educonnect_user_admin");
        localStorage.removeItem("educonnect_token_admin");
        localStorage.removeItem("educonnect_user_admin");
        if (window.location.pathname !== "/admin-login") {
          window.location.href = "/admin-login";
        }
      } else if (path.startsWith("/teacher")) {
        sessionStorage.removeItem("educonnect_token_teacher");
        sessionStorage.removeItem("educonnect_user_teacher");
        localStorage.removeItem("educonnect_token_teacher");
        localStorage.removeItem("educonnect_user_teacher");
        if (window.location.pathname !== "/teacher-login") {
          window.location.href = "/teacher-login";
        }
      } else if (path.startsWith("/student")) {
        sessionStorage.removeItem("educonnect_token_student");
        sessionStorage.removeItem("educonnect_user_student");
        localStorage.removeItem("educonnect_token_student");
        localStorage.removeItem("educonnect_user_student");
        if (window.location.pathname !== "/student-login") {
          window.location.href = "/student-login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper for read queries - now propagates errors so promise rejects cleanly
const handleRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.error("API Query Error:", error);
    throw error;
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
      const dataStr = JSON.stringify(response.data);
      sessionStorage.setItem("educonnect_token_student", response.data.token);
      sessionStorage.setItem("educonnect_user_student", dataStr);
      sessionStorage.setItem("educonnect_token", response.data.token);
      sessionStorage.setItem("educonnect_user", dataStr);
      localStorage.setItem("educonnect_token_student", response.data.token);
      localStorage.setItem("educonnect_user_student", dataStr);
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", dataStr);
    }
    return response.data;
  },
  teacherLogin: async (email, password) => {
    const response = await api.post("/auth/teacher/login", { email, password });
    if (response.data?.token) {
      const dataStr = JSON.stringify(response.data);
      sessionStorage.setItem("educonnect_token_teacher", response.data.token);
      sessionStorage.setItem("educonnect_user_teacher", dataStr);
      sessionStorage.setItem("educonnect_token", response.data.token);
      sessionStorage.setItem("educonnect_user", dataStr);
      localStorage.setItem("educonnect_token_teacher", response.data.token);
      localStorage.setItem("educonnect_user_teacher", dataStr);
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", dataStr);
    }
    return response.data;
  },
  adminLogin: async (email, password) => {
    const response = await api.post("/auth/admin/login", { email, password });
    if (response.data?.token) {
      const dataStr = JSON.stringify(response.data);
      sessionStorage.setItem("educonnect_token_admin", response.data.token);
      sessionStorage.setItem("educonnect_user_admin", dataStr);
      sessionStorage.setItem("educonnect_token", response.data.token);
      sessionStorage.setItem("educonnect_user", dataStr);
      localStorage.setItem("educonnect_token_admin", response.data.token);
      localStorage.setItem("educonnect_user_admin", dataStr);
      localStorage.setItem("educonnect_token", response.data.token);
      localStorage.setItem("educonnect_user", dataStr);
    }
    return response.data;
  },
  sendPasswordResetCode: async (email, role) => {
    const response = await api.post("/auth/forgot-password/send-code", { email, role });
    return response.data;
  },
  resetPassword: async (email, code, newPassword, role) => {
    const response = await api.post("/auth/forgot-password/reset", { email, code, newPassword, new_password: newPassword, role });
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
  getResults: (semesterId, enrollmentNo) =>
    handleRequest(() => {
      const params = new URLSearchParams();
      if (semesterId) params.append("semesterId", semesterId);
      if (enrollmentNo) params.append("enrollmentNo", enrollmentNo);
      const query = params.toString();
      return api.get(`/student/results${query ? `?${query}` : ""}`);
    }, {}),
  getMarksheet: (semesterId, enrollmentNo) =>
    handleRequest(() => {
      const params = new URLSearchParams();
      if (semesterId) params.append("semesterId", semesterId);
      if (enrollmentNo) params.append("enrollmentNo", enrollmentNo);
      const query = params.toString();
      return api.get(`/student/marksheet${query ? `?${query}` : ""}`);
    }, {}),
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
  startQuizAttempt: (quizId) =>
    handleMutationRequest(() => api.post(`/student/quizzes/${quizId}/attempts/start`)),
  saveQuizAttempt: (quizId, attemptId, data) =>
    handleMutationRequest(() => api.post(`/student/quizzes/${quizId}/attempts/${attemptId}/save`, data)),
  submitQuizAttempt: (quizId, attemptId, data) =>
    handleMutationRequest(() => api.post(`/student/quizzes/${quizId}/attempts/${attemptId}/submit`, data)),
  getQuizAttemptHistory: (quizId) =>
    handleRequest(() => api.get(`/student/quizzes/${quizId}/attempts/history`), []),
  getQuizAttemptDetail: (attemptId) =>
    handleRequest(() => api.get(`/student/attempts/${attemptId}`), {}),
  getWeeklyTests: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/weekly-tests${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
  getTimetable: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/timetable${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
  getSyllabus: () =>
    handleRequest(() => api.get("/student/syllabus"), []),
  getDigitalID: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/digital-id${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), {}),
  getNotices: () =>
    handleRequest(() => api.get("/student/notices"), []),
  getSubjects: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/subjects${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
  getBatches: (enrollmentNo) =>
    handleRequest(() => api.get(`/student/batches${enrollmentNo ? `?enrollmentNo=${enrollmentNo}` : ""}`), []),
};

// Teacher Endpoints
export const teacherApi = {
  getDashboard: (teacherId) =>
    handleRequest(() => api.get(`/teacher/dashboard${teacherId ? `?teacherId=${teacherId}` : ""}`), {}),
  markAttendance: (attendanceData) =>
    handleMutationRequest(() => api.post("/teacher/attendance", attendanceData)),
  getAttendanceSessions: (subjectId, date) =>
    handleRequest(() => {
      const params = new URLSearchParams();
      if (subjectId) params.append("subjectId", subjectId);
      if (date) params.append("date", date);
      const query = params.toString();
      return api.get(`/teacher/attendance/sessions${query ? `?${query}` : ""}`);
    }),
  getAttendanceSessionDetail: (sessionId) =>
    handleRequest(() => api.get(`/teacher/attendance/sessions/${sessionId}`)),
  updateAttendanceSession: (sessionId, attendanceData) =>
    handleMutationRequest(() => api.put(`/teacher/attendance/sessions/${sessionId}`, attendanceData)),
  getStudents: () =>
    handleRequest(() => api.get("/teacher/students"), []),
  getDepartments: () =>
    handleRequest(() => api.get("/teacher/departments"), []),
  getSemesters: () =>
    handleRequest(() => api.get("/teacher/semesters"), []),
  getSubjects: () =>
    handleRequest(() => api.get("/teacher/subjects"), []),
  getBatches: () =>
    handleRequest(() => api.get("/teacher/batches"), []),
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
  updateLeaveStatus: (id, status, remarks) =>
    handleMutationRequest(() => api.put(`/teacher/leave-requests/${id}`, { status, remarks })),
  getDoubts: () =>
    handleRequest(() => api.get("/teacher/doubts"), []),
  replyDoubt: (id, reply) =>
    handleMutationRequest(() => api.post(`/teacher/doubts/${id}/reply`, { reply })),
  getStudyMaterials: () =>
    handleRequest(() => api.get("/teacher/study-materials"), []),
  uploadStudyMaterial: (data) =>
    handleMutationRequest(() =>
      api.post("/teacher/study-materials", data, data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {})
    ),
  updateStudyMaterial: (id, data) =>
    handleMutationRequest(() =>
      api.put(`/teacher/study-materials/${id}`, data, data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {})
    ),
  deleteStudyMaterial: (id) =>
    handleMutationRequest(() => api.delete(`/teacher/study-materials/${id}`)),
  getQuizzes: () =>
    handleRequest(() => api.get("/teacher/quizzes"), []),
  createQuiz: (data) =>
    handleMutationRequest(() => api.post("/teacher/quizzes", data)),
  updateQuiz: (id, data) =>
    handleMutationRequest(() => api.put(`/teacher/quizzes/${id}`, data)),
  publishQuiz: (id) =>
    handleMutationRequest(() => api.post(`/teacher/quizzes/${id}/publish`)),
  archiveQuiz: (id) =>
    handleMutationRequest(() => api.post(`/teacher/quizzes/${id}/archive`)),
  deleteQuiz: (id) =>
    handleMutationRequest(() => api.delete(`/teacher/quizzes/${id}`)),
  getQuizMcqs: (id) =>
    handleRequest(() => api.get(`/teacher/quizzes/${id}/mcqs`), []),
  addQuizMcq: (id, data) =>
    handleMutationRequest(() => api.post(`/teacher/quizzes/${id}/mcqs`, data)),
  updateQuizMcq: (id, mcqId, data) =>
    handleMutationRequest(() => api.put(`/teacher/quizzes/${id}/mcqs/${mcqId}`, data)),
  deleteQuizMcq: (id, mcqId) =>
    handleMutationRequest(() => api.delete(`/teacher/quizzes/${id}/mcqs/${mcqId}`)),
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
  publishWeeklyTest: (id) =>
    handleMutationRequest(() => api.post(`/teacher/weekly-tests/${id}/publish`)),
  getProfile: (identifier) =>
    handleRequest(() => api.get(`/teacher/profile${identifier ? `?email=${encodeURIComponent(identifier)}&teacherId=${encodeURIComponent(identifier)}` : ""}`), {}),
  updateProfile: (data) =>
    handleMutationRequest(() => api.put("/teacher/profile", data)),
  changePassword: (data) =>
    handleMutationRequest(() => api.post("/teacher/change-password", data)),
  sendParentEmail: (data) =>
    handleMutationRequest(() => api.post("/teacher/parent-email/send", data)),
  previewParentEmail: (data) =>
    handleMutationRequest(() => api.post("/teacher/parent-email/preview", data)),
  sendAssignmentReminder: (assignmentId) =>
    handleMutationRequest(() => api.post(`/teacher/assignments/${assignmentId}/reminders`)),
  getSyllabus: () =>
    handleRequest(() => api.get("/teacher/syllabus"), []),
  saveSyllabus: (subjectId, formData) =>
    handleMutationRequest(() =>
      api.post(`/teacher/subjects/${subjectId}/syllabus`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),
  getSchedule: (identifier) =>
    handleRequest(() => api.get(`/teacher/schedule${identifier ? `?email=${encodeURIComponent(identifier)}&teacherId=${encodeURIComponent(identifier)}` : ""}`), []),
  getTimetable: (identifier) =>
    handleRequest(() => api.get(`/teacher/timetable${identifier ? `?email=${encodeURIComponent(identifier)}&teacherId=${encodeURIComponent(identifier)}` : ""}`), []),
  getSemesterMarks: (subjectId, semesterId) =>
    handleRequest(() => api.get(`/teacher/semester-marks?subjectId=${subjectId}${semesterId ? `&semesterId=${semesterId}` : ""}`), []),
  saveSemesterMarks: (payload) =>
    handleMutationRequest(() => api.post("/teacher/semester-marks", payload)),
  getNotices: () =>
    handleRequest(() => api.get("/teacher/notices"), []),
  createNotice: (data) =>
    handleMutationRequest(() => api.post("/teacher/notices", data)),
  updateNotice: (id, data) =>
    handleMutationRequest(() => api.put(`/teacher/notices/${id}`, data)),
  archiveNotice: (id) =>
    handleMutationRequest(() => api.post(`/teacher/notices/${id}/archive`)),
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
  toggleTeacherSubject: (teacherId, subjectId, batchId, semesterId) =>
    handleMutationRequest(() =>
      api.post("/admin/teacher-subjects/toggle", {
        teacher_id: teacherId,
        subject_id: subjectId,
        batch_id: batchId || null,
        semester_id: semesterId || null,
      })
    ),
  deleteTeacherSubject: (id) =>
    handleMutationRequest(() => api.delete(`/admin/teacher-subjects/${id}`)),
  getReports: () =>
    handleRequest(() => api.get("/admin/reports"), {}),
  getProfile: () =>
    handleRequest(() => api.get("/admin/profile"), {}),
  updateProfile: (data) =>
    handleMutationRequest(() => api.put("/admin/profile", data)),
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
  getTimetables: () =>
    handleRequest(() => api.get("/admin/timetables"), []),
  createTimetable: (data) =>
    handleMutationRequest(() => api.post("/admin/timetables", data)),
  updateTimetable: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/timetables/${id}`, data)),
  archiveTimetable: (id) =>
    handleMutationRequest(() => api.patch(`/admin/timetables/${id}/archive`)),
  getSemesterResults: (departmentId, semesterId) =>
    handleRequest(() => api.get(`/admin/semester-results?departmentId=${departmentId}&semesterId=${semesterId}`), []),
  publishSemesterResults: (payload) =>
    handleMutationRequest(() => api.post("/admin/semester-results/publish", payload)),
  getNotices: () =>
    handleRequest(() => api.get("/admin/notices"), []),
  createNotice: (data) =>
    handleMutationRequest(() => api.post("/admin/notices", data)),
  updateNotice: (id, data) =>
    handleMutationRequest(() => api.put(`/admin/notices/${id}`, data)),
  archiveNotice: (id) =>
    handleMutationRequest(() => api.post(`/admin/notices/${id}/archive`)),
};

// File Upload and Retrieval Endpoints
export const fileApi = {
  uploadFile: async (file, purpose = "attachments") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getFileBlob: async (url) => {
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },
};

export default api;
