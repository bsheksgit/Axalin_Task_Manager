# Axalin Task Management Solutions

A full-stack task dependency management application built with React (frontend) and FastAPI (backend).

## Features

- **User Authentication**: Cookie-based JWT authentication with login/signup
- **Task Management**: Create, edit, delete, and mark tasks as complete
- **Dependency Management**: Define dependencies between tasks with circular dependency prevention
- **Status Tracking**: Tasks can be Pending, In Progress, Completed, or Blocked
- **Dependency Validation**: Tasks can only be marked complete when all dependencies are met
- **Responsive UI**: Clean, professional light theme with Tailwind CSS

## Tech Stack

### Frontend

- React 19 with Vite
- Redux Toolkit (state management)
- TanStack React Query (API data fetching)
- React Router DOM (routing)
- Tailwind CSS (styling)
- Axios (HTTP client with cookie support)

### Backend

- FastAPI (async Python web framework)
- SQLAlchemy 2.0 (async ORM)
- PostgreSQL (database)
- Alembic (migrations)
- JWT (cookie-based authentication)
- bcrypt (password hashing)

### Infrastructure

- Docker & Docker Compose
- Nginx (reverse proxy for frontend)

## Project Structure

```
Task_Manager_Axalin/
├── frontend/               # React application
│   ├── src/
│   │   ├── api/            # API client modules
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store & slices
│   │   ├── App.jsx         # Routes & providers
│   │   └── main.jsx        # Entry point
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Security utilities
│   │   ├── config.py       # App configuration
│   │   ├── database.py     # Database setup
│   │   └── main.py         # FastAPI app entry
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml      # Container orchestration
└── .env                    # Environment variables
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Git (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Task_Manager_Axalin
   ```

2. Configure environment variables (optional):
   - Edit `.env` file to customize database credentials, JWT secret, etc.
   - Default values work for local development

3. Build and start the containers:

   ```bash
   docker compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development (without Docker)

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint  | Description               |
| ------ | --------- | ------------------------- |
| POST   | `/signup` | Register a new user       |
| POST   | `/login`  | Login and set auth cookie |
| POST   | `/logout` | Clear auth cookie         |
| GET    | `/me`     | Get current user          |

### Tasks (`/api/tasks/`)

| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/`                           | List all user tasks   |
| POST   | `/`                           | Create a new task     |
| GET    | `/{id}`                       | Get task details      |
| PUT    | `/{id}`                       | Update task           |
| DELETE | `/{id}`                       | Delete task           |
| POST   | `/{id}/dependencies`          | Add dependency        |
| DELETE | `/{id}/dependencies/{dep_id}` | Remove dependency     |
| GET    | `/{id}/dependencies`          | Get task dependencies |
| GET    | `/dependencies/all`           | Get all dependencies  |

## Business Logic

- **Circular Dependency Prevention**: BFS algorithm checks the dependency graph before adding new dependencies
- **Task Completion**: A task can only be marked as completed if all its dependencies are completed
- **Status Auto-update**: Tasks with incomplete dependencies are automatically marked as "Blocked"
- **Delete Protection**: Tasks that are depended upon by other tasks cannot be deleted until dependencies are removed
