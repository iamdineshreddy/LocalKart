import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { Order } from '../models/Order';
import { User } from '../models/User';
import natural from 'natural';

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Preprocess and tokenize text for search
const preprocessText = (text: string): string[] => {
    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    // Remove stop words and short tokens
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been'];
    return tokens.filter(token => !stopWords.includes(token) && token.length > 2);
};

// Calculate TF-IDF scores for products
const calculateProductSimilarity = (searchTokens: string[], productTokens: string[]): number => {
    const tfidf = new TfIdf();

    // Add documents
    tfidf.addDocument(searchTokens.join(' '));
    tfidf.addDocument(productTokens.join(' '));

    // Calculate similarity
    let score = 0;
    searchTokens.forEach(token => {
        const productTfidf = tfidf.tfidf(token, 1);
        score += productTfidf;
    });

    return score / searchTokens.length;
};

// ML-based product search with relevance scoring
export const mlProductSearch = async (
    query: string,
    latitude: number,
    longitude: number,
    filters: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        rating?: number;
        inStock?: boolean;
    } = {},
    page: number = 1,
    limit: number = 20
): Promise<{ products: any[]; total: number; facets: any }> => {
    try {
        // Preprocess search query
        const searchTokens = preprocessText(query);

        // Build base query
        const baseQuery: any = {
            isActive: true,
            isAvailable: true,
            stock: { $gt: 0 }
        };

        if (filters.category && filters.category !== 'all') {
            baseQuery.category = filters.category;
        }

        if (filters.minPrice) {
            baseQuery.price = { $gte: filters.minPrice };
        }

        if (filters.maxPrice) {
            baseQuery.price = { ...baseQuery.price, $lte: filters.maxPrice };
        }

        if (filters.rating) {
            baseQuery.rating = { $gte: filters.rating };
        }

        // Get products matching basic criteria
        const products = await Product.find(baseQuery)
            .populate('storeId', 'storeName rating location city')
            .lean();

        // Calculate ML relevance scores
        const scoredProducts = products.map(product => {
            const productTokens = [
                ...preprocessText(product.name),
                ...preprocessText(product.description),
                ...(product.tags || []),
                ...(product.tagsNLP || []),
                ...preprocessText(product.category)
            ];

            // Calculate various scores
            const textSimilarity = calculateProductSimilarity(searchTokens, productTokens);
            const popularityScore = (product.rating * 0.3) + (product.totalSold * 0.001) + (product.viewCount * 0.0001);
            const stockScore = Math.min(product.stock / 50, 1);

            // Calculate distance-based score if store location exists
            let distanceScore = 1;
            const storeData = product.storeId as any;
            if (storeData && storeData.location) {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    storeData.location.coordinates[1],
                    storeData.location.coordinates[0]
                );
                distanceScore = Math.max(0, 1 - (distance / 10)); // Decay over 10km
            }

            // Combined ML score (weighted)
            const mlScore = (
                (textSimilarity * 0.35) +
                (popularityScore * 0.25) +
                (stockScore * 0.15) +
                (distanceScore * 0.15) +
                (product.rating * 0.1)
            );

            return {
                ...product,
                mlScore,
                textSimilarity,
                popularityScore,
                distanceScore
            };
        });

        // Sort by ML score
        scoredProducts.sort((a, b) => b.mlScore - a.mlScore);

        // Pagination
        const total = scoredProducts.length;
        const paginatedProducts = scoredProducts.slice((page - 1) * limit, page * limit);

        // Generate facets for filtering
        const facets = {
            categories: await getCategoryFacets(baseQuery),
            priceRange: await getPriceRange(baseQuery),
            ratings: [4, 3, 2, 1]
        };

        return {
            products: paginatedProducts,
            total,
            facets
        };
    } catch (error) {
        console.error('ML Search error:', error);
        throw error;
    }
};

// Get category facets
const getCategoryFacets = async (query: any): Promise<any[]> => {
    const facets = await Product.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    return facets.map(f => ({ category: f._id, count: f.count }));
};

// Get price range
const getPriceRange = async (query: any): Promise<{ min: number; max: number }> => {
    const result = await Product.find(query).select('price').sort({ price: 1 }).limit(1);
    const maxResult = await Product.find(query).select('price').sort({ price: -1 }).limit(1);

    return {
        min: result[0]?.price || 0,
        max: maxResult[0]?.price || 1000
    };
};

