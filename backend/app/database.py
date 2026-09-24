"""
database.py
-----------
Creates the connection to the SQLite database file (campus.db) and gives
every request its own database session.

- engine   : the actual connection to campus.db
- SessionLocal : a factory that creates one session per request
- Base     : the parent class all our table models inherit from
- get_db() : FastAPI dependency, opens a session and always closes it
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# The database is a single file called campus.db in the backend folder.
SQLALCHEMY_DATABASE_URL = "sqlite:///./campus.db"

# check_same_thread=False is required for SQLite + FastAPI.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Give one database session to a request, then close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
