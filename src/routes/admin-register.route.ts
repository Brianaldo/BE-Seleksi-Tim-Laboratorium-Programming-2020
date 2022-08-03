import { Router } from "express";
import Account, { Role } from "../entities/account.entity";
import { db } from "../db/connection";
import hash from "../services/hash";

const router = Router();

router.post("/admin/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existedAccount = await db.manager.findOneBy(Account, {
      username: username,
    });

    if (existedAccount) return res.sendStatus(400);

    const account = Account.create({
      username,
      password: hash(password),
      role: Role.ADMIN,
    });

    await account.save();
    return res.sendStatus(200);
  } catch (e) {
    // console.log(e);
    return res.sendStatus(500);
  }
});

export { router as adminRegister };
