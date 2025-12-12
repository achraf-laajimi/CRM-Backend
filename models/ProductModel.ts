import { Schema, model, Document } from 'mongoose';
import { IUser } from './UserModel'; 

// Définir l'interface pour le modèle Product
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sales: number; 
  imageUrl?: string; // Stocker l'image en base64
  owner: Schema.Types.ObjectId; // Référence à un utilisateur
  gender?: 'men' | 'women' | 'kids';
  colors?: string[];
  reviews: Review[];
  likes: Schema.Types.ObjectId[]; 
  createdAt?: Date;
  updatedAt?: Date;
  isPromotion?: boolean;
  promotionDetails?: number;
}

interface Review {
  [x: string]: any;
  user: Schema.Types.ObjectId;
  rating: number; // Note de 1 à 5
  comment: string;
  date: Date;
}
const ReviewSchema = new Schema<Review>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { 
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: { 
      type: String,
      required: [true, 'Product description is required']
    },
    price: { 
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    category: { 
      type: String,
      required: [true, 'Product category is required']
    },
    stock: { 
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock must be a positive number']
    },
    imageUrl: { 
      type: String,
      default: '' 
    },
    owner: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required']
    } ,
    gender: {
      type: String,
      enum: ['men', 'women', 'kids'],
    },
    colors: {
      type: [String],
    },
    sales: { type: Number, default: 0 } ,
    reviews: [ReviewSchema],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPromotion: { type: Boolean, default: false },
    promotionDetails: { type: Number }
  },
  
  {
    timestamps: true
  }
);

const Product = model<IProduct>('Product', ProductSchema);

export default Product;
