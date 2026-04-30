# Streakz

Streakz now runs as a single Next.js application with App Router API routes, MongoDB via Mongoose, JWT auth, and Vercel-friendly serverless handlers.

## Structure

```text
Streakz/
frontend/   # unified Next.js app
backend/    # legacy Express source kept only as migration reference
```

## Run locally

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create `frontend/.env.local`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional:

```env
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GROQ_MODEL=llama-3.1-8b-instant
```

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Deploy on Vercel

1. Import the repo into Vercel.
2. Set the project root to `frontend`.
3. Add these environment variables in Vercel:

```env
MONGO_URI
JWT_SECRET
GROQ_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

4. Set `NEXT_PUBLIC_APP_URL` to your production URL, for example `https://your-app.vercel.app`.
5. If your Google OAuth app requires an explicit callback URL env, also set:

```env
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback
```

6. Deploy.

## API layout

- `/api/auth/*`
- `/api/habits`
- `/api/completions`
- `/api/journal`
- `/api/goals`
- `/api/todos`
- `/api/ai`
