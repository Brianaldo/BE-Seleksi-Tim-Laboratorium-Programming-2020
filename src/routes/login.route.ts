import { Router } from "express";
import { sign } from "jsonwebtoken";
import Account, { Role } from "../entities/account.entity";
import { db } from "../db/connection";
import hash from "../services/hash";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const account = await db.manager.findOneBy(Account, {
      username: username,
      password: hash(password),
    });

    if (!account) return res.sendStatus(403);

    if (account.role == Role.UNVERIFIED_CUSTOMER) {
      return res.sendStatus(401);
    }

    // @ts-ignore
    const accessToken = sign(
      { username, role: account.role },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET
    );

    return res.json({
      accessToken: "Bearer " + accessToken,
      role: account.role,
    });
  } catch (e) {
    return res.sendStatus(500);
  }
});

export { router as login };
