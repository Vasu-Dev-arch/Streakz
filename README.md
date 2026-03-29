# Streakz — Habit Tracking Web Application


![React](https://img.shields.io/badge/Frontend-React-blue?logo=react) ![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js) ![Express](https://img.shields.io/badge/Framework-Express-black?logo=express) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb) ![JWT](https://img.shields.io/badge/Auth-JWT-orange) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel) ![Render](https://img.shields.io/badge/Backend-Render-purple) 

---

A full-stack habit tracking application designed to help users build consistency, monitor progress, and maintain daily streaks.

---

## Live Demo

* Frontend: https://streakz-six.vercel.app
* Backend API: https://streakz.onrender.com

---

## Features

* User authentication with JWT (signup/login)
* Create and manage daily habits
* Track streaks and consistency over time
* Basic analytics for habit activity
* Custom habit categories
* User-specific settings
* Light/Dark theme support
* Fully deployed (Vercel, Render, MongoDB Atlas)

---

## Tech Stack

### Frontend

* React (Vite)
* CSS (custom styling with theme support)

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* MongoDB Atlas
* Mongoose

---

## Project Structure

```
Streakz/
├── frontend/      # React application
├── backend/       # Express API
└── README.md
```

---

## Authentication Flow

* Users sign up or log in
* Server generates a JWT token
* Token is stored on the client
* Authenticated requests include the token
* Protected routes are handled via middleware

---

## Key Concepts Implemented

* RESTful API design
* Authentication and route protection
* Client-server integration
* State management using React hooks
* Modular backend architecture
* Full-stack deployment workflow

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Vasu-Dev-arch/Streakz.git
cd Streakz
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:

```bash
node src/server.js
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

---

## Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* Database hosted on MongoDB Atlas

---

## Future Improvements

* OAuth authentication (Google login)
* Push notifications
* Improved mobile responsiveness
* AI-based habit recommendations
* User profile enhancements

---

## Author

**Vasu**        
Full-Stack & AI Engineer 

