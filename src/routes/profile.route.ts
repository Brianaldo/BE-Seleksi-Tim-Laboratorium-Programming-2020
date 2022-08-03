import { Router } from "express";
import Account, { Role } from "../entities/account.entity";
import { db } from "../db/connection";
import { authenticateToken, authorizeRole } from "../services/auth";
import Customer from "../entities/customer.entity";
import { Not } from "typeorm";

const router = Router();

router.get(
  "/profile",
  authenticateToken,
  authorizeRole(Role.CUSTOMER),
  async (req, res) => {
    try {
      const account = await db.manager.findOne(Account, {
        where: {
          role: Not(Role.ADMIN),
          // @ts-ignore
          username: req.user.username,
        },
        select: { username: true, role: true },
      });

      const customer = await db.manager.findOne(Customer, {
        where: {
          // @ts-ignore
          username: req.user.username,
        },
      });

      if (!account || !customer) return res.sendStatus(404);

      return res.json({ account, customer });
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

export { router as profile };
