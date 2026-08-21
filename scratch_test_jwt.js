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
  console.log("=== STARTING EDUCONNECT ADMIN STUDENT MANAGEMENT SUITE ===\n");

  const adminJwt = createTestJwt("admin@educonnect.ac.in", "ADMIN", "admin-001", "Super Admin");

  // TEST 1: GET /api/admin/students
  console.log("--------------------------------------------------");
  console.log("TEST 1: GET /api/admin/students (Admin JWT)");
  const t1 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/students",
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  console.log(`RESULT: ${t1.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Unique Enrollment & Email for clean test run
  const testEnroll = "25CI21100" + Math.floor(Math.random() * 89 + 10);
  const testEmail = "sarah.student" + Math.floor(Math.random() * 899 + 100) + "@educonnect.ac.in";

  // TEST 2: POST /api/admin/students (Create New Student)
  console.log("--------------------------------------------------");
  console.log(`TEST 2: POST /api/admin/students (Create Student ${testEnroll})`);
  const newStudentPayload = JSON.stringify({
    enrollmentNo: testEnroll,
    firstName: "Sarah",
    lastName: "Williams",
    email: testEmail,
    mobile: "+91 9876543210",
    gender: "Female",
    dateOfBirth: "2003-05-12",
    address: "Campus Quarters Block B",
    isActive: true
  });

  const t2 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/students",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(newStudentPayload)
      }
    },
    newStudentPayload
  );
  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 201 || t2.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 3: POST /api/admin/students (Duplicate Email Validation) -> Expect 409
  console.log("--------------------------------------------------");
  console.log("TEST 3: POST /api/admin/students (Duplicate Validation)");
  const t3 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/students",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(newStudentPayload)
      }
    },
    newStudentPayload
  );
  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 409 ? "PASS" : "FAIL"}\n`);

  // TEST 4: GET /api/admin/students/{testEnroll} (View Individual Student)
  console.log("--------------------------------------------------");
  console.log(`TEST 4: GET /api/admin/students/${testEnroll}`);
  const t4 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: `/api/admin/students/${testEnroll}`,
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t4.statusCode}`);
  console.log(`BODY  : ${t4.body}`);
  console.log(`RESULT: ${t4.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 5: PATCH /api/admin/students/{testEnroll}/status (Toggle Activation)
  console.log("--------------------------------------------------");
  console.log(`TEST 5: PATCH /api/admin/students/${testEnroll}/status`);
  const patchPayload = JSON.stringify({ is_active: false });
  const t5 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: `/api/admin/students/${testEnroll}/status`,
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(patchPayload)
      }
    },
    patchPayload
  );
  console.log(`STATUS: ${t5.statusCode}`);
  console.log(`BODY  : ${t5.body}`);
  console.log(`RESULT: ${t5.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 6: Student Real OTP Authentication Check for Existing Active Student (25CI2110016)
  console.log("--------------------------------------------------");
  console.log("TEST 6: POST /api/v1/auth/student/send-otp for 25CI2110016 (OTP Integration Test)");
  const otpPayload = JSON.stringify({ enrollmentNo: "25CI2110016" });
  const t6 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/v1/auth/student/send-otp",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(otpPayload)
      }
    },
    otpPayload
  );
  console.log(`STATUS: ${t6.statusCode}`);
  console.log(`BODY  : ${t6.body}`);
  console.log(`RESULT: ${t6.statusCode === 200 ? "PASS" : "FAIL"}\n`);
}

runTests().catch(console.error);
