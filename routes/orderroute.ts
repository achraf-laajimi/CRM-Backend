import express from 'express';
import { placeOrder, cancelOrder,getOrderStatistics,getOrdersByClientId } from '../controllers/orderController'; 
import { getAllOrders,getOrderById } from '../controllers/crudorder';
import {requireauth} from '../middlewares/requireauth';
import checkRole from '../middlewares/checkRole';

const router = express.Router();
router.use(requireauth);


router.post('/passer', checkRole('Rep Commerciale', 'admin','client'), placeOrder);
router.put('/:orderId/cancel',checkRole('Rep Commerciale', 'admin','client'), cancelOrder);
router.get('/allorders', checkRole('Rep Commerciale', 'admin'),getAllOrders);
router.get('/orderdetails/:orderId',checkRole('Rep Commerciale', 'admin'), getOrderById);
router.get('/statistics', checkRole('Rep Commerciale', 'admin'),getOrderStatistics);
router.get('/client/:id', checkRole('Rep Commerciale', 'admin'),getOrdersByClientId); // Route pour obtenir les commandes par ID client



export default router;
