# IIC Website

A full-stack web platform for an Institution Innovation Council (IIC) — built to showcase programs, events, team members, gallery updates, mentor information, and administrative content workflows.

The application pairs a polished React frontend with a secure Express API, MongoDB persistence, Cloudinary media uploads, JWT authentication, and real-time Socket.IO updates.

---

## Features

### Public Website
- **Home** — Hero section, live stats, mission statement, upcoming events preview, leadership team preview, and a CTA linking to the student application form.
- **About** — Vision, mission, goals, journey timeline, and ecosystem benefits.
- **Events** — Searchable, filterable event listing with category and status filters, paginated in batches of 6, and real-time seat availability updates.
- **Team** — Searchable, filterable team directory with category and role filters.
- **Gallery** — Visual archive of IIC activities and milestones.
- **Mentor Network** — Overview of the mentorship ecosystem.
- **Application Flow** — Step-by-step guide for prospective applicants.
- **FAQs, Privacy Policy, Terms of Service** — Supporting informational pages.

### Admin Dashboard
- **Events** — Create new events with image upload, location autocomplete (OpenStreetMap Nominatim), date/time, seat count, and category.
- **Team** — Add team members with profile images. Optionally attach an email and password to create a login account for that member.
- **Gallery** — Upload and categorise gallery images.
- **Admin Management** — Grant or revoke admin dashboard access per team member. Granting access creates or updates their login account automatically.

### Authentication
- JWT-based login and registration.
- Role-based access control (`user` / `admin`).
- Default admin email configured via environment variable — no hardcoded credentials.
- Admin access can be granted to any team member directly from the dashboard.

### Real-time Updates
- Socket.IO events keep the frontend in sync without page refreshes.

### Security
- Helmet for HTTP security headers.
- Rate limiting on API routes.
- XSS protection and NoSQL injection sanitisation.
- HTTP parameter pollution prevention.
- Production-aware CORS configuration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v6, Axios |
| UI | CSS Modules, Framer Motion, Lucide React, React Hot Toast |
| Maps | Leaflet, React Leaflet, OpenStreetMap Nominatim |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| Media | Cloudinary, Multer, multer-storage-cloudinary |
| Security | Helmet, express-rate-limit, xss-clean, express-mongo-sanitize, hpp |

---

## Project Structure

```
iic-website/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/          # Database, Cloudinary, CORS configuration
│       ├── constants/       # Shared taxonomy (categories, roles)
│       ├── controllers/     # Route handler logic
│       ├── middlewares/     # Auth (protect, admin) and error handling
│       ├── models/          # Mongoose schemas (User, Event, TeamMember, GalleryItem, AdminAccess)
│       ├── routes/          # Express route modules
│       ├── services/        # Admin access service
│       ├── socket/          # Socket.IO initialisation and event emitters
│       └── validators/      # Request payload validation
└── frontend/
    └── src/
        ├── assets/          # Static images and icons
        ├── components/      # Shared UI components (Navbar, Footer, EventCard, TeamCard, etc.)
        ├── config/          # API base URL configuration
        ├── constants/       # Shared taxonomy (mirrors backend)
        ├── context/         # AuthContext and SocketContext providers
        ├── pages/           # Route-level page components
        └── styles/          # Global CSS variables and component styles
```

---

## Local Development

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in the required values in `backend/.env` (see [Environment Variables](#environment-variables) below).

### 3. Start the backend

```bash
cd backend
npm run dev
```

API available at `http://localhost:5000/api`.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

App available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs |
| `DEFAULT_ADMIN_EMAILS` | ✅ | Comma-separated list of emails that always have admin access |
| `CLIENT_URL` | ✅ | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `PORT` | ➖ | Server port (default: `5000`) |
| `NODE_ENV` | ➖ | `development` or `production` |
| `CORS_ORIGINS` | ➖ | Additional allowed origins (comma-separated) |
| `MONGO_TIMEOUT_MS` | ➖ | MongoDB connection timeout in milliseconds |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ➖ | Backend API base URL (e.g. `https://your-api.com/api`). Falls back to `/api` for same-origin deployments. |
| `VITE_SOCKET_URL` | ➖ | Backend Socket.IO URL (e.g. `https://your-api.com`). Falls back to same origin. |

---

## API Reference

All routes are mounted under `/api`.

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/auth/admins` | Admin | List all admin emails |
| `POST` | `/auth/admins` | Admin | Grant admin access (creates or updates account) |
| `DELETE` | `/auth/admins` | Admin | Revoke admin access |
| `GET` | `/events` | Public | List all events |
| `POST` | `/events` | Admin | Create a new event |
| `PUT` | `/events/:id` | Admin | Update an event |
| `DELETE` | `/events/:id` | Admin | Delete an event |
| `POST` | `/events/:id/claim` | User | Claim a ticket for an event |
| `GET` | `/team` | Public | List all team members |
| `POST` | `/team` | Admin | Add a team member |
| `PUT` | `/team/:id` | Admin | Update a team member |
| `DELETE` | `/team/:id` | Admin | Remove a team member |
| `GET` | `/gallery` | Public | List all gallery items |
| `POST` | `/gallery` | Admin | Add a gallery item |
| `DELETE` | `/gallery/:id` | Admin | Remove a gallery item |
| `POST` | `/upload` | Admin | Upload an image to Cloudinary |
| `GET` | `/health` | Public | Health check endpoint |

---

## Real-time Events (Socket.IO)

The backend emits the following events after content changes so connected clients update instantly.

| Event | Payload | Description |
|---|---|---|
| `event_created` | Event object | A new event was published |
| `event_updated` | Event object | An existing event was modified |
| `event_deleted` | `{ eventId }` | An event was removed |
| `ticket_claimed` | `{ eventId, remainingSeats }` | A ticket was claimed; seat count updated |
| `gallery_updated` | — | Gallery content changed |
| `team_updated` | — | Team roster changed |

---

## Scripts

### Backend

```bash
npm run dev    # Start with Node watch mode (development)
npm start      # Start for production
```

### Frontend

```bash
npm run dev      # Start Vite development server
npm run build    # Create optimised production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## Deployment

Deploy the backend and frontend as separate services, or use a reverse proxy to route `/api` to Express and all other paths to the Vite build output.

### Backend service

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check | `GET /api/health` |

Required environment variables: `MONGO_URI`, `JWT_SECRET`, `DEFAULT_ADMIN_EMAILS`, `CLIENT_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Frontend service

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

Set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend service URL when deploying as separate services. Omit both for single-domain reverse-proxy deployments.

---

## Admin Access

Admin access is email-based — no invite codes required.

- Emails listed in `DEFAULT_ADMIN_EMAILS` are permanently recognised as admins on login.
- Additional admins can be granted or revoked at any time from the **Admin Dashboard → Manage Team** section.
- Granting access to a team member with no existing account will create one using the name and password entered in the dashboard.
- Granting access to a team member who already has an account will update their role (and password if one is provided).
- Admin status is never exposed on the public-facing Team page.
