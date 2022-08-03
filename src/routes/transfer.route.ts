import { Router } from "express";
import Account, { Role } from "../entities/account.entity";
import Transfer from "../entities/transfer.entity";
import Customer from "../entities/customer.entity";
import { db } from "../db/connection";
import { authenticateToken, authorizeRole } from "../services/auth";
import convertCurrency from "../services/convertCurrency";

const router = Router();

router.post(
  "/transfer",
  authenticateToken,
  authorizeRole(Role.CUSTOMER),
  async (req, res) => {
    try {
      let { amount, receiver, currency } = req.body;

      amount = await convertCurrency(amount, currency);
      // @ts-ignore
      if (amount <= 0 || receiver == req.user.username)
        return res.sendStatus(404);

      const sender = await db.manager.findOneBy(Customer, {
        // @ts-ignore
        username: req.user.username,
      });

      if (!sender || sender.balance < amount) return res.sendStatus(400);

      const checkReceiver = await db.manager.findOneBy(Account, {
        username: receiver,
        role: Role.CUSTOMER,
      });

      if (!checkReceiver) return res.sendStatus(404);

      const rec = await db.manager.findOneBy(Customer, {
        username: receiver,
      });

      if (!rec) return res.sendStatus(404);

      const transfer = Transfer.create({
        amount,
        // @ts-ignore
        sender,
        receiver: rec,
      });

      transfer.sender.balance -= amount;
      transfer.receiver.balance += amount;

      await transfer.sender.save();
      await transfer.receiver.save();
      await transfer.save();

      return res.sendStatus(200);
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

export { router as transfer };
