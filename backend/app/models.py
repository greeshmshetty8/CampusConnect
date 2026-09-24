"""
models.py
---------
The database tables, written as Python classes (SQLAlchemy models).

Tables
  users         : id, name, email, password (hashed), role
  events        : id, name, description, date, time, location, category,
                  organizer, max_capacity
  registrations : id, user_id, event_id, registered_at

Relationships
  one user  -> many registrations
  one event -> many registrations
  A student can register for the same event only once (UniqueConstraint).
"""

from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # stored hashed, never plain
    role = Column(String(20), nullable=False, default="student")  # student / admin

    registrations = relationship(
        "Registration", back_populates="user", cascade="all, delete-orphan"
    )


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False, default="")
    date = Column(String(10), nullable=False)   # "2026-03-15"
    time = Column(String(5), nullable=False)    # "14:30"
    location = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    organizer = Column(String(150), nullable=False)
    max_capacity = Column(Integer, nullable=False, default=50)

    registrations = relationship(
        "Registration", back_populates="event", cascade="all, delete-orphan"
    )


class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (UniqueConstraint("user_id", "event_id", name="uq_user_event"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
