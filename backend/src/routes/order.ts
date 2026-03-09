import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { orderValidation } from '../middleware/validate';

const router = Router();

router.post('/', authenticate, orderValidation, createOrder);
router.get('/me', authenticate, getMyOrders);

export default router;
