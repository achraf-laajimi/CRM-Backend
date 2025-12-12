import Order, { IOrder } from '../models/Order';
import User from '../models/UserModel';
import Product from '../models/ProductModel';
import { Request, Response } from 'express';
import{sendMail} from '../sendMail' 
import { IProduct } from '../models/ProductModel';

// Fonction pour passer une commande
export const placeOrder = async (req: Request, res: Response) => {
  try {
      const { userId, products, paymentMethod, shippingAddress } = req.body;

      // Validate the user
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Calculate the total amount and validate products
      let totalAmount = 0;
      const productDetails = [];

      for (const item of products) {
          const product = await Product.findById(item.productId);
          if (!product) {
              return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
          }

          // Check stock availability
          if (product.stock < item.quantity) {
              return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
          }

          totalAmount += product.price * item.quantity;
          productDetails.push({
              product: product._id,
              quantity: item.quantity
          });

          // Update product stock and sales
          product.stock -= item.quantity;
          product.sales += item.quantity;
          await product.save();
      }

      // Create the order
      const newOrder = new Order({
          user: user._id,
          products: productDetails,
          totalAmount,
          paymentMethod,
          shippingAddress
      });

      // Save the order to the database
      await newOrder.save();

      // Send order confirmation email
      await sendMail(user.email, 'Order Confirmation', `Thank you for your order! Here are the details: ${JSON.stringify(newOrder)}`);

      // Return success response
      return res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
      console.error('Error placing order:', error);

      // Type guard to check if the error is an instance of Error
      if (error instanceof Error) {
          if (error.name === 'ValidationError') {
              return res.status(400).json({ message: 'Validation Error', details: error.message });
          }
          return res.status(500).json({ message: 'Internal server error', details: error.message });
      }

      // Fallback for unknown error types
      return res.status(500).json({ message: 'Internal server error', details: 'An unknown error occurred' });
  }
};

// Fonction pour annuler une commande
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Trouver la commande par son ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Vérifier si la commande est déjà annulée
    if (order.status === 'canceled') {
      return res.status(400).json({ message: 'Order is already canceled' });
    }

    // Récupérer les produits de la commande et restaurer le stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Mettre à jour le statut de la commande à 'canceled'
    order.status = 'canceled';
    await order.save();

    return res.status(200).json({ message: 'Order canceled successfully', order });
  } catch (error) {
    console.error('Error canceling order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fonction pour obtenir les statistiques des commandes
export const getOrderStatistics = async (req: Request, res: Response) => {
  try {
    // Calculer le nombre total de commandes
    const totalOrders = await Order.countDocuments();

    // Calculer le nombre total de commandes livrées
    const totalDelivered = await Order.countDocuments({ status: 'delivered' });

    // Calculer le nombre total de commandes annulées
    const totalCanceled = await Order.countDocuments({ status: 'canceled' });

    // Calculer le revenu total
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    // Extraire le revenu total de la réponse d'agrégation
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0;

    res.json({
      totalOrders,
      totalDelivered,
      totalCanceled,
      totalRevenue: revenue
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ error: 'Error fetching order statistics', details: (error as Error).message });
  }
};

// Fonction pour confirmer une commande
export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { email, orderDetails } = req.body; // Assurez-vous que ces données sont envoyées depuis le frontend

    // Préparer le contenu de l'e-mail
    const subject = 'Confirmation de votre commande';
    const text = `Merci pour votre commande ! Voici les détails : ${orderDetails}`;

    // Envoyer l'e-mail de confirmation
    await sendMail(email, subject, text);

    res.status(200).json({ message: 'Commande confirmée et e-mail envoyé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la confirmation de la commande' });
  }
};
// Fonction pour obtenir les commandes d'un client par ID avec détails
export const getOrdersByClientId = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id; // Obtenez l'ID du client depuis les paramètres de la requête

    // Valider l'ID du client
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    // Récupérer les commandes associées à l'ID du client
    const orders = await Order.find({ user: clientId })
      .populate('products.product') // Si vous avez besoin d'informations sur les produits
      .select('user products totalAmount status createdAt') // Sélectionner les champs à retourner
      .exec();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this client' });
    }

    // Retourner les commandes trouvées avec les détails
    res.json(orders.map(order => ({
      id: order._id,
      date: order.createdAt,
      numberOfProducts: order.products.length,
      totalAmount: order.totalAmount,
      status: order.status,
      products: order.products.map(p => ({
        productId: (p.product as IProduct)._id,
        quantity: p.quantity
      }))
    })));
  } catch (error) {
    console.error('Error fetching orders by client ID:', error);
    res.status(500).json({ error: 'Error fetching orders by client ID', details: (error as Error).message });
  }
};