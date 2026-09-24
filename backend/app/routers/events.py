"""
routers/events.py
-----------------
Event CRUD.

GET    /api/events          -> list events (search + category filter)
GET    /api/events/{id}     -> one event
POST   /api/events          -> create  (admin only)
PUT    /api/events/{id}     -> edit    (admin only)
DELETE /api/events/{id}     -> delete  (admin only)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..database import get_db
from ..helpers import event_to_dict
from ..models import Event
from ..schemas import EventCreate, EventOut

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventOut])
def list_events(search: str = "", category: str = "", db: Session = Depends(get_db)):
    query = db.query(Event)
    if category and category != "All":
        query = query.filter(Event.category == category)
    events = query.order_by(Event.date, Event.time).all()

    if search:
        needle = search.lower()
        events = [
            e
            for e in events
            if needle in e.name.lower()
            or needle in e.description.lower()
            or needle in e.location.lower()
        ]
    return [event_to_dict(e) for e in events]


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(404, "Event not found")
    return event_to_dict(event)


@router.post("", response_model=EventOut, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event_to_dict(event)


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(404, "Event not found")
    for field, value in payload.model_dump().items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event_to_dict(event)


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(404, "Event not found")
    db.delete(event)  # registrations are removed too (cascade)
    db.commit()
    return {"deleted": event_id}
