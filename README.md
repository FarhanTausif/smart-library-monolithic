# Smart Library System (Monolithic Architecture)

A backend-only Smart Library System built using **Node.js (Express)** and **MongoDB**, designed for a distributed systems course. This project implements a monolithic architecture with RESTful APIs for user management, book management, loan management, and system statistics. The system is tested using **Postman**.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Testing with Postman](#testing-with-postman)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [License](#license)

## Project Overview
The Smart Library System is a monolithic backend application that manages library operations, including user registration, book catalog management, book loans, and system statistics. It uses a single MongoDB database and exposes RESTful APIs for external clients. All modules are tightly coupled, residing in the same codebase and memory space, with communication via function calls.

## Features
### User Management
- Register students or faculty.
- Retrieve and update user profiles.
### Book Management
- Add, update, or remove books.
- Search books by title or author.
- View book availability.
### Loan Management
- Issue books to users.
- Return borrowed books.
- View active/past loans and overdue loans.
- Extend loan due dates.
### Statistics
- View most borrowed books.
- Identify most active users.
- Get system-wide statistics (e.g., total books, overdue loans).

## Technologies
- **Node.js**: JavaScript runtime for the backend.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing users, books, and loans.
- **Mongoose**: ODM for MongoDB schema management.
- **Postman**: Tool for testing APIs.
- **Dependencies**:
  - `express`, `mongoose`, `body-parser`, `cors`, `dotenv`, `moment`, `uuid`
  - Dev: `nodemon`

## Project Structure
```
smart-library-monolithic/
├── config/
│   └── db.js              # MongoDB connection setup
├── models/
│   ├── User.js            # User schema
│   ├── Book.js            # Book schema
│   └── Loan.js            # Loan schema
├── routes/
│   ├── userRoutes.js      # User API routes
│   ├── bookRoutes.js      # Book API routes
│   ├── loanRoutes.js      # Loan API routes
│   └── statsRoutes.js     # Statistics API routes
├── controllers/
│   ├── userController.js  # User logic
│   ├── bookController.js  # Book logic
│   ├── loanController.js  # Loan logic
│   └── statsController.js # Statistics logic
├── middleware/
│   └── errorHandler.js    # Global error handling
├── .env                   # Environment variables
├── package.json           # Project metadata and dependencies
├── server.js              # Main server file
└── README.md              # Project documentation
```

## Setup Instructions
### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud, e.g., MongoDB Atlas)
- **Postman** (for API testing)
- **Git** (optional, for cloning)

### Steps
1. **Clone the Repository** (if applicable):
   ```bash
   git clone https://github.com/FarhanTausif/smart-library-monolithic.git
   cd smart-library-monolithic
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory:
     ```
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/smart_library
     ```
   - Replace `MONGO_URI` with your MongoDB connection string if using a cloud service like MongoDB Atlas.

4. **Start MongoDB**:
   - If local, run `mongod` in a terminal.
   - Ensure MongoDB is accessible at the specified `MONGO_URI`.

5. **Run the Application**:
   ```bash
   npm run dev
   ```
   - Uses `nodemon` for auto-restart on file changes.
   - Server runs on `http://localhost:3000` (or the specified `PORT`).

## API Endpoints
The system exposes RESTful APIs under the `/api` prefix. Below is a summary of key endpoints. All requests/responses use JSON.

### User Endpoints
- **POST /api/users**: Register a new user.
  - Body: `{ "name": "Alice Smith", "email": "alice@example.com", "role": "student" }`
  - Response: 201 Created
- **GET /api/users/:id**: Get user profile by ID.
  - Response: 200 OK
- **PUT /api/users/:id**: Update user profile.
  - Body: `{ "name": "Alice Smith", "email": "alice.smith@example.com", "role": "student" }`
  - Response: 200 OK

### Book Endpoints
- **POST /api/books**: Add a new book.
  - Body: `{ "title": "Clean Code", "author": "Robert C. Martin", "isbn": "9780132350884", "copies": 3 }`
  - Response: 201 Created
- **GET /api/books?search=clean**: Search books by title or author.
  - Response: 200 OK
- **GET /api/books/:id**: Get book details.
  - Response: 200 OK
- **PUT /api/books/:id**: Update book details.
  - Body: `{ "copies": 5, "available_copies": 3 }`
  - Response: 200 OK
- **DELETE /api/books/:id**: Remove a book.
  - Response: 204 No Content

### Loan Endpoints
- **POST /api/loans**: Issue a book to a user.
  - Body: `{ "user_id": "user_id", "book_id": "book_id", "due_date": "2025-05-15T23:59:59Z" }`
  - Response: 201 Created
- **POST /api/returns**: Return a borrowed book.
  - Body: `{ "loan_id": "loan_id" }`
  - Response: 200 OK
- **GET /api/loans/:user_id**: Get user loan history.
  - Response: 200 OK
- **GET /api/loans/overdue**: List overdue loans.
  - Response: 200 OK
- **PUT /api/loans/:id/extend**: Extend loan due date.
  - Body: `{ "extension_days": 7 }`
  - Response: 200 OK

### Statistics Endpoints
- **GET /api/stats/books/popular**: Get most borrowed books.
  - Response: 200 OK
- **GET /api/stats/users/active**: Get most active users.
  - Response: 200 OK
- **GET /api/stats/overview**: Get system overview (total books, users, etc.).
  - Response: 200 OK

## Testing with Postman
1. **Install Postman**: Download from [postman.com](https://www.postman.com/).
2. **Create a Collection**:
   - Name it "Smart Library System".
   - Add requests for each endpoint.
3. **Example Requests**:
   - **Register User**:
     - Method: POST
     - URL: `http://localhost:3000/api/users`
     - Body: `{ "name": "Alice Smith", "email": "alice@example.com", "role": "student" }`
     - Expected: 201 Created
   - **Add Book**:
     - Method: POST
     - URL: `http://localhost:3000/api/books`
     - Body: `{ "title": "Clean Code", "author": "Robert C. Martin", "isbn": "9780132350884", "copies": 3 }`
     - Expected: 201 Created
   - **Issue Book**:
     - Method: POST
     - URL: `http://localhost:3000/api/loans`
     - Body: `{ "user_id": "user_id", "book_id": "book_id", "due_date": "2025-05-15T23:59:59Z" }`
     - Expected: 201 Created
4. **Testing Tips**:
   - Test sequentially: Create users and books before loans.
   - Verify status codes (201, 200, 204, 400, 404).
   - Test edge cases (e.g., issuing unavailable books, extending loans multiple times).

## Troubleshooting
- **MongoDB Connection Error**: Ensure MongoDB is running and `MONGO_URI` is correct.
- **Port Conflict**: Change `PORT` in `.env` if 3000 is in use.
- **Nodemon Not Found**: Run `npm install -g nodemon`.
- **Postman Errors**: Check JSON payloads and URLs.
- **API Errors**: Review server logs for stack traces.

## Future Improvements
- Add input validation (e.g., `express-validator`).
- Implement authentication (e.g., JWT).
- Add automated tests with Jest or Mocha.
- Introduce rate limiting and logging for production.
- Enhance error messages for better debugging.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
