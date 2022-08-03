import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

export enum Role {
  ADMIN = "admin",
  UNVERIFIED_CUSTOMER = "unverified",
  CUSTOMER = "customer",
  DENIED = "denied",
}

@Entity("account")
export default class Account extends BaseEntity {
  @PrimaryColumn({})
  username!: string;

  @Column({ nullable: false, type: "nchar", length: 40 })
  password!: string;

  @Column({
    nullable: false,
    type: "enum",
    enum: Role,
    default: Role.UNVERIFIED_CUSTOMER,
  })
  role!: string;
}
