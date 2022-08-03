import {
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import Customer from "./customer.entity";

@Entity("transfer")
export default class Transfer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({
    type: "double",
  })
  amount!: number;

  @ManyToOne(() => Customer, (customer) => customer.sender, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "sender",
  })
  sender!: Customer;

  @ManyToOne(() => Customer, (customer) => customer.receiver, {
    cascade: true,
  })
  @JoinColumn({
    name: "receiver",
  })
  receiver!: Customer;
}
