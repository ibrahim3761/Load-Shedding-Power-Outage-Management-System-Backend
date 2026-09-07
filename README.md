# ⚡ Load Shedding & Power Outage Management System — Backend

A backend service for managing planned load-shedding schedules and unexpected power outages across distribution areas. Customers can report outages and track restoration, technicians get assigned and update repair status, and admins manage areas, schedules, technicians, and premium subscriptions — all behind strict Bearer-token, role-based authentication.

🔗 **Live API:** [https://load-shedding-power-outage-manageme.vercel.app](https://load-shedding-power-outage-manageme.vercel.app)

## ✨ Features

- **Three roles**: `CUSTOMER`, `TECHNICIAN`, `ADMIN` (plus a `SUPER_ADMIN` seeded on first boot)
- **Auth**: email/password registration with OTP email verification, Google OAuth login, JWT access + refresh tokens (Bearer-token only), forgot/reset password flow
- **Areas**: admin-managed service areas (name, district, city) that outages and premium subscriptions are scoped to
- **Scheduled outages**: admin creates planned outages per area; public + authenticated views; auto status transitions (`UPCOMING → ONGOING → COMPLETED`)
- **Unexpected outages**: customers report outages, admins assign a technician, technician updates repair status through to resolution
- **Technicians**: public application flow with resume upload + email verification, admin approval/rejection, technician dashboard for assigned jobs
- **Premium subscriptions**: admin-defined packages, bKash payment integration, automatic expiry via a daily cron job
- **Analytics**: role-specific dashboards for admin, customer, and technician
- **Notifications**: email templates for registration, password reset, outage updates, technician approval, and premium alerts
- **Security**: Helmet, global + auth-specific rate limiting, strict Bearer-token middleware with role enforcement

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js, TypeScript |
| Framework | Express 5 |
| Database | PostgreSQL + Prisma ORM (multi-file schema) |
| Cache / OTP store | Redis |
| Auth | JWT (access + refresh), bcryptjs, Google OAuth |
| Email | Nodemailer + EJS templates |
| File uploads | Multer + Cloudinary |
| Payments | bKash |
| Scheduling | node-cron |
| Validation | Zod |
| Tooling | Biome (lint/format), tsx, tsup |

## 📂 Project Structure

```
prisma/
  schema/            → one .prisma file per model (User, Customer, Technician, Area,
                        ScheduledOutage, UnexpectedOutage, PremiumPackage, PremiumUser, Payment, enums)
  migrations/

src/
  app.ts             → Express app setup, middleware, route mounting
  server.ts           → server bootstrap
  app/
    config/           → env var loader
    lib/               → prisma, redis, nodemailer, cloudinary, bkash, cron, multer, googleAuth clients
    middleware/         → auth (Bearer + role check), request validation, error handling
    module/
      auth/             → register, verify-email, login, refresh-token, google, forgot/reset password
      user/             → profile, premium subscriptions, admin user management
      technician/       → application, approval, assignments, status updates
      area/             → CRUD for service areas
      scheduleOutage/    → planned outage CRUD + public views
      unexpectedOutage/  → customer reports, technician assignment
      premiumPackage/    → subscription package CRUD
      payment/           → bKash checkout + callback, payment history
      analytics/          → per-role dashboards
    templates/           → EJS email templates
    utils/                → error handling, response shape, seeding, status-update helpers
```

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/ibrahim3761/Load-Shedding-Power-Outage-Management-System-Backend.git
cd Load-Shedding-Power-Outage-Management-System-Backend
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (e.g. `1d`, `7d`) |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost |
| `FRONTEND_URL` | Allowed CORS origin |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `SUPER_ADMIN_NAME` / `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | Seeded on first boot |
| `TESTER_ADMIN_*` / `TESTER_TECHNICIAN_*` | Optional seeded test accounts |
| `REDIS_USER` / `REDIS_PASSWORD` / `REDIS_HOST` / `REDIS_PORT` | Redis connection (used for OTPs) |
| `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_SENDER` | Outgoing email (Nodemailer) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | File uploads (resumes, profile images) |
| `BKASH_BASE_URL` / `BKASH_USERNSME` / `BKASH_PASSWORD` / `BKASH_APP_KEY` / `BKASH_APP_SECRET` / `BKASH_CALLBACK_URL` | Payment gateway |

### 3. Database setup

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the server

```bash
npm run dev       # development, with hot reload
npm run build     # production build
npm start         # run the production build
```

The API is available at `http://localhost:5000` (or your configured `PORT`). A `SUPER_ADMIN` account is auto-seeded from your env vars on startup if one doesn't already exist.

## 🔐 Authentication

All protected routes use **strict Bearer-token authentication**:

```
Authorization: Bearer <accessToken>
```

- `POST /api/v1/auth/register` → sends an email OTP
- `POST /api/v1/auth/verify-email` → verifies OTP, creates the account, returns `accessToken` + `refreshToken`
- `POST /api/v1/auth/login` → email/password login
- `POST /api/v1/auth/google` → Google OAuth login/registration
- `POST /api/v1/auth/refresh-token` → exchange a refresh token for a new pair
- `GET /api/v1/auth/me` → current user profile (any authenticated role)
- `POST /api/v1/auth/forgot-password` / `POST /api/v1/auth/reset-password` → OTP-based password reset

Role-based access is enforced per-route via `auth(...roles)` middleware — e.g. `auth(Role.ADMIN, Role.SUPER_ADMIN)`.

## 📡 API Endpoints

Base URL: `https://load-shedding-power-outage-manageme.vercel.app/api/v1` (or `http://localhost:5000/api/v1` locally)

Public (unauthenticated) endpoints are prefixed `/public/...` within each module (e.g. `GET /scheduled-outage/public/all`). Everything else requires `Authorization: Bearer <accessToken>` and the listed role(s).

### Auth — `/auth`
| Method | Path | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/verify-email` | Public |
| POST | `/login` | Public |
| POST | `/google` | Public |
| POST | `/refresh-token` | Public |
| POST | `/forgot-password` | Public |
| POST | `/reset-password` | Public |
| GET | `/me` | Admin, Super Admin, Technician, Customer |

### User — `/user`
| Method | Path | Access |
|---|---|---|
| PATCH | `/update-my-profile` | Admin, Super Admin, Customer, Technician |
| PATCH | `/change-password` | Admin, Super Admin, Customer, Technician |
| PATCH | `/profile-image` | Admin, Super Admin, Customer, Technician |
| GET | `/my-premium` | Customer |
| GET | `/my-premium/:premiumUserId` | Customer |
| GET | `/all` | Admin, Super Admin |
| GET | `/premium-users` | Admin, Super Admin |
| GET | `/premium-users/:premiumUserId` | Admin, Super Admin |
| GET | `/:userId` | Admin, Super Admin |
| PATCH | `/:userId/status` | Admin, Super Admin |
| DELETE | `/:userId` | Admin, Super Admin |

### Technician — `/technician`
| Method | Path | Access |
|---|---|---|
| POST | `/apply-as-technician` | Public |
| POST | `/apply-as-technician/verify-email` | Public |
| GET | `/public/all-technicians` | Public |
| GET | `/public/:technicianId` | Public |
| POST | `/approve-technician` | Admin, Super Admin |
| GET | `/all-technicians` | Admin, Super Admin |
| PATCH | `/update-my-profile` | Technician |
| GET | `/my-assignments` | Technician |
| PATCH | `/:outageId/update-status` | Technician |

### Area — `/area`
| Method | Path | Access |
|---|---|---|
| GET | `/public/all` | Public |
| POST | `/create` | Admin, Super Admin |
| GET | `/all` | Admin, Super Admin |
| GET | `/:areaId` | Admin, Super Admin |
| PATCH | `/:areaId` | Admin, Super Admin |
| DELETE | `/:areaId` | Admin, Super Admin |

### Scheduled Outage — `/scheduled-outage`
| Method | Path | Access |
|---|---|---|
| GET | `/public/all` | Public |
| GET | `/public/area/:areaId` | Public |
| POST | `/create` | Admin, Super Admin |
| GET | `/all` | Admin, Super Admin |
| GET | `/:outageId` | Admin, Super Admin |
| PATCH | `/:outageId` | Admin, Super Admin |
| DELETE | `/:outageId` | Admin, Super Admin |

### Unexpected Outage — `/unexpected-outage`
| Method | Path | Access |
|---|---|---|
| GET | `/public/area/:areaId` | Public |
| POST | `/report` | Customer |
| GET | `/my-reports` | Customer |
| GET | `/all` | Admin, Super Admin |
| GET | `/:outageId` | Admin, Super Admin, Technician |
| PATCH | `/:outageId/assign` | Admin, Super Admin |
| DELETE | `/:outageId` | Admin, Super Admin |

### Premium Package — `/premium-package`
| Method | Path | Access |
|---|---|---|
| GET | `/public/all` | Public |
| GET | `/public/:packageId` | Public |
| POST | `/create` | Admin, Super Admin |
| GET | `/all` | Admin, Super Admin |
| GET | `/:packageId` | Admin, Super Admin |
| PATCH | `/:packageId` | Admin, Super Admin |
| DELETE | `/:packageId` | Admin, Super Admin |

### Payment — `/payment`
| Method | Path | Access |
|---|---|---|
| POST | `/buy-premium` | Customer |
| GET | `/callback` | Public (bKash redirect) |
| GET | `/my-payments` | Customer |
| GET | `/all` | Admin, Super Admin |
| GET | `/:paymentId` | Admin, Super Admin, Customer |

### Analytics — `/analytics`
| Method | Path | Access |
|---|---|---|
| GET | `/admin-analytics` | Admin, Super Admin |
| GET | `/customer-analytics` | Customer |
| GET | `/technician-analytics` | Technician |

**63 endpoints total across 9 modules.**

## ⏱️ Background Jobs

A daily cron job (`0 0 * * *`) checks for expired premium subscriptions and flips their status from `ACTIVE` to `EXPIRED`.

## 🗄️ Data Model Summary

```
User ──┬── Customer (1:1)
       ├── Technician (1:1)
       ├── UnexpectedOutage (reporter, 1:N)
       └── PremiumUser (subscriptions, 1:N)

Area ──┬── ScheduledOutage (1:N)
       ├── UnexpectedOutage (1:N)
       └── PremiumUser (1:N)

PremiumPackage ── PremiumUser (1:N) ── Payment (1:1)

Technician ── ScheduledOutage / UnexpectedOutage (assigned, 1:N)
```

## 🧪 Code Quality

```bash
npm run lint:check     # Biome lint
npm run format:check   # Biome format check
npm run lint:fix        # auto-fix lint issues
npm run format:fix      # auto-fix formatting
```

## 📄 License

ISC