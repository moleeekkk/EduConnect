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

async function runTeacherBackendTests() {
  console.log("=== STARTING EDUCONNECT TEACHER BACKEND SUITE (WITH TWO TEACHERS) ===\n");

  const teacherAEmail = "teacher@educonnect.ac.in";
  const teacherBEmail = "prof.eleanor845@educonnect.ac.in";

  const teacherAJwt = createTestJwt(teacherAEmail, "TEACHER", "tch-001", "Sarah Jenkins");
  const teacherBJwt = createTestJwt(teacherBEmail, "TEACHER", "tch-002", "Eleanor Vance");

  // TEST 1: Teacher A GET /api/teacher/profile
  console.log("--------------------------------------------------");
  console.log(`TEST 1: GET /api/teacher/profile for Teacher A (${teacherAEmail})`);
  const t1 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/profile", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  console.log(`RESULT: ${t1.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 2: Teacher A GET /api/teacher/dashboard
  console.log("--------------------------------------------------");
  console.log(`TEST 2: GET /api/teacher/dashboard for Teacher A (${teacherAEmail})`);
  const t2 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/dashboard", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 3: Teacher A GET /api/teacher/subjects
  console.log("--------------------------------------------------");
  console.log(`TEST 3: GET /api/teacher/subjects for Teacher A (${teacherAEmail})`);
  const t3 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/subjects", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 4: Teacher A GET /api/teacher/students
  console.log("--------------------------------------------------");
  console.log(`TEST 4: GET /api/teacher/students for Teacher A (${teacherAEmail})`);
  const t4 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/students", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t4.statusCode}`);
  console.log(`BODY  : ${t4.body}`);
  console.log(`RESULT: ${t4.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 5: Teacher B GET /api/teacher/profile
  console.log("--------------------------------------------------");
  console.log(`TEST 5: GET /api/teacher/profile for Teacher B (${teacherBEmail})`);
  const t5 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/profile", method: "GET",
    headers: { Authorization: `Bearer ${teacherBJwt}` }
  });
  console.log(`STATUS: ${t5.statusCode}`);
  console.log(`BODY  : ${t5.body}`);
  console.log(`RESULT: ${t5.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 6: Teacher B GET /api/teacher/dashboard
  console.log("--------------------------------------------------");
  console.log(`TEST 6: GET /api/teacher/dashboard for Teacher B (${teacherBEmail})`);
  const t6 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/dashboard", method: "GET",
    headers: { Authorization: `Bearer ${teacherBJwt}` }
  });
  console.log(`STATUS: ${t6.statusCode}`);
  console.log(`BODY  : ${t6.body}`);
  console.log(`RESULT: ${t6.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 7: CRITICAL SECURITY CHECK - Teacher A tries to view Teacher B's Dashboard -> Expect 403 Forbidden
  console.log("--------------------------------------------------");
  console.log(`TEST 7: SECURITY CHECK - Teacher A requesting Teacher B's dashboard URL parameter`);
  const t7 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/dashboard?teacherId=${teacherBEmail}`, method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t7.statusCode}`);
  console.log(`BODY  : ${t7.body}`);
  console.log(`RESULT: ${t7.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  // TEST 8: CRITICAL SECURITY CHECK - Teacher A tries to view Teacher B's Subjects -> Expect 403 Forbidden
  console.log("--------------------------------------------------");
  console.log(`TEST 8: SECURITY CHECK - Teacher A requesting Teacher B's subjects URL parameter`);
  const t8 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/subjects?teacherId=${teacherBEmail}`, method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t8.statusCode}`);
  console.log(`BODY  : ${t8.body}`);
  console.log(`RESULT: ${t8.statusCode === 403 ? "PASS" : "FAIL"}\n`);
}

runTeacherBackendTests().catch(console.error);
