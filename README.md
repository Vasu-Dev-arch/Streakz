# Streakz — AI-Powered Habit Tracking Application

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-black?logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-purple)

---

Streakz is a full-stack habit tracking web application designed to help users build consistency, maintain streaks, and improve productivity. It integrates AI-powered features to provide personalized habit recommendations and actionable insights.

---

## Live Demo

* Frontend: https://streakz-six.vercel.app
* Backend API: https://streakz.onrender.com

---

## Features

### Core Functionality

* Secure authentication using JWT (email/password)
* Google OAuth login integration
* Create, update, and manage daily habits
* Automatic streak tracking and consistency monitoring
* Custom habit categories and user preferences
* Light/Dark theme support

### AI Features

* AI Habit Coach: Generate structured habit plans based on user goals
* Personalized suggestions with actionable steps and tips
* Convert AI-generated habits directly into trackable habits

### User Experience

* Fully mobile responsive design
* Loading states and error handling for better UX

### Deployment

* Frontend hosted on Vercel
* Backend hosted on Render
* Database hosted on MongoDB Atlas

---

## Tech Stack

### Frontend

* React (Vite)
* Custom CSS (responsive design)

### Backend

* Node.js
* Express.js
* JWT Authentication
* Groq API (LLM integration)

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

* User signs up or logs in (JWT or Google OAuth)
* Server generates authentication token
* Token is stored client-side
* Protected routes validated via middleware

---

## AI Habit Coach (Overview)

* Users input a goal (e.g., "Improve focus")
* Backend calls Groq API (LLM)
* Returns structured response:

  * Goal summary
  * 3 actionable habits
  * 1 practical tip
* Users can directly add suggested habits to their tracker

---

## Key Concepts Implemented

* RESTful API design
* Authentication and authorization (JWT + OAuth)
* AI integration using LLM APIs
* Client-server communication
* Modular backend architecture
* Responsive UI/UX design
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
GROQ_API_KEY=your_groq_api_key
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

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## Future Improvements

* Push notifications for habit reminders
* Advanced analytics and visualizations
* Habit completion predictions using AI
* User profile enhancements

---

## Author

**Vasu (Cap)**
Full-Stack & AI Engineer

---

> Building consistency through small daily actions.
