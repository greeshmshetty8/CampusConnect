"""
schemas.py
----------
Pydantic models = the shape of the JSON that goes in and out of the API.
FastAPI uses them to validate requests and to document the API automatically.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


# ---------- users ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    admin_code: Optional[str] = None  # only staff know this


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- events ----------
class EventBase(BaseModel):
    name: str
    description: str = ""
    date: str            # YYYY-MM-DD
    time: str            # HH:MM
    location: str
    category: str
    organizer: str
    max_capacity: int


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int
    registered_count: int = 0
    seats_left: int = 0

    class Config:
        from_attributes = True


# ---------- registrations ----------
class RegistrationOut(BaseModel):
    id: int
    registered_at: datetime
    event: EventOut

    class Config:
        from_attributes = True


class StudentOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    registered_at: datetime


class EventRegistrations(BaseModel):
    event: EventOut
    students: List[StudentOut]


class StatsOut(BaseModel):
    total_events: int
    total_students: int
    total_registrations: int
