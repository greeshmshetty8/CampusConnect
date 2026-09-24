"""
helpers.py
----------
Small shared helper that turns an Event row into the JSON the frontend wants,
adding two calculated fields: how many students registered and seats left.
"""

from .models import Event


def event_to_dict(event: Event) -> dict:
    count = len(event.registrations)
    return {
        "id": event.id,
        "name": event.name,
        "description": event.description,
        "date": event.date,
        "time": event.time,
        "location": event.location,
        "category": event.category,
        "organizer": event.organizer,
        "max_capacity": event.max_capacity,
        "registered_count": count,
        "seats_left": max(event.max_capacity - count, 0),
    }
