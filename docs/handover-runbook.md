# EduConnect Operational Handover & Deployment Runbook

This document provides Windows-friendly instructions for configuring, deploying, running, and maintaining the **EduConnect** platform.

---

## 1. System Requirements & Prerequisites

- **Operating System**: Windows 10 / 11 or Windows Server 2019+
- **Java SE Development Kit (JDK)**: JDK 21 (64-bit)
- **Build Tool**: Apache Maven 3.9+ (bundled or installed)
- **Node.js Environment**: Node.js v18.x or v20.x LTS with npm v9+
- **Relational Database**: PostgreSQL 15 or 16
- **Database Backup Tool (Optional)**: `pg_dump` utility (included with PostgreSQL client tools)

---

## 2. PostgreSQL Database Setup & Configuration

1. **Create PostgreSQL User and Database**:
   Open `psql` or pgAdmin query tool as `postgres` superuser:
   ```sql
   CREATE USER educonnect WITH PASSWORD 'EduConnectSecure2026!';
   CREATE DATABASE educonnect_db OWNER educonnect;
   GRANT ALL PRIVILEGES ON DATABASE educonnect_db TO educonnect;
   ```

2. **Configure Spring Boot `application.properties`**:
   Location: `backend/src/main/resources/application.properties`
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/educonnect_db
   spring.datasource.username=educonnect
   spring.datasource.password=EduConnectSecure2026!
   spring.datasource.driver-class-name=org.postgresql.Driver

   # JPA / Hibernate configuration
   spring.jpa.hibernate.ddl-auto=validate
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

   # Flyway Database Migrations
   spring.flyway.enabled=true
   spring.flyway.baseline-on-migrate=true
   spring.flyway.locations=classpath:db/migration
   ```

3. **Database Migration Execution**:
   Flyway runs automatically on backend application startup. It applies migrations `V1__` through `V14__` to initialize tables, indices, and constraints.

---

## 3. Storage & File Upload Directories

The application requires durable directories for user avatars, assignment PDFs, study materials, and system backups.

1. **Create Storage Directories**:
   In PowerShell or Command Prompt at project root:
   ```cmd
   mkdir backend\uploads
   mkdir backend\uploads\assignments
   mkdir backend\uploads\materials
   mkdir backend\uploads\avatars
   mkdir backend\backups
   ```

2. **Configuration Settings**:
   Location: `backend/src/main/resources/application.properties`
   ```properties
   file.upload-dir=uploads
   file.backup-dir=backups
   ```

---

## 4. SMTP Email Capture Configuration

To support parent notification emails and assignment reminder emails, configure your SMTP server or local mail trap testing tool:

Location: `backend/src/main/resources/application.properties`
```properties
# SMTP Mailer Settings (e.g. Mailtrap / SendGrid / Local SMTP)
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=YOUR_SMTP_USERNAME
spring.mail.password=YOUR_SMTP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

## 5. Environment Secrets & Token Security

> [!CAUTION]
> Secret keys, database passwords, and private signing tokens **MUST NEVER** be hardcoded in production source control.

1. **JWT Secret Configuration**:
   ```properties
   jwt.secret=9a8f7e6d5c4b3a210987654321fedcba9a8f7e6d5c4b3a210987654321fedcba
   jwt.expiration=86400000
   ```
2. **Environment Variable Overrides**:
   You can override properties at runtime using environment variables:
   ```cmd
   set SPRING_DATASOURCE_PASSWORD=YourProductionSecretPassword!
   set JWT_SECRET=YourProduction256BitHexJwtSecretKeyHere!
   ```

---

## 6. Running the Backend Service (Java / Spring Boot)

1. **Build the Backend JAR**:
   ```cmd
   cd backend
   mvn clean package -DskipTests
   ```

2. **Run Spring Boot Application**:
   ```cmd
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
   Or run directly via Maven:
   ```cmd
   mvn spring-boot:run
   ```
   The backend API will start on `http://localhost:8080/api/v1`.

---

## 7. Running the Frontend Web Application (React / Vite)

1. **Install Dependencies & Build**:
   ```cmd
   cd frontend
   cmd /c npm install
   cmd /c npm run build
   ```

2. **Start Vite Development Server**:
   ```cmd
   cmd /c npm run dev
   ```
   The frontend application will be accessible at `http://localhost:5173`.

---

## 8. Database Backup & Prerequisite Troubleshooting

1. **Administrator-Triggered Backups**:
   Admin users can trigger full database dumps and upload directory backups via **System Settings** -> **Trigger Backup**.
2. **`pg_dump` PATH Requirement**:
   To enable PostgreSQL database dumps, ensure PostgreSQL `bin` directory is added to your Windows System `PATH`:
   - `C:\Program Files\PostgreSQL\16\bin`
3. **Missing Tool Behavior**:
   If `pg_dump` is not on the system PATH, the application gracefully logs an `UNAVAILABLE` status record without crashing.

---

## 9. Verification & Troubleshooting Checklist

- **API 401 Unauthorized**: Ensure `Authorization: Bearer <token>` header is passed on protected endpoints.
- **File Upload Errors**: Verify `backend/uploads` directory exists and has write permissions.
- **Port Conflicts**: If port 8080 or 5173 is in use, modify `server.port` in `application.properties` or `vite.config.js`.
