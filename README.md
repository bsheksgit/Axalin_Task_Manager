# Axalin Task Manager

A full-stack **Task Dependency Management** application built with **React 19** (frontend) and **FastAPI** (backend). Users can create tasks, define dependencies between them, and track progress — with automatic validation to prevent circular dependencies and enforce completion rules.

---

## Features

- **User Authentication** — Cookie-based JWT authentication with signup, login, and logout
- **Task Management** — Create, edit, delete, and update task status (Pending, In Progress, Completed, Blocked)
- **Dependency Management** — Define which tasks must be completed before others can proceed
- **Circular Dependency Prevention** — BFS-based graph traversal prevents invalid dependency chains
- **Smart Status Updates** — Tasks with incomplete dependencies are automatically marked as Blocked
- **Completion Validation** — Tasks can only be marked as completed when all dependencies are met
- **Delete Protection** — Tasks that other tasks depend on cannot be deleted until those dependencies are removed
- **Relationships View** — Visual overview of all task dependencies in a table format
- **Responsive UI** — Clean, professional light theme with Tailwind CSS
- **Snackbar Notifications** — Real-time feedback for all user actions (success/error)
- **Error Boundary** — Global error catching with a reusable error page (404, 403, 500, generic)

---

## Tech Stack

### Frontend

| Technology               | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| **React 19** + **Vite**  | UI framework and build tool                                     |
| **Redux Toolkit**        | UI state management (auth, task UI, snackbar)                   |
| **TanStack React Query** | Server state management (API data fetching, caching, mutations) |
| **React Router DOM v6**  | Client-side routing                                             |
| **Tailwind CSS**         | Utility-first CSS framework                                     |
| **Axios**                | HTTP client with cookie-based auth support                      |

### Backend

| Technology               | Purpose                             |
| ------------------------ | ----------------------------------- |
| **FastAPI**              | Async Python web framework          |
| **SQLAlchemy 2.0**       | Async ORM for database interactions |
| **PostgreSQL 16**        | Relational database                 |
| **Pydantic v2**          | Data validation and serialization   |
| **python-jose**          | JWT token creation and validation   |
| **passlib** + **bcrypt** | Password hashing                    |
| **asyncpg**              | Async PostgreSQL driver             |

### Infrastructure

| Technology                      | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| **Docker** + **Docker Compose** | Containerization and orchestration                 |
| **Nginx**                       | Reverse proxy and static file serving for frontend |

---

## Project Structure

```
Task_Manager_Axalin/
├── frontend/                          # React application
│   ├── public/
│   │   └── logo.png                   # App logo
│   ├── src/
│   │   ├── api/                       # API client modules
│   │   │   ├── authApi.js             # Auth endpoints
│   │   │   ├── axiosInstance.js        # Axios config with interceptors
│   │   │   └── taskApi.js             # Task endpoints
│   │   ├── assets/
│   │   │   └── hero.png               # Header cover image
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ConfirmModal.jsx       # Confirmation dialog
│   │   │   ├── DependencyList.jsx     # Dependency relationships view
│   │   │   ├── Header.jsx             # App header with cover image
│   │   │   ├── Layout.jsx             # Main layout (header + sidebar + content)
│   │   │   ├── ProtectedRoute.jsx     # Auth guard for routes
│   │   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   │   ├── Snackbar.jsx           # Notification toast
│   │   │   ├── TaskCard.jsx           # Individual task display
│   │   │   ├── TaskForm.jsx           # Create/edit task modal
│   │   │   └── TaskList.jsx           # Task list with loading/error states
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.js             # Auth logic (login, signup, logout)
│   │   │   └── useTasks.js            # Task CRUD + dependency operations
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Main dashboard
│   │   │   └── SignupLoginPage.jsx    # Auth page
│   │   ├── store/                     # Redux store
│   │   │   ├── authSlice.js           # Auth state
│   │   │   ├── index.js               # Store configuration
│   │   │   ├── snackbarSlice.js       # Snackbar notification state
│   │   │   └── taskSlice.js           # Task UI state (active tab, form)
│   │   ├── App.jsx                    # Routes and providers
│   │   ├── index.css                  # Global styles and animations
│   │   └── main.jsx                   # Entry point
│   ├── Dockerfile                     # Multi-stage build (Node → Nginx)
│   ├── nginx.conf                     # Nginx configuration
│   └── package.json
│
├── backend/                           # FastAPI application
│   ├── app/
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── user.py                # User model
│   │   │   └── task.py                # Task + TaskDependency models
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   │   ├── user.py                # User request/response schemas
│   │   │   └── task.py                # Task request/response schemas
│   │   ├── routers/                   # API route handlers
│   │   │   ├── auth.py                # Auth endpoints + JWT middleware
│   │   │   └── tasks.py               # Task CRUD + dependency endpoints
│   │   ├── services/                  # Business logic layer
│   │   │   ├── auth_service.py        # Auth business logic
│   │   │   └── task_service.py        # Task + dependency business logic
│   │   ├── utils/
│   │   │   └── security.py            # Password hashing, JWT utils
│   │   ├── config.py                  # App configuration (env-based)
│   │   ├── database.py                # Async SQLAlchemy engine + session
│   │   └── main.py                    # FastAPI app entry point
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml                 # Container orchestration
└── .env                               # Environment variables
```

