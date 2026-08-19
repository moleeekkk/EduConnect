// Central Operational Data Store (Initialized to empty arrays for real API & PostgreSQL backend integration)

export const mockInstitutes = [];
export const mockPrograms = [];
export const mockBatches = [];
export const mockSemesters = [];
export const mockDivisions = [];
export const mockStudents = [];
export const mockTeachers = [];
export const mockAdmins = [];
export const mockSubjects = [];
export const mockTeacherSubjects = [];
export const mockAttendanceSessions = [];
export const mockAttendanceRecords = [];
export const mockAssignments = [];
export const mockAssignmentSubmissions = [];
export const mockLearningResources = [];
export const mockLeaveRequests = [];
export const mockDoubts = [];
export const mockQuizzes = [];
export const mockMcqs = [];
export const mockWeeklyExams = [];
export const mockWeeklyExamResults = [];
export const mockSemesterResults = [];
export const mockSemesterResultDetails = [];
export const mockAnnouncements = [];

// Safe default empty result structure for student Marksheet & Results views
export const getMockStudentResults = (enrollmentNo) => {
  return {
    student: {
      name: "",
      enrollment_no: enrollmentNo || "",
      program: "",
      batch: "",
      institute: "",
    },
    cgpa: 0,
    semesters: [],
  };
};
