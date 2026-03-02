# LocalKart - Instant Neighborhood Groceries

Your reliable local grocery marketplace for fresh produce and daily essentials, delivered from your favorite neighborhood stores.

## 🏗️ Project Structure

```
Local-Kart/
├── src/                          # Frontend source code (React + TypeScript)
│   ├── App.tsx                   # Main app — routing & state management
│   ├── main.tsx                  # Entry point
│   ├── types/                    # Shared TypeScript interfaces & enums
│   │   └── index.ts
│   ├── constants/                # Mock data & app constants
│   │   └── index.ts
│   ├── pages/                    # Page-level view components
│   │   ├── HomePage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── SuccessPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SellerDashboard.tsx
│   │   └── index.ts              # Barrel exports
│   ├── components/               # Reusable UI components
│   │   ├── layout/               # Navbar, Footer, MobileMenu
│   │   ├── ui/                   # Toast, ProductCard
│   │   ├── ProductModal.tsx
│   │   ├── OrderHistory.tsx
│   │   ├── Profile.tsx
│   │   └── Wishlist.tsx
│   ├── services/                 # API clients & external integrations
│   │   ├── api.ts                # Backend API service
│   │   ├── authService.ts        # OTP & KYC auth logic
│   │   ├── firebaseConfig.ts     # Firebase initialization
│   │   ├── geminiService.ts      # Gemini AI integration
│   │   └── razorpayService.ts    # Payment gateway
│   ├── context/                  # React context providers
│   │   └── AuthContext.tsx
│   └── utils/                    # Utility functions
│       └── location.ts
│
├── backend/                      # Backend API (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/               # DB & Firebase admin config
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/           # Auth middleware
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # Express routes
│   │   ├── services/             # Business logic services
│   │   └── index.ts              # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── index.html                    # HTML entry (Vite)
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Frontend dependencies
├── .env.local                    # Environment variables (not committed)
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Frontend Setup
```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with required variables
# See backend/README.md for details

# Start dev server
npm run dev
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Firebase Auth** for phone OTP
- **Razorpay** for payments
- **Google Gemini AI** for recipe suggestions

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Firebase Admin SDK**
- **Twilio** for SMS
- **Redis** for caching
