"""
main.py
-------
The FastAPI application itself. Run it with:

    uvicorn app.main:app --reload

What happens here:
1. All tables are created in campus.db if they do not exist yet.
2. CORS is enabled so the React app (port 5173) may call this API (port 8000).
3. The four routers (auth, events, registrations, admin) are plugged in.

Interactive API documentation: http://127.0.0.1:8000/docs
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import admin, events, registrations, users

# Loads variables from a local .env file (if one exists) into the
# environment. On Render, real environment variables are already set, so
# this simply does nothing there.
load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusConnect API", version="1.0.0")

# The React app's URL(s) that are allowed to call this API.
# Set FRONTEND_URL in the environment; use a comma to allow more than one
# (e.g. your local dev URL AND your deployed Vercel URL at the same time).
# Falls back to the local Vite dev server so nothing breaks if it's unset.
FRONTEND_URLS = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[url.strip() for url in FRONTEND_URLS],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(events.router)
app.include_router(registrations.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    """Quick check that the backend is alive."""
    return {"status": "ok"}
