import { Router } from "express";
import { Role } from "../entities/account.entity";
import Customer from "../entities/customer.entity";
import { db } from "../db/connection";
import { authenticateToken, authorizeRole } from "../services/auth";

const router = Router();

router.get(
  "/history/:page",
  authenticateToken,
  authorizeRole(Role.CUSTOMER),
  async (req, res) => {
    try {
      const transaction = db
        .getRepository(Customer)
        .createQueryBuilder("customer")
        .select([
          "customer.username AS username",
          "transaction.timestamp AS timestamp",
          "transaction.type AS type",
          "transaction.amount AS amount",
          "transaction.status AS status",
          "NULL AS sender",
          "NULL AS receiver",
        ])
        .innerJoin("customer.transactions", "transaction")
        // @ts-ignore
        .where(`customer.username = "${req.user.username}"`)
        .getQuery();

      const sender = db
        .getRepository(Customer)
        .createQueryBuilder("customer")
        .select([
          "customer.username AS username",
          "sender.timestamp AS timestamp",
          "'transfer-send' AS type",
          "sender.amount AS amount",
          "NULL AS status",
          "sender.sender AS sender",
          "sender.receiver AS receiver",
        ])
        .innerJoin("customer.sender", "sender")
        // @ts-ignore
        .where(`customer.username = "${req.user.username}"`)
        .getQuery();

      const receiver = db
        .getRepository(Customer)
        .createQueryBuilder("customer")
        .select([
          "customer.username AS username",
          "receiver.timestamp AS timestamp",
          "'transfer-receive' AS type",
          "receiver.amount AS amount",
          "NULL AS status",
          "receiver.sender AS sender",
          "receiver.receiver AS receiver",
        ])
        .innerJoin("customer.receiver", "receiver")
        // @ts-ignore
        .where(`customer.username = "${req.user.username}"`)
        .getQuery();

      const PAGE = 10;

      const result = await db
        .createEntityManager()
        .query(
          `(${transaction}) UNION (${sender}) UNION (${receiver}) ORDER BY timestamp LIMIT ${
            (parseInt(req.params.page) - 1) * PAGE
          }, ${parseInt(req.params.page) * PAGE}`
        );

      const allData = await db
        .getRepository(Customer)
        .createQueryBuilder("customer")
        .leftJoinAndSelect("customer.transactions", "transaction")
        .leftJoinAndSelect("customer.sender", "sender")
        .leftJoinAndSelect("customer.receiver", "receiver")
        // @ts-ignore
        .where("customer.username = :username", { username: req.user.username })
        .getOneOrFail();

      const total =
        allData.transactions.length +
        allData.sender.length +
        allData.receiver.length;

      return res.json({ total, result });
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

export { router as history };
