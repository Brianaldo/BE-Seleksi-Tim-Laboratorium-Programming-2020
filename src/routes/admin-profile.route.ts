import { Router } from "express";
import Account, { Role } from "../entities/account.entity";
import { db } from "../db/connection";
import { authenticateToken, authorizeRole } from "../services/auth";
import Customer from "../entities/customer.entity";
import { Not } from "typeorm";

const router = Router();

router.post(
  "/admin/profile",
  authenticateToken,
  authorizeRole(Role.ADMIN),
  async (req, res) => {
    try {
      const { query } = req.body;

      // const account = await db.manager.find(Account, {
      //   where: { role: Not(Role.ADMIN) },
      //   select: { username: true, role: true },
      // });

      const accounts = await db
        .getRepository(Customer)
        .createQueryBuilder("customer")
        .select(["customer.username", "customer.name", "customer.balance"])
        .where("customer.username LIKE :query OR customer.name LIKE :query", {
          query: `%${query}%`,
        })
        .getMany();

      return res.json(accounts);
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

router.get(
  "/admin/profile/:username/",
  authenticateToken,
  authorizeRole(Role.ADMIN),
  async (req, res) => {
    try {
      const account = await db.manager.findOne(Account, {
        where: { role: Not(Role.ADMIN), username: req.params.username },
        select: { username: true, role: true },
      });

      const customer = await db.manager.findOne(Customer, {
        where: { username: req.params.username },
      });

      if (!account || !customer) return res.sendStatus(404);

      return res.json({ account, customer });
    } catch (e) {
      return res.sendStatus(500);
    }
  }
);

export { router as adminProfile };

router.get(
  "/admin/history/:username/:page",
  authenticateToken,
  authorizeRole(Role.ADMIN),
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
        .where(`customer.username = "${req.params.username}"`)
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
        .where(`customer.username = "${req.params.username}"`)
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
        .where(`customer.username = "${req.params.username}"`)
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
        .where("customer.username = :username", {
          username: req.params.username,
        })
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