---

## Getting Started (Setup)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- Git (optional, for cloning)

### Quick Start (Docker — Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd Task_Manager_Axalin

# 2. (Optional) Configure environment variables
# Edit .env file to customize database credentials, JWT secret, etc.
# Default values work for local development out of the box

# 3. Build and start all services
docker compose up --build

# 4. Access the application
#    Frontend:  http://localhost
#    APIs:       http://localhost:8000
#    API Docs:  http://localhost:8000/docs
```

### Development (Without Docker)

#### Backend Setup

```bash
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Make sure PostgreSQL is running and update DATABASE_URL in .env
# Then start the server
uvicorn app.main:app --reload
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and proxies API requests to the backend.

---

## API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint  | Description                    | Auth Required |
| ------ | --------- | ------------------------------ | ------------- |
| POST   | `/signup` | Register a new user            | No            |
| POST   | `/login`  | Login and set auth cookie      | No            |
| POST   | `/logout` | Clear auth cookie              | No            |
| GET    | `/me`     | Get current authenticated user | Yes           |

### Tasks (`/api/tasks/`)

| Method | Endpoint                      | Description                              | Auth Required |
| ------ | ----------------------------- | ---------------------------------------- | ------------- |
| GET    | `/`                           | List all user tasks with dependencies    | Yes           |
| POST   | `/`                           | Create a new task                        | Yes           |
| GET    | `/{id}`                       | Get task details with dependencies       | Yes           |
| PUT    | `/{id}`                       | Update task (title, description, status) | Yes           |
| DELETE | `/{id}`                       | Delete a task                            | Yes           |
| POST   | `/{id}/dependencies`          | Add a dependency                         | Yes           |
| DELETE | `/{id}/dependencies/{dep_id}` | Remove a dependency                      | Yes           |
| GET    | `/{id}/dependencies`          | Get dependencies for a task              | Yes           |
| GET    | `/dependencies/all`           | Get all dependencies across all tasks    | Yes           |

### Health

| Method | Endpoint      | Description  |
| ------ | ------------- | ------------ |
| GET    | `/api/health` | Health check |

---

## Design Decisions

### Architecture: Monolithic Backend with Separated Concerns

The application follows a **monolithic architecture** — a single FastAPI backend handles all business logic (auth, tasks, dependencies). This is the right choice for this scope because:

- **Simpler development** — No inter-service communication overhead, no distributed transactions
- **Easier debugging** — Single codebase, single process, single database
- **ACID compliance** — All operations within a single database transaction
- **Adequate for the domain** — A task manager doesn't need the scaling complexity of microservices

The frontend and backend are separated into different containers for clear separation of concerns, but they form a single logical application.

### Backend: Service Layer Pattern

The backend uses a **three-layer architecture**:

1. **Routers** (`routers/`) — Handle HTTP concerns: request parsing, response formatting, status codes. Thin layer.
2. **Services** (`services/`) — Contain all business logic: validation, circular dependency detection, status auto-updates. Testable independently of HTTP.
3. **Models** (`models/`) — SQLAlchemy ORM models defining database schema and relationships.

This separation ensures that business logic is not coupled to HTTP concerns, making it easier to test and maintain.

### Data Model: Self-Referential Many-to-Many

Tasks have dependencies on other tasks, modeled as a **junction table** (`task_dependencies`) with two foreign keys to the `tasks` table:

```
Task A ──┐
         ├──► TaskDependency (task_id = A, depends_on_task_id = B)
Task B ──┘
```

This allows:

- A task to depend on multiple other tasks
- A task to be a dependency for multiple other tasks
- Efficient querying of the dependency graph

### Circular Dependency Prevention: BFS Traversal

Before adding a dependency (Task A depends on Task B), the system performs a **Breadth-First Search (BFS)** starting from Task B, traversing all downstream dependencies. If Task A is found in the traversal, adding the dependency would create a cycle, and the operation is rejected.

This is more efficient than DFS for this use case because BFS guarantees finding the shortest path to a cycle, and the dependency graph is typically shallow.

### Task Status Auto-Management

The system automatically manages task statuses:

- **Creating a dependency** — If the dependency task is not completed, the dependent task is automatically set to **Blocked**
- **Removing a dependency** — The dependent task's status is re-evaluated: if no dependencies remain, it goes back to **Pending**
- **Completing a task** — Validates all dependencies are completed first; otherwise, the request is rejected with a clear error message

### Authentication: Cookie-Based JWT

JWT tokens are stored in **HTTP-only cookies** (not localStorage) for security:

- **HTTP-only** — Prevents XSS attacks from stealing the token
- **SameSite=Lax** — Provides CSRF protection
- **Secure flag** — Can be enabled in production with HTTPS

The token contains the user ID (`sub`) and email, with a configurable expiration (default: 24 hours).

