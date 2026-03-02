import { Router } from 'express';
import {
    searchProducts,
    getSuggestions,
    getProductPriceRecommendations,
    getRecommendations,
    getTrending,
    getProductDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
    getProductsByCategory
} from '../controllers/productController';
import { authenticate, isSeller, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/search', optionalAuth, searchProducts);
router.get('/suggestions', getSuggestions);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/trending', getTrending);
router.get('/category/:category', getProductsByCategory);
router.get('/price-recommendations', getProductPriceRecommendations);
router.get('/:productId', optionalAuth, getProductDetails);

// Seller routes
router.post('/', authenticate, isSeller, createProduct);
router.put('/:productId', authenticate, isSeller, updateProduct);
router.delete('/:productId', authenticate, isSeller, deleteProduct);
router.get('/seller/my-products', authenticate, isSeller, getMyProducts);

// Alias for getProductDetails
router.get('/details/:productId', getProductDetails);

export default router;
