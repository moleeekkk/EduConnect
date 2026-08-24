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

async function runTests() {
  console.log("=== STARTING EDUCONNECT ASSIGNMENTS ALIAS TEST SUITE ===\n");

  const adminJwt = createTestJwt("admin@educonnect.ac.in", "ADMIN", "admin-001", "Super Admin");

  const tTeachers = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/admin/teachers", method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  const teachers = JSON.parse(tTeachers.body);

  const tCourses = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/admin/courses", method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  const courses = JSON.parse(tCourses.body);

  const tPrograms = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/admin/programs", method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  const programs = JSON.parse(tPrograms.body);

  const targetTeacher = teachers[0];
  const targetCourse = courses[0];
  const targetProgram = programs[0];

  const tSemesters = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/admin/semesters?programId=${targetProgram.program_id}`, method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  const semesters = JSON.parse(tSemesters.body);
  const targetSemester = semesters[0];

  // TEST 1: POST /api/admin/assignments
  console.log("--------------------------------------------------");
  console.log("TEST 1: POST /api/admin/assignments (User's Exact Requested Endpoint)");
  const allocPayload1 = JSON.stringify({
    teacher_id: targetTeacher.teacher_id,
    subject_id: targetCourse.subject_id,
    program_id: targetProgram.program_id,
    semester_id: targetSemester.semester_id,
    academic_year: "2025-2026"
  });

  const t1 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/assignments",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(allocPayload1)
      }
    },
    allocPayload1
  );
  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  console.log(`RESULT: ${t1.statusCode === 201 || t1.statusCode === 409 ? "PASS" : "FAIL"}\n`);

  // TEST 2: GET /api/admin/assignments
  console.log("--------------------------------------------------");
  console.log("TEST 2: GET /api/admin/assignments");
  const t2 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/assignments",
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 3: GET /api/admin/teacher-assignments
  console.log("--------------------------------------------------");
  console.log("TEST 3: GET /api/admin/teacher-assignments");
  const t3 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/teacher-assignments",
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 200 ? "PASS" : "FAIL"}\n`);
}

runTests().catch(console.error);
