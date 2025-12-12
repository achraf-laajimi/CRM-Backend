import { Request, Response } from 'express';
import Order from '../models/Order';


// Fonction pour obtenir toutes les commandes
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Récupérer toutes les commandes
    const orders = await Order.find().populate('user').populate('products.product');

    // Vérifier si des commandes existent
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    // Réponse avec les commandes trouvées
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Trouver la commande par ID
    const order = await Order.findById(orderId)
      .populate('user') // Si vous avez des références d'utilisateur
      .populate('products.product'); // Si vous avez des références de produit

    // Vérifier si la commande existe
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Réponse avec la commande trouvée
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};