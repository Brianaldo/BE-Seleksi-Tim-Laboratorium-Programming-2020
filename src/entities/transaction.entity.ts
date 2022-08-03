import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  PrimaryGeneratedColumn,
} from "typeorm";

import Customer from "./customer.entity";

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

export enum StatusType {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Entity("transaction")
export default class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({
    type: "enum",
    enum: TransactionType,
    nullable: false,
  })
  type!: string;

  @Column({
    type: "double",
    nullable: false,
  })
  amount!: number;

  @ManyToOne(() => Customer, (customer) => customer.transactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "username",
  })
  customer!: Customer;

  @Column({
    type: "enum",
    enum: StatusType,
    nullable: false,
    default: StatusType.PENDING,
  })
  status!: string;
}
