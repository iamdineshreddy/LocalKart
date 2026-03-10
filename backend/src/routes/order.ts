import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createOrder, getMyOrders, getOrderDetails, cancelOrder } from '../controllers/orderController';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderDetails);
router.put('/:id/cancel', authenticate, cancelOrder);

export default router;
