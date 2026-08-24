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

async function runAssignmentTests() {
  console.log("=== STARTING EDUCONNECT TEACHER ASSIGNMENT MANAGEMENT SUITE ===\n");

  const teacherAEmail = "teacher@educonnect.ac.in";
  const teacherBEmail = "prof.eleanor845@educonnect.ac.in";

  const teacherAJwt = createTestJwt(teacherAEmail, "TEACHER", "tch-001", "Sarah Jenkins");
  const teacherBJwt = createTestJwt(teacherBEmail, "TEACHER", "tch-002", "Eleanor Vance");

  // Step 1: Get Teacher A Assigned Subjects
  const s1 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/subjects", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  const subjects = JSON.parse(s1.body);
  const allocId = subjects[0].allocation_id || subjects[0].allocationId;

  // Step 2: Create Assignment
  console.log("--------------------------------------------------");
  console.log(`TEST 1: Teacher A creating new Assignment in PostgreSQL`);
  const createPayload = JSON.stringify({
    allocationId: allocId,
    title: "React & Redux Architecture",
    description: "Build a state management workflow for EduConnect web application.",
    dueDate: "2026-09-05",
    totalMarks: 100,
    refFileName: "React_Redux_Guide.pdf"
  });

  const t1 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/assignments", method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherAJwt}` }
  }, createPayload);

  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  const createdAsgn = JSON.parse(t1.body);
  const asgnId = createdAsgn.assignment_id || createdAsgn.assignmentId;
  console.log(`RESULT: ${t1.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 3: Fetch Teacher Assignments
  console.log("--------------------------------------------------");
  console.log(`TEST 2: Teacher A fetching published Assignments list`);
  const t2 = await makeRequest({
    hostname: "localhost", port: 8081, path: "/api/teacher/assignments", method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 4: Update Assignment
  console.log("--------------------------------------------------");
  console.log(`TEST 3: Teacher A updating Assignment (${asgnId})`);
  const updatePayload = JSON.stringify({
    title: "React & Redux Architecture (Updated)",
    description: "Build a state management workflow for EduConnect web application with custom hooks.",
    dueDate: "2026-09-10",
    totalMarks: 75
  });

  const t3 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/assignments/${asgnId}`, method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherAJwt}` }
  }, updatePayload);
  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Step 5: Security Check - Teacher B attempts to update Teacher A's assignment
  console.log("--------------------------------------------------");
  console.log(`TEST 4: Security Check - Teacher B attempting to update Teacher A's Assignment`);
  const t4 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/assignments/${asgnId}`, method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${teacherBJwt}` }
  }, updatePayload);
  console.log(`STATUS: ${t4.statusCode}`);
  console.log(`BODY  : ${t4.body}`);
  console.log(`RESULT: ${t4.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  // Step 6: Fetch Submissions
  console.log("--------------------------------------------------");
  console.log(`TEST 5: Teacher A fetching Submissions for Assignment (${asgnId})`);
  const t5 = await makeRequest({
    hostname: "localhost", port: 8081, path: `/api/teacher/assignments/${asgnId}/submissions`, method: "GET",
    headers: { Authorization: `Bearer ${teacherAJwt}` }
  });
  console.log(`STATUS: ${t5.statusCode}`);
  console.log(`BODY  : ${t5.body}`);
  console.log(`RESULT: ${t5.statusCode === 200 ? "PASS" : "FAIL"}\n`);
}

runAssignmentTests().catch(console.error);
