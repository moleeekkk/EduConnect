<div align="center">

# 🎓 EduConnect

### A Smart Student, Teacher & Academic Management System

A full-stack Academic ERP / Learning Management System for colleges and universities, connecting **Students**, **Faculty** and **Administrators** through dedicated role-based portals.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Authentication Flow](#-authentication-flow)
- [API Overview](#-api-overview)
- [Frontend Routes](#-frontend-routes)
- [Running Tests](#-running-tests)
- [Known Limitations & Roadmap](#-known-limitations--roadmap)
- [Contributing](#-contributing)

---

## 🌟 Overview

EduConnect centralizes everyday academic operations in one platform:

- **Admins** build the academic hierarchy (institutes → departments → semesters → batches → subjects) and manage users.
- **Teachers** mark attendance, publish assignments, tests, quizzes and study material, answer doubts and handle leave requests.
- **Students** track attendance, submit assignments, practise quizzes, view results, raise doubts and apply for leave.

---

## 🚀 Features

### 👨‍💼 Administrator Portal
- **Dashboard & Reports** – institute-wide statistics and academic summaries
- **Academic hierarchy** – Institutes, Departments, Semesters, Batches and Subjects
- **User management** – student enrollment and faculty directory
- **Teacher–Subject allocation** – assign faculty to subjects, batches and semesters
- **Profile & system settings**

### 👩‍🏫 Teacher Portal
- **Dashboard** – schedule and quick-access shortcuts
- **Manage students** – filter by batch, department and semester
- **Attendance marker** – session-based attendance with per-student status
- **Assignments** – create assignments with file upload and review submissions
- **Weekly tests & quizzes** – create tests, record scores, set up practice quizzes
- **Study material** – upload and share notes and reference files
- **Doubts** – reply to student questions
- **Leave management** – approve or reject student leave requests
- **Parent email** – send attendance / result notifications to parents via SMTP

### 👨‍🎓 Student Portal
- **Dashboard** – attendance, submissions and test overview
- **Profile & Digital ID** – personal details and digital student ID card
- **Attendance** – subject-wise history and percentage
- **Assignments** – view and submit with file attachments
- **Weekly tests & quiz practice** – results and topic practice
- **Study material** – access notes shared by faculty
- **Ask doubts** – send questions to subject teachers
- **Leave requests** – apply and track status

### ⚙️ Platform
- Secure password storage with **BCrypt**
- **Email OTP** login for students; **forgot-password** code flow for teachers and admins
- In-app **document viewer** for uploaded files
- Responsive UI with toast notifications and collapsible role-based sidebars

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Axios, React Hook Form, Zod, Lucide React, React Hot Toast |
| **Backend** | Spring Boot 3.4.3, Java 21, Spring Web, Spring Data JPA (Hibernate), Spring Security, Spring Validation, Spring Mail, Lombok, Maven |
| **Database** | PostgreSQL |
| **Testing** | JUnit 5, Spring Boot Test, Spring Security Test |
| **Architecture** | Monorepo · RESTful API (`/api/v1`) · Controller → Service → Repository layering |

---

## 📂 Project Structure

```
EduConnect/
├── backend/                      # Spring Boot REST API
│   ├── src/main/java/com/educonnect/backend/
│   │   ├── config/               # SecurityConfig (CORS, BCrypt), DataInitializer
│   │   ├── controller/           # Auth, Admin, Teacher, Student, AssignmentFile
│   │   ├── dto/                  # Request / response models
│   │   ├── entity/               # JPA entities (Student, Teacher, Admin, Batch, Quiz, ...)
│   │   ├── exception/            # GlobalExceptionHandler
│   │   ├── repository/           # Spring Data JPA repositories
│   │   └── service/              # Business logic (Auth, Admin, Teacher, Student, Email, ...)
│   ├── src/main/resources/application.properties
│   ├── src/test/                 # Controller & service tests
│   ├── mvnw / mvnw.cmd
│   └── pom.xml
│
├── database/
│   └── EduConnectData.sql        # PostgreSQL dump (custom format – restore with pg_restore)
│
├── frontend/                     # React + Vite client
│   ├── src/
│   │   ├── components/           # common, modals, navbar, sidebar
│   │   ├── context/              # BatchContext
│   │   ├── layouts/              # Admin / Teacher / Student / Auth layouts
│   │   ├── pages/                # admin, teacher, student, auth views
│   │   ├── routes/               # AppRoutes.jsx
│   │   ├── services/api.js       # Axios instance & API calls
│   │   └── utils/                # toast, fileViewer, maskEmail
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

| Tool | Version |
| :--- | :--- |
| Node.js & npm | 18+ |
| JDK | **21** |
| PostgreSQL | 14+ |
| Maven | optional – wrapper (`mvnw`) included |

### 1. Clone the repository

```bash
git clone https://github.com/moleeekkk/MCA-PROJECT.git
cd MCA-PROJECT
```

### 2. Set up the database

Create an empty database:

```sql
CREATE DATABASE educonnect_db;
```

Restore the bundled dump. It is a PostgreSQL **custom-format** archive (despite the `.sql` extension), so use `pg_restore`, not `psql`:

```bash
pg_restore -U postgres -d educonnect_db database/EduConnectData.sql
```

Or in pgAdmin: right-click `educonnect_db` → **Restore…** → choose `EduConnectData.sql`.

> The backend runs with `spring.jpa.hibernate.ddl-auto=update`, so missing tables are created automatically. The dump additionally provides sample data, including the admin account.

### 3. Configure & run the backend

Set your own database and mail credentials (see [Configuration](#-configuration)), then:

```bash
cd backend

# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

API available at **http://localhost:8080/api/v1**

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App available at **http://localhost:5173**

The frontend calls `http://localhost:8080/api/v1` (set in `frontend/src/services/api.js`). Change `API_BASE_URL` there if your backend runs elsewhere.

### Production build

```bash
# Frontend
cd frontend && npm run build        # output in frontend/dist

# Backend
cd backend && ./mvnw clean package  # jar in backend/target
```

---

## ⚙️ Configuration

Settings live in `backend/src/main/resources/application.properties`.

| Property | Purpose | Default |
| :--- | :--- | :--- |
| `spring.datasource.url` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/educonnect_db` |
| `spring.datasource.username` / `password` | Database credentials | `postgres` / *your password* |
| `spring.mail.host` / `port` | SMTP server (OTP, reset codes, parent emails) | `smtp.gmail.com` / `587` |
| `spring.mail.username` / `password` | SMTP account (use a Gmail **App Password**) | *your values* |
| `server.port` | Backend port | `8080` |
| `spring.servlet.multipart.max-file-size` | Max upload size | `10MB` |
| `app.upload.directory` | Folder for uploaded files | `uploads` |

### 🔐 Keep secrets out of Git

Do **not** commit real passwords. Spring Boot reads environment variables, so you can override any property without editing the file:

```bash
export SPRING_DATASOURCE_PASSWORD=your_db_password
export SPRING_MAIL_USERNAME=your_email@gmail.com
export SPRING_MAIL_PASSWORD=your_gmail_app_password
./mvnw spring-boot:run
```

Or use placeholders in `application.properties`:

```properties
spring.datasource.password=${DB_PASSWORD}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

---

## 🔑 Authentication Flow

| Role | Login method |
| :--- | :--- |
| **Student** | Enrollment number → 6-digit OTP sent by email → verify |
| **Teacher** | Email + password (BCrypt) |
| **Admin** | Email + password (BCrypt) |
| **Reset password** | Email code → new password (teachers & admins) |

Admin and teacher accounts come from the restored database. Use the credentials of the accounts in your dump; legacy plain-text passwords are automatically upgraded to BCrypt on first successful login.

---

## 🔌 API Overview

Base URL: `http://localhost:8080/api/v1`

| Prefix | Description |
| :--- | :--- |
| `/auth` | Student OTP (`/student/send-otp`, `/student/verify-otp`), teacher & admin login, forgot-password (`/forgot-password/send-code`, `/forgot-password/reset`) |
| `/admin` | Institutes, departments, semesters, batches, subjects, students, faculty, teacher-subject allocation, reports |
| `/teacher` | Attendance, assignments, weekly tests, quizzes, study material, doubts, leave management, parent email |
| `/student` | Profile, attendance, assignments, tests, quizzes, study material, doubts, leave requests |

---

## 🧭 Frontend Routes

| Area | Path | Pages |
| :--- | :--- | :--- |
| Public | `/`, `/student-login`, `/teacher-login`, `/admin-login`, `/verify-otp`, `/forgot-password` | Login selection & auth |
| Student | `/student/*` | dashboard, profile, attendance, assignments, weekly-tests, quiz-practice, study-material, digital-id, leave-request, doubts |
| Teacher | `/teacher/*` | dashboard, profile, students, attendance, assignments, weekly-tests, quiz-practice, study-material, reply-doubts, leave-management, parent-email |
| Admin | `/admin/*` | dashboard, profile, institutes, departments, semesters, batches, subjects, students, teachers, teacher-subjects, reports |

---

## 🧪 Running Tests

```bash
cd backend
./mvnw test
```

Covers the Admin, Teacher, Student and AssignmentFile controllers plus the Admin and Auth services.

---

## ⚠️ Known Limitations & Roadmap

This project is under active development. Before any real-world deployment, note:

- [ ] **Real JWT authentication** – login currently returns a placeholder token and the backend does not validate it yet
- [ ] **Server-side authorization** – `SecurityConfig` currently permits all `/api/v1/**` requests; add role-based access control (Admin / Teacher / Student)
- [ ] **Restrict CORS** to the deployed frontend origin instead of `*`
- [ ] **Move all secrets** to environment variables or a secrets manager
- [ ] **Persist OTPs** (currently held in memory, lost on restart) with expiry and rate limiting
- [ ] Make the frontend API URL configurable via `.env` (`VITE_API_URL`)
- [ ] Docker / docker-compose setup
- [ ] CI pipeline (build + tests on every push)



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add: your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request



## 📄 License

No license has been specified yet. Add a `LICENSE` file (for example MIT) to define how others may use this project.

---

<div align="center">

Made with ❤️ as an MCA project

</div>