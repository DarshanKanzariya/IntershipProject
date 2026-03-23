# Life Flow

Life Flow is a MERN blood bank management system with role-based access for donors, hospitals, organizations, and admins. It supports donor registration, hospital blood requests, organization approval flows, donation schedules, donation camps, notifications, analytics, and admin-controlled account creation for hospitals and organizations.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Redux Toolkit, React Router, Axios
- Auth: JWT-based session handling
- Payments: Razorpay Checkout for hospital digital payments

## Main Features

- Donor registration and donor login
- Dedicated login routes for donor, hospital, organization, and admin
- Admin-only creation of hospital and organization accounts
- Blood inventory management for organizations
- Hospital blood requests with Razorpay or cash payment workflow
- Automatic admin commission calculation on approved hospital requests
- Donation scheduling between donors and organizations
- Donation camp creation by organizations
- Donation camp participation by donors
- Notifications for camp activity and donation updates
- Analytics for organizations, hospitals, and admins

## Roles

## Login

- Donor Login: http://localhost:3000/donor-login
- Hospital Login: http://localhost:3000/hospital-login
- Organization Login: http://localhost:3000/organization-login

### Donor

- Register and log in
- View donation information
- Schedule donations with organizations
- Participate in donation camps

### Hospital

- Log in through dedicated route
- Request blood from organizations
- Pay for blood requests with Razorpay Checkout or mark the request as cash
- Track request status and received blood
- View organization blood availability and analytics

### Organization

- Log in through dedicated route
- Manage inventory
- Accept or decline hospital blood requests
- Review donor schedules and donation camp activity
- Create and manage donation camps

### Admin

- Log in through dedicated route
- Create hospital accounts
- Create organization accounts
- View donor, hospital, and organization lists
- View analytics and commission summary

## Project Structure

```text
Life Flow/
|-- client/                  # React frontend
|-- config/                  # DB connection
|-- controllers/             # Express controllers
|-- middlewares/             # Auth/admin middlewares
|-- models/                  # Mongoose models
|-- routes/                  # API routes
|-- scripts/                 # Utility scripts like admin creation
|-- server.js                # Backend entry point
`-- README.md
```

## Environment Variables

Create a `.env` file in the project root for the backend:

```env
PORT=8080
DEV_MODE=development
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_or_live_key
RAZORPAY_KEY_SECRET=your_razorpay_test_or_live_secret
```

Create a `.env` file inside `client/` for the frontend:

```env
REACT_APP_BASEURL=http://localhost:8080/api/v1
```

## Installation

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

## Running Locally

From the project root:

```bash
npm run dev
```

This starts:

- Express backend with `nodemon`
- React frontend with `react-scripts`

## Available Scripts

From the root:

```bash
npm run server
npm run client
npm run dev
npm run create-admin
```

From `client/`:

```bash
npm start
npm run build
npm test
```

## Create Admin Account

Use the helper script from the root:

```bash
npm run create-admin -- --name "Admin Name" --email "admin@example.com" --password "yourPassword" --phone "9876543210"
```

## API Overview

Base URL:

```text
/api/v1
```

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

### Admin

- `GET /admin/donor-list`
- `GET /admin/hospital-list`
- `GET /admin/org-list`
- `POST /admin/create-hospital`
- `POST /admin/create-organization`
- `DELETE /admin/delete-donor/:id`

### Analytics

- `GET /analytics/bloodGroups-data`

## Current Workflow Notes

- Public registration is donor-only.
- Hospital and organization accounts are created by admin.
- Hospital blood requests are submitted to organizations and must be accepted or declined.
- Razorpay orders are created on the backend and verified before a paid hospital request is stored.
- Hospital users no longer manage donation camps.
- Admin commission is calculated automatically for approved hospital requests.

## Build

Frontend production build:

```bash
cd client
npm run build
```

## Notes

- Authentication token is stored in `sessionStorage`.
- Frontend API requests use `REACT_APP_BASEURL`.
- Some existing React hook lint warnings may still appear in unrelated pages during frontend build.