### Frontend: Redux + TanStack Query

The frontend uses a **dual state management** approach:

- **Redux Toolkit** — For UI state that doesn't come from the server:
  - Auth state (current user, authentication status)
  - Task UI state (active tab, form open/close, selected task)
  - Snackbar notifications

- **TanStack React Query** — For server state (data fetching, caching, mutations):
  - Task list and dependency data
  - Automatic cache invalidation on mutations
  - Loading, error, and success states
  - Background refetching

This avoids duplicating server state in Redux and provides powerful caching out of the box.

### Snackbar Notifications

A Redux-based snackbar system provides real-time feedback for all user actions:

- **Green** for success (login, task created, dependency added, etc.)
- **Red** for errors (login failed, task creation failed, etc.)
- Auto-dismisses after 3 seconds
- Slide-in animation from the right

### Global Error Handling: Error Boundary + Error Page

The frontend includes a two-part error handling system:

**Error Boundary** (`ErrorBoundary.jsx`) — A React class component that wraps the entire application in `App.jsx`. It catches JavaScript errors thrown during rendering in any child component. If a component crashes, instead of showing a blank white screen, it displays a friendly error page with a "Try Again" button that resets the error state and re-renders the app. Errors are also logged to the console for debugging.

**Error Page** (`ErrorPage.jsx`) — A reusable error page component that supports multiple error scenarios:

| Code      | Scenario                        | Icon | Actions Available                        |
| --------- | ------------------------------- | ---- | ---------------------------------------- |
| `404`     | Page not found (unknown routes) | 🔍   | Go to Dashboard, Refresh Page            |
| `403`     | Access denied                   | 🔒   | Go to Dashboard, Refresh Page            |
| `500`     | Server / rendering error        | ⚠️   | Go to Dashboard, Try Again, Refresh Page |
| `generic` | Catch-all fallback              | ❗   | Go to Dashboard, Try Again, Refresh Page |

The 404 route in `App.jsx` uses `<ErrorPage code="404" />` instead of inline HTML, providing a consistent look and feel across all error states.

### Containerization: Multi-Stage Docker Build

The frontend uses a **multi-stage Docker build**:

1. **Build stage** — Uses `node:20-alpine` to install dependencies and run `vite build`
2. **Production stage** — Uses `nginx:alpine` to serve the built static files

This results in a small, production-optimized image (~25MB) without any build dependencies.

The backend uses a **bind mount** (`./backend:/app`) with `--reload` for hot-reloading during development, so code changes are reflected instantly without rebuilding the container.

### Database: Health Check Dependency

The backend container waits for PostgreSQL to be **healthy** (confirmed via `pg_isready`) before starting. This prevents the race condition where the backend tries to connect to the database before it's ready to accept connections.

---

## Business Logic Highlights

### 1. Circular Dependency Detection

```python
# BFS from the dependency target, checking if we reach back to the source
async def _would_create_circular_dependency(self, task_id, depends_on_task_id):
    visited = set()
    queue = deque([depends_on_task_id])

    while queue:
        current_id = queue.popleft()
        if current_id == task_id:
            return True  # Cycle detected!
        # ... traverse dependencies
    return False  # No cycle
```

### 2. Completion Validation

```python
# A task can only be completed if ALL its dependencies are completed
async def _check_dependencies_completed(self, task):
    for dep in task.dependencies:
        dep_task = await self.db.get(Task, dep.depends_on_task_id)
        if dep_task and dep_task.status != TaskStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot mark task as completed. "
                       f"Dependency '{dep_task.title}' is not completed yet."
            )
```

### 3. Delete Protection

```python
# A task cannot be deleted if other tasks depend on it
dep_check = await self.db.execute(
    select(TaskDependency).where(
        TaskDependency.depends_on_task_id == task_id
    )
)
if dependents:
    raise HTTPException(
        status_code=409,
        detail="Cannot delete task: other tasks depend on it."
    )
```

---

## Environment Variables

All environment variables have sensible defaults. Create a `.env` file in the project root to override:

| Variable               | Default                                                        | Description               |
| ---------------------- | -------------------------------------------------------------- | ------------------------- |
| `POSTGRES_DB`          | `axalin_db`                                                    | PostgreSQL database name  |
| `POSTGRES_USER`        | `axalin_user`                                                  | PostgreSQL username       |
| `POSTGRES_PASSWORD`    | `axalin_password`                                              | PostgreSQL password       |
| `JWT_SECRET_KEY`       | `change-this-secret-key-in-production`                         | JWT signing key           |
| `JWT_ALGORITHM`        | `HS256`                                                        | JWT signing algorithm     |
| `JWT_EXPIRATION_HOURS` | `24`                                                           | Token expiration in hours |
| `CORS_ORIGINS`         | `http://localhost:5173,http://localhost:3000,http://localhost` | Allowed CORS origins      |
| `APP_NAME`             | `Axalin Task Manager`                                          | Application name          |
| `DEBUG`                | `false`                                                        | Enable debug mode         |
