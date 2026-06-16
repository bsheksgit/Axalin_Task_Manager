from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from ..models.task import TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None


class TaskDependencyCreate(BaseModel):
    depends_on_task_id: UUID


class TaskDependencyResponse(BaseModel):
    id: UUID
    task_id: UUID
    depends_on_task_id: UUID
    depends_on_task_title: Optional[str] = None
    depends_on_task_status: Optional[TaskStatus] = None

    model_config = {"from_attributes": True}


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    status: TaskStatus
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    dependencies: list[TaskDependencyResponse] = []

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
