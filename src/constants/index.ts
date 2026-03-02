import { Product, Category } from '../types';

export const MOCK_PRODUCTS: Product[] = [
    // Fruits & Vegetables
    {
        id: '1',
        name: 'Desi Avocados',
        description: 'Creamy and ripe avocados, perfect for your morning toast.',
        price: 290,
        category: Category.FRUITS_VEGGIES,
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800',
        sellerId: 's5',
        sellerName: 'Rahul Kirana Store',
        unit: '2 pcs',
        stock: 40
    },
    {
        id: '2',
        name: 'Fresh Palak Bhaji',
        description: 'Organic baby spinach leaves, triple washed and ready to eat.',
        price: 250,
        category: Category.FRUITS_VEGGIES,
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',
        sellerId: 's5',
        sellerName: 'Rahul Kirana Store',
        unit: '200g',
        stock: 35
    },
    {
        id: '3',
        name: 'Desi Tamatar',
        description: 'Juicy and ripe tomatoes, perfect for salads or cooking.',
        price: 210,
        category: Category.FRUITS_VEGGIES,
        imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?auto=format&fit=crop&q=80&w=800',
        sellerId: 's5',
        sellerName: 'Rahul Kirana Store',
        unit: '500g',
        stock: 50
    },
    // Snacks & Munchies
    {
        id: '4',
        name: 'Kurkure Masala Munch',
        description: 'The iconic Indian corn puffs for instant munching.',
        price: 210,
        category: Category.SNACKS_MUNCHIES,
        imageUrl: 'https://images.unsplash.com/photo-1566478431375-704332f503f3?auto=format&fit=crop&q=80&w=800',
        sellerId: 's2',
        sellerName: 'Sharma General Store',
        unit: 'can',
        stock: 100
    },
    {
        id: '5',
        name: 'Lays Classic Chips',
        description: 'Crispy and salty potato chips, a timeless snack.',
        price: 170,
        category: Category.SNACKS_MUNCHIES,
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=800',
        sellerId: 's2',
        sellerName: 'Sharma General Store',
        unit: '150g',
        stock: 80
    },
    {
        id: '6',
        name: 'Parle-G Biscuits',
        description: 'India\'s favorite biscuit, perfect with chai.',
        price: 270,
        category: Category.SNACKS_MUNCHIES,
        imageUrl: 'https://images.unsplash.com/photo-1590080875897-6e82de783a3c?auto=format&fit=crop&q=80&w=800',
        sellerId: 's2',
        sellerName: 'Sharma General Store',
        unit: '300g',
        stock: 60
    },
    // Drinks & Juices
    {
        id: '7',
        name: 'Bruzers Coffee Powder',
        description: 'Medium roast ground coffee with notes of cocoa and nuts.',
        price: 910,
        category: Category.DRINKS_JUICES,
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
        sellerId: 's6',
        sellerName: 'Chai Point Depot',
        unit: '250g',
        stock: 25
    },
    {
        id: '8',
        name: 'Fresh Santra Juice',
        description: '100% pure orange juice, no added sugar.',
        price: 410,
        category: Category.DRINKS_JUICES,
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800',
        sellerId: 's6',
        sellerName: 'Chai Point Depot',
        unit: '1L',
        stock: 30
    },
    {
        id: '9',
        name: 'Thums Up Cola Pack',
        description: 'Refreshing cola drink, perfect for parties.',
        price: 500,
        category: Category.DRINKS_JUICES,
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800',
        sellerId: 's6',
        sellerName: 'Chai Point Depot',
        unit: '6 cans',
        stock: 45
    },
    // Dairy, Bread & Eggs
    {
        id: '10',
        name: 'Amul Dahi',
        description: 'Thick, creamy and high-protein plain yogurt.',
        price: 370,
        category: Category.DAIRY_BREAD,
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800',
        sellerId: 's3',
        sellerName: 'Gupta Dairy & Provisions',
        unit: '500g',
        stock: 30
    },
    {
        id: '11',
        name: 'Farm Fresh Andhe',
        description: 'Farm fresh eggs, rich in protein.',
        price: 330,
        category: Category.DAIRY_BREAD,
        imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800',
        sellerId: 's3',
        sellerName: 'Gupta Dairy & Provisions',
        unit: '12 pcs',
        stock: 70
    },
    {
        id: '12',
        name: 'Whole Wheat Atta Bread',
        description: 'Healthy whole wheat bread, perfect for sandwiches.',
        price: 250,
        category: Category.DAIRY_BREAD,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
        sellerId: 's3',
        sellerName: 'Gupta Dairy & Provisions',
        unit: '400g',
        stock: 40
    },
    // Meat & Fish
    {
        id: '13',
        name: 'Fresh Murgi Breast',
        description: 'Boneless skinless chicken breast, lean and tender.',
        price: 750,
        category: Category.MEAT_FISH,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800',
        sellerId: 's7',
        sellerName: 'Maharaja Meat Shop',
        unit: '500g',
        stock: 20
    },
    {
        id: '14',
        name: 'Fresh Rohu Fish',
        description: 'Fresh Indian carp, rich in protein.',
        price: 1080,
        category: Category.MEAT_FISH,
        imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80&w=800',
        sellerId: 's7',
        sellerName: 'Maharaja Meat Shop',
        unit: '400g',
        stock: 15
    },
    // Personal Care
    {
        id: '15',
        name: 'Santoor Soap',
        description: 'Gentle moisturizing soap for soft skin.',
        price: 210,
        category: Category.PERSONAL_CARE,
        imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
        sellerId: 's4',
        sellerName: 'Singh Pharmacy',
        unit: '4 bars',
        stock: 55
    },
    {
        id: '16',
        name: 'Colgate Toothpaste',
        description: 'Advanced whitening toothpaste for a brighter smile.',
        price: 330,
        category: Category.PERSONAL_CARE,
        imageUrl: 'https://images.unsplash.com/photo-1559650656-5ab4b2e5d9d4?auto=format&fit=crop&q=80&w=800',
        sellerId: 's4',
        sellerName: 'Singh Pharmacy',
        unit: '150g',
        stock: 45
    },
    // Home & Office
    {
        id: '17',
        name: 'Wireless Mouse',
        description: 'High performance wireless mouse for your home office setup.',
        price: 3320,
        category: Category.HOME_OFFICE,
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
        sellerId: 's1',
        sellerName: 'Tech Solutions',
        unit: 'piece',
        stock: 50
    },
    {
        id: '18',
        name: 'Ghadi Detergent Liquid',
        description: 'Tough stain removal for front load washing machines.',
        price: 660,
        category: Category.HOME_OFFICE,
        imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800',
        sellerId: 's4',
        sellerName: 'Singh Pharmacy',
        unit: '1L',
        stock: 60
    },
    // Pantry
    {
        id: '19',
        name: 'Basmati Rice Premium',
        description: 'Long grain aromatic basmati rice.',
        price: 750,
        category: Category.PANTRY,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
        sellerId: 's8',
        sellerName: 'Sharma General Store',
        unit: '5kg',
        stock: 25
    },
    {
        id: '20',
        name: 'Tata Salt',
        description: 'Pure iodized salt for everyday cooking.',
        price: 120,
        category: Category.PANTRY,
        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
        sellerId: 's8',
        sellerName: 'Sharma General Store',
        unit: '1kg',
        stock: 100
    }
];
