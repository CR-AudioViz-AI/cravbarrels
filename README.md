# 🍾 BarrelVerse

> The Ultimate Spirits Collection & Trivia Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://barrelverse-five.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-black)](https://nextjs.org)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)

## 🚀 Live Demo

**Production:** https://barrelverse-five.vercel.app

## 📋 Features

### 🎮 Trivia Games
- **Quick Pour** - 10 random questions, 30s each
- **Masters Challenge** - 25 expert questions
- **Daily Dram** - Category-focused gameplay
- **Speed Round** - 15-second quick-fire mode

### 🥃 Spirit Collection
- Browse 30+ real spirits with detailed info
- Track your personal collection
- Filter by category, rarity, and more
- Grid and list view modes

### 💰 $PROOF Token System
- Earn tokens by playing trivia
- Redeem for rewards and merchandise
- Track your balance and transactions

### 🎓 Academy (Coming Soon)
- Educational courses on spirits
- Earn certificates and badges
- Progressive learning paths

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 📦 Database Setup

### 1. Run Schema
Execute the schema in your Supabase SQL Editor:
\`\`\`bash
database/schema.sql
\`\`\`

### 2. Run Seed Data
Populate initial data:
\`\`\`bash
database/seed-data.sql
\`\`\`

## 🔧 Environment Variables

Required in Vercel/local:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
\`\`\`

## 📁 Project Structure

\`\`\`
barrelverse/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── games/page.tsx
│   ├── collection/page.tsx
│   └── page.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-trivia.ts
│   │   └── use-collection.ts
│   └── types/
│       └── database.ts
├── database/
│   ├── schema.sql
│   └── seed-data.sql
└── README.md
\`\`\`

## 🎯 Roadmap

- [x] Core trivia gameplay
- [x] Spirit collection system
- [x] User authentication
- [x] $PROOF token economy
- [ ] Leaderboards
- [ ] Academy courses
- [ ] Rewards marketplace
- [ ] Social features
- [ ] Mobile app

## 📄 License

Copyright © 2025 CR AudioViz AI, LLC. All rights reserved.

---

**Built with 🥃 by CR AudioViz AI**
