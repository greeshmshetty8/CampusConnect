"""
routers/admin.py
----------------
Admin-only reporting endpoints.

GET /api/admin/stats                 -> totals for the dashboard cards
GET /api/admin/events/{id}/students  -> who registered for one event
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..database import get_db
from ..helpers import event_to_dict
from ..models import Event, Registration, User
from ..schemas import StatsOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    return {
        "total_events": db.query(Event).count(),
        "total_students": db.query(User).filter(User.role == "student").count(),
        "total_registrations": db.query(Registration).count(),
    }


@router.get("/events/{event_id}/students")
def students_for_event(event_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(404, "Event not found")
    return {
        "event": event_to_dict(event),
        "students": [
            {
                "id": r.user.id,
                "name": r.user.name,
                "email": r.user.email,
                "registered_at": r.registered_at,
            }
            for r in event.registrations
        ],
    }
