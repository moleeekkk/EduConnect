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

async function runTeacherTests() {
  console.log("=== STARTING EDUCONNECT ADMIN TEACHER MANAGEMENT SUITE ===\n");

  const adminJwt = createTestJwt("admin@educonnect.ac.in", "ADMIN", "admin-001", "Super Admin");
  const studentJwt = createTestJwt("25CI2110016", "STUDENT", "student-001", "Alex Johnson");

  // TEST 1: GET /api/admin/teachers (Admin JWT) -> 200 OK
  console.log("--------------------------------------------------");
  console.log("TEST 1: GET /api/admin/teachers (Admin JWT)");
  const t1 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/teachers",
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  console.log(`RESULT: ${t1.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  const randomId = Math.floor(Math.random() * 899 + 100);
  const testEmail = `prof.eleanor${randomId}@educonnect.ac.in`;

  // TEST 2: POST /api/admin/teachers (Create Teacher with Admin JWT) -> 201 Created
  console.log("--------------------------------------------------");
  console.log(`TEST 2: POST /api/admin/teachers (Create Teacher ${testEmail})`);
  const newTeacherPayload = JSON.stringify({
    firstName: "Eleanor",
    lastName: "Vance",
    email: testEmail,
    mobile: "+91 9876543210",
    gender: "Female",
    designation: "Associate Professor",
    dateOfBirth: "1988-04-12",
    address: "Faculty Campus House 12",
    isActive: true
  });

  const t2 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/teachers",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(newTeacherPayload)
      }
    },
    newTeacherPayload
  );
  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 201 || t2.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 3: POST /api/admin/teachers (Duplicate Email Check) -> 409 Conflict
  console.log("--------------------------------------------------");
  console.log("TEST 3: POST /api/admin/teachers (Duplicate Email Check)");
  const t3 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/teachers",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(newTeacherPayload)
      }
    },
    newTeacherPayload
  );
  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 409 ? "PASS" : "FAIL"}\n`);

  // TEST 4: GET /api/admin/teachers/{testEmail} -> 200 OK
  console.log("--------------------------------------------------");
  console.log(`TEST 4: GET /api/admin/teachers/${testEmail}`);
  const t4 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: `/api/admin/teachers/${testEmail}`,
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t4.statusCode}`);
  console.log(`BODY  : ${t4.body}`);
  console.log(`RESULT: ${t4.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 5: PUT /api/admin/teachers/{testEmail} (Update Teacher) -> 200 OK
  console.log("--------------------------------------------------");
  console.log(`TEST 5: PUT /api/admin/teachers/${testEmail}`);
  const updatePayload = JSON.stringify({
    designation: "Professor & HOD",
    mobile: "+91 9988776655"
  });
  const t5 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: `/api/admin/teachers/${testEmail}`,
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(updatePayload)
      }
    },
    updatePayload
  );
  console.log(`STATUS: ${t5.statusCode}`);
  console.log(`BODY  : ${t5.body}`);
  console.log(`RESULT: ${t5.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 6: PATCH /api/admin/teachers/{testEmail}/status (Toggle Status) -> 200 OK
  console.log("--------------------------------------------------");
  console.log(`TEST 6: PATCH /api/admin/teachers/${testEmail}/status`);
  const patchPayload = JSON.stringify({ is_active: false });
  const t6 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: `/api/admin/teachers/${testEmail}/status`,
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(patchPayload)
      }
    },
    patchPayload
  );
  console.log(`STATUS: ${t6.statusCode}`);
  console.log(`BODY  : ${t6.body}`);
  console.log(`RESULT: ${t6.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 7: POST /api/admin/teachers (Student JWT Authorization Check) -> 403 Forbidden
  console.log("--------------------------------------------------");
  console.log("TEST 7: POST /api/admin/teachers (Student JWT Security Check)");
  const t7 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/teachers",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${studentJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(newTeacherPayload)
      }
    },
    newTeacherPayload
  );
  console.log(`STATUS: ${t7.statusCode}`);
  console.log(`BODY  : ${t7.body}`);
  console.log(`RESULT: ${t7.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  // TEST 8: GET /api/admin/teachers (No Token Check) -> 401 Unauthorized
  console.log("--------------------------------------------------");
  console.log("TEST 8: GET /api/admin/teachers (No Token Check)");
  const t8 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/teachers",
    method: "GET"
  });
  console.log(`STATUS: ${t8.statusCode}`);
  console.log(`BODY  : ${t8.body}`);
  console.log(`RESULT: ${t8.statusCode === 401 ? "PASS" : "FAIL"}\n`);
}

runTeacherTests().catch(console.error);
