from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from ..models.user import User
from ..schemas.user import UserCreate, UserLogin
from ..utils.security import hash_password, verify_password, create_access_token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def signup(self, user_data: UserCreate) -> tuple[User, str]:
        """Register a new user and return the user with an access token."""
        # Check if email already exists
        existing_email = await self.db.execute(
            select(User).where(User.email == user_data.email)
        )
        if existing_email.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        # Check if username already exists
        existing_username = await self.db.execute(
            select(User).where(User.username == user_data.username)
        )
        if existing_username.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken",
            )

        # Create user
        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hash_password(user_data.password),
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        # Generate token
        token = create_access_token(user.id, user.email)
        return user, token

    async def login(self, login_data: UserLogin) -> tuple[User, str]:
        """Authenticate a user and return the user with an access token."""
        result = await self.db.execute(
            select(User).where(User.email == login_data.email)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token(user.id, user.email)
        return user, token

    async def get_current_user(self, user_id: UUID) -> User:
        """Get a user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user
