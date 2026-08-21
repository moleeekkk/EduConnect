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
  console.log("=== STARTING EDUCONNECT ADMIN POST TEST SUITE ===\n");

  const adminJwt = createTestJwt("admin@educonnect.ac.in", "ADMIN", "admin-001", "Super Admin");
  const studentJwt = createTestJwt("25CI2110016", "STUDENT", "stu-id-123", "Alex Johnson");

  // TEST 1: GET /api/admin/dashboard (Admin JWT)
  console.log("--------------------------------------------------");
  console.log("TEST 1: GET /api/admin/dashboard (Admin JWT)");
  const t1 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/dashboard",
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t1.statusCode}`);
  console.log(`BODY  : ${t1.body}`);
  console.log(`RESULT: ${t1.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 2: POST /api/admin/programs (Admin JWT) -> Expect 200 or 201
  console.log("--------------------------------------------------");
  console.log("TEST 2: POST /api/admin/programs (Admin JWT)");
  const programPayload = JSON.stringify({
    programCode: "BCA",
    programName: "Bachelor of Computer Applications",
    durationYears: 3,
    isActive: true,
    instituteId: "f7bd9f70-53b6-449b-8423-af9c13b1f7fc"
  });

  const t2 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/programs",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(programPayload)
      }
    },
    programPayload
  );
  console.log(`STATUS: ${t2.statusCode}`);
  console.log(`BODY  : ${t2.body}`);
  console.log(`RESULT: ${t2.statusCode === 201 || t2.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 3: GET /api/admin/programs (Admin JWT) -> Expect 200
  console.log("--------------------------------------------------");
  console.log("TEST 3: GET /api/admin/programs (Admin JWT)");
  const t3 = await makeRequest({
    hostname: "localhost",
    port: 8081,
    path: "/api/admin/programs",
    method: "GET",
    headers: { Authorization: `Bearer ${adminJwt}` }
  });
  console.log(`STATUS: ${t3.statusCode}`);
  console.log(`BODY  : ${t3.body}`);
  console.log(`RESULT: ${t3.statusCode === 200 ? "PASS" : "FAIL"}\n`);

  // TEST 4: POST /api/admin/programs (Student JWT) -> Expect 403
  console.log("--------------------------------------------------");
  console.log("TEST 4: POST /api/admin/programs (Student JWT)");
  const t4 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/programs",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${studentJwt}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(programPayload)
      }
    },
    programPayload
  );
  console.log(`STATUS: ${t4.statusCode}`);
  console.log(`BODY  : ${t4.body}`);
  console.log(`RESULT: ${t4.statusCode === 403 ? "PASS" : "FAIL"}\n`);

  // TEST 5: POST /api/admin/programs (No Token) -> Expect 401
  console.log("--------------------------------------------------");
  console.log("TEST 5: POST /api/admin/programs (No Token)");
  const t5 = await makeRequest(
    {
      hostname: "localhost",
      port: 8081,
      path: "/api/admin/programs",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(programPayload)
      }
    },
    programPayload
  );
  console.log(`STATUS: ${t5.statusCode}`);
  console.log(`BODY  : ${t5.body}`);
  console.log(`RESULT: ${t5.statusCode === 401 ? "PASS" : "FAIL"}\n`);
}

runTests().catch(console.error);
