# CampusConnect — Campus Event Management System

React (Vite) + FastAPI + SQLite. A college mini-project.

## Folder structure

```
campusconnect/
├── backend/
│   ├── requirements.txt
│   ├── seed.py                 # sample admin, student and 8 events
│   ├── campus.db               # created automatically on first run
│   └── app/
│       ├── main.py             # FastAPI app, CORS, routers
│       ├── database.py         # SQLite connection + session
│       ├── models.py           # users / events / registrations tables
│       ├── schemas.py          # request + response shapes
│       ├── auth.py             # password hashing, JWT, admin check
│       ├── helpers.py          # event -> JSON with seat counts
│       └── routers/
│           ├── users.py         # /api/auth/register, /login, /me
│           ├── events.py        # /api/events CRUD
│           ├── registrations.py # register / cancel / my registrations
│           └── admin.py         # stats + students per event
└── frontend/
    ├── package.json, vite.config.js, index.html, .env
    └── src/
        ├── main.jsx, App.jsx, api.js, auth.jsx
        ├── components/ Navbar.jsx, EventCard.jsx
        └── pages/ Home, Login, Register, Events, EventDetails,
                    Dashboard, MyRegistrations, AdminDashboard
```

## System flow

Student clicks a button in React → `api.js` sends an HTTP request with the JWT
→ FastAPI route checks the token → SQLAlchemy reads/writes SQLite (`campus.db`)
→ FastAPI returns JSON → React updates the screen.

## Software needed

- Python 3.10+ (tick "Add Python to PATH" on Windows)
- Node.js 18+
- VS Code (extensions: Python, ES7 React snippets)

## Run the backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate     macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python seed.py                 # creates campus.db with sample data
uvicorn app.main:app --reload  # http://127.0.0.1:8000  (docs at /docs)
```

## Run the frontend (second terminal)

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

## Demo logins

- Admin: `admin@college.edu` / `admin123`
- Student: `student@college.edu` / `student123`
- Admin sign-up code (to create more admins): `CAMPUS2026`

## Testing checklist

Register → login → browse events → search "hack" → filter Sports → open an
event → register → My Registrations → cancel → logout → login as admin → add,
edit and delete an event → view registered students → check the three statistic
cards.

## Deploying to a public URL (free tier)

1. Push the project to GitHub.
2. Backend on Render: New → Web Service, root `backend`, build
   `pip install -r requirements.txt`, start
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Frontend on Netlify/Vercel: root `frontend`, build `npm run build`,
   publish `dist`, environment variable `VITE_API_URL=<your Render URL>`.
4. SQLite lives on the server disk; on free tiers it resets on redeploy, which
   is fine for a demo.

## Work split for 3 students

- Member 1 — Frontend/UI: pages, Navbar, EventCard, styling.
- Member 2 — Backend/API: FastAPI routers, auth, schemas.
- Member 3 — Database, Admin dashboard, integration and testing: models,
  seed data, admin endpoints/page, end-to-end testing and deployment.
