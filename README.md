# Reading List Manager (Assignment 9)

A full-stack Reading List application built with a **Node.js + Express 5** REST API backend and a **React + Vite** single-page client.

## Project Structure

    assignment9/
    ├── server/
    │   ├── booksStore.js     # Async in-memory store with immutable updates & seed data
    │   ├── validate.js       # Custom request payload & query parameter validation
    │   ├── server.js         # Express 5 REST API server with restricted CORS
    │   ├── .env.example      # Environment variable template
    │   └── package.json
    ├── client/
    │   ├── src/
    │   │   ├── api/books.js              # Fetch API wrapper with AbortSignal support
    │   │   ├── components/
    │   │   │   ├── StatsPanel.jsx        # Reading statistics & genre breakdown
    │   │   │   ├── FilterBar.jsx         # Search, genre/read filters, and sorting
    │   │   │   ├── BookForm.jsx          # Controlled form for adding and editing books
    │   │   │   └── BookList.jsx          # Book cards with inline read toggle, rating, edit & delete
    │   │   ├── App.jsx                   # Main state management & AbortController lifecycle
    │   │   ├── main.jsx
    │   │   └── index.css                 # Responsive custom CSS
    │   ├── .env.example
    │   └── package.json
    ├── .gitignore
    └── README.md

## Prerequisites

- **Node.js** (LTS v20 or v22+)
- **npm**

## Setup & Running Locally

### 1. Start the Backend Server

    cd server
    cp .env.example .env
    npm install
    npm start

The API server runs on `http://localhost:3000`.

### 2. Start the Frontend Client

Open a second terminal:

    cd client
    cp .env.example .env
    npm install
    npm run dev

The React client runs on `http://localhost:5173`.

## Environment Variables

### `server/.env`
- `PORT` — Server port (default: `3000`)
- `CLIENT_ORIGIN` — Allowed CORS origin (default: `http://localhost:5173`)

### `client/.env`
- `VITE_API_URL` — Backend API base URL (default: `http://localhost:3000`)

## REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check (`{ "status": "ok" }`) |
| `GET` | `/api/books` | List books with optional query filters (`q`, `genre`, `read`, `sort`, `order`) |
| `GET` | `/api/books/:id` | Get a single book by numeric ID |
| `GET` | `/api/stats` | Get total, read, unread counts, average rating, and breakdown by genre |
| `POST` | `/api/books` | Create a new book (`201 Created`) |
| `PUT` | `/api/books/:id` | Replace all fields of an existing book (`200 OK`) |
| `PATCH` | `/api/books/:id` | Partially update an existing book (`200 OK`) |
| `DELETE` | `/api/books/:id` | Delete a book by ID (`204 No Content`) |

### Validation Rules
- `title`: Required non-empty string (max 200 characters)
- `author`: Required non-empty string (max 120 characters)
- `genre`: Allowed genre string (`fiction`, `non-fiction`, `sci-fi`, `fantasy`, `biography`, `history`, `technical`, `science`)
- `year`: Integer between `1450` and `2026`
- `read`: Boolean (`true` or `false`)
- `rating`: `null` or integer `1`–`5`; cannot be set when `read` is `false` (returns `400 Bad Request`)

## Sample `curl` Verification

    # Health check
    curl http://localhost:3000/api/health

    # Filter read books sorted by rating descending
    curl "http://localhost:3000/api/books?read=true&sort=rating&order=desc"

    # Create a new book
    curl -X POST http://localhost:3000/api/books \
      -H "Content-Type: application/json" \
      -d '{"title":"Designing Data-Intensive Applications","author":"Martin Kleppmann","genre":"technical","year":2017,"read":true,"rating":5}'

    # Validation error check (rating on unread book -> 400 Bad Request)
    curl -X POST http://localhost:3000/api/books \
      -H "Content-Type: application/json" \
      -d '{"title":"Unread Rated Book","author":"Test","genre":"fiction","year":2020,"read":false,"rating":4}'

    # Statistics summary
    curl http://localhost:3000/api/stats
