import express, { Router, Request, Response } from 'express';
import passport from 'passport';

const router = Router();

// Handle login failures
router.get("/login/failed", (req: Request, res: Response) => {
  res.status(401).json({
    error: true,
    message: "Login failed",
  });
});

// Handle successful logins
router.get("/login/success", (req: Request, res: Response) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      success: true,
      message: "User has successfully authenticated",
      user: req.user,
      cookies: req.cookies,
    });
  } else {
    res.status(403).json({ error: true, message: "User has not authenticated" });
  }
});

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL || 'http://localhost:5173/login/success',
    failureRedirect: '/login/failed',
  })
);

// Initiate Google OAuth
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Logout route
router.get("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: true, message: "Logout failed" });
    }
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3001');
  });
});

export default router;
