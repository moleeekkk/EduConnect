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

async function runPrompt10Verification() {
  console.log("=== VERIFYING TEACHER ATTENDANCE ENDPOINTS & SECURITY ===\n");

  const teacherEmail = "teacher@educonnect.ac.in";
  const studentEmail = "manish.svgu.46@gmail.com";

  const teacherJwt = createTestJwt(teacherEmail, "TEACHER", "tch-001", "Sarah Jenkins");
  const studentJwt = createTestJwt(studentEmail, "STUDENT", "stu-001", "Alex Johnson");

  // Get Teacher Allocations
  const getSub = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/subjects", method: "GET",
    headers: { Authorization: `Bearer ${teacherJwt}` }
  });
  const subjects = JSON.parse(getSub.body);
  const allocId = subjects[0].allocation_id || subjects[0].allocationId;

  // Get Roster
  const getRos = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/allocations/${allocId}/students`, method: "GET",
    headers: { Authorization: `Bearer ${teacherJwt}` }
  });
  const roster = JSON.parse(getRos.body);
  const studentId = roster[0].student_id || roster[0].studentId;

  const testPayload = JSON.stringify({
    allocationId: allocId,
    sessionDate: "2026-08-24",
    lectureNo: 1,
    startTime: "09:30",
    endTime: "11:00",
    topic: "Prompt 10 Test Lecture",
    studentStatuses: [
      { studentId: studentId, status: "Present", remarks: "Verified" }
    ]
  });

  const postUrls = [
    "/api/teacher/attendance",
    "/api/teacher/attendances",
    "/api/teacher/attendance/mark",
    "/api/teacher/attendance/save",
    "/api/v1/teacher/attendance"
  ];

  console.log("1. TESTING POST PATH ALIASES (PREVENTING 'REQUEST METHOD POST NOT SUPPORTED'):");
  for (const url of postUrls) {
    const res = await makeRequest({
      hostname: "localhost", port: 8081, path: url, method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherJwt}` }
    }, testPayload);
    console.log(` - POST ${url} -> Status: ${res.statusCode} (Expected: 200) | Result: ${res.statusCode === 200 ? "PASS" : "FAIL"}`);
  }

  console.log("\n2. TESTING SECURITY ACCESS MATRIX:");
  // A. Teacher JWT -> Allowed (200)
  const sec1 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/attendance", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherJwt}` }
  }, testPayload);
  console.log(` - Teacher JWT -> Status: ${sec1.statusCode} (Expected: 200) | Result: ${sec1.statusCode === 200 ? "PASS" : "FAIL"}`);

  // B. Student JWT -> 403 Forbidden
  const sec2 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/attendance", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${studentJwt}` }
  }, testPayload);
  console.log(` - Student JWT -> Status: ${sec2.statusCode} (Expected: 403) | Result: ${sec2.statusCode === 403 ? "PASS" : "FAIL"}`);

  // C. No token -> 401 Unauthorized
  const sec3 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/attendance", method: "POST",
    headers: { "Content-Type": "application/json" }
  }, testPayload);
  console.log(` - No Token    -> Status: ${sec3.statusCode} (Expected: 401) | Result: ${sec3.statusCode === 401 ? "PASS" : "FAIL"}`);

  console.log("\n3. POSTGRESQL INSERT & VERIFICATION:");
  console.log(` - Returned Payload: ${sec1.body}`);
}

runPrompt10Verification().catch(console.error);
