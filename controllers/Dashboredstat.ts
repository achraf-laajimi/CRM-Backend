import User from '../models/UserModel';
import Product from '../models/ProductModel';
import { Request, Response } from 'express';
import Order from '../models/Order';

// Fonction pour obtenir le nombre total de comptes
export const getTotalNumberAccounts = async (req: Request, res: Response) => {
  try {
    const totalAccounts = await User.countDocuments();
    res.json({ totalAccounts });
  } catch (error) {
    console.error('Error fetching total number of accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fonction pour obtenir le nombre de comptes créés par mois
export const getNumberAccountsByMonth = async (req: Request, res: Response) => {
  try {
    const accountsByMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Trie par mois
    ]);
    res.json({ accountsByMonth });
  } catch (error) {
    console.error('Error fetching number of accounts by month:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fonction pour obtenir le nombre de comptes créés par an
export const getNumberAccountsByYear = async (req: Request, res: Response) => {
  try {
    const accountsByYear = await User.aggregate([
      {
        $group: {
          _id: { $year: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Trie par année
    ]);
    res.json({ accountsByYear });
  } catch (error) {
    console.error('Error fetching number of accounts by year:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fonction pour obtenir les produits triés par meilleures ventes
export const getBestSellingProducts = async (req: Request, res: Response) => {
  try {
    // Récupérer les produits triés par nombre de ventes (du plus élevé au plus bas)
    const products = await Product.find().sort({ sales: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching best-selling products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fonction pour obtenir la moyenne des avis pour chaque produit
export const getAverageRatings = async (req: Request, res: Response) => {
  try {
    // Trouver tous les produits
    const products = await Product.find();

    // Calculer la moyenne des avis pour chaque produit
    const productRatings = products.map(product => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        productId: product._id,
        name: product.name,
        averageRating
      };
    });

    res.json(productRatings);
  } catch (error) {
    console.error('Error fetching average ratings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Fonction pour obtenir la moyenne des avis pour un produit spécifique
export const getAverageRatingForProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // Trouver le produit par son ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculer la moyenne des avis
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    res.json({
      productId: product._id,
      name: product.name,
      averageRating
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Fonction pour obtenir le revenu total par mois pour un représentant commercial spécifique
export const getMonthlyIncomeByRepId = async (req: Request, res: Response) => {
  try {
    const repId = req.params.repId; // ID du représentant commercial
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    if (!repId) {
      return res.status(400).json({ message: 'Representative ID is required' });
    }

    // Calculer le revenu total par mois pour le représentant commercial spécifié
    const incomeData = await Order.aggregate([
      { 
        $match: { 
          repCommercial: repId, // Filtrer par ID du représentant commercial
          createdAt: { 
            $gte: new Date(year, month - 1, 1), 
            $lt: new Date(year, month, 1) 
          }
        }
      },
      { 
        $unwind: '$products' 
      },
      { 
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { 
        $unwind: '$productDetails' 
      },
      { 
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalIncome: { 
            $sum: { $multiply: ['$products.quantity', '$productDetails.price'] }
          }
        }
      },
      { 
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          totalIncome: 1
        }
      }
    ]);

    if (incomeData.length === 0) {
      return res.status(404).json({ message: 'No income data found for this representative' });
    }

    res.json(incomeData);
  } catch (error) {
    console.error('Error fetching monthly income by rep ID:', error);
    res.status(500).json({ error: 'Error fetching monthly income by rep ID' });
  }
};
// Fonction pour obtenir les 3 produits les plus populaires de la journée
export const getDailyTrendingProducts = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Début de la journée

    const trendingProducts = await Product.find({
      createdAt: { $gte: today }
    })
    .sort({ sales: -1 }) // Trie par nombre de ventes, décroissant
    .limit(3); // Limite à 3 produits

    res.json(trendingProducts);
  } catch (error) {
    console.error('Error fetching daily trending products:', error);
    res.status(500).json({ error: 'Error fetching daily trending products' });
  }
};
// Fonction pour obtenir le nombre de commandes par statut en fonction de la période et de l'ID du représentant commercial
export const getOrdersByStatus = async (req: Request, res: Response) => {
  try {
    const { period, salesRepId } = req.body; // Recevoir la période et l'ID du représentant commercial dans le corps de la requête

    // Déterminer les dates de début et de fin selon la période spécifiée
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        const currentDay = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - currentDay)); // Début de la semaine
        endDate = new Date(now.setDate(now.getDate() - currentDay + 6)); // Fin de la semaine
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Début du mois
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Fin du mois
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return res.status(400).json({ message: 'Invalid period' });
    }

    // Calculer le nombre de commandes pour chaque statut
    const [onDelivery, delivered, canceled] = await Promise.all([
      Order.countDocuments({
        status: 'on delivery',
        createdAt: { $gte: startDate, $lte: endDate },
        'salesRep': salesRepId
      }),
      Order.countDocuments({
        status: 'delivered',
        createdAt: { $gte: startDate, $lte: endDate },
        'salesRep': salesRepId
      }),
      Order.countDocuments({
        status: 'canceled',
        createdAt: { $gte: startDate, $lte: endDate },
        'salesRep': salesRepId
      })
    ]);

    res.json({
      onDelivery,
      delivered,
      canceled
    });
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({ error: 'Error fetching orders by status', details: (error as Error).message });
  }
};


// Fonction pour obtenir les produits les plus vendus pour un représentant commercial spécifique
export const getBestSellingProductsByRep = async (req: Request, res: Response) => {
  try {
    const { salesRepId } = req.params; // ID du représentant commercial passé en paramètre d'URL

    // Assurez-vous que salesRepId est fourni
    if (!salesRepId) {
      return res.status(400).json({ message: 'Sales representative ID is required' });
    }

    // Obtenir les produits associés au représentant commercial et les trier par nombre de ventes décroissant
    console.log('Fetching best selling products for salesRepId:', salesRepId);
    const bestSellingProducts = await Product.find({ salesRepId }).sort({ sales: -1 }).limit(3);
    console.log('Best selling products:', bestSellingProducts);

    res.json(bestSellingProducts);
  } catch (error) {
    console.error('Error fetching best selling products by rep:', error);
    res.status(500).json({ error: 'Error fetching best selling products by rep', details: (error as Error).message });
  }
};
// Fonction pour obtenir le nombre total de commandes passées sur le site
export const getTotalOrders = async (req: Request, res: Response) => {
  try {
    // Compter le nombre total de commandes
    const totalOrders = await Order.countDocuments();

    res.json({ totalOrders });
  } catch (error) {
    console.error('Error fetching total orders:', error);
    res.status(500).json({ error: 'Error fetching total orders', details: (error as Error).message });
  }
};

// Fonction pour obtenir le total des ventes
export const getTotalSales = async (req: Request, res: Response) => {
  try {
    // Calculer le total des ventes en sommant les montants des commandes
    const totalSales = await Order.aggregate([
      { $match: { status: 'pending' } }, 
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);

    // Extraire le montant total des ventes
    const sales = totalSales.length > 0 ? totalSales[0].totalSales : 0;

    res.json({ totalSales: sales });
  } catch (error) {
    console.error('Error fetching total sales:', error);
    res.status(500).json({ error: 'Error fetching total sales', details: (error as Error).message });
  }
};
// Fonction pour obtenir les produits triés par nombre de likes
export const getProductsByLikes = async (req: Request, res: Response) => {
  try {
    // Récupérer les produits triés par nombre de likes (plus grand nombre de likes en premier)
    const products = await Product.find({})
      .sort({ 'likes.length': -1 }) // Tri par nombre de likes, décroissant
      .populate('likes', 'username') // Optionnel : peupler les informations des utilisateurs qui ont liké
      .exec();

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by likes:', error);
    res.status(500).json({ error: 'Error fetching products by likes', details: (error as Error).message });
  }
};
export const getMonthlyIncome = async (req: Request, res: Response) => {
  try {
    const incomeByMonth = await Order.aggregate([
      {
        $match: { status: 'pending' } // Filter for pending orders
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalIncome: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);
    res.json({ incomeByMonth });
  } catch (error) {
    console.error('Error fetching monthly income for pending orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getNumberOrdersByMonth = async (req: Request, res: Response) => {
  try {
    const ordersByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);
    res.json({ ordersByMonth });
  } catch (error) {
    console.error('Error fetching number of orders by month:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

