import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/User';
import { Store } from '../models/Store';
import { Product } from '../models/Product';

const SEED_PRODUCTS = [
    // ======== GROCERIES ========
    { name: 'Tata Salt (1kg)', description: 'Iodized vacuum evaporated salt, ideal for everyday cooking', price: 28, originalPrice: 32, category: 'Groceries', unit: 'kg', stock: 200, tags: ['salt', 'tata', 'cooking'], imageUrls: ['https://placehold.co/400x400/e8f5e9/2e7d32?text=Tata+Salt'] },
    { name: 'Fortune Sunflower Oil (1L)', description: 'Refined sunflower oil, rich in Vitamin E', price: 145, originalPrice: 165, category: 'Groceries', unit: 'L', stock: 150, tags: ['oil', 'sunflower', 'cooking'], imageUrls: ['https://placehold.co/400x400/fff3e0/ef6c00?text=Sunflower+Oil'] },
    { name: 'India Gate Basmati Rice (5kg)', description: 'Premium aged basmati rice with long grains', price: 425, originalPrice: 480, category: 'Groceries', unit: 'kg', stock: 100, tags: ['rice', 'basmati', 'staple'], imageUrls: ['https://placehold.co/400x400/f3e5f5/7b1fa2?text=Basmati+Rice'] },
    { name: 'Aashirvaad Atta (5kg)', description: 'Whole wheat flour, 100% whole wheat', price: 265, originalPrice: 295, category: 'Groceries', unit: 'kg', stock: 120, tags: ['atta', 'wheat', 'flour'], imageUrls: ['https://placehold.co/400x400/e3f2fd/1565c0?text=Aashirvaad+Atta'] },
    { name: 'Toor Dal (1kg)', description: 'Unpolished toor dal, high in protein', price: 160, originalPrice: 180, category: 'Groceries', unit: 'kg', stock: 180, tags: ['dal', 'toor', 'pulses'], imageUrls: ['https://placehold.co/400x400/fff8e1/f9a825?text=Toor+Dal'] },
    { name: 'MDH Garam Masala (100g)', description: 'Blend of aromatic spices for Indian dishes', price: 72, originalPrice: 85, category: 'Groceries', unit: 'g', stock: 250, tags: ['masala', 'spices', 'mdh'], imageUrls: ['https://placehold.co/400x400/fce4ec/c62828?text=Garam+Masala'] },
    { name: 'Sugar (1kg)', description: 'Refined white sugar, fine grain', price: 48, originalPrice: 55, category: 'Groceries', unit: 'kg', stock: 300, tags: ['sugar', 'sweetener'], imageUrls: ['https://placehold.co/400x400/f1f8e9/558b2f?text=Sugar'] },

    // ======== FRUITS & VEGETABLES ========
    { name: 'Fresh Bananas (1 dozen)', description: 'Ripe yellow bananas, naturally sweet', price: 50, originalPrice: 60, category: 'Fruits & Vegetables', unit: 'dozen', stock: 80, tags: ['banana', 'fruit', 'fresh'], imageUrls: ['https://placehold.co/400x400/fffde7/f57f17?text=Bananas'] },
    { name: 'Red Onions (1kg)', description: 'Fresh red onions, essential for Indian cooking', price: 35, originalPrice: 40, category: 'Fruits & Vegetables', unit: 'kg', stock: 200, tags: ['onion', 'vegetable', 'fresh'], imageUrls: ['https://placehold.co/400x400/fce4ec/ad1457?text=Red+Onions'] },
    { name: 'Tomatoes (1kg)', description: 'Fresh ripe tomatoes, great for curries and salads', price: 30, originalPrice: 35, category: 'Fruits & Vegetables', unit: 'kg', stock: 180, tags: ['tomato', 'vegetable', 'fresh'], imageUrls: ['https://placehold.co/400x400/ffebee/c62828?text=Tomatoes'] },
    { name: 'Potatoes (1kg)', description: 'Fresh potatoes, versatile cooking vegetable', price: 25, originalPrice: 30, category: 'Fruits & Vegetables', unit: 'kg', stock: 250, tags: ['potato', 'vegetable', 'fresh'], imageUrls: ['https://placehold.co/400x400/efebe9/4e342e?text=Potatoes'] },
    { name: 'Green Apples (500g)', description: 'Crisp green apples, rich in fiber', price: 120, originalPrice: 140, category: 'Fruits & Vegetables', unit: 'g', stock: 60, tags: ['apple', 'fruit', 'fresh'], imageUrls: ['https://placehold.co/400x400/e8f5e9/1b5e20?text=Green+Apples'] },
    { name: 'Fresh Spinach (250g)', description: 'Organic spinach leaves, rich in iron', price: 25, originalPrice: 30, category: 'Fruits & Vegetables', unit: 'g', stock: 100, tags: ['spinach', 'leafy', 'vegetable'], imageUrls: ['https://placehold.co/400x400/c8e6c9/2e7d32?text=Spinach'] },
    { name: 'Mangoes - Alphonso (1kg)', description: 'Premium Alphonso mangoes, king of fruits', price: 350, originalPrice: 400, category: 'Fruits & Vegetables', unit: 'kg', stock: 40, tags: ['mango', 'alphonso', 'fruit'], imageUrls: ['https://placehold.co/400x400/fff9c4/f57f17?text=Alphonso+Mango'] },

    // ======== SNACKS ========
    { name: 'Lays Classic Salted (52g)', description: 'Crispy potato chips with classic salt flavor', price: 20, originalPrice: 20, category: 'Snacks', unit: 'g', stock: 300, tags: ['chips', 'lays', 'snack'], imageUrls: ['https://placehold.co/400x400/fff9c4/f9a825?text=Lays+Classic'] },
    { name: 'Haldiram Aloo Bhujia (200g)', description: 'Traditional spicy potato noodle snack', price: 55, originalPrice: 60, category: 'Snacks', unit: 'g', stock: 200, tags: ['bhujia', 'haldiram', 'namkeen'], imageUrls: ['https://placehold.co/400x400/fff3e0/e65100?text=Aloo+Bhujia'] },
    { name: 'Parle-G Biscuits (250g)', description: 'India\'s favorite glucose biscuits', price: 25, originalPrice: 27, category: 'Snacks', unit: 'g', stock: 350, tags: ['biscuit', 'parle', 'glucose'], imageUrls: ['https://placehold.co/400x400/fff8e1/ff8f00?text=Parle-G'] },
    { name: 'Kurkure Masala Munch (90g)', description: 'Crunchy puffed corn snack with masala flavor', price: 20, originalPrice: 20, category: 'Snacks', unit: 'g', stock: 280, tags: ['kurkure', 'snack', 'masala'], imageUrls: ['https://placehold.co/400x400/f3e5f5/6a1b9a?text=Kurkure'] },
    { name: 'Dark Fantasy Choco Fills (75g)', description: 'Chocolate filled cookies, premium taste', price: 40, originalPrice: 45, category: 'Snacks', unit: 'g', stock: 220, tags: ['cookies', 'chocolate', 'sunfeast'], imageUrls: ['https://placehold.co/400x400/3e2723/d7ccc8?text=Dark+Fantasy'] },
    { name: 'Pringles Original (107g)', description: 'Stackable crispy potato chips', price: 149, originalPrice: 159, category: 'Snacks', unit: 'g', stock: 100, tags: ['pringles', 'chips', 'premium'], imageUrls: ['https://placehold.co/400x400/ffcdd2/b71c1c?text=Pringles'] },

    // ======== DAIRY PRODUCTS ========
    { name: 'Amul Taaza Milk (1L)', description: 'Toned fresh milk, pasteurized and homogenized', price: 56, originalPrice: 58, category: 'Dairy Products', unit: 'L', stock: 150, tags: ['milk', 'amul', 'dairy'], imageUrls: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Amul+Milk'] },
    { name: 'Amul Butter (100g)', description: 'Pasteurized cream butter, great taste', price: 56, originalPrice: 60, category: 'Dairy Products', unit: 'g', stock: 180, tags: ['butter', 'amul', 'dairy'], imageUrls: ['https://placehold.co/400x400/fff9c4/f9a825?text=Amul+Butter'] },
    { name: 'Amul Gold Milk (500ml)', description: 'Full cream milk, rich and creamy', price: 32, originalPrice: 35, category: 'Dairy Products', unit: 'ml', stock: 200, tags: ['milk', 'full cream', 'amul'], imageUrls: ['https://placehold.co/400x400/fff8e1/ff8f00?text=Amul+Gold'] },
    { name: 'Mother Dairy Curd (400g)', description: 'Fresh set curd, smooth and creamy', price: 35, originalPrice: 38, category: 'Dairy Products', unit: 'g', stock: 120, tags: ['curd', 'dahi', 'dairy'], imageUrls: ['https://placehold.co/400x400/e8eaf6/283593?text=Dahi'] },
    { name: 'Amul Cheese Slices (5 pcs)', description: 'Processed cheese slices, perfect for sandwiches', price: 99, originalPrice: 110, category: 'Dairy Products', unit: 'pcs', stock: 100, tags: ['cheese', 'amul', 'slices'], imageUrls: ['https://placehold.co/400x400/ffe0b2/e65100?text=Cheese+Slices'] },
    { name: 'Nestle Milkmaid (400g)', description: 'Sweetened condensed milk for desserts', price: 135, originalPrice: 150, category: 'Dairy Products', unit: 'g', stock: 90, tags: ['milkmaid', 'condensed', 'nestle'], imageUrls: ['https://placehold.co/400x400/fce4ec/880e4f?text=Milkmaid'] },
    { name: 'Greek Yogurt – Plain (200g)', description: 'High protein greek yogurt, no added sugar', price: 80, originalPrice: 95, category: 'Dairy Products', unit: 'g', stock: 60, tags: ['yogurt', 'greek', 'protein'], imageUrls: ['https://placehold.co/400x400/f1f8e9/33691e?text=Greek+Yogurt'] },

    // ======== HOUSEHOLD ITEMS ========
    { name: 'Vim Dishwash Bar (200g)', description: 'Lemon power dishwash bar for sparkling dishes', price: 22, originalPrice: 25, category: 'Household Items', unit: 'g', stock: 300, tags: ['vim', 'dishwash', 'cleaning'], imageUrls: ['https://placehold.co/400x400/e8f5e9/1b5e20?text=Vim+Bar'] },
    { name: 'Surf Excel Quick Wash (500g)', description: 'Detergent powder for superior stain removal', price: 75, originalPrice: 85, category: 'Household Items', unit: 'g', stock: 180, tags: ['surf', 'detergent', 'washing'], imageUrls: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Surf+Excel'] },
    { name: 'Harpic Original (500ml)', description: 'Toilet cleaner with powerful disinfection', price: 85, originalPrice: 95, category: 'Household Items', unit: 'ml', stock: 150, tags: ['harpic', 'toilet', 'cleaner'], imageUrls: ['https://placehold.co/400x400/e8eaf6/1a237e?text=Harpic'] },
    { name: 'Lizol Floor Cleaner (500ml)', description: 'Citrus fragrance disinfectant floor cleaner', price: 99, originalPrice: 115, category: 'Household Items', unit: 'ml', stock: 130, tags: ['lizol', 'floor', 'cleaner'], imageUrls: ['https://placehold.co/400x400/f3e5f5/4a148c?text=Lizol'] },
    { name: 'Colin Glass Cleaner (500ml)', description: 'Streak-free glass and surface cleaner', price: 80, originalPrice: 90, category: 'Household Items', unit: 'ml', stock: 100, tags: ['colin', 'glass', 'cleaner'], imageUrls: ['https://placehold.co/400x400/e0f2f1/004d40?text=Colin'] },
    { name: 'Scotch Brite Scrub Pad (3 pcs)', description: 'Heavy duty scrub pad for tough stains', price: 45, originalPrice: 50, category: 'Household Items', unit: 'pcs', stock: 200, tags: ['scrub', 'cleaning', 'scotchbrite'], imageUrls: ['https://placehold.co/400x400/c8e6c9/1b5e20?text=Scrub+Pad'] },

    // ======== BEVERAGES ========
    { name: 'Tata Tea Gold (500g)', description: 'Premium blend of Assam tea, rich in taste', price: 265, originalPrice: 290, category: 'Beverages', unit: 'g', stock: 120, tags: ['tea', 'tata', 'chai'], imageUrls: ['https://placehold.co/400x400/fff8e1/e65100?text=Tata+Tea'] },
    { name: 'Nescafe Classic Coffee (100g)', description: 'Instant coffee with rich aroma', price: 260, originalPrice: 285, category: 'Beverages', unit: 'g', stock: 110, tags: ['coffee', 'nescafe', 'instant'], imageUrls: ['https://placehold.co/400x400/3e2723/bcaaa4?text=Nescafe'] },
    { name: 'Coca Cola (750ml)', description: 'Classic refreshing cola drink', price: 38, originalPrice: 40, category: 'Beverages', unit: 'ml', stock: 250, tags: ['coke', 'cola', 'soft drink'], imageUrls: ['https://placehold.co/400x400/b71c1c/ffffff?text=Coca+Cola'] },
    { name: 'Frooti Mango Drink (600ml)', description: 'Mango fruit drink, sweet and refreshing', price: 25, originalPrice: 30, category: 'Beverages', unit: 'ml', stock: 200, tags: ['frooti', 'mango', 'juice'], imageUrls: ['https://placehold.co/400x400/fff9c4/e65100?text=Frooti'] },
    { name: 'Red Bull Energy Drink (250ml)', description: 'Energy drink that gives you wings', price: 115, originalPrice: 125, category: 'Beverages', unit: 'ml', stock: 80, tags: ['redbull', 'energy', 'drink'], imageUrls: ['https://placehold.co/400x400/1a237e/e8eaf6?text=Red+Bull'] },
    { name: 'Paper Boat Aam Panna (200ml)', description: 'Traditional raw mango drink', price: 30, originalPrice: 35, category: 'Beverages', unit: 'ml', stock: 150, tags: ['paperboat', 'aam panna', 'mango'], imageUrls: ['https://placehold.co/400x400/c8e6c9/1b5e20?text=Aam+Panna'] },
    { name: 'Bisleri Water (1L)', description: 'Purified mineral water', price: 20, originalPrice: 20, category: 'Beverages', unit: 'L', stock: 500, tags: ['water', 'bisleri', 'mineral'], imageUrls: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Bisleri'] },

    // ======== BAKERY ========
    { name: 'Britannia Bread (Regular)', description: 'Fresh white bread, soft and sliced', price: 40, originalPrice: 45, category: 'Bakery', unit: 'pack', stock: 80, tags: ['bread', 'britannia', 'bakery'], imageUrls: ['https://placehold.co/400x400/fff3e0/e65100?text=Bread'] },
    { name: 'Whole Wheat Bread (400g)', description: 'Healthy whole wheat bread, high in fiber', price: 50, originalPrice: 55, category: 'Bakery', unit: 'g', stock: 70, tags: ['bread', 'wheat', 'healthy'], imageUrls: ['https://placehold.co/400x400/efebe9/3e2723?text=Wheat+Bread'] },
    { name: 'Butter Croissants (2 pcs)', description: 'Freshly baked butter croissants', price: 80, originalPrice: 95, category: 'Bakery', unit: 'pcs', stock: 50, tags: ['croissant', 'butter', 'bakery'], imageUrls: ['https://placehold.co/400x400/fff8e1/ff8f00?text=Croissants'] },
    { name: 'Pav Buns (6 pcs)', description: 'Soft pav buns for pav bhaji or vada pav', price: 30, originalPrice: 35, category: 'Bakery', unit: 'pcs', stock: 100, tags: ['pav', 'buns', 'bakery'], imageUrls: ['https://placehold.co/400x400/ffe0b2/bf360c?text=Pav+Buns'] },
    { name: 'Fruit Cake (250g)', description: 'Rich fruit cake with dry fruits and raisins', price: 120, originalPrice: 140, category: 'Bakery', unit: 'g', stock: 40, tags: ['cake', 'fruit', 'bakery'], imageUrls: ['https://placehold.co/400x400/f8bbd0/880e4f?text=Fruit+Cake'] },
    { name: 'Chocolate Muffin (2 pcs)', description: 'Moist chocolate muffins with choco chips', price: 60, originalPrice: 70, category: 'Bakery', unit: 'pcs', stock: 45, tags: ['muffin', 'chocolate', 'bakery'], imageUrls: ['https://placehold.co/400x400/4e342e/d7ccc8?text=Choco+Muffin'] },

    // ======== INSTANT FOOD ========
    { name: 'Maggi 2-Minute Noodles (70g x 4)', description: 'Instant masala noodles, India\'s favorite', price: 56, originalPrice: 60, category: 'Instant Food', unit: 'pack', stock: 300, tags: ['maggi', 'noodles', 'instant'], imageUrls: ['https://placehold.co/400x400/fff9c4/e65100?text=Maggi'] },
    { name: 'Knorr Tomato Soup (52g)', description: 'Classic thick tomato soup, ready in 5 mins', price: 45, originalPrice: 50, category: 'Instant Food', unit: 'g', stock: 150, tags: ['knorr', 'soup', 'tomato'], imageUrls: ['https://placehold.co/400x400/ffcdd2/b71c1c?text=Tomato+Soup'] },
    { name: 'MTR Ready To Eat Rajma (300g)', description: 'Ready to eat rajma masala, just heat and serve', price: 99, originalPrice: 115, category: 'Instant Food', unit: 'g', stock: 100, tags: ['mtr', 'rajma', 'ready to eat'], imageUrls: ['https://placehold.co/400x400/ffccbc/bf360c?text=MTR+Rajma'] },
    { name: 'Cup Noodles – Mazedaar Masala (70g)', description: 'Instant cup noodles, masala flavor', price: 45, originalPrice: 50, category: 'Instant Food', unit: 'g', stock: 180, tags: ['cup noodles', 'nissin', 'instant'], imageUrls: ['https://placehold.co/400x400/f3e5f5/4a148c?text=Cup+Noodles'] },
    { name: 'Top Ramen Curry Noodles (70g x 4)', description: 'Instant curry flavored noodles pack', price: 52, originalPrice: 60, category: 'Instant Food', unit: 'pack', stock: 160, tags: ['top ramen', 'noodles', 'curry'], imageUrls: ['https://placehold.co/400x400/fff3e0/e65100?text=Top+Ramen'] },
    { name: 'Poha Instant Mix (200g)', description: 'Traditional flattened rice, ready in 10 mins', price: 50, originalPrice: 60, category: 'Instant Food', unit: 'g', stock: 120, tags: ['poha', 'breakfast', 'instant'], imageUrls: ['https://placehold.co/400x400/f1f8e9/33691e?text=Poha+Mix'] },
    { name: 'Upma Instant Mix (200g)', description: 'South Indian semolina breakfast, quick preparation', price: 50, originalPrice: 60, category: 'Instant Food', unit: 'g', stock: 110, tags: ['upma', 'breakfast', 'instant'], imageUrls: ['https://placehold.co/400x400/fff8e1/f57f17?text=Upma+Mix'] },
];

async function runSeed() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/localkart';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Seed test users
    const testUsers = [
        { name: 'Test Buyer', email: 'buyer@test.com', phone: '9999900001', password: '123456', role: 'buyer' },
        { name: 'Test Seller', email: 'seller@test.com', phone: '9999900002', password: '123456', role: 'seller' },
        { name: 'Admin User', email: 'admin@test.com', phone: '9999900003', password: 'admin123', role: 'admin' },
    ];

    for (const u of testUsers) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
            await new User({
                ...u,
                isVerified: true,
                isActive: true,
                kyc: { status: 'verified' }
            }).save();
            console.log(`✓ Seeded user: ${u.email} (${u.role})`);
        } else {
            console.log(`- User already exists: ${u.email}`);
        }
    }

    // 2. Seed seller's store
    const seller = await User.findOne({ email: 'seller@test.com' });
    if (!seller) {
        console.error('Seller user not found!');
        process.exit(1);
    }

    let store = await Store.findOne({ ownerId: seller._id });
    if (!store) {
        store = await new Store({
            ownerId: seller._id,
            storeName: 'LocalKart General Store',
            description: 'Your neighborhood one-stop shop for groceries, snacks, dairy, and daily essentials.',
            phone: '9999900002',
            email: 'seller@test.com',
            address: '123 Main Street, Hyderabad',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500001',
            location: {
                type: 'Point',
                coordinates: [78.4867, 17.3850] // Hyderabad coordinates
            },
            isVerified: true,
            isActive: true,
            isOpen: true,
            categories: ['Groceries', 'Fruits & Vegetables', 'Snacks', 'Dairy Products', 'Household Items', 'Beverages', 'Bakery', 'Instant Food'],
            tags: ['grocery', 'local', 'daily needs'],
            kycStatus: 'verified'
        }).save();
        console.log(`✓ Seeded store: ${store.storeName}`);
    } else {
        console.log(`- Store already exists: ${store.storeName}`);
    }

    // 3. Seed products
    const existingCount = await Product.countDocuments({ storeId: store._id });
    if (existingCount === 0) {
        const productsToInsert = SEED_PRODUCTS.map(p => ({
            ...p,
            storeId: store!._id,
            sellerId: seller._id,
            approvalStatus: 'approved',
            isAvailable: true,
            isActive: true,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            totalRatings: Math.floor(10 + Math.random() * 200),
            totalSold: Math.floor(5 + Math.random() * 100),
            viewCount: Math.floor(20 + Math.random() * 500),
        }));
        await Product.insertMany(productsToInsert);
        console.log(`✓ Seeded ${productsToInsert.length} products`);
    } else {
        console.log(`- Products already exist (${existingCount}), skipping`);
    }

    // 4. Update admin env credentials
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (admin) {
        console.log('\n========================================');
        console.log('  DEFAULT LOGIN CREDENTIALS');
        console.log('========================================');
        console.log('  Buyer:  buyer@test.com  / 123456');
        console.log('  Seller: seller@test.com / 123456');
        console.log('  Admin:  admin@test.com  / admin123');
        console.log('========================================\n');
    }

    console.log('Seed completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
}

runSeed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
