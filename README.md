# Quizora

**Turn what you know into what you can prove.**

Quizora is a full-stack AI quiz generation and assessment platform built with React, TypeScript, Tailwind CSS, Express, MongoDB Atlas (Mongoose), and the Gemini API (`@google/genai`).

---

## Project Structure

```text
quizora/
├── backend/
│   ├── config/
│   │   ├── db.ts              # MongoDB Atlas connection via Mongoose + local store fallback
│   │   └── env.ts             # Server environment configuration
│   ├── controllers/
│   │   ├── authController.ts  # Register, login, logout, session check
│   │   ├── quizController.ts  # AI generation, listing, retrieval, deletion
│   │   ├── resultController.ts# Server-side grading and result retrieval
│   │   └── userController.ts  # Profile, password updates, dashboard metrics
│   ├── middleware/
│   │   ├── authMiddleware.ts  # JWT verification + CSRF checks
│   │   ├── errorHandler.ts    # Centralized error handling
│   │   └── rateLimiter.ts     # API, auth, and AI generation rate limits
│   ├── models/
│   │   ├── User.ts            # Mongoose User schema
│   │   ├── Quiz.ts            # Mongoose Quiz schema + indexes
│   │   └── QuizResult.ts      # Mongoose QuizResult schema + indexes
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── quizRoutes.ts
│   │   ├── resultRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   └── geminiService.ts   # Structured Gemini quiz generation & validation
│   ├── utils/
│   │   ├── repository.ts      # Data persistence abstraction
│   │   └── validation.ts      # Input sanitization & ID validation
│   └── app.ts                 # Express API router composition
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx
│   │   └── Logo.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useRoute.ts
│   ├── layouts/
│   │   └── AppLayout.tsx
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── GenerateQuizPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── QuizResultPage.tsx
│   │   └── QuizTakePage.tsx
│   ├── services/
│   │   └── api.ts             # Axios client with Bearer + cookie session handling
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server.ts                  # Express + Vite server entry point
├── .env.example
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/quizora?retryWrites=true&w=majority
JWT_SECRET=your_long_random_jwt_secret
APP_URL=http://localhost:3000
PORT=3000
```

### 3. Configure Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com/) and create an API key.
2. Add the key to `GEMINI_API_KEY` in `.env` (or in **Settings > Secrets** if running inside AI Studio).
3. All Gemini requests run exclusively on the backend in `backend/services/geminiService.ts`.

### 4. Configure MongoDB Atlas

1. Create a free cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write access and add your IP (or `0.0.0.0/0` for cloud deployments) under **Network Access**.
3. Copy your connection string into `MONGODB_URI` in `.env`.
4. Note: If `MONGODB_URI` is omitted during local evaluation, Quizora automatically persists data to `.data/quizora.json` so all features remain testable immediately.

### 5. Run the Application

**Development (Express API + Vite HMR/Middleware on port 3000):**

```bash
npm run dev
```

**Production Build & Start:**

```bash
npm run build
npm start
```

---

## REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account (bcrypt-hashed password + JWT)
- `POST /api/auth/login` — Authenticate and issue JWT session
- `POST /api/auth/logout` — Clear active session cookie
- `GET /api/auth/me` — Return the signed-in user

### Quizzes (Authenticated)
- `POST /api/quizzes/generate` — Generate and persist a structured quiz via Gemini
- `GET /api/quizzes` — List user quizzes (supports `?search=` and `?difficulty=`)
- `GET /api/quizzes/:id` — Retrieve a single quiz owned by the user
- `DELETE /api/quizzes/:id` — Delete a quiz and its associated results

### Results (Authenticated)
- `POST /api/results/submit` — Grade submitted answers server-side and save result
- `GET /api/results` — List graded quiz attempts for the user
- `GET /api/results/:id` — Retrieve full score breakdown and answer explanations

### Profile (Authenticated)
- `GET /api/users/profile` — Return user details, aggregated stats, and recent activity
- `PUT /api/users/profile` — Update name, email, or password
