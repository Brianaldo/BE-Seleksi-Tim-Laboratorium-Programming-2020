import { Router } from "express";
import Account from "../entities/account.entity";
import Customer from "../entities/customer.entity";
import { db } from "../db/connection";
import hash from "../services/hash";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password, name, identityPhoto } = req.body;

    const existedAccount = await db.manager.findOneBy(Account, {
      username: username,
    });

    if (existedAccount) return res.sendStatus(400);

    const account = Account.create({
      username,
      password: hash(password),
    });

    const customer = Customer.create({
      username,
      name,
      identity_photo: identityPhoto,
    });

    await account.save();
    await customer.save();
    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

export { router as register };
