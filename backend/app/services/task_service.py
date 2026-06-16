from uuid import UUID
from typing import Optional
from collections import deque

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from ..models.task import Task, TaskDependency, TaskStatus
from ..schemas.task import TaskCreate, TaskUpdate, TaskDependencyCreate


class TaskService:
    def __init__(self, db: AsyncSession, user_id: UUID):
        self.db = db
        self.user_id = user_id

    async def create_task(self, task_data: TaskCreate) -> Task:
        """Create a new task for the current user."""
        task = Task(
            title=task_data.title,
            description=task_data.description,
            user_id=self.user_id,
        )
        self.db.add(task)
        await self.db.flush()
        await self.db.refresh(task)
        return task

    async def get_user_tasks(self) -> list[Task]:
        """Get all tasks for the current user."""
        result = await self.db.execute(
            select(Task)
            .where(Task.user_id == self.user_id)
            .order_by(Task.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_task(self, task_id: UUID) -> Task:
        """Get a single task by ID, ensuring it belongs to the user."""
        task = await self._get_user_task(task_id)
        return task

    async def update_task(self, task_id: UUID, task_data: TaskUpdate) -> Task:
        """Update a task. If setting status to completed, check dependencies."""
        task = await self._get_user_task(task_id)

        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.status is not None:
            # If trying to mark as completed, check dependencies
            if task_data.status == TaskStatus.COMPLETED:
                await self._check_dependencies_completed(task)
            task.status = task_data.status

        await self.db.flush()
        await self.db.refresh(task)
        return task

    async def delete_task(self, task_id: UUID) -> None:
        """Delete a task. First check if other tasks depend on it."""
        task = await self._get_user_task(task_id)

        # Check if any tasks depend on this one
        dep_check = await self.db.execute(
            select(TaskDependency).where(
                TaskDependency.depends_on_task_id == task_id
            )
        )
        dependents = dep_check.scalars().all()
        if dependents:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete task: other tasks depend on it. Remove dependencies first.",
            )

        await self.db.delete(task)
        await self.db.flush()

    async def add_dependency(
        self, task_id: UUID, dep_data: TaskDependencyCreate
    ) -> TaskDependency:
        """Add a dependency (task_id depends on depends_on_task_id)."""
        task = await self._get_user_task(task_id)
        dep_task = await self._get_user_task(dep_data.depends_on_task_id)

        # Prevent self-dependency
        if task_id == dep_data.depends_on_task_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A task cannot depend on itself",
            )

        # Check for duplicate dependency
        existing = await self.db.execute(
            select(TaskDependency).where(
                and_(
                    TaskDependency.task_id == task_id,
                    TaskDependency.depends_on_task_id == dep_data.depends_on_task_id,
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This dependency already exists",
            )

        # Check for circular dependency using BFS
        if await self._would_create_circular_dependency(
            task_id, dep_data.depends_on_task_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Adding this dependency would create a circular dependency chain",
            )

        dependency = TaskDependency(
            task_id=task_id,
            depends_on_task_id=dep_data.depends_on_task_id,
        )
        self.db.add(dependency)
        await self.db.flush()
        await self.db.refresh(dependency)

        # Update task status to blocked if dependency is not completed
        dep_task = await self._get_user_task(dep_data.depends_on_task_id)
        if dep_task.status != TaskStatus.COMPLETED and task.status == TaskStatus.PENDING:
            task.status = TaskStatus.BLOCKED
            await self.db.flush()

        return dependency

    async def remove_dependency(self, task_id: UUID, dependency_id: UUID) -> None:
        """Remove a dependency from a task."""
        task = await self._get_user_task(task_id)

        result = await self.db.execute(
            select(TaskDependency).where(
                and_(
                    TaskDependency.id == dependency_id,
                    TaskDependency.task_id == task_id,
                )
            )
        )
        dependency = result.scalar_one_or_none()
        if not dependency:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dependency not found",
            )

        await self.db.delete(dependency)
        await self.db.flush()

        # Re-evaluate task status
        await self._re_evaluate_task_status(task)

    async def get_task_dependencies(self, task_id: UUID) -> list[TaskDependency]:
        """Get all dependencies for a task."""
        task = await self._get_user_task(task_id)
        return task.dependencies

    async def get_all_dependencies(self) -> list[dict]:
        """Get all dependencies across all user's tasks with task titles."""
        result = await self.db.execute(
            select(TaskDependency)
            .join(Task, TaskDependency.task_id == Task.id)
            .where(Task.user_id == self.user_id)
        )
        dependencies = result.scalars().all()

        dep_list = []
        for dep in dependencies:
            # Get the task title
            task_result = await self.db.execute(
                select(Task.title, Task.status).where(Task.id == dep.task_id)
            )
            task_row = task_result.one()

            dep_task_result = await self.db.execute(
                select(Task.title, Task.status).where(
                    Task.id == dep.depends_on_task_id
                )
            )
            dep_task_row = dep_task_result.one()

            dep_list.append(
                {
                    "id": str(dep.id),
                    "task_id": str(dep.task_id),
                    "task_title": task_row.title,
                    "task_status": task_row.status.value,
                    "depends_on_task_id": str(dep.depends_on_task_id),
                    "depends_on_task_title": dep_task_row.title,
                    "depends_on_task_status": dep_task_row.status.value,
                }
            )

        return dep_list

    async def _get_user_task(self, task_id: UUID) -> Task:
        """Get a task and verify it belongs to the current user."""
        result = await self.db.execute(
            select(Task).where(
                and_(Task.id == task_id, Task.user_id == self.user_id)
            )
        )
        task = result.scalar_one_or_none()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
        return task

    async def _check_dependencies_completed(self, task: Task) -> None:
        """Check if all dependencies of a task are completed."""
        if not task.dependencies:
            return

        for dep in task.dependencies:
            dep_task_result = await self.db.execute(
                select(Task).where(Task.id == dep.depends_on_task_id)
            )
            dep_task = dep_task_result.scalar_one_or_none()
            if dep_task and dep_task.status != TaskStatus.COMPLETED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Cannot mark task as completed. "
                        f"Dependency '{dep_task.title}' is not completed yet."
                    ),
                )

    async def _would_create_circular_dependency(
        self, task_id: UUID, depends_on_task_id: UUID
    ) -> bool:
        """
        Check if adding a dependency (task_id depends on depends_on_task_id)
        would create a circular dependency.
        Uses BFS to traverse the dependency graph.
        """
        visited = set()
        queue = deque([depends_on_task_id])

        while queue:
            current_id = queue.popleft()
            if current_id == task_id:
                return True
            if current_id in visited:
                continue
            visited.add(current_id)

            # Get all tasks that current_id depends on
            result = await self.db.execute(
                select(TaskDependency).where(
                    TaskDependency.task_id == current_id
                )
            )
            deps = result.scalars().all()
            for dep in deps:
                if dep.depends_on_task_id not in visited:
                    queue.append(dep.depends_on_task_id)

        return False

    async def _re_evaluate_task_status(self, task: Task) -> None:
        """Re-evaluate and update task status based on dependencies."""
        if not task.dependencies:
            if task.status == TaskStatus.BLOCKED:
                task.status = TaskStatus.PENDING
            return

        all_completed = True
        for dep in task.dependencies:
            dep_task_result = await self.db.execute(
                select(Task).where(Task.id == dep.depends_on_task_id)
            )
            dep_task = dep_task_result.scalar_one_or_none()
            if dep_task and dep_task.status != TaskStatus.COMPLETED:
                all_completed = False
                break

        if all_completed:
            if task.status == TaskStatus.BLOCKED:
                task.status = TaskStatus.PENDING
        else:
            if task.status not in (TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS):
                task.status = TaskStatus.BLOCKED

        await self.db.flush()
