# LocalKart Backend

A comprehensive backend API for the LocalKart instant neighborhood groceries marketplace.

## Features

### 1. OTP Authentication
- Phone number based login/registration via OTP
- JWT-based session management
- Rate limiting for OTP requests

### 2. KYC Verification
- Manual KYC submission with Aadhaar and PAN
- Digilocker integration for e-KYC
- Admin approval workflow for seller verification

### 3. Location Services
- Geolocation-based store discovery
- Real-time distance calculation (Haversine formula)
- Delivery area management
- Estimated delivery time calculation

### 4. ML-Powered Search
- TF-IDF based text similarity
- Relevance scoring combining:
  - Text similarity
  - Popularity (ratings, sales)
  - Stock availability
  - Distance
- Personalized recommendations based on order history
- Trending products detection
- Auto-complete search suggestions

### 5. Store Management
- Seller store registration
- Product management
- Order handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OTP
- **ML/NLP**: Natural.js for text processing

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### Installation

```bash
cd backend
npm install
```

### Configuration

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/localkart
JWT_SECRET=your-super-secret-jwt-key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Running

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP and login
- `POST /api/auth/otp/resend` - Resend OTP
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### KYC
- `POST /api/kyc/submit` - Submit KYC documents
- `GET /api/kyc/status` - Get KYC status
- `POST /api/kyc/verify/aadhaar` - Verify Aadhaar
- `POST /api/kyc/verify/pan` - Verify PAN
- `GET /api/kyc/digilocker/initiate` - Start Digilocker flow

### Stores
- `GET /api/stores/nearby` - Find nearest stores
- `GET /api/stores/:id` - Get store details
- `POST /api/stores` - Create store (seller)

### Products
- `GET /api/products/search` - ML-powered search
- `GET /api/products/suggestions` - Search suggestions
- `GET /api/products/recommendations` - Personalized recs
- `GET /api/products/trending` - Trending products
- `GET /api/products/price-recommendations` - Price comparison

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database config
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── controllers/    # Route handlers
│   ├── services/       # Business logic
│   ├── middleware/     # Auth middleware
│   └── index.ts        # Entry point
└── package.json
```

## License

MIT
