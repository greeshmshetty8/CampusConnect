# Deploying CampusConnect

This guide walks through putting CampusConnect online with its own public
URL, using free tiers of Render (backend) and Vercel (frontend). Nothing
here depends on Lovable.

Live setup, once done:

```
Browser  -->  Vercel (React frontend)  -->  Render (FastAPI backend)  -->  SQLite file on Render
```

---

## A. Open the project in VS Code

1. Unzip the project folder if you haven't already.
2. Open VS Code → File → Open Folder → select the `campusconnect` folder.
   You should see `backend/` and `frontend/` side by side.

## B. Install frontend dependencies

```bash
cd frontend
npm install
```

## C. Install backend dependencies

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## D. Run the backend locally

Still inside `backend`, with the virtual environment active:

```bash
cp .env.example .env      # Windows: copy .env.example .env
python seed.py             # creates campus.db with demo users/events
uvicorn app.main:app --reload
```

The API is now at `http://127.0.0.1:8000` (interactive docs at `/docs`).
The `.env` you just created already has sensible local defaults, so you
don't need to edit it yet.

## E. Run the frontend locally

Open a **second terminal**:

```bash
cd frontend
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

Open `http://localhost:5173`. Log in with the demo accounts from the
README (`admin@college.edu` / `admin123`, `student@college.edu` /
`student123`) to confirm everything still works exactly as before.

## F. Upload the project to GitHub

1. Create a new empty repository on GitHub (no README/license, to avoid
   conflicts).
2. From the `campusconnect` folder:

```bash
git init
git add .
git commit -m "CampusConnect - ready for deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The `.gitignore` included in this project makes sure `.env`,
`campus.db`, `node_modules/`, and `venv/` are never pushed — good, since
`.env` is where your real secret lives.

## G. Deploy the backend to Render

1. Go to [render.com](https://render.com) → New → **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Click **Create Web Service**. Render will give you a URL like
   `https://campusconnect-backend.onrender.com`.

## H. Add Render environment variables

In the Render service → **Environment** tab, add:

| Key | Value |
|---|---|
| `SECRET_KEY` | a long random string (see comment in `backend/.env.example` for how to generate one) |
| `FRONTEND_URL` | `http://localhost:5173` for now — you'll update this in step K |

Save, which triggers a redeploy. Once it's live, run the seed step once so
the demo has data. Easiest way: Render's dashboard → your service → Shell,
then:

```bash
python seed.py
```

(If your Render plan doesn't have a Shell tab, you can temporarily add a
line calling the seed logic at startup, run it once, then remove it — or
upgrade to a plan with shell access.)

## I. Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
2. Import the same GitHub repo.
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Before deploying, add the environment variable from step J.
5. Deploy. Vercel gives you a URL like
   `https://campusconnect-xxxxx.vercel.app`.

## J. Add VITE_API_URL to Vercel

In the Vercel project → **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | your Render URL from step G, e.g. `https://campusconnect-backend.onrender.com` |

Redeploy the frontend after adding it (environment variables only apply to
new builds).

## K. Update FRONTEND_URL in Render with the final Vercel URL

Back in Render → **Environment**, update `FRONTEND_URL` to your real
Vercel URL from step I:

```
FRONTEND_URL=https://campusconnect-xxxxx.vercel.app
```

Save and let it redeploy. This is what allows the deployed frontend to
actually call the deployed backend (CORS).

## L. Test the complete application

Open your Vercel URL and repeat the testing checklist from the README:
register → login → browse events → search → filter → register for an
event → My Registrations → cancel → logout → log in as admin → add/edit/
delete an event → view registered students → check the stat cards.

---

## Known limitations

- **SQLite resets on redeploy.** Render's free tier disk isn't
  persistent across deploys, so `campus.db` (and anything typed into it)
  is wiped and needs `python seed.py` again after each redeploy. This is
  fine for a demo/college project; a real product would use a managed
  database like Postgres instead.
- **Render free tier sleeps.** After 15 minutes of no traffic, the
  backend spins down and the first request afterward can take ~30-50
  seconds while it wakes up. This is normal, not a bug in your code.
- **Admin sign-up code** (`CAMPUS2026`, in `backend/app/auth.py`) is
  still hardcoded, same as before — it's a project feature, not a
  deployment secret, so it wasn't changed. Change it in the source if you
  want a different code before presenting.
