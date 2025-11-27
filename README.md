# 🥃 BarrelVerse

**The Ultimate Spirits Knowledge & Collection Platform**

A CR AudioViz AI Production | Powered by Javari AI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

---

## 🌟 Overview

BarrelVerse is a comprehensive spirits platform covering **all 13 spirit categories equally**:

| Category | Games | Trivia |
|----------|-------|--------|
| 🥃 Bourbon | 8+ | 150+ |
| 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotch | 8+ | 150+ |
| ☘️ Irish Whiskey | 6+ | 100+ |
| 🇯🇵 Japanese Whisky | 5+ | 80+ |
| 🍷 Wine | 9+ | 150+ |
| 🍺 Beer | 8+ | 150+ |
| 🌵 Tequila & Mezcal | 7+ | 100+ |
| 🏝️ Rum | 7+ | 100+ |
| 🫒 Gin | 7+ | 100+ |
| 🧊 Vodka | 5+ | 80+ |
| 🍇 Cognac & Brandy | 6+ | 100+ |
| 🍶 Sake & Asian | 5+ | 80+ |
| 🧪 Liqueurs | 5+ | 80+ |

**Total: 100+ Games | 1,000+ Trivia Questions**

---

## ✨ Features

### 🎮 Interactive Games
- Trivia challenges across all categories
- Blind tasting simulations
- Region matching
- Price guessing
- Timeline ordering
- And more...

### 📱 Collection Tracking
- Barcode scanning
- Bottle inventory management
- Wishlist & watch lists
- Value tracking
- Collection analytics

### 🏆 $PROOF Rewards
- Earn tokens for playing games
- Rewards for reviews & contributions
- Redeem for discounts & perks
- Leaderboards & competitions

### 📚 Spirits Academy
- Beginner to expert courses
- Video lessons
- Certifications
- Progress tracking

### 👥 Community
- User reviews & ratings
- Clubs & groups
- Virtual tastings
- Direct messaging

### 🛒 Marketplace
- Buy, sell, and trade
- Price tracking
- Authentication services
- Secondary market data

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/roy-henderson/barrelverse.git
cd barrelverse

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

See `.env.example` for all required variables. Key ones:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

---

## 📁 Project Structure

```
barrelverse/
├── app/
│   ├── page.tsx          # Home page with age gate
│   ├── layout.tsx        # Root layout with nav/footer
│   ├── globals.css       # Global styles
│   ├── games/            # Games hub
│   ├── explore/          # Category exploration
│   ├── collection/       # Collection management
│   ├── academy/          # Learning courses
│   ├── docs/             # Documentation
│   └── javari/           # AI assistant
├── components/           # Reusable components
├── lib/                  # Utilities & services
├── public/               # Static assets
├── styles/               # Additional styles
└── types/                # TypeScript types
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **AI:** Javari AI (powered by Claude/GPT-4)

---

## 📊 Database Schema

52 tables covering:
- User profiles & authentication
- Collection management
- Reviews & ratings
- Marketplace transactions
- Gamification & achievements
- Education & certifications
- Social features
- Analytics

Full schema available in `/docs/database-schema.sql`

---

## 🔐 Legal Compliance

⚠️ **Age Verification Required** - Users must be 21+ to access

- Age gate on first visit
- ID verification for marketplace
- State shipping restrictions
- Responsible drinking messaging

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🏢 About

**CR AudioViz AI, LLC**  
The Ultimate Spirits Knowledge & Collection Platform

Built with ❤️ in Florida

---

## 🔗 Links

- [Documentation](https://barrelverse.com/docs)
- [API Reference](https://barrelverse.com/docs/api)
- [Support](mailto:support@barrelverse.com)

---

*Drink Responsibly. Must be 21+ to use this platform.*
