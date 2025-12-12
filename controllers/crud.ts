import { Request, Response } from 'express';
import User,{IUser} from '../models/UserModel';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const getUserss = async (req: Request, res: Response): Promise<void> => {
  try {
    const users: IUser[] = await User.find({}).sort({ username: 1 });
  /*   console.log('Fetched Users:', users);  // Log des utilisateurs récupérés */
    res.status(200).json(users);
  } catch (e) {
    console.error('Error fetching users:', e);  // Log de l'erreur
    res.status(500).json({ message: (e as Error).message });
  }
};
const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, sortBy } = req.query;
    let filter: { [key: string]: string } = {};

    // Default to 'Client' role if no role is specified
    if (!role || role.toString().trim().toLowerCase() === 'client') {
      filter.role = 'Client';
    } else {
      filter.role = role.toString().trim();
    }

    // Determine sort criteria
    let sortCriteria: { [key: string]: 1 | -1 } = { username: 1 }; // Default sort by username

    if (sortBy) {
      const sortByLower = sortBy.toString().trim().toLowerCase();
      switch (sortByLower) {
        case 'lastname':
          sortCriteria = { lastName: 1 };
          break;
        case 'adresse':
          sortCriteria = { adresse: 1 };
          break;
        case 'email':
          sortCriteria = { emailAddress: 1 };
          break;
        default:
          break; // Use default sort (username)
      }
    }

    // Retrieve filtered and sorted users
    const users: IUser[] = await User.find(filter).sort(sortCriteria);
    res.status(200).json(users);
  } catch (e) {
    console.error(e); // Log error for server-side debugging
    res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
};



const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user: IUser | null = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUser = await User.create(req.body);
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user: IUser | null = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const updatedUser: IUser | null = await User.findById(id);
    res.status(200).json(updatedUser);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};
const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user: IUser | null = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const updatedUser: IUser | null = await User.findById(id);
    res.status(200).json(updatedUser);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const user: IUser | null = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
};



export { getUserss, getUsers, getUser, createUser, updateUser, deleteUser };

