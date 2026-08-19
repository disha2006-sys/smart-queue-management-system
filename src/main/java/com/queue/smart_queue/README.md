# Smart Queue Management System

A full-stack Smart Queue Management System designed to manage customer queues efficiently using digital token generation, live queue monitoring, and operator counters.

## Features

- Customer token generation
- Automatic estimated waiting time
- Live queue display
- Operator dashboard
- Multiple counter management
- Token status management
- REST APIs
- MySQL database integration
- Input validation
- Global exception handling
- CORS support
- Responsive frontend UI

## Tech Stack

- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- MySQL
- HTML
- JavaScript
- Tailwind CSS
- Maven
- Postman
- Git & GitHub
- ngrok

## How to Run

### Prerequisites

Make sure the following are installed:

- Java 21
- Maven
- MySQL
- IntelliJ IDEA
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/disha2006-sys/smart-queue-management-system.git
cd smart-queue-management-system

## System Flow

Customer enters details → Token is generated → Token enters queue → Live Display shows queue → Operator calls next customer → Token becomes SERVING → Service completed → Token becomes COMPLETED.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/queue/generate` | Generate a new customer token |
| GET | `/api/queue/live-status` | Get live queue status |
| PUT | `/api/queue/next/{counterId}` | Call next customer for a counter |

## Database

Database Name:

`smart_queue_db`

Main Entities:

- User
- Counter
- Token

Token Status:

- PENDING
- SERVING
- COMPLETED
- CANCELLED

## Project Structure

```text
src
└── main
    ├── java
    │   └── com.queue.smart_queue
    │       ├── controller
    │       ├── exception
    │       ├── model
    │       ├── repository
    │       └── service
    └── resources

2. Create MySQL Database

Open MySQL and run:

CREATE DATABASE smart_queue_db;
3. Configure Database

Open:

src/main/resources/application.properties

Add your local MySQL username and password.

Example:

spring.datasource.url=jdbc:mysql://localhost:3306/smart_queue_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

Note: application.properties is not included in GitHub because it contains local database credentials.

4. Run the Backend

Open the project in IntelliJ IDEA and run:

mvn spring-boot:run

The Spring Boot backend will start at:

http://localhost:8080
5. Open the Frontend

Open the frontend HTML pages in your browser:

index.html — Customer Token Screen
display.html — Live Display Board
operator.html — Operator Dashboard
6. Test the System
Generate a token from index.html.
Check the live queue on display.html.
Open operator.html.
Select a counter.
Click Call Next Customer.
Verify the token status changes from PENDING → SERVING → COMPLETED.
API Base URL
http://localhost:8080/api/queue