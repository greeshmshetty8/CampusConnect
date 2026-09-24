"""
routers/users.py
----------------
Auth endpoints.

POST /api/auth/register  -> create an account, return a token
POST /api/auth/login     -> check email + password, return a token
GET  /api/auth/me        -> details of the logged-in user (used by the profile)

Logout is done in the browser by deleting the saved token, so there is no
logout endpoint.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import (
    ADMIN_CODE,
    create_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..models import User
from ..schemas import TokenOut, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(400, "An account with this email already exists")

    if len(payload.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    # Only somebody who knows the staff code becomes an admin.
    role = "admin" if payload.admin_code == ADMIN_CODE else "student"
    if payload.admin_code and role != "admin":
        raise HTTPException(400, "Invalid admin code")

    user = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"access_token": create_token(user), "user": user}


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password):
        raise HTTPException(401, "Wrong email or password")
    return {"access_token": create_token(user), "user": user}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
