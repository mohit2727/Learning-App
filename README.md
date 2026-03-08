# 📚 Learning App

A full-stack learning platform with an Android app, web app, and admin dashboard — built with Expo React Native, Next.js, and Node.js.

---

## 🗂️ Project Structure

```
Learning-App/
├── frontend/        # 📱 Android app (Expo React Native)
├── Frontend_web/    # 🌐 Web app (Next.js)
├── Admin/           # 🖥️ Admin dashboard (Next.js)
└── Backend/         # ⚙️ REST API (Node.js + Express + MongoDB)
```

---

## ✨ Features

- 🔐 **Authentication** — Email OTP via Clerk
- 🏠 **Dashboard** — Announcements, stats, quick access
- 📚 **Courses** — Video playlists with YouTube player
- 📝 **Quizzes & Tests** — Timed quizzes with leaderboard
- 💳 **Payments** — Razorpay integration to unlock paid content
- 🏆 **Leaderboard** — Top scorers ranking
- 👤 **Profile** — Edit profile, view test history & enrolled courses
- 🖥️ **Admin Panel** — Manage courses, quizzes, announcements, users

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Expo CLI (`npm install -g expo`)
- Clerk account — [dashboard.clerk.com](https://dashboard.clerk.com)
- Razorpay account (for payments)

---

### ⚙️ Backend

```bash
cd Backend
npm install
# Create .env file (see below)
npm start
```

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

### 📱 Android App

```bash
cd frontend
npm install
# Create .env file (see below)
npx expo start --android
```

**Android `.env`:**
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

---

### 🌐 Web App

```bash
cd Frontend_web
npm install
# Create .env.local file (see below)
npm run dev
```

Access on phone via: `http://<your-local-ip>:3000`

**Web `.env.local`:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://your-server-ip:5000/api
```

---

### 🖥️ Admin Panel

```bash
cd Admin
npm install
# Create .env.local file
npm run dev
```

---

## 🌍 Deployment

| App | Recommended Host |
|---|---|
| Backend | Railway / Render / VPS |
| Web App | Vercel (connect GitHub repo, root dir: `Frontend_web`) |
| Admin | Vercel (root dir: `Admin`) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Android App | Expo, React Native, NativeWind, Zustand, Clerk |
| Web App | Next.js 15, Tailwind CSS, Clerk, Axios |
| Admin | Next.js, Tailwind CSS |
| Backend | Node.js, Express, MongoDB, Mongoose, Clerk JWT |
| Payments | Razorpay |
| Auth | Clerk (Email OTP) |

---

## ⚠️ Important

- **Never commit `.env` or `.env.local` files** — they contain secret keys
- Keep your `CLERK_SECRET_KEY` and `RAZORPAY_KEY_SECRET` private at all times
