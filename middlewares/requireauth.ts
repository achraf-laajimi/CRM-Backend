import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import jwt from 'jsonwebtoken';
import User from '../models/UserModel';
import { IUser } from '../models/UserModel';

const requireauth = async (req: Request, res: Response, next: NextFunction) => {
  //&verify authentification
  const { authorization } = req.headers as IncomingHttpHeaders;

  if (!authorization) {
    return res.status(401).json({ error: "you must be logged in" });
  }
  const token = authorization.split(" ")[1];
  try {
    const { _id }: { _id: string } = jwt.verify(token, process.env.JWT_SECRET || 'omar_bo3') as { _id: string };
    req.user = await User.findOne({ _id }).lean().select('_id') as IUser | undefined;
    next();
  } catch (err) {
    return res.status(401).json({ error: "you must be logged in" });
  }
};

export { requireauth };