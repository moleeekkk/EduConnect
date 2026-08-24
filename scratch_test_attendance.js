const http = require("http");
const crypto = require("crypto");

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createTestJwt(identifier, role, userId, name) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: identifier,
    role: role,
    userId: userId,
    name: name,
    iat: now,
    exp: now + 86400
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const secret = "EduConnectSecureJwtSecretKeyForStudentPortal2026SuperLong32ByteMinimumKey!";

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on("error", (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAttendanceTests() {
  console.log("=== STARTING EDUCONNECT REAL ATTENDANCE MANAGEMENT SUITE ===\n");

  const teacherAEmail = "teacher@educonnect.ac.in";
  const teacherBEmail = "prof.eleanor845@educonnect.ac.in";
  const studentEmail  = "manish.svgu.46@gmail.com";

  const teacherAJwt = createTestJwt(teacherAEmail, "TEACHER", "tch-001", "Sarah Jenkins");
  const teacherBJwt = createTestJwt(teacherBEmail, "TEACHER", "tch-002", "Eleanor Vance");
  const studentJwt  = createTestJwt(studentEmail,  "STUDENT", "stu-001", "Alex Johnson");

  // Step 1: Get Teacher A Assigned Subjects
  console.log("--------------------------------------------------");
  console.log(`STEP 1: Fetching assigned subjects for Teacher A (${teacherAEmail})`);
  const s1 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/subjects", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${s1.statusCode}`);
  const subjects = JSON.parse(s1.body);
  console.log(`Assigned Subjects Count: ${subjects.length}`);

  if (!subjects || subjects.length === 0) {
    console.error("FAIL: No assigned subjects found for Teacher A");
    return;
  }

  const allocId = subjects[0].allocation_id || subjects[0].allocationId;
  const subjectName = subjects[0].subject_name || subjects[0].subjectName;
  console.log(`Target Allocation ID: ${allocId} (${subjectName})\n`);

  // Step 2: Fetch Student Roster for Allocation
  console.log("--------------------------------------------------");
  console.log(`STEP 2: Fetching student roster for Allocation (${allocId})`);
  const s2 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/allocations/${allocId}/students`, method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${s2.statusCode}`);
  const roster = JSON.parse(s2.body);
  console.log(`Roster Size: ${roster.length}`);
  roster.forEach(st => console.log(` - Student: ${st.name} (${st.enrollment_no}) ID: ${st.student_id}`));

  if (!roster || roster.length === 0) {
    console.error("FAIL: No students in roster");
    return;
  }

  const student1Id = roster[0].student_id || roster[0].studentId;
  const student2Id = roster[1] ? (roster[1].student_id || roster[1].studentId) : student1Id;

  // Step 3: Teacher A Marks Attendance
  console.log("\n--------------------------------------------------");
  console.log(`STEP 3: Teacher A marking attendance for Lecture 1 (Date: 2026-08-24)`);
  const markPayload1 = JSON.stringify({
    allocationId: allocId,
    teacherSubjectId: allocId,
    sessionDate: "2026-08-24",
    lectureNo: 1,
    startTime: "09:30",
    endTime: "11:00",
    topic: "React State Management & Rest APIs",
    studentStatuses: [
      { studentId: student1Id, status: "Present", remarks: "Punctual" },
      { studentId: student2Id, status: "Absent", remarks: "Medical Leave" }
    ]
  });

  const s3 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/attendance/mark", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherAJwt}` }
  }, markPayload1);

  console.log(`STATUS: ${s3.statusCode}`);
  console.log(`BODY  : ${s3.body}`);
  console.log(`RESULT: ${s3.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 4: Duplicate Check & Update Attendance
  console.log("--------------------------------------------------");
  console.log(`STEP 4: Duplicate Check & Updating Attendance for same Lecture 1 on 2026-08-24`);
  const markPayload2 = JSON.stringify({
    allocationId: allocId,
    teacherSubjectId: allocId,
    sessionDate: "2026-08-24",
    lectureNo: 1,
    startTime: "09:30",
    endTime: "11:00",
    topic: "React State Management & Rest APIs (Updated)",
    studentStatuses: [
      { studentId: student1Id, status: "Present", remarks: "Punctual" },
      { studentId: student2Id, status: "Present", remarks: "Late arrival approved" }
    ]
  });

  const s4 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/attendance/mark", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherAJwt}` }
  }, markPayload2);

  console.log(`STATUS: ${s4.statusCode}`);
  console.log(`BODY  : ${s4.body}`);
  console.log(`RESULT: ${s4.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 5: Security Check - Teacher B attempts to mark attendance for Teacher A's allocation
  console.log("--------------------------------------------------");
  console.log(`STEP 5: Security Check - Teacher B attempting to mark attendance for Teacher A's allocation`);
  const s5 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/attendance/mark", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherBJwt}` }
  }, markPayload1);

  console.log(`STATUS: ${s5.statusCode}`);
  console.log(`BODY  : ${s5.body}`);
  console.log(`RESULT: ${s5.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  // Step 6: Teacher Attendance History
  console.log("--------------------------------------------------");
  console.log(`STEP 6: Fetching Attendance History for Teacher A`);
  const s6 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/attendance/history", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${s6.statusCode}`);
  console.log(`BODY  : ${s6.body}`);
  console.log(`RESULT: ${s6.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 7: Student Query Attendance
  console.log("--------------------------------------------------");
  console.log(`STEP 7: Student querying attendance records for (${studentEmail})`);
  const s7 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/student/attendance?enrollmentNo=${studentEmail}`, method: "GET",
    headers: { Authorization: `Bearer ${studentJwt}` }
  });
  console.log(`STATUS: ${s7.statusCode}`);
  console.log(`BODY  : ${s7.body}`);
  console.log(`RESULT: ${s7.statusCode === 200 ? "PASS" : "FAIL"}\n`);
}

runAttendanceTests().catch(console.error);
