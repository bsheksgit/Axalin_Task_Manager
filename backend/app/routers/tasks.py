from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from ..database import get_db
from ..models.task import Task
from ..schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskDependencyCreate,
    TaskDependencyResponse,
)
from ..services.task_service import TaskService
from .auth import get_current_user_id

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("/", response_model=TaskListResponse)
async def list_tasks(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get all tasks for the current user."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    tasks = await service.get_user_tasks()

    task_responses = []
    for task in tasks:
        dep_responses = []
        for dep in task.dependencies:
            result = await db.execute(
                select(Task).where(Task.id == dep.depends_on_task_id)
            )
            dep_task = result.scalar_one_or_none()
            dep_responses.append(
                TaskDependencyResponse(
                    id=dep.id,
                    task_id=dep.task_id,
                    depends_on_task_id=dep.depends_on_task_id,
                    depends_on_task_title=dep_task.title if dep_task else None,
                    depends_on_task_status=dep_task.status if dep_task else None,
                )
            )

        task_responses.append(
            TaskResponse(
                id=task.id,
                title=task.title,
                description=task.description,
                status=task.status,
                user_id=task.user_id,
                created_at=task.created_at,
                updated_at=task.updated_at,
                dependencies=dep_responses,
            )
        )

    return TaskListResponse(tasks=task_responses, total=len(task_responses))


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Create a new task."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    task = await service.create_task(task_data)
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get a single task by ID."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    task = await service.get_task(task_id)

    dep_responses = []
    for dep in task.dependencies:
        result = await db.execute(
            select(Task).where(Task.id == dep.depends_on_task_id)
        )
        dep_task = result.scalar_one_or_none()
        dep_responses.append(
            TaskDependencyResponse(
                id=dep.id,
                task_id=dep.task_id,
                depends_on_task_id=dep.depends_on_task_id,
                depends_on_task_title=dep_task.title if dep_task else None,
                depends_on_task_status=dep_task.status if dep_task else None,
            )
        )

    response = TaskResponse.model_validate(task)
    response.dependencies = dep_responses
    return response


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Update a task (title, description, status)."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    task = await service.update_task(task_id, task_data)
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Delete a task."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    await service.delete_task(task_id)
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/dependencies", response_model=TaskDependencyResponse, status_code=201)
async def add_dependency(
    task_id: UUID,
    dep_data: TaskDependencyCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Add a dependency to a task."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    dependency = await service.add_dependency(task_id, dep_data)

    result = await db.execute(
        select(Task).where(Task.id == dep_data.depends_on_task_id)
    )
    dep_task = result.scalar_one_or_none()

    return TaskDependencyResponse(
        id=dependency.id,
        task_id=dependency.task_id,
        depends_on_task_id=dependency.depends_on_task_id,
        depends_on_task_title=dep_task.title if dep_task else None,
        depends_on_task_status=dep_task.status if dep_task else None,
    )


@router.delete("/{task_id}/dependencies/{dependency_id}")
async def remove_dependency(
    task_id: UUID,
    dependency_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Remove a dependency from a task."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    await service.remove_dependency(task_id, dependency_id)
    return {"message": "Dependency removed successfully"}


@router.get("/{task_id}/dependencies")
async def get_task_dependencies(
    task_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get all dependencies for a task."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    dependencies = await service.get_task_dependencies(task_id)

    dep_list = []
    for dep in dependencies:
        result = await db.execute(
            select(Task).where(Task.id == dep.depends_on_task_id)
        )
        dep_task = result.scalar_one_or_none()
        dep_list.append(
            {
                "id": str(dep.id),
                "task_id": str(dep.task_id),
                "depends_on_task_id": str(dep.depends_on_task_id),
                "depends_on_task_title": dep_task.title if dep_task else None,
                "depends_on_task_status": dep_task.status.value if dep_task else None,
            }
        )

    return {"dependencies": dep_list}


@router.get("/dependencies/all")
async def get_all_dependencies(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get all dependencies across all user's tasks."""
    user_id = await get_current_user_id(request)
    service = TaskService(db, user_id)
    dependencies = await service.get_all_dependencies()
    return {"dependencies": dependencies}
