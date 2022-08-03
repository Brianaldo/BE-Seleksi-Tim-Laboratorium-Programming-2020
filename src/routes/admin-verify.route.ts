import { Router } from "express";
import Account, { Role } from "../entities/account.entity";
import { db } from "../db/connection";
import { authenticateToken, authorizeRole } from "../services/auth";

const router = Router();

router.get(
  "/admin/verify",
  authenticateToken,
  authorizeRole(Role.ADMIN),
  async (req, res) => {
    try {
      const unverifiedAccount = await db
        .createEntityManager()
        .query(
          `SELECT account.username, customer.name, customer.identity_photo FROM account INNER JOIN customer ON account.username = customer.username WHERE account.role = "${Role.UNVERIFIED_CUSTOMER}"`
        );

      return res.json(unverifiedAccount);
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

router.put(
  "/admin/verify",
  authenticateToken,
  authorizeRole(Role.ADMIN),
  async (req, res) => {
    try {
      const { username, verify } = req.body;

      const account = await db.manager.findOneBy(Account, {
        username,
      });

      if (!account) return res.sendStatus(404);
      if (
        account.role == Role.ADMIN ||
        account.role == Role.CUSTOMER ||
        account.role == Role.DENIED
      )
        return res.sendStatus(400);

      account.role = verify;

      await account.save();

      return res.sendStatus(200);
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

export { router as adminVerify };
