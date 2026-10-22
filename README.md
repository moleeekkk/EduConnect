# 🎓 EduConnect — A Smart Student, Teacher & Academic Management System

**EduConnect** is a comprehensive, full-stack Academic ERP and Learning Management System (LMS) designed for colleges and universities. It bridges the gap between **Students**, **Faculty (Teachers)**, and **Administrators** through intuitive role-based portals, automated workflows, and centralized academic tracking.

---

## 🚀 Key Modules & Features

### 👨‍💼 Administrator Portal
- **Dashboard & Analytics**: Overview of institutional statistics, student enrollments, faculty counts, and academic performance metrics.
- **Academic Hierarchy Management**:
  - Institutes & Departments
  - Semesters & Academic Terms
  - Batches (Yearly cohorts)
  - Subjects & Curriculum Management
- **User Management**:
  - Student enrollment, profile records, and status tracking
  - Faculty directory and credentials management
- **Curriculum & Allocation**: Teacher-to-subject allocation and departmental assignment.
- **Reporting & System Configuration**: Exportable academic summaries and administrative settings.

### 👩‍🏫 Teacher (Faculty) Portal
- **Interactive Faculty Dashboard**: Schedule view, quick access links, and pending review alerts.
- **Student Management**: Filter students by batch, department, and semester.
- **Attendance Marker**: Daily lecture attendance recording with instant status updates.
- **Assignments & Grading**: Assignment creation with file uploads and online submission evaluation.
- **Assessments**:
  - Weekly test creation, scoring, and automated marksheet generation
  - Multiple-choice quiz setup and topic-wise practice
- **Study Materials**: Upload and distribute course lecture notes, syllabus modules, and reference files.
- **Communication & Grievances**:
  - Doubt resolution thread directly with students
  - Leave approval management
  - Automated parent email notification system for attendance and marksheet alerts

### 👨‍🎓 Student Portal
- **Student Dashboard**: Real-time attendance percentage, pending submissions, test scores, and scheduled lectures.
- **My Profile**: Personal details, enrollment info, parent contact, and profile photo update.
- **Digital Student ID**: Secure college digital identity card with QR code.
- **Attendance & Academics**: Subject-wise lecture attendance history and percentage meters.
- **Assignments & Tests**:
  - Online assignment submission with document attachment support
  - Weekly test results and performance tracking
  - Interactive quiz practice by subject
- **E-Learning & Doubts**:
  - Access study materials and lecture notes
  - One-on-one doubt inquiry with respective subject faculty
- **Leave Requests**: Formal leave application submission and tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React Icons, React Router v7, Axios, React Hot Toast |
| **Backend** | Spring Boot, Java 17+, Spring Data JPA, Hibernate, Spring Mail (SMTP), Maven |
| **Database** | PostgreSQL (`educonnect_db`) |
| **Architecture** | RESTful API, Role-Based Access Control (RBAC), Monorepo Project Structure |

---

## 📂 Project & Folder Structure

```
EduConnect/
│
├── backend/                             # Spring Boot Java REST API backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/educonnect/backend/
│   │   │   │   ├── config/              # Security, CORS, and Web MVC configs
│   │   │   │   ├── controller/          # REST API endpoints (Admin, Teacher, Student, Auth)
│   │   │   │   ├── dto/                 # Data Transfer Objects & request models
│   │   │   │   ├── entity/              # JPA Hibernate entity models (22 tables)
│   │   │   │   ├── exception/           # Custom exception handling & error responses
│   │   │   │   ├── repository/          # Spring Data JPA interfaces
│   │   │   │   ├── service/             # Core business logic & database queries
│   │   │   │   └── BackendApplication.java # Spring Boot main entry point
│   │   │   └── resources/
│   │   │       └── application.properties # Server port, PostgreSQL & Mail configurations
│   │   └── test/                        # JUnit test suites
│   ├── mvnw / mvnw.cmd                  # Maven wrappers
│   ├── pom.xml                          # Maven dependencies & build definitions
│   └── .gitignore
│
├── database/                            # Database backup and seed files
│   └── EduConnectData.sql               # Full PostgreSQL database backup (schema + records)
│
├── frontend/                            # React + Vite frontend client application
│   ├── public/                          # Static assets and icons
│   ├── src/
│   │   ├── assets/logo/                 # Application brand logos
│   │   ├── components/                  # Reusable UI component library
│   │   │   ├── common/                  # Buttons, Inputs, Document Viewers, Modals
│   │   │   ├── modals/                  # Action & confirmation popups
│   │   │   ├── navbar/                  # Responsive navigation bar with dynamic avatar
│   │   │   └── sidebar/                 # Collapsible role-based sidebar menus
│   │   ├── context/                     # Global state (BatchContext, etc.)
│   │   ├── layouts/                     # Layout shells (AdminLayout, TeacherLayout, StudentLayout, AuthLayout)
│   │   ├── pages/                       # Application route views
│   │   │   ├── admin/                   # Admin portal modules
│   │   │   ├── auth/                    # Login, OTP verification & Forgot password views
│   │   │   ├── student/                 # Student portal modules
│   │   │   └── teacher/                 # Teacher portal modules
│   │   ├── routes/                      # AppRoutes.jsx definition
│   │   ├── services/                    # Centralized Axios API service layer (api.js)
│   │   ├── utils/                       # Toast notifications, email masking, file helpers
│   │   ├── App.jsx                      # App root component
│   │   ├── index.css                    # Tailwind CSS configuration and theme tokens
│   │   └── main.jsx                     # Vite entry point
│   ├── package.json                     # NPM dependencies & scripts
│   ├── vite.config.js                   # Vite bundler configuration
│   └── .gitignore
│
├── .gitignore                           # Workspace git ignore rules
└── README.md                            # Project documentation
```

---

## ⚡ Getting Started (Local Setup)

### 1. Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Java Development Kit (JDK)** 17 or higher
- **PostgreSQL** 14 or higher
- **Maven** (optional, wrapper `./mvnw` is included)

---

### 2. Database Setup

1. Open **PostgreSQL / pgAdmin** and create an empty database:
   ```sql
   CREATE DATABASE educonnect_db;
   ```
2. Restore the database using the provided backup file [`database/EduConnectData.sql`](file:///c:/MCA/SEM_3/Project/EduConnect/database/EduConnectData.sql):
   - **Using pgAdmin**: Right-click `educonnect_db` > **Restore...** > Choose `EduConnectData.sql` > Click **Restore**.
   - **Using Command Line**:
     ```bash
     pg_restore -U postgres -d educonnect_db "database/EduConnectData.sql"
     ```

> **Note**: Spring Boot has `spring.jpa.hibernate.ddl-auto=update` configured, meaning tables can also be automatically created on startup from entity definitions.

---

### 3. Backend Setup & Run

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Verify credentials in [`backend/src/main/resources/application.properties`](file:///c:/MCA/SEM_3/Project/EduConnect/backend/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/educonnect_db
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_POSTGRES_PASSWORD
   ```
3. Run the Spring Boot application:
   ```bash
   # Windows
   mvnw.cmd spring-boot:run

   # Linux / macOS
   ./mvnw spring-boot:run
   ```
   The backend server will start on `http://localhost:8080`.

---

### 4. Frontend Setup & Run

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 Default Login Credentials

| Portal | Email / Identifier | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@educonnect.ac.in` | `admin123` |
| **Teacher** | Registered Faculty Email | Account Password |
| **Student** | Enrollment No / Student Email | Account Password / OTP |

---