# Root README for PitchBridge

# 🚀 PitchBridge

> **The professional networking platform for the startup ecosystem.**  
> Connect founders, investors, and job seekers — all in one place.

[![Deploy Status](https://github.com/your-username/your-repo/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/your-repo/actions/workflows/deploy.yml)

---

## 🌐 Live Demo

**GitHub Pages (Demo Mode):** [https://your-username.github.io/your-repo/](https://your-username.github.io/your-repo/)

> In demo mode, the app runs entirely in the browser using mock data. No backend is required.
>
> **Demo Login:** Any email / any password (automatically signs you in as a Founder)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Email/password + Google OAuth login |
| 💡 Idea Hub | AI-screened startup directory (Gemini API) |
| 💼 Job Board | Filter, search, and apply to startup jobs |
| 📊 Dashboards | Role-specific views for Founders, Investors & Job Seekers |
| 💬 Messaging | Real-time chat with Socket.io |
| 🔔 Notifications | Live activity alerts |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Passport.js (Google OAuth) |
| AI | Google Gemini API |
| Real-time | Socket.io |
| Deploy | GitHub Pages (frontend) |

---

## 🏁 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (running locally)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Start the backend
```bash
cd server
npm install
# Copy and fill in .env
cp .env.example .env
# Run database migrations
npx prisma migrate dev
# Seed with sample data
npm run seed
# Start dev server
npm run dev   # → http://localhost:5000
```

### 3. Start the frontend
```bash
cd client
npm install
cp .env.example .env.local
# Edit .env.local if needed
npm run dev   # → http://localhost:3000
```

---

## 🚀 GitHub Pages Deployment

GitHub Pages hosts the **static frontend only** in **demo mode** (no backend required).

### Step 1: Enable GitHub Pages
1. Push your code to GitHub.
2. Go to **Settings → Pages**.
3. Set **Source** to `GitHub Actions`.

### Step 2: Push to `main`
The workflow in `.github/workflows/deploy.yml` auto-builds and deploys on every push to `main`.

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Your site will be live at: `https://your-username.github.io/your-repo/`

### Optional: Set backend URL
If you have a deployed backend (e.g., on Render), add a repository secret:
- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://your-backend.onrender.com/api`

---

## 👥 Team

- **Aakshna** — Lead Developer (Architecture, Backend, Database)
- **Aarcha** — Frontend Developer (UI/UX, Next.js, Component Design)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
