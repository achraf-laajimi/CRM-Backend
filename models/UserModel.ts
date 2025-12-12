import { Schema, model, Document } from 'mongoose';

// Interface TypeScript pour les utilisateurs
export interface IUser extends Document {
  firstName: string;     // Prénom de l'utilisateur
  lastName: string;      // Nom de famille de l'utilisateur
  username: string;      // Nom d'utilisateur
  email: string;         // Adresse e-mail
  password: string;      // Mot de passe
  adresse: string;       // Adresse
  imageUrl?: string;     // URL de l'image de profil (optionnelle)
  telephone: string;     // Numéro de téléphone
  role: 'admin' | 'client' | 'Rep Commerciale';  // Rôle de l'utilisateur
  isBlocked: boolean;    // Statut de blocage de l'utilisateur
  createdAt: Date;       // Date de création du compte
}

// Définition du schéma Mongoose pour l'utilisateur
const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true }, // Prénom requis
    lastName: { type: String, required: true },  // Nom de famille requis
    username: { type: String, required: true },  // Nom d'utilisateur requis
    email: { type: String, required: true, unique: true }, // E-mail requis et unique
    imageUrl: { type: String, default: '' }, // URL de l'image par défaut vide
    password: { type: String, required: true }, // Mot de passe requis
    adresse: { type: String, required: true }, // Adresse requise
    telephone: { type: String, required: true }, // Téléphone requis
    role: { type: String, enum: ['admin', 'client', 'Rep Commerciale'], default: 'client' }, // Rôle avec valeur par défaut
    isBlocked: { type: Boolean, default: false }, // Statut de blocage avec false par défaut
    createdAt: { type: Date, default: Date.now }  // Date de création avec la date actuelle par défaut
  },
  {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
  }
);

// Création du modèle Mongoose basé sur le schéma
const User = model<IUser>('User', UserSchema);

export default User;
