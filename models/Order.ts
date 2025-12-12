import { Schema, model, Document } from 'mongoose';
import { IUser } from './UserModel';
import { IProduct } from './ProductModel';

// Définir l'interface pour le modèle Commande
export interface IOrder extends Document {
  user: Schema.Types.ObjectId | IUser; // Référence à un utilisateur
  products: {
    product: Schema.Types.ObjectId | IProduct; // Référence à un produit
    quantity: number; // Quantité de produit
  }[];
  totalAmount: number; // Montant total de la commande
  status: 'pending' |  'delivered' | 'canceled'; 
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer'; 
  shippingAddress: string; 
  createdAt?: Date; 
  updatedAt?: Date; 
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product is required']
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1']
        }
      }
    ],
    totalAmount: { 
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be a positive number']
    },
    status: { 
      type: String,
      enum: ['pending',  'delivered', 'canceled'],
      default: 'pending'
    },
    paymentMethod: { 
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer'],
      required: [true, 'Payment method is required']
    },
    shippingAddress: { 
      type: String,
      required: [true, 'Shipping address is required']
    }
  },
  {
    timestamps: true
  }
);

const Order = model<IOrder>('Order', OrderSchema);

export default Order;
