import { Router } from "express";
import { Role } from "../entities/account.entity";
import Customer from "../entities/customer.entity";
import Transaction, { TransactionType } from "../entities/transaction.entity";
import { db } from "../db/connection";
import { authenticateToken, authorizeRole } from "../services/auth";
import convertCurrency from "../services/convertCurrency";

const router = Router();

router.post(
  "/transaction",
  authenticateToken,
  authorizeRole(Role.CUSTOMER),
  async (req, res) => {
    try {
      let { type, amount, currency } = req.body;

      amount = await convertCurrency(amount, currency);

      if (amount <= 0) return res.sendStatus(400);

      const customer = await db.manager.findOneBy(Customer, {
        // @ts-ignore
        username: req.user.username,
      });

      if (!customer) return res.sendStatus(404);

      if (type == TransactionType.WITHDRAW && customer.balance < amount) {
        return res.sendStatus(400);
      }

      const transaction = Transaction.create({
        type,
        amount,
        // @ts-ignore
        customer: req.user.username,
      });

      await transaction.save();

      return res.sendStatus(200);
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

export { router as transactionRequest };
