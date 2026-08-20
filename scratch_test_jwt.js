const http = require("http");

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
  console.log("=== STARTING EDUCONNECT FULL JWT SECURITY TEST SUITE ===\n");

  // TEST 1: Unauthenticated request to /api/student/profile -> Expect 401
  console.log("--------------------------------------------------");
  console.log("TEST 1: GET /api/student/profile (No Token)");
  const t1 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/student/profile",
    method: "GET"
  });
  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  console.log(`RESULT: ${t1.statusCode === 401 ? "PASS" : "FAIL"}\n`);

  // TEST 2: Send Student OTP -> Expect 200
  console.log("--------------------------------------------------");
  console.log("TEST 2: POST /api/v1/auth/student/send-otp");
  const sendOtpPayload = JSON.stringify({ enrollmentNo: "25CI2110016" });
  const t2 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/v1/auth/student/send-otp",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(sendOtpPayload)
      }
    },
    sendOtpPayload
  );
  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // Generate valid HMAC-SHA256 JWT using same Secret Key as backend (HS256)
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

  const studentJwt = createTestJwt("25CI2110016", "STUDENT", "stu-id-123", "Alex Johnson");
  console.log(`Generated Student JWT for testing...`);

  // TEST 3: GET /api/student/profile with STUDENT_JWT -> Expect 200 PASS
  console.log("--------------------------------------------------");
  console.log("TEST 3: GET /api/student/profile (With STUDENT_JWT)");
  const t3 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/student/profile",
    method: "GET",
    headers: {
      Authorization: `Bearer ${studentJwt}`
    }
  });
  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 4: GET /api/v1/student/profile with STUDENT_JWT -> Expect 200 PASS
  console.log("--------------------------------------------------");
  console.log("TEST 4: GET /api/v1/student/profile (With STUDENT_JWT)");
  const t4 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/v1/student/profile",
    method: "GET",
    headers: {
      Authorization: `Bearer ${studentJwt}`
    }
  });
  console.log(`STATUS: ${t4.statusCode}`);
  console.log(`BODY  : ${t4.body}`);
  console.log(`RESULT: ${t4.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 5: GET /api/admin/dashboard with STUDENT_JWT -> Expect 403 Forbidden
  console.log("--------------------------------------------------");
  console.log("TEST 5: GET /api/admin/dashboard (With STUDENT_JWT)");
  const t5 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/dashboard",
    method: "GET",
    headers: {
      Authorization: `Bearer ${studentJwt}`
    }
  });
  console.log(`STATUS: ${t5.statusCode}`);
  console.log(`BODY  : ${t5.body}`);
  console.log(`RESULT: ${t5.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  // TEST 6: GET /api/teacher/dashboard with STUDENT_JWT -> Expect 403 Forbidden
  console.log("--------------------------------------------------");
  console.log("TEST 6: GET /api/teacher/dashboard (With STUDENT_JWT)");
  const t6 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/teacher/dashboard",
    method: "GET",
    headers: {
      Authorization: `Bearer ${studentJwt}`
    }
  });
  console.log(`STATUS: ${t6.statusCode}`);
  console.log(`BODY  : ${t6.body}`);
  console.log(`RESULT: ${t6.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  console.log("=== COMPLETED ALL TESTS ===");
}

runTests().catch(console.error);
