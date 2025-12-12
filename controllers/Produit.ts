import { Request, Response } from 'express';
import Product from '../models/ProductModel';
import User from '../models/UserModel';
import { Types } from 'mongoose';


const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock, imageBase64, ownerId, gender,colors } = req.body;

    // Vérifier que l'ownerId correspond bien à un utilisateur de type "Rep Commerciale"
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'Rep Commerciale') {
      return res.status(400).json({ error: 'Invalid owner or not a Rep Commerciale' });
    }

   const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl: imageBase64, // Assigner les données de l'image en base64
      owner: ownerId
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'An error occurred while adding the product' });
  }
};

// Obtenir tous les produits
const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('owner');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products' });
  }
};

// Obtenir un produit par ID
const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate('owner');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'An error occurred while fetching the product' });
  }
};

// Mettre à jour un produit
const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Optionnel: Vérifier que l'ownerId correspond à un utilisateur de type "Rep Commerciale" si modifié
    if (updateData.ownerId) {
      const owner = await User.findById(updateData.ownerId);
      if (!owner || owner.role !== 'Rep Commerciale') {
        return res.status(400).json({ error: 'Invalid owner or not a Rep Commerciale' });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'An error occurred while updating the product' });
  }
};

// Supprimer un produit
const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'An error occurred while deleting the product' });
  }
};

const getProductsByOwner = async (req: Request, res: Response) => {
  try {
    // Pipeline d'agrégation pour compter les produits par propriétaire
    const ownerProductCounts = await Product.aggregate([
      {
        $group: {
          _id: '$owner', // Grouper par le champ owner
          productCount: { $sum: 1 } // Compter le nombre de produits pour chaque propriétaire
        }
      },
      {
        $lookup: {
          from: 'users', // Assurez-vous que le nom de la collection est correct
          localField: '_id',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $unwind: '$owner'
      },
      {
        $project: {
          _id: 0,
          ownerId: '$_id',
          ownerName: { $concat: ['$owner.firstName', ' ', '$owner.lastName'] },
          productCount: 1
        }
      }
    ]);

    res.json(ownerProductCounts);
  } catch (error) {
    console.error('Error fetching products by owner:', error);
    res.status(500).json({ error: 'An error occurred while fetching products by owner' });
  }
};
const filterProducts =  async (
  filters: {
  gender?: 'men' | 'women' | 'kids';
  category?: 'all' | 'shoes' | 'clothes' | 'accessories';
  colors?: string[];
}

) => {
  const query: any = {};

  if (filters.gender) {
    query.gender = filters.gender;
  }

  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }

  if (filters.colors && filters.colors.length > 0) {
    query.colors = { $in: filters.colors };
  }

  try {
    const products = await Product.find(query);
    return products;
  } catch (error) {
    throw new Error(`Error filtering products: ${(error as any).message}`);
  }
};
// Ajouter un avis à un produit
 const addReview = async (req: Request, res: Response) => {
  try {
    const { productId, userId, rating, comment } = req.body;

    if (!productId || !userId || rating === undefined || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.reviews.push({ user: userId, rating, comment, date: new Date() });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Error adding review', details: (error as Error).message });
  }
};
 const getReviews = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    // Assurez-vous que productId est un ObjectId valide
    if (!Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(productId).populate('reviews');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product.reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Error fetching reviews', details: (error as Error).message });
  }
};
const getReviewsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Ensure userId is a valid ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find all products containing reviews by this user
    const products = await Product.find({ 'reviews.user': userId });

    if (!products.length) {
      return res.status(404).json({ error: 'No reviews found for this user' });
    }

    // Extract the reviews for the user, along with product details
    const reviewsWithProductDetails = products.flatMap(product =>
      product.reviews
        .filter(review => review.user.toString() === userId)
        .map(review => ({
          ...review.toObject(), // Convert review to plain object
          productName: product.name,
          productImage: product.imageUrl // Adjust field name if different
        }))
    );

    res.json(reviewsWithProductDetails);
  } catch (error) {
    console.error('Error fetching reviews by user:', error);
    res.status(500).json({ error: 'Error fetching reviews by user', details: (error as Error).message });
  }
};

// Mettre un produit en promotion
const setProductOnPromotion = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const { price, promotionDetails } = req.body;

    // Vérifier que l'ID du produit est valide
    if (!productId || !price || !promotionDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Trouver le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Mettre à jour les informations de promotion
    product.isPromotion = true;
    product.price = price;
    product.promotionDetails = promotionDetails;

    // Sauvegarder les modifications
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error setting product on promotion:', error);
    res.status(500).json({ error: 'An error occurred while setting the product on promotion' });
  }
};
// Obtenir tous les produits en promotion
const getPromotionalProducts = async (req: Request, res: Response) => {
  try {
    // Récupérer tous les produits où isPromotion est true
    const productsOnPromotion = await Product.find({ isPromotion: true });

    if (productsOnPromotion.length === 0) {
      return res.status(404).json({ message: 'No products on promotion found' });
    }

    res.json(productsOnPromotion);
  } catch (error) {
    console.error('Error fetching products on promotion:', error);
    res.status(500).json({ error: 'An error occurred while fetching products on promotion' });
  }
};
const getProductsOnPromotionByOwner = async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.ownerId;

    // Assurez-vous que ownerId est un ObjectId valide
    if (!Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: 'Invalid owner ID' });
    }

    // Trouver tous les produits en promotion pour le représentant commercial spécifié
    const productsOnPromotion = await Product.find({
      owner: ownerId,
      isPromotion: true
    });

    if (productsOnPromotion.length === 0) {
      return res.status(404).json({ message: 'No products on promotion found for this representative' });
    }

    res.json(productsOnPromotion);
  } catch (error) {
    console.error('Error fetching products on promotion by owner:', error);
    res.status(500).json({ error: 'An error occurred while fetching products on promotion by owner' });
  }
};
// Annuler la promotion d'un produit
const cancelPromotion = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    // Assurez-vous que productId est un ObjectId valide
    if (!Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Trouver et mettre à jour le produit pour annuler la promotion
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { isPromotion: false, promotionDetails: '' }, // Annuler la promotion en mettant isPromotion à false
      { new: true } // Retourner le produit mis à jour
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Promotion canceled successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error canceling promotion:', error);
    res.status(500).json({ error: 'An error occurred while canceling the promotion' });
  }
};

export { addProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductsByOwner, filterProducts,addReview,getReviews,getReviewsByUser,setProductOnPromotion, getPromotionalProducts,getProductsOnPromotionByOwner ,cancelPromotion};
