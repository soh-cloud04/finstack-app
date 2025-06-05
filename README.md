# Finstack Task Application

This project is a simple task management web application with a Flask backend and an Angular frontend.

## Project Architecture

The application follows a client-server architecture:

- **Frontend:** Developed with Angular, providing the user interface for viewing, adding, editing, and deleting tasks. It communicates with the backend API to perform these actions.
- **Backend:** Developed with Flask, providing a RESTful API to manage task data. It interacts with a database (configured separately) to store and retrieve task information.

Communication between the frontend and backend is done via HTTP requests.

## Development Assisted by AI

This project's development was significantly assisted by an AI coding assistant (Gemini/Cursor). The AI helped with various aspects of the project, including:

- **Frontend Development:**
    - Setting up the initial Angular project structure.
    - Creating components (`TaskListComponent`, `NewTaskModalComponent`, `EditTaskModalComponent`).
    - Implementing services (`TaskService`) for API communication.
    - Modifying component templates (HTML) and styles (CSS) based on design requirements.
    - Implementing core functionalities like fetching, creating, editing, and deleting tasks.
    - Handling modal logic for new and edit task forms.
    - Implementing table features like sorting and filtering (UI and connecting to API).
    - Troubleshooting Angular-specific errors (e.g., `NG8001`, `NG8103`, `ngModel` binding issues, module not found errors).
- **Backend Development:**
    - Although the core Flask backend structure was likely initiated independently, the AI was instrumental in defining API routes and ensuring proper RESTful communication protocols were followed when implementing frontend-backend interactions.
- **Containerization (currently removed for deployment):**
    - Creating initial Dockerfiles for both the frontend (Angular) and backend (Flask).
    - Modifying Dockerfiles to serve the applications using different methods (Nginx, serve).
    - Troubleshooting Docker build errors.
    - Exploring the possibility of a combined frontend/backend container (though the standard isolated approach is recommended).
- **Configuration Management:**
    - Guiding the process of configuring the API URL in the Angular frontend, suggesting the use of environment files.

The AI's assistance involved providing code snippets, explaining concepts, suggesting debugging steps, generating UI structures, and modifying files based on descriptions and error messages provided during the development process. 