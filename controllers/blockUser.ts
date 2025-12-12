import { Request, Response } from 'express';
import User from '../models/UserModel';

const blockUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'An error occurred while blocking the user' });
  }
};

export { blockUser };
