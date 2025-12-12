import { Router} from "express";
import { getNewUserStatistics } from "../controllers/statisticsUser";
import { getTotalNumberAccounts, getNumberAccountsByMonth, getNumberAccountsByYear ,getBestSellingProducts,getAverageRatings,getAverageRatingForProduct, getMonthlyIncomeByRepId,getDailyTrendingProducts,getOrdersByStatus, getBestSellingProductsByRep, getTotalOrders,getTotalSales, getProductsByLikes,getMonthlyIncome, getNumberOrdersByMonth} from '../controllers/Dashboredstat';
import checkRole from "../middlewares/checkRole";



const router = Router();

router.get('/new-users',checkRole( 'admin'), getNewUserStatistics);
router.get('/total-accounts',checkRole( 'admin'), getTotalNumberAccounts);
router.get('/accounts-by-month',checkRole( 'admin'), getNumberAccountsByMonth);
router.get('/accounts-by-year', checkRole( 'admin'),getNumberAccountsByYear);
router.get('/best-selling-products',checkRole('Rep Commerciale', 'admin'), getBestSellingProducts);
router.get('/average-ratings',checkRole('Rep Commerciale', 'admin','client'), getAverageRatings);
// Route pour obtenir la moyenne des avis pour un produit spécifique
router.get('/:productId/average-rating', checkRole('Rep Commerciale', 'admin','client'),getAverageRatingForProduct);
router.get('/income/:repId/monthly', checkRole('Rep Commerciale', 'admin'),getMonthlyIncomeByRepId);
router.get('/trending/daily', checkRole('Rep Commerciale', 'admin'),getDailyTrendingProducts);
router.post('/orders/status', checkRole('Rep Commerciale', 'admin'),getOrdersByStatus);
router.get('/best-sellers/:salesRepId', checkRole('Rep Commerciale', 'admin'),getBestSellingProductsByRep);
router.get('/totalorders',checkRole('Rep Commerciale', 'admin'), getTotalOrders);
router.get('/totalsales',checkRole('Rep Commerciale', 'admin'), getTotalSales);
router.get('/products/top-liked',checkRole('Rep Commerciale', 'admin'), getProductsByLikes); 
router.get('/income/monthly', checkRole( 'admin'),getMonthlyIncome);
router.get('/orders-by-month', checkRole( 'admin'),getNumberOrdersByMonth);

export default router;