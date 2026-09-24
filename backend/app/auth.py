"""
auth.py
-------
Everything about "who is this user".

- hash_password / verify_password : passwords are never stored as plain text
- create_token                    : makes a JWT the browser keeps in localStorage
- get_current_user                : reads the token from the Authorization
                                    header and returns the logged-in user
- require_admin                   : same, but refuses non-admin users
"""

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

# Loads variables from a local .env file (if one exists). Safe to call
# again even though main.py also calls it - it never overwrites a
# variable that is already set in the environment.
load_dotenv()

# Set SECRET_KEY in the environment for any real deployment. The fallback
# below only exists so the project still runs the first time, locally,
# before you've created a .env file.
SECRET_KEY = os.getenv("SECRET_KEY", "campusconnect-college-project-secret")
ALGORITHM = "HS256"
TOKEN_HOURS = 12

# Admin sign-up code. Students leave this blank.
ADMIN_CODE = "CAMPUS2026"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not logged in")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admins only")
    return user
