import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { Role } from "../entities/account.entity";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  // @ts-ignore
  verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    // @ts-ignore
    req.user = user;
    next();
  });
}

export function authorizeRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.user.role != role) return res.sendStatus(401);
    next();
  };
}
