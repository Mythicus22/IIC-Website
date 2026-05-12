# IIC Website

A full-stack web platform for an Institution Innovation Council to present programs, events, team members, gallery updates, mentor information, and administrative content workflows. The application pairs a polished React experience with a secure Express API, MongoDB persistence, Cloudinary media uploads, JWT authentication, and realtime Socket.IO updates.

## Highlights

- Public website for Home, About, Events, Team, Gallery, FAQs, Mentor Network, Privacy Policy, Terms of Service, and Application Flow pages.
- Admin dashboard for managing events, team members, gallery entries, and image uploads.
- JWT-based authentication with invite-code based admin registration.
- Realtime updates for event creation, ticket claims, team changes, and gallery changes through Socket.IO.
- Cloudinary-backed image storage with upload size limits.
- Production-aware CORS configuration for both REST requests and WebSocket connections.
- Security middleware for HTTP headers, rate limiting, XSS protection, NoSQL sanitization, and HTTP parameter pollution protection.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Socket.IO Client |
| UI | CSS modules/stylesheets, Framer Motion, Lucide React, React Hot Toast |
| Maps | Leaflet, React Leaflet, OpenStreetMap Nominatim |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| Media | Cloudinary, Multer, Multer Storage Cloudinary |
| Security | Helmet, express-rate-limit, xss-clean, express-mongo-sanitize, hpp |

## Project Structure

```text
iic-website/
  backend/
    server.js
    src/
      config/          # Database, Cloudinary, CORS configuration
      controllers/     # API business logic
      middlewares/     # Auth and error middleware
      models/          # Mongoose models
      routes/          # Express route modules
      socket/          # Socket.IO setup
      validators/      # Admin payload validation
  frontend/
    src/
      components/      # Shared UI components
      context/         # Auth and Socket providers
      pages/           # Website and admin pages
      styles/          # Global styling
```

## Local Development

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start the backend

```bash
cd backend
npm run dev
```

The API will run at `http://localhost:5000/api`.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

The app will run at `http://localhost:5173`.

## API Overview

All backend routes are mounted under `/api`.

| Route | Description |
| --- | --- |
| `/api/auth` | Register and login users. |
| `/api/events` | List, create, update, delete, and claim event tickets. |
| `/api/team` | Manage and display team members. |
| `/api/gallery` | Manage and display gallery entries. |
| `/api/upload` | Admin-only image upload endpoint. |

Protected admin routes require an `Authorization: Bearer <token>` header.

## Realtime Events

The backend emits Socket.IO events after content changes so the frontend can update without a full refresh.

| Event | Purpose |
| --- | --- |
| `event_created` | A new event was added. |
| `event_updated` | Existing event details changed. |
| `event_deleted` | An event was removed. |
| `ticket_claimed` | Event seat availability changed. |
| `gallery_updated` | Gallery content changed. |
| `team_updated` | Team content changed. |

## Useful Scripts

### Backend

```bash
npm run dev     # Start Express with Node watch mode
npm start       # Start Express for production
```

### Frontend

```bash
npm run dev     # Start Vite development server
npm run build   # Create production build
npm run preview # Preview production build locally
npm run lint    # Run ESLint
```
## Useful Scripts

### Backend

```bash

