import { Request, Response } from 'express';
import Product from '../models/ProductModel';
import User from '../models/UserModel';

// Fonction pour liker un produit
export const likeProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.body.userId; // ID de l'utilisateur qui like le produit

    // Trouver le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ajouter l'ID de l'utilisateur à la liste des likes si ce n'est pas déjà le cas
    if (!product.likes.includes(userId)) {
      product.likes.push(userId);
      await product.save();
      res.status(200).json({ message: 'Product liked successfully', product });
    } else {
      res.status(400).json({ message: 'Product already liked by this user' });
    }
  } catch (error) {
    console.error('Error liking product:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

// Fonction pour retirer un like d'un produit
export const unlikeProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.body.userId; // ID de l'utilisateur qui retire le like

    // Trouver le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Retirer l'ID de l'utilisateur de la liste des likes
    if (product.likes.includes(userId)) {
      product.likes = product.likes.filter(like => like.toString() !== userId);
      await product.save();
      res.status(200).json({ message: 'Product unliked successfully', product });
    } else {
      res.status(400).json({ message: 'Product not liked by this user' });
    }
  } catch (error) {
    console.error('Error unliking product:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
