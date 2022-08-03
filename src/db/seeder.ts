import "dotenv/config";
import "reflect-metadata";

import { DataSource } from "typeorm";
import { faker } from "@faker-js/faker";

import Account, { Role } from "../entities/account.entity";
import Customer from "../entities/customer.entity";
import Transaction, {
  TransactionType,
  StatusType,
} from "../entities/transaction.entity";
import Transfer from "../entities/transfer.entity";
import hash from "../services/hash";

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

const db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  // @ts-ignore
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Account, Customer, Transaction, Transfer],
  synchronize: true,
  logging: true,
});

db.initialize().then(async () => {
  // seed admin account
  const admin: Account = Account.create({
    username: "admin",
    password: hash("adminadmin"),
    role: Role.ADMIN,
  });

  await admin.save();

  const roles: Role[] = [Role.CUSTOMER, Role.DENIED, Role.UNVERIFIED_CUSTOMER];
  const customers: Customer[] = [];

  // seed customer account
  for (let i: number = 0; i < 100; i++) {
    const randomName: string = faker.name.findName();
    const randomUsername: string = faker.internet.userName(randomName);
    const randomIdentityPhoto: string = faker.image.dataUri(323, 204);
    const randomRole: string = roles[getRandomInt(3)];
    const randomBalance: number =
      randomRole === Role.CUSTOMER
        ? faker.datatype.number({
            min: 10000,
            max: 10000000,
            precision: 0.01,
          })
        : 0;

    const account: Account = Account.create({
      username: randomUsername,
      password: hash("password"),
      role: randomRole,
    });

    await account.save();

    const customer: Customer = Customer.create({
      username: randomUsername,
      name: randomName,
      identity_photo: randomIdentityPhoto,
      balance: randomBalance,
    });

    await customer.save();

    if (randomRole === Role.CUSTOMER) {
      const transaction: Transaction = Transaction.create({
        type: TransactionType.DEPOSIT,
        amount: randomBalance,
        customer: customer,
        status: StatusType.ACCEPTED,
      });

      await transaction.save();

      await customers.push(customer);
    }
  }

  // seed transfer
  for (let i: number = 0; i < 100; i++) {
    const randomNumber1 = getRandomInt(customers.length);
    const sender: Customer = customers[randomNumber1];
    let randomNumber2 = getRandomInt(customers.length);
    while (randomNumber1 === randomNumber2)
      randomNumber2 = getRandomInt(customers.length);
    const receiver: Customer = customers[randomNumber2];

    let randomAmount: number = faker.datatype.number({
      min: 1000,
      max: 100000,
      precision: 0.01,
    });

    if (sender.balance >= randomAmount) {
      const transfer = Transfer.create({
        amount: randomAmount,
        sender,
        receiver,
      });

      transfer.sender.balance -= randomAmount;
      transfer.receiver.balance += randomAmount;

      await transfer.save();
      await transfer.sender.save();
      await transfer.receiver.save();
    }
  }

  const transactionType: TransactionType[] = [
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAW,
  ];
  const statusType: StatusType[] = [
    StatusType.ACCEPTED,
    StatusType.PENDING,
    StatusType.REJECTED,
  ];
  // seed transaction
  for (let i: number = 0; i < 100; i++) {
    const randomCustomer: Customer = customers[getRandomInt(customers.length)];
    const randomTransaction: TransactionType = transactionType[getRandomInt(2)];
    const randomStatus: StatusType = statusType[getRandomInt(3)];

    let randomAmount: number = faker.datatype.number({
      min: 10000,
      max: 1000000,
      precision: 0.01,
    });

    if (randomStatus === StatusType.ACCEPTED) {
      if (randomTransaction === TransactionType.DEPOSIT) {
        const transaction: Transaction = Transaction.create({
          type: randomTransaction,
          amount: randomAmount,
          status: randomStatus,
          customer: randomCustomer,
        });

        transaction.customer.balance += randomAmount;
        await transaction.save();
        await transaction.customer.save();
      } else {
        const transaction: Transaction = Transaction.create({
          type: randomTransaction,
          amount: randomAmount,
          status: randomStatus,
          customer: randomCustomer,
        });

        if (transaction.customer.balance >= randomAmount) {
          transaction.customer.balance -= randomAmount;
          await transaction.save();
          await transaction.customer.save();
        }
      }
    } else {
      const transaction: Transaction = Transaction.create({
        type: randomTransaction,
        amount: randomAmount,
        status: randomStatus,
        customer: randomCustomer,
      });

      await transaction.save();
    }
  }
});
