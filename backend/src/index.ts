import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import routes from './routes';
import { initCronJobs } from './utils/cronJobs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'development'
        ? [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]
        : (process.env.FRONTEND_URL || 'http://localhost:3000'),
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // larger limit for base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads')); // serve uploaded files

// Connect to database and seed test users
connectDB().then(async () => {
    try {
        const { User } = await import('./models/User');
        const { Store } = await import('./models/Store');
        const testUsers = [
            { name: 'Test Buyer', email: 'buyer@test.com', phone: '9999900001', password: '123456', role: 'buyer' },
            { name: 'Test Seller', email: 'seller@test.com', phone: '9999900002', password: '123456', role: 'seller' },
            { name: 'Admin User', email: 'admin@test.com', phone: '9999900003', password: 'admin123', role: 'admin' },
        ];
        for (const u of testUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await new User({ ...u, isVerified: true, isActive: true, kyc: { status: 'verified' } }).save();
                console.log(`Seeded test user: ${u.email}`);
            }
        }
        // Create store for test seller
        const seller = await User.findOne({ email: 'seller@test.com' });
        if (seller) {
            const storeExists = await Store.findOne({ ownerId: seller._id });
            if (!storeExists) {
                await new Store({
                    ownerId: seller._id, storeName: 'LocalKart General Store',
                    description: 'Your neighborhood one-stop shop',
                    phone: '9999900002', address: '123 Main Street, Hyderabad',
                    city: 'Hyderabad', state: 'Telangana', pincode: '500001',
                    location: { type: 'Point', coordinates: [78.4867, 17.3850] },
                    isVerified: true, isActive: true, isOpen: true,
                    categories: ['Groceries', 'Fruits & Vegetables', 'Snacks', 'Dairy Products', 'Household Items', 'Beverages', 'Bakery', 'Instant Food'],
                    kycStatus: 'verified'
                }).save();
                console.log('Seeded test store: LocalKart General Store');
            }
        }
    } catch (e) {
        console.log('Test user seeding skipped (probably already exist)');
    }
    // Initialize scheduled cron jobs (trust scores, fraud scanning)
    initCronJobs();
});

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'LocalKart API',
        version: '1.0.0',
        description: 'Instant Neighborhood Groceries Backend',
        endpoints: {
            auth: '/api/auth',
            kyc: '/api/kyc',
            stores: '/api/stores',
            products: '/api/products',
            admin: '/api/admin',
            reviews: '/api/reviews',
            reports: '/api/reports',
            assistant: '/api/assistant',
            recommendations: '/api/recommendations',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
