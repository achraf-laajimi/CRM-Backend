import { Router } from 'express';
import express, { Request, Response, NextFunction } from 'express';
import { addProduct, getProducts, getProductById, updateProduct, deleteProduct ,getProductsByOwner , cancelPromotion,getPromotionalProducts,getProductsOnPromotionByOwner,setProductOnPromotion,filterProducts,addReview,getReviews,getReviewsByUser} from '../controllers/Produit';
import { likeProduct, unlikeProduct } from '../controllers/likeproducts';
import {requireauth} from '../middlewares/requireauth';
import checkRole from '../middlewares/checkRole';

const router = Router();
router.use(requireauth);


router.post('/add', checkRole('Rep Commerciale', 'admin'),addProduct);


router.get('/get',checkRole('Rep Commerciale', 'admin','client'), getProducts);


router.get('/get/:id',checkRole('Rep Commerciale', 'admin','client'), getProductById);


router.put('/update/:id', checkRole('Rep Commerciale', 'admin'),updateProduct);

router.delete('/delete/:id', checkRole('Rep Commerciale', 'admin'),deleteProduct);

router.get('/owner-count',checkRole( 'admin'), getProductsByOwner);

router.post('/:productId/like',checkRole('client'), likeProduct);

// Route pour retirer un like d'un produit
router.post('/:productId/unlike',checkRole('client'), unlikeProduct);

interface FilterRequest extends Request {
  query: {
    gender?: string;
    category?: string;
    colors?: string;
  };
}

router.get('/filter', checkRole('client'),async (req, res, next) => {
  try {
    // Extract query parameters from the request
    const gender = req.query.gender as 'men' | 'women' | 'kids' | undefined;
    const category = req.query.category as 'all' | 'shoes' | 'clothes' | 'accessories' | undefined;
    const colors = req.query.colors as string | undefined;

    // Prepare the filters object
    const filters = {
      gender,
      category,
      colors: colors ? colors.split(',') : undefined,
    };

    // Call the filterProducts function with the filters
    const products = await filterProducts(filters);

    // Send the products as the response
    res.json(products);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});
// Ajouter un avis à un produit
router.post('/add-review',checkRole('Rep Commerciale', 'admin','client'), addReview);


// Récupérer les avis d'un produit
router.get('/:productId/reviews',checkRole('Rep Commerciale', 'admin','client'), getReviews);
router.get('/reviews/user/:userId', checkRole('Rep Commerciale', 'admin'),getReviewsByUser);
// Route pour mettre un produit en promotion (seulement pour Rep Commerciale)
router.put('/:id/promotion', checkRole('Rep Commerciale'), setProductOnPromotion);

// Route pour obtenir tous les produits en promotion
router.get('/promotion', getPromotionalProducts);
router.get('/promotion/:ownerId', checkRole('Rep Commerciale', 'admin'),getProductsOnPromotionByOwner);
router.patch('/cancel-promotion/:productId',checkRole('Rep Commerciale', 'admin'), cancelPromotion);

export default router;
