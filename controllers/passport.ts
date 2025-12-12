import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/UserModel';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: ['profile', 'email'],
  },
  function(accessToken: string, refreshToken: string, profile: any, done: Function) {
    done(null, profile);
  }
));

passport.serializeUser(function(user: any, done: Function) {
  done(null, user);
});

passport.deserializeUser(function(obj: any, done: Function) {
  done(null, obj);
});

// Exporter Passport
export default passport;
