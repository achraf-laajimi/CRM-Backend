import { Request, Response } from 'express';
import passport from 'passport';

export const loginSuccess = (req: Request, res: Response): void => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
};

export const loginFailed = (req: Request, res: Response): void => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
};

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = passport.authenticate('google', {
  successRedirect: process.env.CLIENT_URL  || 'http://localhost:3001' ,
  failureRedirect: "/login/failed",
});

export const logout = (req: Request, res: Response): void => {
  req.logout((err: any) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    // Assuming you're using sessions, clear the session after logout
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Error destroying session:', sessionErr);
        return res.status(500).json({ message: 'Session destruction failed' });
      }

      // Send the success messages
      res.status(200).json({
        message: 'Logged out successfully',
        tokenMessage: 'Token deleted',
      });
    });
  });
};

/* export const logout = (req: Request, res: Response) => {
  res.clearCookie('cookies'); // Assurez-vous que le nom du cookie est correct
  res.status(200).json({ message: 'Déconnexion réussie' });
}; */
