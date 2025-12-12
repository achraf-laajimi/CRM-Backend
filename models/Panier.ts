import { Schema, model, Document, Types } from 'mongoose';

// Interface pour les éléments du panier
export interface PanierItem {
  product: Types.ObjectId;
  quantity: number;
}

// Interface pour le document Panier
export interface IPanier extends Document {
  user: Types.ObjectId;
  items: PanierItem[];
  totalAmount: number;
}

const panierSchema = new Schema<IPanier>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, default: 0 }
});

export default model<IPanier>('Panier', panierSchema);
