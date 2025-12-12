import { Request, Response } from 'express';
import User,{IUser} from '../models/UserModel';
import {sendMail} from'../sendMail';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');





// Register a new user
const signup = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, username, email, password, adresse, telephone, role } = req.body;

  if (!firstName || !lastName || !username || !email || !password || !adresse || !telephone || !role) {
    res.status(400).json({ msg: 'Remplir tous les champs' });
    return;
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({ firstName, lastName, username, email, password: hashedPassword, adresse, telephone, role });
    const result = await user.save();
    sendMail(email, 'Bienvenue chez nous', 'Merci pour votre inscription');

    const payload = { id: user._id, role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err: unknown) {
    console.error('Signup error:', (err as Error).message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  console.log('Email:', email);
  try {
    const user = await User.findOne({ email });
    console.log('User:', user);
    if (!user) {

      res.status(400).json({ msg: 'Il n\'existe pas d\'utilisateur avec cet email' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Vérifiez les données saisies' });
      return;
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role 
      },
      token
    });
  } catch (err: unknown) {
    console.error((err as Error).message);
    res.status(500).send('Erreur serveur');
  }
};



export {signup,login };