// Calculate distance (imported from location service concept)
const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Smart price recommendations
export const getPriceRecommendations = async (
    productName: string,
    category: string,
    latitude: number,
    longitude: number
): Promise<{
    bestPrice: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    recommendations: any[];
}> => {
    // Find similar products across all stores
    const products = await Product.find({
        category,
        isActive: true,
        isAvailable: true
    }).populate('storeId', 'storeName rating location');

    if (products.length === 0) {
        return {
            bestPrice: 0,
            averagePrice: 0,
            priceRange: { min: 0, max: 0 },
            recommendations: []
        };
    }

    // Sort by price
    const sortedByPrice = [...products].sort((a, b) => a.price - b.price);

    // Calculate stats
    const prices = products.map(p => p.price);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Get top 5 recommendations with best combination of price, rating, and distance
    const recommendations = products.map(product => {
        const storeData = product.storeId as any;
        const distance = storeData && storeData.location ?
            calculateDistance(latitude, longitude, storeData.location.coordinates[1], storeData.location.coordinates[0]) : 0;

        const score = (product.rating * 10) / (product.price * (1 + distance * 0.1));

        return {
            product,
            store: product.storeId,
            distance,
            score
        };
    })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return {
        bestPrice: sortedByPrice[0].price,
        averagePrice,
        priceRange: {
            min: sortedByPrice[0].price,
            max: sortedByPrice[sortedByPrice.length - 1].price
        },
        recommendations
    };
};

// Personalized recommendations based on order history
export const getPersonalizedRecommendations = async (
    userId: string,
    latitude: number,
    longitude: number,
    limit: number = 20
): Promise<any[]> => {
    try {
        // Get user's order history
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        if (orders.length === 0) {
            // Return popular products if no history
            return getPopularProducts(latitude, longitude, limit);
        }

        // Extract categories from order history
        const categoryCounts: Record<string, number> = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                // We'll need to get category from product - simplified here
                categoryCounts[item.productName] = (categoryCounts[item.productName] || 0) + item.quantity;
            });
        });

        // Get products from favorite categories
        const favoriteProducts = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name);

        // Find similar products
        const products = await Product.find({
            name: { $in: favoriteProducts },
            isActive: true,
            isAvailable: true,
            stock: { $gt: 0 }
        })
            .populate('storeId', 'storeName rating location')
            .limit(limit);

        return products;
    } catch (error) {
        console.error('Personalized recommendations error:', error);
        return getPopularProducts(latitude, longitude, limit);
    }
};

// Get popular products
export const getPopularProducts = async (
    latitude: number,
    longitude: number,
    limit: number = 20
): Promise<any[]> => {
    const products = await Product.find({
        isActive: true,
        isAvailable: true,
        stock: { $gt: 0 }
    })
        .populate('storeId', 'storeName rating location')
        .sort({ totalSold: -1, rating: -1 })
        .limit(limit);

    return products;
};

// Trending products based on recent sales
export const getTrendingProducts = async (
    latitude: number,
    longitude: number,
    days: number = 7,
    limit: number = 20
): Promise<any[]> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate recent orders
    const recentOrders = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: limit }
    ]);

    const productIds = recentOrders.map(o => o._id);

    const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
        isAvailable: true
    })
        .populate('storeId', 'storeName rating location');

    // Sort by recent sales
    return productIds.map(id => products.find(p => p._id.toString() === id.toString())).filter(Boolean);
};

// Auto-complete suggestions
export const getSearchSuggestions = async (query: string, limit: number = 10): Promise<string[]> => {
    const tokens = preprocessText(query);

    if (tokens.length === 0) return [];

    // Search products
    const products = await Product.find({
        name: { $regex: tokens.join('|'), $options: 'i' },
        isActive: true
    })
        .select('name category brand')
        .limit(limit);

    // Extract unique suggestions
    const suggestions = new Set<string>();
    products.forEach(p => {
        suggestions.add(p.name);
        if (p.brand) suggestions.add(p.brand);
    });

    return Array.from(suggestions).slice(0, limit);
};
