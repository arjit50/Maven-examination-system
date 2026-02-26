# Online Examination System: Scalability Roadmap

## Current Modular Monolith
The system is built using a **Modular Monolith** architecture. Each feature (Auth, Exams, Submissions, Questions) is isolated within its own folder (`server/modules`). This allows for easy transition to microservices.

## Microservice Transition Strategy

### 1. Extraction Steps
- **Auth Service**: Move `modules/auth` and `modules/users` to a dedicated service. Use a centralized Redis store for session/token management if needed.
- **Exam Management Service**: Move `modules/exams` and `modules/questions`. This service handles the CRUD of exam assets.
- **Attempt/Execution Service**: Move `modules/submissions`. This service handles the real-time high-traffic load when thousands of students take an exam simultaneously.
- **Result & Analytics Service**: A background service that consumes submission events via a message broker (RabbitMQ/Kafka) to generate complex reports.

### 2. Communication
- **Inter-service Communication**: Use gRPC for high-performance synchronous calls (e.g., Attempt service validating exam ID).
- **Event-Driven Architecture**: Use a Message Broker (e.g., RabbitMQ) for asynchronous tasks like "Exam Completed" triggering the "Grading Service".

### 3. Data Partitioning
- Each microservice should have its own database (Database-per-service pattern) to avoid coupling. Use MongoDB partitions or separate instances.

### 4. API Gateway
- Introduce an API Gateway (like Nginx, Kong, or a custom Node.js gateway) to route requests to the appropriate service and handle cross-cutting concerns like Rate Limiting and global CORS.

## Performance Optimization (Microservice Ready)
- **Caching**: Implement Redis for exam metadata to reduce DB hits during peak hours.
- **Load Balancing**: Use Kubernetes (K8s) to scale the "Attempt Service" horizontally when heavy exams are scheduled.
