import {
  Entity,
  BaseEntity,
  Column,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
} from "typeorm";

import Transaction from "./transaction.entity";
import Transfer from "./transfer.entity";

@Entity("customer")
export default class Customer extends BaseEntity {
  @PrimaryColumn()
  username!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({
    nullable: false,
    type: "longtext",
  })
  identity_photo!: string;

  @Column({
    nullable: false,
    type: "double",
    default: 0,
  })
  balance!: number;

  @OneToMany(() => Transaction, (transaction) => transaction.customer, {
    cascade: true,
  })
  transactions!: Transaction[];

  @OneToMany(() => Transfer, (transfer) => transfer.sender, {
    // cascade: true,
  })
  sender!: Transfer[];

  @OneToMany(() => Transfer, (transfer) => transfer.receiver, {
    // cascade: true,
  })
  receiver!: Transfer[];
}
