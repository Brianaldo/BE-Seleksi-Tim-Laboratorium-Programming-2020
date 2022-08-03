import "dotenv/config";
import "reflect-metadata";

const app = require("express")();
import { json, urlencoded } from "express";
import helmet from "helmet";
var cors = require("cors");

import { db } from "./db/connection";
import { adminTransaction } from "./routes/admin-transaction.route";
import { adminVerify } from "./routes/admin-verify.route";
import { history } from "./routes/history.route";
import { login } from "./routes/login.route";
import { register } from "./routes/register.route";
import { transactionRequest } from "./routes/transaction.route";
import { transfer } from "./routes/transfer.route";
import { profile } from "./routes/profile.route";
import { adminProfile } from "./routes/admin-profile.route";
import { createClient } from "redis";
import { currency } from "./routes/currency.route";
import { adminRegister } from "./routes/admin-register.route";

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    // @ts-ignore
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD,
});

app.use(cors());
app.use(helmet());
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ limit: "50mb", extended: true }));

// @ts-ignore
app.get("/", (req, res) => {
  return res.send("Hello World!");
});

app.use(register);
app.use(login);
app.use(adminVerify);
app.use(transactionRequest);
app.use(adminTransaction);
app.use(transfer);
app.use(history);
app.use(profile);
app.use(adminProfile);
app.use(currency);
app.use(adminRegister);

Promise.all([db.initialize(), redisClient.connect()])
  .then(() => {
    app.listen(8080, () => {
      console.log("Listening to port 8080");
    });
  })
  .catch((err) => {
    console.log(err);
  });
