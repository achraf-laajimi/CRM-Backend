import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import './controllers/passport';
import 'cors';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import statisticsRoutes from './routes/statistics';
import productRoutes from './routes/ProductRoute';
import orderRoutes from './routes/orderroute';
import { default as authRoutes, default as userRoutes } from './routes/authRoutes';
dotenv.config();

const port = process.env.PORT || 3000;
const cors = require('cors');

const app: Application = express();

app.use(cors({
  origin: ['http://localhost:3001','http://localhost:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(express.json());
app.use("/CRM", userRoutes);


app.use(
  session({
    name: "session",
    secret: "cyberwolve",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL || 'mongodb+srv://nourelhoudakhelifi:Ek6c0CfdHWuWkXuC@crmdb.yt53sis.mongodb.net/CRM?retryWrites=true&w=majority&appName=CRMDB'}),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use('/products', productRoutes);
app.use("/orders",orderRoutes)




mongoose.connect('mongodb+srv://nourelhoudakhelifi:Ek6c0CfdHWuWkXuC@crmdb.yt53sis.mongodb.net/CRM?retryWrites=true&w=majority&appName=CRMDB')
  .then(() => {
    console.log('Connected to MongoDB!');
    app.listen(port, () => {
      console.log(`App listening on port ${port}!`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
