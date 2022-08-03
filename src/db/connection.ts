import { DataSource } from "typeorm";

import Account from "../entities/account.entity";
import Customer from "../entities/customer.entity";
import Transaction from "../entities/transaction.entity";
import Transfer from "../entities/transfer.entity";

export const db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  // @ts-ignore
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Account, Customer, Transaction, Transfer],
  // synchronize: true,
  // logging: true,
});
