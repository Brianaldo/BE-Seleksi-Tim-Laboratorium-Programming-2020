import { Router } from "express";
import { Role } from "../entities/account.entity";
import Customer from "../entities/customer.entity";
import Transaction, {
  StatusType,
  TransactionType,
} from "../entities/transaction.entity";
import { db } from "../db/connection";
import { authenticateToken, authorizeRole } from "../services/auth";

const router = Router();

router.get(
  "/admin/transaction",
  authenticateToken,
  authorizeRole(Role.ADMIN),
  async (req, res) => {
    try {
      const pendingTransaction = await db
        .createQueryBuilder(Customer, "customer")
        .select([
          "customer.username AS username",
          "transaction.timestamp AS timestamp",
          "transaction.type AS type",
          "transaction.amount AS amount",
          "transaction.id AS id",
        ])
        .innerJoin("customer.transactions", "transaction")
        .where("transaction.status = :status", { status: StatusType.PENDING })
        .orderBy("transaction.timestamp", "ASC")
        .getRawMany();

      return res.json(pendingTransaction);
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

router.put(
  "/admin/transaction",
  authenticateToken,
  authorizeRole(Role.ADMIN),
  async (req, res) => {
    try {
      const { id, status } = req.body;

      if (!id || !status || status == StatusType.PENDING)
        return res.sendStatus(501);

      const transaction = await db.manager.findOne(Transaction, {
        relations: { customer: true },
        where: { id, status: StatusType.PENDING },
      });

      if (!transaction) return res.sendStatus(404);

      if (status == StatusType.ACCEPTED) {
        if (transaction.type == TransactionType.DEPOSIT) {
          transaction.customer.balance += transaction.amount;
        } else {
          if (transaction.customer.balance < transaction.amount)
            return res.sendStatus(400);
          transaction.customer.balance -= transaction.amount;
        }
        transaction.status = status;
      } else {
        transaction.status = status;
      }

      await transaction.save();
      await transaction.customer.save();

      return res.sendStatus(200);
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

export { router as adminTransaction };
