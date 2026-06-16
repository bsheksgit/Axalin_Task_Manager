from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from ..database import get_db
from ..schemas.user import UserCreate, UserLogin, UserResponse, UserWithToken
from ..services.auth_service import AuthService
from ..utils.security import decode_access_token, get_token_from_cookie

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Cookie settings
COOKIE_MAX_AGE = 24 * 60 * 60  # 24 hours in seconds


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


async def get_current_user_id(request: Request) -> UUID:
    """Dependency to extract and validate the current user ID from the cookie."""
    cookie_header = request.headers.get("cookie")
    token = get_token_from_cookie(cookie_header)
    if not token:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_access_token(token)
    if not payload:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return UUID(payload["sub"])


@router.post("/signup", response_model=UserWithToken)
async def signup(
    user_data: UserCreate,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new user and set auth cookie."""
    user, token = await auth_service.signup(user_data)

    response.set_cookie(
        key="access_token",
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
        path="/",
    )

    return UserWithToken(
        user=UserResponse.model_validate(user),
        message="Signup successful",
    )


@router.post("/login", response_model=UserWithToken)
async def login(
    login_data: UserLogin,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Login and set auth cookie."""
    user, token = await auth_service.login(login_data)

    response.set_cookie(
        key="access_token",
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
        path="/",
    )

    return UserWithToken(
        user=UserResponse.model_validate(user),
        message="Login successful",
    )


@router.post("/logout")
async def logout(response: Response):
    """Logout by clearing the auth cookie."""
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get the current authenticated user."""
    user_id = await get_current_user_id(request)
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(user_id)
    return UserResponse.model_validate(user)
