import { Request, Response } from 'express';
import User from '../models/UserModel';
const getNewUserStatistics = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    if (!['client', 'Rep Commerciale'].includes(type as string)) {
      return res.status(400).json({ error: 'Type d\'utilisateur invalide' });
    }

    // Pipeline d'agrégation pour les statistiques quotidiennes
    const dailyStats = await User.aggregate([
      { $match: { role: type } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Pipeline d'agrégation pour les statistiques mensuelles
    const monthlyStats = await User.aggregate([
      { $match: { role: type } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json({ dailyStats, monthlyStats });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des statistiques' });
  }
};

export { getNewUserStatistics };
