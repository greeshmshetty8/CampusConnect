"""
seed.py
-------
Fills the database with one admin, one student and eight sample events so the
project can be demonstrated immediately.

Run once (with the virtual environment active):

    python seed.py

Demo logins
    admin@college.edu   / admin123
    student@college.edu / student123
"""

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Event, User

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).count() == 0:
    db.add_all(
        [
            User(
                name="Admin User",
                email="admin@college.edu",
                password=hash_password("admin123"),
                role="admin",
            ),
            User(
                name="Demo Student",
                email="student@college.edu",
                password=hash_password("student123"),
                role="student",
            ),
        ]
    )

if db.query(Event).count() == 0:
    db.add_all(
        [
            Event(
                name="AI & Robotics Expo",
                description="Student projects in machine learning and robotics on display.",
                date="2026-03-12",
                time="10:00",
                location="Main Auditorium",
                category="Technical",
                organizer="Computer Science Department",
                max_capacity=120,
            ),
            Event(
                name="Annual Cultural Night",
                description="Music, dance and drama performances by all departments.",
                date="2026-03-20",
                time="18:00",
                location="Open Air Theatre",
                category="Cultural",
                organizer="Cultural Committee",
                max_capacity=300,
            ),
            Event(
                name="Inter-College Football Cup",
                description="Knockout football tournament between six colleges.",
                date="2026-03-25",
                time="08:30",
                location="Sports Ground",
                category="Sports",
                organizer="Sports Club",
                max_capacity=60,
            ),
            Event(
                name="Web Development Workshop",
                description="Hands-on session building a website with React.",
                date="2026-04-02",
                time="14:00",
                location="Lab 204",
                category="Workshop",
                organizer="Coding Club",
                max_capacity=40,
            ),
            Event(
                name="Career Guidance Seminar",
                description="Alumni talk about placements and higher studies.",
                date="2026-04-08",
                time="11:00",
                location="Seminar Hall B",
                category="Seminar",
                organizer="Placement Cell",
                max_capacity=150,
            ),
            Event(
                name="CodeSprint Hackathon",
                description="Six-hour coding competition with prizes.",
                date="2026-04-15",
                time="09:00",
                location="Computer Centre",
                category="Competition",
                organizer="Computer Science Department",
                max_capacity=80,
            ),
            Event(
                name="Photography Walk",
                description="Campus photography session with a guest photographer.",
                date="2026-04-18",
                time="16:00",
                location="Central Lawn",
                category="Cultural",
                organizer="Photography Club",
                max_capacity=35,
            ),
            Event(
                name="Cloud Computing Bootcamp",
                description="Introduction to deploying applications on the cloud.",
                date="2026-04-24",
                time="10:30",
                location="Lab 108",
                category="Workshop",
                organizer="IT Department",
                max_capacity=45,
            ),
        ]
    )

db.commit()
db.close()
print("Seed data inserted. Login as admin@college.edu / admin123")
