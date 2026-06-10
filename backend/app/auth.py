from datetime import datetime, timedelta, timezone
import hashlib
from typing import Annotated

from fastapi import Depends, HTTPException, status, Cookie
from jose import JWTError, jwt
from passlib.context import CryptContext
from authlib.integrations.starlette_client import OAuth

from .config import settings

# --- Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # No longer needed for cookie-based auth

# --- OAuth Client ---
oauth = OAuth()
oauth.register(
    name="linuxdo",
    client_id=settings.LINUXDO_CLIENT_ID,
    client_secret=settings.LINUXDO_CLIENT_SECRET,
    access_token_url="https://connect.linux.do/oauth2/token",
    authorize_url="https://connect.linux.do/oauth2/authorize",
    api_base_url="https://connect.linux.do/",
    client_kwargs={"scope": settings.LINUXDO_SCOPE},
)

# --- Models ---
class TokenData(object):
    username: str | None = None
    trust_level: int | None = 0

# --- Core Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def normalize_simple_username(username: str | None) -> str:
    username = (username or "").strip()
    if not username:
        raise ValueError("username is required")
    if len(username) > 32:
        raise ValueError("username must be 1-32 characters")
    if username in {".", ".."}:
        raise ValueError("username contains unsafe characters")

    dangerous_chars = set('/\\:*?"<>|')
    if any(ch in dangerous_chars or ord(ch) < 32 or ord(ch) == 127 for ch in username):
        raise ValueError("username contains unsafe characters")
    return username

def stable_user_id_from_username(username: str) -> int:
    digest = hashlib.sha256(username.encode("utf-8")).digest()
    user_id = int.from_bytes(digest[:8], "big") & 0x7FFFFFFF
    return user_id or 1

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """Decodes the access token and returns the payload."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise credentials_exception

# --- FastAPI Dependencies ---
async def get_current_user(token: Annotated[str | None, Cookie()] = None):
    """
    Decodes JWT from cookie and returns user info.
    Raises HTTP 401 if token is missing, invalid, or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # The JWT payload contains the user info from OAuth
        user = {
            "username": username,
            "trust_level": payload.get("trust_level", 0),
            "id": payload.get("id"),
            "name": payload.get("name"),
        }
    except JWTError:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[dict, Depends(get_current_user)]
):
    # In a real app, you might check if the user is active
    return current_user
