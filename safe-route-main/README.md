# 🛡 Women Safe Route System

Safety-first navigation app built with Spring Boot + React.

## Quick Start

### 1. Database
```bash
mysql -u root -p < backend/src/main/resources/schema.sql
```

### 2. Backend
```bash
cd backend
# Edit src/main/resources/application.properties (DB credentials)
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## Test Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@saferoute.com | password123 | ADMIN |
| priya@test.com | password123 | USER |
| anjali@test.com | password123 | USER |

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| POST | /api/route/analyze | JWT | Analyze route safety |
| GET | /api/route/safe-zones | JWT | All safe zones |
| GET | /api/route/danger-zones | JWT | All danger zones |
| POST | /api/sos/trigger | JWT | Send SOS alert |
| POST | /api/incidents | JWT | Report incident |
| GET | /api/users/profile | JWT | User profile |
| POST | /api/users/contacts | JWT | Add emergency contact |

## Features
- 🗺 **Interactive Map** — OpenStreetMap with safe/danger zone overlays
- 🔍 **Route Safety Analysis** — Score 0–100 based on nearby zones
- 🚨 **One-tap SOS** — Sends alert with GPS to emergency contacts
- 📋 **Incident Reporting** — Community-driven hazard reporting
- 👥 **Emergency Contacts** — Manage trusted contacts for alerts
- 🔐 **JWT Auth** — Secure token-based authentication

## Tech Stack
- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate
- **Database:** MySQL 8
- **Frontend:** React 18, React-Leaflet, Zustand, Axios
- **Maps:** OpenStreetMap (free, no API key needed)
- **Auth:** JWT (jjwt 0.11.5)
