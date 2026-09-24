"""
routers/registrations.py
------------------------
What a logged-in student can do with their own registrations.

POST   /api/registrations/{event_id}  -> register for an event
DELETE /api/registrations/{event_id}  -> cancel that registration
GET    /api/registrations/me          -> "My Registrations" list
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..helpers import event_to_dict
from ..models import Event, Registration, User

router = APIRouter(prefix="/api/registrations", tags=["registrations"])


@router.get("/me")
def my_registrations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(Registration)
        .filter(Registration.user_id == user.id)
        .order_by(Registration.registered_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "registered_at": r.registered_at,
            "event": event_to_dict(r.event),
        }
        for r in rows
    ]


@router.post("/{event_id}", status_code=201)
def register_for_event(
    event_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(404, "Event not found")

    already = (
        db.query(Registration)
        .filter(Registration.user_id == user.id, Registration.event_id == event_id)
        .first()
    )
    if already:
        raise HTTPException(400, "You are already registered for this event")

    if len(event.registrations) >= event.max_capacity:
        raise HTTPException(400, "This event is full")

    registration = Registration(user_id=user.id, event_id=event_id)
    db.add(registration)
    db.commit()
    return {"registered": True, "event_id": event_id}


@router.delete("/{event_id}")
def cancel_registration(
    event_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    registration = (
        db.query(Registration)
        .filter(Registration.user_id == user.id, Registration.event_id == event_id)
        .first()
    )
    if registration is None:
        raise HTTPException(404, "You are not registered for this event")
    db.delete(registration)
    db.commit()
    return {"cancelled": True, "event_id": event_id}
