import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Input Validation Middleware
 * Uses express-validator for request body/params/query validation
 */

// Generic handler: returns 400 with validation errors if any
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
        });
        return;
    }
    next();
};

// Review validation rules
export const reviewValidation = [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('storeId').notEmpty().withMessage('Store ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('text').isLength({ min: 5, max: 1000 }).withMessage('Review text must be 5-1000 chars'),
    handleValidationErrors,
];

// Report validation rules
export const reportValidation = [
    body('sellerId').notEmpty().withMessage('Seller ID is required'),
    body('storeId').notEmpty().withMessage('Store ID is required'),
    body('type').isIn(['fake_product', 'scam', 'harassment', 'counterfeit', 'non_delivery', 'other']).withMessage('Invalid report type'),
    body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 chars'),
    handleValidationErrors,
];

// Email login validation
export const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
];

// Email signup validation
export const signupValidation = [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
];

// Product validation
export const productValidation = [
    body('name').isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),
    body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit').optional().isString(),
    body('stock').optional().isInt({ min: 0 }),
    handleValidationErrors,
];

// Store validation
export const storeValidation = [
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Store name must be between 2 and 100 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
    body('phone').optional().isMobilePhone('en-IN').withMessage('Valid phone number required'),
    handleValidationErrors,
];

// Order validation
export const orderValidation = [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId').notEmpty().withMessage('Product ID required for all items'),
    body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
    body('address').notEmpty().withMessage('Delivery address is required'),
    body('paymentMethod').isIn(['online', 'cod']).withMessage('Invalid payment method'),
    handleValidationErrors,
];
