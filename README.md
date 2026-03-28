# Life Flow

Life Flow is a MERN blood bank management system for donors, hospitals, organizations, and admins. It covers donor onboarding, blood inventory tracking, hospital blood requests, donation schedules, donation camps, notifications, analytics, and an authenticated AI assistant that answers questions from application data.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Redux Toolkit, React Router, Axios
- Authentication: JWT stored in `sessionStorage`
- Payments: Razorpay
- AI: Google Gemini via `@google/genai`

## Core Capabilities

- Donor registration and role-specific login flows
- Admin-created hospital and organization accounts
- Organization blood inventory management
- Hospital blood requests with cash or Razorpay payment flow
- Donation scheduling between donors and organizations
- Donation camp creation, participation, and notifications
- Role-aware analytics dashboards
- Authenticated AI assistant endpoint backed by live app context

## Role Summary

### Donor

- Register and sign in
- Schedule donations with organizations
- Join donation camps
- View profile and notifications

### Hospital

- Sign in through the hospital login flow
- Request blood from organizations
- Pay through Razorpay or mark requests as cash
- Review inventory availability and request history

### Organization

- Sign in through the organization login flow
- Manage blood inventory
- Review and respond to hospital requests
- Manage donation schedules and camps

### Admin

- Sign in through the admin login flow
- Create hospital and organization accounts
- View donor, hospital, and organization lists
- Review analytics and platform activity

## Repository Layout

```text
Life Flow/
|-- client/                  # React frontend
|-- config/                  # Database connection
|-- controllers/             # Route handlers
|-- middlewares/             # Auth and admin middleware
|-- models/                  # Mongoose schemas
|-- routes/                  # API route definitions
|-- scripts/                 # Utility scripts
|-- services/                # AI service logic
|-- utils/                   # Shared helpers
|-- server.js                # Backend entry point
`-- README.md
```

## Environment Variables

Create a root `.env` file for the backend:

```env
PORT=8080
DEV_MODE=development
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Create `client/.env` for the frontend:

```env
REACT_APP_BASEURL=http://localhost:8080/api/v1
```

## Installation

Install backend dependencies from the project root:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

## Run Locally

From the project root:

```bash
npm run dev
```

This starts:

- The Express API with `nodemon`
- The React client with `react-scripts`

Individual scripts:

```bash
npm run server
npm run client
npm run create-admin
```

Frontend-only scripts from `client/`:

```bash
npm start
npm run build
npm test
```

## Default Local URLs

- Frontend: `http://localhost:3000`
- API base: `http://localhost:8080/api/v1`
- Donor login: `http://localhost:3000/donor-login`
- Hospital login: `http://localhost:3000/hospital-login`
- Organization login: `http://localhost:3000/organization-login`
- Admin login: `http://localhost:3000/admin-login`

## Create an Admin Account

Use the helper script from the project root:

```bash
npm run create-admin -- --name "Admin Name" --email "admin@example.com" --password "yourPassword" --phone "9876543210"
```

`--phone` is optional.

## API Overview

Base path:

```text
/api/v1
```

### Test

- `GET /test`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/donor-login`
- `POST /auth/hospital-login`
- `POST /auth/organization-login`
- `POST /auth/admin-login`
- `GET /auth/current-user`
- `GET /auth/user-by-email`
- `PUT /auth/update-profile`

### Inventory

- `POST /inventory/create-razorpay-order`
- `POST /inventory/create-inventory`
- `GET /inventory/get-inventory`
- `GET /inventory/get-recent-inventory`
- `POST /inventory/get-inventory-hospital`
- `GET /inventory/get-donors`
- `GET /inventory/get-hospitals`
- `GET /inventory/get-orgnaisation`
- `GET /inventory/get-orgnaisation-for-hospital`
- `GET /inventory/organisation-inventory/:organisationId`
- `GET /inventory/organisation-requests`
- `PUT /inventory/organisation-requests/:requestId`

### Schedule

- `POST /schedule/donation`
- `GET /schedule/donation`
- `PUT /schedule/donation/:id/status`
- `POST /schedule/camp`
- `GET /schedule/camp`
- `POST /schedule/camp/:id/participate`
- `GET /schedule/notifications`
- `PUT /schedule/notifications/:id/read`

### Analytics

- `GET /analytics/bloodGroups-data`

### Admin

- `GET /admin/donor-list`
- `GET /admin/hospital-list`
- `GET /admin/org-list`
- `POST /admin/create-hospital`
- `POST /admin/create-organization`
- `DELETE /admin/delete-donor/:id`

### AI

- `POST /ai/assistant`

## Notes

- Public registration is donor-only.
- Hospital and organization accounts are created by admins.
- The frontend reads its API base URL from `REACT_APP_BASEURL`.
- The AI assistant requires `GEMINI_API_KEY`; `GEMINI_MODEL` is optional.
- Payment flows require valid Razorpay credentials in the backend `.env`.
