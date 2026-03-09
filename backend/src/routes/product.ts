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
import { productValidation } from '../middleware/validate';

const router = Router();

// Public routes (static paths first)
router.get('/search', optionalAuth, searchProducts);
router.get('/suggestions', getSuggestions);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/trending', getTrending);
router.get('/category/:category', getProductsByCategory);
router.get('/price-recommendations', getProductPriceRecommendations);

// Seller routes (must come before /:productId wildcard)
router.get('/seller/my-products', authenticate, isSeller, getMyProducts);
router.post('/', authenticate, isSeller, productValidation, createProduct);
router.put('/:productId', authenticate, isSeller, productValidation, updateProduct);
router.delete('/:productId', authenticate, isSeller, deleteProduct);

// Wildcard routes LAST to prevent shadowing
router.get('/details/:productId', getProductDetails);
router.get('/:productId', optionalAuth, getProductDetails);

export default router;
