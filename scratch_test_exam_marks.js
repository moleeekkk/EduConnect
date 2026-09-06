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

async function runExamMarksTests() {
  console.log("=== STARTING EDUCONNECT MARKS & RESULT ENTRY TEST SUITE ===\n");

  const teacherAEmail = "teacher@educonnect.ac.in";
  const teacherBEmail = "prof.eleanor845@educonnect.ac.in";
  const studentEmail  = "manish.svgu.46@gmail.com";

  const teacherAJwt = createTestJwt(teacherAEmail, "TEACHER", "tch-001", "Sarah Jenkins");
  const teacherBJwt = createTestJwt(teacherBEmail, "TEACHER", "tch-002", "Eleanor Vance");
  const studentJwt  = createTestJwt(studentEmail,  "STUDENT", "stu-001", "Manish Lakum");

  // Step 1: Get Teacher A Assigned Subjects & Student Roster
  const s1 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/subjects", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  const subjects = JSON.parse(s1.body);
  const allocId = subjects[0].allocation_id || subjects[0].allocationId;

  const s2 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/allocations/${allocId}/students`, method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  const roster = JSON.parse(s2.body);
  const student1Id = roster[0].student_id || roster[0].studentId;
  const student2Id = roster[1] ? (roster[1].student_id || roster[1].studentId) : student1Id;

  // Step 2: Teacher A enters valid exam marks in PostgreSQL
  console.log("--------------------------------------------------");
  console.log(`TEST 1: Teacher A entering valid Exam Marks (Mid Sem Exam - Max 50)`);
  const validPayload = JSON.stringify({
    allocationId: allocId,
    examName: "Mid Sem Exam",
    examDate: "2026-08-24",
    maximumMarks: 50.0,
    studentMarks: [
      { studentId: student1Id, obtainedMarks: 45.0, remarks: "Excellent" },
      { studentId: student2Id, obtainedMarks: 38.0, remarks: "Good performance" }
    ]
  });

  const t1 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/exam-marks", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherAJwt}` }
  }, validPayload);

  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  console.log(`RESULT: ${t1.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 3: Validation Test - Obtained > Max Marks (Expect 400 Bad Request)
  console.log("--------------------------------------------------");
  console.log(`TEST 2: Validation Test - Obtained Marks > Max Marks (Expect 400 Bad Request)`);
  const invalidPayload1 = JSON.stringify({
    allocationId: allocId,
    examName: "Mid Sem Exam",
    maximumMarks: 50.0,
    studentId: student1Id,
    obtainedMarks: 65.0
  });

  const t2 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/exam-marks", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherAJwt}` }
  }, invalidPayload1);

  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 400 ? "PASS" : "FAIL"}\n`);

  // Step 4: Validation Test - Negative Marks (Expect 400 Bad Request)
  console.log("--------------------------------------------------");
  console.log(`TEST 3: Validation Test - Negative Obtained Marks (Expect 400 Bad Request)`);
  const invalidPayload2 = JSON.stringify({
    allocationId: allocId,
    examName: "Mid Sem Exam",
    maximumMarks: 50.0,
    studentId: student1Id,
    obtainedMarks: -10.0
  });

  const t3 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/exam-marks", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherAJwt}` }
  }, invalidPayload2);

  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 400 ? "PASS" : "FAIL"}\n`);

  // Step 5: Security Check - Teacher B attempts to enter marks for Teacher A's allocation
  console.log("--------------------------------------------------");
  console.log(`TEST 4: Security Check - Teacher B attempting to enter marks for Teacher A's subject`);
  const t4 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/exam-marks", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherBJwt}` }
  }, validPayload);

  console.log(`STATUS: ${t4.statusCode}`);
  console.log(`BODY  : ${t4.body}`);
  console.log(`RESULT: ${t4.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  // Step 6: Teacher queries entered exam results
  console.log("--------------------------------------------------");
  console.log(`TEST 5: Teacher A fetching entered Exam Results`);
  const t5 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/exam-marks", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t5.statusCode}`);
  console.log(`BODY  : ${t5.body}`);
  console.log(`RESULT: ${t5.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 7: Student queries results/marksheet
  console.log("--------------------------------------------------");
  console.log(`TEST 6: Student querying Marksheet/Results for (${studentEmail})`);
  const t6 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/student/results?enrollmentNo=${studentEmail}`, method: "GET",
    headers: { Authorization: `Bearer ${studentJwt}` }
  });
  console.log(`STATUS: ${t6.statusCode}`);
  console.log(`BODY  : ${t6.body}`);
  console.log(`RESULT: ${t6.statusCode === 200 ? "PASS" : "FAIL"}\n`);
}

runExamMarksTests().catch(console.error);
